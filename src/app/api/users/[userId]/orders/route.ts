import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> } 
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    
    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Attendre les params (Next.js 15)
    const { userId } = await params;

    // Sécurité : Un utilisateur ne peut voir que ses propres commandes
    if (loggedInUser.id !== userId) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. RÉCUPÉRER LES COMMANDES (AJOUT DU STATUT PENDING)
    const orders = await prisma.order.findMany({
      where: { 
        userId: userId,
        // CORRECTION : On inclut PENDING pour que l'achat s'affiche dès la validation
        status: {
          in: ["PENDING", "DELIVERED", "COMPLETED"]
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
      
      // Extraction sécurisée de l'image
      const firstImage = order.post?.attachments?.[0]?.url || null;

      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        // Priorité au champ totalAmount utilisé dans ton API Checkout
        price: orderAny.totalAmount || orderAny.total || 0,
        productName: order.post?.content || "Article DealCity",
        productImage: firstImage,
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