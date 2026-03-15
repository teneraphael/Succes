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
  ShieldCheck,
  ShoppingBag,
  Truck, // Import de l'icône Camion pour la livraison
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useCart } from "@/context/cart-context";
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
  const { cart } = useCart(); 
  const queryClient = useQueryClient();

  const user = propUser || sessionUser;

  if (!user) return null;

  // Ton ID unique pour l'accès Admin et Livreur
  const MY_ADMIN_ID = "4yq76ntw6lpduptd"; 
  const isAdmin = user.id === MY_ADMIN_ID;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn("flex-none rounded-full transition-transform active:scale-95 outline-none", className)}>
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
        
        {/* SECTION ADMIN & LIVRAISON (Visible uniquement par toi) */}
        {isAdmin && (
          <>
            <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer bg-blue-600/5 text-blue-600 focus:bg-blue-600/10 focus:text-blue-700">
              <Link href="/admin/pioneers">
                <div className="flex items-center w-full">
                  <ShieldCheck className="mr-3 size-5" />
                  <span className="font-black uppercase italic text-xs">Répertoire Pionniers</span>
                </div>
              </Link>
            </DropdownMenuItem>

            {/* ✅ NOUVEAU : BOUTON LIVRAISONS */}
            <DropdownMenuItem asChild className="rounded-xl py-3 mt-1 cursor-pointer bg-emerald-600/5 text-emerald-600 focus:bg-emerald-600/10 focus:text-emerald-700">
              <Link href="/delivery-dashboard">
                <div className="flex items-center w-full">
                  <Truck className="mr-3 size-5" />
                  <span className="font-black uppercase italic text-xs">Gestion Livraisons</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="mx-2" />
          </>
        )}

        {/* SECTION PANIER */}
        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer bg-orange-500/5 text-orange-600 focus:bg-orange-500/10 focus:text-orange-700">
          <Link href="/cart">
            <div className="flex items-center w-full">
              <ShoppingBag className="mr-3 size-5" />
              <span className="font-bold flex-1">Mon Panier</span>
              {cart.length > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-in zoom-in">
                  {cart.length}
                </span>
              )}
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-2" />

        {/* SECTION VENDEUR */}
        {user.isSeller ? (
          <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer font-bold text-primary focus:bg-primary/5 focus:text-primary">
            <Link href="/seller/dashboard">
              <div className="flex items-center w-full">
                <LayoutDashboard className="mr-3 size-5" />
                <span>Tableau de Bord Vendeur</span>
              </div>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
            <Link href="/become-seller">
              <div className="flex items-center w-full">
                <Store className="mr-3 size-5 text-[#6ab344]" />
                <span className="font-bold">{t.become_seller}</span>
              </div>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="mx-2" />
        
        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
          <Link href={`/users/${user.username}`}>
            <div className="flex items-center w-full">
              <UserIcon className="mr-3 size-5 text-muted-foreground" />
              <span className="font-medium">{t.profile}</span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl py-3 cursor-pointer">
          <Link href="/settings">
            <div className="flex items-center w-full">
              <Settings className="mr-3 size-5 text-muted-foreground" />
              <span className="font-medium">Paramètres</span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-2" />

        {/* LANGUES */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-3 cursor-pointer">
            <Languages className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">{t.language}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-2 shadow-lg border-primary/5">
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => setLang("fr")}>
                Français
                {lang === "fr" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => setLang("en")}>
                English
                {lang === "en" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* THÈME */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl py-3 cursor-pointer">
            <Monitor className="mr-3 size-5 text-muted-foreground" />
            <span className="font-medium">{t.theme}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="rounded-2xl p-2 shadow-lg border-primary/5">
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => setTheme("system")}>
                <Monitor className="mr-3 size-4" /> {t.system}
                {theme === "system" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => setTheme("light")}>
                <Sun className="mr-3 size-4" /> {t.light}
                {theme === "light" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => setTheme("dark")}>
                <Moon className="mr-3 size-4" /> {t.dark}
                {theme === "dark" && <Check className="ms-auto size-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator className="mx-2" />
        
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