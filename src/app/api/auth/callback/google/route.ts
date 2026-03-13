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

  // ✅ LOGS DE DEBUGGING (Vérifie tes logs serveur si le 400 persiste)
  console.log("--- AUTH DEBUG START ---");
  console.log("State de Google:", state);
  console.log("State du Cookie:", storedState);
  console.log("Verifier du Cookie:", !!storedCodeVerifier);

  // 1. VALIDATION DES PARAMÈTRES ET DU STATE
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    console.error("Échec de la validation : State mismatch ou cookies manquants.");
    return new Response("Validation failed: State mismatch or missing cookies.", { status: 400 });
  }

  try {
    // 2. ÉCHANGE DU CODE CONTRE LES TOKENS
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // 3. RÉCUPÉRATION DES INFOS UTILISATEUR
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<{ id: string; name: string }>();

    // 4. VÉRIFICATION DE L'EXISTENCE DE L'UTILISATEUR
    const existingUser = await prisma.user.findUnique({
      where: {
        googleId: googleUser.id,
      },
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      
      cookieStore.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    // 5. CRÉATION D'UN NOUVEL UTILISATEUR (S'IL N'EXISTE PAS)
    const userId = generateIdFromEntropySize(10);
    const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: googleUser.name,
          googleId: googleUser.id,
        },
      });
      
      // On essaye d'enregistrer sur Stream, si ça échoue on log l'erreur
      try {
        await streamServerClient.upsertUser({
          id: userId,
          username,
          name: username,
        });
      } catch (streamError) {
        console.error("Stream sync error:", streamError);
      }
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });

  } catch (error) {
    console.error("Erreur détaillée lors du callback Google:", error);
    
    if (error instanceof OAuth2RequestError) {
      // Erreur liée à l'échange de jetons (souvent code expiré ou mauvais redirect_uri)
      return new Response("Invalid authorization code.", { status: 400 });
    }
    
    return new Response("Internal Server Error", { status: 500 });
  }
}