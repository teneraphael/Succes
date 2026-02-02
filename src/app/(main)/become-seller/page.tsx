"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Mail, ShoppingBag, Tag, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BecomeSellerPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/users/become-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        window.location.href = "/"; 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f8fbff] p-4 font-sans">
      
      {/* Bouton Retour rapide */}
      <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-[#4a90e2] transition-colors md:left-10 md:top-10">
        <ArrowLeft className="size-4" />
        Retour
      </Link>

      <div className="w-full max-w-[450px] space-y-8">
        
        {/* Logo DealCity avec animation légère */}
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-end gap-2 mb-4">
            <div className="flex items-end gap-[4px]">
              <div className="w-[7px] h-6 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-[7px] h-10 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-[7px] h-12 bg-[#4a90e2] rounded-full animate-bounce"></div>
              <div className="w-[7px] h-8 bg-[#4a90e2] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
            </div>
            <span className="text-4xl font-bold text-[#6ab344] tracking-tight">DealCity</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] text-center">Propulsez votre business</h1>
          <p className="text-muted-foreground text-center text-sm mt-1">Rejoignez la communauté des vendeurs certifiés</p>
        </div>

        {/* Carte du Formulaire */}
        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-blue-100/50 border border-white/50 animate-in zoom-in-95 duration-500">
          <form onSubmit={onSubmit} className="space-y-5">
            
            <div className="space-y-4">
              {/* Business Name */}
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 size-5 text-slate-400" />
                <Input 
                  name="businessName" 
                  placeholder="Nom de votre boutique" 
                  required 
                  className="h-12 pl-12 border-slate-100 bg-slate-50/50 rounded-xl focus-visible:ring-[#4a90e2] focus-visible:bg-white transition-all"
                />
              </div>

              {/* Business Domain */}
              <div className="relative">
                <Tag className="absolute left-4 top-3.5 size-5 text-slate-400" />
                <Input 
                  name="businessDomain" 
                  placeholder="Domaine (ex: Tech, Mode, Immobilier)" 
                  required 
                  className="h-12 pl-12 border-slate-100 bg-slate-50/50 rounded-xl focus-visible:ring-[#4a90e2] focus-visible:bg-white transition-all"
                />
              </div>

              {/* Business Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 size-5 text-slate-400" />
                <Input 
                  name="businessEmail" 
                  type="email" 
                  placeholder="Email professionnel" 
                  required 
                  className="h-12 pl-12 border-slate-100 bg-slate-50/50 rounded-xl focus-visible:ring-[#4a90e2] focus-visible:bg-white transition-all"
                />
              </div>

              {/* Business Description */}
              <div className="relative">
                <ShoppingBag className="absolute left-4 top-3.5 size-5 text-slate-400" />
                <Textarea 
                  name="businessProducts" 
                  placeholder="Que vendez-vous ? (Décrivez brièvement vos articles)" 
                  className="pl-12 border-slate-100 bg-slate-50/50 rounded-xl focus-visible:ring-[#4a90e2] focus-visible:bg-white transition-all min-h-[120px] pt-3"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-[#4a90e2] hover:bg-[#357abd] text-white font-bold rounded-2xl text-lg shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  Création en cours...
                </div>
              ) : (
                "Devenir Vendeur sur DealCity"
              )}
            </Button>
          </form>
        </div>

        {/* Note de confiance */}
        <p className="text-center text-xs text-slate-400 px-6 italic">
          En confirmant, vous acceptez de respecter la charte de vente non-commerciale et de qualité de DealCity.
        </p>
      </div>
    </main>
  );
}