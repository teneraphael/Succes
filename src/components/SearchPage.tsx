"use client";

import { useState, useEffect } from "react";
import { SearchIcon, Clock, Trash2, TrendingUp, ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

interface SearchPageProps {
  onClose: () => void;
}

export default function SearchPage({ onClose }: SearchPageProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  // 1. Charger l'historique local ET les vraies tendances SQL au montage du composant
  useEffect(() => {
    const saved = localStorage.getItem("dealcity-search-history");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    async function loadRealTrends() {
      try {
        const response = await fetch("/api/search/suggestions");
        if (response.ok) {
          const result = await response.json();
          if (result.type === "trends") {
            setTrendingSearches(result.data);
          }
        }
      } catch (error) {
        console.error("Impossible de charger les vraies tendances SQL:", error);
      } finally {
        setIsLoadingTrends(false);
      }
    }

    loadRealTrends();
  }, []);

  // 2. CORRECTION : Gestion des suggestions en temps réel avec coupure propre du Loader
  useEffect(() => {
    const query = inputValue.trim();
    
    // Si le champ est vide, on nettoie les suggestions ET on coupe immédiatement le loader
    if (!query) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const result = await response.json();
          if (result.type === "suggestions") {
            setSuggestions(result.data);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des suggestions:", error);
      } finally {
        // Désactive le loader une fois que la base de données a répondu
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

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
              className="w-full h-11 ps-11 pe-11 rounded-2xl bg-muted border-none focus-visible:ring-2 focus-visible:ring-primary text-base"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            
            {/* L'indicateur ne s'affiche plus que lorsque isLoading est actif */}
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
            )}
          </div>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="text-sm font-black text-muted-foreground hover:text-foreground px-1 whitespace-nowrap active:scale-95 transition-transform"
        >
          Annuler
        </button>
      </div>

      {/* Zone de contenu dynamique */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-6 bg-background select-none">
        
        {/* VRAIES SUGGESTIONS (Saisie active) */}
        {suggestions.length > 0 ? (
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-primary px-2 mb-2">
              Produits trouvés
            </div>
            <div className="divide-y border border-border/60 rounded-2xl bg-card overflow-hidden shadow-sm">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExecuteSearch(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-sm font-bold hover:bg-muted/50 active:bg-muted transition-colors"
                >
                  <ShoppingBag className="size-4 text-muted-foreground/80" />
                  <span className="text-foreground">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        ) : inputValue.trim() !== "" && !isLoading ? (
          /* Aucun résultat trouvé dans la base de données */
          <div className="text-center py-8 text-sm text-muted-foreground font-semibold">
            Aucun produit exact trouvé. Taper Entrée pour chercher <span className="text-primary font-black">"{inputValue}"</span>
          </div>
        ) : (
          /* BLOC PAR DÉFAUT (Champ vide : Historique + Tendances Réelles) */
          <>
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

            {/* VRAIES TENDANCES DE LA PLATFORME */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" /> Tendances DealCity
              </div>
              
              {isLoadingTrends ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-xs font-bold">
                  <Loader2 className="size-4 animate-spin text-primary" /> Chargement des tendances...
                </div>
              ) : trendingSearches.length > 0 ? (
                <div className="divide-y border rounded-2xl bg-card overflow-hidden shadow-sm">
                  {trendingSearches.map((trend, index) => (
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
              ) : (
                <div className="text-center py-6 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-2xl border border-dashed">
                  Aucun produit populaire à afficher pour le moment.
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}