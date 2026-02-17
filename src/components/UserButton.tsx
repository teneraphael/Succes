"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Check, 
  LogOutIcon, 
  Monitor, 
  Moon, 
  Sun, 
  UserIcon, 
  Store, 
  Languages,
  LayoutDashboard,
  Settings,
  ShieldCheck, // Ajouté pour l'admin
  Users // Ajouté pour le répertoire
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

  // Constante pour vérifier si c'est toi l'admin
  const isAdmin = user.id === "44ttt3ikxntqkxnh";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full transition-transform active:scale-95 outline-none", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} className="border-2 border-primary/10" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 rounded-[1.5rem] p-2 shadow-xl border-primary/5" align="end">
        <DropdownMenuLabel className="px-4 py-3 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {t.logged_in_as}
          </span>
          <span className="text-[#4a90e2] font-black italic text-base truncate">
            @{user.username}
          </span>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="mx-2" />
        
        {/* --- SECTION ADMIN (UNIQUEMENT POUR TOI) --- */}
        {isAdmin && (
          <>
            <Link href="/admin/pioneers">
              <DropdownMenuItem className="rounded-xl py-3 cursor-pointer bg-blue-600/5 text-blue-600 focus:bg-blue-600/10 focus:text-blue-700">
                <ShieldCheck className="mr-3 size-5" />
                <span className="font-black uppercase italic text-xs">Répertoire Pionniers</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="mx-2" />
          </>
        )}

        {/* SECTION VENDEUR */}
        {user.isSeller ? (
          <Link href="/seller/dashboard">
            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer font-bold text-primary focus:bg-primary/5 focus:text-primary">
              <LayoutDashboard className="mr-3 size-5" />
              Tableau de Bord
            </DropdownMenuItem>
          </Link>
        ) : (
          <Link href="/become-seller">
            <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
              <Store className="mr-3 size-5 text-[#6ab344]" />
              <span className="font-bold">{t.become_seller}</span>
            </DropdownMenuItem>
          </Link>
        )}

        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
            <UserIcon className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">{t.profile}</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/settings">
          <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
            <Settings className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">Paramètres</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="mx-2" />

        {/* PRÉFÉRENCES (LANGUE & THÈME) */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-3 cursor-pointer">
            <Languages className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">{t.language}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-2 shadow-lg border-primary/5">
              <DropdownMenuItem className="rounded-lg py-2" onClick={() => setLang("fr")}>
                Français
                {lang === "fr" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2" onClick={() => setLang("en")}>
                English
                {lang === "en" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-3 cursor-pointer">
            <Monitor className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">{t.theme}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-2 shadow-lg border-primary/5">
              <DropdownMenuItem className="rounded-lg py-2" onClick={() => setTheme("system")}>
                <Monitor className="mr-3 size-4" /> {t.system}
                {theme === "system" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2" onClick={() => setTheme("light")}>
                <Sun className="mr-3 size-4" /> {t.light}
                {theme === "light" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2" onClick={() => setTheme("dark")}>
                <Moon className="mr-3 size-4" /> {t.dark}
                {theme === "dark" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator className="mx-2" />
        
        {/* DÉCONNEXION */}
        <DropdownMenuItem
          className="rounded-xl py-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() => {
            queryClient.clear();
            logout();
          }}
        >
          <LogOutIcon className="mr-3 size-5" />
          <span className="font-black uppercase italic tracking-tighter">{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}