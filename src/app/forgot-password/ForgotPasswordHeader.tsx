"use client";

import { KeyRound } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export function ForgotPasswordBackButton() {
  const { t } = useLanguage();
  return (
    <Link
      href="/login"
      className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-muted-foreground hover:text-[#4a90e2] transition-colors group z-10"
    >
      <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-border group-hover:border-[#4a90e2]/30 transition-all">
        <ArrowLeft size={16} />
      </div>
      <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
        {t.back}
      </span>
    </Link>
  );
}

export function ForgotPasswordTitle() {
  const { t } = useLanguage();
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <KeyRound className="size-5 text-[#4a90e2]" />
        <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-[#4a90e2]">
          {t.forgot_password}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        {t.reset_password}
      </p>
    </div>
  );
}

export function ForgotPasswordFooter() {
  const { t } = useLanguage();
  return (
    <p className="text-sm text-muted-foreground font-medium">
      <Link
        href="/login"
        className="text-[#4a90e2] font-black hover:underline uppercase tracking-tight italic"
      >
        {t.login}
      </Link>
    </p>
  );
}