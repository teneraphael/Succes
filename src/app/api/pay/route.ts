import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, phoneNumber, orderId } = await req.json();

    const response = await fetch("https://api.monetbil.com/payment/v1/placePayment", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        service: process.env.MONETBIL_SERVICE_KEY!,
        amount: amount.toString(),
        phonenumber: phoneNumber,
        operator: "CM",
        item_ref: orderId,
        user_id: "customer_id", // Optionnel mais recommandé
      }),
    });

    const data = await response.json();

    // Monetbil renvoie souvent un code d'erreur si le solde est bas ou si le numéro est invalide
    if (data.status === "REQUEST_FAILED" || data.code === 402) {
       return NextResponse.json({ 
         error: "Solde insuffisant ou erreur opérateur", 
         details: data 
       }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur Monetbil:", error);
    return NextResponse.json({ error: "Erreur de connexion au service" }, { status: 500 });
  }
}