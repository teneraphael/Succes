import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Ces informations se trouvent dans les paramètres de ton projet Firebase (Console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",

  authDomain: "city-1397c.firebaseapp.com",

  projectId: "city-1397c",

  storageBucket: "city-1397c.firebasestorage.app",

  messagingSenderId: "155671123816",

  appId: "1:155671123816:web:50e439a69717b23886e8dd",

  measurementId: "G-6ZMXSP0Z1P"

};

export const app = initializeApp(firebaseConfig);

// On exporte "messaging" pour l'utiliser plus tard
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;