import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params: { orderId } }: { params: { orderId: string } }) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // 1. Trouver la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { post: true }
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 2. Transaction Prisma : Confirmer la commande ET créditer le vendeur
    await prisma.$transaction([
      // Marquer la commande comme complétée
      prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" }
      }),
      // Ajouter l'argent au portefeuille du vendeur (si tu as un champ balance)
      prisma.user.update({
        where: { id: order.post.userId },
        data: { 
          balance: { increment: order.price } 
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}