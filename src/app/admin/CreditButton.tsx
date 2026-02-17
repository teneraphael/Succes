"use client";

import { useTransition } from "react";
import { addCreditToUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreditButtonProps {
  userId: string;
  amount: number;
  label: string;
}

export default function CreditButton({ userId, amount, label }: CreditButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleAddCredit = () => {
    if (!confirm(`Confirmer l'ajout de ${amount} FCFA à cet utilisateur ?`)) return;

    startTransition(async () => {
      try {
        await addCreditToUser(userId, amount);
        toast.success(`Crédit de ${amount} F ajouté avec succès !`);
      } catch (error: any) {
        toast.error(error.message || "Une erreur est survenue");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleAddCredit}
      className="rounded-xl font-bold border-primary/20 hover:bg-primary hover:text-white transition-all"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-3 mr-1" />}
      {label}
    </Button>
  );
}