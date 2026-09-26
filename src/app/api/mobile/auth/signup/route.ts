import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const credentials = signUpSchema.parse(await req.json());
    const { username, email, password } = credentials;

    const [existingUsername, existingEmail] = await Promise.all([
      prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
        select: { id: true },
      }),
      prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true },
      }),
    ]);

    if (existingUsername) {
      return Response.json(
        { error: "Ce nom d'utilisateur est déjà pris" },
        { status: 409 },
      );
    }

    if (existingEmail) {
      return Response.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    sendWelcomeEmail(email, username).catch((error) =>
      console.error("Mobile welcome email error:", error),
    );

    const session = await lucia.createSession(user.id, {});

    return Response.json(
      {
        token: session.id,
        needsOnboarding: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          phoneNumber: user.phoneNumber,
          city: user.city,
          neighborhood: user.neighborhood,
          isSeller: user.isSeller,
          isVerified: user.isVerified,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message || "Données invalides" },
        { status: 400 },
      );
    }

    console.error("Erreur mobile signup:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
