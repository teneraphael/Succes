"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react"; // Import de l'icône de fermeture

export default function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // On vérifie si l'utilisateur a déjà fermé ce message par le passé
    const isHidden = localStorage.getItem("welcome-message-closed");
    if (!isHidden) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // On enregistre le choix pour que le message ne revienne pas
    localStorage.setItem("welcome-message-closed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-[#f0f7ff] p-8 rounded-[32px] border-2 border-dashed border-[#4a90e2]/30 flex flex-col items-center text-center space-y-4 transition-all duration-500 animate-in fade-in zoom-in">
      
      {/* BOUTON FERMER (X) */}
      <button 
        onClick={handleClose}
        className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:bg-white hover:text-[#4a90e2] transition-colors"
        aria-label="Fermer"
      >
        <X className="size-5" />
      </button>

      {/* Logo DealCity Miniature */}
      <div className="flex items-end gap-1">
        <div className="w-[4px] h-3 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-5 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-6 bg-[#4a90e2] rounded-full"></div>
        <div className="w-[4px] h-4 bg-[#4a90e2] rounded-full"></div>
        <span className="text-xl font-bold text-[#6ab344] ml-1">DealCity</span>
      </div>

      <div className="space-y-1">
        <h2 className="text-[22px] font-bold text-[#4a90e2]">
          Bienvenue parmi nous ! 👋
        </h2>
        <p className="text-gray-600 text-sm max-w-sm mx-auto">
          {"Explorez les meilleures offres. Pour publier vos produits, devenez un vendeur certifié."}
        </p>
      </div>

      <Link 
        href="/become-seller"
        className="bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        Become Seller
      </Link>
      
      <p className="text-[10px] text-gray-400 italic">
        {"Cliquez sur la croix pour ne plus voir ce message"}
      </p>
    </div>
  );
}