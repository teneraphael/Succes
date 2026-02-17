export const dynamic = "force-dynamic";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
import { sendPushNotification } from "@/lib/push-notifications";

// Configuration du coût (Tu peux aussi l'importer depuis un fichier config)
const COST_LIKE = 10; 

export async function GET(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: {
          where: { userId: loggedInUser.id },
          select: { userId: true },
        },
        _count: {
          select: { likes: true },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupération du post avec les données du vendeur (user)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        userId: true,
        content: true,
        user: { 
          select: { 
            balance: true, 
            isSeller: true,
            displayName: true 
          } 
        }
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const isOwner = loggedInUser.id === post.userId;
    
    // --- VÉRIFICATION DU FORFAIT ---
    // On ne débite que si l'auteur est un vendeur et que ce n'est pas son propre like
    if (!isOwner && post.user.isSeller) {
      const currentBalance = post.user.balance ?? 0;
      if (currentBalance < COST_LIKE) {
        return Response.json(
          { error: "Le forfait de ce vendeur est épuisé." }, 
          { status: 403 }
        );
      }
    }

    // --- TRANSACTION ATOMIQUE ---
    await prisma.$transaction(async (tx) => {
      // 1. Créer le Like (Upsert pour éviter les doublons)
      await tx.like.upsert({
        where: { userId_postId: { userId: loggedInUser.id, postId } },
        create: { userId: loggedInUser.id, postId },
        update: {},
      });

      // Actions uniquement si ce n'est pas le propriétaire qui like
      if (!isOwner) {
        // 2. Débiter le vendeur si applicable
        if (post.user.isSeller) {
          await tx.user.update({
            where: { id: post.userId },
            data: { balance: { decrement: COST_LIKE } }
          });

          // 3. Créer une trace dans l'historique des transactions
          await tx.transaction.create({
            data: {
              userId: post.userId,
              amount: -COST_LIKE,
              reason: `LIKE_RECEIVED_FROM_${loggedInUser.username}`,
            }
          });
        }

        // 4. Créer la notification système
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: post.userId,
            postId,
            type: "LIKE",
          },
        });
      }
    });

    // --- NOTIFICATION PUSH ---
    if (!isOwner) {
      sendPushNotification(
        post.userId,
        "Nouveau Like ! ❤️",
        `${loggedInUser.displayName} a aimé votre annonce : "${post.content.slice(0, 25)}..."`
      ).catch(e => console.error("Push notification error:", e));
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Like Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    // Suppression du Like et de la notification associée
    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { userId: loggedInUser.id, postId },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: loggedInUser.id,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}