import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import { Home, Video, PlusSquare, Store, LogIn, ShoppingBag, User } from "lucide-react"; 
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  return (
    <div className={cn("flex w-full flex-row lg:flex-col", className)}>
      
      {/* 1. ACCUEIL */}
      <Button
        variant="ghost"
        className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 transition-all hover:bg-primary/10 group h-auto py-2 px-1"
        title="Accueil"
        asChild
      >
        <Link href="/" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
          <Home className="size-6 lg:size-5 shrink-0 group-hover:text-primary transition-colors" />
          <span className="text-[10px] lg:text-base font-medium group-hover:text-primary truncate">Accueil</span>
        </Link>
      </Button>

      {/* 2. VIDÉOS */}
      <Button
        variant="ghost"
        className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 transition-all hover:bg-primary/10 group h-auto py-2 px-1"
        title="Vidéos"
        asChild
      >
        <Link href="/video" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
          <Video className="size-6 lg:size-5 shrink-0 group-hover:text-primary transition-colors" />
          <span className="text-[10px] lg:text-base font-medium group-hover:text-primary truncate">Vidéos</span>
        </Link>
      </Button>

      {/* 3. LE MILIEU : BOUTON DYNAMIQUE */}
      {!user ? (
        <Button
          variant="ghost"
          className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 text-[#4a90e2] animate-pulse h-auto py-2 px-1"
          title="Se connecter"
          asChild
        >
          <Link href="/login" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
            <LogIn className="size-6 shrink-0" />
            <span className="text-[10px] lg:text-base font-black uppercase italic tracking-tighter truncate">Connexion</span>
          </Link>
        </Button>
      ) : user.isSeller ? (
        <Button
          variant="ghost"
          className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 text-primary h-auto py-2 px-1"
          title="Publier une annonce"
          asChild
        >
          <Link href="/post/new" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
            <PlusSquare className="size-6 shrink-0" />
            <span className="text-[10px] lg:text-base font-bold truncate">Publier</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 text-amber-600 h-auto py-2 px-1"
          title="Devenir vendeur"
          asChild
        >
          <Link href="/become-seller" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
            <Store className="size-6 shrink-0" />
            <span className="text-[10px] lg:text-base font-bold truncate">Vendre</span>
          </Link>
        </Button>
      )}

      {/* 4. MES COMMANDES */}
      {user && (
        <Button
          variant="ghost"
          className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 transition-all hover:bg-primary/10 group h-auto py-2 px-1"
          title="Mes commandes"
          asChild
        >
          <Link href="/orders" className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
            <ShoppingBag className="size-6 lg:size-5 shrink-0 group-hover:text-primary transition-colors" />
            <span className="text-[10px] lg:text-base font-medium group-hover:text-primary truncate">Commandes</span>
          </Link>
        </Button>
      )}

      {/* 5. PROFIL */}
      {user && (
        <Button
          variant="ghost"
          className="flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 transition-all hover:bg-primary/10 group h-auto py-2 px-1"
          title="Profil"
          asChild
        >
          <Link href={`/users/${user.username}`} className="w-full flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-hidden">
            <User className="size-6 lg:size-5 shrink-0 group-hover:text-primary transition-colors" />
            <span className="text-[10px] lg:text-base font-medium group-hover:text-primary truncate">Mon Profil</span>
          </Link>
        </Button>
      )}
    </div>
  );
}