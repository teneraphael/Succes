"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SellerPaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/payments/monetbil/initiate", {
      method: "POST",
      body: JSON.stringify({
        businessName: formData.get("businessName"),
        phoneNumber: formData.get("phoneNumber"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.payment_url) {
      window.location.href = data.payment_url; // Redirection vers Monetbil
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Finaliser votre inscription</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="businessName" placeholder="Nom de votre boutique" required />
          <Input name="phoneNumber" type="tel" placeholder="Numéro Mobile Money (6XXXXXXXX)" required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Chargement..." : "Payer 5000 XAF"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}