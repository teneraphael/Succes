import Link from "next/link";

export default function ConditionsUtilisation() {
  return <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
    <h1 className="text-3xl font-bold">Conditions d’utilisation</h1>
    <p>Dernière mise à jour : 26 septembre 2026. DealCity met en relation des acheteurs et des vendeurs au Cameroun.</p>
    <section><h2 className="text-xl font-semibold">Fonctionnement</h2><p>Les utilisateurs peuvent consulter des annonces et contacter les vendeurs, notamment par WhatsApp. DealCity ne reçoit pas le paiement des transactions conclues directement entre utilisateurs et n’organise pas leur livraison. Vérifiez le produit, le prix, l’identité de votre interlocuteur et les modalités de remise avant de payer.</p></section>
    <section><h2 className="text-xl font-semibold">Comptes et annonces</h2><p>Les utilisateurs fournissent des informations exactes et protègent leur compte. Les vendeurs répondent de l’exactitude, de la disponibilité et de la licéité de leurs annonces et produits. Les contenus trompeurs ou illicites et les atteintes aux droits des tiers sont interdits. DealCity peut retirer une annonce ou restreindre un compte en cas d’abus ou d’obligation légale.</p></section>
    <section><h2 className="text-xl font-semibold">Transactions et litiges</h2><p>Les modalités de vente sont convenues entre l’acheteur et le vendeur. Les droits impératifs des consommateurs restent applicables aux vendeurs professionnels. Conservez vos échanges et justificatifs. Pour signaler une annonce, utilisez son menu ou contactez <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>.</p></section>
    <section><h2 className="text-xl font-semibold">Contenus et données</h2><p>Vous conservez vos droits sur vos contenus et autorisez leur affichage pour le fonctionnement de DealCity. Respectez les droits sur les images, textes et marques. Consultez la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</p></section>
    <p>Questions ou réclamations concernant la plateforme : <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>. La date de toute mise à jour figure en haut de cette page.</p>
  </article>;
}
