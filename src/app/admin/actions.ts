"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCreditToUser(userId: string, amount: number) {
  const { user: adminUser } = await validateRequest();

  // SÉCURITÉ : Remplace par ton propre ID utilisateur ou un email spécifique
  if (!adminUser || adminUser.id !== "4yq76ntw6lpduptd") {
    throw new Error("Action réservée à l'administrateur");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId: userId,
        amount: amount,
        reason: "RECHARGE_MANUELLE_ADMIN",
        status: "SUCCESS",
      },
    }),
  ]);

  revalidatePath("/admin");
  return { success: true };
}