"use server";

import { lucia } from "@/auth";
import { consumeAuthAttempt } from "@/lib/auth-rate-limit";
import prisma from "@/lib/prisma";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendWelcomeEmail } from "@/lib/mail"; 

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    if (!(await consumeAuthAttempt("signup", email, 5, 60 * 60 * 1000))) {
      return { error: "Trop de tentatives. Veuillez réessayer plus tard." };
    }

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return {
        error: "Ce nom d'utilisateur est déjà pris",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Cet email est déjà utilisé",
      };
    }

    const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 });
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
    });

    // --- ENVOI DE L'EMAIL DE BIENVENUE ---
    sendWelcomeEmail(email, username).catch(err => console.error("Email error:", err));

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // ✅ Redirection vers /onboarding pour les nouveaux inscrits
    return redirect("/onboarding");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.warn("Signup failed");
    return {
      error: "Une erreur est survenue. Veuillez réessayer.",
    };
  }
}
