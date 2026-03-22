import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> } // Type correct pour Next.js 15
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    
    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Attendre les params (Obligatoire sur Next.js 15)
    const { userId } = await params;

    // Sécurité : Un utilisateur ne peut voir que ses propres commandes
    if (loggedInUser.id !== userId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. Récupérer les commandes valides
    const orders = await prisma.order.findMany({
      where: { 
        userId: userId,
        // SÉCURITÉ : On masque les commandes non payées (INITIALIZED / FAILED)
        status: {
          in: ["PAID", "DELIVERED", "COMPLETED"]
        }
      },
      include: {
        post: {
          select: {
            content: true,
            attachments: { 
              where: { type: "IMAGE" }, 
              take: 1 
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Formater pour le Frontend
    const formattedOrders = orders.map(order => {
      const orderAny = order as any;
      
      // Extraction de l'image
      const firstImage = order.post?.attachments?.[0]?.url || null;

      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        // On s'assure d'envoyer le bon prix (totalAmount dans ta DB)
        price: orderAny.totalAmount || orderAny.price || 0,
        productName: order.post?.content || "Article DealCity",
        productImage: firstImage,
        // On inclut les notes pour que le client se rappelle ce qu'il a demandé
        notes: orderAny.notes || "",
        customerAddress: orderAny.customerAddress,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("[USER_ORDERS_GET_ERROR]:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des achats" }, { status: 500 });
  }
}