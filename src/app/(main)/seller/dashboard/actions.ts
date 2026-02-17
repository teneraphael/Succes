"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BOOST_COST = 500; // Le prix d'un boost

export async function boostPost(postId: string) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) throw new Error("Unauthorized");

  // 1. Récupérer le post et vérifier l'appartenance
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { userId: true },
  });

  if (!post || post.userId !== loggedInUser.id) {
    throw new Error("Post non trouvé ou action non autorisée");
  }

  // 2. Vérifier le solde du vendeur
  const seller = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true },
  });

  if ((seller?.balance ?? 0) < BOOST_COST) {
    throw new Error(`Solde insuffisant. Le boost coûte ${BOOST_COST} FCFA.`);
  }

  // 3. Transaction : Débit + Mise à jour du Post + Log financier
  await prisma.$transaction([
    // On débite le vendeur
    prisma.user.update({
      where: { id: loggedInUser.id },
      data: { balance: { decrement: BOOST_COST } },
    }),
    // On "propulse" le post en changeant sa date pour le faire remonter en haut du feed
    prisma.post.update({
      where: { id: postId },
      data: { createdAt: new Date() }, 
    }),
    // On enregistre la transaction pour l'historique
    prisma.transaction.create({
      data: {
        userId: loggedInUser.id,
        amount: -BOOST_COST,
        reason: `BOOST_POST_${postId}`,
      },
    }),
  ]);

  // Purge du cache pour mettre à jour l'affichage partout
  revalidatePath("/");
  revalidatePath("/seller/dashboard");
  
  // RETOUR CRUCIAL : C'est ce qui corrige ton erreur TypeScript
  return { success: true };
}