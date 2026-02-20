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

// On pré-compile une RegEx pour la recherche ultra-rapide
const ALL_KEYWORDS = Object.values(KEYWORDS_MAP).flat().map(w => w.toLowerCase());
const KEYWORDS_REGEX = new RegExp(ALL_KEYWORDS.join('|'), 'i');

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    // --- ÉTAPE 1 : ANALYSE DES GOÛTS (Optimisée) ---
    let uniqueKeywords: string[] = [];

    // On ne fait l'analyse que pour la première page pour gagner du temps
    if (user && !cursor) {
      const lastInteractions = await prisma.userInteraction.findMany({
        where: { userId: user.id },
        select: { 
          type: true, 
          post: { select: { content: true } } 
        },
        take: 15, // Réduit de 30 à 15 pour la vitesse
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
    }

    // --- ÉTAPE 2 : RÉCUPÉRATION DES POSTS ---
    const rawPosts = await prisma.post.findMany({
      where: user ? { NOT: { userId: user.id } } : {},
      include: getPostDataInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1, // On prend juste 1 de plus pour le curseur
      cursor: cursor ? { id: cursor } : undefined,
    });

    // --- ÉTAPE 3 : MÉLANGE & SÉLECTION ---
    let posts = rawPosts.slice(0, pageSize);
    const nextCursor = rawPosts.length > pageSize ? rawPosts[pageSize].id : null;

    if (user && uniqueKeywords.length > 0 && !cursor) {
      // Tri intelligent uniquement sur la première page
      posts.sort((a, b) => {
        const aMatch = uniqueKeywords.some(word => a.content.toLowerCase().includes(word)) ? 1 : 0;
        const bMatch = uniqueKeywords.some(word => b.content.toLowerCase().includes(word)) ? 1 : 0;
        return bMatch - aMatch;
      });
    } else {
      // Simple mélange pour la découverte
      posts = posts.sort(() => Math.random() - 0.5);
    }

    return Response.json({
      posts,
      nextCursor,
    });

  } catch (error) {
    console.error("ERREUR FEED:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}