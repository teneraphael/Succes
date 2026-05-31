"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { SellerPaymentModal } from "@/components/SellerPaymentModal"; // On va créer ce fichier

export default function BecomeSellerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-slate-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black italic text-primary">DealCity PRO</CardTitle>
          <CardDescription>Passez au niveau supérieur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-4xl font-black">5000 XAF</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500 size-4" /> Publication illimitée</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500 size-4" /> Visibilité accrue</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="text-green-500 size-4" /> Contact WhatsApp direct</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full rounded-full font-bold h-12 text-lg"
            onClick={() => setIsModalOpen(true)}
          >
            Payer maintenant
          </Button>
        </CardFooter>
      </Card>

      {/* La fenêtre de saisie */}
      <SellerPaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}