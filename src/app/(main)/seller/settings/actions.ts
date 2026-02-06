"use server"; 

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface UpdateShopProps {
  displayName: string;
  bio: string;
}

export async function updateShopSettings({ displayName, bio }: UpdateShopProps) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName,
      bio,
    },
  });

  revalidatePath("/seller/settings");
}

// NOUVELLE ACTION : Pour les notifications
export async function toggleNotifications(enabled: boolean) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      // Vérifie bien que le nom du champ est correct dans ton schéma Prisma
      allowNotifications: enabled, 
    },
  });

  revalidatePath("/seller/settings");
}

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