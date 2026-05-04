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

    // 2. Validation de l'utilisateur
    // On appelle validateRequest qui va chercher le cookie auth_session
    const { user: loggedInUser, session } = await validateRequest();

    // Debug Console (Vérifie bien que l'ID s'affiche ici maintenant)
    console.log("--- API DEBUG ---");
    console.log("Post ID requis:", postId);
    console.log("User Authentifié:", loggedInUser?.id || "AUCUN");

    if (!loggedInUser || !session) {
      return NextResponse.json(
        { error: "Non autorisé - Session absente ou expirée" }, 
        { status: 401 }
      );
    }

    if (!postId) {
      return NextResponse.json(
        { error: "ID du post manquant" }, 
        { status: 400 }
      );
    }

    // 3. Récupération des données avec Prisma
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: getPostDataInclude(loggedInUser.id),
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