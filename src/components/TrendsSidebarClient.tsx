"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { Users, TrendingUp } from "lucide-react";

export function WhoToFollowHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
      <div className="size-7 rounded-lg bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
        <Users className="size-3.5 text-[#4a90e2]" />
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-foreground">
        {t.following}
      </p>
    </div>
  );
}

export function TrendingTopicsHeader() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40">
      <div className="size-7 rounded-lg bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
        <TrendingUp className="size-3.5 text-[#4a90e2]" />
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-foreground">
        {t.trends}
      </p>
    </div>
  );
}