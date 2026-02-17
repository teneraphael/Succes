"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getCommentDataInclude, PostData } from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";
import { sendPushNotification } from "@/lib/push-notifications";
import { UTApi } from "uploadthing/server"; // Ajout de l'API UploadThing

const utapi = new UTApi();

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

  // --- LOGIQUE D'UPLOAD RÉELLE ---
  let mediaUrl: string | null = null;
  
  if (media instanceof File) {
    try {
      const uploadResult = await utapi.uploadFiles(media);
      if (uploadResult.data) {
        mediaUrl = uploadResult.data.url; // On récupère l'URL générée
      }
    } catch (error) {
      console.error("Erreur UploadThing:", error);
      // Optionnel: on peut continuer sans image ou stopper ici
    }
  }

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

  const [newComment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: loggedInUser.id,
        mediaUrl: mediaUrl, // L'URL est maintenant sauvegardée !
      },
      include: getCommentDataInclude(loggedInUser.id),
    }),
    ...(recipientId !== loggedInUser.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: loggedInUser.id,
              recipientId: recipientId,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  // Notifications...
  if (recipientId !== loggedInUser.id) {
    const title = mentionedUsername ? "Nouvelle réponse ! ↩️" : "Nouveau commentaire ! 💬";
    const body = mentionedUsername
      ? `${loggedInUser.displayName} vous a répondu.`
      : `${loggedInUser.displayName} a commenté votre post.`;
    sendPushNotification(recipientId, title, body, `/posts/${post.id}`);
  }

  return newComment;
}
// ... garde deleteComment identique
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