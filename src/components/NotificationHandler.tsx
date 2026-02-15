'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { useSession } from "@/app/(main)/SessionProvider"; // On récupère l'utilisateur connecté

const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd"
};

export default function NotificationHandler() {
  const { user } = useSession();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // On vérifie si on doit afficher le bouton (si la permission n'est pas encore donnée)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    setShowPrompt(false); // On cache la bannière dès qu'il clique
    
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      // 1. Demande de permission déclenchée par CLIC (Accepté par Android/Edge)
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Permission accordée !');

        // 2. Enregistrement du Service Worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // 3. Récupération du Token
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: 'BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY' 
        });

        if (token && user) {
          console.log("Token DealCity récupéré :", token);
          
          // 4. Envoi à ton API de sauvegarde
          await fetch('/api/notifications/register-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, token: token }),
          });
        }
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  };

  if (!showPrompt || !user) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="mx-auto max-w-[400px] bg-[#000000] border border-gray-800 p-5 shadow-2xl rounded-[24px]">
        <div className="flex flex-col gap-4 text-center">
          <div className="flex justify-center">
            <div className="bg-[#4a90e2]/10 p-3 rounded-full">
              <span className="text-2xl">🔔</span>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Activez les alertes</h3>
            <p className="text-gray-400 text-sm mt-1">
              Ne ratez plus aucun message de vos acheteurs ou vendeurs sur DealCity.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleEnableNotifications}
              className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold py-3 rounded-[40px] transition-all active:scale-95"
            >
              AUTORISER
            </button>
            <button 
              onClick={() => setShowPrompt(false)}
              className="text-gray-500 text-xs py-1 hover:text-gray-300"
            >
              Peut-être plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}