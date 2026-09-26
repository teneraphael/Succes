import Link from "next/link";

export default function ConditionsUtilisation() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold">Conditions d’utilisation</h1>
      <p>Dernière mise à jour : 26 septembre 2026. DealCity est un service de publication d’annonces et de mise en relation au Cameroun. Vous pouvez consulter les annonces sans compte ; certaines fonctions nécessitent une inscription.</p>
      <section>
        <h2 className="text-xl font-semibold">1. Comptes et annonces</h2>
        <p>Vous devez fournir des informations exactes, protéger vos accès et ne publier que des contenus que vous avez le droit d’utiliser. Chaque vendeur répond de la description, du prix, de la disponibilité, de la légalité et des conditions de vente de ses produits. Sont interdits notamment les annonces trompeuses, les produits illicites, les atteintes aux droits d’autrui, le harcèlement et les tentatives de fraude.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">2. Achats entre utilisateurs</h2>
        <p>DealCity affiche les annonces et facilite la prise de contact, notamment par WhatsApp. Le prix des produits, leur paiement et leur remise sont convenus directement entre acheteur et vendeur : DealCity ne collecte pas le paiement de ces achats sur la plateforme. Avant une transaction, vérifiez le produit, le prix, l’identité de votre interlocuteur et les modalités de remise. Les droits que la loi reconnaît aux consommateurs face aux vendeurs professionnels restent applicables.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">3. Activation vendeur</h2>
        <p>Une page distincte propose l’activation d’un compte vendeur pour 5 000 XAF, avec un paiement traité par Monetbil. Le montant affiché avant validation fait foi pour cette prestation. Le paiement de l’activation vendeur est distinct des ventes de produits entre utilisateurs. Pour une question sur un paiement, un échec d’activation ou une demande de remboursement, contactez l’éditeur avec la référence de transaction ; chaque demande sera examinée selon la prestation effectivement fournie et les règles applicables.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">4. Modération et signalements</h2>
        <p>Vous pouvez signaler une annonce depuis son menu ou écrire à <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a> en fournissant son lien et le motif du signalement. DealCity peut retirer des contenus ou limiter l’accès à un compte en cas de violation de ces règles ou d’obligation légale. Pour un litige lié à un achat, conservez vos échanges et justificatifs et contactez d’abord votre vendeur.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">5. Contenus, données et contact</h2>
        <p>Vous conservez vos droits sur les contenus que vous publiez et autorisez leur affichage sur DealCity pour le fonctionnement du service. Consultez la <Link href="/confidentialite" className="underline">politique de confidentialité</Link> pour le traitement des données. Pour toute question sur la plateforme : <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>. En cas de mise à jour des présentes conditions, la nouvelle date apparaîtra en haut de cette page.</p>
      </section>
    </article>
  );
}
