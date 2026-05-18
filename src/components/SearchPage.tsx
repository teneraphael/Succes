"use client";

import { useState, useEffect } from "react";
import { SearchIcon, X, Clock, Trash2, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

interface SearchPageProps {
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  "Sac en Bogolan",
  "Bomber Ndop",
  "Chaussures artisanales",
  "Veste en pagne",
  "Fourtou chic"
];

export default function SearchPage({ onClose }: SearchPageProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("dealcity-search-history");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleExecuteSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updatedHistory = [
      trimmed,
      ...recentSearches.filter((item) => item !== trimmed)
    ].slice(0, 5);

    setRecentSearches(updatedHistory);
    localStorage.setItem("dealcity-search-history", JSON.stringify(updatedHistory));

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleExecuteSearch(inputValue);
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("dealcity-search-history");
  };

  return (
    /* CORRECTION ICI : h-screen (pleine hauteur), bg-background ou bg-white (opaque), 
       w-screen (pleine largeur) et z-[999] pour passer devant absolument TOUT le site */
    <div className="fixed inset-0 z-[999] w-screen h-screen bg-background flex flex-col p-4 animate-in fade-in slide-in-from-top-4 duration-200 sm:hidden">
      
      {/* Barre de saisie mobile */}
      <div className="flex items-center gap-3 w-full border-b pb-4 bg-background">
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              placeholder="Rechercher sur DealCity..."
              className="w-full h-11 ps-11 pe-4 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-base"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
          </div>
        </form>

        {/* Style TikTok : le bouton "Annuler" à côté de la barre */}
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-black text-muted-foreground hover:text-foreground px-1 whitespace-nowrap active:scale-95 transition-transform"
        >
          Annuler
        </button>
      </div>

      {/* Contenu Suggestions (Historique + Tendances) */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-6 bg-background select-none">
        
        {/* RECHERCHES RÉCENTES */}
        {recentSearches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground/70">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> Recherches récentes
              </span>
              <button 
                type="button" 
                onClick={clearHistory}
                className="text-destructive flex items-center gap-1 hover:underline font-bold normal-case"
              >
                <Trash2 className="size-3.5" /> Effacer
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExecuteSearch(search)}
                  className="px-4 py-2 bg-muted text-sm font-semibold rounded-full hover:bg-muted/80 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TENDANCES DE LA PLATEFORME */}
        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-primary" /> Tendances DealCity
          </div>
          
          <div className="divide-y border rounded-2xl bg-card overflow-hidden shadow-sm">
            {TRENDING_SEARCHES.map((trend, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExecuteSearch(trend)}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left text-sm font-bold hover:bg-muted/40 transition-colors active:bg-muted"
              >
                <span className={`w-5 text-center font-black italic ${
                  index === 0 ? "text-red-500 text-base" : 
                  index === 1 ? "text-orange-500" : 
                  index === 2 ? "text-amber-500" : "text-muted-foreground"
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 truncate font-semibold text-foreground">{trend}</span>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
                  Hot
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}