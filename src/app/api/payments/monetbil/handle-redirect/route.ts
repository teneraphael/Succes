import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // On élargit la recherche pour trouver la référence et le statut
    // Monetbil utilise souvent 'ref', 'payment_ref' ou 'transaction_id'
    const status = searchParams.get('status') || searchParams.get('payment_status') || searchParams.get('amount_status');
    const ref = searchParams.get('ref') || searchParams.get('payment_ref') || searchParams.get('transaction_id');

    console.log(`[Redirect Debug] Status: ${status}, Ref: ${ref}`);

    // Liste des valeurs considérées comme "succès"
    const successValues = ['success', 'successful', '1', 'completed'];
    const isSuccess = successValues.includes(status?.toLowerCase() || '');

    if (isSuccess && ref) {
      // Redirection vers le Checkout avec le bon paramètre 'ref'
      const redirectUrl = new URL(`/checkout`, req.nextUrl.origin);
      redirectUrl.searchParams.set('ref', ref);
      
      return NextResponse.redirect(redirectUrl);
    } 
    
    // Si échec ou référence manquante, retour à la case départ
    console.warn('[Redirect] Paiement échoué ou référence manquante');
    return NextResponse.redirect(new URL(`/pre-payment`, req.nextUrl.origin));
    
  } catch (error) {
    console.error('[Redirect Error]:', error);
    return NextResponse.redirect(new URL(`/pre-payment`, req.nextUrl.origin));
  }
}