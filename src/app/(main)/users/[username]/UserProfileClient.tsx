"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Store, Heart } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

// ✅ Onglets traduits
export function ProfileTabs({ isUserProfile }: { isUserProfile: boolean }) {
  const { t } = useLanguage();
  return (
    <TabsList className="bg-card border border-border/60 p-1.5 rounded-2xl flex items-center gap-1.5 w-full shadow-sm">
      <TabsTrigger
        value="posts"
        className="flex-1 py-2.5 px-4 rounded-xl text-muted-foreground text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-none data-[state=active]:bg-background data-[state=active]:text-[#4a90e2] data-[state=active]:border data-[state=active]:border-[#4a90e2]/20 data-[state=active]:shadow-sm"
      >
        <Store className="size-3.5 text-[#4a90e2]" />
        {t.catalogue}
      </TabsTrigger>

      {isUserProfile && (
        <TabsTrigger
          value="bookmarks"
          className="flex-1 py-2.5 px-4 rounded-xl text-muted-foreground text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-none data-[state=active]:bg-background data-[state=active]:text-rose-500 data-[state=active]:border data-[state=active]:border-rose-500/20 data-[state=active]:shadow-sm"
        >
          <Heart className="size-3.5 text-rose-400" />
          {t.favorites}
        </TabsTrigger>
      )}
    </TabsList>
  );
}

// ✅ Stats traduites
export function ProfileStats({
  postsCount,
  followersNode,
  salesCount,
}: {
  postsCount: number;
  followersNode: React.ReactNode;
  salesCount: number;
}) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-2.5 pt-0.5 max-w-md">
      <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#4a90e2]/30">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#4a90e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
        <div className="text-xl font-black text-foreground tabular-nums">{postsCount}</div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {t.creations}
        </div>
      </div>

      <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#4a90e2]/30">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#4a90e2] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
        <div className="text-xl font-black text-foreground tabular-nums">
          {followersNode}
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {t.followers}
        </div>
      </div>

      <div className="group relative p-3 bg-background border border-border/60 rounded-2xl text-center space-y-1 shadow-sm overflow-hidden transition-all hover:border-[#6ab344]/30">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[#6ab344] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl" />
        <div className="text-xl font-black text-foreground tabular-nums flex items-center justify-center gap-1.5">
          <span className="text-[#6ab344]">🛍</span>
          {salesCount}
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {t.sales}
        </div>
      </div>
    </div>
  );
}

// ✅ Badge en ligne traduit
export function OnlineBadge() {
  const { t } = useLanguage();
  return (
    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
      <span className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
      {t.online}
    </div>
  );
}

// ✅ Date membre traduite
export function MemberSince({ dateFormatted }: { dateFormatted: string }) {
  const { t } = useLanguage();
  return (
    <span className="text-muted-foreground flex items-center gap-1 font-medium">
      {t.member_since} {dateFormatted}
    </span>
  );
}

// ✅ Bio par défaut traduite
export function DefaultBio() {
  const { t } = useLanguage();
  return (
    <span className="text-xs text-muted-foreground font-medium leading-relaxed">
      {t.buy_sell_secure}
    </span>
  );
}