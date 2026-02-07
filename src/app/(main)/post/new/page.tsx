import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Publier une annonce",
};

export default async function Page() {
  const { user } = await validateRequest();

  if (!user || !user.isSeller) {
    redirect("/");
  }

  return (
    <main className="flex w-full justify-center p-5 bg-muted/20 min-h-screen">
      <div className="w-full max-w-2xl space-y-8 pt-6">
        
        {/* TES TITRES D'ORIGINE (Inchangés) */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-center">Mettre un article en vente</h1>
          <p className="text-center text-muted-foreground text-sm">
            Remplissez les détails ci-dessous pour publier votre annonce sur DealCity.
          </p>
        </div>
        
        {/* LE STYLE SE CONCENTRE ICI : LE CONTENEUR DE POST */}
        <div className="relative group">
          {/* Effet de lueur en arrière-plan au survol */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#83c5be] rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative bg-card rounded-[2.5rem] p-4 md:p-8 shadow-2xl border border-border/50 ring-1 ring-black/5">
             <PostEditor />
          </div>
        </div>

        {/* PETITE INFO DE RÉASSURANCE EN BAS */}
        <div className="flex justify-center items-center gap-4 py-4 opacity-50">
          <div className="h-px w-12 bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest">DealCity Seller Studio</span>
          <div className="h-px w-12 bg-border" />
        </div>

      </div>
    </main>
  );
}