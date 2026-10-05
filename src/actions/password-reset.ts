"use server";

import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hash, verify } from "@node-rs/argon2";
import { randomInt } from "node:crypto";
import { consumeAuthAttempt } from "@/lib/auth-rate-limit";
import { passwordSchema, resetEmailSchema } from "@/lib/validation";

const options = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };
const windowMs = 15 * 60 * 1000;
const genericSuccess = { success: "Si un compte correspond à cet email, un code de sécurité a été envoyé." };
const invalidCode = { error: "Code invalide ou expiré." };

export async function generateResetCode(input: string) {
  const parsed = resetEmailSchema.safeParse(input);
  if (!parsed.success) return { error: "Adresse email invalide." };
  const email = parsed.data;
  try {
    if (!(await consumeAuthAttempt("reset-send", email, 3, windowMs))) return genericSuccess;
    const code = randomInt(100000, 1000000).toString();
    // Do the same expensive hashing for unknown addresses. Never store the code.
    const token = await hash(code, options);
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { email: true } });
    if (!user?.email) return genericSuccess;
    await prisma.$transaction(async tx => {
      // Serialize concurrent resends so only the latest code can remain valid.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${email}))`;
      await tx.passwordResetToken.deleteMany({ where: { email } });
      await tx.passwordResetToken.create({ data: { email, token, expires: new Date(Date.now() + windowMs) } });
    });
    // Same response on delivery failure or unknown address; do not leak accounts.
    try { await sendPasswordResetEmail(user.email, code); } catch { console.warn("Password reset email delivery failed"); }
    return genericSuccess;
  } catch {
    console.warn("Password reset request failed");
    return { error: "Service temporairement indisponible. Veuillez réessayer." };
  }
}

export async function verifyAndChangePassword(input: string, code: string, newPassword: string) {
  const emailResult = resetEmailSchema.safeParse(input);
  if (!emailResult.success || typeof code !== "string" || !/^\d{6}$/.test(code)) return invalidCode;
  const passwordResult = passwordSchema.safeParse(newPassword);
  if (!passwordResult.success) return { error: "Le mot de passe doit contenir entre 8 et 128 caractères." };
  const email = emailResult.data;
  try {
    // This budget survives resends, restarts and simultaneous application instances.
    if (!(await consumeAuthAttempt("reset-verify", email, 5, windowMs))) return invalidCode;
    const token = await prisma.passwordResetToken.findFirst({ where: { email, expires: { gt: new Date() } }, orderBy: { expires: "desc" } });
    // Previously issued plaintext codes are deliberately invalid after this patch.
    if (!token || !token.token.startsWith("$argon2") || !(await verify(token.token, code))) return invalidCode;
    const passwordHash = await hash(passwordResult.data, options);
    const changed = await prisma.$transaction(async tx => {
      const claimed = await tx.passwordResetToken.deleteMany({ where: { id: token.id, token: token.token, expires: { gt: new Date() } } });
      if (claimed.count !== 1) return false;
      const user = await tx.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
      if (!user) throw new Error("Reset account unavailable");
      await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
      // Password change, single-use consumption and session revocation are atomic.
      await tx.session.deleteMany({ where: { userId: user.id } });
      await tx.passwordResetToken.deleteMany({ where: { email } });
      return true;
    });
    return changed ? { success: "Mot de passe modifié avec succès !" } : invalidCode;
  } catch {
    console.warn("Password reset verification failed");
    return { error: "Impossible de modifier le mot de passe. Veuillez réessayer." };
  }
}
