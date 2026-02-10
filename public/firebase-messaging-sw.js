importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Ton initialisation Firebase
firebase.initializeApp({
 apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

// 1. GESTION DE LA RÉCEPTION (Affichage)
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Payload reçu:", payload);

  let title = "City App";
  let body = "Nouvelle interaction";
  let url = "/notifications"; // Par défaut pour les likes/follows
  let icon = "/logo.png";
  let image = null;

  // CAS A : C'est le CHAT (Stream Chat envoie des données dans 'data')
  if (payload.data && payload.data.sender_name) {
    title = payload.data.sender_name;
    body = payload.data.text || "Vous a envoyé un message";
    icon = payload.data.sender_image || "/logo.png";
    // Redirection vers le chat (on peut ajouter l'ID si Stream l'envoie)
    url = "/messages"; 
  } 
  // CAS B : C'est un LIKE, FOLLOW ou COMMENT (Ton API envoie 'notification')
  else if (payload.notification) {
    title = payload.notification.title || title;
    body = payload.notification.body || body;
    image = payload.notification.image || null;
    // On récupère l'URL spécifique envoyée par ton backend, sinon /notifications
    url = payload.data?.url || "/notifications";
  }

  const notificationOptions = {
    body: body,
    icon: icon,
    image: image,
    badge: "/badge-icon.png", // L'icône blanche pour la barre d'état Android
    tag: "city-notif-system",
    renotify: true,
    vibrate: [200, 100, 200],
    data: { 
      url: url // On stocke l'URL ici pour la récupérer au clic
    }
  };

  return self.registration.showNotification(title, notificationOptions);
});

// 2. GESTION DU CLIC (Redirection)
self.addEventListener('notificationclick', (event) => {
  // On ferme la notification immédiatement
  event.notification.close();

  // On récupère l'URL de redirection stockée dans les data
  const relativeUrl = event.notification.data?.url || '/';
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si un onglet est déjà ouvert sur ton site
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'navigate' in client) {
          // On force la navigation vers la bonne page (chat ou notifications)
          client.navigate(targetUrl);
          // On met l'onglet en avant
          return client.focus();
        }
      }
      // Si le site n'est pas ouvert, on ouvre une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});