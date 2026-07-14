export const dynamic = "force-dynamic"; // Recommandé pour les routes de flux de données

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  // 🚀 Next.js 15 : params est TOUJOURS une Promise
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Résolution correcte de la promise params
    const { userId } = await params;

    // 2. Gestion de la pagination (cursor)
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const posts = await prisma.post.findMany({
      where: { userId },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      // Si cursor est présent, on l'utilise pour le saut de page
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error("GET User Posts Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}