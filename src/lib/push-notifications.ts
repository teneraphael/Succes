import admin from "firebase-admin";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";

let firebaseInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) return;

  try {
    const serviceAccountPath = path.join(
      process.cwd(),
      "firebase-service-account.json"
    );

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log("✅ Firebase Admin initialisé correctement");
  } catch (error) {
    console.error("❌ Erreur initialisation Firebase Admin :", error);
  }
}

initializeFirebase();

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  dataPayload?: {
    type: string;
    channelId?: string;
    senderId?: string;
  }
) {
  if (!admin.apps.length) {
    console.warn("⚠️ Firebase non initialisé");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true },
  });

  if (!user?.fcmToken) {
    console.warn("⚠️ Aucun token FCM trouvé");
    return;
  }

  let targetUrl = "/notifications";

  if (dataPayload?.type === "CHAT" && dataPayload?.channelId) {
    targetUrl = `/messages?channelId=${dataPayload.channelId}`;
  }

  try {
    await admin.messaging().send({
      notification: {
        title,
        body,
      },
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
    console.error("❌ Erreur envoi FCM :", error);
  }
}
