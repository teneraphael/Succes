import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_SECRET = process.env.MONETBIL_SERVICE_SECRET || '';

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};

  // 1. Récupération des données
  const contentType = req.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const paymentRef = body.payment_ref || body.ref || '';
  const status = (body.status || '').toLowerCase();

  if (!paymentRef) return NextResponse.json({ error: 'Missing ref' }, { status: 400 });

  // 2. Vérification HMAC
  if (MONETBIL_SERVICE_SECRET && body.sign) {
    const expected = crypto
      .createHmac('sha1', MONETBIL_SERVICE_SECRET)
      .update(paymentRef + status)
      .digest('hex');
    if (expected.toLowerCase() !== body.sign.toLowerCase()) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
  }

  // 3. Trouver le paiement
  const payment = await prisma.payment.findUnique({ where: { id: paymentRef } });
  if (!payment || payment.status === 'success') return NextResponse.json({ ok: true });

  const isSuccess = ['success', 'successfull', '1'].includes(status);

  // 4. Logique de validation (Activation Vendeur)
  if (isSuccess) {
    // Extraire l'ID utilisateur de la note (stocké lors de l'initiate)
    // Format attendu dans note : "Type:SellerActivation|User:clxxxxxxx..."
    const userIdMatch = payment.note?.match(/User:(\S+)/);
    const userId = userIdMatch ? userIdMatch[1] : null;

    await prisma.$transaction([
      // A. Mettre à jour le statut du paiement
      prisma.payment.update({
        where: { id: paymentRef },
        data: { status: 'success' }
      }),
      // B. Activer le statut vendeur de l'utilisateur
      prisma.user.update({
        where: { id: userId as string },
        data: { isSeller: true }
      })
    ]);

    console.log(`[IPN] ✅ Vendeur activé pour l'utilisateur: ${userId}`);
  } else {
    await prisma.payment.update({
      where: { id: paymentRef },
      data: { status: 'failed' }
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Seller Activation IPN' });
}