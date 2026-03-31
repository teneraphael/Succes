"use client";

import { useState, useEffect } from "react";
import { UserData } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import { 
  Menu, Zap, ShieldCheck, 
  Loader2, CheckCircle2, 
  PlusCircle, Info, MessageCircle
} from "lucide-react";
import { 
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader 
} from "@/components/ui/sheet";
import SidebarVendeur from "../SidebarVendeur";
import { useToast } from "@/components/ui/use-toast";
import { getSellerBalance } from "../actions";

interface DashboardHeaderProps {
  user: UserData;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toast } = useToast();
  const [openRecharge, setOpenRecharge] = useState(false);
  const [soldeBoost, setSoldeBoost] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Numéros configurés pour le Cameroun
  const NUMERO_ORANGE = "687305263"; 
  const NUMERO_MTN = "673910659";

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const balance = await getSellerBalance();
      setSoldeBoost(balance || 0);
    } catch (error) {
      console.error("Erreur solde:", error);
      toast({
        variant: "destructive",
        description: "Impossible de récupérer votre solde boost."
      });
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fonction WhatsApp améliorée avec message automatique
  const openWhatsApp = (num: string, method: string) => {
    const message = encodeURIComponent(
      `Bonjour DealCity ! Je souhaite recharger mon compte Boost.\n\n` +
      `Vendeur : ${user.displayName}\n` +
      `Méthode : ${method}\n` +
      `ID : ${user.id}`
    );
    window.open(`https://wa.me/237${num}?text=${message}`, "_blank");
  };

  return (
    <div className="w-full block overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-black p-[2px] shadow-2xl">
      <div className="bg-black/20 backdrop-blur-2xl rounded-[2.4rem] p-5 md:p-8 border border-white/10">
        
        {/* BARRE SUPÉRIEURE */}
        <div className="flex justify-between items-start mb-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 active:scale-95 transition-all">
                  <Menu className="size-5 text-white" />
                  <span className="text-[10px] font-black uppercase text-white tracking-widest">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none bg-zinc-950">
                <SheetTitle className="sr-only">Menu Vendeur</SheetTitle>
                <SidebarVendeur className="h-full pt-10" />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex bg-[#6ab344]/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-[#6ab344]/30 items-center gap-3">
            <ShieldCheck className="size-3 text-[#6ab344]" />
            <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Vendeur Cash Vérifié</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* PROFIL */}
          <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="relative">
              <div className="rounded-[2.1rem] border-[4px] border-white/20 p-1 bg-white/5 shadow-2xl">
                <UserAvatar avatarUrl={user.avatarUrl} size={100} className="size-24 md:size-28 rounded-[1.6rem]" />
                <div className="absolute -bottom-2 -right-2 bg-[#6ab344] p-2 rounded-xl border-4 border-[#1e293b] shadow-xl">
                  <CheckCircle2 className="size-4 text-white" />
                </div>
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                {user.displayName}
              </h1>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em]">Membre Pionnier DealCity</p>
            </div>
          </div>

          {/* CARTE BOOST */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 shadow-inner relative group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Crédits Boost</p>
                  {loadingBalance ? (
                    <div className="flex items-center gap-2 h-10">
                      <Loader2 className="animate-spin text-white/20 size-6" />
                    </div>
                  ) : (
                    <h2 className="text-4xl font-black text-white tracking-tighter">
                      {soldeBoost.toLocaleString('fr-FR')} <span className="text-sm font-bold opacity-50">FCFA</span>
                    </h2>
                  )}
                </div>
                
                <Sheet open={openRecharge} onOpenChange={setOpenRecharge}>
                  <SheetTrigger asChild>
                    <button className="bg-white text-black p-4 rounded-2xl shadow-xl active:scale-90 transition-all hover:bg-[#6ab344] hover:text-white">
                      <PlusCircle className="size-6" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh] md:h-[650px] rounded-t-[3rem] border-none p-8 bg-zinc-50 outline-none overflow-y-auto">
                    <SheetHeader className="items-center text-center space-y-4">
                      <div className="size-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-inner">
                        <Zap className="size-8 fill-current" />
                      </div>
                      <SheetTitle className="text-2xl font-black uppercase tracking-tighter italic">Recharger mes Boosts</SheetTitle>
                    </SheetHeader>

                    <div className="max-w-md mx-auto mt-6 space-y-6">
                      <div className="bg-black p-6 rounded-[2.5rem] text-white shadow-2xl">
                        <p className="text-[10px] font-black uppercase opacity-60 mb-4 tracking-widest text-center">Choisissez votre mode de paiement</p>
                        
                        <div className="space-y-3">
                          {/* OPTION ORANGE */}
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-orange-600/20 transition-colors">
                            <div>
                                <p className="text-[9px] font-black text-orange-400 uppercase">Orange Money</p>
                                <span className="font-mono font-black text-lg">{NUMERO_ORANGE}</span>
                            </div>
                            <button onClick={() => openWhatsApp(NUMERO_ORANGE, "Orange Money")} className="bg-orange-500 p-2.5 rounded-xl shadow-lg active:scale-90 transition-all">
                                <MessageCircle className="size-5 text-white" />
                            </button>
                          </div>

                          {/* OPTION MTN */}
                          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-yellow-600/20 transition-colors">
                            <div>
                                <p className="text-[9px] font-black text-yellow-400 uppercase">MTN Mobile Money</p>
                                <span className="font-mono font-black text-lg">{NUMERO_MTN}</span>
                            </div>
                            <button onClick={() => openWhatsApp(NUMERO_MTN, "MTN MoMo")} className="bg-yellow-500 p-2.5 rounded-xl shadow-lg active:scale-90 transition-all">
                                <MessageCircle className="size-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                        <Info className="size-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="text-[11px] font-bold text-blue-900 leading-tight">
                          <p className="mb-1">1. Effectuez le dépôt au numéro de votre choix.</p>
                          <p className="mb-1">2. Cliquez sur l&apos;icône Message pour envoyer la capture de transaction.</p>
                          <p>3. Vos crédits seront ajoutés après validation (500 FCFA / Boost).</p>
                        </div>
                      </div>

                      <p className="text-center text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-relaxed">
                        Le boost propulse vos articles en tête de liste pour vendre plus rapidement sur DealCity.
                      </p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="mt-6 flex items-center gap-2 text-white/30">
                <Zap className="size-3 text-orange-400 fill-orange-400" />
                <p className="text-[9px] font-black uppercase tracking-tighter italic">Paiements cash à la livraison activés</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}