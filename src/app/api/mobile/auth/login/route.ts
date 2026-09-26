import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { verify } from "@node-rs/argon2";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body?.identifier || body?.username || "").trim();
    const password = String(body?.password || "");

    if (!identifier || !password) {
      return Response.json(
        { error: "Nom d'utilisateur/email et mot de passe requis" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: "insensitive" } },
          { email: { equals: identifier, mode: "insensitive" } },
        ],
      },
    });

    if (!existingUser?.passwordHash) {
      return Response.json(
        { error: "Identifiants incorrects" },
        { status: 401 },
      );
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return Response.json(
        { error: "Identifiants incorrects" },
        { status: 401 },
      );
    }

    const session = await lucia.createSession(existingUser.id, {});

    return Response.json({
      token: session.id,
      needsOnboarding: !existingUser.city,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        displayName: existingUser.displayName,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
        coverUrl: existingUser.coverUrl,
        bio: existingUser.bio,
        phoneNumber: existingUser.phoneNumber,
        city: existingUser.city,
        neighborhood: existingUser.neighborhood,
        isSeller: existingUser.isSeller,
        isVerified: existingUser.isVerified,
        businessName: existingUser.businessName,
        businessDomain: existingUser.businessDomain,
      },
    });
  } catch (error) {
    console.error("Erreur mobile login:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
