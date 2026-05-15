export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <div className="prose prose-blue dark:prose-invert">
        <p>
          La protection de vos données est une priorité pour nous. Cette politique détaille comment nous traitons vos informations au sein de notre plateforme.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Données collectées</h2>
        <p>
          Nous collectons uniquement les informations nécessaires au bon fonctionnement de vos services :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Informations de profil :</strong> Votre email, nom d&apos;utilisateur et photo de profil (via Google ou inscription directe).</li>
          <li><strong>Données d&apos;activité :</strong> Les réservations et interactions effectuées sur la plateforme.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">2. Notifications et Sécurité</h2>
        <p>
          Nous utilisons <strong>Firebase</strong> pour stocker un jeton (token) de notification unique. Ce jeton nous permet de vous envoyer des alertes importantes en temps réel sur l&apos;état de vos services. 
          Vos mots de passe sont sécurisés via un hachage de pointe et ne sont jamais stockés en clair.
        </p>

        <h2 className="text-xl font-semibold mt-6">3. Conservation des données</h2>
        <p>
          Vos données sont conservées aussi longtemps que votre compte est actif. Nous utilisons <strong>Prisma</strong> avec une base de données sécurisée pour garantir l&apos;intégrité de vos informations.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Vos droits</h2>
        <p>
          Conformément aux réglementations en vigueur, vous disposez d&apos;un droit d&apos;accès, de modification et de suppression de vos données. Vous pouvez fermer votre compte à tout moment depuis votre espace personnel, ce qui entraînera la suppression définitive de vos données privées.
        </p>
      </div>
    </div>
  );
}