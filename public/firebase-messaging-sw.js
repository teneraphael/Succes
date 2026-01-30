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
  console.log("📩 Message reçu:", payload);

  let title = "City App";
  let body = "Nouvelle interaction";
  let url = "/";
  let image = null; // Image d'illustration (ex: photo du post)
  let icon = "/logo.png"; // Ta photo de profil ou logo

  // --- STYLE CHAT ---
  if (payload.data && payload.data.sender_name) {
    title = payload.data.sender_name;
    body = payload.data.text || "Vous a envoyé un message";
    url = "/messages";
    icon = payload.data.sender_image || "/logo.png"; 
  } 
  // --- STYLE LIKES / NOTIFS ---
  else if (payload.notification) {
    title = payload.notification.title;
    body = payload.notification.body;
    image = payload.notification.image || null; // Affiche l'image du post liké
    url = payload.data?.url || "/notifications";
  }

  const notificationOptions = {
    body: body,
    icon: icon, // Petite image ronde à gauche
    image: image, // Grande image d'aperçu (optionnel)
    badge: '/badge-icon.png', // Icône monochrome pour la barre d'état Android
    tag: payload.data?.sender_id || 'city-notif', // Regroupe les notifs par personne
    renotify: true, // Fait vibrer même si une notif du même tag est déjà là
    requireInteraction: false, // La notif disparaît seule après un moment
    vibrate: [100, 50, 100],
    data: { url: url }
  };

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.host) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});