import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, type, itemType } = await req.json(); // itemType: "POST" ou "DEAL"

    if (itemType === "POST") {
      await prisma.$transaction([
        prisma.userInteraction.create({
          data: { postId: id, userId: user.id, type, dealId: "" }, // On laisse dealId vide
        }),
        prisma.post.update({
          where: { id },
          data: { views: { increment: 1 } },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.userInteraction.create({
          data: { dealId: id, userId: user.id, type, postId: "" },
        }),
        prisma.deal.update({
          where: { id },
          data: { views: { increment: 1 } },
        }),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}