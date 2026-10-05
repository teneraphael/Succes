import { google, lucia } from "@/auth";
import kyInstance from "@/lib/ky";
import prisma from "@/lib/prisma";
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

  // 1. Validation de sécurité initiale
  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response("Validation failed: State mismatch or missing cookies.", { status: 400 });
  }

  // Consume OAuth cookies before exchange, including on failure, with the same
  // domain/path as issuance. cookies.delete() alone would miss domain cookies.
  const cookieOptions = { path: "/", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, domain: process.env.NODE_ENV === "production" ? ".dealcity.app" : undefined, maxAge: 0 };
  cookieStore.set("state", "", cookieOptions);
  cookieStore.set("code_verifier", "", cookieOptions);
  try {
    // 2. Échange du code contre les tokens (Arctic)
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

    // 3. Récupération des informations de l'utilisateur chez Google
    const googleUser = await kyInstance
      .get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { 
          Authorization: `Bearer ${tokens.accessToken()}` 
        },
      })
      .json<{ id: string; name: string; picture?: string }>();

    let userId: string;
    let userCity: string | null = null;

    // 4. Gestion de l'utilisateur dans la base de données
    const existingUser = await prisma.user.findUnique({ 
      where: { googleId: googleUser.id } 
    });

    if (existingUser) {
      userId = existingUser.id;
      userCity = existingUser.city;
    } else {
      userId = generateIdFromEntropySize(10);
      const username = slugify(googleUser.name) + "-" + userId.slice(0, 4);

      // Utilisation d'une transaction pour garantir l'intégrité des données
      const newUser = await prisma.$transaction(async (tx) => {
        return await tx.user.create({
          data: { 
            id: userId, 
            username, 
            displayName: googleUser.name, 
            googleId: googleUser.id, 
            avatarUrl: googleUser.picture || null 
          }
        });
      });
      userCity = newUser.city;
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


    // 8. Redirection intelligente : vers l'onboarding si la ville n'est pas définie, sinon vers l'accueil
    const redirectUrl = !userCity ? "/onboarding" : "/";

    return new Response(null, {
      status: 302,
      headers: { 
        Location: redirectUrl 
      },
    });

  } catch (error) {
    console.warn("Google authentication failed");
    return new Response("Connexion Google indisponible. Veuillez réessayer.", { status: 500 });
  }
}
