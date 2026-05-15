// Import compat Firebase pour Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation immédiate
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Prend le contrôle des pages ouvertes
});

// --- INITIALISATION FIREBASE ---
firebase.initializeApp({
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd"
});

const messaging = firebase.messaging();

// --- 1. GESTION DES NOTIFICATIONS EN ARRIÈRE-PLAN ---
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Payload reçu en arrière-plan:", payload);

  // Valeurs par défaut adaptées au projet Succes
  let title = "Succes";
  let body = "Nouvelle notification de votre établissement";
  let icon = "/logo.png";
  let image = null;
  let url = "/notifications"; 

  /**
   * Gestion du Payload Firebase Admin
   * On traite ici les notifications envoyées depuis ton backend Prisma/FCM
   */
  if (payload.notification || payload.data) {
    title = payload.notification?.title || payload.data?.title || title;
    body = payload.notification?.body || payload.data?.body || body;
    icon = payload.notification?.icon || payload.data?.icon || icon;
    image = payload.notification?.image || payload.data?.image || null;
    url = payload.data?.url || url;
  }

  const options = {
    body,
    icon,
    image,
    badge: "/icons/Icône 192x192 px.png", // Utilisation de ton icône générée
    tag: "succes-notif-system", // Evite d'empiler trop de notifications
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url }
  };

  return self.registration.showNotification(title, options);
});

// --- 2. GESTION DU CLIC SUR LA NOTIFICATION ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          // Si un onglet est déjà ouvert sur le site, on le met au premier plan
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Sinon, ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});