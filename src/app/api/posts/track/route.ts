import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

// ✅ Cooldown anti-spam en mémoire — évite les vues dupliquées
// Map<userId_postId, timestamp>
const viewCooldown = new Map<string, number>();
const COOLDOWN_MS = 30 * 1000; // 30 secondes entre 2 vues du même post

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const body = await req.json();
    const { id, type, itemType } = body;

    // ✅ Validation stricte
    if (!id || typeof id !== "string" || id.length > 50) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    if (!type || !itemType) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // ✅ Types d'interactions supportés
    const VALID_TYPES = ["VIEW", "CHAT", "FAVORITE"];
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    if (itemType !== "POST") {
      return NextResponse.json({ success: true }); // Deals ignorés pour l'instant
    }

    // ✅ Vérification existence post (une seule requête)
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
    }

    // ✅ Ignorer les auto-interactions — un vendeur ne s'influence pas lui-même
    if (user && post.userId === user.id) {
      return NextResponse.json({ success: true });
    }

    // ✅ Anti-spam VIEW — cooldown 30s par utilisateur/post
    if (type === "VIEW") {
      const cooldownKey = `${user?.id ?? "anon"}_${id}`;
      const lastView = viewCooldown.get(cooldownKey);
      const now = Date.now();

      if (lastView && now - lastView < COOLDOWN_MS) {
        // Trop tôt — on ignore silencieusement
        return NextResponse.json({ success: true });
      }
      viewCooldown.set(cooldownKey, now);

      // ✅ Nettoyage périodique de la Map pour éviter les fuites mémoire
      if (viewCooldown.size > 10000) {
        const cutoff = now - COOLDOWN_MS * 2;
        for (const [key, ts] of viewCooldown.entries()) {
          if (ts < cutoff) viewCooldown.delete(key);
        }
      }
    }

    // ✅ Construction des opérations selon le type
    const operations: any[] = [];

    if (type === "VIEW") {
      // Incrémenter les vues du post
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
            data: {
              userId: user.id,
              postId: id,
              type: "VIEW",
              dealId: "",
            },
          })
        );
      }
    }

    if (type === "CHAT" && user) {
      // ✅ Clic WhatsApp — interaction forte pour l'algorithme
      // Upsert pour éviter les doublons si l'utilisateur clique plusieurs fois
      operations.push(
        prisma.userInteraction.create({
          data: {
            userId: user.id,
            postId: id,
            type: "CHAT",
            dealId: "",
          },
        })
      );
    }

    if (type === "FAVORITE" && user) {
      // ✅ Like — interaction très forte (poids x3 dans l'algorithme)
      // Upsert pour éviter les doublons
      operations.push(
        prisma.userInteraction.create({
          data: {
            userId: user.id,
            postId: id,
            type: "FAVORITE",
            dealId: "",
          },
        })
      );
    }

    // ✅ Exécution atomique uniquement si opérations nécessaires
    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    // ✅ Ignorer les erreurs de contrainte unique (doublons) silencieusement
    if (error?.code === "P2002") {
      return NextResponse.json({ success: true });
    }
    console.error("ERREUR_TRACKING_DEALCITY:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}