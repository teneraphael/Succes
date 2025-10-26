import { messaging } from "@/lib/firebase-client"; 
import { getToken } from "firebase/messaging";

// 🚨 IMPORTANT : Votre clé VAPID publique doit être passée à getToken
// Vous la trouverez dans la Console Firebase > Projet Settings > Cloud Messaging > Web Push Certificates.
const VAPID_KEY = `${process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY}`;


export async function subscribeUserToNotifications(): Promise<boolean> {
    if (!messaging || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
console.warn("FCM ou Service Worker non disponible. Abandon de l'abonnement.");
        return false;
    }

    try {
     
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        // 2. Obtention du jeton
        const fcmToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!fcmToken) {
            console.warn("Permission de notification refusée ou impossible d'obtenir le jeton.");
 return false;
        }

        console.log("Jeton FCM obtenu :", fcmToken);

        // 3. Envoi du jeton à votre route API /api/subscribe
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fcmToken }),
        });

        if (response.ok) {
            console.log("Jeton FCM enregistré avec succès sur le serveur.");
            return true;
        } else {
            console.error("Échec de l'enregistrement du jeton sur le serveur.");
            return false;
        }

 } catch (error) {
        // Cette erreur se produit souvent si la permission est refusée par l'utilisateur
        console.error("Erreur lors de l'abonnement aux notifications:", error);
        return false;
    }
}
