import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { POST as trackPost } from "@/app/api/interactions/route";
import { NextRequest, NextResponse } from "next/server";

// Conserve le suivi historique des deals ; les posts passent par la route commune.
export async function POST(req: NextRequest) {
  const body = await req.clone().json();
  if (body.itemType !== "DEAL") return trackPost(req);
  const { user } = await validateRequest();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (typeof body.id !== "string" || !body.id ||
      !["VIEW", "CHAT", "FAVORITE"].includes(body.type)) {
    return NextResponse.json({ error: "Interaction invalide" }, { status: 400 });
  }
  try {
    await prisma.$transaction(async (tx) => {
      if (body.type === "VIEW") {
        await tx.deal.update({ where: { id: body.id }, data: { views: { increment: 1 } } });
      }
      await tx.userInteraction.create({ data: { userId: user.id, dealId: body.id, type: body.type } });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur interaction deal:", error);
    return NextResponse.json({ error: "Interaction impossible" }, { status: 500 });
  }
}
