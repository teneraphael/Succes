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
  console.log("📩 Message reçu en arrière-plan:", payload);

  let title = "City App";
  let body = "Nouvelle interaction";
  let url = "/notifications"; // Par défaut
  let image = null;
  let icon = "/logo.png";

  // --- PRIORITÉ 1 : NOTIFICATION (Likes, Follows envoyés par ton serveur) ---
  if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    image = payload.notification.image || null;
    // On essaie de choper l'URL dans data s'il existe
    url = payload.data?.url || "/notifications";
  } 
  // --- PRIORITÉ 2 : DATA (Chat Stream) ---
  else if (payload.data && payload.data.sender_name) {
    title = payload.data.sender_name;
    body = payload.data.text || "Vous a envoyé un message";
    url = "/messages";
    icon = payload.data.sender_image || "/logo.png";
  }

  const notificationOptions = {
    body: body,
    icon: icon,
    image: image,
    badge: '/badge-icon.png',
    tag: payload.data?.sender_id || 'city-global-notif',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { 
        url: url,
        launched_at: Date.now() 
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // On construit l'URL absolue pour éviter les bugs de redirection mobile
  const relativeUrl = event.notification.data?.url || '/';
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Si un onglet est déjà sur le site, on le focus et on navigue
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 2. Si rien n'est ouvert, on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});