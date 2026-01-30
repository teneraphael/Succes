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
  console.log("!!! MESSAGE REÇU DANS LE SW !!!", payload);
  self.registration.showNotification("Test de force", { body: "Le SW a bien reçu l'info" });
  console.log("Notification reçue en arrière-plan", payload);
  
  let title = "";
  let body = "";
  let url = "/notifications";

  // 1. Détection des notifications envoyées par STREAM CHAT
  if (payload.data && payload.data.sender_name) {
    title = `Message de ${payload.data.sender_name}`;
    body = payload.data.text || "Vous avez reçu un nouveau message";
    url = `/messages?userId=${payload.data.sender_id}`;
  } 
  // 2. Détection des notifications manuelles (Likes, Follows, etc.)
  else if (payload.notification) {
    title = payload.notification.title;
    body = payload.notification.body;
    url = payload.data?.url || '/notifications';
  }

  const notificationOptions = {
    body: body,
    icon: '/logo.png',
    badge: '/badge.png', // Petite icône pour la barre d'état Android
    tag: payload.data?.sender_id || 'general-notification', // Regroupe les messages d'un même utilisateur
    data: { url: url },
  };

  if (title) {
    self.registration.showNotification(title, notificationOptions);
  }
});

// --- GESTION DU CLIC SUR LA NOTIFICATION ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si un onglet est déjà ouvert, on navigue vers l'URL et on focus
      for (const client of clientList) {
        if (client.url.includes(location.host) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Sinon on ouvre un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});