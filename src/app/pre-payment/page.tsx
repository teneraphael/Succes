"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export default function PrePaymentPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const encodedData = searchParams.get('p_data');

    if (encodedData) {
      // CAS 1 : Données encodées (Panier)
      try {
        const decoded = atob(encodedData);
        setProductData(JSON.parse(decoded));
      } catch (err) {
        console.error("Erreur de décodage", err);
        toast({ variant: "destructive", title: "ERREUR", description: "Lien de paiement invalide." });
      }
    } else if (searchParams.get('id')) {
      // CAS 2 : Achat direct (Paramètres individuels)
      const directProduct = {
        id: searchParams.get('id'),
        variantId: searchParams.get('variantId'),
        name: searchParams.get('productName'),
        price: Number(searchParams.get('price') || 0),
        image: searchParams.get('image'),
        quantity: Number(searchParams.get('qty') || 1),
        selectedOptions: searchParams.get('selectedOptions')
      };
      setProductData(directProduct);
    }
    
    setIsLoaded(true);
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productData) return;
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const phone = formData.get('phone');
    const name = formData.get('name');

    if (!phone || !name) {
      toast({ variant: "destructive", title: "ERREUR", description: "Vieux-chéri, remplis tous les champs !" });
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
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'initialisation");
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

  if (isLoaded && !productData) {
    return <div className="min-h-screen flex items-center justify-center font-bold">Aucun produit trouvé.</div>;
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center font-black italic animate-pulse">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-card rounded-[26px] p-8 shadow-sm border border-border">
        <h1 className="text-xl font-black uppercase italic mb-6 text-center">Frais de livraison</h1>
        
        <div className="mb-6 p-4 bg-background border border-border rounded-2xl text-xs space-y-2">
          {Array.isArray(productData) ? (
            productData.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b border-border/50 pb-1 last:border-0 last:pb-0">
                <span className="font-bold truncate text-foreground">{item.name}</span>
                <span className="font-bold text-muted-foreground">x{item.quantity || 1}</span>
              </div>
            ))
          ) : (
            <>
              <p className="font-bold truncate text-muted-foreground">
                Produit : <span className="text-foreground">{productData.name}</span>
              </p>
              {productData.selectedOptions && (
                <p className="font-medium text-emerald-600">Option : {productData.selectedOptions}</p>
              )}
              <p className="text-muted-foreground">
                Quantité : <span className="font-bold text-foreground">{productData.quantity || 1}</span>
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required name="name" placeholder="Votre nom complet" className="w-full bg-background border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none" />
          <input required type="tel" name="phone" placeholder="Téléphone (ex: 670...)" className="w-full bg-background border border-border rounded-2xl py-4 px-6 font-bold text-sm outline-none" />

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase italic shadow-lg mt-4 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? "PATIENTEZ..." : "PAYER 1000 FCFA"}
          </button>
        </form>
      </div>
    </div>
  );
}