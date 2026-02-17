import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const transaction_id = formData.get("cpm_trans_id") as string;
  const site_id = formData.get("cpm_site_id") as string;

  // 1. Vérification de sécurité avec l'API CinetPay
  // On demande à CinetPay : "Est-ce que cette transaction est vraiment payée ?"
  const checkResponse = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: site_id,
      transaction_id: transaction_id,
    }),
  });

  const checkData = await checkResponse.json();

  if (checkData.code === "00" && checkData.data.status === "ACCEPTED") {
    const txAmount = parseInt(checkData.data.amount);

    // 2. Mise à jour de la DB en une seule transaction
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transaction_id },
      });

      if (transaction && transaction.status !== "SUCCESS") {
        // Valider la transaction
        await tx.transaction.update({
          where: { id: transaction_id },
          data: { status: "SUCCESS" },
        });

        // Créditer le compte du vendeur
        await tx.user.update({
          where: { id: transaction.userId },
          data: { balance: { increment: txAmount } },
        });
      }
    });

    return new Response("OK", { status: 200 });
  }

  return new Response("Error", { status: 400 });
}