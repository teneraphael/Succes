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
  measurementId: "G-6ZMXSP0Z1P",
};

const app = initializeApp(firebaseConfig);

// ... (tes imports et firebaseConfig restent identiques)

export const requestNotificationPermission = async (userId: string, chatClient: StreamChat) => {
  // 1. Vérifications rapides (Non-bloquant)
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

  // On lance le reste dans un bloc asynchrone SANS 'await' devant l'appel initial
  // pour libérer le thread principal immédiatement.
  (async () => {
    try {
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") return;

      // Enregistrement du worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
      
      // Attendre que le worker soit actif avant de demander le token
      await navigator.serviceWorker.ready;

      const token = await getToken(messaging, { 
        vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY",
        serviceWorkerRegistration: registration 
      });

      if (!token) return;

      // --- SAUVEGARDE ASYNC (On ne bloque pas pour ça) ---
      fetch("/api/notifications/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      }).catch(e => console.error("Erreur Prisma (silencieuse):", e));

      // --- ENREGISTREMENT STREAM ---
      // On vérifie si le client est connecté
      if (!chatClient.userID) {
        console.log("FCM: Client Stream non prêt, on réessaiera plus tard.");
        return;
      }

      // On ajoute le device sans bloquer l'interface
      try {
        await chatClient.addDevice(token, "firebase", userId, "firebase");
        console.log("✅ Appareil enregistré dans Stream !");
      } catch (err: any) {
        // Si le device existe déjà, Stream renvoie une erreur, on l'ignore proprement
        if (err.body?.code !== 17) { 
          console.warn("Note Stream Device:", err.message);
        }
      }

    } catch (error) {
      console.error("Erreur FCM (fond) :", error);
    }
  })(); 
};

export const handlePermission = requestNotificationPermission;