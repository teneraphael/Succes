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
    <div className="flex items-center">
      {/* ✅ Loupe mobile — ouvre SearchPage plein écran */}
      <button
        type="button"
        aria-label="Ouvrir la recherche"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all active:scale-95 sm:hidden"
      >
        <SearchIcon className="size-5" />
      </button>

      {/* ✅ Barre de recherche PC — soumet via Entrée ou clic loupe */}
      <form onSubmit={handleSubmit} className="hidden sm:block w-full">
        <div className="relative">
          <Input
            name="q"
            placeholder="Rechercher un produit..."
            className="pe-10 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 focus-visible:border-[#4a90e2]/30 focus-visible:ring-1 focus-visible:ring-[#4a90e2]/10 text-sm transition-all placeholder:text-muted-foreground/50"
          />
          {/* ✅ Bouton submit pour soumettre au clic sur la loupe */}
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#4a90e2] transition-colors"
            aria-label="Rechercher"
          >
            <SearchIcon className="size-4" />
          </button>
        </div>
      </form>

      {/* ✅ SearchPage mobile plein écran */}
      {isOpen && (
        <SearchPage onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}