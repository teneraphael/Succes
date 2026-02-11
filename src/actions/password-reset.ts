"use server";

import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { lucia } from "@/auth"; 
import { hash } from "@node-rs/argon2";

/**
 * ACTION 1 : Générer et envoyer le code à 6 chiffres
 */
export const generateResetCode = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (!user) {
      // Pour la sécurité, on peut aussi retourner "success" pour ne pas révéler si un mail existe
      return { error: "Aucun compte trouvé avec cet email." };
    }

    // 1. Créer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // 2. Supprimer les anciens codes pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // 3. Sauvegarder le nouveau code
    await prisma.passwordResetToken.create({
      data: { email, token: code, expires }
    });

    // 4. Envoyer l'email via ta fonction Resend
    await sendPasswordResetEmail(email, code);

    return { success: "Le code de sécurité a été envoyé !" };
  } catch (error) {
    console.error("Erreur generateResetCode:", error);
    return { error: "Une erreur est survenue lors de l'envoi." };
  }
};

/**
 * ACTION 2 : Vérifier le code et mettre à jour le mot de passe
 */
export const verifyAndChangePassword = async (email: string, code: string, newPassword: string) => {
  try {
    // 1. Chercher le token valide
    const existingToken = await prisma.passwordResetToken.findFirst({
      where: { 
        email, 
        token: code,
        expires: { gt: new Date() } 
      }
    });

    if (!existingToken) {
      return { error: "Code invalide ou expiré." };
    }

    // 2. Hacher avec Argon2 (identique à ton inscription)
    const hashedPassword = await hash(newPassword, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // 3. Mettre à jour l'utilisateur
    // Attention : j'ai mis 'passwordHash', vérifie si ton champ s'appelle 'password' dans ton schema.prisma
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword } 
    });

    // 4. SÉCURITÉ LUCIA : Invalider toutes les sessions actives
    // Cela force l'utilisateur à se reconnecter partout
    await lucia.invalidateUserSessions(user.id);

    // 5. Supprimer le token utilisé
    await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });

    return { success: "Mot de passe modifié avec succès !" };
  } catch (error) {
    console.error("Erreur verifyAndChangePassword:", error);
    return { error: "Impossible de modifier le mot de passe." };
  }
};