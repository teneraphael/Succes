"use client";

import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { Menu, Star, Zap, Sparkles, Trophy, Wallet, PlusCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import SidebarVendeur from "../SidebarVendeur";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="w-full space-y-4">
      {/* SECTION HEADER PRINCIPAL */}
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
                <div className="absolute -bottom-1 -right-1 bg-green-400 p-1.5 rounded-xl border-4 border-[#5eb1a8] shadow-lg">
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

            {/* SECTION SOLDE DYNAMIQUE */}
            <div className="flex items-center gap-3 bg-white/20 p-2 pr-4 rounded-[2rem] backdrop-blur-xl border border-white/20 shadow-lg">
               <div className="bg-white rounded-full p-3 shadow-md">
                  <Wallet className="size-5 text-primary" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-white/70 leading-none">Mon Solde</span>
                  <span className="text-xl font-black text-white italic leading-tight">
                    {user.balance?.toLocaleString() || 0} <span className="text-xs">F</span>
                  </span>
               </div>
               <Link href="/billing">
                <Button size="icon" className="size-8 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg animate-pulse">
                  <PlusCircle className="size-5" />
                </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}