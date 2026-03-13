import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Détection de la production
const isProd = process.env.NODE_ENV === "production";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
     secure: true, // Toujours true en prod sur dealcity.app
      sameSite: "lax",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayName: databaseUserAttributes.displayName,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
      isSeller: databaseUserAttributes.isSeller,
      isPioneer: databaseUserAttributes.isPioneer,
      isVerified: databaseUserAttributes.isVerified,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
  isSeller: boolean;
  isPioneer: boolean;
  isVerified: boolean;
}

// ✅ Sécurité : Si NEXT_PUBLIC_BASE_URL est mal lu, on force le domaine
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "https://dealcity.app";

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${baseUrl}/api/auth/callback/google`
);

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session) {
        if (result.session.fresh) {
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          cookieStore.set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
          );
        }
      } else {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error("Error setting cookies:", error);
    }

    return result;
  }
);