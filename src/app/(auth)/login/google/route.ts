// api/auth/login/google/route.ts
import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

  const cookieStore = await cookies();

  // On définit les cookies de manière à ce qu'ils soient lisibles au retour
  const cookieOptions = {
    path: "/",
    secure: true, // Obligatoire sur dealcity.app
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax" as const, // INDISPENSABLE pour OAuth
  };

  cookieStore.set("state", state, cookieOptions);
  cookieStore.set("code_verifier", codeVerifier, cookieOptions);

  return Response.redirect(url);
}