"use client";

import { Home, Video, PlusSquare, Store, LogIn, User } from "lucide-react";
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
    <div className={cn("flex w-full flex-row lg:flex-col lg:gap-1", className)}>

      {/* ✅ Accueil */}
      <MenuItem
        href="/"
        icon={<Home className="size-6 lg:size-5 shrink-0 transition-colors" />}
        label={t.home}
      />

      {/* ✅ Vidéos */}
      <MenuItem
        href="/video"
        icon={<Video className="size-6 lg:size-5 shrink-0 transition-colors" />}
        label={t.videos}
      />

      {/* ✅ Bouton central dynamique */}
      {!isLoggedIn ? (
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
            {t.login}
          </span>
        </Link>
      ) : isSeller ? (
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
            {t.publish}
          </span>
        </Link>
      ) : (
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
            {t.sell}
          </span>
        </Link>
      )}

      {/* ✅ Profil */}
      {isLoggedIn && username && (
        <MenuItem
          href={`/users/${username}`}
          icon={<User className="size-6 lg:size-5 shrink-0 transition-colors" />}
          label={t.my_profile}
        />
      )}
    </div>
  );
}