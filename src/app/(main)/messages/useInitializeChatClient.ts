import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  
  useEffect(() => {
    if (!user) return; // Vérification si l'utilisateur est défini

    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);
    
    const imageUrl = user.avatarUrl || 'default-image-url.jpg'; // Remplacez par une URL par défaut

    client
      .connectUser(
        {
          id: user.id,
          username: user.username,
          name: user.displayName,
          image: imageUrl,
        },
        async () => 
          kyInstance
            .get("/api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token),
      )
      .catch((error) => console.error("Failed to connect user", error))
      .then(() => setChatClient(client));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [user]);

  return chatClient;
}