"use client";

import { Lock, ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
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
    
    // Ici tu appelleras ton action de changement de mot de passe
    // await changePassword(formData);
    
    setTimeout(() => {
      setIsPending(false);
      toast.success("Mot de passe mis à jour !");
    }, 1500);
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <Link href="/settings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-widest">
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="px-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">Sécurité</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Protégez votre compte DealCity</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-muted/30 rounded-[2rem] border border-border p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase ml-4 text-muted-foreground">Mot de passe actuel</label>
          <PasswordInput placeholder="••••••••" required className="h-[60px] rounded-2xl bg-background border-none shadow-inner" />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase ml-4 text-muted-foreground">Nouveau mot de passe</label>
          <PasswordInput placeholder="••••••••" required className="h-[60px] rounded-2xl bg-background border-none shadow-inner" />
        </div>

        <LoadingButton loading={isPending} type="submit" className="w-full h-[60px] bg-[#5cb85c] text-white rounded-[1.5rem] font-black uppercase italic tracking-widest hover:bg-[#4ea84e] transition-all">
          Mettre à jour
        </LoadingButton>
      </form>

      <div className="p-6 bg-blue-500/5 rounded-[1.5rem] border border-blue-500/10 flex gap-4 items-start">
        <ShieldCheck className="text-blue-500 shrink-0" size={24} />
        <p className="text-xs text-blue-700/80 font-medium">
          Conseil : Utilisez un mot de passe unique d&apos;au moins 10 caractères avec des chiffres et des symboles.
        </p>
      </div>
    </div>
  );
}