import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await resend.emails.send({
      from: 'DealCity <bienvenue@dealcity.app>',
      to: email,
      subject: 'Bienvenue sur DealCity ! 🇨🇲',
      html: `
        <h1>Salut ${name} !</h1>
        <p>Merci d'avoir rejoint DealCity, la plateforme n°1 pour les bonnes affaires au Cameroun.</p>
        <p>Tu peux dès maintenant poster ta première annonce gratuitement.</p>
        <a href="https://dealcity.app/annonces/nouvelle">Poster un deal</a>
      `,
    });
  } catch (error) {
    console.error("Erreur d'envoi email:", error);
  }
};