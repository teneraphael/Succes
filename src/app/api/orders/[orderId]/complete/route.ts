import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const MY_ADMIN_ID = "22lmc64bcqwsqybu";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // 1. Vérification de l'identité du livreur (Admin)
    const { user: loggedInUser } = await validateRequest();
    
    if (!loggedInUser || loggedInUser.id !== MY_ADMIN_ID) {
      return NextResponse.json({ error: "Accès refusé : Réservé au livreur officiel" }, { status: 403 });
    }

    // 2. Attendre l'ID de la commande (Next.js 15)
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 3. Vérifier que la commande existe et est bien payée avant de livrer
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // SÉCURITÉ : On ne peut pas livrer une commande qui n'est pas payée (INITIALIZED ou FAILED)
    if (order.status !== "PAID") {
      return NextResponse.json({ 
        error: "Impossible de livrer : Le paiement n'a pas été validé par Monetbil." 
      }, { status: 400 });
    }

    // 4. Mise à jour du statut vers DELIVERED
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "DELIVERED",
        // Optionnel : on peut enregistrer l'heure exacte de livraison
        updatedAt: new Date()
      },
    });

    console.log(`📦 Colis ${orderId} marqué comme LIVRÉ par le livreur.`);

    return NextResponse.json({ 
      success: true, 
      message: "Statut mis à jour : Colis remis au client." 
    });

  } catch (error: any) {
    console.error("ERREUR_LIVREUR_UPDATE:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour",
      details: error.message 
    }, { status: 500 });
  }
}