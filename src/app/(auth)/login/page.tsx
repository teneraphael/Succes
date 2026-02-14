import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion - DealCity",
};

export default function Page() {
  return (
    // Changement : min-h-svh et p-0 (plus de marges sur les côtés sur mobile)
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#f0f7ff] dark:bg-[#0a0a0a] p-0 sm:p-6 font-sans relative transition-colors duration-300">
      
      {/* BOUTON RETOUR */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-[#4b5563] dark:text-gray-400 hover:text-[#4a90e2] transition-colors group z-10"
      >
        <div className="p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm group-hover:shadow-md transition-all border border-transparent dark:border-white/5">
          <ArrowLeft size={18} />
        </div>
        <span className="hidden sm:block text-xs font-black uppercase tracking-widest">Continuer la visite</span>
      </Link>

      {/* Conteneur principal : px-0 sur mobile pour utiliser 100% de la largeur */}
      <div className="w-full sm:max-w-[440px] flex flex-col items-center px-0 sm:px-0 py-8">
        
        {/* Ton Logo DealCity Exact */}
        <div className="flex items-end gap-2 mb-6 sm:mb-8 scale-90 md:scale-100">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]"></div>
          </div>
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        {/* Ton Bloc Titre Exact */}
        <div className="text-center mb-6 sm:mb-10 space-y-2 px-4">
          <h1 className="text-[#4a90e2] dark:text-[#5ba1f3] text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Content de vous revoir !
          </h1>
          <p className="text-sm text-[#4b5563]/70 dark:text-gray-400 font-medium">
            Connectez-vous pour booster vos ventes et interagir.
          </p>
        </div>

        {/* LE FORMULAIRE : Adapté pour coller aux bords sur mobile (rounded-none et p-0) */}
        <div className="w-full mb-8 bg-white dark:bg-zinc-900 p-0 sm:p-2 rounded-none sm:rounded-[2.5rem] shadow-xl shadow-[#4a90e2]/5 dark:shadow-none border-y sm:border border-transparent dark:border-white/5">
          <div className="bg-white dark:bg-zinc-900 rounded-none sm:rounded-[2.3rem] p-6 sm:p-8">
             <LoginForm />
          </div>
        </div>

        {/* Ton Pied de page Exact */}
        <div className="flex flex-col items-center gap-6 w-full px-4">
            <p className="text-[#4b5563] dark:text-gray-400 text-sm font-medium">
              Pas encore de compte ?{" "}
              <Link href="/signup" className="text-[#4a90e2] dark:text-[#5ba1f3] font-black hover:underline uppercase tracking-tighter italic">
                Créer un compte
              </Link>
            </p>

            <div className="px-4 py-2 bg-white/50 dark:bg-zinc-800/50 rounded-full border border-white dark:border-white/10 flex items-center gap-2 backdrop-blur-sm">
                <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground dark:text-gray-400 uppercase tracking-widest">Achat & Vente sécurisés</span>
            </div>
        </div>
      </div>
    </main>
  );
}