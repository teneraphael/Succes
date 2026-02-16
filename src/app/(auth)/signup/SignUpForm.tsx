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
import { User, Mail, Lock, Rocket, CheckCircle2, X } from "lucide-react"; 
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signUp } from "./actions";

// --- PETIT COMPOSANT MODAL INTERNE ---
function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-border">
        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
          <h2 className="font-black uppercase tracking-tighter text-xl">Légal & Confidentialité</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[60vh] space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground">1. Collecte des données</p>
          <p>DealCity stocke votre email et nom d&apos;utilisateur pour créer votre profil unique.</p>
          <p className="font-bold text-foreground">2. Notifications & Chat</p>
          <p>En vous inscrivant, vous acceptez l&apos;utilisation de Firebase (notifications) et Stream.io (messagerie) pour le bon fonctionnement des échanges.</p>
          <p className="font-bold text-foreground">3. Sécurité</p>
          <p>Vos mots de passe sont cryptés et ne sont jamais visibles par notre équipe.</p>
        </div>
        <div className="p-6 bg-muted/30 text-center">
          <button onClick={onClose} className="bg-[#4a90e2] text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-[#357abd] transition-all">
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
  const [showTerms, setShowTerms] = useState(false); // État pour la modal

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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 p-3 rounded-2xl border border-destructive/20 animate-in fade-in zoom-in duration-300">
              <p className="text-center text-destructive text-xs font-bold uppercase tracking-tight">
                {error}
              </p>
            </div>
          )}
          
          {/* Champs Username, Email, Password (gardés tels quels) */}
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
                    <Input placeholder="Nom d'utilisateur" {...field} className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all" />
                  </div>
                </FormControl>
                <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
              </FormItem>
            )}
          />

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
                    <Input placeholder="Adresse Email" type="email" {...field} className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all" />
                  </div>
                </FormControl>
                <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
              </FormItem>
            )}
          />

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
                    <PasswordInput placeholder="Créer un mot de passe" {...field} className="h-[65px] rounded-[1.5rem] pl-14 bg-muted/30 border-none shadow-inner text-base font-semibold focus-visible:ring-2 focus-visible:ring-[#4a90e2]/20 transition-all" />
                  </div>
                </FormControl>
                <FormMessage className="ml-5 text-[10px] font-black uppercase tracking-widest text-destructive/80" />
              </FormItem>
            )}
          />

          {/* --- SECTION LÉGALE AJOUTÉE --- */}
          <div className="space-y-3 px-2">
            {/* Consentement Marketing (Optionnel) */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input type="checkbox" id="marketing" defaultChecked className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:border-[#5cb85c] checked:bg-[#5cb85c] transition-all" />
                <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
              </div>
              <label htmlFor="marketing" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                Recevoir les bons plans DealCity
              </label>
            </div>

            {/* Consentement Légal (OBLIGATOIRE) */}
            <div className="flex items-start gap-3">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required // Bloque le formulaire si non coché
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:border-[#4a90e2] checked:bg-[#4a90e2] transition-all" 
                />
                <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none p-0.5" />
              </div>
              <label htmlFor="terms" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer select-none">
                J&apos;accepte les{" "}
                <button 
                  type="button" 
                  onClick={() => setShowTerms(true)}
                  className="text-[#4a90e2] underline decoration-2 underline-offset-2"
                >
                  conditions & la politique de confidentialité
                </button>
              </label>
            </div>
          </div>

          <LoadingButton loading={isPending} type="submit" className="w-full h-[65px] rounded-[1.5rem] bg-[#5cb85c] hover:bg-[#4ea84e] text-white text-lg font-black uppercase italic tracking-tighter shadow-lg shadow-[#5cb85c]/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
            {!isPending && <Rocket className="size-5" />}
            {isPending ? "Création en cours..." : "C'est parti !"}
          </LoadingButton>
        </form>
      </Form>

      {/* Affichage de la Modal */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
}