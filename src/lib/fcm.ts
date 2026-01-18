import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// 1. Ta configuration Firebase (déjà complétée avec tes clés)
const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd",
  measurementId: "G-6ZMXSP0Z1P"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

export const requestNotificationPermission = async (userId: string) => {
  try {
    // Sécurité : Vérifier qu'on est bien côté client (navigateur)
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.log("Les notifications ne sont pas supportées par ce navigateur.");
      return;
    }

    const messaging = getMessaging(app);
    
    // 2. Demande la permission à l'utilisateur
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      // 3. Récupère le Token unique de l'appareil
      // REMPLACE "TA_CLE_VAPID_ICI" par celle de ta console Firebase
      const token = await getToken(messaging, { 
        vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY" 
      });

      if (token) {
        // 4. Envoie le token à ton API Next.js qui utilise PRISMA
        const response = await fetch("/api/notifications/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });

        if (response.ok) {
          console.log("✅ Token enregistré avec succès dans Prisma !");
        } else {
          console.error("❌ Erreur lors de la sauvegarde du token sur le serveur.");
        }
      }
    } else {
      console.log("🚫 Permission de notification refusée.");
    }
  } catch (error) {
    console.error("🔥 Erreur FCM :", error);
  }
};
export const handlePermission = requestNotificationPermission;