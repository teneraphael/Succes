import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      // UNE FOIS VERCEL CONFIGURÉ : remplace par 'bienvenue@dealcity.app'
      from: 'DealCity <onboarding@resend.dev>', 
      to: email,
      subject: 'Bienvenue chez DealCity ! 🇨🇲',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 15px; overflow: hidden;">
          
          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #f5f5f5;">
            <img src="https://dealcity.app/logo.png" alt="DealCity" style="width: 130px; height: auto;" />
          </div>

          <div style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #1e3a8a; font-size: 24px; margin-bottom: 20px;">Bienvenue, ${name} !</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Ton compte client est prêt. Tu peux maintenant parcourir les meilleures annonces du Cameroun et contacter les vendeurs en toute sécurité.
            </p>

            <div style="margin: 35px 0;">
              <a href="https://dealcity.app/" 
                 style="background-color: #1e3a8a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; display: inline-block;">
                 Explorer les annonces
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 13px; border-top: 1px solid #f9fafb; pt: 20px;">
              Tu es un commerçant ? Rendez-vous dans ton profil pour demander ton accès vendeur.
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© 2026 DealCity Cameroun. Achetez et vendez localement.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
  }
};