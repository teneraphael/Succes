import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un compte - DealCity",
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
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0fff4] via-white to-[#f0f7ff] dark:from-[#0a0f0a] dark:via-[#0a0a0a] dark:to-[#0a0f1a] p-4 sm:p-8 transition-colors duration-300">

      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -top-32 -right-32 size-[500px] rounded-full bg-[#6ab344]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-[#4a90e2]/5 blur-3xl" />

      {/* Bouton retour */}
      <Link
        href="/"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-muted-foreground hover:text-[#6ab344] transition-colors group z-10"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-border group-hover:border-[#6ab344]/30 transition-all">
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
          <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-[#6ab344]">
            Rejoindre l&apos;aventure
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Créez votre profil et commencez à vendre en quelques secondes.
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="w-full bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#6ab344]/8 border border-[#6ab344]/10 dark:border-white/5 p-6 sm:p-8">
          <SignUpForm />
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-sm text-muted-foreground font-medium">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-[#4a90e2] font-black hover:underline uppercase tracking-tight italic"
            >
              Se connecter
            </Link>
          </p>

          <div className="flex items-center gap-3 px-5 py-2.5 bg-white/60 dark:bg-zinc-800/60 rounded-full border border-[#6ab344]/20 backdrop-blur-sm">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-5 rounded-full border-2 border-white dark:border-zinc-800 bg-gradient-to-br from-[#4a90e2] to-[#6ab344]"
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Rejoins +1000 vendeurs
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}