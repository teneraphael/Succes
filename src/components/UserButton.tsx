"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check, LogOutIcon, Monitor, Moon, Sun, Store,
  Languages, LayoutDashboard, Settings, ShieldCheck, Truck,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import { User } from "lucia";

interface UserButtonProps {
  className?: string;
  user?: User;
}

export default function UserButton({ className, user: propUser }: UserButtonProps) {
  const { user: sessionUser } = useSession();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLanguage();
  const queryClient = useQueryClient();

  const user = propUser || sessionUser;
  if (!user) return null;

  const MY_ADMIN_ID = "dgd2ohqrx3tqezng";
  const isAdmin = user.id === MY_ADMIN_ID;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("flex-none rounded-full transition-transform active:scale-95 outline-none", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} className="ring-2 ring-[#4a90e2]/20" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 rounded-3xl p-2 shadow-xl border border-border/60 bg-card" align="end">

        {/* ✅ En-tête utilisateur */}
        <DropdownMenuLabel className="px-3 py-3 flex items-center gap-3">
          <UserAvatar avatarUrl={user.avatarUrl} size={36} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t.logged_in_as}
            </p>
            <p className="text-[#4a90e2] font-black italic text-sm truncate">
              @{user.username}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-2 bg-border/40" />

        {/* ✅ Section admin */}
        {isAdmin && (
          <div>
            <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer bg-[#4a90e2]/5 text-[#4a90e2] focus:bg-[#4a90e2]/10 focus:text-[#4a90e2]">
              <Link href="/admin/pioneers" className="flex items-center gap-2.5 w-full px-3">
                <ShieldCheck className="size-4 shrink-0" />
                {/* ✅ Traduit */}
                <span className="font-black uppercase italic text-xs">{t.pioneers}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="rounded-xl py-2.5 mt-1 cursor-pointer bg-[#6ab344]/5 text-[#6ab344] focus:bg-[#6ab344]/10 focus:text-[#6ab344]">
              <Link href="/delivery-dashboard" className="flex items-center gap-2.5 w-full px-3">
                <Truck className="size-4 shrink-0" />
                {/* ✅ Traduit */}
                <span className="font-black uppercase italic text-xs">{t.delivery}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="mx-2 mt-1 bg-border/40" />
          </div>
        )}

        {/* ✅ Section vendeur */}
        {user.isSeller ? (
          <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-[#4a90e2]/5">
            <Link href="/seller/dashboard" className="flex items-center gap-2.5 w-full px-3">
              <LayoutDashboard className="size-4 text-[#4a90e2] shrink-0" />
              {/* ✅ Traduit */}
              <span className="text-xs font-black uppercase tracking-tight">{t.seller_dashboard}</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-[#6ab344]/5">
            <Link href="/become-seller" className="flex items-center gap-2.5 w-full px-3">
              <Store className="size-4 text-[#6ab344] shrink-0" />
              <span className="text-xs font-bold">{t.become_seller}</span>
            </Link>
          </DropdownMenuItem>
        )}

        {/* ✅ Paramètres traduit */}
        <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-muted/50">
          <Link href="/settings" className="flex items-center gap-2.5 w-full px-3">
            <Settings className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold">{t.settings}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-2 bg-border/40" />

        {/* ✅ Sous-menu langue */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-2.5 cursor-pointer px-3 flex items-center gap-2.5">
            <Languages className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold">{t.language}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-lg border border-border/60">
              <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer text-xs font-bold" onClick={() => setLang("fr")}>
                Francais
                {lang === "fr" && <Check className="ms-auto size-3.5 text-[#4a90e2]" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer text-xs font-bold" onClick={() => setLang("en")}>
                English
                {lang === "en" && <Check className="ms-auto size-3.5 text-[#4a90e2]" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* ✅ Sous-menu thème */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-2.5 cursor-pointer px-3 flex items-center gap-2.5">
            <Monitor className="size-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold">{t.theme}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-1.5 shadow-lg border border-border/60">
              <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer text-xs font-bold" onClick={() => setTheme("system")}>
                <Monitor className="size-3.5 shrink-0" /> {t.system}
                {theme === "system" && <Check className="ms-auto size-3.5 text-[#4a90e2]" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer text-xs font-bold" onClick={() => setTheme("light")}>
                <Sun className="size-3.5 shrink-0" /> {t.light}
                {theme === "light" && <Check className="ms-auto size-3.5 text-[#4a90e2]" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl py-2 px-3 cursor-pointer text-xs font-bold" onClick={() => setTheme("dark")}>
                <Moon className="size-3.5 shrink-0" /> {t.dark}
                {theme === "dark" && <Check className="ms-auto size-3.5 text-[#4a90e2]" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator className="mx-2 bg-border/40" />

        {/* ✅ Déconnexion */}
        <DropdownMenuItem
          className="rounded-xl py-2.5 px-3 cursor-pointer text-red-500 focus:bg-red-500/8 focus:text-red-500 flex items-center gap-2.5"
          onClick={() => { queryClient.clear(); logout(); }}
        >
          <LogOutIcon className="size-4 shrink-0" />
          <span className="text-xs font-black uppercase italic tracking-tight">
            {t.logout}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}