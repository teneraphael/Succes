import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // 1. Récupération de la référence passée dans l'URL (?ref=DELIV-...)
  const ref = req.nextUrl.searchParams.get('ref');

  if (!ref) {
    return NextResponse.json({ error: 'Référence manquante' }, { status: 400 });
  }

  try {
    // 2. Recherche du paiement directement dans la table 'payment'
    const payment = await prisma.payment.findUnique({
      where: { id: ref },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        confirmed: false, 
        status: 'not_found', 
        message: 'Paiement introuvable' 
      });
    }

    // 3. Retourner l'état actuel du paiement
    if (payment.status === 'success') {
      return NextResponse.json({
        confirmed: true,
        status: 'success',
        message: 'Paiement confirmé avec succès'
      });
    }

    if (payment.status === 'failed') {
      return NextResponse.json({
        confirmed: false,
        status: 'failed',
        message: 'Le paiement a échoué'
      });
    }

    // Si le statut est 'pending'
    return NextResponse.json({
      confirmed: false,
      status: 'pending',
      message: 'En attente de confirmation'
    });

  } catch (error) {
    console.error('[Check Payment Error]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}