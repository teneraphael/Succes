import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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

/**
 * Demande la permission pour les notifications et enregistre le token FCM
 * Nettoyé de toute référence à Stream Chat pour le projet Succes.
 */
export const requestNotificationPermission = async (userId: string) => {
  // 1. Vérifications rapides (Non-bloquant pour le SSR)
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

  // On lance le reste dans un bloc asynchrone pour ne pas bloquer le thread principal
  (async () => {
    try {
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") return;

      // Enregistrement du service worker
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { 
        scope: "/" 
      });
      
      // Attendre que le worker soit prêt
      await navigator.serviceWorker.ready;

      // Récupération du token FCM
      const token = await getToken(messaging, { 
        vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY",
        serviceWorkerRegistration: registration 
      });

      if (!token) return;

      // --- SAUVEGARDE DU TOKEN DANS TA BASE DE DONNÉES ---
      // On envoie le token à ton API interne pour pouvoir envoyer des notifications plus tard
      fetch("/api/notifications/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      }).catch(e => console.error("Erreur enregistrement token (silencieuse):", e));

      console.log("✅ Token FCM récupéré et enregistré avec succès.");

    } catch (error) {
      console.error("Erreur FCM (fond) :", error);
    }
  })(); 
};

export const handlePermission = requestNotificationPermission;