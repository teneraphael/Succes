"use client";

import { useState } from "react";
import { useSession } from "../SessionProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const PACKS = [
  { amount: 1000, label: "Pack Débutant", bonus: 0 },
  { amount: 5000, label: "Pack Croissance", bonus: 500 },
  { amount: 10000, label: "Pack Pro", bonus: 1500 },
];

export default function BillingPage() {
  const { user } = useSession();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecharge = async () => {
    if (!selectedAmount) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/billing/recharge", {
        method: "POST",
        body: JSON.stringify({ amount: selectedAmount }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirection vers le guichet de paiement
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur lors de la connexion au guichet." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">Mon Portefeuille</h1>
        <p className="text-muted-foreground text-sm">Rechargez votre compte pour booster vos ventes</p>
      </div>

      {/* CARTE SOLDE ACTUEL */}
      <Card className="bg-primary text-white border-none rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <CardContent className="p-8 flex flex-col items-center">
          <Wallet className="size-12 opacity-20 absolute -top-2 -right-2 rotate-12" />
          <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Solde Disponible</span>
          <div className="text-5xl font-black mt-2 tracking-tighter">
            {user?.balance?.toLocaleString() || 0} <span className="text-xl">FCFA</span>
          </div>
        </CardContent>
      </Card>

      {/* SÉLECTION DES PACKS */}
      <div className="grid gap-4 md:grid-cols-3">
        {PACKS.map((pack) => (
          <button
            key={pack.amount}
            onClick={() => setSelectedAmount(pack.amount)}
            className={cn(
              "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 group",
              selectedAmount === pack.amount 
                ? "border-primary bg-primary/5 shadow-lg scale-105" 
                : "border-muted bg-card hover:border-primary/20"
            )}
          >
            <span className="text-[10px] font-black uppercase text-muted-foreground">{pack.label}</span>
            <span className="text-2xl font-black tracking-tight">{pack.amount} F</span>
            {pack.bonus > 0 && (
              <span className="bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
                +{pack.bonus} F OFFERTS
              </span>
            )}
          </button>
        ))}
      </div>

      {/* MOYENS DE PAIEMENT & ACTION */}
      <Card className="rounded-[2rem] border-none shadow-xl bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-muted">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Smartphone className="size-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">Mobile Money</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Orange, MTN, Wave</span>
              </div>
            </div>
            <ShieldCheck className="size-6 text-green-500" />
          </div>

          <Button 
            onClick={handleRecharge}
            disabled={!selectedAmount || isLoading}
            className="w-full h-14 rounded-2xl text-lg font-black italic shadow-xl shadow-primary/20"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>PAYER MAINTENANT <ArrowRight className="ml-2 size-5" /></>
            )}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-wider">
            Transaction sécurisée par cryptage SSL 256-bit
          </p>
        </CardContent>
      </Card>
    </div>
  );
}