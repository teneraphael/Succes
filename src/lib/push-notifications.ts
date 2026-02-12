import admin from "firebase-admin";
import prisma from "@/lib/prisma";

// ✅ 1. Sécurisation de l'initialisation pour le Build
if (!admin.apps.length) {
  const projectId = "city-1397c";
  const clientEmail = "firebase-adminsdk-fbsvc@city-1397c.iam.gserviceaccount.com";
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // On n'initialise QUE si les variables existent (évite le crash au build)
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialisé");
    } catch (error) {
      console.error("❌ Erreur initialisation Firebase Admin:", error);
    }
  } else {
    console.warn("⚠️ Firebase Admin : Variables manquantes (normal durant le build Vercel)");
  }
}

export async function sendPushNotification(
  userId: string, 
  title: string, 
  body: string, 
  dataPayload?: { type: string; channelId?: string; senderId?: string; }
) {
  // ✅ 2. Vérification supplémentaire avant d'utiliser admin
  if (!admin.apps.length) {
    console.error("Firebase Admin non initialisé. Notification annulée.");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true }
  });

  if (user?.fcmToken) {
    const message = {
      notification: { title, body },
      data: {
        url: "/notifications",
        // On passe les infos reçues en paramètre s'il y en a
        type: dataPayload?.type || "GENERAL",
        channelId: dataPayload?.channelId || "",
        senderId: dataPayload?.senderId || "",
      },
      token: user.fcmToken,
    };

    try {
      await admin.messaging().send(message);
      console.log("🚀 Notification envoyée avec succès");
    } catch (error) {
      console.error("Erreur d'envoi FCM:", error);
    }
  }
}