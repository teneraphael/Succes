import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const sellerData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        balance: true,
        isSeller: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10, // On prend les 10 dernières
        },
      },
    });

    return Response.json(sellerData);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}