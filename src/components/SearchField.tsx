"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import SearchPage from "./SearchPage"; // 👈 Import de l'interface TikTok séparée

export default function SearchField() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;

    // 🚀 SIGNAL POUR L'ALGO SUR PC
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      {/* 1. LOUPE COMPACTE POUR MOBILE (Ouvre le panneau SearchPage complet) */}
      <button
        type="button"
        aria-label="Ouvrir la recherche"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:scale-95 sm:hidden"
      >
        <SearchIcon className="size-5" />
      </button>

      {/* 2. BARRE DE RECHERCHE CLASSIQUE FIXE (Cachée sur mobile, visible sur PC/Tablette) */}
      <form onSubmit={handleSubmit} method="GET" action="/search" className="hidden sm:block w-full">
        <div className="relative">
          <Input name="q" placeholder="Search" className="pe-10" />
          <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
        </div>
      </form>

      {/* 3. L'EXPÉRIENCE TIKTOK COMPLÈTE EN PLEIN ÉCRAN SUR MOBILE */}
      {isOpen && (
        <SearchPage onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}