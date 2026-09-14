import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import {
  getPostDataInclude,
  PostsPage,
} from "@/lib/types";

import { NextRequest } from "next/server";

const PAGE_SIZE = 10;

/**
 * Nombre de candidats analysés.
 */
const CANDIDATE_SIZE = 150;

/* =========================================================
   POIDS DES ACTIONS
========================================================= */

const INTERACTION_WEIGHTS: Record<
  string,
  number
> = {
  IMPRESSION: 0.1,

  VIEW: 2,

  LIKE: 8,

  FAVORITE: 15,

  CHAT: 25,

  PROFILE_VIEW: 8,

  ORDER_STARTED: 35,

  ORDER_COMPLETED: 60,
};

/* =========================================================
   PROFIL UTILISATEUR
========================================================= */

type UserProfile = {
  categoryScores: Record<string, number>;

  sellerScores: Record<string, number>;

  recentlyViewedPostIds: string[];
};

/* =========================================================
   NORMALISATION TEXTE
========================================================= */

function normalize(value?: string | null) {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* =========================================================
   DÉCROISSANCE TEMPORELLE
========================================================= */

function getTimeMultiplier(
  createdAt: Date
) {
  const ageDays =
    (Date.now() -
      createdAt.getTime()) /
    (1000 * 60 * 60 * 24);

  /**
   * Les actions anciennes comptent moins.
   */
  return Math.max(
    0.2,
    Math.exp(-ageDays / 60)
  );
}

/* =========================================================
   CONSTRUIRE LE PROFIL
========================================================= */

async function getUserProfile(
  userId: string
): Promise<UserProfile> {
  const [
    interactions,
    bookmarks,
    orders,
    following,
  ] = await Promise.all([
    prisma.userInteraction.findMany({
      where: {
        userId,

        postId: {
          not: null,
        },
      },

      select: {
        postId: true,
        type: true,
        duration: true,
        createdAt: true,

        post: {
          select: {
            category: true,
            userId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 300,
    }),

    prisma.bookmark.findMany({
      where: {
        userId,
      },

      select: {
        post: {
          select: {
            category: true,
            userId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    }),

    prisma.order.findMany({
      where: {
        userId,
      },

      select: {
        status: true,

        post: {
          select: {
            category: true,
            userId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 50,
    }),

    prisma.follow.findMany({
      where: {
        followerId: userId,
      },

      select: {
        followingId: true,
      },
    }),
  ]);

  const categoryScores:
    Record<string, number> = {};

  const sellerScores:
    Record<string, number> = {};

  const recentlyViewedPostIds: string[] =
    [];

  function addInterest(
    category: string,
    sellerId: string,
    weight: number
  ) {
    if (
      category &&
      category !== "DIVERS"
    ) {
      categoryScores[category] =
        (categoryScores[category] || 0) +
        weight;
    }

    sellerScores[sellerId] =
      (sellerScores[sellerId] || 0) +
      weight * 0.35;
  }

  /* =======================================================
     INTERACTIONS
  ======================================================= */

  interactions.forEach((interaction) => {
    if (!interaction.post) return;

    let weight =
      INTERACTION_WEIGHTS[
        interaction.type
      ] || 1;

    /**
     * VIEW LONG = signal plus fort.
     */
    if (
      interaction.type === "VIEW" &&
      interaction.duration
    ) {
      if (interaction.duration >= 10) {
        weight *= 2;
      }

      if (interaction.duration >= 30) {
        weight *= 1.5;
      }
    }

    weight *= getTimeMultiplier(
      interaction.createdAt
    );

    addInterest(
      interaction.post.category,
      interaction.post.userId,
      weight
    );

    /**
     * Les posts récemment vus sont
     * temporairement évités.
     */
    if (
      interaction.type === "VIEW" &&
      recentlyViewedPostIds.length < 50 &&
      interaction.postId
    ) {
      recentlyViewedPostIds.push(
        interaction.postId
      );
    }
  });

  /* =======================================================
     BOOKMARKS
  ======================================================= */

  bookmarks.forEach((bookmark) => {
    addInterest(
      bookmark.post.category,
      bookmark.post.userId,
      20
    );
  });

  /* =======================================================
     COMMANDES
  ======================================================= */

  orders.forEach((order) => {
    let weight = 35;

    if (
      order.status === "COMPLETED" ||
      order.status === "DELIVERED"
    ) {
      weight = 60;
    }

    addInterest(
      order.post.category,
      order.post.userId,
      weight
    );
  });

  /* =======================================================
     FOLLOW
  ======================================================= */

  following.forEach((follow) => {
    sellerScores[follow.followingId] =
      (sellerScores[follow.followingId] || 0) +
      25;
  });

  return {
    categoryScores,
    sellerScores,

    recentlyViewedPostIds: [
      ...new Set(recentlyViewedPostIds),
    ],
  };
}

/* =========================================================
   FRAÎCHEUR
========================================================= */

function getFreshnessScore(
  createdAt: Date
) {
  const hours =
    (Date.now() -
      createdAt.getTime()) /
    (1000 * 60 * 60);

  /**
   * Les nouveaux produits ont
   * une vraie chance d'être vus.
   */
  return (
    Math.exp(-hours / 120) * 25
  );
}

/* =========================================================
   POPULARITÉ
========================================================= */

function getPopularityScore(post: any) {
  const views = post.views || 0;

  const likes =
    post._count?.likes || 0;

  const comments =
    post._count?.comments || 0;

  const orders =
    post._count?.orders || 0;

  return (
    Math.log1p(views) * 1 +
    Math.log1p(likes) * 4 +
    Math.log1p(comments) * 5 +
    Math.log1p(orders) * 10
  );
}

/* =========================================================
   SCORE
========================================================= */

function calculateScore(
  post: any,

  profile: UserProfile,

  userCity?: string | null,

  userNeighborhood?: string | null
) {
  let score = 0;

  /* =========================
     CATÉGORIE
  ========================= */

  const categoryScore =
    profile.categoryScores[
      post.category
    ] || 0;

  score += Math.min(
    categoryScore * 2,
    55
  );

  /* =========================
     VENDEUR
  ========================= */

  const sellerScore =
    profile.sellerScores[
      post.userId
    ] || 0;

  score += Math.min(
    sellerScore,
    40
  );

  /* =========================
     LOCALISATION
  ========================= */

  if (
    userNeighborhood &&
    post.neighborhood &&
    normalize(userNeighborhood) ===
      normalize(post.neighborhood)
  ) {
    score += 20;
  } else if (
    userCity &&
    post.city &&
    normalize(userCity) ===
      normalize(post.city)
  ) {
    score += 12;
  }

  /* =========================
     POPULARITÉ
  ========================= */

  score += getPopularityScore(post);

  /* =========================
     FRAÎCHEUR
  ========================= */

  score += getFreshnessScore(
    post.createdAt
  );

  /**
   * Petit facteur aléatoire.
   *
   * Permet de découvrir de nouveaux
   * produits au lieu de rester enfermé
   * dans une bulle.
   */
  score += Math.random() * 5;

  return score;
}

/* =========================================================
   DIVERSIFICATION
========================================================= */

function diversifyPosts(
  scoredPosts: any[],
  limit: number
) {
  const result: any[] = [];

  const sellerCount =
    new Map<string, number>();

  const categoryCount =
    new Map<string, number>();

  for (const item of scoredPosts) {
    if (result.length >= limit) {
      break;
    }

    const sellerId =
      item.post.userId;

    const category =
      item.post.category;

    const sellerPosts =
      sellerCount.get(sellerId) || 0;

    const categoryPosts =
      categoryCount.get(category) || 0;

    /**
     * Maximum 2 produits du même vendeur.
     */
    if (sellerPosts >= 2) {
      continue;
    }

    /**
     * Maximum 4 produits de la même
     * catégorie dans une page.
     */
    if (
      category !== "DIVERS" &&
      categoryPosts >= 4
    ) {
      continue;
    }

    result.push(item);

    sellerCount.set(
      sellerId,
      sellerPosts + 1
    );

    categoryCount.set(
      category,
      categoryPosts + 1
    );
  }

  /**
   * Compléter si nécessaire.
   */
  if (result.length < limit) {
    const ids = new Set(
      result.map((item) => item.post.id)
    );

    for (const item of scoredPosts) {
      if (result.length >= limit) {
        break;
      }

      if (ids.has(item.post.id)) {
        continue;
      }

      result.push(item);
    }
  }

  return result;
}

/* =========================================================
   API
========================================================= */

export async function GET(
  req: NextRequest
) {
  try {
    const {
      user,
    } = await validateRequest();

    const city =
      req.nextUrl.searchParams
        .get("city")
        ?.trim();

    const neighborhood =
      req.nextUrl.searchParams
        .get("neighborhood")
        ?.trim();

    const where: any = {
      ...(user
        ? {
            userId: {
              not: user.id,
            },
          }
        : {}),
    };

    /**
     * FILTRE EXPLICITE
     */
    if (city) {
      where.city = {
        equals: city,
        mode: "insensitive",
      };
    }

    if (neighborhood) {
      where.neighborhood = {
        contains: neighborhood,
        mode: "insensitive",
      };
    }

    /* =====================================================
       UTILISATEUR NON CONNECTÉ
    ===================================================== */

    if (!user) {
      const posts =
        await prisma.post.findMany({
          where,

          include:
            getPostDataInclude(),

          orderBy: {
            createdAt: "desc",
          },

          take: PAGE_SIZE,
        });

      return Response.json({
        posts,
        nextCursor: null,
      } satisfies PostsPage);
    }

    /* =====================================================
       PROFIL UTILISATEUR
    ===================================================== */

    const [
      profile,
      currentUser,
    ] = await Promise.all([
      getUserProfile(user.id),

      prisma.user.findUnique({
        where: {
          id: user.id,
        },

        select: {
          city: true,
          neighborhood: true,
        },
      }),
    ]);

    /**
     * Exclure temporairement les posts vus.
     */
    if (
      profile.recentlyViewedPostIds.length
    ) {
      where.id = {
        notIn:
          profile.recentlyViewedPostIds,
      };
    }

    /* =====================================================
       CANDIDATS
    ===================================================== */

    const candidates =
      await prisma.post.findMany({
        where,

        include:
          getPostDataInclude(user.id),

        orderBy: {
          createdAt: "desc",
        },

        take: CANDIDATE_SIZE,
      });

    /* =====================================================
       SCORING
    ===================================================== */

    const scoredPosts =
      candidates.map((post) => ({
        post,

        score: calculateScore(
          post,
          profile,
          currentUser?.city,
          currentUser?.neighborhood
        ),
      }));

    scoredPosts.sort(
      (a, b) => b.score - a.score
    );

    /* =====================================================
       DIVERSIFICATION
    ===================================================== */

    const diversified =
      diversifyPosts(
        scoredPosts,
        PAGE_SIZE
      );

    return Response.json({
      posts: diversified.map(
        (item) => item.post
      ),

      nextCursor: null,
    } satisfies PostsPage);

  } catch (error) {
    console.error(
      "ERREUR FOR YOU:",
      error
    );

    return Response.json({
      posts: [],
      nextCursor: null,
    } satisfies PostsPage);
  }
}