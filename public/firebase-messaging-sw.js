importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.1.0/firebase-messaging-compat.js');

// 🚨 Remplacez par votre configuration Firebase
const firebaseConfig = {
    apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`,
};

// Initialisation de l'application dans le Service Worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Gérer la réception des messages lorsque l'application est en arrière-plan
messaging.onBackgroundMessage((payload) => {
console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png', // Utilisez votre propre icône
    data: payload.data // Données personnalisées (ex: l'URL du post)
  };

  // Afficher la notification native
  self.registration.showNotification(notificationTitle, notificationOptions);
});
