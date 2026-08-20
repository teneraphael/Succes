import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const city = req.nextUrl.searchParams.get("city") || undefined;
    const neighborhood = req.nextUrl.searchParams.get("neighborhood") || undefined;

    const pageSize = 10;

    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Construction dynamique du filtre de localisation
    let locationWhereClause: any = {};

    if (city && city.trim() !== "") {
      if (neighborhood && neighborhood.trim() !== "") {
        const cleanNeighborhood = neighborhood.trim();
        const firstWord = cleanNeighborhood.split(" ")[0];

        locationWhereClause = {
          city: { equals: city.trim(), mode: "insensitive" },
          neighborhood: { contains: firstWord, mode: "insensitive" },
        };
      } else {
        locationWhereClause = {
          city: { equals: city.trim(), mode: "insensitive" },
        };
      }
    }

    console.log("--- API /api/posts/following ---");
    console.log("Paramètre Ville URL:", city);
    console.log("Paramètre Quartier URL:", neighborhood);
    console.log("Filtre Prisma final appliqué:", JSON.stringify(locationWhereClause, null, 2));

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: user.id,
            },
          },
        },
        ...locationWhereClause,
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id),
    });

    console.log("Nombre de posts 'Following' trouvés:", posts.length);

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error("ERREUR CRITIQUE FOLLOWING:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}