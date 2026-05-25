import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || '';
const DELIVERY_FEE = 10; 

export async function POST(req: NextRequest) {
  try {
    // 1. Détection dynamique du domaine (pour éviter les redirections vers localhost)
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    const { phone, name, product } = await req.json();

    if (!phone || !name) {
      return NextResponse.json({ error: 'Nom et numéro de téléphone requis' }, { status: 400 });
    }

    const paymentRef = `DELIV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 2. Encodage Base64 robuste pour garantir l'intégrité des données
    const orderDetailsBase64 = product 
      ? Buffer.from(JSON.stringify(product)).toString('base64') 
      : Buffer.from(JSON.stringify({ name: "Produit inconnu" })).toString('base64');

    // 3. Création en base avec format strict
    await prisma.payment.create({
      data: {
        id: paymentRef,
        amount: DELIVERY_FEE,
        status: 'pending',
        note: `Client:${name}|Tel:${phone}|Product:${orderDetailsBase64}`
      },
    });

    // Mode démonstration
    if (!MONETBIL_SERVICE_KEY) {
      return NextResponse.json({
        payment_url: `${baseUrl}/api/payments/monetbil/handle-redirect?status=success&ref=${paymentRef}`,
        payment_ref: paymentRef,
        demo: true,
      });
    }

    // 4. Appel à Monetbil avec URLs dynamiques
    const response = await fetch(`https://api.monetbil.com/widget/v2.1/${MONETBIL_SERVICE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        amount: String(DELIVERY_FEE),
        phone: phone,
        currency: 'XAF',
        payment_ref: paymentRef,
        notify_url: `${baseUrl}/api/payments/monetbil/notify`,
        return_url: `${baseUrl}/api/payments/monetbil/handle-redirect`,
        cancel_url: `${baseUrl}/pre-payment`,
        item_ref: 'delivery_fee',
        locale: 'fr',
      }).toString(),
    });

    const data = await response.json().catch(() => ({}));

    if (data.payment_url || data.url) {
        return NextResponse.json({ 
          payment_url: data.payment_url || data.url, 
          payment_ref: paymentRef 
        });
    }

    return NextResponse.json({ error: "Échec initialisation Monetbil" }, { status: 500 });

  } catch (err: any) {
    console.error('[Monetbil Error]:', err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}