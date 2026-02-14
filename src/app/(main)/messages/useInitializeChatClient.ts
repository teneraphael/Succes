"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  
  // ✅ On utilise une ref pour suivre l'état de connexion de manière persistante
  const connectionPromise = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    const connect = async () => {
      // 1️⃣ Si l'utilisateur est déjà connecté avec cet ID, on s'arrête
      if (client.userID === user.id) {
        setChatClient(client);
        return;
      }

      // 2️⃣ Si une tentative de connexion est DÉJÀ en cours, on attend celle-là
      // C'est ce bloc qui empêche l'erreur "Consecutive calls"
      if (connectionPromise.current) {
        await connectionPromise.current;
        setChatClient(client);
        return;
      }

      try {
        // 3️⃣ On crée la promesse de connexion
        connectionPromise.current = (async () => {
          const response = await fetch("/api/get-token");
          const { token } = await response.json();

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
        connectionPromise.current = null; // Reset en cas d'échec pour permettre de réessayer
      }
    };

    connect();

    // ⚠️ On ne déconnecte PAS dans le cleanup ici, car en Strict Mode 
    // cela déconnecterait l'utilisateur immédiatement après l'avoir connecté.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return chatClient;
}