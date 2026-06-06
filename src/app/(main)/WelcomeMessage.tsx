"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Store } from "lucide-react";
import { useSession } from "@/app/(main)/SessionProvider";

export default function WelcomeMessage() {
  const { user } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem("welcome-message-closed");

    // ✅ Affiché uniquement si connecté + non vendeur + pas encore fermé
    if (user && !user.isSeller && !isHidden) {
      setIsVisible(true);
    } else {
      // ✅ Caché immédiatement si déconnexion ou passage en vendeur
      setIsVisible(false);
    }
  }, [user]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("welcome-message-closed", "true");
  };

  if (!isVisible || !user) return null;

  return (
    <div className="relative w-full bg-gradient-to-br from-[#f0f7ff] to-[#f0fff4] dark:from-[#0a0f1a] dark:to-[#0a0f0a] p-6 sm:p-8 rounded-3xl border border-[#4a90e2]/15 dark:border-[#4a90e2]/10 shadow-sm animate-in fade-in zoom-in duration-300">

      {/* ✅ Dégradé décoratif DealCity en arrière-plan */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute -top-10 -right-10 size-40 rounded-full bg-[#4a90e2]/5 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-[#6ab344]/5 blur-2xl" />
      </div>

      {/* ✅ Bouton fermer */}
      <button
        onClick={handleClose}
        className="absolute right-4 top-4 p-1.5 rounded-xl text-muted-foreground hover:bg-[#4a90e2]/10 hover:text-[#4a90e2] transition-all active:scale-90"
        aria-label="Fermer"
      >
        <X className="size-4" />
      </button>

      <div className="relative flex flex-col items-center text-center space-y-5">

        {/* ✅ Logo DealCity animé */}
        <div className="flex items-end gap-2">
          <div className="flex items-end gap-[4px]">
            <div className="w-[5px] h-4 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
            <div className="w-[5px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
            <div className="w-[5px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
            <div className="w-[5px] h-5 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
          </div>
          <span className="text-xl font-black text-[#6ab344] tracking-tight leading-none pb-0.5">
            DealCity
          </span>
        </div>

        {/* ✅ Titre + message personnalisé */}
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#4a90e2]">
            Content de vous voir, {user.displayName} ! 👋
          </h2>
          <p className="text-muted-foreground text-xs font-medium max-w-sm mx-auto leading-relaxed">
            Boostez votre expérience sur DealCity. Publiez vos propres offres et gérez votre boutique en devenant un vendeur certifié.
          </p>
        </div>

        {/* ✅ Bouton devenir vendeur — vert DealCity */}
        <Link
          href="/become-seller"
          className="flex items-center gap-2 bg-[#6ab344] hover:bg-[#5a9a38] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#6ab344]/20 transition-all hover:scale-105 active:scale-95"
        >
          <Store className="size-4" />
          Devenir Vendeur
        </Link>

        {/* ✅ Hint fermeture */}
        <p className="text-[10px] text-muted-foreground/60 font-medium italic">
          Cliquez sur la croix pour ne plus voir ce message.
        </p>
      </div>
    </div>
  );
}