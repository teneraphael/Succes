import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await validateRequest();
  
  // 1. Vérification de l'authentification
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // 2. SUPPRESSION DÉFINITIVE
    // On utilise .delete au lieu de .update
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "La commande a été supprimée de la base de données." 
    });

  } catch (error: any) {
    console.error("ERREUR_SUPPRESSION_COMMANDE:", error);
    
    // Gestion d'erreur si la commande n'existe déjà plus
    return NextResponse.json({ 
      error: "Impossible de supprimer la commande. Elle a peut-être déjà été traitée." 
    }, { status: 500 });
  }
}