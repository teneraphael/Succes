import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types"; // Importe ton include standard pour les posts

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor") || undefined;
    const pageSize = 10; // Nombre de posts par chargement

    let posts: string | any[] = [];

    // --- SCÉNARIO 1 : Utilisateur Connecté (Personnalisé) ---
    if (userId && !cursor) { 
      // Note: On calcule les catégories préférées surtout pour la première page
      const interactions = await prisma.userInteraction.findMany({
        where: { userId },
        include: { deal: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      const categoryScores: Record<string, number> = {};
      interactions.forEach((i) => {
        const cat = i.deal.category;
        const weight = i.type === "CHAT" ? 5 : i.type === "FAVORITE" ? 3 : 1;
        categoryScores[cat] = (categoryScores[cat] || 0) + weight;
      });

      const topCategories = Object.entries(categoryScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([c]) => c);

      posts = await prisma.post.findMany({
        where: {
          OR: [
            { category: { in: topCategories } },
            { views: { gte: 5 } }
          ]
        },
        include: getPostDataInclude(userId), // Utilise ton include habituel (user, likes, etc.)
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    } 
    
    // --- SCÉNARIO 2 : "Cold Start" ou Pagination classique ---
    if (posts.length === 0) {
      posts = await prisma.post.findMany({
        include: getPostDataInclude(userId || ""), 
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    }

    // --- GESTION DU CURSEUR POUR L'INFINITE SCROLL ---
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return NextResponse.json(data);

  } catch (error) {
    console.error("Recommendation Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}