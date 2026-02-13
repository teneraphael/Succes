import admin from "firebase-admin";
import prisma from "@/lib/prisma";

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || "city-1397c";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    try {
      // NETTOYAGE SPÉCIFIQUE :
      // On retire les guillemets, on normalise les sauts de ligne physiques 
      // et on s'assure que les \n textuels sont convertis.
      const formattedKey = privateKey
        .replace(/^['"]|['"]$/g, '') 
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n'); 

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        }),
      });
      console.log("✅ Firebase Admin initialisé avec succès");
    } catch (error) {
      console.error("❌ Erreur critique initialisation Firebase Admin:", error);
    }
  } else {
    console.warn("⚠️ Firebase Admin : Variables manquantes");
  }
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  dataPayload?: { type: string; channelId?: string; senderId?: string; }
) {
  if (!admin.apps.length) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true }
  });

  if (!user?.fcmToken) return;

  let targetUrl = "/notifications";
  if (dataPayload?.type === "CHAT" && dataPayload?.channelId) {
    targetUrl = `/messages?channelId=${dataPayload.channelId}`;
  }

  try {
    await admin.messaging().send({
      notification: { title, body },
      data: {
        url: targetUrl,
        type: dataPayload?.type || "GENERAL",
        channelId: dataPayload?.channelId || "",
        senderId: dataPayload?.senderId || "",
      },
      token: user.fcmToken,
    });
    console.log("🚀 Notification envoyée avec succès");
  } catch (error) {
    console.error("Erreur d'envoi FCM:", error);
  }
}