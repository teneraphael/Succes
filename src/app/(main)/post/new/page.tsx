import { validateRequest } from "@/auth";
import PostEditor from "@/components/posts/editor/PostEditor";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";

export const metadata: Metadata = {
  title: "Publier une annonce — DealCity",
};

export default async function Page() {
  const { user } = await validateRequest();

  if (!user || !user.isSeller) {
    redirect("/");
  }

  return (
    <main className="flex w-full justify-center px-4 py-8 min-h-screen bg-gradient-to-b from-[#f0f7ff] to-white dark:from-[#0a0f1a] dark:to-[#0a0a0a] transition-colors">
      <div className="w-full max-w-2xl space-y-7">

        {/* En-tête */}
        <div className="flex flex-col items-center gap-3 pt-2">
          {/* Logo mini */}
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-[4px]">
              <div className="w-[5px] h-4 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-6 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-8 bg-[#4a90e2] rounded-sm" />
              <div className="w-[5px] h-5 bg-[#4a90e2] rounded-sm" />
            </div>
            <span className="text-xl font-black text-[#6ab344] tracking-tight">
              DealCity
            </span>
          </div>

          {/* Titre */}
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <Store className="size-5 text-[#4a90e2]" />
              <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
                Publier une annonce
              </h1>
            </div>
            <p className="text-xs text-muted-foreground font-medium max-w-sm">
              Remplissez les détails ci-dessous pour mettre votre article en vente sur DealCity.
            </p>
          </div>
        </div>

        {/* Conteneur éditeur */}
        <div className="relative group">
          {/* Lueur DealCity au survol */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4a90e2] to-[#6ab344] rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-700" />

          <div className="relative bg-card rounded-3xl p-4 md:p-7 shadow-xl border border-[#4a90e2]/10 dark:border-white/5">
            <PostEditor />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 py-2 opacity-40">
          <div className="h-px w-10 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[3px]">
              <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
              <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
              <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
              <div className="w-[4px] h-3.5 bg-[#4a90e2] rounded-sm" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Seller Studio
            </span>
          </div>
          <div className="h-px w-10 bg-border" />
        </div>

      </div>
    </main>
  );
}