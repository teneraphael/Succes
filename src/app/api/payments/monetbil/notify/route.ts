import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import crypto from 'crypto';

const MONETBIL_SERVICE_SECRET = process.env.MONETBIL_SERVICE_SECRET || '';

export async function POST(req: NextRequest) {
  let body: Record<string, string> = {};

  // 1. Récupération des données (Monetbil envoie souvent du form-urlencoded)
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
  const transactionId = body.transaction_id || '';

  if (!paymentRef) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
  }

  // 2. Vérification de la signature HMAC (Sécurité)
  if (MONETBIL_SERVICE_SECRET && body.sign) {
    const expected = crypto
      .createHmac('sha1', MONETBIL_SERVICE_SECRET)
      .update(paymentRef + status)
      .digest('hex');
    if (expected.toLowerCase() !== body.sign.toLowerCase()) {
      console.error('[IPN] Signature invalide');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
  }

  // 3. Trouver le paiement en base
  const payment = await prisma.payment.findUnique({
    where: { id: paymentRef },
  });

  if (!payment) {
    console.warn('[IPN] Payment not found:', paymentRef);
    return NextResponse.json({ ok: true }); 
  }

  if (payment.status === 'success') {
    return NextResponse.json({ ok: true });
  }

  const isSuccess = status === 'success' || status === 'successfull' || status === '1';

  // 4. Logique de validation
  if (isSuccess) {
    // A. Marquer le paiement comme réussi
    await prisma.payment.update({
      where: { id: paymentRef },
      data: { status: 'success' }
    });

    // B. Mettre à jour ta commande pour confirmer le paiement des frais de livraison
    // On cherche l'ID de commande caché dans la note (ex: "Paiement frais livraison - Commande: cl...123")
    const orderIdMatch = payment.note?.match(/Commande: (\S+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    if (orderId) {
      await prisma.order.updateMany({
        where: { id: orderId },
        data: { 
          deliveryFeePaid: true,
          status: 'PAID', // Ou le statut qui convient à ta logique
          monetbilTxId: transactionId
        }
      });
    }

    console.log(`[IPN] ✅ Livraison payée pour ref: ${paymentRef}`);

  } else {
    // Paiement échoué ou annulé
    await prisma.payment.update({
      where: { id: paymentRef },
      data: { status: 'failed' }
    });
    console.log(`[IPN] ❌ Paiement échoué: ${paymentRef} status: ${status}`);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Delivery Fee Monetbil IPN' });
}