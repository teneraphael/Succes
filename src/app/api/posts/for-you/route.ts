import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

const PAGE_SIZE = 10;

// ✅ Catégories enrichies
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

// ✅ Score de pertinence d'un post selon les centres d'intérêt
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

  // 1. Score intérêt utilisateur — chaque mot-clé matching ajoute +10
  const interestScore = userKeywords.reduce((acc, kw) => {
    return acc + (lower.includes(kw) ? 10 : 0);
  }, 0);

  // 2. Score engagement — normalise les métriques sociales
  const engagementScore =
    Math.log1p(likesCount) * 3 +
    Math.log1p(commentsCount) * 4 +
    Math.log1p(views) * 0.5;

  // 3. Score de récence — décroît exponentiellement sur 7 jours
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.exp(-ageHours / (7 * 24)) * 20;

  // 4. Bonus boost — si le post a été boosté récemment (+15)
  const boostScore = boostedAt
    ? Math.exp(-(Date.now() - boostedAt.getTime()) / (24 * 60 * 60 * 1000)) * 15
    : 0;

  return interestScore + engagementScore + recencyScore + boostScore;
}

// ✅ Analyse des intérêts utilisateur depuis ses interactions
async function getUserInterests(userId: string): Promise<{
  keywords: string[];
  categoryScores: Record<string, number>;
  viewedPostIds: string[];
}> {
  const [interactions, likedPosts] = await Promise.all([
    // Dernières 30 interactions (vues)
    prisma.userInteraction.findMany({
      where: { userId },
      select: { postId: true, post: { select: { content: true } }, type: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    // Derniers 20 likes
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

  // Analyser les interactions — likes comptent 3x plus que les vues
  for (const inter of interactions) {
    viewedPostIds.push(inter.postId);
    if (!inter.post?.content) continue;
    const weight = inter.type === "FAVORITE" ? 3 : 1;
    const matches = inter.post.content.toLowerCase().match(KEYWORDS_REGEX) || [];
    matches.forEach((word) => {
      keywordsSet.add(word);
      // Identifier la catégorie du mot-clé
      for (const [cat, words] of Object.entries(KEYWORDS_MAP)) {
        if (words.includes(word)) {
          categoryScores[cat] = (categoryScores[cat] || 0) + weight;
        }
      }
    });
  }

  // Analyser les likes
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
    const { user } = await validateRequest();

    // ✅ Première page — algorithme de recommandation complet
    if (!cursor && user) {
      const { keywords, categoryScores, viewedPostIds } = await getUserInterests(user.id);

      // ✅ Identifier les catégories favorites (top 2)
      const topCategories = Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([cat]) => cat);

      // ✅ Mots-clés des catégories favorites pour le filtre SQL
      const topKeywords = topCategories.flatMap((cat) => KEYWORDS_MAP[cat] || []).slice(0, 8);

      // ✅ Fetch plus large pour mieux scorer — 40 posts candidats
      const CANDIDATE_SIZE = 40;

      const [relevantPosts, recentPosts] = await Promise.all([
        // Posts correspondant aux intérêts
        topKeywords.length > 0
          ? prisma.post.findMany({
              where: {
                userId: { not: user.id },
                id: { notIn: viewedPostIds.slice(0, 100) },
                OR: topKeywords.map((kw) => ({
                  content: { contains: kw, mode: "insensitive" as const },
                })),
              },
              include: getPostDataInclude(user.id),
              orderBy: { createdAt: "desc" },
              take: CANDIDATE_SIZE / 2,
            })
          : Promise.resolve([]),

        // Posts récents (diversité)
        prisma.post.findMany({
          where: {
            userId: { not: user.id },
            id: { notIn: viewedPostIds.slice(0, 100) },
          },
          include: getPostDataInclude(user.id),
          orderBy: { createdAt: "desc" },
          take: CANDIDATE_SIZE,
        }),
      ]);

      // ✅ Fusionner et dédupliquer
      const seen = new Set<string>();
      const candidates = [...relevantPosts, ...recentPosts].filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      // ✅ Scorer chaque post
      const scored = candidates.map((post) => ({
        post,
        score: computeRelevanceScore(
          post.content,
          post.views || 0,
          post._count.likes,
          post._count.comments,
          post.createdAt,
          keywords,
          null, // boostedAt — à ajouter si vous ajoutez le champ au schéma
        ),
      }));

      // ✅ Trier par score décroissant
      scored.sort((a, b) => b.score - a.score);

      // ✅ Légère randomisation dans le top 20 pour éviter la répétition
      const top20 = scored.slice(0, 20);
      for (let i = top20.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * Math.min(i + 1, 5));
        [top20[i], top20[j]] = [top20[j], top20[i]];
      }

      const finalPosts = top20.slice(0, PAGE_SIZE).map((s) => s.post);
      const nextCursor = top20.length > PAGE_SIZE ? top20[PAGE_SIZE].post.id : null;

      return Response.json({ posts: finalPosts, nextCursor } satisfies PostsPage);
    }

    // ✅ Pages suivantes (pagination) — récence pure + cursor stable
    const rawPosts = await prisma.post.findMany({
      where: user ? { NOT: { userId: user.id } } : {},
      include: getPostDataInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = rawPosts.length > PAGE_SIZE ? rawPosts[PAGE_SIZE].id : null;
    const posts = rawPosts.slice(0, PAGE_SIZE);

    // ✅ Visiteur non connecté — mélange aléatoire pondéré par engagement
    if (!user) {
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