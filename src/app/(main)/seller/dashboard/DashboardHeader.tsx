"use client";

import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { Menu, Star, Zap, Sparkles, Trophy } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import SidebarVendeur from "../SidebarVendeur";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    /* On force l'affichage en bloc normal, sans aucune position relative/absolute sur le conteneur externe */
    <div className="w-full block overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-[#83c5be] to-primary p-1 shadow-xl ring-1 ring-black/5">
      <div className="bg-white/10 backdrop-blur-md rounded-[2.3rem] p-5 md:p-8 border border-white/20">
        
        <div className="flex justify-between items-start md:mb-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/30 active:scale-95 shadow-sm">
                  <Menu className="size-5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none bg-card">
                <SheetTitle className="sr-only">Menu Vendeur</SheetTitle>
                <SidebarVendeur className="h-full pt-10" />
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:flex bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 items-center gap-2">
            <Star className="size-4 text-yellow-300 fill-yellow-300" />
            <span className="text-xs font-black text-white italic tracking-tighter">SCORE 4.9</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="relative rounded-[2rem] border-[4px] border-white/40 p-1 backdrop-blur-3xl shadow-2xl">
              <UserAvatar 
                avatarUrl={user.avatarUrl} 
                size={80} 
                className="size-20 md:size-24 rounded-[1.5rem] border-2 border-white/20" 
              />
              <div className="absolute -bottom-1 -right-1 bg-green-400 p-1.5 rounded-xl border-4 border-primary shadow-lg">
                <Zap className="size-3 text-white fill-white" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-sm leading-tight">
                Salut, {user.displayName}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/20 w-fit mx-auto md:mx-0">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400"></span>
                </span>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/90">Boutique Certifiée</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center bg-white/20 px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner">
            <Trophy className="size-5 text-white mr-3" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-tighter text-white/70 leading-none">Niveau</span>
              <span className="text-xs font-black text-white uppercase italic">Vendeur Pro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}