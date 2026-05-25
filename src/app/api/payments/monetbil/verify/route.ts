import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Récupération des données depuis le frontend
    const { paymentRef, status, transactionId } = await req.json();

    if (!paymentRef) {
      return NextResponse.json({ error: 'paymentRef manquant' }, { status: 400 });
    }

    // 2. Chercher le paiement en base
    const payment = await prisma.payment.findUnique({
      where: { id: paymentRef },
    });

    if (!payment) {
      return NextResponse.json({ confirmed: false, status: 'not_found' });
    }

    // 3. Déjà traité (Idempotence)
    if (payment.status === 'success') {
      return NextResponse.json({ confirmed: true, status: 'success' });
    }

    // 4. Paiement échoué
    if (payment.status === 'failed') {
      return NextResponse.json({ confirmed: false, status: 'failed' });
    }

    // 5. Vérifier le statut envoyé par le frontend (callback après redirection)
    const s = (status || '').toLowerCase().trim();
    const isSuccess = s === 'success' || s === 'successfull' || s === '1';

    if (!isSuccess || !transactionId) {
      return NextResponse.json({ confirmed: false, status: 'pending' });
    }

    // 6. Activer la livraison en base de données
    // On extrait l'orderId de la note du paiement
    const orderIdMatch = payment.note?.match(/Commande: (\S+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // Mise à jour transactionnelle
    await prisma.$transaction([
      // A. Mettre à jour le paiement
      prisma.payment.update({
        where: { id: paymentRef },
        data: { status: 'success' },
      }),
      // B. Mettre à jour la commande associée
      ...(orderId ? [
        prisma.order.update({
          where: { id: orderId },
          data: { 
            deliveryFeePaid: true,
            status: 'PAID',
            monetbilTxId: transactionId 
          },
        })
      ] : [])
    ]);

    console.log(`[verify] ✅ Livraison validée pour ref: ${paymentRef}`);
    return NextResponse.json({ confirmed: true, status: 'success' });

  } catch (err: any) {
    console.error('[Verify Error]:', err);
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 });
  }
}