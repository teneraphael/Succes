"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import SearchPage from "./SearchPage";

export default function SearchField() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      {/* 1. LOUPE MOBILE */}
      <button
        type="button"
        aria-label="Ouvrir la recherche"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors active:scale-95 sm:hidden"
      >
        <SearchIcon className="size-5" />
      </button>

      {/* 2. BARRE PC — ✅ plus de action="/search" qui entre en conflit */}
      <form
        onSubmit={handleSubmit}
        className="hidden sm:block w-full"
      >
        <div className="relative">
          <Input
            name="q"
            placeholder="Rechercher un produit..."
            className="pe-10 rounded-full bg-muted/50 border-none focus-visible:ring-1"
          />
          {/* ✅ Bouton submit invisible pour que Entrée fonctionne */}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Rechercher"
          >
            <SearchIcon className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </div>
      </form>

      {/* 3. SEARCHPAGE MOBILE PLEIN ÉCRAN */}
      {isOpen && (
        <SearchPage onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}