"use client";

import { useState, useTransition } from "react";
import { generateResetCode } from "@/actions/password-reset";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      const res = await generateResetCode(email);

      if (res?.error) setError(res.error);

      if (res?.success) {
        setSuccess(res.success);
        // ✅ encodeURIComponent gère les caractères spéciaux dans l'email
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* ✅ Message d'erreur — style DealCity rouge */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-2xl border border-red-200 dark:border-red-900/50 animate-in fade-in zoom-in duration-300">
          <p className="text-center text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-tight">
            {error}
          </p>
        </div>
      )}

      {/* ✅ Message de succès — style DealCity vert */}
      {success && (
        <div className="bg-[#6ab344]/10 dark:bg-[#6ab344]/5 p-3 rounded-2xl border border-[#6ab344]/20 animate-in fade-in zoom-in duration-300">
          <p className="text-center text-[#6ab344] text-xs font-black uppercase tracking-tight">
            {success}
          </p>
        </div>
      )}

      {/* ✅ Champ email — style cohérent avec LoginForm */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
          <Mail size={18} />
        </div>
        <input
          disabled={isPending}
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-14 rounded-2xl pl-12 bg-[#f8faff] dark:bg-zinc-800/50 border border-[#4a90e2]/10 dark:border-white/5 focus:border-[#4a90e2]/40 focus:ring-2 focus:ring-[#4a90e2]/10 outline-none text-sm font-semibold transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
      </div>

      {/* ✅ Bouton envoi — bleu DealCity */}
      <LoadingButton
        loading={isPending}
        type="submit"
        className="w-full h-14 rounded-2xl bg-[#4a90e2] hover:bg-[#357abd] text-white text-sm font-black uppercase italic tracking-tight shadow-lg shadow-[#4a90e2]/25 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
      >
        <Send className="size-4" />
        {isPending ? "Envoi en cours..." : "Envoyer le code"}
      </LoadingButton>
    </form>
  );
}