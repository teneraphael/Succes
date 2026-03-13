import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const cookieStore = await cookies();
  
  const isProd = process.env.NODE_ENV === "production";

  // CRUCIAL : On s'assure que Google nous renvoie au même endroit que là où on est
  const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);

  const options = {
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    // On ne force le domaine QUE en prod. En local, on laisse par défaut.
    domain: isProd ? ".dealcity.app" : undefined,
  };

  cookieStore.set("state", state, options);
  cookieStore.set("code_verifier", codeVerifier, options);

  return Response.redirect(url);
}