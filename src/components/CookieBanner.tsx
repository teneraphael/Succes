"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem("dealcity_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("dealcity_cookie_consent", "accepted");
    setShowBanner(false);
  };

  // On ne rend rien côté serveur pour éviter les erreurs d'hydratation
  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-5 rounded-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍪</span>
          <h3 className="font-bold text-slate-900 dark:text-white">Respect de votre vie privée</h3>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          DealCity utilise des cookies essentiels pour l&apos;authentification (via Google) et le bon fonctionnement du site. 
          En continuant, vous acceptez notre{" "}
          <Link href="/confidentialite" className="text-blue-600 hover:underline font-medium">
            politique de confidentialité
          </Link>.
        </p>

        <div className="flex gap-2 mt-2">
          <button 
            onClick={acceptCookies}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          >
            Accepter et continuer
          </button>
        </div>
      </div>
    </div>
  );
}