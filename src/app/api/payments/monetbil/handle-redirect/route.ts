import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Détection dynamique du domaine racine (ex: https://tonsite.com)
    // On utilise x-forwarded-host pour éviter de tomber sur localhost
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Récupération des paramètres
    const status = searchParams.get('status') || searchParams.get('payment_status') || '';
    const ref = searchParams.get('ref') || searchParams.get('payment_ref') || searchParams.get('transaction_id');

    console.log(`[Redirect Debug] Status: ${status}, Ref: ${ref}, BaseUrl: ${baseUrl}`);

    // Liste des valeurs considérées comme "succès"
    const successValues = ['success', 'successful', '1', 'completed', 'paid'];
    const isSuccess = successValues.includes(status?.toLowerCase() || '');

    if (isSuccess && ref) {
      // Construction de l'URL de redirection vers le checkout
      const redirectUrl = new URL(`${baseUrl}/checkout`);
      redirectUrl.searchParams.set('ref', ref);
      
      return NextResponse.redirect(redirectUrl);
    } 
    
    // Si échec ou référence manquante, retour à la page de paiement
    console.warn('[Redirect] Paiement échoué ou référence manquante');
    return NextResponse.redirect(new URL(`${baseUrl}/pre-payment`));
    
  } catch (error) {
    console.error('[Redirect Error]:', error);
    // En cas d'erreur critique, on renvoie vers la page de paiement par sécurité
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    return NextResponse.redirect(new URL(`${protocol}://${host}/pre-payment`));
  }
}