import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { user } = await validateRequest();

    // Sécurité Admin Raphael
    if (!user || user.id !== "22lmc64bcqwsqybu") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // TRANSACTION SÉCURISÉE
    await prisma.$transaction(async (tx) => {
      // On ne supprime QUE ce qui existe vraiment dans ton schéma
      // Si tu as une table OrderItem (avec Majuscule), vérifie l'orthographe
      
      // 1. Supprimer la commande (Prisma gérera les relations si 'onDelete: Cascade' est mis)
      await tx.order.delete({
        where: { id: orderId }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERREUR_DELETE_API:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la suppression", 
      details: error.message 
    }, { status: 500 });
  }
}