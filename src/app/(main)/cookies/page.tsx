import Link from "next/link";

export default function Cookies() {
  return <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
    <h1 className="text-3xl font-bold">Cookies et stockage local</h1>
    <p>Dernière mise à jour : 26 septembre 2026.</p>
    <p>DealCity utilise des cookies nécessaires à la connexion et à la sécurité. Les choix de ville et de quartier peuvent être conservés sur votre appareil pour retrouver les annonces pertinentes. Vous pouvez les effacer dans votre navigateur ; certaines préférences devront être configurées à nouveau.</p>
    <p>Une mesure d’audience peut être activée sur le site. Consultez la <Link href="/confidentialite" className="underline">politique de confidentialité</Link> pour comprendre les données traitées et contacter le responsable.</p>
  </article>;
}
