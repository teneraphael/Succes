"use client";

import { Bell } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotificationsHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3 px-1 pt-1">
      <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
        <Bell className="size-4 text-[#4a90e2]" />
      </div>
      <div>
        {/* ✅ Titre traduit */}
        <h1 className="text-base font-black uppercase tracking-tight text-foreground leading-none">
          {t.alerts_center}
        </h1>
        {/* ✅ Description traduite */}
        <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
          {t.alerts_desc}
        </p>
      </div>
    </div>
  );
}