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
    // 1. Sécurité : si pas d'user, on ne fait rien
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    // Éviter les reconnexions inutiles si le client est déjà ok
    if (client.userID === user.id && chatClient) return;

    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: user.avatarUrl,
        },
        async () =>
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .then(async () => {
        setChatClient(client);
        console.log("🚀 Stream connecté, activation des notifications...");
        await handlePermission(user.id, client);
      })
      .catch((error) => console.error("Failed to connect user", error));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .then(() => console.log("Connection closed"))
        .catch((error) => console.error("Failed to disconnect user", error));
    };
    
    // 2. Correction ici : On utilise user?.id pour éviter le crash
    // Et on simplifie : si l'ID change, tout le reste suivra
  }, [user?.id, user?.username, user?.displayName, user?.avatarUrl]);

  return chatClient;
}