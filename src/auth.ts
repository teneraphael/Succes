import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

// Détection propre de l'environnement
const isProd = process.env.NODE_ENV === "production";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      // ✅ En prod (HTTPS), secure doit être true. En local (HTTP), false.
      secure: isProd,
      // ✅ Lax est indispensable pour que le cookie soit transmis après la redirection
      sameSite: "lax",
      // On ajoute le domaine pour la prod pour éviter les conflits de sous-domaines
      domain: isProd ? ".dealcity.app" : undefined,
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

// ✅ LOGIQUE DE REDIRECTION CORRIGÉE
// On donne la priorité absolue à l'URL actuelle. 
// Si tu es sur localhost, il DOIT utiliser localhost.
const getBaseUrl = () => {
  if (isProd) return "https://dealcity.app";
  // En local, on utilise l'URL définie ou le défaut localhost
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
};

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${getBaseUrl()}/api/auth/callback/google`
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
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error("Critical: Error updating session cookies:", error);
    }

    return result;
  }
);