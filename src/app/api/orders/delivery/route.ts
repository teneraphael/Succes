import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { 
        status: "PENDING" 
      },
      include: {
        post: {
          select: {
            content: true,
            // Correction ici : On utilise 'attachments' au lieu de 'media'
            // Si ton champ dans Prisma s'appelle autrement, remplace ce mot.
            attachments: true, 
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      // On récupère l'image de façon sécurisée
      // On cherche dans order.post.attachments
      const postMedia = (order.post as any)?.attachments;
      const firstImage = Array.isArray(postMedia) ? postMedia[0]?.url : null;

      return {
        id: order.id,
        productName: order.post?.content || "Produit DealCity",
        productImage: firstImage || "/placeholder.png", 
        price: order.totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.customerAddress,
        notes: order.notes, 
        status: order.status,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("DEBUG_DELIVERY_API_ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}