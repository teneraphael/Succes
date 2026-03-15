import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer le solde et les 10 dernières transactions
    const [userData, transactions] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      balance: userData?.balance || 0,
      transactions: transactions,
    });
  } catch (error) {
    console.error("API_SELLER_STATS_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}