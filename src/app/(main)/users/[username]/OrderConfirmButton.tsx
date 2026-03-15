"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function OrderConfirmButton({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // On n'affiche le bouton que si le livreur a déposé le colis (Statut 'SHIPPED' ou 'ARRIVED')
  if (status !== "SHIPPED") return null;

  async function confirmReceipt() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-receipt`, { method: "POST" });
      if (res.ok) {
        toast({ description: "✅ Merci ! Le vendeur va maintenant recevoir son paiement." });
        window.location.reload();
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur lors de la confirmation." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
      <p className="text-sm font-bold text-center">Avez-vous bien reçu votre colis ?</p>
      <button 
        onClick={confirmReceipt}
        disabled={loading}
        className="w-full py-3 bg-[#6ab344] text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin size-4" /> : <CheckCircle2 className="size-4" />}
        Oui, je confirme la réception
      </button>
    </div>
  );
}