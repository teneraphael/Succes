import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, phoneNumber } = body;

    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    
    // Pour l'API v1, le montant doit être envoyé comme une CHAÎNE de caractères (string)
    const FIXED_AMOUNT = "1000"; 

    if (!serviceKey || !phoneNumber) {
      throw new Error("Clé de service ou numéro de téléphone manquant");
    }

    const payload = {
      service: serviceKey,
      phonenumber: phoneNumber,
      amount: FIXED_AMOUNT,
      item_ref: orderId,
      payment_ref: orderId,
      country: "CM",
      currency: "XAF",
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/webhook`
    };

    console.log("Envoi à Monetbil API v1:", JSON.stringify(payload));

    const response = await fetch(`https://api.monetbil.com/payment/v1/placePayment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    // Loguer la réponse brute pour voir le vrai message d'erreur
    console.log("Réponse brute Monetbil:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Le serveur Monetbil a répondu par une erreur HTML (voir logs)");
    }

    if (data.status !== "REQUEST_ACCEPTED") {
      throw new Error(data.message || "Erreur Monetbil: " + data.status);
    }

    return NextResponse.json({ 
      success: true, 
      paymentId: data.paymentId,
      ussd_code: data.channel_ussd,
      channel_name: data.channel_name
    });

  } catch (error: any) {
    console.error("ERREUR_API_V1:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}