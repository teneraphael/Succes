import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // FedaPay envoie l'événement 'transaction.approved' quand c'est bon
    if (body.event === 'transaction.approved') {
      const transactionData = body.entity;
      const amount = transactionData.amount;
      // On utilise le champ personnalisé ou la description pour retrouver l'user
      // Pour cet exemple, on suppose que vous gérez l'ID via les métadonnées
      
      // LOGIQUE DE CRÉDIT :
      // 1. Trouver l'utilisateur lié à cette transaction
      // 2. Update son solde : balance += amount
      // 3. Update le statut de la transaction en SUCCESS
      
      console.log("Paiement reçu avec succès :", amount);
    }

    return new NextResponse("Webhook reçu", { status: 200 });
  } catch (err) {
    return new NextResponse("Erreur Webhook", { status: 400 });
  }
}