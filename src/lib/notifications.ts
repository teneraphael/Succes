// src/lib/notifications.ts

/**
 * Envoie un SMS à un numéro camerounais ou international
 * @param phoneNumber - Le numéro du destinataire (ex: 690123456)
 * @param message - Le texte du SMS
 */
export async function sendSMS(phoneNumber: string, message: string) {
  try {
    // 1. Nettoyage du numéro : on enlève les espaces et tirets
    let cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/-/g, '');

    // 2. Formatage pour le Cameroun (+237)
    // Si le numéro ne commence pas par '+', on l'ajoute
    if (!cleanNumber.startsWith('+')) {
      if (cleanNumber.startsWith('237')) {
        cleanNumber = `+${cleanNumber}`;
      } else {
        // Ajoute +237 par défaut pour les numéros locaux à 9 chiffres
        cleanNumber = `+237${cleanNumber}`;
      }
    }

    console.log(`📡 Tentative d'envoi SMS vers ${cleanNumber}...`);

    /**
     * NOTE POUR LE DÉVELOPPEMENT :
     * Pour l'instant, on fait juste un console.log pour ne pas bloquer tes tests.
     * Dès que tu auras choisi un fournisseur (Twilio, Termii, etc.), 
     * on remplacera ce bloc par un appel fetch vers leur API.
     */
    
    console.log("-----------------------------------------");
    console.log(`📱 DESTINATAIRE : ${cleanNumber}`);
    console.log(`💬 MESSAGE : ${message}`);
    console.log("-----------------------------------------");

    // Simulation de réussite (en attendant l'API réelle)
    return true; 

  } catch (error) {
    console.error("❌ Erreur dans le service SMS:", error);
    return false;
  }
}