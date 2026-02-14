"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Sparkles } from "lucide-react"; 
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { login } from "./actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await login(values);
      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in duration-300">
            <p className="text-center text-destructive text-xs font-bold uppercase tracking-tight">
              {error}
            </p>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative group w-full">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <Input 
                    placeholder="Email ou nom d'utilisateur" 
                    {...field} 
                    className="h-[58px] sm:h-[65px] w-full rounded-[1.2rem] sm:rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <div className="relative group w-full">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <PasswordInput 
                    placeholder="Mot de passe" 
                    {...field} 
                    className="h-[58px] sm:h-[65px] w-full rounded-[1.2rem] sm:rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  />
                </div>
              </FormControl>
              <div className="flex justify-end px-2">
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors italic active:scale-95"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest" />
            </FormItem>
          )}
        />

        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[58px] sm:h-[65px] rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-[0.97]"
        >
          <Sparkles className="size-5 mr-2" />
          Se connecter
        </LoadingButton>

        {/* --- SÉPARATEUR --- */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted/50" />
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="bg-white dark:bg-zinc-900 px-4 text-muted-foreground/60">Ou</span>
          </div>
        </div>

        {/* --- BOUTON GOOGLE --- */}
        <Link
          href="/login/google"
          className="flex w-full h-[58px] sm:h-[65px] items-center justify-center gap-3 rounded-[1.2rem] sm:rounded-[1.5rem] border-2 border-muted/30 bg-background hover:bg-muted/20 transition-all active:scale-[0.97] group"
        >
          <svg className="size-5 sm:size-6" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-black uppercase tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
            Continuer avec Google
          </span>
        </Link>
      </form>
    </Form>
  );
}