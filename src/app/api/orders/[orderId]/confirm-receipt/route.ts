import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // 1. ATTENDRE les params (Next.js 15)
    const { id: orderId } = await params;

    // 2. Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });
    }

    // 3. VÉRIFICATIONS DE SÉCURITÉ

    // Sécurité A : Seul l'acheteur qui a passé la commande peut confirmer
    if (order.userId !== user.id) {
       return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Sécurité B : Éviter le double crédit (On vérifie COMPLETED d'abord)
    // Cela "réduit" le type pour TypeScript et évite l'erreur d'overlap
    if (order.status === ("COMPLETED" as any)) {
      return NextResponse.json({ error: "Cette transaction est déjà clôturée." }, { status: 400 });
    }

    // Sécurité C : On vérifie que le livreur a BIEN marqué "DELIVERED"
    // En Cash on Delivery, cela signifie que le livreur a déjà encaissé l'argent.
    if (order.status !== ("DELIVERED" as any)) {
      return NextResponse.json({ 
        error: "Le livreur n'a pas encore confirmé la remise du colis et l'encaissement." 
      }, { status: 400 });
    }

    // 4. TRANSACTION ATOMIQUE (Libération des fonds)
    await prisma.$transaction([
      // A. Clôturer la commande
      prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "COMPLETED",
          updatedAt: new Date()
        }
      }),
      // B. Créditer le portefeuille du vendeur
      prisma.user.update({
        where: { id: order.sellerId },
        data: { 
          // Note : Assure-toi que ton modèle User a bien un champ 'balance' (Int ou Float)
          balance: { increment: order.sellerEarnings || 0 } 
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Réception confirmée ! Le vendeur a reçu ses fonds dans son portefeuille DealCity." 
    });

  } catch (error: any) {
    console.error("ERREUR_CONFIRMATION_RECEPTION:", error);
    return NextResponse.json({ 
      error: "Erreur technique lors de la clôture",
      details: error.message 
    }, { status: 500 });
  }
}