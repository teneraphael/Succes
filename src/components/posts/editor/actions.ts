"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

/**
 * 🛡️ CONFIGURATION ADMIN
 * Remplace par tes identifiants réels pour une sécurité maximale.
 * On vérifie l'ID Prisma pour éviter toute usurpation par changement de username.
 */
const ADMIN_IDS = ["4yq76ntw6lpduptd"]; 
const ADMIN_USERNAMES = ["Tene"];

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
  targetUserId?: string; 
}) {
  // 1. Vérification de l'authentification
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) throw new Error("Non autorisé : Veuillez vous connecter.");

  // 2. Validation du contenu via Zod
  const { content, mediaIds } = createPostSchema.parse({
    content: input.content,
    mediaIds: input.mediaIds,
  });

  // 3. Logique de Substitution (Curateur/Admin)
  // On vérifie si l'utilisateur actuel a le droit de poster pour quelqu'un d'autre
  const isAdmin = ADMIN_IDS.includes(loggedInUser.id) || ADMIN_USERNAMES.includes(loggedInUser.username);
  
  // Si targetUserId est présent ET que l'utilisateur est admin, on utilise targetUserId.
  // Sinon, on utilise l'ID de l'utilisateur connecté.
  const finalAuthorId = (isAdmin && input.targetUserId && input.targetUserId !== "me")
    ? input.targetUserId
    : loggedInUser.id;

  // 4. Création du post dans la base de données
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: finalAuthorId,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    // On inclut les données nécessaires pour mettre à jour le cache React Query immédiatement
    include: getPostDataInclude(loggedInUser.id),
  });

  return newPost;
}