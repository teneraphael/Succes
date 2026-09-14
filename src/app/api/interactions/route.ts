import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

const VALID_TYPES = [
  "IMPRESSION",
  "VIEW",
  "LIKE",
  "FAVORITE",
  "CHAT",
  "PROFILE_VIEW",
  "ORDER_STARTED",
  "ORDER_COMPLETED",
] as const;

type ValidInteractionType =
  (typeof VALID_TYPES)[number];

/**
 * Anti-spam des vues :
 * une vue par utilisateur/post toutes les 30 secondes.
 */
const VIEW_COOLDOWN_MS = 30 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { user } = await validateRequest();

    /**
     * Pour le moment, les interactions
     * nécessitent un utilisateur connecté.
     */
    if (!user) {
      return Response.json(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    const body = await req.json();

    const {
      postId,
      type,
      duration,
      metadata,
    } = body;

    /* ================================
       1. VALIDATION
    ================================= */

    if (
      !postId ||
      typeof postId !== "string"
    ) {
      return Response.json(
        { error: "postId requis" },
        { status: 400 },
      );
    }

    if (
      typeof type !== "string" ||
      !VALID_TYPES.includes(
        type as ValidInteractionType,
      )
    ) {
      return Response.json(
        {
          error:
            "Type d'interaction invalide",
        },
        { status: 400 },
      );
    }

    const interactionType =
      type as ValidInteractionType;

    /* ================================
       2. VÉRIFIER LE POST
    ================================= */

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!post) {
      return Response.json(
        {
          error: "Publication introuvable",
        },
        { status: 404 },
      );
    }

    /* ================================
       3. IGNORER L'AUTEUR
    ================================= */

    /**
     * Le vendeur ne doit pas influencer
     * l'algorithme sur ses propres produits.
     */
    if (post.userId === user.id) {
      return Response.json({
        success: true,
        skipped: true,
      });
    }

    /* ================================
       4. ANTI-SPAM DES VUES
    ================================= */

    if (interactionType === "VIEW") {
      const recentView =
        await prisma.userInteraction.findFirst({
          where: {
            userId: user.id,
            postId,
            type: "VIEW",

            createdAt: {
              gte: new Date(
                Date.now() - VIEW_COOLDOWN_MS,
              ),
            },
          },

          select: {
            id: true,
          },
        });

      /**
       * L'utilisateur a déjà regardé
       * ce produit récemment.
       */
      if (recentView) {
        return Response.json({
          success: true,
          skipped: true,
        });
      }
    }

    /* ================================
       5. TRANSACTION
    ================================= */

    /**
     * Pour une VIEW :
     *
     * 1. On incrémente le compteur public.
     * 2. On enregistre l'interaction.
     *
     * La transaction évite d'avoir une vue
     * comptée sans interaction enregistrée.
     */
    if (interactionType === "VIEW") {
      await prisma.$transaction([
        prisma.post.update({
          where: {
            id: postId,
          },

          data: {
            views: {
              increment: 1,
            },
          },
        }),

        prisma.userInteraction.create({
          data: {
            userId: user.id,
            postId,
            type: interactionType,

            duration:
              typeof duration === "number"
                ? Math.max(
                    0,
                    Math.floor(duration),
                  )
                : null,

            metadata:
              metadata &&
              typeof metadata === "object"
                ? metadata
                : undefined,
          },
        }),
      ]);

      return Response.json({
        success: true,
      });
    }

    /* ================================
       6. AUTRES INTERACTIONS
    ================================= */

    await prisma.userInteraction.create({
      data: {
        userId: user.id,
        postId,
        type: interactionType,

        duration:
          typeof duration === "number"
            ? Math.max(
                0,
                Math.floor(duration),
              )
            : null,

        metadata:
          metadata &&
          typeof metadata === "object"
            ? metadata
            : undefined,
      },
    });

    return Response.json({
      success: true,
    });

  } catch (error) {
    console.error(
      "❌ Erreur interaction DealCity:",
      error,
    );

    return Response.json(
      {
        success: false,
        error:
          "Impossible d'enregistrer l'interaction",
      },
      {
        status: 500,
      },
    );
  }
}