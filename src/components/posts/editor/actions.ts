"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

const ADMIN_IDS = ["22lmc64bcqwsqybu"]; 
const ADMIN_USERNAMES = ["dealcity"];

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  stock: number; // 📦 Reçu depuis useSubmitPostMutation
  targetUserId?: string; 
}) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Non autorisé : Veuillez vous connecter.");

  // Validation Zod de la structure de base. 
  // Note : Si tu mets à jour createPostSchema avec z.object({ ..., stock: z.number() }), 
  // la déstructuration ci-dessous le prendra en charge automatiquement.
  const { content, mediaIds } = createPostSchema.parse({
    content: input.content,
    mediaIds: input.mediaIds,
  });

  const isAdmin = ADMIN_IDS.includes(loggedInUser.id) || ADMIN_USERNAMES.includes(loggedInUser.username);
  
  const finalAuthorId = (isAdmin && input.targetUserId && input.targetUserId !== "me")
    ? input.targetUserId
    : loggedInUser.id;

  // Sécurité : On s'assure d'avoir un entier positif ou nul
  // On utilise input.stock par défaut si le schéma Zod ne l'extrait pas encore
  const rawStock = input.stock !== undefined ? input.stock : 1;
  const validatedStock = Math.max(0, Math.floor(rawStock));

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: finalAuthorId,
      stock: validatedStock, // 👈 Enregistrement définitif de la quantité dans Prisma
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(loggedInUser.id),
  });

  return newPost;
}