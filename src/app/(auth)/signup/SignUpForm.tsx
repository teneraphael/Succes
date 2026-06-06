"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form, FormControl, FormField, FormItem, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Rocket, CheckCircle2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";

function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="font-black uppercase tracking-tighter text-base text-foreground">
            Légal & Confidentialité
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[55vh] space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="font-black text-foreground text-xs uppercase tracking-widest">
            1. Collecte des données
          </p>
          <p>Nous stockons votre email et nom d&apos;utilisateur pour créer votre profil unique et sécurisé.</p>
          <p className="font-black text-foreground text-xs uppercase tracking-widest">
            2. Notifications & Alertes
          </p>
          <p>En vous inscrivant, vous acceptez l&apos;utilisation de Firebase pour recevoir des notifications en temps réel.</p>
          <p className="font-black text-foreground text-xs uppercase tracking-widest">
            3. Sécurité
          </p>
          <p>Vos mots de passe sont protégés par un algorithme de hachage de niveau professionnel.</p>
        </div>
        <div className="p-5 border-t border-border flex justify-center">
          <button
            onClick={onClose}
            className="bg-[#4a90e2] hover:bg-[#357abd] text-white px-8 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-[0.97]"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [showTerms, setShowTerms] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", username: "", password: "" },
  });

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);
      if (error) setError(error);
    });
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-2xl border border-red-200 dark:border-red-900/50 animate-in fade-in zoom-in duration-300">
              <p className="text-center text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-tight">
                {error}
              </p>
            </div>
          )}

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#6ab344] transition-colors z-10">
                      <User size={18} />
                    </div>
                    <Input
                      placeholder="Nom d'utilisateur"
                      {...field}
                      className="h-14 rounded-2xl pl-12 bg-[#f8fff8] dark:bg-zinc-800/50 border border-[#6ab344]/10 dark:border-white/5 focus-visible:border-[#6ab344]/40 focus-visible:ring-2 focus-visible:ring-[#6ab344]/10 text-sm font-semibold transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="ml-4 text-[10px] font-black uppercase tracking-widest" />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#6ab344] transition-colors z-10">
                      <Mail size={18} />
                    </div>
                    <Input
                      placeholder="Adresse Email"
                      type="email"
                      {...field}
                      className="h-14 rounded-2xl pl-12 bg-[#f8fff8] dark:bg-zinc-800/50 border border-[#6ab344]/10 dark:border-white/5 focus-visible:border-[#6ab344]/40 focus-visible:ring-2 focus-visible:ring-[#6ab344]/10 text-sm font-semibold transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="ml-4 text-[10px] font-black uppercase tracking-widest" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#6ab344] transition-colors z-10">
                      <Lock size={18} />
                    </div>
                    <PasswordInput
                      placeholder="Créer un mot de passe"
                      {...field}
                      className="h-14 rounded-2xl pl-12 bg-[#f8fff8] dark:bg-zinc-800/50 border border-[#6ab344]/10 dark:border-white/5 focus-visible:border-[#6ab344]/40 focus-visible:ring-2 focus-visible:ring-[#6ab344]/10 text-sm font-semibold transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="ml-4 text-[10px] font-black uppercase tracking-widest" />
              </FormItem>
            )}
          />

          {/* Checkboxes */}
          <div className="space-y-3 px-1 pt-1">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="marketing"
                  defaultChecked
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-border checked:border-[#6ab344] checked:bg-[#6ab344] transition-all"
                />
                <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
              </div>
              <label htmlFor="marketing" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                Recevoir les alertes importantes
              </label>
            </div>

            <div className="flex items-start gap-3">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-border checked:border-[#4a90e2] checked:bg-[#4a90e2] transition-all"
                />
                <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
              </div>
              <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none leading-relaxed">
                J&apos;accepte les{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-[#4a90e2] underline decoration-2 underline-offset-2 hover:text-[#357abd] transition-colors"
                >
                  conditions & politique de confidentialité
                </button>
              </label>
            </div>
          </div>

          {/* Bouton inscription */}
          <LoadingButton
            loading={isPending}
            type="submit"
            className="w-full h-14 rounded-2xl bg-[#6ab344] hover:bg-[#5a9a38] text-white text-sm font-black uppercase italic tracking-tight shadow-lg shadow-[#6ab344]/25 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
          >
            {!isPending && <Rocket className="size-4" />}
            {isPending ? "Création en cours..." : "C'est parti !"}
          </LoadingButton>
        </form>
      </Form>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}