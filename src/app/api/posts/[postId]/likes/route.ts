import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeInfo } from "@/lib/types";
// 🚨 Import de la nouvelle fonction d'envoi
import { sendNotificationToUser } from "@/lib/notifications"; 

// -------------------------------------------------------------------
// FONCTION GET (Vérification du statut Like)
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// FONCTION POST (Création du Like et Envoi du Push)
// -------------------------------------------------------------------
export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupération de l'ID du propriétaire du post ET de ses infos (fcmToken, displayName)
    const post = await prisma.post.findUnique({
      where: { id: postId },
select: {
        userId: true, // ID du destinataire
        user: { // Relation pour accéder aux données du propriétaire
            select: { 
                fcmToken: true, // OK, ce champ est dans le schéma
                // 🚨 CORRECTION ICI : Utilisation de displayName à la place de name
                displayName: true
            } 
        }
      },
    });

    if (!post || !post.user) {
      return Response.json({ error: "Post not found or user data missing" }, { status: 404 });
    }

const postOwnerId = post.userId;
    const isSelfLike = loggedInUser.id === postOwnerId;

    // 1. Transaction Prisma pour le Like et l'enregistrement dans la table Notification
    await prisma.$transaction([
      prisma.like.upsert({
        where: {
          userId_postId: {
            userId: loggedInUser.id,
            postId,
          },
        },
        create: {
          userId: loggedInUser.id,
          postId,
        },
 update: {},
      }),
      ...(!isSelfLike
        ? [
            prisma.notification.create({
              data: {
                issuerId: loggedInUser.id,
                recipientId: postOwnerId,
                postId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    // 2. Envoi de la notification PUSH FCM
    if (!isSelfLike) {
        const recipientToken = post.user.fcmToken;
        // Le nom de l'émetteur (la personne qui a liké)
        const likerDisplayName = loggedInUser.displayName;
 if (recipientToken) {
            await sendNotificationToUser(
                recipientToken, 
                "Nouveau J'aime (Like) !",
                // Utilisation du displayName de l'utilisateur connecté
                `${likerDisplayName || 'Un utilisateur'} a aimé votre publication.`,
                `/posts/${postId}` 
            );
        }
    }
    
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


// // FONCTION DELETE (Suppression du Like)
// -------------------------------------------------------------------
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

    // Suppression du Like et de l'entrée Notification associée
    await prisma.$transaction([
      prisma.like.deleteMany({
        where: {
          userId: loggedInUser.id,
          postId,
        },
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
