"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BOOST_COST = 500; // 500 FCFA le boost

export async function boostPost(postId: string) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) throw new Error("Vous devez être connecté.");

    // 1. On récupère le post et le solde de l'utilisateur en une seule fois (plus rapide)
    const userAndPost = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true, content: true },
      });

      const seller = await tx.user.findUnique({
        where: { id: loggedInUser.id },
        select: { balance: true }, // Vérifie si ton champ est 'balance' ou 'walletBalance'
      });

      if (!post) throw new Error("Annonce introuvable.");
      if (post.userId !== loggedInUser.id) throw new Error("Action non autorisée sur cette annonce.");

      const currentBalance = seller?.balance || 0;

      if (currentBalance < BOOST_COST) {
        throw new Error(`Solde insuffisant. Le boost coûte ${BOOST_COST} FCFA. Votre solde actuel est de ${currentBalance} FCFA.`);
      }

      // 2. EXÉCUTION DE LA TRANSACTION FINANCIÈRE
      // A. Débit du solde
      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { balance: { decrement: BOOST_COST } },
      });

      // B. Propulsion de l'annonce
      // On met à jour 'createdAt' pour que l'annonce remonte en haut du fil d'actualité
      await tx.post.update({
        where: { id: postId },
        data: { createdAt: new Date() }, 
      });

      // C. Création de l'historique de transaction
      // Note : Assure-toi que ton modèle 'Transaction' existe dans ton schema.prisma
      await tx.transaction.create({
        data: {
          userId: loggedInUser.id,
          amount: -BOOST_COST,
          type: "DEBIT",
          reason: `Boost de l'annonce : ${post.content?.substring(0, 30)}...`,
          status: "SUCCESS"
        },
      });

      return { success: true };
    });

    // 3. Rafraîchissement du cache pour que le boost soit visible partout
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    revalidatePath("/seller/dashboard");
    
    return userAndPost;

  } catch (error: any) {
    console.error("[BOOST_POST_ERROR]:", error.message);
    throw new Error(error.message || "Une erreur est survenue lors du boost.");
  }
}