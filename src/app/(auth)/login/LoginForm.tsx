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
      {/* w-full force le formulaire à ignorer toute restriction parente */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 w-full">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in duration-300">
            <p className="text-center text-destructive text-xs font-bold uppercase tracking-tight">
              {error}
            </p>
          </div>
        )}
        
        {/* Champ Email/Username */}
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
                  {/* Correction : h-[55px] sur mobile, h-[65px] sur desktop */}
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

        {/* Champ Mot de passe */}
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

        {/* Bouton Connexion */}
        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[58px] sm:h-[65px] rounded-[1.2rem] sm:rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-[0.97]"
        >
          <Sparkles className="size-5 mr-2" />
          Se connecter
        </LoadingButton>
      </form>
    </Form>
  );
}