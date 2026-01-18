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

// Cette fonction affiche le pop-up quand l'utilisateur n'est pas sur le site
messaging.onBackgroundMessage((payload) => {
  console.log("Notification reçue en arrière-plan", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Mets ton logo ici
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});