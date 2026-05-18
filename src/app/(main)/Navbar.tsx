import { validateRequest } from "@/auth";
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn, Bell } from "lucide-react";
import NavbarCartCounter from "./NavbarCartCounter"; // 👈 Importation du composant client séparé

export default async function Navbar() {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b shadow-sm px-4 py-3 select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-5">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="text-2xl font-black text-primary italic tracking-tighter transition-transform active:scale-95"
        >
          DealCity
        </Link>

        {/* BARRE DE RECHERCHE CENTRALE */}
        <div className="flex-1 max-w-[160px] xs:max-w-xs sm:max-w-md">
          <SearchField />
        </div>

        {/* ACTIONS (PANIER + NOTIFICATIONS + PROFIL OU CONNEXION) */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* 🛒 ACCÈS DIRECT AU PANIER AVEC COMPTEUR DYNAMIQUE */}
          <NavbarCartCounter />

          {/* ICÔNE DE NOTIFICATIONS */}
          <Link 
            href="/notifications" 
            aria-label="Notifications"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors active:scale-90 relative"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          </Link>

          {/* Profil de l'utilisateur ou Connexion */}
          {user ? (
            <UserButton user={user} className="shadow-sm border border-primary/10 transition-transform active:scale-95" />
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-full bg-primary px-4 sm:px-6 h-9 font-black uppercase italic text-[10px] sm:text-xs tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
              )}
            >
              <LogIn size={14} />
              <span className="hidden xs:inline">Se connecter</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}