import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

const PAGE_SIZE = 10;

const KEYWORDS_MAP: Record<string, string[]> = {
  TECH: ["iphone", "samsung", "ordinateur", "laptop", "telephone", "ecran", "huawei", "pixel", "airpods", "clavier", "souris", "tablette", "console", "ps5", "xbox"],
  MODE: ["chaussure", "habit", "sac", "montre", "robe", "chemise", "basket", "meche", "perruque", "bijou", "pantalon", "veste", "parfum", "lunettes", "ceinture"],
  AUTO: ["voiture", "moto", "toyota", "mercedes", "engin", "suzuki", "pneu", "honda", "bmw", "piece", "huile", "batterie"],
  IMMOBILIER: ["maison", "terrain", "studio", "appartement", "chambre", "cite", "duplex", "bail", "villa", "bureau", "entrepot"],
  ALIMENTAIRE: ["poulet", "poisson", "viande", "legume", "fruit", "huile", "riz", "pate", "pain", "gateau", "boisson", "eau"],
  BEAUTE: ["creme", "huile", "shampoing", "vernis", "rouge", "fond", "mascara", "serum", "lotion", "savon"],
};

const ALL_KEYWORDS = Object.values(KEYWORDS_MAP).flat();
const KEYWORDS_REGEX = new RegExp(ALL_KEYWORDS.join("|"), "gi");

function computeRelevanceScore(
  content: string,
  views: number,
  likesCount: number,
  commentsCount: number,
  createdAt: Date,
  userKeywords: string[],
  boostedAt: Date | null,
): number {
  const lower = content.toLowerCase();
  const interestScore = userKeywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 10 : 0), 0);
  const engagementScore = Math.log1p(likesCount) * 3 + Math.log1p(commentsCount) * 4 + Math.log1p(views) * 0.5;
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / (7 * 24)) * 20;
  const boostScore = boostedAt ? Math.exp(-(Date.now() - boostedAt.getTime()) / (24 * 60 * 60 * 1000)) * 15 : 0;
  return interestScore + engagementScore + recencyScore + boostScore;
}

async function getUserInterests(userId: string): Promise<{
  keywords: string[];
  categoryScores: Record<string, number>;
  viewedPostIds: string[];
}> {
  const [interactions, likedPosts] = await Promise.all([
    prisma.userInteraction.findMany({
      where: { userId },
      select: { postId: true, post: { select: { content: true } }, type: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.like.findMany({
      where: { userId },
      select: { postId: true, post: { select: { content: true } } },
      orderBy: {},
      take: 20,
    }),
  ]);

  const categoryScores: Record<string, number> = {};
  const keywordsSet = new Set<string>();
  const viewedPostIds: string[] = [];

  for (const inter of interactions) {
    viewedPostIds.push(inter.postId);
    if (!inter.post?.content) continue;
    const weight = inter.type === "FAVORITE" ? 3 : 1;
    const matches = inter.post.content.toLowerCase().match(KEYWORDS_REGEX) || [];
    matches.forEach((word) => {
      keywordsSet.add(word);
      for (const [cat, words] of Object.entries(KEYWORDS_MAP)) {
        if (words.includes(word)) {
          categoryScores[cat] = (categoryScores[cat] || 0) + weight;
        }
      }
    });
  }

  for (const like of likedPosts) {
    viewedPostIds.push(like.postId);
    if (!like.post?.content) continue;
    const matches = like.post.content.toLowerCase().match(KEYWORDS_REGEX) || [];
    matches.forEach((word) => {
      keywordsSet.add(word);
      for (const [cat, words] of Object.entries(KEYWORDS_MAP)) {
        if (words.includes(word)) {
          categoryScores[cat] = (categoryScores[cat] || 0) + 3;
        }
      }
    });
  }

  return {
    keywords: Array.from(keywordsSet),
    categoryScores,
    viewedPostIds: [...new Set(viewedPostIds)],
  };
}

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const city = req.nextUrl.searchParams.get("city") || undefined;
    const neighborhood = req.nextUrl.searchParams.get("neighborhood") || undefined;
    const { user } = await validateRequest();

    let locationWhereClause: any = {};

    if (city && city.trim() !== "") {
      if (neighborhood && neighborhood.trim() !== "") {
        locationWhereClause = {
          city: { equals: city.trim(), mode: "insensitive" },
          neighborhood: { equals: neighborhood.trim(), mode: "insensitive" },
        };
      } else {
        locationWhereClause = {
          city: { equals: city.trim(), mode: "insensitive" },
        };
      }
    }

    const baseFilter = {
      ...(user ? { userId: { not: user.id } } : {}),
      ...locationWhereClause,
    };

    // Si on a un utilisateur et pas de curseur (première page) : on applique l'algorithme de pertinence
    if (!cursor && user) {
      const { keywords, categoryScores, viewedPostIds } = await getUserInterests(user.id);

      const topCategories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([cat]) => cat);

      const topKeywords = topCategories.flatMap((cat) => KEYWORDS_MAP[cat] || []).slice(0, 8);
      const CANDIDATE_SIZE = 40;

      const smartBaseFilter = {
        ...baseFilter,
        id: { notIn: viewedPostIds.slice(0, 100) },
      };

      const [relevantPosts, recentPosts] = await Promise.all([
        topKeywords.length > 0
          ? prisma.post.findMany({
              where: {
                ...smartBaseFilter,
                OR: topKeywords.map((kw) => ({
                  content: { contains: kw, mode: "insensitive" as const },
                })),
              },
              include: getPostDataInclude(user.id),
              orderBy: { createdAt: "desc" },
              take: CANDIDATE_SIZE / 2,
            })
          : Promise.resolve([]),

        prisma.post.findMany({
          where: smartBaseFilter,
          include: getPostDataInclude(user.id),
          orderBy: { createdAt: "desc" },
          take: CANDIDATE_SIZE,
        }),
      ]);

      const seen = new Set<string>();
      const candidates = [...relevantPosts, ...recentPosts].filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      const scored = candidates.map((post) => ({
        post,
        score: computeRelevanceScore(
          post.content,
          post.views || 0,
          post._count.likes,
          post._count.comments,
          post.createdAt,
          keywords,
          null,
        ),
      }));

      scored.sort((a, b) => b.score - a.score);

      const finalPosts = scored.slice(0, PAGE_SIZE).map((s) => s.post);
      
      // ✅ Correction clé : Pour la pagination par curseur, on utilise le dernier ID du bloc récupéré, 
      // et la suite se basera proprement sur createdAt pour éviter les ruptures.
      const nextCursor = scored.length > PAGE_SIZE ? finalPosts[finalPosts.length - 1].id : null;

      return Response.json({ posts: finalPosts, nextCursor } satisfies PostsPage);
    }

    // Gestion standard de la pagination (ou utilisateur non connecté) basée strictement sur createdAt
    const rawPosts = await prisma.post.findMany({
      where: baseFilter,
      include: getPostDataInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // 👈 Important : Saute l'élément du curseur pour éviter les doublons
    });

    const nextCursor = rawPosts.length > PAGE_SIZE ? rawPosts[PAGE_SIZE].id : null;
    const posts = rawPosts.slice(0, PAGE_SIZE);

    if (!user && posts.length > 0) {
      posts.sort((a, b) => {
        const scoreA = Math.log1p(a._count.likes) * 3 + Math.log1p(a._count.comments) * 4;
        const scoreB = Math.log1p(b._count.likes) * 3 + Math.log1p(b._count.comments) * 4;
        return scoreB - scoreA + (Math.random() - 0.5) * 2;
      });
    }

    return Response.json({ posts, nextCursor } satisfies PostsPage);

  } catch (error) {
    console.error("ERREUR CRITIQUE FEED:", error);
    return Response.json({ posts: [], nextCursor: null });
  }
}