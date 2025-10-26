import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient(); 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { token, userId } = req.body; 

  try {
  
    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken: token },
    });

    res.status(200).json({ success: true, message: 'Jeton FCM enregistré avec succès' });
  } catch (error) {
 console.error('Erreur lors de l\'enregistrement du jeton (PostgreSQL/Prisma):', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
