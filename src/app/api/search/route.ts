import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    if (!q.trim()) {
      return Response.json({ posts: [], users: [], nextCursor: null });
    }

    const searchQuery = q.trim().split(/\s+/).join(" & ");

    const [posts, users] = await Promise.all([
      prisma.post.findMany({
        where: {
          OR: [
            { content: { search: searchQuery } },
            { user: { displayName: { contains: q, mode: "insensitive" } } },
            { user: { username: { contains: q, mode: "insensitive" } } },
            { city: { contains: q, mode: "insensitive" } },
            { neighborhood: { contains: q, mode: "insensitive" } },
          ],
        },
        include: getPostDataInclude(user?.id),
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
      }),
      prisma.user.findMany({
        where: {
          isSeller: true,
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
            { businessName: { contains: q, mode: "insensitive" } },
            { businessDomain: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { neighborhood: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
          coverUrl: true,
          bio: true,
          isSeller: true,
          isVerified: true,
          businessName: true,
          businessDomain: true,
          city: true,
          neighborhood: true,
          phoneNumber: true,
          _count: { select: { followers: true, posts: true, sales: true } },
        },
        take: 6,
      }),
    ]);

    const hasMore = posts.length > pageSize;
    const visiblePosts = posts.slice(0, pageSize);

    return Response.json({
      posts: visiblePosts,
      users,
      nextCursor: hasMore ? visiblePosts[visiblePosts.length - 1]?.id || null : null,
    });
  } catch (error) {
    console.error("Erreur API recherche:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
