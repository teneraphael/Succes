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
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/LanguageProvider";

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
        // Mobile : flex-1 (répartition égale), empilé verticalement.
        // PC (lg:) : flex-initial, disposition en ligne (icône à gauche, texte à gauche), w-full.
        "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
        "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all group lg:w-full",
        "hover:bg-[#4a90e2]/8 text-muted-foreground hover:text-[#4a90e2]",
        className,
      )}
    >
      <div className="shrink-0">{icon}</div>
      {/* w-full text-center sur mobile, w-auto text-left sur PC */}
      <span className="w-full text-center lg:w-auto lg:text-left text-[8.5px] sm:text-[10px] lg:text-sm font-black uppercase tracking-tight truncate">
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

  return (
    <div className={cn("flex w-full flex-row lg:flex-col lg:gap-1.5 items-center justify-between", className)}>

      {/* ✅ Accueil */}
      <MenuItem
        href="/"
        icon={<LayoutGrid className="size-[22px] lg:size-5 transition-colors" />}
        label={t.home}
      />

      {/* ✅ Vidéos */}
      <MenuItem
        href="/video"
        icon={<Clapperboard className="size-[22px] lg:size-5 transition-colors" />}
        label={t.videos}
      />

      {/* ✅ Bouton central dynamique (Publier / Vendre / Login) */}
      {!isLoggedIn ? (
        <Link
          href="/login"
          className={cn(
            "flex-1 min-w-0 lg:flex-initial flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-start gap-0.5 lg:gap-3",
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full",
            "text-[#4a90e2] hover:bg-[#4a90e2]/10 animate-pulse",
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
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full",
            "text-[#6ab344] hover:bg-[#6ab344]/10",
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
            "h-auto py-2 px-1 lg:px-3 rounded-xl transition-all lg:w-full",
            "text-amber-500 hover:bg-amber-500/10",
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
        icon={<Store className="size-[22px] lg:size-5 transition-colors text-blue-600" />}
        label={t.stores || "Boutiques"}
      />

      {/* ✅ Profil */}
      {isLoggedIn && username && (
        <MenuItem
          href={`/users/${username}`}
          icon={<UserRound className="size-[22px] lg:size-5 transition-colors" />}
          label={t.my_profile}
        />
      )}
    </div>
  );
}