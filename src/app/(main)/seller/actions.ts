"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * RÉCUPÉRER LE SOLDE DE CRÉDITS BOOST
 */
export async function getSellerBalance() {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return 0;

  const user = await prisma.user.findUnique({
    where: { id: loggedInUser.id },
    select: { balance: true },
  });

  return user?.balance ?? 0;
}

/**
 * BOOSTER UN ARTICLE (Consomme des crédits)
 */
export async function boostPost(postId: string) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return { success: false, error: "Non autorisé" };

  // Prix d'un boost (500 FCFA comme convenu)
  const BOOST_PRICE = 500;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier le solde du vendeur
      const seller = await tx.user.findUnique({
        where: { id: loggedInUser.id },
        select: { balance: true },
      });

      if (!seller || (seller.balance ?? 0) < BOOST_PRICE) {
        throw new Error("Solde Boost insuffisant. Veuillez recharger votre compte.");
      }

      // 2. Vérifier que l'article appartient bien au vendeur
      const post = await tx.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (!post || post.userId !== loggedInUser.id) {
        throw new Error("Action non autorisée sur cet article.");
      }

      // 3. Déduire le solde
      await tx.user.update({
        where: { id: loggedInUser.id },
        data: { balance: { decrement: BOOST_PRICE } },
      });

      // 4. Mettre à jour la date de création de l'article pour le faire remonter
      // Ou mettre à jour un champ "boostedAt" si tu en as un
      await tx.post.update({
        where: { id: postId },
        data: { 
          createdAt: new Date(), // Le fait remonter en haut de liste
        },
      });

      // 5. Créer une trace dans l'historique (Optionnel mais recommandé)
      // On utilise le type "BOOST" ou "USAGE"
      await tx.transaction.create({
        data: {
          userId: loggedInUser.id,
          amount: -BOOST_PRICE,
          reason: "Propulsion d'article (Boost)",
          type: "BOOST", 
          status: "SUCCESS",
        },
      });

      return { success: true };
    });

    revalidatePath("/");
    revalidatePath("/seller/dashboard");
    return result;

  } catch (error: any) {
    console.error("[BOOST_ERROR]:", error);
    return { success: false, error: error.message };
  }
}