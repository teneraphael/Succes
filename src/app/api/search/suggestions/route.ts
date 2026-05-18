import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  try {
    // CAS 1 : L'UTILISATEUR TAPE DU TEXTE
    if (q && q.trim() !== "") {
      const cleanQuery = q.trim().toLowerCase();

      // 1. On récupère TOUS les posts récents qui contiennent un produit (très rapide)
      const posts = await prisma.post.findMany({
        where: {
          content: {
            contains: "PRODUIT", // Filtre ultra-large pour ne rien rater côté MySQL
          },
        },
        select: {
          content: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100, // On prend une bonne marge
      });

      // 2. Extraction des noms de produits via la Regex
      const suggestions = posts
        .map((post) => {
          // Gère les variations d'émojis ou d'espaces autour du mot PRODUIT
          const productMatch = post.content.match(/PRODUIT\s*:\s*(.*)/i);
          return productMatch ? productMatch[1].split("\n")[0].trim() : null;
        })
        .filter((name): name is string => name !== null && name !== "");

      // 3. FILTRAGE STRICT EN JAVASCRIPT (Insensible à la casse/Majuscules)
      const filteredSuggestions = suggestions.filter((productName) =>
        productName.toLowerCase().includes(cleanQuery)
      );

      // 4. Nettoyage des doublons et limite à 6 résultats
      const uniqueSuggestions = Array.from(new Set(filteredSuggestions)).slice(0, 6);
      
      return NextResponse.json({ type: "suggestions", data: uniqueSuggestions });
    }

    // CAS 2 : LE CHAMP EST VIDE -> VRAIES TENDANCES
    const popularPosts = await prisma.post.findMany({
      where: {
        content: {
          contains: "PRODUIT",
        },
      },
      select: {
        content: true,
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: [
        { bookmarks: { _count: "desc" } },
        { likes: { _count: "desc" } },
      ],
      take: 50,
    });

    const trendingProducts = popularPosts
      .map((post) => {
        const productMatch = post.content.match(/PRODUIT\s*:\s*(.*)/i);
        return productMatch ? productMatch[1].split("\n")[0].trim() : null;
      })
      .filter((name): name is string => name !== null && name !== "");

    const uniqueTrends = Array.from(new Set(trendingProducts)).slice(0, 5);

    return NextResponse.json({ type: "trends", data: uniqueTrends });

  } catch (error) {
    console.error("Erreur d'extraction des données SQL:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}