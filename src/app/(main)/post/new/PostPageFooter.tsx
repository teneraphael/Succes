"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PostPageFooter() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-3 py-2 opacity-40">
      <div className="h-px w-10 bg-border" />
      <div className="flex items-center gap-1.5">
        <div className="flex items-end gap-[3px]">
          <div className="w-[4px] h-3 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-4 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-5 bg-[#4a90e2] rounded-sm" />
          <div className="w-[4px] h-3.5 bg-[#4a90e2] rounded-sm" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
          {t.seller_studio}
        </span>
      </div>
      <div className="h-px w-10 bg-border" />
    </div>
  );
}