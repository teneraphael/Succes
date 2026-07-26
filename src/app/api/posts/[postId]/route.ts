export const dynamic = "force-dynamic";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // 1. Extraction du postId en premier (Next.js 15 asynchrone)
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "ID du post manquant" }, 
        { status: 400 }
      );
    }

    // 2. Validation optionnelle de l'utilisateur (on ne bloque plus si non connecté)
    const { user: loggedInUser } = await validateRequest();

    console.log("--- API DEBUG ---");
    console.log("Post ID requis:", postId);
    console.log("User Authentifié:", loggedInUser?.id || "VISITEUR NON CONNECTÉ");

    // 3. Récupération des données avec Prisma (on passe undefined si pas connecté)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(loggedInUser ? loggedInUser.id : undefined as any),
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post introuvable" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error("Erreur API Post:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" }, 
      { status: 500 }
    );
  }
}