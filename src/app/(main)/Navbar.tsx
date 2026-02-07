import { validateRequest } from "@/auth";
import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn } from "lucide-react";

export default async function Navbar() {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-3">
        
        {/* LOGO */}
        <Link href="/" className="text-2xl font-black text-primary italic tracking-tighter transition-transform active:scale-95">
          DealCity
        </Link>

        {/* BARRE DE RECHERCHE */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchField />
        </div>

        {/* ACTIONS (PROFIL OU CONNEXION) */}
        <div className="flex items-center gap-4 sm:ms-auto">
          {user ? (
            <UserButton user={user} className="shadow-sm border border-primary/10" />
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "rounded-full bg-primary px-6 font-black uppercase italic text-xs tracking-widest shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              )}
            >
              <LogIn size={16} />
              Se connecter
            </Link>
          )}
        </div>
      </div>
      
      {/* SearchField visible uniquement sur mobile en dessous du logo */}
      <div className="md:hidden px-5 pb-3">
        <SearchField />
      </div>
    </header>
  );
}