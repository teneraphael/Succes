import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const isProduction = process.env.NODE_ENV === "production";

const url = await google.createAuthorizationURL(state, codeVerifier, ["profile", "email"]);
 (await cookies()).set("state", state, {
    path: "/",
    secure: isProduction, // true en HTTPS
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  (await cookies()).set("code_verifier", codeVerifier, {
    path: "/",
    secure: isProduction, // true en HTTPS
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });
  return Response.redirect(url);
}
