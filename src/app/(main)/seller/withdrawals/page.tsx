"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Zap, Clock, CheckCircle2, 
  XCircle, ArrowUpRight, Search, Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// Structure adaptée pour les recharges de Boost
interface BoostTransaction {
  id: string;
  amount: number; // Montant en FCFA
  status: "PENDING" | "COMPLETED" | "FAILED";
  type: "RECHARGE" | "USAGE"; // Recharge de compte ou utilisation pour un article
  createdAt: string;
  reference: string;
}

export default function BoostHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<BoostTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- RÉCUPÉRATION DES DONNÉES DE BOOST ---
  useEffect(() => {
    const fetchBoostHistory = async () => {
      try {
        setLoading(true);
        // On appelle ta nouvelle route API dédiée au boost
        const response = await fetch("/api/boost/history"); 
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoostHistory();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return "Date inconnue";
    return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-20 transition-colors">
      {/* HEADER FIXE */}
      <div className="bg-white dark:bg-zinc-900 border-b dark:border-white/10 sticky top-0 z-20 px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all active:scale-90">
            <ArrowLeft className="size-6 text-black dark:text-white" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-black dark:text-white">Historique Boost</h1>
          <div className="size-10 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center">
            <Zap className="size-5 text-orange-600 dark:text-orange-400 fill-current" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-orange-600 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence..." 
            className="w-full bg-white dark:bg-zinc-900 border border-transparent rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-orange-600/20 focus:border-orange-600/20 font-bold text-sm text-black dark:text-white outline-none transition-all"
          />
        </div>

        {/* LISTE DES TRANSACTIONS */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 px-2 italic">Activités récentes</p>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin size-8 text-orange-600" />
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Mise à jour du solde...</p>
             </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-white/5 transition-colors">
              <div className="mb-4 flex justify-center text-zinc-200 dark:text-zinc-800">
                <Zap className="size-10" />
              </div>
              <p className="text-zinc-400 dark:text-zinc-600 font-bold uppercase text-xs italic tracking-tighter px-6">
                {searchTerm ? "Aucun résultat trouvé" : "Aucune recharge ou utilisation de boost pour le moment"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div key={t.id} className="bg-white dark:bg-zinc-900 p-5 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      t.type === "RECHARGE" 
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400" 
                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                    )}>
                      {t.type === "RECHARGE" ? <PlusCircleIcon className="size-6" /> : <ArrowUpRight className="size-6" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-sm uppercase tracking-tight text-black dark:text-white truncate">
                        {t.type === "RECHARGE" ? "Recharge de Crédits" : "Utilisation Boost"}
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 truncate">Réf: {t.reference}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-lg font-black italic",
                      t.type === "RECHARGE" ? "text-green-600" : "text-black dark:text-white"
                    )}>
                      {t.type === "RECHARGE" ? "+" : "-"}{t.amount.toLocaleString('fr-FR')} <span className="text-[10px] not-italic">FCFA</span>
                    </p>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase mt-1 w-fit ml-auto",
                      getStatusStyle(t.status)
                    )}>
                      {getStatusIcon(t.status)}
                      {t.status === "COMPLETED" ? "Validé" : t.status === "PENDING" ? "En attente" : "Échoué"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-100 dark:border-white/10 flex justify-between items-center">
                    <p className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase italic">
                      {formatDate(t.createdAt)}
                    </p>
                    {t.status === "PENDING" && t.type === "RECHARGE" && (
                      <p className="text-[9px] font-bold text-orange-500 animate-pulse uppercase">Validation manuelle (15 min)</p>
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

// Icone simple pour la recharge
function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}