"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { consumeAuthAttempt } from "@/lib/auth-rate-limit";
import { verifyPassword } from "@/lib/verify-password";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  credentials: LoginValues,
  returnTo?: string,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);

    if (!(await consumeAuthAttempt("login", username, 10, 15 * 60 * 1000))) {
      return { error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." };
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: "insensitive" } },
          { email: { equals: username, mode: "insensitive" } },
        ],
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: "Incorrect username or password",
      };
    }

    // Share the same account budget for email and username aliases.
    if (!(await consumeAuthAttempt("login-account", existingUser.id, 10, 15 * 60 * 1000))) {
      return { error: "Trop de tentatives. Veuillez réessayer dans 15 minutes." };
    }
    const validPassword = await verifyPassword(existingUser.passwordHash, password);

    if (!validPassword) {
      return {
        error: "Incorrect username or password",
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // ✅ Redirection intelligente vers /onboarding si la ville n'est pas définie
    if (!existingUser.city) {
      return redirect("/onboarding");
    }

    return redirect(returnTo?.startsWith("/") && !returnTo.startsWith("//") && !returnTo.includes("\\") ? returnTo : "/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.warn("Login failed");
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
