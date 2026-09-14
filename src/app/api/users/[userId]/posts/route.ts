export const dynamic = "force-dynamic";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getPostDataInclude,
  PostsPage,
} from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ userId: string }>;
  },
) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    /* ================================
       PARAMS
    ================================= */

    const { userId } = await params;

    /* ================================
       PAGINATION
    ================================= */

    const cursor =
      req.nextUrl.searchParams.get("cursor") ||
      undefined;

    const pageSize = 10;

    /* ================================
       POSTS
    ================================= */

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },

      include: getPostDataInclude(user.id),

      orderBy: {
        createdAt: "desc",
      },

      take: pageSize + 1,

      cursor: cursor
        ? {
            id: cursor,
          }
        : undefined,

      /**
       * Important :
       * on saute le post utilisé comme cursor,
       * sinon il peut apparaître deux fois.
       */
      skip: cursor ? 1 : 0,
    });

    /* ================================
       NEXT CURSOR
    ================================= */

    const hasMore = posts.length > pageSize;

    const nextCursor = hasMore
      ? posts[pageSize].id
      : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);

  } catch (error) {
    console.error(
      "❌ GET User Posts Error:",
      error,
    );

    return Response.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}