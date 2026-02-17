"use client";

import { formatRelativeDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Zap, Wallet, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: Date;
}

export default function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/10 rounded-[2rem] border-2 border-dashed">
        <p className="text-sm text-muted-foreground font-medium italic">Aucune transaction pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black uppercase italic tracking-tighter px-2">Historique récent</h3>
      
      <div className="space-y-3">
        {transactions.map((tx) => {
          const isExpense = tx.amount < 0;
          const isPending = tx.status === "PENDING";

          return (
            <div 
              key={tx.id} 
              className="group flex items-center justify-between p-4 rounded-3xl bg-card border border-muted/40 hover:border-primary/20 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* ICONE DYNAMIQUE */}
                <div className={cn(
                  "p-3 rounded-2xl shadow-inner transition-transform group-hover:scale-110",
                  isExpense ? "bg-rose-500/10 text-rose-500" : "bg-green-500/10 text-green-500",
                  isPending && "bg-amber-500/10 text-amber-500 animate-pulse"
                )}>
                  {isPending ? <Clock size={18} /> : isExpense ? <Zap size={18} /> : <Wallet size={18} />}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight">
                    {tx.reason.startsWith("BOOST_POST") ? "Boost d'article" : "Recharge Compte"}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {formatRelativeDate(new Date(tx.createdAt))}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className={cn(
                  "text-sm font-black italic",
                  isExpense ? "text-rose-500" : "text-green-600"
                )}>
                  {isExpense ? "" : "+"}{tx.amount.toLocaleString()} F
                </p>
                <span className={cn(
                  "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                  isPending ? "border-amber-200 bg-amber-50 text-amber-600" : "border-transparent text-muted-foreground"
                )}>
                  {tx.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}