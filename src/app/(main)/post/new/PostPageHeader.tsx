"use client";

import { Store } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function PostPageHeader() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-3 pt-2">

      {/* ✅ Logo DealCity mini */}
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-[4px]">
          <div className="w-[5px] h-4 bg-[#4a90e2] rounded-sm" />
          <div className="w-[5px] h-6 bg-[#4a90e2] rounded-sm" />
          <div className="w-[5px] h-8 bg-[#4a90e2] rounded-sm" />
          <div className="w-[5px] h-5 bg-[#4a90e2] rounded-sm" />
        </div>
        <span className="text-xl font-black text-[#6ab344] tracking-tight">
          DealCity
        </span>
      </div>

      {/* ✅ Titre + description traduits */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <Store className="size-5 text-[#4a90e2]" />
          <h1 className="text-xl font-black uppercase tracking-tight text-foreground">
            {t.publish_product}
          </h1>
        </div>
        <p className="text-xs text-muted-foreground font-medium max-w-sm">
          {t.publish_page_desc}
        </p>
      </div>
    </div>
  );
}