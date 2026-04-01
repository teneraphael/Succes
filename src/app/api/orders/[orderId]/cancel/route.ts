import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await validateRequest();
  
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // AU LIEU DE UPDATE, ON UTILISE DELETE
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Commande supprimée" });
  } catch (error: any) {
    console.error("ERREUR_SUPPRESSION:", error);
    return NextResponse.json({ 
        error: "Impossible de supprimer la commande", 
        details: error.message 
    }, { status: 500 });
  }
}