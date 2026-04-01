import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // TRANSACTION : On nettoie tout d'un coup
    await prisma.$transaction([
      // 1. Supprimer d'abord les items liés à cette commande
      prisma.orderItem.deleteMany({
        where: { orderId: id }
      }),
      // 2. Supprimer ensuite la commande elle-même
      prisma.order.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERREUR_SUPPRESSION_TOTALE:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}