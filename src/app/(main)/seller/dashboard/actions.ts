"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BOOST_COST = 500; // 500 FCFA le boost

// Interface pour harmoniser le retour et corriger l'erreur TypeScript dans le Dashboard
export type ActionResponse = {
  success: boolean;
  error: string | null;
};

export async function boostPost(postId: string): Promise<ActionResponse> {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return { success: false, error: "Vous devez être connecté pour booster une annonce." };
    }

    // UTILISATION DE LA TRANSACTION PRISMA POUR LA COHÉRENCE DES DONNÉES
    const result = await prisma.$transaction(async (tx) => {
      // 1. Récupération du post et vérification du propriétaire
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { id: true, userId: true, content: true },
      });

      if (!post) throw new Error("Annonce introuvable.");
      if (post.userId !== loggedInUser.id) throw new Error("Action non autorisée.");

      // 2. Vérification du solde mis à jour
      const seller = await tx.user.findUnique({
        where: { id: loggedInUser.id },
        select: { balance: true },
      });

      const currentBalance = seller?.balance || 0;

      if (currentBalance < BOOST_COST) {
        throw new Error(`Solde insuffisant (${currentBalance} FCFA). Le boost coûte ${BOOST_COST} FCFA.`);
      }

      // 3. EXÉCUTION DES MISES À JOUR
      
      // A. Débit du solde du vendeur
      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { balance: { decrement: BOOST_COST } },
      });

      // B. Remontée de l'annonce (Bump)
      // On met à jour 'createdAt' pour que l'annonce repasse en tête de liste dans le fil d'actualité
      await tx.post.update({
        where: { id: postId },
        data: { createdAt: new Date() }, 
      });

      // C. Création de la trace financière dans l'historique
      await tx.transaction.create({
        data: {
          userId: loggedInUser.id,
          amount: -BOOST_COST, // Négatif car c'est une dépense pour le vendeur
          type: "BOOST",       
          reason: `BOOST_POST_${postId.slice(-5)}`,
          status: "SUCCESS"
        },
      });

      return { success: true, error: null };
    });

    // 4. RAFRAÎCHISSEMENT DES PAGES (Important pour Next.js 15)
    revalidatePath("/"); // Met à jour le fil d'actualité global
    revalidatePath("/seller/dashboard"); // Met à jour le dashboard
    revalidatePath(`/posts/${postId}`); // Met à jour la page de l'annonce
    
    return result;

  } catch (error: any) {
    console.error("[BOOST_POST_ERROR]:", error.message);
    // On renvoie l'erreur proprement au composant UI pour le Toast
    return { success: false, error: error.message || "Une erreur est survenue lors du boost." };
  }
}