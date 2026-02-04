import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Publier une annonce",
};

export default async function Page() {
  // 1. On vérifie l'identité et le statut de l'utilisateur côté serveur
  const { user } = await validateRequest();

  // 2. Sécurité : Si pas connecté ou pas vendeur, redirection immédiate
  if (!user || !user.isSeller) {
    redirect("/"); // Tu peux remplacer par "/become-seller" si tu as cette page
  }

  return (
    <main className="flex w-full justify-center p-5">
      <div className="w-full max-w-2xl space-y-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-center">Mettre un article en vente</h1>
          <p className="text-center text-muted-foreground text-sm">
            Remplissez les détails ci-dessous pour publier votre annonce sur DealCity.
          </p>
        </div>
        
        {/* L'éditeur ne s'affiche que si la condition ci-dessus est respectée */}
        <PostEditor />
      </div>
    </main>
  );
}