import admin from './firebase-admin'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function sendNotificationToUser(userId, title, body, postUrl) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { fcmToken: true }
    });
    
    const recipientToken = user?.fcmToken;

    if (!recipientToken) {
        console.log(`L'utilisateur ${userId} n'est pas abonné ou n'a pas de jeton FCM.`);
        return;
    }

    const message = {
        notification: { 
            title: title, 
  body: body 
        },
        data: {
            url: postUrl || 'LIKE' || 'COMMENT' || 'FOLLOW' || 'BOOKMARK',
            type: 'LIKE',

        },
        token: recipientToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notification FCM envoyée avec succès:', response);
        return response;
    } catch (error) {
        console.error('Échec de l\'envoi de la notification FCM:', error);
    }
}
