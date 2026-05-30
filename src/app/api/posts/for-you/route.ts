import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

const KEYWORDS_MAP: Record<string, string[]> = {
  "TECH": ["iphone", "samsung", "ordinateur", "laptop", "telephone", "ecran", "huawei", "pixel", "airpods"],
  "MODE": ["chaussure", "habit", "sac", "montre", "robe", "chemise", "basket", "mèche", "perruque", "bijou"],
  "AUTO": ["voiture", "moto", "toyota", "mercedes", "engin", "car", "suzuki", "pneu"],
  "IMMOBILIER": ["maison", "terrain", "studio", "appartement", "chambre", "cité", "duplex", "bail"]
};

const ALL_KEYWORDS = Object.values(KEYWORDS_MAP).flat().map(w => w.toLowerCase());
const KEYWORDS_REGEX = new RegExp(ALL_KEYWORDS.join('|'), 'gi');

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    let uniqueKeywords: string[] = [];

    if (user && !cursor) {
      try {
        const lastInteractions = await prisma.userInteraction.findMany({
          where: { userId: user.id },
          select: { post: { select: { content: true } } },
          take: 10,
          orderBy: { createdAt: "desc" }
        });

        const keywordsSet = new Set<string>();
        lastInteractions.forEach(inter => {
          if (inter.post?.content) {
            const matches = inter.post.content.toLowerCase().match(KEYWORDS_REGEX);
            if (matches) matches.forEach(word => keywordsSet.add(word));
          }
        });
        uniqueKeywords = Array.from(keywordsSet);
      } catch (e) {
        console.error("Erreur analyse interactions:", e);
      }
    }

    // --- CORRECTION : Inclusion centralisée ---
    // On utilise UNIQUEMENT la fonction getPostDataInclude qui contient déjà tout
    const rawPosts = await prisma.post.findMany({
      where: user ? { NOT: { userId: user.id } } : {},
      include: getPostDataInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = rawPosts.length > pageSize ? rawPosts[pageSize].id : null;
    const posts = rawPosts.slice(0, pageSize);

    // Tri dynamique en mémoire
    let finalPosts = [...posts];

    if (user && uniqueKeywords.length > 0 && !cursor) {
      finalPosts.sort((a, b) => {
        const aContent = a.content.toLowerCase();
        const bContent = b.content.toLowerCase();
        const aMatch = uniqueKeywords.some(word => aContent.includes(word)) ? 1 : 0;
        const bMatch = uniqueKeywords.some(word => bContent.includes(word)) ? 1 : 0;
        return bMatch - aMatch;
      });
    } else if (!cursor) {
      finalPosts.sort(() => Math.random() - 0.5);
    }

    return Response.json({
      posts: finalPosts,
      nextCursor,
    } satisfies PostsPage);

  } catch (error) {
    console.error("ERREUR CRITIQUE FEED:", error);
    return Response.json({ posts: [], nextCursor: null });
  }
}