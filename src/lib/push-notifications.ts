// src/lib/push-notifications.ts
import admin from "firebase-admin";
import prisma from "@/lib/prisma";

// Initialisation
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "city-1397c",
      clientEmail: "firebase-adminsdk-fbsvc@city-1397c.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCYTgAqJL18qinS\nsAl7S+YhUTvTRJnV2yJdh7NZ0CT7ImwkiEyU2yaC+yt4C7MLrrqgTOLrJaDxvt7X\nt28XggaMD6EjHk9tPN+flgKOcab+5Ov3FouUM4z0f4J7tT5UK7GbzPyfuhImyG85\nD7cVZ1/8VoW/Q7Q6Qmlfjqwpx2FHxSLuv+0DAaFzJCaKWMNoOglRu5d7n7FdIC4Z\nivAXqeYWRvxSk9AnFuUBQ6bPeneIMPV3R+iVrbmvt2uN0YYHnZPPD8MHZ2xqNQjf\nVFWw9fasIaU6hD0Hn5RpRtApPnEk1wMCjGM81j0AIMHhIgi6t70B3L++osuYdUUw\n3Rky7ax9AgMBAAECggEAE6oCeG587pMTykmDN+GRSVzxIfJaAFQGKFhEbkSi+a+0\nkbTtWky/OKsQLjQofkole1vh8mVN1diEcgqTc9AMY1oDPoMD00FISBT4qIaA/qj0\n1FabV9ueB9VMtgctEHYBvPFm7oJ6JHq9bXsbcs6BhJVxOEQYCWuYqkdD8DL3Wuok\nfs9XvOv53KS0GCcFpxDHPssqRo9sPq4fOd8AtiYYrI9PZPujV3+OgKB0h8Oy/1c8\n2NHZumbWAKjSDumsbsp8bxHDFxwcjZKy67iVRuYX15jIsbkfTrDeL+tiuhZGIyV0\nKF8MW7CTMNWN65u1iyRvD+QuoeBRAnfhHEQTzEMwqwKBgQDGCT3bkO4fdFliHwWP\n+TEj6j+LHZ5L7M48DYK67haS2csGoqlJneb19Qo0bgtN5eRoM6H9fycAFEvUOsKS\nB7YIZVX/vR5LLJObfi1FRW22TAThifFN8sUmp5M5zlpOKqnC2cXZXDuvZsV9tYzn\heMQpSu+FU8hI2rz1hGui4xTLwKBgQDE4h/cKLt9A8g3+zpWY+7xfSJujU16QDgc\nX55rb0nASNf+761HvPig0ZeUWZdg2PotgaYsjS7mCUfHMgdF6k4Z5U9h7zpkEVhg\npQtCmRWnkYOyeYA4cIjlY91J+lkzSXTW0Vkw857ttK8nopm9LHssexcKKUaCLfm0\noYocJdSAEwKBgQCG24JBRCe0SdIYjJGIIqUBFSLihG/oukETCgxNaZb7t86XHSv1\nEs9WDOE/JPUTvgrVntugOfeACVI+GymmshOXEhMHTW0Uui1mhP0lIAt/SbNFN1+Y\nukrhcNpEUi6S7mCebRhbVYDbiDvSyFBE1Zr0GdZ44h/5rBnIJK3z09niRwKBgB7f\nqslWZdg70Jjev44ui5i4275kUCL8kQ/5+pi0UediROTIZu7Z9k8ZruBnkDJytACQ\n1SMlXJZcHDJjaPqQvICZEfK0lf59LdOx7esaoGevjOxe2zl+hCkcmOXx6Sz+tuC8\n4XSor2JtNA5OFDezEvmtr7Y7NMBTP1YRAtxZHlKbAoGAexZjfNCtWxP6WcpE6XOU\nCdfdowb9ZFoxZxIplZM/x2FGYVCHLzTAcqeBMMRfgU8qZArwxkLHtHc0Nh6ikzN+\nvMtK/ugAt7Scw50442RchZ7TpjHdNheo7a6nLnNlxMCZ/Ejk7uwPcXoOn0FtYkR3\nCYvzfuzzJSR3YnI/8xlnTJ4=\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
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
      console.log("✅ Notification envoyée avec lien vers /notifications");
    } catch (error) {
      console.error("❌ Erreur d'envoi FCM:", error);
    }
  }
}