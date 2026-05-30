import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Construction de l'URL de base sécurisée
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Récupération des paramètres
    const status = (searchParams.get('status') || '').toLowerCase();
    const ref = searchParams.get('ref') || '';
    const p_data = searchParams.get('p_data') || '';
    
    console.log(`[Redirect Debug] Status: ${status}, Ref: ${ref}, P_Data present: ${!!p_data}`);

    // Liste des statuts de succès Monetbil (Widget V2.1)
    // Note : Monetbil renvoie généralement 'success'
    const isSuccess = status === 'success';

    // 1. SI PAIEMENT RÉUSSI
    if (isSuccess && ref) {
      const redirectUrl = new URL(`${baseUrl}/checkout`);
      
      // On passe les paramètres nécessaires
      redirectUrl.searchParams.set('ref', ref);
      
      if (p_data) {
        redirectUrl.searchParams.set('p_data', p_data);
      }
      
      console.log(`[Redirect Action] Redirection vers /checkout avec ref: ${ref}`);
      return NextResponse.redirect(redirectUrl);
    } 
    
    // 2. SI ÉCHEC OU ABSENCE DE RÉFÉRENCE
    console.warn(`[Redirect Action] Paiement échoué ou ref absente. Redirection vers /pre-payment`);
    
    // Si on a les données produit, on les renvoie vers le pré-paiement pour qu'il puisse réessayer
    const errorRedirect = new URL(`${baseUrl}/pre-payment`);
    if (p_data) errorRedirect.searchParams.set('p_data', p_data);
    
    return NextResponse.redirect(errorRedirect);
    
  } catch (error) {
    console.error('[Redirect Error]:', error);
    return NextResponse.redirect(new URL('/pre-payment', req.url));
  }
}