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

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  
  // Récupère l'URL de redirection (ex: /post/123) si elle existe
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
      // On passe redirectTo à l'action de login si nécessaire
      const { error } = await login(values);
      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Mail size={20} />
                  </div>
                  <Input 
                    placeholder="Email ou nom d'utilisateur" 
                    {...field} 
                    className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
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
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <PasswordInput 
                    placeholder="Mot de passe" 
                    {...field} 
                    className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest" />
            </FormItem>
          )}
        />

        {/* Bouton Connexion */}
        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[65px] rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-[0.97]"
        >
          <Sparkles className="size-5 mr-2" />
          Se connecter
        </LoadingButton>
      </form>
    </Form>
  );
}