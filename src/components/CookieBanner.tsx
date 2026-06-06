"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck } from "lucide-react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  // ✅ Vérification localStorage côté client uniquement — évite les erreurs d'hydratation
  useEffect(() => {
    const consent = localStorage.getItem("dealcity_cookie_consent");
    if (!consent) setShowBanner(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("dealcity_cookie_consent", "accepted");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-sm bg-card border border-border/60 shadow-2xl shadow-black/10 p-5 rounded-3xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ✅ Dégradé décoratif DealCity en arrière-plan */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute -top-6 -right-6 size-24 rounded-full bg-[#4a90e2]/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-[#6ab344]/5 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-4">

        {/* ✅ En-tête avec logo DealCity mini */}
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
            <Cookie className="size-4 text-[#4a90e2]" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight text-foreground leading-none">
              Vie privée
            </p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              DealCity
            </p>
          </div>
        </div>

        {/* ✅ Texte explicatif */}
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          DealCity utilise des cookies essentiels pour l&apos;authentification et le bon fonctionnement du site. En continuant, vous acceptez notre{" "}
          <Link
            href="/confidentialite"
            className="text-[#4a90e2] hover:underline font-black"
          >
            politique de confidentialité
          </Link>.
        </p>

        {/* ✅ Bouton accepter — bleu DealCity */}
        <button
          onClick={acceptCookies}
          className="w-full h-11 bg-[#4a90e2] hover:bg-[#357abd] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#4a90e2]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        >
          <ShieldCheck className="size-3.5" />
          Accepter et continuer
        </button>
      </div>
    </div>
  );
}