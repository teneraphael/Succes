"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { 
  Menu, Star, Zap, ShieldCheck, Wallet, 
  ArrowUpRight, Loader2, Smartphone, CheckCircle2 
} from "lucide-react";
import { 
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader 
} from "@/components/ui/sheet";
import SidebarVendeur from "../SidebarVendeur";
import { useToast } from "@/components/ui/use-toast";
import { requestWithdraw, getSellerBalance } from "../actions";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toast } = useToast();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [soldeDisponible, setSoldeDisponible] = useState(0);

  // Fonction pour charger le solde
  const fetchBalance = async () => {
    try {
      const balance = await getSellerBalance();
      setSoldeDisponible(balance);
    } catch (error) {
      console.error("Erreur chargement solde:", error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // On recharge le solde à chaque ouverture du tiroir de retrait
  useEffect(() => {
    if (openWithdraw) fetchBalance();
  }, [openWithdraw]);

  const handleWithdrawRequest = async () => {
    const amount = parseInt(withdrawAmount);
    
    if (!amount || amount < 500) {
      toast({ variant: "destructive", description: "Minimum de retrait : 500 FCFA" });
      return;
    }
    
    if (amount > soldeDisponible) {
      toast({ variant: "destructive", description: "Solde insuffisant dans votre portefeuille" });
      return;
    }

    if (!user.phoneNumber) {
      toast({ variant: "destructive", description: "Veuillez configurer votre numéro dans votre profil." });
      return;
    }

    setIsWithdrawing(true);

    try {
      const result = await requestWithdraw(amount);

      if (result.success) {
        setIsWithdrawing(false);
        setOpenWithdraw(false);
        setWithdrawAmount("");
        
        // Mise à jour immédiate du solde local
        setSoldeDisponible((prev) => prev - amount);

        toast({
          description: "✅ Demande envoyée ! L'argent arrivera sur votre compte après vérification.",
          className: "bg-green-600 text-white border-none rounded-2xl shadow-xl"
        });
      }
    } catch (error: any) {
      setIsWithdrawing(false);
      toast({
        variant: "destructive",
        description: error.message || "Le service de retrait a échoué.",
      });
    }
  };

  return (
    <div className="w-full block overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#00b4d8] via-[#48cae4] to-primary p-[2px] shadow-2xl ring-1 ring-black/5">
      <div className="bg-black/10 backdrop-blur-2xl rounded-[2.4rem] p-5 md:p-8 border border-white/20">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-start mb-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 bg-white/15 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/20 active:scale-95 transition-all outline-none">
                  <Menu className="size-5 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SidebarVendeur className="h-full pt-10" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex bg-white/15 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10 items-center gap-3">
            <Star className="size-3 text-yellow-300 fill-yellow-300" />
            <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Vendeur Certifié</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* INFOS PROFIL */}
          <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative">
                <div className="rounded-[2.1rem] border-[4px] border-white/30 p-1 backdrop-blur-3xl shadow-2xl bg-white/10">
                    <UserAvatar avatarUrl={user.avatarUrl} size={100} className="size-24 md:size-28 rounded-[1.6rem] border-2 border-white/10" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-[#48cae4] shadow-xl">
                        <Zap className="size-4 text-white fill-white" />
                    </div>
                </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-[0.8]">{user.displayName}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/10 w-fit mx-auto md:mx-0">
                <ShieldCheck className="size-3 text-green-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">Éligible aux retraits</p>
              </div>
            </div>
          </div>

          {/* CARTE FINANCIÈRE */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 p-6 shadow-inner relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Solde Disponible</p>
                  <h2 className="text-4xl font-black text-white tracking-tighter">
                    {soldeDisponible.toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-80">FCFA</span>
                  </h2>
                </div>
                
                <Sheet open={openWithdraw} onOpenChange={setOpenWithdraw}>
                  <SheetTrigger asChild>
                    <button className="bg-white text-blue-600 p-4 rounded-2xl shadow-xl active:scale-90 transition-all hover:bg-blue-50">
                      <ArrowUpRight className="size-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[520px] rounded-t-[3rem] border-none p-8 bg-zinc-50 outline-none">
                    <SheetHeader className="items-center text-center space-y-4">
                      <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                        <Wallet className="size-8" />
                      </div>
                      <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic">Demander un retrait</SheetTitle>
                    </SheetHeader>

                    <div className="max-w-md mx-auto mt-8 space-y-6">
                      <div className="bg-white p-6 rounded-[2rem] border-2 border-zinc-100 shadow-sm focus-within:border-blue-500 transition-all">
                        <label className="text-[10px] font-black uppercase text-zinc-400 block mb-2">Montant à retirer (FCFA)</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 5000"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="w-full text-4xl font-black tracking-tighter border-none focus:ring-0 p-0 placeholder:text-zinc-100 bg-transparent text-black"
                        />
                      </div>

                      <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <Smartphone className="size-6 text-blue-600" />
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-blue-400">Envoi vers</p>
                          <p className="text-sm font-black italic">{user.phoneNumber || "Numéro non configuré"}</p>
                        </div>
                      </div>

                      <button 
                        onClick={handleWithdrawRequest}
                        disabled={isWithdrawing || !withdrawAmount || parseInt(withdrawAmount) < 500}
                        className="w-full py-5 bg-black text-white rounded-[1.8rem] font-black uppercase text-xs italic tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-zinc-400"
                      >
                        {isWithdrawing ? (
                          <>
                            <Loader2 className="animate-spin size-5" />
                            Traitement...
                          </>
                        ) : (
                          "Confirmer le retrait"
                        )}
                      </button>
                      <p className="text-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Délai moyen : 15 min</p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="mt-6 flex items-center gap-2 text-white/50">
                <CheckCircle2 className="size-3 text-green-400" />
                <p className="text-[9px] font-black uppercase tracking-tighter">Sécurisé par Monetbil CM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}