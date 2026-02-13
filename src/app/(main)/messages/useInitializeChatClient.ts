"use client";

import { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const isConnecting = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    const connect = async () => {
      if (isConnecting.current) return;
      isConnecting.current = true;

      try {
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

        setChatClient(client);
      } catch (error) {
        console.error("❌ Stream Connection Error:", error);
      } finally {
        isConnecting.current = false;
      }
    };

    connect();

    return () => {
      setChatClient(null);
      client.disconnectUser();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return chatClient;
}