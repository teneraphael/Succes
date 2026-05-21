"use client";

import { useState } from "react";
import { processDeliveryFee } from "@/app/actions/payment";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PayDeliveryButtonProps {
  orderId: string;
}

export function PayDeliveryButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const result = await processDeliveryFee(orderId);
      if (result.url) {
        // Redirection vers l'interface de paiement Monetbil
        window.location.href = result.url;
      } else {
        alert(result.error || "Une erreur est survenue");
        setLoading(false);
      }
    } catch (err) {
      alert("Erreur de connexion");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-[#6ab344] hover:bg-[#5a9c39] text-white font-black uppercase text-[11px] tracking-widest rounded-xl h-10"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Initialisation...
        </>
      ) : (
        <>
          <CreditCard className="size-4" />
          Payer 1000 FCFA
        </>
      )}
    </Button>
  );
}