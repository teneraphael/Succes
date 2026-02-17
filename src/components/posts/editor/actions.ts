"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

// 🛡️ TON ID UNIQUE PRISMA (Remplace par le tien)
const MY_ADMIN_ID = "44ttt3ikxntqkxnh"; 

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  targetUserId?: string; // ✅ Ajouté pour accepter l'ID du vendeur
}) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) throw new Error("Unauthorized");

  // Validation du contenu (le schéma ignore targetUserId, c'est normal)
  const { content, mediaIds } = createPostSchema.parse(input);

  // --- LOGIQUE DE DISCERNEMENT SÉCURISÉE ---
  // On ne permet la substitution QUE si l'ID de la session est le TIEN
  const finalAuthorId = (loggedInUser.id === MY_ADMIN_ID && input.targetUserId)
    ? input.targetUserId
    : loggedInUser.id;

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: finalAuthorId, // ✅ Le post appartient maintenant au vendeur choisi (si c'est toi qui postes)
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(loggedInUser.id),
  });

  return newPost;
}