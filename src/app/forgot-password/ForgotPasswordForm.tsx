"use client";

import { useState, useTransition } from "react";
import { generateResetCode } from "@/actions/password-reset";
import { useRouter } from "next/navigation";

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
        // On redirige vers la page de saisie du code après 2 secondes
        setTimeout(() => {
          router.push(`/reset-password?email=${email}`);
        }, 2000);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        disabled={isPending}
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-5 py-4 rounded-2xl bg-[#f0f7ff] border-none focus:ring-2 focus:ring-[#4a90e2] text-sm font-medium outline-none transition-all"
      />
      
      {error && <p className="text-red-500 text-xs font-bold px-2">{error}</p>}
      {success && <p className="text-green-500 text-xs font-bold px-2">{success}</p>}

      <button
        disabled={isPending}
        type="submit"
        className="w-full py-4 bg-[#4a90e2] text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-[#357abd] transition-all disabled:opacity-50"
      >
        {isPending ? "Envoi en cours..." : "Envoyer le code"}
      </button>
    </form>
  );
}