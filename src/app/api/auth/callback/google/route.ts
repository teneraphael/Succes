import { google, lucia } from "@/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { generateIdFromEntropySize } from "lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  
  // Récupération des cookies de vérification
  const storedState = cookieStore.get("state")?.value;
  const storedCodeVerifier = cookieStore.get("code_verifier")?.value;

  // Debug pour vérifier que les cookies sont bien lus
  console.log("--- DEBUG OAUTH ---");
  console.log("State URL:", state);
  console.log("State Cookie:", storedState);

  // 1. Validation de sécurité initiale
  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response("Validation failed: State mismatch or missing cookies.", { status: 400 });
  }

  try {
    // 2. Échange du code contre les tokens (Arctic)
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

    // 3. Récupération des informations de l'utilisateur chez Google
    // ✅ Correction : tokens.accessToken() est une méthode, il faut les parenthèses
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { 
          Authorization: `Bearer ${tokens.accessToken()}` 
        },
      })
      .json<{ id: string; name: string; picture?: string }>();

    let userId: string;

    // 4. Gestion de l'utilisateur dans la base de données
    const existingUser = await prisma.user.findUnique({ 
      where: { googleId: googleUser.id } 
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      userId = generateIdFromEntropySize(10);
      const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

      // Utilisation d'une transaction pour garantir l'intégrité des données
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: { 
            id: userId, 
            username, 
            displayName: googleUser.name, 
            googleId: googleUser.id, 
            avatarUrl: googleUser.picture || null 
          }
        });

        // 5. Synchronisation avec Stream Chat (optionnel, ne doit pas bloquer le login)
        try {
          await streamServerClient.upsertUser({ 
            id: userId, 
            username, 
            name: googleUser.name 
          });
        } catch (streamError) { 
          console.error("Stream Sync Error (ignored):", streamError); 
        }
      });
    }

    // 6. Création de la session Lucia
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // On applique le cookie de session
    cookieStore.set(
      sessionCookie.name, 
      sessionCookie.value, 
      sessionCookie.attributes
    );

    // 7. Nettoyage des cookies OAuth
    cookieStore.delete("state");
    cookieStore.delete("code_verifier");

    // Redirection propre vers la page d'accueil
    return new Response(null, {
      status: 302,
      headers: { 
        Location: "/" 
      },
    });

  } catch (error) {
    console.error("CRITICAL OAUTH ERROR:", error);
    // On affiche un message d'erreur un peu plus parlant pour le débug
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(`Erreur d'authentification: ${errorMessage}`, { status: 500 });
  }
}