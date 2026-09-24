import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = new Set([
  "IMPRESSION", "VIEW", "LIKE", "FAVORITE", "CHAT", "COMMENT",
  "PROFILE_VIEW", "ORDER_STARTED", "ORDER_COMPLETED",
]);
const VIEW_COOLDOWN_MS = 30_000;
const guestViews = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const postId = body.postId ?? body.id;
    const { type, duration, metadata } = body;
    if (body.itemType && body.itemType !== "POST") {
      return NextResponse.json({ error: "Type de contenu invalide" }, { status: 400 });
    }
    if (typeof postId !== "string" || !postId || postId.length > 100 ||
        typeof type !== "string" || !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Interaction invalide" }, { status: 400 });
    }

    const { user } = await validateRequest();
    const post = await prisma.post.findUnique({
      where: { id: postId }, select: { userId: true },
    });
    if (!post) return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });
    if (user?.id === post.userId) return NextResponse.json({ success: true, skipped: true });

    if (type === "VIEW" && !user) {
      // Identifie les visiteurs anonymes par navigateur, sans regrouper tous les invités.
      const storedVisitorId = req.cookies.get("dc_visitor")?.value;
      const visitorId = storedVisitorId && /^[0-9a-f-]{36}$/i.test(storedVisitorId)
        ? storedVisitorId : randomUUID();
      const key = `${visitorId}:${postId}`;
      const now = Date.now();
      const last = guestViews.get(key);
      const response = NextResponse.json({ success: true, skipped: !!last && now - last < VIEW_COOLDOWN_MS });
      if (visitorId !== storedVisitorId) {
        response.cookies.set("dc_visitor", visitorId, {
          httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365, path: "/",
        });
      }
      if (last && now - last < VIEW_COOLDOWN_MS) return response;
      guestViews.set(key, now);
      if (guestViews.size > 10_000) {
        for (const [id, timestamp] of guestViews) {
          if (timestamp < now - VIEW_COOLDOWN_MS) guestViews.delete(id);
        }
      }
      try {
        await prisma.post.update({ where: { id: postId }, data: { views: { increment: 1 } } });
      } catch (error) {
        guestViews.delete(key);
        throw error;
      }
      return response;
    }

    if (!user) return NextResponse.json({ success: true, skipped: true });

    const safeDuration = typeof duration === "number" && Number.isFinite(duration)
      ? Math.min(3600, Math.max(0, Math.floor(duration))) : null;
    const safeMetadata = metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? metadata : undefined;

    if (type === "VIEW") {
      // Une transaction sérialisable empêche deux requêtes simultanées de compter deux vues.
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const counted = await prisma.$transaction(async (tx) => {
            const recent = await tx.userInteraction.findFirst({
              where: { userId: user.id, postId, type: "VIEW",
                createdAt: { gte: new Date(Date.now() - VIEW_COOLDOWN_MS) } },
              select: { id: true },
            });
            if (recent) return false;
            await tx.userInteraction.create({
              data: { userId: user.id, postId, type, duration: safeDuration, metadata: safeMetadata },
            });
            await tx.post.update({ where: { id: postId }, data: { views: { increment: 1 } } });
            return true;
          }, { isolationLevel: "Serializable" });
          return NextResponse.json({ success: true, skipped: !counted });
        } catch (error: any) {
          if (error?.code === "P2034" && attempt < 2) continue;
          throw error;
        }
      }
    }

    await prisma.userInteraction.create({
      data: { userId: user.id, postId, type, duration: safeDuration, metadata: safeMetadata },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur interaction DealCity:", error);
    return NextResponse.json({ error: "Impossible d'enregistrer l'interaction" }, { status: 500 });
  }
}
