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
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', 
    // On stocke l'URL dans les data pour la récupérer au clic
    data: {
      url: payload.data?.url || '/notifications' 
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- AJOUT : GESTION DU CLIC SUR LA NOTIFICATION ---
self.addEventListener('notificationclick', (event) => {
  // 1. On ferme la notification
  event.notification.close();

  // 2. On définit l'URL cible (celle envoyée par le serveur ou par défaut /notifications)
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 3. Si un onglet DealCity est déjà ouvert, on le focus et on change l'URL
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 4. Si le site n'est pas ouvert, on ouvre un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});