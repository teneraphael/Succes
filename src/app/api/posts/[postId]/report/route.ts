"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
// Importe ici ton service d'envoi push (Firebase Admin)
// import { sendPushNotification } from "@/lib/firebase-admin"; 

export async function POST(
  req: Request,
  { params: { postId } }: { params: { postId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Vérifier si le post existe et récupérer l'auteur
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            fcmToken: true,
          },
        },
      },
    });

    if (!post) {
      return Response.json({ error: "Post non trouvé" }, { status: 404 });
    }

    // Sécurité : On ne se signale pas soi-même
    if (post.userId === loggedInUser.id) {
      return Response.json(
        { error: "Vous ne pouvez pas signaler votre propre post" },
        { status: 400 }
      );
    }

    // 2. VÉRIFICATION DU DOUBLON (Essentiel pour ton message d'erreur)
    const existingReport = await prisma.report.findUnique({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId: postId,
        },
      },
    });

    if (existingReport) {
      return Response.json(
        { error: "Vous avez déjà signalé ce contenu." },
        { status: 400 } // Le frontend ira dans le bloc 'catch'
      );
    }

    // 3. ENREGISTRER LE NOUVEAU SIGNALEMENT
    await prisma.report.create({
      data: {
        userId: loggedInUser.id,
        postId: postId,
        reason: "NON_COMMERCIAL",
      },
    });

    // 4. Compter le nombre de signalements
    const reportCount = await prisma.report.count({
      where: { postId },
    });

    // 5. SEUIL DE SUPPRESSION (3 signalements)
    if (reportCount >= 3) {
      await prisma.$transaction(async (tx) => {
        // A. Créer la notification interne dans la DB
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: post.userId,
            postId: null,
            type: "REPORT_DELETION",
          },
        });

        // B. Supprimer le post
        await tx.post.delete({
          where: { id: postId },
        });
      });

      // 6. ENVOI DU PUSH FIREBASE
      if (post.user.fcmToken) {
        try {
          // Décommente cette ligne quand ton firebase-admin est prêt
          /* await sendPushNotification(
            post.user.fcmToken,
            "Annonce supprimée ⚠️",
            "Votre annonce a été retirée suite à plusieurs signalements."
          ); */
        } catch (pushError) {
          console.error("FCM_PUSH_ERROR:", pushError);
        }
      }

      return Response.json({
        message: "Post supprimé et vendeur notifié via push.",
      });
    }

    // Signalement réussi (premier signalement)
    return Response.json({ message: "Signalement enregistré." });

  } catch (error) {
    console.error("REPORT_ERROR:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}