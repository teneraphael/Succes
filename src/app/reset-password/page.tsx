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
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    });
  }

  if (success) {
    return (
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-4 animate-in zoom-in duration-300">
        <div className="flex justify-center">
          <CheckCircle2 className="size-16 text-green-500 animate-bounce" />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-primary">C&apos;est fait !</h2>
        <p className="text-sm text-muted-foreground font-medium">Votre mot de passe a été modifié. Redirection...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-8">
        <h1 className="text-[#4a90e2] text-2xl font-black italic uppercase tracking-tighter mb-2">Vérification</h1>
        <p className="text-sm text-[#4b5563]/70 font-medium">Code envoyé à <span className="text-primary font-bold">{email}</span></p>
      </div>

      <div className="bg-white p-8 rounded-[2.3rem] shadow-xl shadow-[#4a90e2]/5">
        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in">
              <p className="text-center text-destructive text-[10px] font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <ShieldCheck size={20} />
            </div>
            <Input
              required
              disabled={isPending}
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none text-center text-xl font-black tracking-[8px] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none"
            />
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
              <Lock size={20} />
            </div>
            <PasswordInput
              required
              disabled={isPending}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all outline-none"
            />
          </div>

          <LoadingButton loading={isPending} type="submit" className="w-full h-[65px] rounded-[1.5rem] bg-primary text-white font-black uppercase italic tracking-tighter">
            Valider le changement
          </LoadingButton>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f0f7ff] p-6 relative">
      <Link href="/forgot-password" 
  className="absolute top-8 left-8 flex items-center gap-2 text-[#4b5563] hover:text-[#4a90e2] transition-colors group">
        <div className="p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all">
          <ArrowLeft size={18} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Retour</span>
      </Link>
      <Suspense fallback={<div className="animate-pulse font-black uppercase tracking-widest text-xs">Chargement...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}