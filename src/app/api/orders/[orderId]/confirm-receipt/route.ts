import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // Adapté à ton routage [id]
) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // 1. ATTENDRE les params (Next.js 15)
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // 2. Récupérer la commande avec les infos de paiement
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // 3. VÉRIFICATIONS DE SÉCURITÉ CRITIQUES
    
    // Sécurité A : Seul l'acheteur peut confirmer la réception
    if (order.userId !== user.id) {
       return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Sécurité B : On vérifie que le livreur a BIEN marqué le colis comme livré
    if (order.status !== "DELIVERED") {
      return NextResponse.json({ 
        error: "Le livreur n'a pas encore confirmé la remise du colis." 
      }, { status: 400 });
    }

    // Sécurité C : On vérifie que l'argent est RÉELLEMENT chez DealCity (PAID)
    // Cela empêche de créditer le vendeur si le Webhook Monetbil n'a pas validé
    if (order.status === "INITIALIZED" || order.status === "FAILED") {
        return NextResponse.json({ 
          error: "Paiement non vérifié. Impossible de transférer les fonds." 
        }, { status: 400 });
    }

    // Sécurité D : Éviter le double crédit
    if (order.status === "COMPLETED") {
      return NextResponse.json({ error: "Cette transaction est déjà clôturée." }, { status: 400 });
    }

    // 4. TRANSACTION ATOMIQUE (Virement réel)
    await prisma.$transaction([
      // Marquer la commande comme COMPLETED (Fin du flux)
      prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" }
      }),
      // Créditer le solde du vendeur (Wallet)
      prisma.user.update({
        where: { id: order.sellerId },
        data: { 
          // Utilise 'balance' ou 'walletBalance' selon ton schéma prisma
          balance: { increment: order.sellerEarnings || 0 } 
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Réception confirmée et vendeur crédité !" 
    });

  } catch (error: any) {
    console.error("ERREUR_CONFIRMATION_RECEPCION:", error);
    return NextResponse.json({ 
      error: "Erreur lors du virement",
      details: error.message 
    }, { status: 500 });
  }
}