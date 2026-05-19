"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft, 
  Sparkles, MessageCircle, Facebook, Instagram, Music2, Phone, CheckCircle2
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
  
  // États pour la barre de progression dynamique
  const [formProgress, setFormProgress] = useState(0);
  const [formDataValues, setFormDataValues] = useState({
    businessName: "",
    businessDomain: "",
    businessEmail: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login?callbackUrl=/become-seller");
    } else if (user.isSeller) {
      router.push("/");
    }
  }, [user, router]);

  // Calculer la progression du remplissage (sur les 4 champs obligatoires)
  useEffect(() => {
    const totalFields = 4;
    const filledFields = Object.values(formDataValues).filter(val => val.trim() !== "").length;
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formDataValues]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in formDataValues) {
      setFormDataValues(prev => ({ ...prev, [name]: value }));
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    // Validation renforcée du numéro (Format Cameroun / International)
    const phone = values.phoneNumber as string;
    if (phone && phone.length < 9) {
        toast({
            variant: "destructive",
            description: "Veuillez entrer un numéro de téléphone valide (ex: 2376xxxxxxxx).",
        });
        setLoading(false);
        return;
    }

    try {
      const response = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values), 
      });

      if (!response.ok) throw new Error("Erreur lors de l'inscription");

      toast({
        description: "🚀 Félicitations ! Votre boutique DealCity Pro est prête.",
      });

      router.refresh();
      // Redirection fluide vers son profil pro fraîchement créé
      router.push(`/users/${user.username}`);
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
    <main className="relative min-h-svh w-full bg-[#f8fbff] dark:bg-[#09090b] font-sans overflow-x-hidden antialiased">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#4a90e2]/15 to-transparent blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#6ab344]/15 to-transparent blur-[120px]" />
      </div>

      {/* BOUTON RETOUR */}
      <div className="fixed top-6 z-50 left-4 md:left-10 md:top-10">
        <Link 
          href="/" 
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#4a90e2] dark:text-zinc-400 dark:hover:text-white transition-all bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 pr-5 rounded-full border border-slate-200/50 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 group-hover:bg-[#4a90e2] group-hover:text-white transition-colors">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          <span>Retour</span>
        </Link>
      </div>

      <div className="relative z-10 flex min-h-svh w-full flex-col items-center px-4 pt-24 pb-16">
        <div className="w-full max-w-[540px] space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* HEADER */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-end gap-2.5 transform hover:scale-105 transition-transform duration-300">
               <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-[#4a90e2] to-[#6ab344] bg-clip-text text-transparent">DealCity</span>
               <span className="text-xs font-black bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-2 py-0.5 rounded-lg shadow-md uppercase tracking-wider">PRO</span>
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100/50 dark:border-blue-500/20 shadow-sm">
               <Sparkles className="size-3.5 text-[#4a90e2] animate-pulse" />
               <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#4a90e2]">Accès Créateur & Vendeur</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
                Propulsez votre activité locale
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">
              Ouvrez votre vitrine en 1 minute et touchez des milliers de clients sur la plateforme.
            </p>
          </div>

          {/* FORMULAIRE CONTAINER */}
          <div className="relative">
            {/* Bordure lumineuse au survol */}
            <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-[#4a90e2] to-[#6ab344] opacity-20 blur-lg group-hover:opacity-30 transition duration-1000" />
            
            <div className="relative overflow-hidden rounded-[30px] border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-xl backdrop-blur-md">
              
              {/* BARRE DE PROGRESSION UX */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-zinc-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#4a90e2] to-[#6ab344] transition-all duration-500"
                  style={{ width: `${formProgress}%` }}
                />
              </div>

              <form onSubmit={onSubmit} className="space-y-6 pt-2">
                
                {/* SECTION 1: IDENTITÉ */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1">
                      <Briefcase className="size-3" /> Identité de la marque
                    </p>
                    {formProgress === 100 && (
                      <span className="text-[10px] font-bold text-[#6ab344] flex items-center gap-1 animate-bounce">
                        <CheckCircle2 className="size-3" /> Prêt à lancer
                      </span>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#4a90e2] transition-colors" />
                    <Input 
                      name="businessName" 
                      onChange={handleInputChange}
                      placeholder="Nom commercial (ex: Maya Fashion, Ndop Artisanal)" 
                      required 
                      className="h-13 pl-12 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#4a90e2] font-semibold" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <Input 
                        name="businessDomain" 
                        onChange={handleInputChange}
                        placeholder="Domaine (ex: Mode, Chaussures)" 
                        required 
                        className="h-13 pl-12 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#4a90e2]" 
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <Input 
                        name="businessEmail" 
                        type="email" 
                        onChange={handleInputChange}
                        placeholder="Email professionnel" 
                        required 
                        className="h-13 pl-12 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#4a90e2]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-zinc-800/60 my-2" />
                
                {/* SECTION 2: CANAUX DE VENTES */}
                <div className="space-y-3.5">
                  <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-wider flex items-center gap-1">
                     <Phone className="size-3" /> Contacts & Réseaux Sociaux
                  </p>

                  {/* WHATSAPP OFFICIEL (Le canal prioritaire au Cameroun) */}
                  <div className="space-y-2.5 p-3 rounded-2xl bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-500/10">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-emerald-600" />
                      <Input 
                        name="phoneNumber" 
                        onChange={handleInputChange}
                        placeholder="Numéro WhatsApp principal (ex: 2376xxxxxxxx)" 
                        required 
                        className="h-13 pl-12 rounded-xl border-emerald-500/30 bg-white dark:bg-zinc-900 focus-visible:ring-emerald-500 font-bold text-slate-800 dark:text-zinc-100" 
                      />
                    </div>
                    
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <Input 
                        name="whatsappUrl" 
                        placeholder="Lien d'intégration du catalogue ou groupe (Optionnel)" 
                        className="h-12 pl-12 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus-visible:ring-emerald-500 text-xs text-slate-500" 
                      />
                    </div>
                  </div>

                  {/* TIKTOK */}
                  <div className="relative group/tiktok">
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[#ff0050] to-[#00f2ea] opacity-10 group-focus-within/tiktok:opacity-40 blur-xs transition duration-300" />
                    <div className="relative">
                      <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-800 dark:text-zinc-200" />
                      <Input 
                        name="tiktokUrl" 
                        placeholder="Nom d'utilisateur ou Lien TikTok" 
                        className="h-13 pl-12 rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-800 focus-visible:ring-black dark:focus-visible:ring-white" 
                      />
                    </div>
                  </div>

                  {/* AUTRES LIENS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="relative">
                      <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-blue-600" />
                      <Input name="facebookUrl" placeholder="Lien Page Facebook" className="h-13 pl-12 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-500" />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-pink-500" />
                      <Input name="instagramUrl" placeholder="Lien Compte Instagram" className="h-13 pl-12 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-pink-500" />
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <ShoppingBag className="absolute left-4 top-5 size-5 text-slate-400" />
                    <Textarea 
                      name="businessProducts" 
                      placeholder="Décrivez brièvement vos créations phares (ex: Sacs en Bogolan, Bombers personnalisés, Chaussures faites main...)" 
                      className="pl-12 rounded-xl min-h-[90px] pt-3.5 resize-none bg-slate-50/50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#4a90e2] text-sm leading-relaxed" 
                    />
                  </div>
                </div>
                
                {/* BOUTON D'ACTION PRINCIPAL */}
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-15 bg-gradient-to-r from-[#4a90e2] to-[#357abd] hover:from-[#357abd] hover:to-[#2a629b] text-white font-black rounded-xl text-md shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin size-5" />
                      <span>Création de votre espace pro...</span>
                    </>
                  ) : (
                    <>
                      <span>Activer ma Vitrine Pro</span>
                      <span>🚀</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* PETIT FOOTER DISCRET */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] text-center text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
             <Sparkles className="size-3 text-amber-500" />
             <span>Badge de certification gratuit inclus pour les fondateurs</span>
          </div>
          
        </div>
      </div>
    </main>
  );
}