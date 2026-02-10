export const dynamic = "force-dynamic"; // ✅ Toujours nécessaire pour les routes avec Prisma/Auth

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // ✅ Super, tu as bien anticipé le await de Next.js 15
    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
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