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
      // Utilisation d'une transaction pour garantir l'intégrité
      await prisma.$transaction([
        // 1. Incrémenter le compteur global de vues
        prisma.post.update({
          where: { id: id },
          data: { views: { increment: 1 } },
        }),
        
        // 2. Si l'utilisateur est connecté, on enregistre l'interaction 
        // pour affiner l'algorithme de recommandation sans casser le flux.
        ...(user 
          ? [
              prisma.userInteraction.create({
                data: {
                  userId: user.id,
                  postId: id,
                  type: "VIEW",
                  dealId: "",
                  // On évite les chaînes vides pour les relations optionnelles, 
                  // on laisse Prisma gérer le null si le champ est optionnel.
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