import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. On récupère le curseur pour la pagination et on définit la taille de la page
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    // 2. On vérifie si l'utilisateur est connecté
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Requête Prisma filtrée pour les vidéos
    const posts = await prisma.post.findMany({
      where: {
        attachments: {
          some: {
            type: "VIDEO", // On ne récupère que les posts qui ont au moins une vidéo
          },
        },
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // 4. Gestion du curseur pour la page suivante
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error("Erreur API VideoFeed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}