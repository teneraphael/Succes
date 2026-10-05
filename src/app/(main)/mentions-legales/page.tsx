import Link from "next/link";

export default function MentionsLegales() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold">Mentions légales</h1>
      <p>Dernière mise à jour : 26 septembre 2026.</p>
      <section>
        <h2 className="text-xl font-semibold">Éditeur de DealCity</h2>
        <p>TENE KENGNE RAPHAEL, Bonabéri, Douala, Cameroun.</p>
        <p>Contact : <a className="underline" href="mailto:teneraphael57@gmail.com">teneraphael57@gmail.com</a>.</p>
        <p>Responsable de la publication : TENE KENGNE RAPHAEL.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Hébergement</h2>
        <p>Le site est déployé sur Vercel. Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Contenu du site</h2>
        <p>DealCity présente des annonces publiées par ses utilisateurs. Les textes, images et marques de ces annonces restent soumis aux droits de leurs titulaires. Pour signaler une annonce ou demander le retrait d’un contenu portant atteinte à vos droits, indiquez son lien et le motif de votre demande par courriel à l’adresse ci-dessus.</p>
      </section>
      <p>Consultez aussi les <Link href="/conditions-utilisation" className="underline">conditions d’utilisation</Link> et la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</p>
    </article>
  );
}
