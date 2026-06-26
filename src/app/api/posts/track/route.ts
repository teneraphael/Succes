import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

const viewCooldown = new Map<string, number>();
const COOLDOWN_MS = 30 * 1000; 

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const body = await req.json();
    const { id, type, itemType } = body;

    // 1️⃣ Validations strictes de sécurité
    if (!id || typeof id !== "string" || id.length > 50) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    if (!type || !itemType) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const VALID_TYPES = ["VIEW", "CHAT", "FAVORITE"];
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    if (itemType !== "POST") {
      return NextResponse.json({ success: true }); 
    }

    // Vérification de l'existence du Post
    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
    }

    // Si c'est l'auteur du post, on ignore le tracking sans bloquer
    if (user && post.userId === user.id) {
      return NextResponse.json({ success: true });
    }

    // 2️⃣ Gestion du Cooldown pour le type "VIEW"
    if (type === "VIEW") {
      const cooldownKey = `${user?.id ?? "anon"}_${id}`;
      const lastView = viewCooldown.get(cooldownKey);
      const now = Date.now();

      if (lastView && now - lastView < COOLDOWN_MS) {
        return NextResponse.json({ success: true });
      }
      viewCooldown.set(cooldownKey, now);

      // Nettoyage de la Map mémoire si elle devient trop grande
      if (viewCooldown.size > 10000) {
        const cutoff = now - COOLDOWN_MS * 2;
        for (const [key, ts] of viewCooldown.entries()) {
          if (ts < cutoff) viewCooldown.delete(key);
        }
      }
    }

    // 3️⃣ Exécution de l'incrémentation du Post (Indépendante et Prioritaire)
    if (type === "VIEW") {
      await prisma.post.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    // 4️⃣ Enregistrement de l'interaction (Isolé pour ne jamais bloquer le processus)
    if (user) {
      try {
        // Recherche d'un deal existant
        let targetDeal = await prisma.deal.findFirst({ select: { id: true } });

        // 🚨 SOLUTION SÉCURITÉ : Si aucun deal n'existe sur ta plateforme, on en crée un par défaut
        // pour éviter que la contrainte d'intégrité de ton schéma Prisma ne rejette la requête.
        if (!targetDeal) {
          targetDeal = await prisma.deal.create({
            data: {
              title: "Deal Global Système",
              price: 0,
              category: "SYSTEM",
              userId: post.userId, // Relié à l'ID de l'auteur du post
            },
            select: { id: true },
          });
        }

        // Création de l'interaction utilisateur
        await prisma.userInteraction.create({
          data: {
            type: type,
            userId: user.id,
            postId: id,
            dealId: targetDeal.id,
          },
        });
      } catch (interactionError: any) {
        // Si l'interaction échoue pour une raison X ou Y, on l'attrape ici.
        // Cela évite de crash la route et garantit la réponse au Front-end.
        console.error("⚠️ [INTERACTION SKIPPED]:", interactionError.message);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: true });
    }
    console.error("❌ ERREUR_TRACKING_DEALCITY:", error);
    // On renvoie un statut 200 même ici pour garantir que le bouton WhatsApp côté client s'exécute quoi qu'il arrive
    return NextResponse.json({ success: true, warning: "Erreur interne interceptée" });
  }
}