"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  
  // Ref pour suivre si le composant est toujours monté
  const isMounted = useRef(true);
  const connectionPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    isMounted.current = true;
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    const connect = async () => {
      // 1. Si déjà connecté au bon utilisateur, on ne fait rien
      if (client.userID === user.id && chatClient) {
        return;
      }

      // 2. Empêcher les appels multiples simultanés
      if (connectionPromise.current) {
        await connectionPromise.current;
        if (isMounted.current) setChatClient(client);
        return;
      }

      connectionPromise.current = (async () => {
        try {
          // Récupération du token
          const response = await fetch("/api/get-token");
          if (!response.ok) throw new Error("Impossible de récupérer le token");
          const { token } = await response.json();

          // Déconnexion si un utilisateur différent est resté en mémoire
          if (client.userID && client.userID !== user.id) {
            await client.disconnectUser();
          }

          // Connexion
          if (isMounted.current && !client.userID) {
            await client.connectUser(
              {
                id: user.id,
                username: user.username,
                name: user.displayName,
                image: user.avatarUrl,
              },
              token
            );
          }
        } catch (error) {
          console.error("❌ Stream Connection Error:", error);
          throw error;
        }
      })();

      try {
        await connectionPromise.current;
        if (isMounted.current) {
          setChatClient(client);
        }
      } catch (err) {
        connectionPromise.current = null;
      }
    };

    connect();

    return () => {
      // ✅ ON MARQUE COMME DÉMONTÉ IMMÉDIATEMENT
      isMounted.current = false;
      setChatClient(null);
      connectionPromise.current = null;

      // ✅ DÉCONNEXION SÉCURISÉE
      // On utilise une petite vérification pour ne pas déconnecter si un nouveau 
      // montage est déjà en train d'utiliser le client.
      const cleanup = async () => {
        if (client.userID) {
          await client.disconnectUser();
          console.log("Stream: Déconnecté proprement");
        }
      };
      cleanup();
    };

  }, [user?.id, user?.username]); 

  return chatClient;
}