import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cursor = req.nextUrl.searchParams.get("cursor");
    const city = req.nextUrl.searchParams.get("city");
    const neighborhood = req.nextUrl.searchParams.get("neighborhood");

    const pageSize = 10;

    // Construction dynamique des filtres Prisma
    const whereClause: any = {};

    if (city && city.trim() !== "") {
      whereClause.city = {
        equals: city.trim(),
        mode: "insensitive", // Rend la recherche insensible à la casse (Douala == douala)
      };
    }

    if (neighborhood && neighborhood.trim() !== "") {
      whereClause.neighborhood = {
        equals: neighborhood.trim(),
        mode: "insensitive", // Rend la recherche insensible à la casse (Yassa == yassa)
      };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}