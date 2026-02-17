import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, mediaIds, targetUserId } = await req.json();


    // On vérifie si c'est TOI qui es connecté
    const isActuallyMe = loggedInUser.id === process.env.ADMIN_ID;

    // LOGIQUE DE DISCERNEMENT :
    // 1. Si c'est TOI et que tu as choisi un vendeur (targetUserId), on prend l'ID du vendeur.
    // 2. Si ce n'est PAS TOI, ou si tu n'as pas choisi de vendeur, on prend l'ID de la session.
    const authorIdToUse = (isActuallyMe && targetUserId) 
      ? targetUserId 
      : loggedInUser.id;

    const newPost = await prisma.post.create({
      data: {
        content,
        userId: authorIdToUse, // Le post appartiendra à cette personne
        attachments: {
          connect: mediaIds.map((id: string) => ({ id })),
        },
      },
      // On utilise ton helper pour inclure les données nécessaires au flux
      include: getPostDataInclude(loggedInUser.id),
    });

    return Response.json(newPost);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}