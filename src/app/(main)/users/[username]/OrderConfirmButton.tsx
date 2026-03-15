"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function OrderConfirmButton({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ✅ CORRECTION : On accepte "SHIPPED" ou "DELIVERED" 
  // Ou mieux, on fait confiance au parent qui a déjà filtré
  const canShow = status === "SHIPPED" || status === "DELIVERED";
  
  if (!canShow) return null;

  async function confirmReceipt() {
    setLoading(true);
    try {
      // ✅ Vérifie bien que ta route est /api/orders/${orderId}/confirm-receipt 
      // ou /api/orders/${orderId}/complete comme on a vu avant
      const res = await fetch(`/api/orders/${orderId}/confirm-receipt`, { 
        method: "POST" 
      });
      
      if (res.ok) {
        toast({ description: "✅ Merci ! Le vendeur va maintenant recevoir son paiement." });
        window.location.reload();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur lors de la confirmation." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-[#6ab344]/5 border border-[#6ab344]/20 rounded-2xl space-y-3">
      <p className="text-[10px] font-black uppercase text-center text-zinc-500">
        Avez-vous bien reçu votre colis ?
      </p>
      <button 
        onClick={confirmReceipt}
        disabled={loading}
        className="w-full py-4 bg-[#6ab344] hover:bg-[#5aa334] text-white rounded-2xl font-black uppercase italic text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-transform active:scale-95"
      >
        {loading ? (
          <Loader2 className="animate-spin size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        Oui, je confirme la réception
      </button>
    </div>
  );
}