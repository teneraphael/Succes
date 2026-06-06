"use client";

import { ShieldCheck, ArrowLeft, Lock, KeyRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { toast } from "sonner";

export default function SecuritySettings() {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setTimeout(() => {
      setIsPending(false);
      toast.success("Mot de passe mis à jour !");
    }, 1500);
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">

      {/* Retour */}
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#4a90e2] transition-colors group"
      >
        <div className="p-1.5 rounded-lg bg-muted/50 group-hover:bg-[#4a90e2]/10 border border-border group-hover:border-[#4a90e2]/20 transition-all">
          <ArrowLeft size={14} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          Retour aux paramètres
        </span>
      </Link>

      {/* Titre */}
      <div className="flex items-center gap-3 px-1">
        <div className="size-9 rounded-xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center shrink-0">
          <Lock className="size-4 text-[#4a90e2]" />
        </div>
        <div>
          <h1 className="text-base font-black uppercase tracking-tight text-foreground leading-none">
            Sécurité
          </h1>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
            Protégez votre compte DealCity
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-card rounded-3xl border border-border/60 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border/40 bg-[#4a90e2]/5">
          <KeyRound className="size-4 text-[#4a90e2]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#4a90e2]">
            Changer le mot de passe
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase ml-1 text-muted-foreground tracking-widest">
              Mot de passe actuel
            </label>
            <PasswordInput
              placeholder="••••••••"
              required
              className="h-14 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-sm font-semibold transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase ml-1 text-muted-foreground tracking-widest">
              Nouveau mot de passe
            </label>
            <PasswordInput
              placeholder="••••••••"
              required
              className="h-14 rounded-2xl bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-sm font-semibold transition-all"
            />
          </div>

          <LoadingButton
            loading={isPending}
            type="submit"
            className="w-full h-14 bg-[#6ab344] hover:bg-[#5a9a38] text-white rounded-2xl font-black uppercase italic tracking-tight text-sm shadow-lg shadow-[#6ab344]/20 transition-all active:scale-[0.97]"
          >
            Mettre à jour
          </LoadingButton>
        </form>
      </div>

      {/* Conseil sécurité */}
      <div className="flex gap-3 p-4 bg-[#4a90e2]/5 rounded-2xl border border-[#4a90e2]/15">
        <ShieldCheck className="size-4 text-[#4a90e2] shrink-0 mt-0.5" />
        <p className="text-xs text-[#4a90e2]/80 dark:text-[#4a90e2]/70 font-medium leading-relaxed">
          Conseil : Utilisez un mot de passe unique d&apos;au moins 10 caractères avec des chiffres et des symboles.
        </p>
      </div>

      {/* Badge DealCity */}
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
            DealCity
          </span>
        </div>
        <div className="h-px w-10 bg-border" />
      </div>

    </div>
  );
}