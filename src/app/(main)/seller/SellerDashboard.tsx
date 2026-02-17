"use client";

import { useQuery } from "@tanstack/react-query";
import kyInstance from "@/lib/ky";
import { Loader2, Wallet, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SellerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["seller-stats"],
    queryFn: () => kyInstance.get("/api/seller/stats").json<any>(),
  });

  if (isLoading) return <Loader2 className="mx-auto animate-spin" />;

  return (
    <div className="space-y-6 p-4">
      {/* CARTE DU SOLDE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-green-600 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-1">
          <span className="text-sm font-medium opacity-80">Solde actuel</span>
          <h2 className="text-4xl font-black">
            {data.balance?.toLocaleString() || 0} <span className="text-xl">FCFA</span>
          </h2>
        </div>
        <Wallet className="absolute -bottom-4 -right-4 size-32 opacity-10" />
        
        <Button className="mt-6 w-full bg-white text-primary hover:bg-white/90 font-bold rounded-xl">
          Recharger le compte
        </Button>
      </div>

      {/* HISTORIQUE DES TRANSACTIONS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <History className="size-5" />
          Historique
        </div>
        
        <div className="rounded-2xl border bg-card overflow-hidden">
          {data.transactions?.map((tx: any) => (
            <div key={tx.id} className="flex items-center justify-between border-b p-4 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "rounded-full p-2",
                  tx.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {tx.amount > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold">{formatReason(tx.reason)}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeDate(new Date(tx.createdAt))}</p>
                </div>
              </div>
              <span className={cn("font-bold", tx.amount > 0 ? "text-green-600" : "text-red-600")}>
                {tx.amount > 0 ? "+" : ""}{tx.amount} F
              </span>
            </div>
          ))}
          {!data.transactions?.length && (
            <p className="p-8 text-center text-sm text-muted-foreground">Aucune transaction pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour traduire les codes de transaction
function formatReason(reason: string) {
  if (reason.startsWith("CONTACT_FROM")) return "Nouveau client (Discuter)";
  if (reason === "LIKE_RECEIVED") return "Frais d'interaction (Like)";
  if (reason === "COMMENT_RECEIVED") return "Frais d'interaction (Commentaire)";
  if (reason === "BOOKMARK_RECEIVED") return "Mise en favori";
  if (reason === "RECHARGE") return "Rechargement compte";
  return reason;
}