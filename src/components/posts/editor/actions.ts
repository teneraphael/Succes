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
  audioUrl?: string;     // Modifié : on reçoit l'URL directement
  audioTitle?: string;   // Modifié : on reçoit le titre
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

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: finalAuthorId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
      audioUrl: input.audioUrl,
      audioTitle: input.audioTitle,
    },
    include: getPostDataInclude(loggedInUser.id),
  });

  return newPost;
}