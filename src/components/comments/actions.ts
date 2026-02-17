"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { sendPushNotification } from "@/lib/push-notifications";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
const COST_COMMENT = 25; // Prix par commentaire reçu pour le vendeur

export async function submitComment({
  post,
  content,
  media,
}: {
  post: PostData;
  content: string;
  media?: File | null;
}) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  // 1. VÉRIFICATION DU FORFAIT DU VENDEUR (Propriétaire du post)
  // On ne vérifie que si le post appartient à un vendeur et que ce n'est pas lui qui commente
  const isOwner = loggedInUser.id === post.user.id;
  
  if (!isOwner && post.user.isSeller) {
    // On récupère le solde frais depuis la DB pour être sûr
    const seller = await prisma.user.findUnique({
      where: { id: post.user.id },
      select: { balance: true }
    });

    if (!seller || (seller.balance ?? 0) < COST_COMMENT) {
      throw new Error("FORFAIT_EPUISE"); // On envoie un code d'erreur spécifique
    }
  }

  // 2. LOGIQUE D'UPLOAD
  let mediaUrl: string | null = null;
  if (media instanceof File) {
    try {
      const uploadResult = await utapi.uploadFiles(media);
      if (uploadResult.data) {
        mediaUrl = uploadResult.data.url;
      }
    } catch (error) {
      console.error("Erreur UploadThing:", error);
    }
  }

  // 3. GESTION DES MENTIONS
  const mentionMatch = contentValidated.match(/^@(\w+)/);
  const mentionedUsername = mentionMatch ? mentionMatch[1] : null;
  let recipientId = post.user.id;

  if (mentionedUsername) {
    const mentionedUser = await prisma.user.findUnique({
      where: { username: mentionedUsername },
      select: { id: true },
    });
    if (mentionedUser) recipientId = mentionedUser.id;
  }

  // 4. TRANSACTION FINANCIÈRE ET CRÉATION
  const newComment = await prisma.$transaction(async (tx) => {
    // Créer le commentaire
    const comment = await tx.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: loggedInUser.id,
        mediaUrl: mediaUrl,
      },
      include: getCommentDataInclude(loggedInUser.id),
    });

    // Si ce n'est pas le proprio, on gère les notifications et le débit
    if (recipientId !== loggedInUser.id) {
      // Création notification
      await tx.notification.create({
        data: {
          issuerId: loggedInUser.id,
          recipientId: recipientId,
          postId: post.id,
          type: "COMMENT",
        },
      });

      // DÉBIT DU VENDEUR (Seulement si c'est le proprio du post qui est visé)
      if (recipientId === post.user.id && post.user.isSeller) {
        await tx.user.update({
          where: { id: post.user.id },
          data: { balance: { decrement: COST_COMMENT } }
        });

        // Historique de transaction
        await tx.transaction.create({
          data: {
            userId: post.user.id,
            amount: -COST_COMMENT,
            reason: `COMMENT_RECEIVED_FROM_${loggedInUser.username}`,
          }
        });
      }
    }

    return comment;
  });

  // 5. ENVOI PUSH
  if (recipientId !== loggedInUser.id) {
    const title = mentionedUsername ? "Nouvelle réponse ! ↩️" : "Nouveau commentaire ! 💬";
    const body = mentionedUsername
      ? `${loggedInUser.displayName} vous a répondu.`
      : `${loggedInUser.displayName} a commenté votre post.`;
    sendPushNotification(recipientId, title, body, `/posts/${post.id}`);
  }

  return newComment;
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new Error("Comment not found");
  if (comment.userId !== user.id) throw new Error("Unauthorized");

  return await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });
}