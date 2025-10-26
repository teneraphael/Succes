import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`,
  projectId: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`,

};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


const VAPID_KEY = `${process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY}`; 

export const requestForToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (currentToken) {
        console.log('Jeton d\'enregistrement FCM obtenu:', currentToken);
        
        await fetch('/api/subscribe', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
 body: JSON.stringify({ token: currentToken, userId: userId })
        });

        return currentToken;
      } else {
        console.log('Impossible d\'obtenir le jeton. Pas de Service Worker.');
      }
    } else {
      console.log('Permission de notification refusée.');
    }
  } catch (error) {
    console.error('Erreur lors de la demande de jeton:', error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});
