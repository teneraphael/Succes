"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

const ADMIN_IDS = ["4yq76ntw6lpduptd"]; 
const ADMIN_USERNAMES = ["Tene"];

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  audioId?: string; 
  targetUserId?: string; 
}) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Non autorisé : Veuillez vous connecter.");

  const { content, mediaIds } = createPostSchema.parse({
    content: input.content,
    mediaIds: input.mediaIds,
  });

  const isAdmin = ADMIN_IDS.includes(loggedInUser.id) || ADMIN_USERNAMES.includes(loggedInUser.username);
  
  const finalAuthorId = (isAdmin && input.targetUserId && input.targetUserId !== "me")
    ? input.targetUserId
    : loggedInUser.id;

  // --- NOUVELLE LOGIQUE POUR L'AUDIO ---
  let audioUrl = null;
  
  // Si un audioId est fourni, on va chercher l'URL correspondante dans la table Media
  if (input.audioId) {
    const audioMedia = await prisma.media.findUnique({
      where: { id: input.audioId },
      select: { url: true }
    });
    audioUrl = audioMedia?.url;
  }

  // Création du post
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: finalAuthorId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
      // On utilise les champs existants dans ton schéma Prisma
      audioUrl: audioUrl,
      audioTitle: "Son original", // Tu pourras dynamiser ceci plus tard si tu le souhaites
    },
    include: getPostDataInclude(loggedInUser.id),
  });

  return newPost;
}