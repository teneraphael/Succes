"use client";

import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Loader2, Wallet, Zap, ArrowUpRight, History, Sparkles } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import DashboardHeader from "./dashboard/DashboardHeader"; // Importation du header que nous avons créé
import { UserData } from "@/lib/types";

export default function SellerDashboard({ user }: { user: UserData }) {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-stats"],
    queryFn: () => kyInstance.get("/api/seller/stats").json<any>(),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronisation de vos Boosts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* 1. HEADER & CARTE SOLDE (Le tiroir de recharge est à l'intérieur) */}
      <DashboardHeader user={user} />

      {/* 2. RÉSUMÉ DE VISIBILITÉ (Petites stats rapides) */}
      <div className="grid grid-cols-2 gap-4 px-4 md:px-0">
        <div className="bg-card border-none shadow-sm rounded-[2rem] p-5 flex items-center gap-4">
            <div className="size-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Sparkles className="size-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Articles</p>
                <p className="text-xl font-black">{data.stats?.totalArticles || 0}</p>
            </div>
        </div>
        <div className="bg-card border-none shadow-sm rounded-[2rem] p-5 flex items-center gap-4">
            <div className="size-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <Zap className="size-5" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground leading-none mb-1">Impact</p>
                <p className="text-xl font-black">{data.stats?.totalLikes || 0} Likes</p>
            </div>
        </div>
      </div>

      {/* 3. HISTORIQUE DES ACTIVITÉS BOOST */}
      <div className="space-y-4 px-4 md:px-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-muted-foreground/70">
            <History className="size-4" />
            Historique Boost
          </div>
          <span className="text-[9px] font-bold bg-muted px-3 py-1 rounded-full uppercase">30 derniers jours</span>
        </div>
        
        <div className="rounded-[2.5rem] border-none bg-card shadow-xl shadow-black/[0.02] overflow-hidden">
          {data.transactions?.length > 0 ? (
            data.transactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between border-b border-muted/30 p-5 last:border-0 hover:bg-muted/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "rounded-2xl p-3 transition-transform group-hover:scale-110",
                    tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {tx.amount > 0 ? <Wallet size={18} /> : <Zap size={18} className="fill-current" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase tracking-tight leading-none mb-1">
                        {formatReason(tx.reason, tx.amount)}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase italic">
                        {formatRelativeDate(new Date(tx.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <span className={cn(
                        "text-sm font-black italic", 
                        tx.amount > 0 ? "text-green-600" : "text-foreground"
                    )}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} <span className="text-[9px] not-italic opacity-60">F</span>
                    </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="size-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground/30">
                    <History className="size-6" />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Aucune activité boostée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Traduction et formatage des raisons de transaction pour le vendeur
 */
function formatReason(reason: string, amount: number) {
  if (reason.includes("Propulsion") || reason.includes("Boost")) return "Mise en avant (Boost)";
  if (reason.includes("RECHARGE") || amount > 0) return "Recharge de compte";
  
  // Cas par défaut pour les frais d'interaction si tu les gardes
  if (reason.startsWith("CONTACT")) return "Mise en relation client";
  if (reason.includes("LIKE")) return "Interaction Boostée";
  
  return reason;
}