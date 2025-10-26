'use client';

import { NotificationSubscribeButton } from './NotificationSubscribeButton'; // Assurez-vous que le chemin est correct

export function SettingsClient() {
    // Vous pouvez ajouter ici d'autres logiques client, comme la déconnexion, etc.
    
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Paramètres Utilisateur</h1>
            <p>Gérez vos préférences de notification.</p>
            
            <div style={{ marginTop: '20px' }}>
                <NotificationSubscribeButton />
            </div>

            {/* Affichez un message pour vérifier que l'utilisateur est bien connecté */}
            {/* Si vous avez un contexte d'utilisateur, affichez son nom ici */}
        </div>
    );
}
