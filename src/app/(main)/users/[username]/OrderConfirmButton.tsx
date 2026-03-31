"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OrderConfirmButtonProps {
  orderId: string;
  status: string;
}

export default function OrderConfirmButton({ orderId, status }: OrderConfirmButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // On affiche le bouton si le colis est expédié (SHIPPED) 
  // ou marqué comme livré (DELIVERED) mais pas encore "COMPLETED" (confirmé par l'acheteur)
  const canShow = status === "SHIPPED" || status === "DELIVERED";
  
  if (!canShow) return null;

  async function confirmReceipt() {
    if (loading) return;
    
    setLoading(true);
    try {
      // ✅ Utilisation de la route standard pour confirmer la réception
      const res = await fetch(`/api/orders/${orderId}/confirm-receipt`, { 
        method: "POST" 
      });
      
      if (res.ok) {
        toast({ 
          description: "✅ Réception confirmée ! Merci de votre confiance.",
          className: "bg-[#6ab344] text-white border-none rounded-2xl font-bold"
        });
        
        // On recharge la page pour mettre à jour les statuts dans la liste
        window.location.reload();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur serveur");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        description: error.message || "Impossible de confirmer la réception pour le moment." 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-[#6ab344]/5 border border-[#6ab344]/20 rounded-[1.8rem] space-y-3 transition-all animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#6ab344]/70 italic">
          Vérification Colis
        </p>
        <p className="text-[11px] font-bold text-zinc-500 text-center leading-tight">
          Avez-vous bien reçu et vérifié votre article ?
        </p>
      </div>

      <button 
        onClick={confirmReceipt}
        disabled={loading}
        className="group w-full py-4 bg-[#6ab344] hover:bg-[#5da33a] disabled:bg-zinc-300 text-white rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-3 shadow-lg shadow-[#6ab344]/20 transition-all active:scale-95 outline-none"
      >
        {loading ? (
          <Loader2 className="animate-spin size-4" />
        ) : (
          <CheckCircle2 className="size-4 group-hover:scale-110 transition-transform" />
        )}
        
        <span>
          {loading ? "Traitement..." : "Oui, colis reçu"}
        </span>
      </button>
      
      <p className="text-[8px] font-medium text-zinc-400 text-center uppercase tracking-tighter">
        Cette action clôture la transaction définitivement.
      </p>
    </div>
  );
}