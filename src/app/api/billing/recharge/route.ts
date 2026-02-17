import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
const { FedaPay, Transaction } = require('fedapay');

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { amount } = await req.json();

    // 1. Configurer FedaPay
    FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
    FedaPay.setEnvironment('sandbox'); // Change en 'live' quand tu seras prêt

    // 2. Créer la transaction dans TA base de données d'abord
    const dbTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: amount,
        reason: "RECHARGE_FEDAPAY",
        status: "PENDING",
      },
    });

    // 3. Créer la transaction chez FedaPay
    const fedapayTransaction = await Transaction.create({
      description: `Recharge de ${user.displayName}`,
      amount: amount,
      currency: { iso: 'XOF' }, // FedaPay utilise souvent XOF (Franc CFA)
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/billing?status=success`,
      customer: {
        firstname: user.displayName || "Client",
        email: user.email || "email@exemple.com"
      }
    });

    // 4. Générer le lien de paiement
    const token = await fedapayTransaction.generateToken();

    return NextResponse.json({ url: token.url });

  } catch (error: any) {
    console.error("Erreur FedaPay:", error);
    return NextResponse.json({ error: "Impossible d'initialiser le paiement" }, { status: 500 });
  }
}