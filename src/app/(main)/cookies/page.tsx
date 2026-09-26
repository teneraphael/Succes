import Link from "next/link";

export default function Cookies() {
  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 leading-relaxed">
      <h1 className="text-3xl font-bold">Cookies et stockage local</h1>
      <p>Dernière mise à jour : 26 septembre 2026.</p>
      <p>DealCity conserve sur votre appareil les éléments nécessaires à la connexion et à la sécurité, ainsi que certains choix pratiques comme la ville et le quartier affichés. Le site peut aussi mémoriser que vous avez fermé la notice de cookies ou choisi de répondre à la demande de notifications. Ces données permettent de retrouver votre session ou vos préférences ; supprimer les cookies dans le navigateur peut vous déconnecter et réinitialiser ces choix.</p>
      <p>Les notifications ne sont activées qu’après votre accord dans le navigateur ou l’appareil. Les scripts de mesure d’audience facultative ne sont pas chargés dans cette version du site. Si de tels outils sont ajoutés, les informations et les choix correspondants devront être actualisés avant leur activation.</p>
      <p>Consultez la <Link href="/confidentialite" className="underline">politique de confidentialité</Link> pour connaître les données traitées et contacter l’éditeur.</p>
    </article>
  );
}
