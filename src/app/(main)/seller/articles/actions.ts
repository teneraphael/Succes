"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- GESTION DE LA BOUTIQUE ---

interface UpdateShopProps {
  displayName: string;
  bio: string;
}

export async function updateShopSettings({ displayName, bio }: UpdateShopProps) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  await prisma.user.update({
    where: { id: user.id },
    data: { displayName, bio },
  });

  revalidatePath("/seller/settings");
}

export async function toggleNotifications(enabled: boolean) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  await prisma.user.update({
    where: { id: user.id },
    data: { allowNotifications: enabled },
  });

  revalidatePath("/seller/settings");
}

// --- GESTION DES ARTICLES (POSTS) ---

// LA FONCTION QUI MANQUAIT :
export async function deletePost(postId: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  // Sécurité : on vérifie que le post appartient bien à l'utilisateur
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post || post.userId !== user.id) {
    throw new Error("Vous n'avez pas l'autorisation de supprimer cet article.");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath("/seller/posts");
  revalidatePath("/"); // Rafraîchit aussi l'accueil
}

export async function updatePost(postId: string, content: string, republish: boolean = false) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== user.id) throw new Error("Non autorisé");

  await prisma.post.update({
    where: { id: postId },
    data: {
      content: content,
      // Si republish est true, on met à jour la date pour faire remonter le post
      ...(republish && { createdAt: new Date() }),
    },
  });

  revalidatePath("/seller/posts");
  revalidatePath("/");
}

// --- SUPPRESSION DU COMPTE ---

export async function deleteSellerAccount() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  await prisma.$transaction([
    prisma.post.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: { isSeller: false },
    }),
  ]);

  revalidatePath("/");
}