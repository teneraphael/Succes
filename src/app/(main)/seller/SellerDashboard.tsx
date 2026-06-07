"use client";

import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Loader2, Zap, History, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import DashboardHeader from "./dashboard/DashboardHeader";
import { UserData } from "@/lib/types";

export default function SellerDashboard({ user }: { user: UserData }) {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-stats"],
    queryFn: () => kyInstance.get("/api/seller/stats").json<any>(),
  });

  // ✅ Skeleton DealCity
  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="rounded-[2.5rem] bg-muted/30 animate-pulse h-64" />
        <div className="grid grid-cols-2 gap-4 px-4 md:px-0">
          <div className="bg-muted/30 animate-pulse rounded-[2rem] h-24" />
          <div className="bg-muted/30 animate-pulse rounded-[2rem] h-24" />
        </div>
        <div className="px-4 md:px-0 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-muted/30 animate-pulse rounded-2xl h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">

      {/* ✅ Header avec solde Boost */}
      <DashboardHeader user={user} />

      {/* ✅ Résumé rapide */}
      <div className="grid grid-cols-2 gap-4 px-4 md:px-0">
        <div className="bg-card border border-border/60 rounded-[2rem] p-5 flex items-center gap-4 shadow-sm">
          <div className="size-10 bg-[#4a90e2]/10 border border-[#4a90e2]/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="size-5 text-[#4a90e2]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
              Articles
            </p>
            <p className="text-xl font-black text-foreground">
              {data?.stats?.totalArticles || 0}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-[2rem] p-5 flex items-center gap-4 shadow-sm">
          <div className="size-10 bg-[#6ab344]/10 border border-[#6ab344]/20 rounded-2xl flex items-center justify-center">
            <Zap className="size-5 text-[#6ab344]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none mb-1">
              Impact
            </p>
            <p className="text-xl font-black text-foreground">
              {data?.stats?.totalLikes || 0} <span className="text-sm font-bold text-muted-foreground">likes</span>
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Historique des transactions Boost */}
      <div className="space-y-3 px-4 md:px-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <History className="size-3.5 text-[#4a90e2]" />
            Historique Boost
          </div>
          <span className="text-[9px] font-black bg-muted px-3 py-1 rounded-full uppercase tracking-widest">
            30 derniers jours
          </span>
        </div>

        <div className="rounded-[2rem] bg-card border border-border/60 shadow-sm overflow-hidden">
          {data?.transactions?.length > 0 ? (
            data.transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b border-border/40 last:border-0 p-4 hover:bg-[#4a90e2]/2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* ✅ Icône selon type de transaction */}
                  <div className={cn(
                    "size-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    tx.amount > 0
                      ? "bg-[#6ab344]/10 border border-[#6ab344]/20"
                      : "bg-amber-500/10 border border-amber-500/20"
                  )}>
                    {tx.amount > 0
                      ? <TrendingUp className="size-4 text-[#6ab344]" />
                      : <Zap className="size-4 text-amber-500" />
                    }
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-tight text-foreground leading-none mb-1">
                      {formatReason(tx.reason, tx.amount)}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase italic">
                      {formatRelativeDate(new Date(tx.createdAt))}
                    </p>
                  </div>
                </div>

                {/* ✅ Montant coloré */}
                <span className={cn(
                  "text-sm font-black italic tabular-nums",
                  tx.amount > 0 ? "text-[#6ab344]" : "text-foreground"
                )}>
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                  <span className="text-[9px] not-italic text-muted-foreground ml-0.5">F</span>
                </span>
              </div>
            ))
          ) : (
            // ✅ État vide
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="size-12 rounded-2xl bg-[#4a90e2]/10 border border-[#4a90e2]/20 flex items-center justify-center">
                <History className="size-5 text-[#4a90e2]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Aucune activite boostee.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatReason(reason: string, amount: number) {
  if (reason.includes("Propulsion") || reason.includes("Boost")) return "Mise en avant (Boost)";
  if (reason.includes("RECHARGE") || amount > 0) return "Recharge de compte";
  if (reason.startsWith("CONTACT")) return "Mise en relation client";
  if (reason.includes("LIKE")) return "Interaction boostee";
  return reason;
}