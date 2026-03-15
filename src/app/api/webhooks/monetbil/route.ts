import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Monetbil envoie les données en format Form Data (x-www-form-urlencoded)
    const formData = await req.formData();
    
    const status = formData.get("status"); // 'success' ou 'failed'
    const amount = formData.get("amount");
    const orderId = formData.get("item_ref"); // C'est l'ID de commande qu'on a envoyé
    const transactionId = formData.get("transaction_id");

    // 1. Vérification de base
    if (!orderId || !status) {
      return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
    }

    // 2. Si le paiement a réussi
    if (status === "success") {
      // On met à jour la commande dans la base de données
      const updatedOrder = await prisma.order.update({
        where: { id: orderId as string },
        data: {
          status: "PAID", // Ou "COMPLETED" selon ton enum
          // On peut stocker l'ID de transaction Monetbil pour archive
        },
      });

      console.log(`✅ Commande ${orderId} payée avec succès !`);

      // OPTIONNEL : Envoyer une notification au vendeur ici
      // await sendNotification(updatedOrder.sellerId, "Nouvelle commande payée !");

      return NextResponse.json({ message: "OK" }, { status: 200 });
    } else {
      // Si le paiement a échoué (solde insuffisant, annulation client, etc.)
      await prisma.order.update({
        where: { id: orderId as string },
        data: { status: "FAILED" },
      });
      
      return NextResponse.json({ message: "Paiement échoué" }, { status: 200 });
    }

  } catch (error) {
    console.error("Erreur Webhook Monetbil:", error);
    // On renvoie quand même un 200 pour éviter que Monetbil ne réessaie indéfiniment
    return NextResponse.json({ message: "Erreur interne" }, { status: 200 });
  }
}