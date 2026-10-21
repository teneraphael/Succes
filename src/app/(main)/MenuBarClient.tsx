"use client";

import { 
  LayoutGrid,     
  Clapperboard,   
  Store,          
  Sparkles,      
  BadgePercent,  
  LogIn,         
  UserRound      
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

function MenuItem({
  href,
  icon,
  label,
  className,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        // Mobile : flex-1 (répartition égale), empilé verticalement.
        // PC (lg:) : flex-initial, disposition en ligne, w-full.
        "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
        "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all group lg:w-full relative",
        // ✅ Style actif distinctif (fond coloré subtil + texte accentué)
        isActive 
          ? "bg-[#4a90e2]/15 text-[#4a90e2] shadow-xs" 
          : "hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2]",
        className,
      )}
    >
      {/* Indicateur visuel discret style onglet actif */}
      {isActive && (
        <span className="absolute bottom-0 lg:left-0 lg:top-1/2 lg:-translate-y-1/2 w-8 lg:w-1 h-1 lg:h-5 bg-[#4a90e2] rounded-full mx-auto lg:mx-0" />
      )}
      
      <div className={cn("shrink-0 transition-transform duration-200", isActive && "scale-110")}>{icon}</div>
      <span className={cn(
        "w-full text-center lg:w-auto lg:text-left text-[8.5px] sm:text-[10px] lg:text-sm font-black uppercase tracking-tight truncate",
        isActive ? "text-[#4a90e2]" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </Link>
  );
}

interface MenuBarClientProps {
  className?: string;
  isSeller: boolean;
  isLoggedIn: boolean;
  username?: string;
}

export default function MenuBarClient({
  className,
  isSeller,
  isLoggedIn,
  username,
}: MenuBarClientProps) {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <div className={cn("flex w-full flex-row lg:flex-col lg:gap-1.5 items-center justify-between", className)}>

      {/* ✅ Accueil */}
      <MenuItem
        href="/"
        icon={<LayoutGrid className="size-[22px] lg:size-5 transition-colors" />}
        label={t.home}
        isActive={pathname === "/"}
      />

      {/* ✅ Vidéos */}
      <MenuItem
        href="/video"
        icon={<Clapperboard className="size-[22px] lg:size-5 transition-colors" />}
        label={t.videos}
        isActive={pathname?.startsWith("/video")}
      />

      {/* ✅ Bouton central dynamique (Publier / Vendre / Login) */}
      {!isLoggedIn ? (
        <Link
          href="/login"
          className={cn(
            "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full relative",
            pathname === "/login" ? "bg-[#4a90e2]/15 text-[#4a90e2]" : "text-[#4a90e2] hover:bg-[#4a90e2]/10 animate-pulse",
          )}
        >
          <LogIn className="size-[22px] lg:size-6 shrink-0" />
          <span className="w-full text-center lg:w-auto lg:text-left text-[8.5px] sm:text-[10px] lg:text-sm font-black uppercase italic tracking-tight truncate">
            {t.login}
          </span>
        </Link>
      ) : isSeller ? (
        <Link
          href="/post/new"
          className={cn(
            "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full relative",
            pathname?.startsWith("/post/new") ? "bg-[#6ab344]/20 text-[#6ab344]" : "text-[#6ab344] hover:bg-[#6ab344]/10",
          )}
        >
          <Sparkles className="size-[22px] lg:size-6 shrink-0" />
          <span className="w-full text-center lg:w-auto lg:text-left text-[8.5px] sm:text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
            {t.publish}
          </span>
        </Link>
      ) : (
        <Link
          href="/become-seller"
          className={cn(
            "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full relative",
            pathname?.startsWith("/become-seller") ? "bg-amber-500/20 text-amber-500" : "text-amber-500 hover:bg-amber-500/10",
          )}
        >
          <BadgePercent className="size-[22px] lg:size-6 shrink-0" />
          <span className="w-full text-center lg:w-auto lg:text-left text-[8.5px] sm:text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
            {t.sell}
          </span>
        </Link>
      )}

      {/* ✅ Boutiques */}
      <MenuItem
        href="/boutiques"
        icon={<Store className="size-[22px] lg:size-5 transition-colors" />}
        label={t.stores || "Boutiques"}
        isActive={pathname?.startsWith("/boutiques")}
      />

      {/* ✅ Profil */}
      {isLoggedIn && username && (
        <MenuItem
          href={`/users/${username}`}
          icon={<UserRound className="size-[22px] lg:size-5 transition-colors" />}
          label={t.my_profile}
          isActive={pathname === `/users/${username}`}
        />
      )}
    </div>
  );
}