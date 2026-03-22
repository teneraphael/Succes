import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Vérification de l'identité (Seul un utilisateur connecté peut valider)
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Récupération des données envoyées par le dashboard livreur
    const { orderId, otpCode } = await req.json();

    if (!orderId || !otpCode) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // 3. Recherche de la commande dans la base de données
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 4. VÉRIFICATION DU CODE (C'est ici que la magie opère)
    if (order.deliveryCode !== otpCode) {
      return NextResponse.json({ 
        error: "Code de vérification incorrect. Demandez le code à 4 chiffres reçu par SMS par l'acheteur." 
      }, { status: 400 });
    }

    // 5. TRANSACTION ATOMIQUE : On valide la livraison ET on paie le vendeur
    await prisma.$transaction([
      // A. On marque la commande comme livrée
      prisma.order.update({
        where: { id: orderId },
        data: { status: "DELIVERED" }
      }),
      
      // B. On crédite le solde du vendeur (95% du prix total)
      prisma.user.update({
        where: { id: order.sellerId },
        data: {
          balance: {
            increment: order.sellerEarnings // Le montant calculé lors du checkout
          }
        }
      }),

      // C. On enregistre la transaction dans l'historique du vendeur
      prisma.transaction.create({
        data: {
          userId: order.sellerId,
          amount: order.sellerEarnings,
          type: "SALE",
          reason: `Vente réussie : Commande #${order.id.slice(-5)}`,
          status: "SUCCESS"
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Livraison validée ! Le vendeur a été crédité." 
    });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}