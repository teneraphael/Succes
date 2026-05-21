import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, amount } = body;

    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    
    if (!serviceKey) {
      throw new Error("MONETBIL_SERVICE_KEY manquante dans .env");
    }

    const numericAmount = Math.round(Number(amount));
    if (isNaN(numericAmount) || numericAmount < 1) {
      throw new Error("Montant invalide : doit être >= 1 XAF");
    }

    // Préparation des données pour Monetbil Widget v2.1
    // Utilisation de URLSearchParams pour garantir le bon formatage de type 'form-urlencoded'
    // si le format JSON pur est rejeté par leur serveur.
    const payload = {
      amount: numericAmount.toString(),
      currency: 'XAF',
      item_ref: orderId,
      payment_ref: orderId,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/users/me?tab=orders`,
    };

    const response = await fetch(`https://api.monetbil.com/widget/v2.1/${serviceKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Réponse brute reçue:", responseText);
      throw new Error("Réponse serveur illisible");
    }

    if (!data.success) {
      console.error("Erreur Monetbil détaillée:", data);
      throw new Error(data.message || "Erreur lors de l'initiation du paiement");
    }

    return NextResponse.json({ 
      success: true, 
      payment_url: data.payment_url 
    });

  } catch (error: any) {
    console.error("Erreur critique:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}