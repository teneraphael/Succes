"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function boostPost(postId: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  // On met à jour la date de création pour faire remonter le post en haut du fil
  await prisma.post.update({
    where: { 
      id: postId,
      userId: user.id 
    },
    data: { 
      createdAt: new Date() 
    },
  });

  // On rafraîchit le cache pour que le changement soit visible partout
  revalidatePath("/");
  revalidatePath("/seller/dashboard");
}