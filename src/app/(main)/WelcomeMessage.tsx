"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useSession } from "@/app/(main)/SessionProvider";

export default function WelcomeMessage() {
  const { user } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem("welcome-message-closed");
    
    // ✅ NOUVELLE LOGIQUE : 
    // On ne l'affiche QUE si l'utilisateur est connecté (user existe)
    // ET qu'il n'est PAS encore vendeur (!user.isSeller)
    // ET qu'il n'a pas fermé le message (!isHidden)
    if (user && !user.isSeller && !isHidden) {
      setIsVisible(true);
    } else {
      // Si l'utilisateur se déconnecte, on cache le message immédiatement
      setIsVisible(false);
    }
  }, [user]); // Réagit dès que l'état de connexion change

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("welcome-message-closed", "true");
  };

  if (!isVisible || !user) return null;

  return (
    <div className="relative w-full bg-[#f0f7ff] p-8 rounded-[32px] border-2 border-dashed border-[#4a90e2]/30 flex flex-col items-center text-center space-y-4 transition-all duration-500 animate-in fade-in zoom-in">
      
      <button 
        onClick={handleClose}
        className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-white hover:text-[#4a90e2] transition-colors"
        aria-label="Fermer"
      >
        <X className="size-5" />
      </button>

      <div className="flex items-end gap-1">
        <div className="w-[4px] h-3 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-5 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-6 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-4 bg-[#4a90e2] rounded-full"></div>
        <span className="text-xl font-bold text-[#6ab344] ml-1">DealCity</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-[22px] font-bold text-[#4a90e2]">
          Content de vous voir, {user.displayName} ! 👋
        </h2>
        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          {"Boostez votre expérience sur DealCity. Pour publier vos propres offres et gérer votre boutique, devenez un vendeur certifié."}
        </p>
      </div>

      <Link 
        href="/become-seller"
        className="bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        Devenir Vendeur
      </Link>
      
      <p className="text-[10px] text-gray-400 italic">
        Cliquez sur la croix pour ne plus voir ce message
      </p>
    </div>
  );
}