import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { StreamChat } from "stream-chat";

const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd",
  measurementId: "G-6ZMXSP0Z1P"
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
        vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY",
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
          console.log("✅ Token enregistré dans Prisma !");
        } catch (e) {
          console.error("❌ Erreur sauvegarde Prisma", e);
        }

        // --- ÉTAPE B : STREAM ---
        if (!chatClient.userID) {
          console.log("⏳ UserID absent, attente de 1 seconde...");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (chatClient.userID) {
          console.log("🚀 Tentative d'ajout du device à Stream (Timeout augmenté)...");
          
          // SOLUTION AU TIMEOUT : On passe le timeout à 10 secondes (10000ms)
          // au lieu des 3000ms par défaut qui causent l'erreur ECONNABORTED
          const originalTimeout = chatClient.options.timeout;
          chatClient.options.timeout = 10000; 

          try {
            await chatClient.addDevice(token, "firebase", userId, "firebase");
            console.log("✅ Appareil enregistré dans Stream Chat !");
          } catch (streamError: any) {
            if (streamError.code === "ECONNABORTED") {
              console.warn("⚠️ Timeout Stream : La requête a pris trop de temps mais a peut-être réussi côté serveur.");
            } else {
              throw streamError; // On laisse l'erreur remonter si c'est autre chose
            }
          } finally {
            chatClient.options.timeout = originalTimeout; // On remet le timeout d'origine
          }

        } else {
          console.error("❌ ÉCHEC : Stream n'a toujours pas de userID.");
        }
      }
    }
  } catch (error) {
    console.error("🔥 Erreur FCM complète :", error);
  }
};

export const handlePermission = requestNotificationPermission;