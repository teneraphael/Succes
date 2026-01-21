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

    // 1. Vérifier si le post existe et récupérer l'auteur et son token FCM
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

    // 2. Enregistrer le signalement (Upsert pour éviter les doublons)
    await prisma.report.upsert({
      where: {
        userId_postId: {
          userId: loggedInUser.id,
          postId,
        },
      },
      create: {
        userId: loggedInUser.id,
        postId,
        reason: "NON_COMMERCIAL",
      },
      update: {},
    });

    // 3. Compter le nombre de signalements
    const reportCount = await prisma.report.count({
      where: { postId },
    });

    // 4. SEUIL DE SUPPRESSION (3 signalements)
    if (reportCount >= 3) {
      await prisma.$transaction(async (tx) => {
        // A. Créer la notification interne dans la DB
        await tx.notification.create({
          data: {
            issuerId: loggedInUser.id,
            recipientId: post.userId,
            postId: null, // Le post va disparaître
            type: "REPORT_DELETION",
          },
        });

        // B. Supprimer le post
        await tx.post.delete({
          where: { id: postId },
        });
      });

      // 5. ENVOI DU PUSH FIREBASE (Hors transaction pour ne pas bloquer la DB)
      if (post.user.fcmToken) {
        try {
          // Décommente cette ligne quand ton firebase-admin est prêt
          /* await sendPushNotification(
            post.user.fcmToken,
            "Annonce supprimée ⚠️",
            "Votre annonce a été retirée suite à plusieurs signalements."
          );
          */
        } catch (pushError) {
          console.error("FCM_PUSH_ERROR:", pushError);
          // On ne bloque pas la réponse si le push échoue
        }
      }

      return Response.json({
        message: "Post supprimé et vendeur notifié via push.",
      });
    }

    return Response.json({ message: "Signalement enregistré." });
  } catch (error) {
    console.error("REPORT_ERROR:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}