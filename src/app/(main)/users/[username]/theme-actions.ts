"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { isValidHexColor } from "@/lib/profileTheme";
import { revalidatePath } from "next/cache";

export async function updateProfileTheme(color: string | null) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Non autorisé");

  if (color !== null && !isValidHexColor(color)) {
    throw new Error("Couleur invalide");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { themeColor: color },
  });

  revalidatePath(`/users/${user.username}`);
}