import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupération de city et neighborhood en plus du reste
    const { content, mediaIds, targetUserId, city, neighborhood } = await req.json();

    // On vérifie si c'est TOI qui es connecté
    const isActuallyMe = loggedInUser.id === process.env.ADMIN_ID;

    // LOGIQUE DE DISCERNEMENT CORRIGÉE :
    // On vérifie que targetUserId existe ET qu'il n'est pas égal à la chaîne "me"
    const authorIdToUse = (isActuallyMe && targetUserId && targetUserId !== "me") 
      ? targetUserId 
      : loggedInUser.id;

    // Nettoyage des valeurs de localisation pour éviter les chaînes vides ""
    const cleanCity = city && city.trim() !== "" ? city.trim() : null;
    const cleanNeighborhood = neighborhood && neighborhood.trim() !== "" ? neighborhood.trim() : null;

    const newPost = await prisma.post.create({
      data: {
        content,
        city: cleanCity,               // Enregistrement propre de la ville
        neighborhood: cleanNeighborhood, // Enregistrement propre du quartier
        userId: authorIdToUse,         // Le post appartiendra à cette personne
        attachments: {
          connect: (mediaIds || []).map((id: string) => ({ id })),
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