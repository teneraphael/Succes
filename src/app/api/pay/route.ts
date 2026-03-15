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
        phonenumber: phoneNumber, // Format: 6xxxxxxx
        operator: "CM", // Pour le Cameroun
        item_ref: orderId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/monetbil`,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur de paiement" }, { status: 500 });
  }
}