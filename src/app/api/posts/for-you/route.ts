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

    // 1. ANALYSE DU COMPORTEMENT
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
          let weight = 1;
          if (inter.type === "FAVORITE") weight = 4;
          if (inter.type === "COMMENT") weight = 3;

          Object.values(KEYWORDS_MAP).flat().forEach(word => {
            if (text.includes(word.toLowerCase())) {
              for (let i = 0; i < weight; i++) {
                detectedKeywords.push(word.toLowerCase());
              }
            }
          });
        }
      });
    }

    // 2. RÉCUPÉRATION HYBRIDE (On prend plus de posts pour pouvoir mixer)
    const rawPosts = await prisma.post.findMany({
      where: {
        NOT: { userId: user.id }
      },
      include: getPostDataInclude(user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize * 2, // On en prend 20 pour en choisir 10 variés
      cursor: cursor ? { id: cursor } : undefined,
    });

    if (rawPosts.length === 0) {
      return Response.json({ posts: [], nextCursor: null });
    }

    // 3. LOGIQUE DE MÉLANGE (ALGO CIBLÉ vs DÉCOUVERTE)
    const uniqueKeywords = Array.from(new Set(detectedKeywords));
    
    // On sépare les posts qui matchent les goûts des posts "Discovery"
    const recommended = rawPosts.filter(post => 
      uniqueKeywords.some(word => post.content.toLowerCase().includes(word))
    );
    
    const discovery = rawPosts.filter(post => !recommended.includes(post));

    // On compose notre sélection finale (ex: 60% recommandé, 40% discovery)
    // Cela évite la répétition infinie d'un seul sujet.
    let finalSelection = [
      ...recommended.slice(0, Math.ceil(pageSize * 0.6)),
      ...discovery.slice(0, Math.floor(pageSize * 0.4))
    ];

    // Si on n'a pas assez de posts après le mix (ex: pas de discovery), on complète avec le reste
    if (finalSelection.length < pageSize) {
      const remaining = rawPosts.filter(p => !finalSelection.includes(p));
      finalSelection = [...finalSelection, ...remaining].slice(0, pageSize);
    }

    // 4. RANDOMISATION DE L'ORDRE (Shuffle)
    // Pour que le feed ne soit pas figé par date uniquement
    finalSelection.sort(() => Math.random() - 0.5);

    const nextCursor = rawPosts.length > pageSize ? rawPosts[pageSize].id : null;

    const data: PostsPage = {
      posts: finalSelection,
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error("ERREUR ALGO HYBRIDE:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}