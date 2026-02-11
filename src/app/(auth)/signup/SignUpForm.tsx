"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Lock, Rocket, CheckCircle2 } from "lucide-react"; 
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";

export default function SignUpForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);
      if (error) {
        setError(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in duration-300">
            <p className="text-center text-destructive text-xs font-bold uppercase tracking-tight">
              {error}
            </p>
          </div>
        )}
        
        {/* Champ Nom d'utilisateur */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
                    <User size={20} />
                  </div>
                  <Input 
                    placeholder="Nom d'utilisateur" 
                    {...field} 
                    className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
            </FormItem>
          )}
        />

        {/* Champ Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
                    <Mail size={20} />
                  </div>
                  <Input 
                    placeholder="Adresse Email" 
                    type="email" 
                    {...field} 
                    className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
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
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#4a90e2] transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <PasswordInput 
                    placeholder="Créer un mot de passe" 
                    {...field} 
                    className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
            </FormItem>
          )}
        />

        {/* Optionnel: Consentement Marketing */}
        <div className="flex items-center gap-3 px-4 py-1">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              id="marketing" 
              defaultChecked
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:border-[#5cb85c] checked:bg-[#5cb85c] transition-all"
            />
            <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
          </div>
          <label htmlFor="marketing" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
            Recevoir les bons plans DealCity
          </label>
        </div>

        {/* Bouton Créer un compte */}
        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[65px] rounded-[1.5rem] bg-[#5cb85c] hover:bg-[#4ea84e] text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-[#5cb85c]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        >
          {!isPending && <Rocket className="size-5" />}
          {isPending ? "Création en cours..." : "C'est parti !"}
        </LoadingButton>
      </form>
    </Form>
  );
}