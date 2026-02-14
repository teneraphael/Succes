import { Metadata } from "next";
import Link from "next/link";
import SignUpForm from "./SignUpForm";
import { ArrowLeft, UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un compte - DealCity",
};

export default function Page() {
  return (
    // min-h-svh : s'adapte au clavier mobile sans créer de scroll inutile
    // p-0 sur mobile pour coller aux bords de l'écran
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#f0f7ff] dark:bg-[#0a0a0a] p-0 sm:p-6 font-sans transition-colors duration-300">
      
      {/* BOUTON RETOUR : Repositionné pour le mobile */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-[#4b5563] dark:text-gray-400 hover:text-[#4a90e2] transition-colors group z-20"
      >
        <div className="p-2 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-transparent dark:border-white/5">
          <ArrowLeft size={18} />
        </div>
        <span className="hidden sm:block text-xs font-black uppercase tracking-widest">Voir les annonces</span>
      </Link>

      {/* Conteneur principal : w-full sur mobile */}
      <div className="flex w-full flex-col items-center justify-center sm:max-w-[440px] px-0 sm:px-0 py-8">
        
        {/* Logo DealCity Animé */}
        <div className="flex items-end gap-2 mb-6 sm:mb-8 scale-90 md:scale-100">
          <div className="flex items-end gap-[4px]">
            <div className="w-[7px] h-6 bg-[#4a90e2] rounded-full animate-bounce"></div>
            <div className="w-[7px] h-10 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-[7px] h-12 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <div className="w-[7px] h-8 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:0.6s]"></div>
          </div>
          <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
        </div>

        {/* Bloc Titre */}
        <div className="text-center mb-6 sm:mb-10 space-y-2 px-6">
          <div className="flex items-center justify-center gap-2 text-[#4a90e2] dark:text-[#5ba1f3]">
            <UserPlus size={24} />
            <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">
              Rejoindre l&apos;aventure
            </h1>
          </div>
          <p className="text-sm text-[#4b5563]/70 dark:text-gray-400 font-medium italic">
            Créez votre profil et commencez à vendre.
          </p>
        </div>

        {/* Conteneur Formulaire : shadow-none et border-none sur mobile pour l'immersion */}
        <div className="w-full bg-white dark:bg-zinc-900 sm:rounded-[2.5rem] shadow-none sm:shadow-2xl border-none sm:border sm:border-white/5">
          <div className="w-full px-6 py-8 sm:p-10">
            <SignUpForm />
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 flex flex-col items-center gap-6 w-full px-6">
          <p className="text-[#4b5563] dark:text-gray-400 text-sm font-medium">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-[#4a90e2] dark:text-[#5ba1f3] font-black hover:underline uppercase italic">
              Se connecter
            </Link>
          </p>

          {/* Badge Garantie */}
          <div className="px-5 py-2.5 bg-white/60 dark:bg-zinc-800/50 rounded-full border border-white dark:border-white/10 shadow-sm flex items-center gap-3 backdrop-blur-sm">
            <div className="flex -space-x-2">
               {[1,2,3].map((i) => (
                 <div key={i} className="size-5 rounded-full border-2 border-white dark:border-zinc-800 bg-gray-200 dark:bg-zinc-700" />
               ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground dark:text-gray-400 uppercase tracking-widest">
              Rejoins +1000 vendeurs
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}