import { validateRequest } from "@/auth";
import { Home, Video, PlusSquare, Store, LogIn, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MenuBarProps {
  className?: string;
}

// ✅ Composant item de menu — évite la répétition de classes
function MenuItem({
  href,
  icon,
  label,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3",
        "h-auto py-2 px-1 rounded-xl transition-all group",
        "hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2]",
        className,
      )}
    >
      {icon}
      <span className="text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
        {label}
      </span>
    </Link>
  );
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();

  return (
    <div className={cn("flex w-full flex-row lg:flex-col lg:gap-1", className)}>

      {/* ✅ Accueil */}
      <MenuItem
        href="/"
        icon={<Home className="size-6 lg:size-5 shrink-0 transition-colors" />}
        label="Accueil"
      />

      {/* ✅ Vidéos */}
      <MenuItem
        href="/video"
        icon={<Video className="size-6 lg:size-5 shrink-0 transition-colors" />}
        label="Vidéos"
      />

      {/* ✅ Bouton central dynamique selon l'état de connexion */}
      {!user ? (
        // Non connecté — bouton connexion bleu DealCity animé
        <Link
          href="/login"
          className={cn(
            "flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3",
            "h-auto py-2 px-1 rounded-xl transition-all",
            "text-[#4a90e2] hover:bg-[#4a90e2]/10 animate-pulse",
          )}
        >
          <LogIn className="size-6 shrink-0" />
          <span className="text-[10px] lg:text-sm font-black uppercase italic tracking-tight truncate">
            Connexion
          </span>
        </Link>
      ) : user.isSeller ? (
        // Vendeur — bouton publier vert DealCity
        <Link
          href="/post/new"
          className={cn(
            "flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3",
            "h-auto py-2 px-1 rounded-xl transition-all",
            "text-[#6ab344] hover:bg-[#6ab344]/10",
          )}
        >
          <PlusSquare className="size-6 shrink-0" />
          <span className="text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
            Publier
          </span>
        </Link>
      ) : (
        // Acheteur — bouton devenir vendeur ambre
        <Link
          href="/become-seller"
          className={cn(
            "flex flex-1 flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3",
            "h-auto py-2 px-1 rounded-xl transition-all",
            "text-amber-500 hover:bg-amber-500/10",
          )}
        >
          <Store className="size-6 shrink-0" />
          <span className="text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
            Vendre
          </span>
        </Link>
      )}

      {/* ✅ Profil — uniquement si connecté */}
      {user && (
        <MenuItem
          href={`/users/${user.username}`}
          icon={<User className="size-6 lg:size-5 shrink-0 transition-colors" />}
          label="Mon Profil"
        />
      )}
    </div>
  );
}