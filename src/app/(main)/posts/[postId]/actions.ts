"server action";

import prisma from "@/lib/prisma"; // Ajuste le chemin selon ton projet
import { validateRequest } from "@/auth"; // Si tu vérifies l'authentification

export async function decrementStock(postId: string, quantityToReduce: number = 1) {
  try {
    // 1. Optionnel : Vérifier si l'utilisateur est connecté si nécessaire
    // const { user } = await validateRequest();
    // if (!user) throw new Error("Non autorisé");

    // 2. Mettre à jour le stock de manière atomique avec Prisma
    // "decrement" évite les conflits si deux personnes achètent en même temps
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        stock: {
          decrement: quantityToReduce,
        },
      },
    });

    // 3. Sécurité : Si le stock tombe en dessous de 0 suite à un achat simultané, on le remet à 0
    if (updatedPost.stock < 0) {
      await prisma.post.update({
        where: { id: postId },
        data: { stock: 0 },
      });
      throw new Error("Rupture de stock soudaine !");
    }

    return { success: true, newStock: updatedPost.stock };
  } catch (error: any) {
    console.error("Erreur décrémentation stock:", error);
    return { success: false, error: error.message || "Impossible de mettre à jour le stock" };
  }
}