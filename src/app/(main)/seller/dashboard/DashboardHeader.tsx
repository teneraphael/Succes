"use client";

import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import SellerBadge from "@/components/SellerBadge";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    /* IMPORTANT: On utilise z-0 ou z-10 ici. 
       Si ta Navbar est en z-50, elle restera toujours au-dessus.
    */
    <div className="relative z-0 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-[#83c5be] p-8 text-white shadow-lg">
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="rounded-full border-4 border-white/30 p-1 shadow-xl">
            <UserAvatar 
              avatarUrl={user.avatarUrl} 
              size={80} 
              className="border-2 border-white" 
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Bienvenue, {user.displayName} !
            </h1>
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              <span className="flex h-3 w-3 text-white">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400"></span>
              </span>
              <p className="text-sm font-medium text-white/90">
                Boutique DealCity certifiée
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
             <SellerBadge followerCount={0} isSeller={false} />
             <span className="ml-2 text-xs font-bold uppercase tracking-wider text-white">Vendeur Pro</span>
          </div>
          
          <div className="bg-white/20 text-white border-none px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
            ⭐ 4.9 Avis
          </div>
        </div>
      </div>
      
      {/* Les décorations doivent être en z-0 pour ne pas gêner */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl z-0"></div>
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-black/10 blur-3xl z-0"></div>
    </div>
  );
}