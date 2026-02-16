export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      <div className="prose prose-blue">
        <p>Chez DealCity, nous respectons votre vie privée. Cette politique détaille comment nous traitons vos données.</p>
        <h2 className="text-xl font-semibold mt-4">1. Données collectées</h2>
        <p>Nous collectons votre email, votre nom d&apos;utilisateur et vos messages de chat via Stream.io.</p>
        <h2 className="text-xl font-semibold mt-4">2. Notifications</h2>
        <p>Nous stockons un jeton (token) Firebase pour vous envoyer des alertes en temps réel.</p>
        <h2 className="text-xl font-semibold mt-4">3. Vos droits</h2>
        <p>Vous pouvez supprimer votre compte et vos données à tout moment depuis vos paramètres.</p>
      </div>
    </div>
  );
}