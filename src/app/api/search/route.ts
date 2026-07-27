import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const searchQuery = q.split(" ").join(" & ");
    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!q.trim()) {
      return Response.json({ posts: [], users: [], nextCursor: null });
    }

    // Exécution conjointe de la recherche sur les posts et sur les utilisateurs
    const [posts, users] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            {
              content: {
                search: searchQuery,
              },
            },
            {
              user: {
                displayName: {
                  search: searchQuery,
                },
              },
            },
            {
              user: {
                username: {
                  search: searchQuery,
                },
              },
            },
          ],
        },
        include: getPostDataInclude(user.id),
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            {
              displayName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          bio: true,
          isSeller: true,
        },
        take: 6, // Limite le nombre de profils affichés dans les résultats de recherche
      }),
    ]);

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data = {
      posts: posts.slice(0, pageSize),
      users,
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}