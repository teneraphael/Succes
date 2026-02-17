import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { user: loggedInUser } = await validateRequest();
    
    // Sécurité : Vérification via l'ID Admin (plus robuste que le pseudo)
    if (!loggedInUser || loggedInUser.id !== "44ttt3ikxntqkxnh") {
      return Response.json({ error: "Accès refusé" }, { status: 401 });
    }

    const pioneers = await prisma.user.findMany({
      where: { isPioneer: true },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        whatsappUrl: true,  // Récupération des réseaux
        facebookUrl: true,
        instagramUrl: true,
        createdAt: true,
        _count: {
          select: { posts: true } // Nombre total d'annonces
        }
      },
      orderBy: { 
        posts: {
          _count: 'desc' // Les plus actifs en premier
        }
      }
    });

    return Response.json(pioneers);
  } catch (error) {
    console.error("Erreur API Pioneers:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}