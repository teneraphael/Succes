"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { useEffect } from "react";

export default function LanguageSync({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();

  // Change l'attribut lang de <html lang="..."> dynamiquement
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div key={lang} className="contents">
      {children}
    </div>
  );
}