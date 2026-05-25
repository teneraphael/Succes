"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function PrePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log("Paramètres reçus :", Object.fromEntries(searchParams.entries()));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extraction sécurisée des données
  const productData = {
    id: searchParams.get('directId') || "",
    name: searchParams.get('productName') ? decodeURIComponent(searchParams.get('productName')!) : "Article",
    price: searchParams.get('price') || "0",
    image: searchParams.get('image') ? decodeURIComponent(searchParams.get('image')!) : "",
    quantity: searchParams.get('qty') || "1",
    color: searchParams.get('color') ? decodeURIComponent(searchParams.get('color')!) : "Standard"
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone');
    const name = formData.get('name');

    // Vérification de sécurité avant l'appel API
    if (!phone || !name) {
      toast({ variant: "destructive", title: "ERREUR", description: "Veuillez remplir tous les champs." });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/payments/monetbil/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          name, 
          product: productData 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur lors de l'initialisation du paiement");

      // Redirection vers Monetbil
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "ERREUR", description: error.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-card rounded-[26px] p-8 shadow-sm border border-border">
        <h1 className="text-xl font-black uppercase italic mb-6 text-center">
          Frais de livraison
        </h1>
        
        <p className="text-center text-muted-foreground text-sm mb-8">
          Veuillez régler les frais de livraison de <span className="font-black text-emerald-500">1000 FCFA</span> pour valider votre commande.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required 
            name="name" 
            placeholder="Votre nom complet" 
            className="w-full bg-background border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none" 
          />
          <input 
            required 
            type="tel" 
            name="phone" 
            placeholder="Numéro de téléphone (ex: 670...)" 
            className="w-full bg-background border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none" 
          />

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-lg mt-4 hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "PATIENTEZ..." : "PAYER 1000 FCFA"}
          </button>
        </form>
      </div>
    </div>
  );
}