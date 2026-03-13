import { google, lucia } from "@/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("code_verifier")?.value;

  // 1. VALIDATION DES PARAMÈTRES ET DU STATE
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    console.error("DEBUG: State mismatch ou cookies manquants.");
    return new Response("Validation failed: State mismatch or missing cookies.", { status: 400 });
  }

  try {
    // 2. ÉCHANGE DU CODE CONTRE LES TOKENS
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // 3. RÉCUPÉRATION DES INFOS UTILISATEUR DEPUIS GOOGLE
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<{ id: string; name: string; picture?: string }>();

    // 4. LOGIQUE UTILISATEUR (EXISTANT OU NOUVEAU)
    let userId: string;

    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id,
      },
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // CRÉATION D'UN NOUVEL UTILISATEUR
      userId = generateIdFromEntropySize(10);
      const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: userId,
            username,
            displayName: googleUser.name,
            googleId: googleUser.id,
            avatarUrl: googleUser.picture || null,
          },
        });
        
        // Synchronisation avec Stream Chat (optionnel)
        try {
          await streamServerClient.upsertUser({
            id: userId,
            username,
            name: googleUser.name,
          });
        } catch (streamError) {
          console.error("Stream sync error (non-blocking):", streamError);
        }
      });
    }

    // 5. CRÉATION DE LA SESSION LUCIA
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Suppression des cookies temporaires OAuth
    cookieStore.delete("state");
    cookieStore.delete("code_verifier");

    console.log(`✅ Connexion réussie pour l'utilisateur : ${userId}`);

    // REDIRECTION FINALE
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });

  } catch (error) {
    console.error("Erreur critique lors du callback Google:", error);
    
    if (error instanceof OAuth2RequestError) {
      return new Response("Invalid authorization code or domain mismatch.", { status: 400 });
    }
    
    return new Response("Internal Server Error", { status: 500 });
  }
}