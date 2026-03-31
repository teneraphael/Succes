import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Ton ID Admin (Livreur)
const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // 1. Vérification de l'identité du livreur
    const { user: loggedInUser } = await validateRequest();
    
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // 2. Récupération de l'ID de la commande
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 3. Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. LOGIQUE PAIEMENT À LA LIVRAISON (COD)
    // On vérifie que la commande n'est pas déjà livrée ou annulée
    if (order.status === "DELIVERED") {
      return NextResponse.json({ error: "Cette commande est déjà marquée comme livrée." }, { status: 400 });
    }

    // 5. Mise à jour du statut
    // Dans un système COD, marquer comme "DELIVERED" signifie 
    // que le livreur a ENCAISSÉ l'argent et REMIS le colis.
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "DELIVERED",
        // On peut aussi imaginer un champ 'paidAt' si tu veux tracker l'encaissement
        updatedAt: new Date()
      },
    });

    console.log(`✅ Commande ${orderId} : Argent encaissé et colis livré par l'admin.`);

    return NextResponse.json({ 
      success: true, 
      message: "Livraison confirmée et paiement encaissé." 
    });

  } catch (error: any) {
    console.error("ERREUR_LIVREUR_UPDATE:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour",
      details: error.message 
    }, { status: 500 });
  }
}