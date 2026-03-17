"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Wallet, Clock, CheckCircle2, 
  XCircle, ArrowDownLeft, Search, Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
        const response = await fetch("/api/withdrawals"); // Ton endpoint API
        if (!response.ok) throw new Error("Erreur lors du chargement");
        const data = await response.json();
        setWithdrawals(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  // Filtrage par référence
  const filteredWithdrawals = withdrawals.filter(w => 
    w.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-50 text-green-600 border-green-100";
      case "PENDING": return "bg-orange-50 text-orange-600 border-orange-100";
      case "FAILED": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-zinc-50 text-zinc-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 className="size-3" />;
      case "PENDING": return <Clock className="size-3" />;
      case "FAILED": return <XCircle className="size-3" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* HEADER FIXE */}
      <div className="bg-white border-b sticky top-0 z-20 px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition">
            <ArrowLeft className="size-6 text-black" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-black">Mes Retraits</h1>
          <div className="size-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
            <Wallet className="size-5 text-zinc-500" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        
        {/* BARRE DE RECHERCHE */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-black transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une référence..." 
            className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-black/5 font-bold text-sm text-black"
          />
        </div>

        {/* LISTE DES TRANSACTIONS */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-2">Historique récent</p>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="animate-spin size-8 text-zinc-300" />
                <p className="text-[10px] font-black uppercase text-zinc-400">Chargement des données...</p>
             </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-200">
              <p className="text-zinc-400 font-bold uppercase text-xs italic">
                {searchTerm ? "Aucun résultat pour cette recherche" : "Aucun retrait effectué"}
              </p>
            </div>
          ) : (
            filteredWithdrawals.map((w) => (
              <div key={w.id} className="bg-white p-5 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      w.status === "COMPLETED" ? "bg-green-100 text-green-600" : "bg-zinc-100 text-zinc-400"
                    )}>
                      <ArrowDownLeft className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight text-black">{w.method}</h3>
                      <p className="text-[10px] font-bold text-zinc-400">Réf: {w.reference}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black italic text-black">-{w.amount.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase mt-1",
                      getStatusStyle(w.status)
                    )}>
                      {getStatusIcon(w.status)}
                      {w.status === "COMPLETED" ? "Réussi" : w.status === "PENDING" ? "En cours" : "Échoué"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-100 flex justify-between items-center">
                   <p className="text-[10px] font-black text-zinc-300 uppercase italic">
                     {format(new Date(w.createdAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                   </p>
                   {w.status === "FAILED" && (
                     <button className="text-[10px] font-black text-red-600 uppercase border-b border-red-600">Erreur de réseau</button>
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
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}