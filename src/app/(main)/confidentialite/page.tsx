import Link from "next/link";

export default function Confidentialite() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p>Dernière mise à jour : 26 septembre 2026. TENE KENGNE RAPHAEL, éditeur de DealCity à Bonabéri, Douala, est le contact pour les données traitées par la plateforme : <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>. Les <Link className="underline" href="/mentions-legales">mentions légales</Link> donnent les autres coordonnées disponibles.</p>
      <section>
        <h2 className="text-xl font-semibold">1. Quelles données et pourquoi ?</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Compte :</strong> nom d’utilisateur, nom affiché, adresse e-mail, identifiants de connexion et, si vous la choisissez, connexion par Google. Ils servent à ouvrir et sécuriser le compte.</li>
          <li><strong>Profil et annonces :</strong> photo, présentation, ville, quartier, coordonnées que vous ajoutez, annonces, images, vidéos et prix. Ils servent à présenter vos offres et à permettre la mise en relation.</li>
          <li><strong>Activité :</strong> vues, favoris, abonnements, réactions, commentaires et signalements. Ils servent au fonctionnement, au classement des annonces, à la modération et à la sécurité.</li>
          <li><strong>Profil vendeur :</strong> nom de boutique, domaine d’activité, coordonnées et localisation saisis dans le formulaire. Ces informations servent à créer et afficher le profil vendeur.</li>
          <li><strong>Notifications :</strong> un jeton d’appareil est enregistré si vous acceptez les notifications, afin d’envoyer des alertes liées au service.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">2. Qui peut voir ou traiter ces données ?</h2>
        <p>Votre profil public, vos annonces et les coordonnées que vous y affichez sont accessibles aux visiteurs. Les échanges ouverts dans WhatsApp sont ensuite soumis au fonctionnement de WhatsApp. Pour faire fonctionner DealCity, certaines données sont traitées par des prestataires : Vercel pour l’hébergement, UploadThing pour les médias, Google pour la connexion si vous la choisissez, Firebase pour les notifications et un service d’envoi d’e-mails pour les messages techniques. Ces prestataires peuvent traiter les données hors du Cameroun. N’affichez pas dans une annonce des informations personnelles que vous souhaitez garder privées.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">3. Conservation et sécurité</h2>
        <p>Les données nécessaires au compte sont conservées pendant son utilisation. Des informations liées à la sécurité, à un signalement ou à une obligation légale peuvent devoir être conservées plus longtemps. Les mots de passe définis sur DealCity sont stockés sous forme hachée. L’accès aux données est limité aux fonctions du service et aux prestataires nécessaires ; aucune sécurité technique n’est absolue.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">4. Vos choix et vos droits</h2>
        <p>Vous pouvez modifier certaines informations depuis votre profil et demander l’accès, la rectification ou la suppression de données vous concernant en écrivant à <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>. Vous pouvez aussi demander des précisions sur l’utilisation de vos données ou exercer les autres droits prévus par les règles applicables. La suppression du compte est proposée dans les paramètres ; contactez-nous si elle échoue ou si vous souhaitez connaître les données éventuellement conservées pour une obligation légale. Les notifications peuvent être refusées dans votre navigateur ou appareil.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">5. Cookies</h2>
        <p>Des cookies et stockages locaux sont utilisés pour la session, la sécurité et les préférences. Les détails se trouvent sur la <Link className="underline" href="/cookies">page Cookies</Link>. Si une mesure d’audience facultative est activée ultérieurement, cette page et les choix proposés aux visiteurs devront être mis à jour.</p>
      </section>
    </article>
  );
}
