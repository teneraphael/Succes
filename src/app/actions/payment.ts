"use server";
import { initiateMonetbilPayment } from "@/lib/monetbil";

export async function processDeliveryFee(orderId: string) {
  try {
    const paymentUrl = await initiateMonetbilPayment({ orderId, amount: 1000 });
    return { url: paymentUrl };
  } catch (error) {
    return { error: "Erreur lors de l'initialisation du paiement" };
  }
}