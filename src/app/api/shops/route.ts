import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const shops = await prisma.user.findMany({
      where: {
        isSeller: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        businessName: true,
        businessDomain: true,
        city: true,
        neighborhood: true,
        avatarUrl: true,
        coverUrl: true,
        _count: {
          select: {
            followers: true,
          },
        },
        posts: {
          take: 2,
          orderBy: {
            createdAt: "desc", // Tri par récence (plus sûr si les likes complexes bloquent)
          },
          select: {
            id: true,
            content: true,
            thumbnailUrl: true, // Si vous avez une miniature
            attachments: {      // Utilisation des pièces jointes / médias liés au post
              select: {
                url: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json(shops, { status: 200 });
  } catch (error) {
    console.error("Erreur API shops:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}