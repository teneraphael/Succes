import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const { id, type, itemType } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // ✅ LOGIQUE DE TRACKING STABLE
    if (itemType === "POST" && type === "VIEW") {
      
      // 🛡️ SÉCURITÉ : On vérifie d'abord que le Post existe en BDD
      const postExists = await prisma.post.findUnique({
        where: { id: id },
        select: { id: true }, // Version ultra-légère juste pour la vérification
      });

      if (!postExists) {
        console.warn(`[TRACKING_DEALCITY] Tentative de vue sur un post inexistant ou supprimé ID: ${id}`);
        return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
      }

      // Utilisation d'une transaction pour garantir l'intégrité
      await prisma.$transaction([
        // 1. Incrémenter le compteur global de vues
        prisma.post.update({
          where: { id: id },
          data: { views: { increment: 1 } },
        }),
        
        // 2. Si l'utilisateur est connecté, on enregistre l'interaction
        ...(user 
          ? [
              prisma.userInteraction.create({
                data: {
                  userId: user.id,
                  postId: id,
                  type: "VIEW",
                  // 🔥 CORRECTION : On retire totalement dealId ou on le met explicitement à null 
                  // pour éviter que Prisma ne cherche une clé étrangère vide ""
                  dealId: null, 
                },
              }),
            ] 
          : []),
      ]);
    }

    // On renvoie une réponse légère pour ne pas ralentir le front-end
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERREUR_TRACKING_DEALCITY:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}