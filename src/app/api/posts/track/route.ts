import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    // Optionnel : On peut compter les vues même si l'utilisateur n'est pas connecté
    // mais ici on vérifie les données envoyées
    const { id, type, itemType } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Si c'est une vue sur un POST (produit)
    if (itemType === "POST" && type === "VIEW") {
      await prisma.post.update({
        where: { id: id },
        data: {
          // Assure-toi d'avoir un champ 'views' (Int) dans ton modèle Post (schema.prisma)
          // Sinon, tu peux simplement ignorer l'update ou logguer l'info
          views: { increment: 1 }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERREUR_TRACKING:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}