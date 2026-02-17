"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft, 
  Sparkles, MessageCircle, Facebook, Instagram, Music2 
} from "lucide-react";
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

      {/* BOUTON RETOUR */}
      <div className="fixed top-6 z-[100] left-6 md:left-10 md:top-10">
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

      <div className="flex min-h-svh w-full flex-col items-center overflow-y-auto px-4 pt-28 pb-12">
        <div className="w-full max-w-[520px] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* HEADER */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-end gap-3 scale-110">
               <span className="text-4xl font-black tracking-tighter text-[#6ab344]">DealCity</span>
               <span className="text-sm font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-md shadow-lg">PRO</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
               <Sparkles className="size-3 text-[#4a90e2]" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4a90e2]">Programme Partenaire</span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight leading-tight text-zinc-900 dark:text-zinc-100">
                Créez votre vitrine pro
            </h1>
          </div>

          {/* FORMULAIRE */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[38px] bg-gradient-to-r from-[#4a90e2] to-[#6ab344] opacity-15 blur-xl transition duration-1000" />
            
            <div className="relative overflow-hidden rounded-[32px] border border-white dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
              <form onSubmit={onSubmit} className="space-y-6">
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 italic">
                      Identité de la boutique
                  </p>
                  
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                    <Input name="businessName" placeholder="Nom commercial (ex: Maya Fashion)" required className="h-14 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50 focus-visible:ring-[#4a90e2]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                      <Input name="businessDomain" placeholder="Domaine" required className="h-14 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50" />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-400" />
                      <Input name="businessEmail" type="email" placeholder="Email pro" required className="h-14 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50" />
                    </div>
                  </div>

                  <hr className="my-6 border-zinc-100 dark:border-zinc-800" />
                  
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest ml-1 italic">
                      Réseaux & Badge Pionnier
                  </p>

                  {/* TIKTOK - DESIGNÉ POUR ÊTRE LE PLUS IMPORTANT */}
                  <div className="relative group/tiktok">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#ff0050] to-[#00f2ea] opacity-20 group-focus-within/tiktok:opacity-100 blur transition duration-500" />
                    <div className="relative">
                        <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-900 dark:text-white" />
                        <Input 
                            name="tiktokUrl" 
                            placeholder="Lien TikTok (Le plus important !)" 
                            className="h-14 pl-12 rounded-2xl border-none bg-zinc-50 dark:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white" 
                        />
                    </div>
                  </div>

                  {/* WHATSAPP */}
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-green-500" />
                    <Input name="whatsappUrl" placeholder="Lien WhatsApp (wa.me/...)" className="h-14 pl-12 rounded-2xl border-green-500/20 bg-green-500/5 focus-visible:ring-green-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-blue-600" />
                      <Input name="facebookUrl" placeholder="Lien Facebook" className="h-14 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50" />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-pink-500" />
                      <Input name="instagramUrl" placeholder="Lien Instagram" className="h-14 pl-12 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/50" />
                    </div>
                  </div>

                  <div className="relative pt-2">
                    <ShoppingBag className="absolute left-4 top-6 size-5 text-zinc-400" />
                    <Textarea name="businessProducts" placeholder="Description courte de vos produits..." className="pl-12 rounded-2xl min-h-[100px] pt-4 resize-none bg-zinc-50/50 dark:bg-zinc-800/50" />
                  </div>
                </div>
                
                <Button type="submit" disabled={loading} className="w-full h-16 bg-[#4a90e2] hover:bg-[#357abd] text-white font-black rounded-2xl text-lg shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]">
                  {loading ? <Loader2 className="animate-spin" /> : "Lancer mon business 🚀"}
                </Button>
              </form>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/60 uppercase tracking-[0.2em] font-bold italic">
              Certification automatique pour les premiers inscrits
          </p>
        </div>
      </div>
    </main>
  );
}