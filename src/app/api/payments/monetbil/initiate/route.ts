import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || '';
const FEE = 10; 

export async function POST(req: NextRequest) {
  try {
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    const body = await req.json();
    const { businessName, phoneNumber } = body;

    if (!phoneNumber || !businessName) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const paymentRef = `PRO-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    await prisma.payment.create({
      data: {
        id: paymentRef,
        amount: FEE,
        status: 'pending',
        note: `Business:${businessName}|Tel:${phoneNumber}`
      },
    });

    const returnUrl = `${baseUrl}/become-seller?ref=${paymentRef}`;

    // APPEL VERSION V2.1
    // La clé est dans l'URL et les paramètres dans le body
    const response = await fetch(`https://api.monetbil.com/widget/v2.1/${MONETBIL_SERVICE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        amount: String(FEE),
        phone: phoneNumber.replace(/\s+/g, '').trim(),
        currency: 'XAF',
        payment_ref: paymentRef,
        notify_url: `${baseUrl}/api/payments/monetbil/notify`,
        return_url: returnUrl,
        cancel_url: `${baseUrl}/seller/become`,
        item_ref: 'seller_activation',
      }).toString(),
    });

    const textResponse = await response.text();
    
    // Log pour voir ce que Monetbil répond vraiment
    console.log("Réponse v2.1:", textResponse);

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      return NextResponse.json({ error: "Réponse invalide de Monetbil v2.1", details: textResponse }, { status: 502 });
    }

    // Dans la v2.1, l'URL est souvent dans 'payment_url' ou 'url'
    if (data.payment_url || data.url) {
      return NextResponse.json({ 
        payment_url: data.payment_url || data.url, 
        payment_ref: paymentRef 
      });
    }

    return NextResponse.json({ error: data.message || "Échec initialisation v2.1", details: data }, { status: 500 });

  } catch (err: any) {
    console.error('[Monetbil v2.1 Error]:', err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}