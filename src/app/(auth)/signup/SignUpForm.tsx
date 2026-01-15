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
import { User, Mail, Lock } from "lucide-react"; 
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
      if (error) setError(error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && <p className="text-center text-destructive text-sm font-medium">{error}</p>}
        
        {/* Champ Nom (Username) */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <User size={20} />
                  </div>
                  <Input 
                    placeholder="Nom" 
                    {...field} 
                    className="h-[60px] rounded-full pl-14 bg-white border-none shadow-sm text-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-xs" />
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
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={20} />
                  </div>
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    {...field} 
                    className="h-[60px] rounded-full pl-14 bg-white border-none shadow-sm text-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-xs" />
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
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 z-10 size-5">
                    <Lock size={20} />
                  </div>
                  <PasswordInput 
                    placeholder="Mot de passe" 
                    {...field} 
                    className="h-[60px] rounded-full pl-14 bg-white border-none shadow-sm text-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5 text-xs" />
            </FormItem>
          )}
        />

        {/* Bouton Créer un compte Vert */}
        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[60px] rounded-full bg-[#5cb85c] hover:bg-[#4ea84e] text-white text-xl font-medium shadow-md transition-all active:scale-[0.98]"
        >
          Créer un compte
        </LoadingButton>
      </form>
    </Form>
  );
}