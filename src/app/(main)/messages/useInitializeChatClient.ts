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
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

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
        // 1. Marquer le client comme prêt pour l'UI
        setChatClient(client);
        console.log("🚀 Stream connecté, activation des notifications...");

        // 2. Lancer la demande de notification en passant le client connecté
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
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}