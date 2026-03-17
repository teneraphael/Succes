import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request, 
  { params }: { params: Promise<{ orderId: string }> } // Type correct pour Next 15
) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    // 1. ATTENDRE les params (Obligatoire sur Next.js 15)
    const resolvedParams = await params;
    const orderId = resolvedParams.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "ID de commande manquant" }, { status: 400 });
    }

    // 2. Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    // 3. Vérification de sécurité
    // Note : Si c'est un ADMIN qui valide, il faut ajouter : && user.id !== MY_ADMIN_ID
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Commande non trouvée ou accès refusé" }, { status: 404 });
    }

    // Empêcher de valider deux fois (Évite de créditer le vendeur 2 fois)
    if (order.status === "COMPLETED") {
      return NextResponse.json({ error: "Cette commande est déjà terminée" }, { status: 400 });
    }

    // 4. TRANSACTION ATOMIQUE
    await prisma.$transaction([
      // Marquer la commande comme terminée
      prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED" }
      }),
      // Créditer le solde du vendeur
      prisma.user.update({
        where: { id: (order as any).sellerId }, // 'as any' si TS râle sur le champ
        data: { 
          balance: { increment: (order as any).sellerEarnings || 0 } 
        }
      })
    ]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("ERREUR_VALIDATION_LIVRAISON:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la validation",
      details: error.message 
    }, { status: 500 });
  }
}