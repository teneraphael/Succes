import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const cookieStore = await cookies();

    const url = await google.createAuthorizationURL(state, codeVerifier, [
      "profile",
      "email",
    ]);

    const isProd = process.env.NODE_ENV === "production";

    // CONFIGURATION DES COOKIES
    // On définit explicitement les options pour éviter tout rejet du navigateur
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: isProd, // TRÈS IMPORTANT : false en localhost, true sur dealcity.app (HTTPS)
      maxAge: 60 * 10, // 10 minutes
      sameSite: "lax" as const,
    };

    // ÉCRITURE DES COOKIES
    cookieStore.set("state", state, cookieOptions);
    cookieStore.set("code_verifier", codeVerifier, cookieOptions);

    console.log("✅ Cookies 'state' et 'code_verifier' définis avec succès");

    return Response.redirect(url);
  } catch (error) {
    console.error("❌ Erreur dans la route de login Google:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}