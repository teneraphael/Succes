"use client";

import { useState, useEffect } from "react";
import { SearchIcon, Clock, Trash2, TrendingUp, ShoppingBag, Loader2, X, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { useLanguage } from "@/components/LanguageProvider";
import Image from "next/image";

interface SearchPageProps {
  onClose: () => void;
}

interface UserSuggestion {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  isSeller: boolean;
}

interface SuggestionData {
  products: string[];
  users: UserSuggestion[];
}

// Fonction utilitaire pour gérer les images externes de manière identique à vos autres composants
const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

export default function SearchPage({ onClose }: SearchPageProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("dealcity-search-history");
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); }
      catch (e) { console.error(e); }
    }

    async function loadRealTrends() {
      try {
        const response = await fetch("/api/search/suggestions");
        if (response.ok) {
          const result = await response.json();
          if (result.type === "trends") setTrendingSearches(result.data);
        }
      } catch (error) {
        console.error("Impossible de charger les tendances:", error);
      } finally {
        setIsLoadingTrends(false);
      }
    }

    loadRealTrends();
  }, []);

  useEffect(() => {
    const query = inputValue.trim();
    if (!query) { 
      setProductSuggestions([]); 
      setUserSuggestions([]); 
      setIsLoading(false); 
      return; 
    }
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const result = await response.json();
          if (result.type === "suggestions") {
            // L'API renvoie désormais un objet { products, users }
            const data: SuggestionData = result.data;
            setProductSuggestions(data.products || []);
            setUserSuggestions(data.users || []);
          }
        }
      } catch (error) {
        console.error("Erreur suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleExecuteSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    const updatedHistory = [trimmed, ...recentSearches.filter((item) => item !== trimmed)].slice(0, 5);
    setRecentSearches(updatedHistory);
    localStorage.setItem("dealcity-search-history", JSON.stringify(updatedHistory));
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const handleSelectUser = (username: string) => {
    router.push(`/users/${username}`);
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

  const hasAnySuggestions = productSuggestions.length > 0 || userSuggestions.length > 0;

  return (
    <div className="fixed inset-0 z-[999] w-screen h-screen bg-background flex flex-col animate-in fade-in slide-in-from-top-4 duration-200 sm:hidden">

      {/* Barre de saisie */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              placeholder={t.search_placeholder}
              className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 focus-visible:border-[#4a90e2]/30 focus-visible:ring-1 focus-visible:ring-[#4a90e2]/10 text-sm transition-all"
            />
            {isLoading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-[#4a90e2]" />
            )}
          </div>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all active:scale-90 shrink-0"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 space-y-6 select-none">

        {/* SECTION DES RÉSULTATS DE SAISIE (PROFIL & PRODUITS) */}
        {hasAnySuggestions ? (
          <div className="space-y-6">
            
            {/* 1. Profils correspondants */}
            {userSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1 text-[10px] font-black uppercase tracking-widest text-[#4a90e2]">
                  <Store className="size-3.5" />
                  <span>Profils & Boutiques</span>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm divide-y divide-border/40">
                  {userSuggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user.username)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#4a90e2]/5 active:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Image
                          src={user.avatarUrl || "/icons/icon-192.png"}
                          alt={user.displayName}
                          width={36}
                          height={36}
                          className="size-9 rounded-full object-cover shrink-0 border border-border/40"
                          unoptimized={isExternalImage(user.avatarUrl || "")}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-foreground truncate">
                            {user.displayName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg shrink-0">
                        Voir
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Produits / Suggestions */}
            {productSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4a90e2] px-1">
                  {t.products_found}
                </p>
                <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm divide-y divide-border/40">
                  {productSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExecuteSearch(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#4a90e2]/5 active:bg-muted transition-colors"
                    >
                      <ShoppingBag className="size-4 text-[#4a90e2] shrink-0" />
                      <span className="text-sm font-bold text-foreground">{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        ) : inputValue.trim() !== "" && !isLoading ? (
          // Aucun résultat
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <div className="size-12 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
              <SearchIcon className="size-5 text-[#4a90e2]" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {t.no_results_desc}{" "}
              <span className="text-[#4a90e2] font-black">{`"${inputValue}"`}</span>
            </p>
          </div>

        ) : (
          <div className="space-y-6">

            {/* Recherches récentes */}
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Clock className="size-3.5" />
                    {t.recent_searches}
                  </div>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="size-3" />
                    {t.clear}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExecuteSearch(search)}
                      className="px-3 py-1.5 bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 text-xs font-bold rounded-2xl hover:border-[#4a90e2]/30 hover:text-[#4a90e2] transition-all active:scale-95"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tendances */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <TrendingUp className="size-3.5 text-[#4a90e2]" />
                {t.trends}
              </div>

              {isLoadingTrends ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-[#4a90e2]" />
                  <span className="text-xs font-bold">{t.loading}</span>
                </div>
              ) : trendingSearches.length > 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm divide-y divide-border/40">
                  {trendingSearches.map((trend, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExecuteSearch(trend)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#4a90e2]/5 active:bg-muted transition-colors"
                    >
                      <span className={[
                        "w-5 text-center font-black italic text-sm shrink-0",
                        index === 0 ? "text-red-500" :
                        index === 1 ? "text-orange-500" :
                        index === 2 ? "text-amber-500" :
                        "text-muted-foreground",
                      ].join(" ")}>
                        {index + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-bold text-foreground">
                        {trend}
                      </span>
                      <span className="text-[9px] bg-[#4a90e2]/10 text-[#4a90e2] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">
                        Hot
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-bold text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/60">
                  {t.no_results}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}