import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: 'DealCity <onboarding@resend.dev>', // À changer en bienvenue@dealcity.app après validation DNS
      to: email,
      subject: 'Bienvenue chez DealCity ! 🇨🇲',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 15px; overflow: hidden;">
          
          <div style="background-color: #ffffff; padding: 20px; text-align: center;">
            <img src="https://dealcity.app/logo.png" alt="DealCity" style="width: 130px; height: auto;" />
          </div>

          <div style="padding: 30px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #1e3a8a; font-size: 22px;">Bienvenue parmi nous, ${name} !</h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Ton compte client est maintenant prêt. Tu peux désormais explorer les meilleures offres au Cameroun et contacter les vendeurs en un clic.
            </p>

            <div style="margin: 30px 0;">
              <a href="https://dealcity.app/" 
                 style="background-color: #1e3a8a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                 Voir les annonces du moment
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Tu souhaites aussi vendre sur DealCity ? <br>
              Tu pourras demander ton accès vendeur depuis ton profil.
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© 2026 DealCity Cameroun. L'app n°1 des bonnes affaires.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
  }
};