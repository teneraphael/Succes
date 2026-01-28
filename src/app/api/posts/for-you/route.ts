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

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let detectedKeywords: string[] = [];

    // 1. ANALYSE DU COMPORTEMENT (Seulement au chargement de la première page)
    if (!cursor) {
      const lastInteractions = await prisma.userInteraction.findMany({
        where: { userId: user.id },
        include: { post: { select: { content: true } } },
        take: 30,
        orderBy: { createdAt: "desc" }
      });

      lastInteractions.forEach(inter => {
        if (inter.post?.content) {
          const text = inter.post.content.toLowerCase();
          
          // Définition du poids selon l'importance de l'action
          let weight = 1;
          if (inter.type === "FAVORITE") weight = 4; // Un Like/Bookmark pèse lourd
          if (inter.type === "COMMENT") weight = 3;  // Un commentaire est important

          Object.values(KEYWORDS_MAP).flat().forEach(word => {
            if (text.includes(word.toLowerCase())) {
              for (let i = 0; i < weight; i++) {
                detectedKeywords.push(word);
              }
            }
          });
        }
      });
    }

    // 2. CONSTRUCTION DE LA REQUÊTE (Avec Fallback)
    // On construit dynamiquement le filtre 'where'
    const whereClause: any = {
      NOT: {
        userId: user.id // IMPORTANT: On ne voit pas ses propres posts
      }
    };

    // Si on a des mots-clés, on active le filtrage intelligent
    // Sinon, Prisma retournera tous les posts (sauf les nôtres) par défaut
    if (detectedKeywords.length > 0) {
      // On récupère les 5 mots les plus fréquents pour ne pas surcharger la requête
      const topKeywords = Array.from(new Set(detectedKeywords)).slice(0, 5);
      
      whereClause.OR = [
        ...topKeywords.map(word => ({
          content: { contains: word, mode: 'insensitive' }
        })),
        { views: { gte: 5 } } // On inclut aussi les posts qui commencent à buzzer
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: getPostDataInclude(user.id),
      orderBy: [
        { createdAt: "desc" }, // Priorité à la nouveauté pour garder un flux frais
      ],
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error("ERREUR ALGO FOR-YOU:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}