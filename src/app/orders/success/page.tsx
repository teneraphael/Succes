import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({ params }: { params: { orderId: string } }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle2 className="size-12 text-green-600" />
      </div>
      
      <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2">
        Paiement Reçu !
      </h1>
      
      <p className="text-slate-500 max-w-sm mb-8">
        Vos 1000 FCFA de frais de livraison ont été confirmés. Votre commande est désormais en cours de traitement.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button asChild>
          <Link href="/orders">Voir mes commandes</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </main>
  );
}