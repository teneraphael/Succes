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

    // 2. RÉCUPÉRER LES COMMANDES
    const orders = await prisma.order.findMany({
      where: { 
        userId: userId,
        status: {
          // 🌟 AJOUT : On inclut PENDING_DELIVERY_FEE pour que le client puisse payer ses 1000 F depuis son historique !
          in: ["PENDING_DELIVERY_FEE", "PENDING", "DELIVERED", "COMPLETED"]
        }
      },
      include: {
        post: {
          select: {
            content: true,
            attachments: true // 🌟 CORRECTION : On prend tout l'objet d'attachement sans filtre restrictif pour être sûr d'avoir l'URL
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. Formater proprement pour correspondre EXACTEMENT aux besoins de ton OrderConfirmationList
    const formattedOrders = orders.map(order => {
      const orderAny = order as any;
      
      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        // On conserve la compatibilité avec order.price ou order.totalAmount
        price: orderAny.totalAmount || orderAny.price || 0,
        
        // 🌟 RE-CONSTRUCTION DE L'OBJET POST POUR TON FRONTEND :
        // Ton composant fait : order.post?.content et order.post?.attachments?.[0]?.url
        post: {
          content: order.post?.content || "Article DealCity",
          attachments: order.post?.attachments || []
        },
        
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