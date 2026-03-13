import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const cookieStore = await cookies();

    const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

    // On détecte l'environnement
    const isProd = process.env.NODE_ENV === "production";

    // Options "Blindées" : Lax est essentiel pour les redirections cross-domain
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProd, // Sera false en local (autorise le HTTP), true en prod (exige le HTTPS)
      maxAge: 60 * 10,
      sameSite: "lax" as const,
    };

    cookieStore.set("state", state, cookieOptions);
    cookieStore.set("code_verifier", codeVerifier, cookieOptions);

    return Response.redirect(url);
  } catch (error) {
    console.error("Erreur Login:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}