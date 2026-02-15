'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';
import { useSession } from "@/app/(main)/SessionProvider";

const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd"
};

export default function NotificationPopup() {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // La condition 'user' ici est la première sécurité
    if (user && typeof window !== 'undefined' && 'Notification' in window) {
      const hasAsked = localStorage.getItem('dealcity_notif_asked');
      
      if (Notification.permission === 'default' && !hasAsked) {
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleAccept = async () => {
    // DEUXIÈME SÉCURITÉ : On vérifie que user existe avant de continuer
    if (!user) return; 

    setIsOpen(false);
    localStorage.setItem('dealcity_notif_asked', 'true');

    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: 'BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY' 
        });

        if (token) {
          // Utilisation sécurisée de user.id car on a vérifié au début de la fonction
          await fetch('/api/notifications/register-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, token: token }),
          });
          console.log("✅ Token enregistré pour DealCity");
        }
      }
    } catch (error) {
      console.error("Erreur FCM:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('dealcity_notif_asked', 'true');
  };

  // TROISIÈME SÉCURITÉ : Si user est null, on n'affiche absolument rien
  if (!user || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-[360px] bg-[#0a0a0a] border border-zinc-800 rounded-[35px] overflow-hidden shadow-[0_0_50px_rgba(74,144,226,0.15)] animate-in zoom-in-95 duration-300">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#4a90e2]/10 rounded-full flex items-center justify-center mb-8 border border-[#4a90e2]/20">
            <span className="text-5xl animate-bounce">🔔</span>
          </div>
          
          <h2 className="text-white text-2xl font-extrabold mb-3">Restez connecté !</h2>
          <p className="text-zinc-400 text-sm mb-10 leading-relaxed px-2">
            Recevez une alerte immédiate dès qu&apos;un acheteur vous envoie un message  ou qu&apos;une nouvelle offre est publiée.
          </p>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={handleAccept}
              className="w-full bg-[#4a90e2] text-white font-black py-4 rounded-[40px] shadow-lg shadow-[#4a90e2]/30 active:scale-95 transition-all hover:brightness-110"
            >
              ACTIVER LES NOTIFS
            </button>
            <button 
              onClick={handleClose}
              className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors py-2"
            >
              IGNORER POUR LE MOMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}