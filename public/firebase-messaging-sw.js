importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDYTmdZpLhw04HNXLmnnmKqJf7umAKu35g",
  authDomain: "city-1397c.firebaseapp.com",
  projectId: "city-1397c",
  storageBucket: "city-1397c.firebasestorage.app",
  messagingSenderId: "155671123816",
  appId: "1:155671123816:web:50e439a69717b23886e8dd"
});

const messaging = firebase.messaging();

// 1. GESTION DE LA RÉCEPTION EN ARRIÈRE-PLAN
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Payload reçu en arrière-plan:", payload);

  let title = "City App";
  let body = "Nouvelle interaction";
  let url = "/notifications"; 
  let icon = "/logo.png";
  let image = null;

  // CAS A : Payload venant de STREAM CHAT
  // Stream envoie souvent les infos dans payload.data
  if (payload.data && (payload.data.sender_name || payload.data.message_id)) {
    title = payload.data.sender_name || "Nouveau message";
    body = payload.data.text || "Vous a envoyé un message";
    icon = payload.data.sender_image || "/logo.png";
    // Si tu as un channelId dans le payload, utilise-le
    url = payload.data.channel_id ? `/messages?channelId=${payload.data.channel_id}` : "/messages";
  } 
  
  // CAS B : Payload venant de ton BACKEND (Firebase Admin)
  else if (payload.notification || payload.data) {
    title = payload.notification?.title || payload.data?.title || title;
    body = payload.notification?.body || payload.data?.body || body;
    image = payload.notification?.image || payload.data?.image || null;
    
    // On récupère l'URL transmise par sendPushNotification (le champ 'url' dans data)
    url = payload.data?.url || "/notifications";
  }

  const notificationOptions = {
    body: body,
    icon: icon,
    image: image,
    badge: "/badge-icon.png", 
    tag: "city-notif-system", // Évite d'empiler 50 notifications, les écrase si même tag
    renotify: true,
    vibrate: [200, 100, 200],
    data: { 
      url: url 
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// 

// 2. GESTION DU CLIC SUR LA NOTIFICATION
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Récupération de l'URL stockée
  const relativeUrl = event.notification.data?.url || '/';
  // On construit l'URL absolue pour éviter les erreurs de navigation
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Vérifier si un onglet est déjà ouvert sur le site
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Sinon, ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});