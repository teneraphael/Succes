import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await validateRequest();

  // Si une session existe déjà, on redirige vers l'accueil
  // On laisse l'accès libre uniquement aux visiteurs non-connectés
  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full">
      {/* Tu pourrais ajouter ici un composant commun aux pages auth si besoin */}
      {children}
    </div>
  );
}