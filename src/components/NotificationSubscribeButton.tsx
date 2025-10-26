import { subscribeUserToNotifications } from "@/lib/fcm-subscribe"; 
import { useState } from "react";

export function NotificationSubscribeButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleClick = async () => {
        setStatus('loading');
        // Appel de la fonction qui demande la permission et enregistre le jeton
        const success = await subscribeUserToNotifications();
if (success) {
            setStatus('success');
            // Optionnel: vous pouvez afficher un toast ou une alerte plus jolie
            alert("Notifications activées !"); 
        } else {
            setStatus('error');
            alert("Échec de l'activation des notifications. (Vérifiez la console).");
        }
    };

    return (
        <button 
            onClick={handleClick}
            disabled={status === 'loading' || status === 'success'}
            style={{ padding: '10px', background: status === 'success' ? 'green' : 'blue', color: 'white' }}
        >
            {status === 'loading' ? 'Abonnement en cours...' : 
             status === 'success' ? 'Notifications Activées' : 
'Activer les Notifications Push'}
        </button>
    );
}
