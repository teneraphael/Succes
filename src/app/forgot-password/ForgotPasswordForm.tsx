"use client";

import { useState, useTransition } from "react";
import { generateResetCode } from "@/actions/password-reset";
import { useRouter } from "next/navigation";
import { Mail, Send } from "lucide-react"; // Ajout d'icônes
import LoadingButton from "@/components/LoadingButton"; // Utilisation de ton composant de bouton

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
      
      if (res?.error) {
        setError(res.error);
      }
      
      if (res?.success) {
        setSuccess(res.success);
        
        // CORRECTION : encodeURIComponent permet de gérer les e-mails avec des caractères spéciaux
        const encodedEmail = encodeURIComponent(email);
        
        setTimeout(() => {
          router.push(`/reset-password?email=${encodedEmail}`);
        }, 2000);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Message d'erreur stylisé comme ton login */}
      {error && (
        <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in">
          <p className="text-center text-destructive text-[10px] font-black uppercase tracking-tight">
            {error}
          </p>
        </div>
      )}

      {/* Message de succès stylisé */}
      {success && (
        <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20 animate-in fade-in zoom-in">
          <p className="text-center text-green-600 text-[10px] font-black uppercase tracking-tight">
            {success}
          </p>
        </div>
      )}

      {/* Champ Email avec icône (Design DealCity) */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Mail size={20} />
        </div>
        <input
          disabled={isPending}
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* Bouton stylisé comme ton LoginForm */}
      <LoadingButton
        loading={isPending}
        type="submit"
        className="w-full h-[65px] rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-[0.97]"
      >
        <Send className="size-5 mr-2" />
        {isPending ? "Envoi..." : "Envoyer le code"}
      </LoadingButton>
    </form>
  );
}