import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      /**
       * RAPPEL : Une fois que tes 55 min sont passées et que ton domaine est "Verified",
       * remplace 'onboarding@resend.dev' par 'bienvenue@dealcity.app'
       */
      from: 'DealCity <onboarding@resend.dev>', 
      to: email,
      subject: 'Bienvenue sur DealCity ! 🇨🇲',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          
          <div style="background-color: #f0f7ff; padding: 30px; text-align: center;">
            <img src="https://dealcity.app/logo.png" alt="DealCity" style="width: 140px; height: auto; margin-bottom: 10px;" />
            <div style="height: 4px; width: 40px; background-color: #4a90e2; margin: 10px auto; border-radius: 2px;"></div>
          </div>

          <div style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
            <h1 style="color: #6ab344; font-size: 28px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; font-style: italic;">
              Salut ${name} !
            </h1>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Bienvenue dans l'aventure <strong>DealCity</strong> ! <br /> 
              La plateforme n°1 pour faire des bonnes affaires au Cameroun.
            </p>

            <p style="color: #4b5563; font-size: 16px; margin-bottom: 35px;">
              Ton compte est activé. Tu as un article à vendre ? N'attends plus, c'est le moment de poster ton premier deal !
            </p>

            <a href="https://dealcity.app/annonces/nouvelle" 
               style="background-color: #5cb85c; color: white; padding: 18px 35px; text-decoration: none; border-radius: 15px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 15px rgba(92, 184, 92, 0.3);">
               🚀 POSTER MON DEAL
            </a>
          </div>

          <div style="background-color: #f9fafb; padding: 25px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f0f0f0;">
            <p style="margin-bottom: 10px;">Vendez. Achetez. Économisez.</p>
            <p><strong>DealCity Cameroun</strong> — Douala, Yaoundé et tout le pays.</p>
            <div style="margin-top: 15px;">
              <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Aide</a> • 
              <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Désinscription</a>
            </div>
          </div>
        </div>
      `,
    });
    console.log(`Email de bienvenue envoyé à : ${email}`);
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
  }
};