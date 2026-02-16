"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("dealcity_cookie_consent");
    if (!consent) setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("dealcity_cookie_consent", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 z-[100] flex flex-col md:flex-row items-center justify-between border-t border-slate-700">
      <p className="text-sm text-center md:text-left">
        DealCity utilise des cookies pour l&apos;authentification et améliorer votre expérience. 
        Consultez notre <Link href="/confidentialite" className="underline">Politique de Confidentialité</Link>.
      </p>
      <button 
        onClick={acceptCookies}
        className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition"
      >
        Accepter
      </button>
    </div>
  );
}