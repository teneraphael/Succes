"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  
  // On utilise une ref pour suivre la promesse de connexion en cours
  const connectionPromise = useRef<Promise<any> | null>(null);

  useEffect(() => {
    // Si pas d'utilisateur ou si on est côté serveur, on stoppe
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    const connect = async () => {
      // 1. Si déjà connecté avec le BON utilisateur, on met juste à jour l'état
      if (client.userID === user.id) {
        setChatClient(client);
        return;
      }

      // 2. Si une tentative est déjà en cours, on l'attend pour éviter le "Consecutive calls"
      if (connectionPromise.current) {
        try {
          await connectionPromise.current;
          setChatClient(client);
        } catch (err) {
          console.error("Erreur durant l'attente de la connexion existante", err);
        }
        return;
      }

      // 3. Nouvelle tentative de connexion
      try {
        connectionPromise.current = (async () => {
          const response = await fetch("/api/get-token");
          if (!response.ok) throw new Error("Impossible de récupérer le token");
          
          const { token } = await response.json();

          // Avant de connecter, on vérifie si un ancien utilisateur traîne
          if (client.userID && client.userID !== user.id) {
            await client.disconnectUser();
          }

          await client.connectUser(
            {
              id: user.id,
              username: user.username,
              name: user.displayName,
              image: user.avatarUrl,
            },
            token
          );
        })();

        await connectionPromise.current;
        setChatClient(client);
      } catch (error) {
        console.error("❌ Stream Connection Error:", error);
        connectionPromise.current = null; 
      }
    };

    connect();

    // LE CLEANUP : Indispensable pour éviter les erreurs "connectUser was called twice"
    return () => {
        setChatClient(null);
        connectionPromise.current = null;
        
        // On déconnecte proprement pour que le prochain useEffect reparte à zéro
        client.disconnectUser().catch(err => console.error("Erreur lors de la déconnexion", err));
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.username]); // On surveille l'ID et le username

  return chatClient;
}