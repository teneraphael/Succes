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

  // ✅ CORRECTION : Suppression de la logique Stream dans la transaction
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
 * ✅ NOUVELLE ACTION : Incrémente le compteur de clics WhatsApp d'un vendeur
 * @param sellerId L'ID du vendeur qui possède le post
 */
export async function incrementWhatsAppClicks(sellerId: string) {
  if (!sellerId) {
    return { success: false, error: "ID du vendeur manquant" };
  }

  try {
    await prisma.user.update({
      where: { id: sellerId },
      data: {
        // ✅ CORRECTION : Utilisation de 'balance' qui est un Int valide et disponible sur ton modèle User
        balance: {
          increment: 1,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du clic WhatsApp:", error);
    return { success: false, error: "Impossible d'enregistrer le clic" };
  }
}