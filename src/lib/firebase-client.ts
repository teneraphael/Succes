import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

// Configuration du client Firebase (clés publiques)
const firebaseConfig = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`,
};

// Initialisation de l'application Firebase.
// On vérifie si l'application est déjà initialisée pour éviter une erreur en environnement Next.js.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messaging: Messaging | null = null;

// L'objet 'messaging' n'est disponible que dans le navigateur (côté client).
// On vérifie le type pour s'assurer que nous sommes dans un environnement client.
if (typeof window !== "undefined") {
    try {
        // Le SDK FCM (getMessaging) a des dépendances spécifiques au navigateur
        // et doit être appelé après l'initialisation de l'application.
        messaging = getMessaging(app);
    } catch (e) {
        // Cette erreur est souvent levée si le SDK n'est pas supporté (ex: iOS Safari sans PWA)
        console.error("Firebase Messaging non supporté ou erreur d'initialisation:", e);
    }
}
export { app };
export { messaging };
