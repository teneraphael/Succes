import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    const { id, type, itemType } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // ✅ LOGIQUE DE TRACKING STABLE
    if (itemType === "POST" && type === "VIEW") {
      
      // 1. Vérification de l'existence du post
      const postExists = await prisma.post.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!postExists) {
        return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
      }

      // 2. Préparation de la transaction
      const operations = [];

      // Incrémenter le compteur de vues
      operations.push(
        prisma.post.update({
          where: { id },
          data: { views: { increment: 1 } },
        })
      );

      // 3. Si l'utilisateur est connecté, on enregistre l'interaction
      // OPTIMISATION : Utiliser upsert ou vérifier si l'interaction n'existe pas déjà 
      // pour éviter les doublons sur une même session/IP (facultatif selon votre besoin)
      if (user) {
        operations.push(
          prisma.userInteraction.create({
            data: {
              userId: user.id,
              postId: id,
              type: "VIEW",
              // dealId est null par défaut dans le modèle, pas besoin de le forcer s'il n'est pas requis
            },
          })
        );
      }

      // Exécution atomique
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERREUR_TRACKING_DEALCITY:", error);
    // Retourner 500 ici est correct car il s'agit d'une erreur serveur imprévue
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}