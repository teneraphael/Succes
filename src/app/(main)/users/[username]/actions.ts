"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export async function updateUserProfile(values: UpdateUserProfileValues) {
  const validatedValues = updateUserProfileSchema.parse(values);

  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });
    
    return updatedUser;
  });

  return updatedUser;
}

/**
 * ✅ ACTION CORRIGÉE : Crée une interaction de type CHAT (WhatsApp) liée au Post cliqué
 * @param postId L'ID du post sur lequel l'utilisateur a cliqué
 */
export async function incrementWhatsAppClicks(postId: string) {
  if (!postId) {
    return { success: false, error: "ID du post manquant" };
  }

  try {
    const { user } = await validateRequest();

    // 1️⃣ Récupérer le post pour s'assurer qu'il existe et obtenir l'ID de son auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return { success: false, error: "Post introuvable" };
    }

    // Si c'est l'auteur lui-même qui clique, on n'incrémente pas pour éviter la triche
    if (user && post.userId === user.id) {
      return { success: true, message: "Clic auteur ignoré" };
    }

    // 2️⃣ Récupérer un deal existant (contrainte d'intégrité de ta base de données)
    let targetDeal = await prisma.deal.findFirst({ select: { id: true } });

    if (!targetDeal) {
      targetDeal = await prisma.deal.create({
        data: {
          title: "Deal Global Système",
          price: 0,
          category: "SYSTEM",
          userId: post.userId,
        },
        select: { id: true },
      });
    }

    // 3️⃣ Enregistrer l'interaction dans UserInteraction
    // Si l'utilisateur n'est pas connecté (visiteur anonyme), on utilise un ID système ou une valeur alternative
    await prisma.userInteraction.create({
      data: {
        type: "CHAT",
        postId: post.id,
        dealId: targetDeal.id,
        // On lie l'interaction à l'utilisateur s'il est connecté, sinon on l'associe à l'auteur du post par défaut (ou un ID système)
        userId: user?.id ?? post.userId, 
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du clic WhatsApp:", error);
    return { success: false, error: "Impossible d'enregistrer le clic" };
  }
}