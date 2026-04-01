"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        toast({ variant: "destructive", description: "Impossible de charger la commande" });
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id, toast]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch(`/api/orders/${params.id}/update`, {
        method: "POST",
        body: JSON.stringify({
          customerName: formData.get("name"),
          customerPhone: formData.get("phone"),
          customerAddress: formData.get("address"),
          totalAmount: Number(formData.get("price")),
        }),
      });

      if (res.ok) {
        toast({ description: "Commande mise à jour !" });
        router.push("/delivery-dashboard"); // Retour au dashboard
      }
    } catch (error) {
      toast({ variant: "destructive", description: "Erreur de mise à jour" });
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 font-bold uppercase text-xs">
        <ArrowLeft className="size-4" /> Retour
      </button>

      <h1 className="text-2xl font-black uppercase italic">Modifier la commande</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">Nom du Client</label>
          <input name="name" defaultValue={order?.customerName} className="w-full p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold outline-none" />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">Téléphone</label>
          <input name="phone" defaultValue={order?.customerPhone} className="w-full p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold outline-none" />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">Prix Total (FCFA)</label>
          <input name="price" type="number" defaultValue={order?.totalAmount} className="w-full p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold outline-none text-[#6ab344]" />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-zinc-400">Adresse de livraison</label>
          <textarea name="address" defaultValue={order?.customerAddress} rows={3} className="w-full p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold outline-none" />
        </div>

        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[2rem] font-black uppercase flex items-center justify-center gap-3">
          <Save className="size-5" /> Enregistrer les modifications
        </button>
      </form>
    </main>
  );
}