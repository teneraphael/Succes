import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // RÉCUPÉRATION MULTIPLE EN UNE SEULE TRANSACTION
    const [userData, transactions, salesStats] = await prisma.$transaction([
      // 1. Le solde actuel
      prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      }),
      // 2. Les 15 dernières transactions (on en prend un peu plus pour le feed)
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      // 3. Statistiques de ventes globales (Optionnel mais recommandé)
      prisma.order.aggregate({
        where: { 
          sellerId: user.id,
          status: "DELIVERED" // On ne compte que ce qui est payé et livré
        },
        _sum: {
          sellerEarnings: true
        },
        _count: {
          id: true
        }
      })
    ]);

    return NextResponse.json({
      balance: userData?.balance || 0,
      transactions: transactions,
      stats: {
        totalEarnings: salesStats._sum.sellerEarnings || 0,
        totalSales: salesStats._count.id || 0
      }
    });

  } catch (error) {
    console.error("API_SELLER_STATS_ERROR", error);
    return NextResponse.json({ error: "Erreur lors du chargement des données financières" }, { status: 500 });
  }
}