import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { $Enums } from "@prisma/client";
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

    // --- ÉTAPE 1 : ANALYSE DES GOÛTS (Uniquement si connecté) ---
    let detectedKeywords: string[] = [];

    if (user && !cursor) {
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

    // --- ÉTAPE 2 : RÉCUPÉRATION DES POSTS (Accès libre) ---
    const rawPosts = await prisma.post.findMany({
      where: user ? {
        NOT: { userId: user.id } // Un membre ne voit pas ses propres posts
      } : {}, // Un visiteur voit tout
      include: getPostDataInclude(user?.id), // user?.id sera undefined si non connecté
      orderBy: { createdAt: "desc" },
      take: pageSize * 2,
      cursor: cursor ? { id: cursor } : undefined,
    });

    if (rawPosts.length === 0) {
      return Response.json({ posts: [], nextCursor: null });
    }

    // --- ÉTAPE 3 : MÉLANGE INTELLIGENT ---
    // Si visiteur : on envoie juste les posts récents mélangés
    // Si membre : on applique l'algo recommandé
    let finalSelection: ({ user: { id: string; username: string; displayName: string; avatarUrl: string | null; bio: string | null; allowNotifications: boolean; isSeller: boolean; createdAt: Date; followers: { followerId: string; followingId: string; }[]; _count: { posts: number; followers: number; }; }; likes: { userId: string; postId: string; }[]; bookmarks: { id: string; createdAt: Date; userId: string; postId: string; }[]; _count: { likes: number; comments: number; }; attachments: { id: string; createdAt: Date; type: $Enums.MediaType; url: string; postId: string | null; }[]; } & { id: string; createdAt: Date; content: string; userId: string; category: string; views: number; })[] = [];

    if (!user || detectedKeywords.length === 0) {
      // Pour les visiteurs, on mélange simplement pour la découverte
      finalSelection = rawPosts.slice(0, pageSize).sort(() => Math.random() - 0.5);
    } else {
      const uniqueKeywords = Array.from(new Set(detectedKeywords));
      
      const recommended = rawPosts.filter(post => 
        uniqueKeywords.some(word => post.content.toLowerCase().includes(word))
      );
      
      const discovery = rawPosts.filter(post => !recommended.includes(post));

      finalSelection = [
        ...recommended.slice(0, Math.ceil(pageSize * 0.6)),
        ...discovery.slice(0, Math.floor(pageSize * 0.4))
      ];

      if (finalSelection.length < pageSize) {
        const remaining = rawPosts.filter(p => !finalSelection.includes(p));
        finalSelection = [...finalSelection, ...remaining].slice(0, pageSize);
      }
      
      finalSelection.sort(() => Math.random() - 0.5);
    }

    const nextCursor = rawPosts.length > pageSize ? rawPosts[pageSize].id : null;

    return Response.json({
      posts: finalSelection,
      nextCursor,
    });

  } catch (error) {
    console.error("ERREUR FEED PUBLIC/PRIVÉ:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}