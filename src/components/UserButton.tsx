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
  LayoutDashboard // Ajout de l'icône Dashboard
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

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useLanguage(); 
  const queryClient = useQueryClient();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn("flex-none rounded-full", className)}>
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {t.logged_in_as} @{user.username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* --- ÉTAPE 1 : AJOUT DU DASHBOARD POUR LES VENDEURS --- */}
        {user.isSeller && (
          <Link href="/seller/dashboard">
            <DropdownMenuItem className="font-bold text-primary focus:text-primary">
              <LayoutDashboard className="mr-2 size-4" />
              Tableau de Bord
            </DropdownMenuItem>
          </Link>
        )}

        <Link href={`/users/${user.username}`}>
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            {t.profile}
          </DropdownMenuItem>
        </Link>

        {/* --- ÉTAPE 2 : GARDER "DEVENIR VENDEUR" POUR LES AUTRES --- */}
        {!user.isSeller && (
          <Link href="/become-seller">
            <DropdownMenuItem>
              <Store className="mr-2 size-4 text-[#83c5be]" />
              {t.become_seller}
            </DropdownMenuItem>
          </Link>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages className="mr-2 size-4" />
            {t.language}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setLang("fr")}>
                Français
                {lang === "fr" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")}>
                English
                {lang === "en" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 size-4" />
            {t.theme}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                {t.system}
                {theme === "system" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 size-4" />
                {t.light}
                {theme === "light" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                {t.dark}
                {theme === "dark" && <Check className="ms-2 size-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            queryClient.clear();
            logout();
          }}
        >
          <LogOutIcon className="mr-2 size-4" />
          {t.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}