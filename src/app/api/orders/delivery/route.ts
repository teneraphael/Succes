import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// ⚠️ REMPLACE CECI PAR TON ID UNIQUE
const MY_ADMIN_ID = "4yq76ntw6lpduptd";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user || user.id !== MY_ADMIN_ID) {
      return NextResponse.json(
        { error: "Accès formellement interdit" }, 
        { status: 403 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        // ✅ CORRECTION ICI : Pour vérifier qu'une chaîne n'est pas vide/nulle
        customerAddress: {
          not: "", // On exclut les chaînes vides
          // Si le champ est String? (optionnel), Prisma acceptera 'not: null'
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
                type: "IMAGE",
              },
              take: 1,
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