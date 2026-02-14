import { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Connexion - DealCity",
};

export default function Page() {
  return (
    // bg-[#f0f7ff] -> dark:bg-[#0a0a0a] (noir profond pour faire ressortir les cartes)
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] dark:bg-[#0a0a0a] p-6 font-sans relative transition-colors duration-300">
      
      {/* BOUTON RETOUR DISCRET */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-[#4b5563] dark:text-gray-400 hover:text-[#4a90e2] transition-colors group"
      >
        <div className="p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm group-hover:shadow-md transition-all border border-transparent dark:border-white/5">
          <ArrowLeft size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Continuer la visite</span>
      </Link>

      <div className="w-full max-w-[400px] flex flex-col items-center">
        
        {/* Logo DealCity */}
        <div className="flex items-end gap-2 mb-8 scale-90 md:scale-100">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]"></div>
          </div>
          {/* Le vert reste vert, il ressort bien sur le noir */}
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        {/* Bloc Titre */}
        <div className="text-center mb-10 space-y-2">
          {/* On éclaircit légèrement le bleu en dark mode pour le contraste */}
          <h1 className="text-[#4a90e2] dark:text-[#5ba1f3] text-2xl md:text-3xl font-black italic uppercase tracking-tighter">
            Content de vous revoir !
          </h1>
          <p className="text-sm text-[#4b5563]/70 dark:text-gray-400 font-medium">
            Connectez-vous pour booster vos ventes et interagir.
          </p>
        </div>

        {/* Le formulaire (on adapte le relief et le fond) */}
        {/* shadow-[#4a90e2]/5 devient plus subtil ou disparait en dark mode */}
        <div className="w-full mb-10 bg-white dark:bg-zinc-900 p-2 rounded-[2.5rem] shadow-xl shadow-[#4a90e2]/5 dark:shadow-none border border-transparent dark:border-white/5">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.3rem] p-6">
             <LoginForm />
          </div>
        </div>

        {/* Lien de pied de page */}
        <div className="flex flex-col items-center gap-6">
            <p className="text-[#4b5563] dark:text-gray-400 text-sm font-medium">
              Pas encore de compte ?{" "}
              <Link href="/signup" className="text-[#4a90e2] dark:text-[#5ba1f3] font-black hover:underline uppercase tracking-tighter italic">
                Créer un compte
              </Link>
            </p>

            {/* Mention de confiance */}
            <div className="px-4 py-2 bg-white/50 dark:bg-zinc-800/50 rounded-full border border-white dark:border-white/10 flex items-center gap-2 backdrop-blur-sm">
                <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground dark:text-gray-400 uppercase tracking-widest">Achat & Vente sécurisés</span>
            </div>
        </div>
      </div>
    </main>
  );
}