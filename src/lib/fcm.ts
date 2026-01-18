import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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

export const requestNotificationPermission = async (userId: string) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      console.log("Les notifications ne sont pas supportées ou désactivées sur ce navigateur.");
      return;
    }

    const messaging = getMessaging(app);
    
    // 1. Demande la permission
    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
      // 2. FORCE l'enregistrement du Service Worker pour éviter le Timeout de 10s
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/",
      });

      console.log("Service Worker prêt avec succès !");

      // 3. Récupère le Token en passant explicitement la registration
      const token = await getToken(messaging, { 
        vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY",
        serviceWorkerRegistration: registration // Crucial pour mobile et navigateurs tiers
      });

      if (token) {
        const response = await fetch("/api/notifications/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });

        if (response.ok) {
          console.log("✅ Token enregistré avec succès dans Prisma !");
        } else {
          console.error("❌ Erreur lors de la sauvegarde du token.");
        }
      }
    } else {
      console.log("🚫 Permission refusée.");
    }
  } catch (error) {
    console.error("🔥 Erreur détaillée FCM :", error);
  }
};

export const handlePermission = requestNotificationPermission;