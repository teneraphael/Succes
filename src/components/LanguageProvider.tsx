"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "@/lib/translations";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.fr;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("dealcity-lang") as Language;
    if (savedLang && (savedLang === "fr" || savedLang === "en")) {
      setLangState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("dealcity-lang", newLang);
  };

  // On calcule "t" à chaque rendu basé sur l'état "lang"
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook sécurisé
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  // Si le contexte est introuvable, on renvoie les valeurs FR par défaut au lieu de crash
  if (!context) {
    return {
      lang: "fr" as Language,
      setLang: () => {},
      t: translations.fr,
    };
  }
  return context;
};