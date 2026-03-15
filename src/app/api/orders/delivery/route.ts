import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user || user.id !== MY_ADMIN_ID) {
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
            avatarUrl: true,
          },
        },
        post: {
          include: {
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

    // ✅ CORRECTION CRUCIALE : On formate les données pour le frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      // On s'assure que le frontend reçoive 'deliveryAddress' et 'phoneNumber'
      // même si dans ta base de données ils s'appellent différemment
      deliveryAddress: (order as any).customerAddress || (order as any).address || "Adresse non fournie",
      phoneNumber: (order as any).customerPhone || (order as any).phone || "Numéro masqué",
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("[DELIVERY_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" }, 
      { status: 500 }
    );
  }
}