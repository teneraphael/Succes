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

    // Sécurité : Seul l'admin (Raphael) devrait pouvoir supprimer
    if (!user || user.id !== "22lmc64bcqwsqybu") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Utilisation d'une transaction pour supprimer les OrderItems PUIS l'Order
    // Cela évite les erreurs de "Foreign Key constraint"
    await prisma.$transaction([
      prisma.orderItem.deleteMany({
        where: { orderId: id }
      }),
      prisma.order.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true, message: "Commande supprimée définitivement" });
  } catch (error: any) {
    console.error("ERROR_DELETE_ORDER:", error);
    return NextResponse.json({ 
      error: "Impossible de supprimer la commande",
      details: error.message 
    }, { status: 500 });
  }
}