import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_KEY = process.env.MONETBIL_SERVICE_KEY || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const DELIVERY_FEE = 1000; 

export async function POST(req: NextRequest) {
  try {
    const { phone, name, product } = await req.json(); // On récupère 'product'

    if (!phone || !name) {
      return NextResponse.json({ error: 'Nom et numéro de téléphone requis' }, { status: 400 });
    }

    const paymentRef = `DELIV-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // On transforme l'objet produit en JSON sécurisé
    const orderDetails = product ? JSON.stringify(product) : '{"name": "Commande sans produit"}';

    // Création de l'enregistrement en base de données
    await prisma.payment.create({
      data: {
        id: paymentRef,
        amount: DELIVERY_FEE,
        status: 'pending',
        note: `Client: ${name} | Tel: ${phone} | Product: ${orderDetails}`
      },
    });

    // Mode démonstration si pas de clé API
    if (!MONETBIL_SERVICE_KEY) {
      return NextResponse.json({
        payment_url: `${APP_URL}/api/payments/monetbil/handle-redirect?status=success&ref=${paymentRef}`,
        payment_ref: paymentRef,
        demo: true,
      });
    }

    // Appel à Monetbil
    const response = await fetch(`https://api.monetbil.com/widget/v2.1/${MONETBIL_SERVICE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        amount: String(DELIVERY_FEE),
        phone: phone,
        currency: 'XAF',
        payment_ref: paymentRef,
        notify_url: `${APP_URL}/api/payments/monetbil/notify`,
        return_url: `${APP_URL}/api/payments/monetbil/handle-redirect`,
        cancel_url: `${APP_URL}/pre-payment`,
        item_ref: 'delivery_fee',
        locale: 'fr',
      }).toString(),
    });

    const data = await response.json().catch(() => ({}));

    // Si Monetbil renvoie une URL de paiement
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