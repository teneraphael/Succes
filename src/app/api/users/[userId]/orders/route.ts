import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { user: loggedInUser } = await validateRequest();
    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Next.js 15 nécessite d'attendre params
    const { userId } = await (params as any);

    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        post: {
          select: {
            content: true,
            // ❌ On a enlevé 'price' d'ici car il n'existe pas dans ton modèle Post
            attachments: { 
              where: { type: "IMAGE" }, 
              take: 1 
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // ✅ ON FORMATE ICI POUR LE FRONTEND
    const formattedOrders = orders.map(order => {
      const orderAny = order as any;

      return {
        ...order,
        // On récupère le prix depuis la table Order (où il existe)
        // On teste plusieurs noms au cas où : price ou totalAmount
        price: orderAny.price || orderAny.totalAmount || orderAny.amount || 0,
        
        // On s'assure que productName est bien rempli pour le frontend
        productName: order.post?.content || "Article DealCity",
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("[USER_ORDERS_GET_ERROR]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}