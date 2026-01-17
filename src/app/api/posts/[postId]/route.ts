import { validateRequest } from "@/auth"; // ou ton système d'auth
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    // Vérifier si l'utilisateur est connecté (optionnel mais recommandé)
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: params.postId,
      },
      // On utilise le même include que dans ton flux principal pour avoir l'user, les médias, etc.
      include: getPostDataInclude(loggedInUser.id),
    });

    if (!post) {
      return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Erreur API Post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}