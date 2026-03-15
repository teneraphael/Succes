import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ⚠️ REMPLACE CECI PAR TON ID UNIQUE (Le même que dans la page frontend)
const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    // 1. Vérification de la session
    const { user } = await validateRequest();

    // 2. Blocage si pas connecté OU si ce n'est pas ton ID
    if (!user || user.id !== MY_ADMIN_ID) {
      return NextResponse.json(
        { error: "Accès formellement interdit" }, 
        { status: 403 }
      );
    }

    // 3. Récupération des commandes à livrer
    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING", // On ne prend que ce qui n'est pas encore livré
        // On s'assure qu'il y a une adresse (donc une demande de livraison)
        NOT: {
          deliveryAddress: null,
        },
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
              where: {
                type: "IMAGE", // On ne prend que les images pour l'aperçu
              },
              take: 1, // Juste la première image
            },
          },
        },
      },
      orderBy: { 
        createdAt: "desc" 
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[DELIVERY_GET_ERROR]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" }, 
      { status: 500 }
    );
  }
}