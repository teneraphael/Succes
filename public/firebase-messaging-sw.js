importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd",
  measurementId: "G-6ZMXSP0Z1P"
});

const messaging = firebase.messaging();

// Affichage de la notification en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log("Notification reçue en arrière-plan", payload);
  
  // --- EXTRACTION INTELLIGENTE ---
  // On prend les infos de 'notification' OU de 'data' (pour le Chat)
  const title = payload.notification?.title || payload.data?.sender_name || "City App";
  const body = payload.notification?.body || payload.data?.text || payload.data?.message || "Nouvelle notification";
  
  // Définition de l'URL cible selon le type
  let targetUrl = '/notifications'; 
  if (payload.data?.sender_name || payload.data?.cid) {
    targetUrl = '/messages'; // Si c'est un message, on va vers le chat
  } else if (payload.data?.url) {
    targetUrl = payload.data.url; // URL spécifique (like/post)
  }

  const notificationOptions = {
    body: body,
    icon: payload.data?.sender_image || '/logo.png', 
    badge: '/badge-icon.png',
    tag: 'city-notif',
    renotify: true,
    data: {
      url: targetUrl 
    },
  };

  self.registration.showNotification(title, notificationOptions);
});

// --- GESTION DU CLIC (Redirection) ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // On récupère l'URL stockée
  const targetUrl = event.notification.data?.url || '/notifications';
  // On s'assure que l'URL est complète (absolue)
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Si un onglet est déjà ouvert, on navigue et on focus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          client.navigate(absoluteUrl);
          return client.focus();
        }
      }
      // 2. Si le site n'est pas ouvert, on l'ouvre
      if (clients.openWindow) {
        return clients.openWindow(absoluteUrl);
      }
    })
  );
});