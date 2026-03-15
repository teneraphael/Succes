import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.orderId }
    });

    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // TRANSACTION : On ferme la commande et on crédite le vendeur
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" }
      }),
      prisma.user.update({
        where: { id: order.sellerId },
        data: { 
          balance: { increment: order.sellerEarnings } 
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}