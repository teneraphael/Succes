// api/auth/login/google/route.ts
import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  // ✅ Détecte si on est sur dealcity.app (production) ou localhost
  const isProd = process.env.NODE_ENV === "production";

  // Génération de l'URL Google
  const url = await google.createAuthorizationURL(state, codeVerifier, [
    "profile",
    "email",
  ]);

  const cookieStore = await cookies();

  // ✅ Configuration robuste des cookies
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax" as const, // Nécessaire pour que Google puisse renvoyer vers ton site
    secure: isProd, // true en HTTPS (prod), false en HTTP (local)
  };

  // Enregistrement des cookies de validation
  cookieStore.set("state", state, cookieOptions);
  cookieStore.set("code_verifier", codeVerifier, cookieOptions);

  // Redirection vers Google
  return Response.redirect(url);
}