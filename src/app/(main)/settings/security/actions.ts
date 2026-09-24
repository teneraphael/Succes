"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/verify-password";
import { hash } from "@node-rs/argon2";

export async function changePassword(formData: FormData) {
  const { user } = await validateRequest();
  if (!user) return { error: "Connectez-vous pour modifier votre mot de passe." };

  const current = formData.get("currentPassword");
  const next = formData.get("newPassword");
  if (typeof current !== "string" || typeof next !== "string" || next.length < 10 || next.length > 1024) {
    return { error: "Le nouveau mot de passe doit contenir au moins 10 caractères." };
  }
  if (current === next) return { error: "Choisissez un mot de passe différent de l'ancien." };

  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (!account?.passwordHash || !(await verifyPassword(account.passwordHash, current))) {
    return { error: "Le mot de passe actuel est incorrect." };
  }

  const passwordHash = await hash(next, { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  return { success: true };
}
