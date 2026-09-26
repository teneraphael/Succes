import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Google } from "arctic";
import { Lucia, Session, User } from "lucia";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import prisma from "./lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

const isProd = process.env.NODE_ENV === "production";

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: isProd,
      sameSite: "lax",
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
      hasDeliveryPass: databaseUserAttributes.hasDeliveryPass,
      phoneNumber: databaseUserAttributes.phoneNumber,
      balance: databaseUserAttributes.balance,
      city: databaseUserAttributes.city,                 // ✅ Ajouté
      neighborhood: databaseUserAttributes.neighborhood, // ✅ Ajouté
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
  hasDeliveryPass: boolean;
  phoneNumber: string | null;
  balance: number;
  city: string | null;                 // ✅ Ajouté
  neighborhood: string | null;         // ✅ Ajouté
}

const getBaseUrl = () => {
  if (isProd) return "https://dealcity.app";
  return process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
};

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${getBaseUrl()}/api/auth/callback/google`
);

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);

    const authorization = requestHeaders.get("authorization");
    const bearerSessionId =
      authorization?.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length).trim()
        : null;

    const cookieSessionId =
      cookieStore.get(lucia.sessionCookieName)?.value ?? null;

    const sessionId = bearerSessionId || cookieSessionId;

    if (!sessionId) {
      return { user: null, session: null };
    }

    const result = await lucia.validateSession(sessionId);

    // Les cookies sont uniquement rafraîchis pour les sessions web.
    // L'application mobile conserve son identifiant de session dans SecureStore.
    if (!bearerSessionId) {
      try {
        if (result.session && result.session.fresh) {
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          cookieStore.set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          );
        }

        if (!result.session) {
          const sessionCookie = lucia.createBlankSessionCookie();
          cookieStore.set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          );
        }
      } catch {
        console.warn("Info: Session cookie refresh skipped (Readonly context)");
      }
    }

    return result;
  },
);
