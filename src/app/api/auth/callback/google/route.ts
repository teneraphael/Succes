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

  // 1. LOGS DE SÉCURITÉ (Visibles dans ton terminal serveur)
  console.log("--- DEBUG AUTH ---");
  console.log("State attendu (cookie):", storedState);
  console.log("State reçu (URL):", state);

  // 2. VALIDATION STRICTE
  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response("Validation failed: State mismatch or missing cookies. Assurez-vous d'être sur le bon domaine.", { status: 400 });
  }

  try {
    // 3. ÉCHANGE DU CODE CONTRE LES TOKENS
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // 4. RÉCUPÉRATION DES INFOS UTILISATEUR DEPUIS GOOGLE
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<{ id: string; name: string; picture?: string }>();

    // 5. LOGIQUE UTILISATEUR (EXISTANT OU NOUVEAU)
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
        
        // Synchronisation avec Stream Chat (non-bloquant)
        try {
          await streamServerClient.upsertUser({
            id: userId,
            username,
            name: googleUser.name,
          });
        } catch (streamError) {
          console.error("Stream sync error:", streamError);
        }
      });
    }

    // 6. CRÉATION DE LA SESSION LUCIA
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    // On définit le cookie de session
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // 7. NETTOYAGE DES COOKIES TEMPORAIRES
    // On utilise les mêmes options (path: "/") pour être sûr qu'ils soient supprimés
    cookieStore.delete("state");
    cookieStore.delete("code_verifier");

    console.log(`✅ Connexion réussie : ${userId}`);

    // REDIRECTION FINALE
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });

  } catch (error) {
    console.error("Erreur critique Google Callback:", error);
    
    if (error instanceof OAuth2RequestError) {
      return new Response("Invalid authorization code or domain mismatch.", { status: 400 });
    }
    
    return new Response("Internal Server Error", { status: 500 });
  }
}