import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // On ne récupère que le strict nécessaire pour le système de Boost
    const [userData, postStats] = await prisma.$transaction([
      // 1. Uniquement le solde (utilisé pour les Boosts)
      prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true }, // Ici "balance" représente tes crédits Boost
      }),
      
      // 2. Statistiques d'activité pour le dashboard
      prisma.post.aggregate({
        where: { userId: user.id },
        _count: {
          id: true, // Nombre d'articles en ligne
        }
      })
    ]);

    // On récupère aussi le total des likes pour la carte "Intérêt"
    const totalLikes = await prisma.like.count({
      where: {
        post: { userId: user.id }
      }
    });

    return NextResponse.json({
      soldeBoost: userData?.balance || 0,
      stats: {
        totalArticles: postStats._count.id || 0,
        totalLikes: totalLikes || 0
      }
    });

  } catch (error) {
    console.error("API_BOOST_STATS_ERROR", error);
    return NextResponse.json({ error: "Erreur lors du chargement du solde Boost" }, { status: 500 });
  }
}