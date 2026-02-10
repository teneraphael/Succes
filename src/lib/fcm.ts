import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { StreamChat } from "stream-chat";

const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const requestNotificationPermission = async (userId: string, chatClient: StreamChat) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      
      const token = await getToken(messaging, { 
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration 
      });

      if (token) {
        // --- ÉTAPE A : PRISMA ---
        try {
          await fetch("/api/notifications/save-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, token }),
          });
          console.log(" Token enregistré dans Prisma !");
        } catch (e) {
          console.error(" Erreur sauvegarde Prisma", e);
        }

        // --- ÉTAPE B : STREAM ---
        if (!chatClient.userID) {
          console.log(" UserID absent, attente de 1 seconde...");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (chatClient.userID) {
          console.log(" Tentative d'ajout du device à Stream (Timeout augmenté)...");
          const originalTimeout = chatClient.options.timeout;
          chatClient.options.timeout = 10000; 

          try {
            await chatClient.addDevice(token, "firebase", userId, "firebase");
            console.log(" Appareil enregistré dans Stream Chat !");
          } catch (streamError: any) {
            if (streamError.code === "ECONNABORTED") {
              console.warn(" Timeout Stream : La requête a pris trop de temps mais a peut-être réussi côté serveur.");
            } else {
              throw streamError; 
            }
          } finally {
            chatClient.options.timeout = originalTimeout; 
          }

        } else {
          console.error(" ÉCHEC : Stream n'a toujours pas de userID.");
        }
      }
    }
  } catch (error) {
    console.error(" Erreur FCM complète :", error);
  }
};

export const handlePermission = requestNotificationPermission;