"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

const ADMIN_IDS = ["22lmc64bcqwsqybu"]; 
const ADMIN_USERNAMES = ["dealcity"];

interface DynamicAttributeInput {
  name: string;
  values: string[];
}

interface SubmitPostInput {
  content: string;
  mediaIds: string[];
  stock: number;
  targetUserId?: string;
  attributes?: DynamicAttributeInput[];
}

function generateCombinations(attributes: DynamicAttributeInput[]) {
  if (!attributes || attributes.length === 0) return [];
  
  const validAttrs = attributes.filter(attr => attr.name.trim() !== "" && attr.values.length > 0);
  if (validAttrs.length === 0) return [];

  let results: Record<string, string>[] = [{}];

  for (const attr of validAttrs) {
    const temp: Record<string, string>[] = [];
    for (const res of results) {
      for (const val of attr.values) {
        temp.push({
          ...res,
          [attr.name.trim()]: val.trim()
        });
      }
    }
    results = temp;
  }
  return results;
}

function extractPriceFromContent(content: string): number {
  const priceMatch = content.match(/\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  if (priceMatch) {
    const cleanPrice = priceMatch[1].replace(/\D/g, "");
    return cleanPrice ? parseInt(cleanPrice) : 0;
  }
  return 0;
}

export async function submitPost(input: SubmitPostInput) {
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

  const rawStock = input.stock !== undefined ? input.stock : 1;
  const validatedStock = Math.max(0, Math.floor(rawStock));
  const basePrice = extractPriceFromContent(content);

  const newPost = await prisma.$transaction(async (tx) => {
    // 1. Création du Post
    const post = await tx.post.create({
      data: {
        content,
        userId: finalAuthorId,
        stock: validatedStock,
        attachments: {
          connect: mediaIds.map((id) => ({ id })),
        },
      },
    });

    const validAttributes = input.attributes?.filter(attr => attr.name.trim() !== "" && attr.values.length > 0) || [];
    
    if (validAttributes.length > 0) {
      // 2. Création des Attributs (Vérifiez bien le nom de votre modèle dans schema.prisma)
      // Si votre modèle s'appelle 'ProductAttribute', utilisez tx.productAttribute
      await tx.productAttribute.createMany({
        data: validAttributes.map(attr => ({
          postId: post.id,
          name: attr.name.trim(),
          values: attr.values.map(v => v.trim()),
        }))
      });

      // 3. Création des Variantes
      const combinations = generateCombinations(validAttributes);

      if (combinations.length > 0) {
        await tx.productVariant.createMany({
          data: combinations.map(combo => ({
            postId: post.id,
            combinations: combo as any, // 'as any' car combinations est un JSON
            price: basePrice,
            stock: Math.floor(validatedStock / combinations.length) || 1,
          }))
        });
      }
    }
    return post;
  }, { timeout: 15000 });

  return await prisma.post.findUnique({
    where: { id: newPost.id },
    include: getPostDataInclude(loggedInUser.id),
  });
}