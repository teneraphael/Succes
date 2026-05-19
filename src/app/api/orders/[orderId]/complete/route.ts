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

    // 5. TRANSACTION PRISMA : MISE À JOUR STATUT + DÉCRÉMENTATION DU STOCK
    // Utiliser $transaction garantit que si la mise à jour du stock échoue, 
    // le statut de la commande ne passera pas à "DELIVERED" (évite les incohérences en BDD).
    await prisma.$transaction(async (tx) => {
      
      // A. Mise à jour du statut de la commande
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: "DELIVERED",
          updatedAt: new Date()
        },
      });

      // B. Décrémentation du stock du produit lié (Post)
      if (order.postId) {
        const quantityToReduce = order.quantity || 1;

        const updatedPost = await tx.post.update({
          where: { id: order.postId },
          data: {
            stock: {
              decrement: quantityToReduce,
            },
          },
        });

        // Sécurité critique : Si le stock devient négatif, on annule tout !
        if (updatedPost.stock < 0) {
          throw new Error("Le stock disponible en base de données est insuffisant pour valider cette livraison.");
        }
      }
    });

    console.log(`✅ Commande ${orderId} : Argent encaissé, colis livré et stock mis à jour.`);

    return NextResponse.json({ 
      success: true, 
      message: "Livraison confirmée, paiement encaissé et stock décrémenté." 
    });

  } catch (error: any) {
    console.error("ERREUR_LIVREUR_UPDATE:", error);
    return NextResponse.json({ 
      error: error.message || "Erreur lors de la mise à jour",
      details: error.message 
    }, { status: 500 });
  }
}