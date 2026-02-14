"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function BecomeSellerPage() {
  const { user } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login?callbackUrl=/become-seller");
    } else if (user.isSeller) {
      router.push("/");
    }
  }, [user, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Erreur lors de l'inscription");

      toast({
        description: "🚀 Félicitations ! Votre boutique est prête.",
      });

      router.refresh();
      window.location.href = "/"; 
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.isSeller) return null;

  return (
    <main className="relative min-h-svh w-full bg-[#f8fbff] dark:bg-[#050505] font-sans overflow-x-hidden">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] h-[300px] w-[300px] bg-[#4a90e2]/10 blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] h-[300px] w-[300px] bg-[#6ab344]/10 blur-[100px]" />
      </div>

      {/* BOUTON RETOUR : Forcé à gauche avec style inline pour contrer le mode RTL ou Flex du parent */}
      <div 
        style={{ left: '1.5rem', right: 'auto' }} 
        className="fixed top-6 z-[100] md:left-10 md:top-10"
      >
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-[#4a90e2] transition-all bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-2 pr-4 rounded-full border dark:border-white/5 shadow-lg"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 group-hover:bg-[#4a90e2] group-hover:text-white transition-colors">
            <ArrowLeft className="size-4" />
          </div>
          <span>Retour</span>
        </Link>
      </div>

      {/* GRILLE DE CENTRAGE : Correction du scroll et de l'alignement */}
      <div className="flex min-h-svh w-full flex-col items-center overflow-y-auto px-4 pt-28 pb-12">
        
        <div className="w-full max-w-[480px] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* HEADER */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-end gap-3 scale-110">
              <div className="flex items-end gap-[5px]">
                <div className="h-6 w-2 animate-bounce rounded-full bg-[#4a90e2] [animation-delay:-0.3s]"></div>
                <div className="h-10 w-2 animate-bounce rounded-full bg-[#4a90e2] [animation-delay:-0.15s]"></div>
                <div className="h-12 w-2 animate-bounce rounded-full bg-[#4a90e2]"></div>
                <div className="h-8 w-2 animate-bounce rounded-full bg-[#4a90e2] [animation-delay:-0.2s]"></div>
              </div>
              <span className="text-4xl font-black tracking-tighter text-[#6ab344]">DealCity</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
               <Sparkles className="size-3 text-[#4a90e2]" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4a90e2]">
                 Devenir Vendeur Certifié
               </span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
              Propulsez votre business
            </h1>
          </div>

          {/* FORMULAIRE */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-r from-[#4a90e2] to-[#6ab344] opacity-15 blur-xl group-hover:opacity-25 transition duration-1000" />
            
            <div className="relative overflow-hidden rounded-[32px] border border-white dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                    <Input name="businessName" placeholder="Nom de votre boutique" required className="h-14 pl-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl focus-visible:ring-[#4a90e2]" />
                  </div>

                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                    <Input name="businessDomain" placeholder="Domaine (ex: Tech, Mode)" required className="h-14 pl-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl focus-visible:ring-[#4a90e2]" />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                    <Input name="businessEmail" type="email" placeholder="Email professionnel" required className="h-14 pl-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl focus-visible:ring-[#4a90e2]" />
                  </div>

                  <div className="relative">
                    <ShoppingBag className="absolute left-4 top-4 size-5 text-zinc-400" />
                    <Textarea name="businessProducts" placeholder="Que vendez-vous ?" className="pl-12 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 rounded-2xl min-h-[120px] pt-4 resize-none focus-visible:ring-[#4a90e2]" />
                  </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full h-15 bg-[#4a90e2] hover:bg-[#357abd] text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-500/20 transition-transform active:scale-95">
                  {loading ? <Loader2 className="animate-spin" /> : "Créer ma boutique ✨"}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-[0.2em] font-bold">
             © 2026 DealCity Business Support
          </p>
        </div>
      </div>
    </main>
  );
}