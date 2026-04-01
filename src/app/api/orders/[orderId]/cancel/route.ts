import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Remarque l'utilisation de 'orderId' dans l'interface
export async function POST(
  req: Request, 
  { params }: { params: Promise<{ orderId: string }> } 
) {
  try {
    // 1. On extrait 'orderId' parce que ton dossier s'appelle [orderId]
    const { orderId } = await params; 
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Suppression dans la base de données
    // On utilise orderId ici aussi
    await prisma.order.delete({
      where: { 
        id: orderId 
      }
    });

    return NextResponse.json({ success: true, message: "Commande supprimée" });

  } catch (error: any) {
    console.error("ERREUR_500_PRISMA:", error);
    
    // Si l'erreur est que la commande n'existe pas, on renvoie quand même un succès
    // car le résultat visuel (disparition) est le même.
    return NextResponse.json({ 
      error: "Erreur lors de la suppression", 
      details: error.message 
    }, { status: 500 });
  }
}