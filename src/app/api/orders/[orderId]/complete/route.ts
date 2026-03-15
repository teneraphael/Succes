import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params: { orderId } }: { params: { orderId: string } }
) {
  try {
    const { user } = await validateRequest();

    // 1. Vérifie si c'est bien l'admin (livreur) qui fait l'action
    if (!user || user.id !== "4yq76ntw6lpduptd") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Mettre à jour la commande en base de données
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED", // Assure-toi que "DELIVERED" existe dans ton ENUM
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur validation commande:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}