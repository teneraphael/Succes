import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  // ✅ On s'assure que la détection de prod est fiable
  const isProduction = process.env.NODE_ENV === "production";

  // ✅ Génération de l'URL Google avec les scopes en tableau
  const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

  const cookieStore = await cookies();

  // ✅ Configuration des cookies optimisée pour la redirection OAuth
  const cookieOptions = {
    path: "/",
    secure: isProduction, // Indispensable pour le HTTPS de dealcity.app
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax" as const, // Crucial pour que le cookie survive au retour de Google
  };

  cookieStore.set("state", state, cookieOptions);
  cookieStore.set("code_verifier", codeVerifier, cookieOptions);

  return Response.redirect(url);
}