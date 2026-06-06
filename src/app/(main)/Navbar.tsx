import { validateRequest } from "@/auth";
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogIn, Bell } from "lucide-react";

export default async function Navbar() {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/40 shadow-sm px-4 py-3 select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-5">

        {/* ✅ Logo DealCity — barres animées + texte vert */}
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="flex items-end gap-2 shrink-0 transition-transform active:scale-95"
        >
          <div className="flex items-end gap-[4px]">
            <div className="w-[5px] h-4 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
            <div className="w-[5px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
            <div className="w-[5px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
            <div className="w-[5px] h-5 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
          </div>
          <span className="text-xl font-black text-[#6ab344] tracking-tight leading-none pb-0.5 hidden sm:block">
            DealCity
          </span>
        </Link>

        {/* ✅ Barre de recherche centrale */}
        <div className="flex-1 max-w-[160px] xs:max-w-xs sm:max-w-md">
          <SearchField />
        </div>

        {/* ✅ Actions — notifications + profil ou connexion */}
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Menu principal">

          {/* Notifications — point rouge animé */}
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-muted-foreground hover:text-[#4a90e2] hover:bg-[#4a90e2]/8 transition-all active:scale-90"
          >
            <Bell className="size-5" />
            {/* ✅ Point rouge uniquement si connecté */}
            {user && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-card animate-pulse" />
            )}
          </Link>

          {/* Profil ou bouton connexion */}
          {user ? (
            <UserButton
              user={user}
              className="shadow-sm border border-[#4a90e2]/10 transition-transform active:scale-95"
            />
          ) : (
            // ✅ Bouton connexion — bleu DealCity
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-1.5 px-4 h-9 rounded-full",
                "bg-[#4a90e2] hover:bg-[#357abd] text-white",
                "font-black uppercase italic text-[10px] sm:text-xs tracking-widest",
                "shadow-lg shadow-[#4a90e2]/25 transition-all hover:scale-105 active:scale-95",
              )}
            >
              <LogIn size={14} aria-hidden="true" />
              <span className="hidden xs:inline">Se connecter</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}