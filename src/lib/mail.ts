import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 1. EMAIL DE BIENVENUE (CLIENT)
 */
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: 'DealCity <bienvenue@dealcity.app>', 
      to: email,
      subject: 'Bienvenue chez DealCity ! 🇨🇲',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
            <img src="https://dealcity.app/logo.png" alt="DealCity" style="width: 140px; height: auto;" />
          </div>
          <div style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #1e3a8a; font-size: 26px; font-weight: bold; margin-bottom: 20px;">
              Heureux de vous voir, ${name} !
            </h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Votre compte client DealCity est prêt. Découvrez les meilleures offres de Douala, Yaoundé et tout le Cameroun.
            </p>
            <a href="https://dealcity.app/" 
               style="background-color: #1e3a8a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
               Explorer les annonces
            </a>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 35px; font-style: italic;">
              Note : Pour vendre vos articles, demandez votre accès vendeur dans votre profil.
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© 2026 DealCity Cameroun. L'essentiel au meilleur prix.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi email bienvenue:", error);
  }
};

/**
 * 2. EMAIL DE RÉCUPÉRATION (CODE À 6 CHIFFRES)
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: 'DealCity <securite@dealcity.app>',
      to: email,
      subject: `${token} est votre code de récupération DealCity`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #f0f0f0;">
            <img src="https://dealcity.app/logo.png" alt="DealCity" style="width: 140px; height: auto;" />
          </div>
          <div style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #1e3a8a; font-size: 24px; font-weight: bold; margin-bottom: 20px;">
              Réinitialisation du mot de passe
            </h1>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 25px;">
              Utilisez le code ci-dessous pour modifier votre mot de passe. Ce code est valable 15 minutes.
            </p>
            <div style="margin: 30px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a8a; background: #f3f4f6; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb;">
                ${token}
              </span>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 35px;">
              Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail en toute sécurité.
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© 2026 DealCity Cameroun. Sécurité de votre compte.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi email reset:", error);
  }
};