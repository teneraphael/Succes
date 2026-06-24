import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Cooldown anti-spam en mémoire — 30s entre 2 vues du même post
const viewCooldown = new Map<string, number>();
const COOLDOWN_MS = 30 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();
    const body = await req.json();
    const { id, type, itemType } = body;

    // ✅ Validation stricte
    if (!id || typeof id !== "string" || id.length > 50) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    if (!type || !itemType) {
      return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
    }

    const VALID_TYPES = ["VIEW", "CHAT", "FAVORITE"];
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // ✅ Deals — inchangé
    if (itemType === "DEAL") {
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      await prisma.$transaction([
        prisma.userInteraction.create({
          data: { dealId: id, userId: user.id, type, postId: "" },
        }),
        prisma.deal.update({
          where: { id },
          data: { views: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    // ✅ Posts — logique enrichie
    if (itemType === "POST") {

      // Vérification existence post + propriétaire en une requête
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });

      if (!post) {
        return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
      }

      // ✅ Ignorer auto-interactions — un vendeur ne s'influence pas lui-même
      if (user && post.userId === user.id) {
        return NextResponse.json({ success: true });
      }

      const operations: any[] = [];

      if (type === "VIEW") {
        // ✅ Anti-spam cooldown 30s
        const cooldownKey = `${user?.id ?? "anon"}_${id}`;
        const lastView = viewCooldown.get(cooldownKey);
        const now = Date.now();

        if (lastView && now - lastView < COOLDOWN_MS) {
          return NextResponse.json({ success: true });
        }
        viewCooldown.set(cooldownKey, now);

        // Nettoyage Map si trop grande
        if (viewCooldown.size > 10000) {
          const cutoff = now - COOLDOWN_MS * 2;
          for (const [key, ts] of viewCooldown.entries()) {
            if (ts < cutoff) viewCooldown.delete(key);
          }
        }

        // Incrémenter les vues
        operations.push(
          prisma.post.update({
            where: { id },
            data: { views: { increment: 1 } },
          })
        );

        // Enregistrer l'interaction si connecté
        if (user) {
          operations.push(
            prisma.userInteraction.create({
              data: { postId: id, userId: user.id, type: "VIEW", dealId: "" },
            })
          );
        }
      }

      // ✅ CHAT — clic WhatsApp (signal fort x2 pour l'algorithme)
      if (type === "CHAT" && user) {
        operations.push(
          prisma.userInteraction.create({
            data: { postId: id, userId: user.id, type: "CHAT", dealId: "" },
          })
        );
      }

      // ✅ FAVORITE — like (signal très fort x3 pour l'algorithme)
      if (type === "FAVORITE" && user) {
        operations.push(
          prisma.userInteraction.create({
            data: { postId: id, userId: user.id, type: "FAVORITE", dealId: "" },
          })
        );
      }

      if (operations.length > 0) {
        await prisma.$transaction(operations);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    // ✅ Ignorer les erreurs de contrainte unique silencieusement
    if (error?.code === "P2002") {
      return NextResponse.json({ success: true });
    }
    console.error("ERREUR_TRACKING:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}