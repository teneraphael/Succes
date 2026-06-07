import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import {
  ForgotPasswordBackButton,
  ForgotPasswordTitle,
  ForgotPasswordFooter,
} from "./ForgotPasswordHeader";

export const metadata: Metadata = {
  title: "Recuperation — DealCity",
};

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0fff4] dark:from-[#0a0f1a] dark:via-[#0a0a0a] dark:to-[#0a0f0a] p-4 sm:p-8 transition-colors duration-300">

      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-[400px] rounded-full bg-[#4a90e2]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-[400px] rounded-full bg-[#6ab344]/5 blur-3xl" />

      {/* ✅ Bouton retour traduit */}
      <ForgotPasswordBackButton />

      <div className="w-full max-w-[420px] flex flex-col items-center gap-8">

        {/* Logo DealCity animé */}
        <div className="flex items-end gap-2">
          <div className="flex items-end gap-[5px]">
            <div className="w-[8px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
            <div className="w-[8px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
            <div className="w-[8px] h-12 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
            <div className="w-[8px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
          </div>
          <span className="text-4xl font-black text-[#6ab344] tracking-tight leading-none pb-1">
            DealCity
          </span>
        </div>

        {/* ✅ Titre traduit */}
        <ForgotPasswordTitle />

        {/* Formulaire */}
        <div className="w-full bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#4a90e2]/8 border border-[#4a90e2]/10 dark:border-white/5 p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>

        {/* ✅ Footer traduit */}
        <ForgotPasswordFooter />
      </div>
    </main>
  );
}