"use client";

import LoadingButton from "@/components/LoadingButton";
import { PasswordInput } from "@/components/PasswordInput";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react"; 
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { login } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {error && <p className="text-center text-destructive text-sm font-medium">{error}</p>}
        
        {/* Champ Email */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500">
                    <Mail size={20} />
                  </div>
                  <Input 
                    placeholder="Email" 
                    {...field} 
                    className="h-[60px] rounded-full pl-14 bg-white border-none shadow-sm text-lg focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0"
                  />
                </div>
              </FormControl>
              <FormMessage className="ml-5" />
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
              <FormMessage className="ml-5" />
            </FormItem>
          )}
        />

        {/* Bouton Connexion Vert */}
        <LoadingButton 
          loading={isPending} 
          type="submit" 
          className="w-full h-[60px] rounded-full bg-[#5cb85c] hover:bg-[#4ea84e] text-white text-xl font-medium shadow-md transition-all active:scale-[0.98]"
        >
          Connexion
        </LoadingButton>
      </form>
    </Form>
  );
}