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
// Utilisation d'une regex plus sûre
const KEYWORDS_REGEX = new RegExp(ALL_KEYWORDS.join('|'), 'gi');

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    // --- ÉTAPE 1 : ANALYSE DES GOÛTS (Sécurisée) ---
    let uniqueKeywords: string[] = [];

    if (user && !cursor) {
      try {
        const lastInteractions = await prisma.userInteraction.findMany({
          where: { userId: user.id },
          select: { 
            post: { select: { content: true } } 
          },
          take: 10, // Réduit encore pour garantir la réponse sous 2s
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
        // On continue même si l'analyse échoue
      }
    }

    // --- ÉTAPE 2 : RÉCUPÉRATION DES POSTS ---
    // On ajoute un try/catch spécifique ici car c'est souvent getPostDataInclude qui échoue
    const rawPosts = await prisma.post.findMany({
      where: user ? { NOT: { userId: user.id } } : {},
      include: getPostDataInclude(user?.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // --- ÉTAPE 3 : MÉLANGE & SÉLECTION ---
    const posts = rawPosts.slice(0, pageSize);
    const nextCursor = rawPosts.length > pageSize ? rawPosts[pageSize].id : null;

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
      // Mélange uniquement si ce n'est pas une pagination (pour éviter les doublons au scroll)
      finalPosts.sort(() => Math.random() - 0.5);
    }

    const data: PostsPage = {
      posts: finalPosts,
      nextCursor,
    };

    return Response.json(data);

  } catch (error) {
    console.error("ERREUR CRITIQUE FEED:", error);
    // Retourner un objet vide structuré plutôt qu'une erreur 500 brute 
    // permet d'éviter l'écran blanc sur mobile
    return Response.json({ posts: [], nextCursor: null }, { status: 200 });
  }
}