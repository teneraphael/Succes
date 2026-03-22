import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, phoneNumber, orderId, name } = await req.json();

    // 1. Vérification des variables d'environnement
    if (!process.env.MONETBIL_SERVICE_KEY) {
      return NextResponse.json({ error: "Configuration serveur manquante (Service Key)" }, { status: 500 });
    }

    // 2. Construction de la requête pour Monetbil
    // On utilise URLSearchParams car Monetbil attend du x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("service", process.env.MONETBIL_SERVICE_KEY);
    params.append("amount", amount.toString());
    params.append("phonenumber", phoneNumber);
    params.append("item_ref", orderId);
    params.append("currency", "XAF"); // Obligatoire pour le FCFA
    params.append("country", "CM");   // Cameroun par défaut
    
    // notify_url est crucial : c'est lui qui appelle ton Webhook pour valider la commande
    params.append("notify_url", `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/monetbil`);
    
    // Optionnel : Message qui apparaîtra sur le téléphone du client
    params.append("payment_phrase", `Paiement DealCity - Commande #${orderId.substring(0, 5)}`);

    const response = await fetch("https://api.monetbil.com/payment/v1/placePayment", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: params.toString(),
    });

    const data = await response.json();

    // 3. Gestion des erreurs spécifiques de Monetbil
    // Code 402 = Solde insuffisant (très fréquent)
    if (data.code === 402 || data.status === "REQUEST_FAILED") {
      return NextResponse.json({ 
        error: "Solde insuffisant sur votre compte Mobile Money ou erreur opérateur.", 
        details: data.message 
      }, { status: 402 });
    }

    // Si Monetbil rejette parce que le service n'est pas approuvé
    if (data.code === 401 || data.code === 403) {
      return NextResponse.json({ 
        error: "Le service de paiement est en cours d'activation. Réessayez plus tard.", 
        details: data.message 
      }, { status: 403 });
    }

    // 4. Succès : On renvoie la réponse (qui contient soit payment_url, soit le message de succès push)
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("ERREUR_API_MONETBIL_DIRECT:", error);
    return NextResponse.json({ 
      error: "Impossible de joindre le service de paiement Orange/MTN.",
      details: error.message 
    }, { status: 500 });
  }
}