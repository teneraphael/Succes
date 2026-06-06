"use client";

import { useState, useTransition, Suspense } from "react";
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";
import { verifyAndChangePassword } from "@/actions/password-reset";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (code.length !== 6) {
      return setError("Le code doit contenir 6 chiffres.");
    }

    startTransition(async () => {
      const res = await verifyAndChangePassword(email, code, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        // ✅ Redirection automatique vers login après 3 secondes
        setTimeout(() => router.push("/login"), 3000);
      }
    });
  }

  // ✅ État succès — style DealCity vert avec animation
  if (success) {
    return (
      <div className="w-full max-w-[420px] bg-card rounded-3xl border border-[#6ab344]/20 shadow-xl shadow-[#6ab344]/8 p-10 text-center space-y-5 animate-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="size-20 rounded-2xl bg-[#6ab344]/10 border border-[#6ab344]/20 flex items-center justify-center">
            <CheckCircle2 className="size-10 text-[#6ab344] animate-bounce" />
          </div>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-black uppercase italic tracking-tight text-[#6ab344]">
            C&apos;est fait !
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Votre mot de passe a été modifié. Redirection en cours...
          </p>
        </div>
        {/* ✅ Badge DealCity */}
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6ab344]/5 border border-[#6ab344]/10 rounded-full mx-auto w-fit">
          <div className="size-1.5 rounded-full bg-[#6ab344] animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            DealCity
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] flex flex-col items-center gap-6">

      {/* ✅ Logo DealCity animé */}
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

      {/* ✅ Titre + email destinataire */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="size-5 text-[#4a90e2]" />
          <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-[#4a90e2]">
            Vérification
          </h1>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Code envoyé à{" "}
          <span className="text-[#4a90e2] font-black">{email}</span>
        </p>
      </div>

      {/* ✅ Carte formulaire — style cohérent avec les autres pages auth */}
      <div className="w-full bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-[#4a90e2]/8 border border-[#4a90e2]/10 dark:border-white/5 p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-4">

          {/* ✅ Erreur — style DealCity rouge */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-2xl border border-red-200 dark:border-red-900/50 animate-in fade-in duration-300">
              <p className="text-center text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-tight">
                {error}
              </p>
            </div>
          )}

          {/* ✅ Champ code à 6 chiffres */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Code de vérification
            </p>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
                <ShieldCheck size={18} />
              </div>
              <Input
                required
                disabled={isPending}
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="h-14 rounded-2xl pl-12 bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-center text-xl font-black tracking-[8px] transition-all"
              />
            </div>
          </div>

          {/* ✅ Champ nouveau mot de passe */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Nouveau mot de passe
            </p>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
                <Lock size={18} />
              </div>
              <PasswordInput
                required
                disabled={isPending}
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 rounded-2xl pl-12 bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus-visible:border-[#4a90e2]/40 focus-visible:ring-2 focus-visible:ring-[#4a90e2]/10 text-sm font-semibold transition-all"
              />
            </div>
          </div>

          {/* ✅ Bouton validation — bleu DealCity */}
          <LoadingButton
            loading={isPending}
            type="submit"
            className="w-full h-14 rounded-2xl bg-[#4a90e2] hover:bg-[#357abd] text-white font-black uppercase italic tracking-tight text-sm shadow-lg shadow-[#4a90e2]/25 transition-all active:scale-[0.97]"
          >
            Valider le changement
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f0fff4] dark:from-[#0a0f1a] dark:via-[#0a0a0a] dark:to-[#0a0f0a] p-4 sm:p-8 transition-colors duration-300">

      {/* ✅ Cercles décoratifs DealCity */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-[400px] rounded-full bg-[#4a90e2]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-[400px] rounded-full bg-[#6ab344]/5 blur-3xl" />

      {/* ✅ Bouton retour */}
      <Link
        href="/forgot-password"
        className="absolute top-5 left-5 sm:top-8 sm:left-8 flex items-center gap-2 text-muted-foreground hover:text-[#4a90e2] transition-colors group z-10"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-border group-hover:border-[#4a90e2]/30 transition-all">
          <ArrowLeft size={16} />
        </div>
        <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
          Retour
        </span>
      </Link>

      {/* ✅ Suspense avec skeleton DealCity */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-[4px]">
              <div className="w-[6px] h-5 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_100ms]" />
              <div className="w-[6px] h-8 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_200ms]" />
              <div className="w-[6px] h-10 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_300ms]" />
              <div className="w-[6px] h-6 bg-[#4a90e2] rounded-sm animate-[bounce_2s_infinite_400ms]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Chargement...
            </span>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}