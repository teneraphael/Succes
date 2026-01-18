"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WelcomeMessage() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Le message disparaît après 10 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 100000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#f0f7ff] p-8 rounded-3xl border-2 border-dashed border-[#4a90e2]/30 flex flex-col items-center text-center space-y-4 transition-all duration-500 animate-in fade-in zoom-in">
      
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
          Explorez les meilleures offres. Pour publier vos produits, devenez un vendeur certifié.
        </p>
      </div>

      <Link 
        href="/become-seller"
        className="bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        Become Seller
      </Link>
      
      <p className="text-[10px] text-gray-400 italic">Ce message disparaîtra dans quelques secondes...</p>
    </div>
  );
}