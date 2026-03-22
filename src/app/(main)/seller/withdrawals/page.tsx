"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Wallet, Clock, CheckCircle2, 
  XCircle, ArrowDownLeft, Search, Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// Structure exacte de ta base de données
interface Withdrawal {
  id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  method: string;
  createdAt: string;
  reference: string;
}

export default function WithdrawalHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- RÉCUPÉRATION DES VRAIS DONNÉES ---
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/withdrawals"); 
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setWithdrawals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  // Filtrage par référence sécurisé
  const filteredWithdrawals = withdrawals.filter(w => 
    w.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20";
      case "PENDING": return "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20";
      case "FAILED": return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20";
      default: return "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-100 dark:border-zinc-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="size-3" />;
      case "PENDING": return <Clock className="size-3" />;
      case "FAILED": return <XCircle className="size-3" />;
      default: return null;
    }
  };

  // Helper pour formater la date sans crash si la date est invalide
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return "Date inconnue";
    return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-20 transition-colors">
      {/* HEADER FIXE */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-white/10 sticky top-0 z-20 px-6 py-6 transition-colors">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors active:scale-90">
            <ArrowLeft className="size-6 text-black dark:text-white" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-black dark:text-white">Mes Retraits</h1>
          <div className="size-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
            <Wallet className="size-5 text-zinc-500 dark:text-zinc-400" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence..." 
            className="w-full bg-white dark:bg-zinc-900 border border-transparent rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/20 font-bold text-sm text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all"
          />
        </div>

        {/* LISTE DES TRANSACTIONS */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-2 italic">Dernières opérations</p>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin size-8 text-blue-600" />
                <p className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-600 tracking-widest">Chargement sécurisé...</p>
             </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-white/5 transition-colors">
              <div className="mb-4 flex justify-center">
                <XCircle className="size-10 text-zinc-200 dark:text-zinc-800" />
              </div>
              <p className="text-zinc-400 dark:text-zinc-600 font-bold uppercase text-xs italic tracking-tighter">
                {searchTerm ? "Aucun retrait ne correspond à cette référence" : "Vous n'avez pas encore effectué de retrait"}
              </p>
            </div>
          ) : (
            filteredWithdrawals.map((w) => (
              <div key={w.id} className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      w.status === "COMPLETED" 
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" 
                        : w.status === "FAILED"
                        ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                    )}>
                      <ArrowDownLeft className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm uppercase tracking-tight text-black dark:text-white truncate">
                        {w.method || "Retrait Mobile Money"}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate">Réf: {w.reference}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black italic text-black dark:text-white">
                      -{w.amount.toLocaleString('fr-FR')} <span className="text-[10px] not-italic">FCFA</span>
                    </p>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase mt-1 w-fit ml-auto",
                      getStatusStyle(w.status)
                    )}>
                      {getStatusIcon(w.status)}
                      {w.status === "COMPLETED" ? "Effectué" : w.status === "PENDING" ? "En cours" : "Échoué"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-100 dark:border-white/10 flex justify-between items-center">
                    <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase italic">
                      {formatDate(w.createdAt)}
                    </p>
                    {w.status === "FAILED" && (
                      <button className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase border-b-2 border-red-600/30 dark:border-red-400/30 hover:border-red-600 transition-all">Support technique</button>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

// Fonction utilitaire pour fusionner les classes Tailwind
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}