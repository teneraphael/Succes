import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreditButton from "./CreditButton"; 

export default async function AdminPage() {
  const { user } = await validateRequest();
  
  // Sécurité admin
  if (!user || user.id !== "4yq76ntw6lpduptd") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black uppercase mb-8">Gestion des Crédits</h1>
      <div className="space-y-4">
        {users.map((u) => (
          <div key={u.id} className="p-4 bg-card rounded-2xl border flex justify-between items-center">
            <div>
              <p className="font-bold">{u.displayName}</p>
              <p className="text-xs text-muted-foreground italic">Solde actuel: {u.balance} F</p>
            </div>
            <div className="flex gap-2">
              <CreditButton userId={u.id} amount={1000} label="+1000 F" />
              <CreditButton userId={u.id} amount={5000} label="+5000 F" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}