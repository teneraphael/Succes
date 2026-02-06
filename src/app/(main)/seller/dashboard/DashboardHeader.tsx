"use client";

import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import SellerBadge from "@/components/SellerBadge";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import SidebarVendeur from "../SidebarVendeur";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="relative z-0 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[#83c5be] p-4 md:p-8 text-white shadow-lg">
      
      {/* BOUTON MENU DRAWER (Uniquement sur Mobile) */}
      <div className="absolute top-3 right-3 lg:hidden z-20">
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30 active:scale-95 transition-transform">
              <Menu className="size-5 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-none bg-card">
            <SheetTitle className="sr-only">Menu Vendeur</SheetTitle>
            {/* On affiche ton SidebarVendeur à l'intérieur du volet */}
            <SidebarVendeur className="h-full pt-10" />
          </SheetContent>
        </Sheet>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        
        {/* SECTION PROFIL */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5">
          <div className="rounded-full border-4 border-white/30 p-0.5 md:p-1 shadow-xl shrink-0">
            <UserAvatar 
              avatarUrl={user.avatarUrl} 
              size={64} 
              className="border-2 border-white md:size-20" 
            />
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter">
              Bienvenue, {user.displayName} !
            </h1>
            <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
              <span className="flex h-2 w-2 md:h-3 md:w-3">
                <span className="absolute inline-flex h-2 w-2 md:h-3 md:w-3 animate-ping rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-400"></span>
              </span>
              <p className="text-[10px] md:text-sm font-bold uppercase tracking-wide text-white/90">
                Boutique DealCity certifiée
              </p>
            </div>
          </div>
        </div>

        {/* SECTION BADGES */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <div className="flex items-center bg-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full backdrop-blur-md border border-white/10">
             <SellerBadge followerCount={0} isSeller={false} />
             <span className="ml-2 text-[9px] md:text-xs font-black uppercase tracking-wider">Vendeur Pro</span>
          </div>
          
          <div className="bg-white/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-xs font-black backdrop-blur-md border border-white/10">
            ⭐ 4.9 Avis
          </div>
        </div>
      </div>
      
      {/* DÉCORATIONS */}
      <div className="absolute -right-10 -top-10 h-32 w-32 md:h-40 md:w-40 rounded-full bg-white/10 blur-3xl z-0"></div>
      <div className="absolute -left-10 -bottom-10 h-32 w-32 md:h-40 md:w-40 rounded-full bg-black/10 blur-3xl z-0"></div>
    </div>
  );
}