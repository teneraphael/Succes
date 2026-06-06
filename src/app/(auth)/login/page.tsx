import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion - DealCity",
};

function DealCityLogo() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex items-end gap-[5px]">
        <div className="w-[8px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
        <div className="w-[8px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
        <div className="w-[8px] h-12 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
        <div className="w-[8px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
      </div>
      <span className="text-4xl font-black text-[#6ab344] tracking-tight leading-none pb-1">
        DealCity
      </span>
    </div>
  );
}

export default function Page() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0fff4] dark:from-[#0a0f1a] dark:via-[#0a0a0a] dark:to-[#0a0f0a] p-4 sm:p-8 transition-colors duration-300">

      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-[500px] rounded-full bg-[#4a90e2]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-[500px] rounded-full bg-[#6ab344]/5 blur-3xl" />

      {/* Bouton retour */}
      <Link
        href="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-muted-foreground hover:text-[#4a90e2] transition-colors group z-10"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-border group-hover:border-[#4a90e2]/30 transition-all">
          <ArrowLeft size={16} />
        </div>
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
          Retour
        </span>
      </Link>

      <div className="w-full max-w-[420px] flex flex-col items-center gap-8">

        {/* Logo */}
        <DealCityLogo />

        {/* Titre */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-[#4a90e2]">
            Content de vous revoir !
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Connectez-vous pour booster vos ventes.
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="w-full bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#4a90e2]/8 border border-[#4a90e2]/10 dark:border-white/5 p-6 sm:p-8">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-sm text-muted-foreground font-medium">
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-[#4a90e2] font-black hover:underline uppercase tracking-tight italic"
            >
              Créer un compte
            </Link>
          </p>

          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-zinc-800/60 rounded-full border border-[#6ab344]/20 backdrop-blur-sm">
            <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Achat & Vente sécurisés
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}