import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json(
        { error: "Accès interdit" }, 
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            displayName: true,
            username: true,
          },
        },
        post: {
          select: {
            content: true, // Ce champ semble valide d'après ton code
            attachments: {
              where: { type: "IMAGE" },
              take: 1,
            },
          },
        },
      },
      orderBy: { 
        createdAt: "desc" 
      },
    });

    const formattedOrders = orders.map(order => {
      // On force le passage en 'any' pour éviter que TS bloque sur les noms de colonnes
      const orderAny = order as any;
      const postAny = order.post as any;

      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        
        // NOM DU CLIENT
        customerName: order.user?.displayName || order.user?.username || "Client Inconnu",
        
        // PRIX : On cherche dans l'ordre de priorité : 
        // 1. totalAmount (souvent utilisé avec Monetbil) 
        // 2. price 
        // 3. amount
        price: orderAny.totalAmount || orderAny.price || orderAny.amount || 0,

        // NOM DU PRODUIT : On utilise 'content' que tu as dans ton select
        productName: postAny?.content || "Article DealCity",

        // IMAGE
        productImage: order.post?.attachments?.[0]?.url || null,

        // ADRESSE & TÉLÉPHONE
        deliveryAddress: orderAny.customerAddress || orderAny.address || "Adresse non fournie",
        phoneNumber: orderAny.customerPhone || orderAny.phone || "Numéro masqué",
      };
    });

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error("[DELIVERY_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Erreur de récupération" }, 
      { status: 500 }
    );
  }
}