import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await validateRequest();

    // Vérification admin ou utilisateur connecté
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Mise à jour du statut
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    return NextResponse.json({ success: true, status: updatedOrder.status });
  } catch (error: any) {
    console.error("ERROR_CANCEL_ORDER:", error);
    return NextResponse.json({ error: "Erreur lors de l'annulation" }, { status: 500 });
  }
}