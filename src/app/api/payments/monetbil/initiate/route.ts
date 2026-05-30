import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || '';
const DELIVERY_FEE = 10; // 🌟 Corrigé à 1000 FCFA

export async function POST(req: NextRequest) {
  try {
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // On récupère le corps de la requête
    const body = await req.json();
    const { phone, name, product } = body;

    // Validation stricte
    if (!phone || !name || !product) {
      console.error("Données manquantes reçues :", body);
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const paymentRef = `DELIV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // 1. Normalisation : On s'assure que 'product' est bien un tableau
    const productList = Array.isArray(product) ? product : [product];

    // 2. Encodage sécurisé des données
    const p_data = Buffer.from(JSON.stringify(productList)).toString('base64');

    // 3. Création de la trace en BDD
    await prisma.payment.create({
      data: {
        id: paymentRef,
        amount: DELIVERY_FEE,
        status: 'pending',
        note: `Client:${name.trim()}|Tel:${phone.trim()}|Data:${p_data}`
      },
    });

    // 4. Construction de l'URL de retour
    const returnUrl = `${baseUrl}/api/payments/monetbil/handle-redirect?ref=${paymentRef}&p_data=${encodeURIComponent(p_data)}`;

    // Mode test ou production
    if (!MONETBIL_SERVICE_KEY) {
      return NextResponse.json({
        payment_url: `${returnUrl}&status=success`,
        payment_ref: paymentRef,
        demo: true,
      });
    }

    // Appel à l'API Monetbil
    const response = await fetch(`https://api.monetbil.com/widget/v2.1/${MONETBIL_SERVICE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        amount: String(DELIVERY_FEE),
        phone: phone.trim(),
        currency: 'XAF',
        payment_ref: paymentRef,
        notify_url: `${baseUrl}/api/payments/monetbil/notify`,
        return_url: returnUrl,
        cancel_url: `${baseUrl}/pre-payment`,
        item_ref: 'delivery_fee',
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
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}