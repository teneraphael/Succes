import * as admin from 'firebase-admin';


const serviceAccountString = `${process.env.FIREBASE_SERVICE_ACCOUNT_KEY}`;

if (!admin.apps.length) {
    if (serviceAccountString) {
        try {
           
            const serviceAccount = JSON.parse(serviceAccountString);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialisé avec succès.');
        } catch (error) {
            console.error('Erreur lors du parsing ou de l\'initialisation de Firebase Admin:', error);
        }
    } else {
        console.warn("La variable FIREBASE_SERVICE_ACCOUNT_KEY n'est pas définie. Firebase Admin non initialisé.");
    }
}

export default admin;

