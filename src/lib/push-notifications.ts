// src/lib/push-notifications.ts
import admin from "firebase-admin";
import prisma from "@/lib/prisma";

// Initialisation
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function sendPushNotification(userId: string, title: string, body: string, p0: { type: string; channelId: any; senderId: any; }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true }
  });

  if (user?.fcmToken) {
    const message = {
      notification: { title, body },
      // --- AJOUT : Le lien que le Service Worker utilisera ---
      data: {
        url: "/notifications", 
      },
      token: user.fcmToken,
    };

    try {
      await admin.messaging().send(message);
      console.log(" Notification envoyée avec lien vers /notifications");
    } catch (error) {
      console.error("Erreur d'envoi FCM:", error);
    }
  }
}