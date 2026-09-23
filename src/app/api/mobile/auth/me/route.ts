import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        phoneNumber: true,
        city: true,
        neighborhood: true,
        isSeller: true,
        isPioneer: true,
        isVerified: true,
        businessName: true,
        businessDomain: true,
        businessEmail: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            sales: true,
          },
        },
      },
    });

    return Response.json({ user: profile });
  } catch (error) {
    console.error("Erreur mobile me:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
