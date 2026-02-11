"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendWelcomeEmail } from "@/lib/mail"; // <-- AJOUTE CET IMPORT

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

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
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // --- ENVOI DE L'EMAIL DE BIENVENUE ---
    // On l'exécute sans 'await' pour ne pas faire attendre l'utilisateur 
    // pendant que le serveur de mail répond
    sendWelcomeEmail(email, username).catch(err => console.error("Email error:", err));

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Une erreur est survenue. Veuillez réessayer.",
    };
  }
}