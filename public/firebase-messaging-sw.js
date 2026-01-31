importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Payload complet reçu par le SW:", payload);

  // Valeurs par défaut pour éviter le message "Nouvelle interaction"
  let title = "City App";
  let body = "Nouveau message reçu";
  let url = "/notifications"; 
  let icon = "/logo.png";
  let image = null;

  // --- ANALYSE DES DONNÉES REÇUES ---

  // 1. Détection Prioritaire : Stream Chat
  // Stream envoie souvent les infos dans l'objet 'data'
  if (payload.data && (payload.data.sender || payload.data.sender_name || payload.data.user_id)) {
    title = payload.data.sender_name || payload.data.user_id || "Nouveau message";
    body = payload.data.text || payload.data.message || "Vous a envoyé un message";
    icon = payload.data.sender_image || "/logo.png";
    url = "/messages";
  } 
  // 2. Détection : Notifications Système (Likes, Follows, Comments)
  else if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    image = payload.notification.image || null;
    // Si ton backend envoie une URL spécifique, on l'utilise
    url = payload.data?.url || "/notifications";
  }

  const notificationOptions = {
    body: body,
    icon: icon,
    image: image,
    badge: "/badge-icon.png",
    tag: "city-interaction", // Tag unique pour mettre à jour la même bulle
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: url }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// GESTION DU CLIC ET REDIRECTION
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const relativeUrl = event.notification.data?.url || '/';
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si le site est déjà ouvert dans un onglet
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          // On le redirige vers la bonne page et on met le focus
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Si le site n'est pas ouvert, on l'ouvre à la bonne page
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});