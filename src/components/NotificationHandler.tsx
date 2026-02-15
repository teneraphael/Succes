'use client';

import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Ta configuration Firebase (la même que dans ton SW)
const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd"
};

export default function NotificationHandler() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // 1. Demander la permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Permission accordée !');

          // 2. Enregistrer le Service Worker explicitement
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

          const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: 'BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY' 
          });

          if (token) {
            console.log("Token DealCity récupéré :", token);
          }
        }
      } catch (error) {
        console.error("Erreur notifications:", error);
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setupNotifications();
    }
  }, []);

  return null; // Ce composant ne dessine rien, il gère juste la logique
}