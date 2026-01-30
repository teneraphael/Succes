"use client";

import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";
import { handlePermission } from "@/lib/fcm"; 

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    let isMounted = true; // Pour éviter les fuites de mémoire

    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    // Éviter les reconnexions inutiles
    if (client.userID === user.id && chatClient) return;

    const connect = async () => {
      try {
        // 1. Récupération du token via l'API
        const { token } = await kyInstance.get("/api/get-token").json<{ token: string }>();

        if (!isMounted) return;

        // 2. Connexion à Stream
        await client.connectUser(
          {
            id: user.id,
            username: user.username,
            name: user.displayName,
            image: user.avatarUrl,
          },
          token
        );

        if (!isMounted) return;

        setChatClient(client);
        console.log("🚀 Stream connecté avec succès !");

        // 3. Activation des notifications SEULEMENT après la connexion réussie
        // On attend un tout petit peu que le socket soit bien stable
        setTimeout(async () => {
          if (isMounted) {
            console.log("🔔 Enregistrement du device pour les notifications...");
            await handlePermission(user.id, client);
          }
        }, 500);

      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du chat:", error);
      }
    };

    connect();

    return () => {
      isMounted = false;
      setChatClient(null);
      client.disconnectUser()
        .then(() => console.log("👋 Connexion Stream fermée"))
        .catch((error) => console.error("Failed to disconnect", error));
    };
    
    // On ne surveille que l'ID de l'user pour la stabilité
  }, [user?.id]); 

  return chatClient;
}