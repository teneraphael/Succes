import { google } from "@/auth";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = await google.createAuthorizationURL(
      state,
      codeVerifier,
      ["profile", "email"]
    );

    const cookieStore = cookies();
    const isProd = process.env.NODE_ENV === "production";

    (await cookieStore).set("state", state, {
      path: "/",
      httpOnly: true,
      maxAge: 600,
      sameSite: "lax",
      secure: isProd
    });

    (await cookieStore).set("code_verifier", codeVerifier, {
      path: "/",
      httpOnly: true,
      maxAge: 600,
      sameSite: "lax",
      secure: isProd
    });

    return Response.redirect(url);

  } catch (error) {
    console.error("Erreur Login:", error);
    return new Response(null, { status: 500 });
  }
}
