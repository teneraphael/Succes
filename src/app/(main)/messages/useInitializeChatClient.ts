"use client";

import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useSession } from "../SessionProvider";
import { getMessaging, getToken } from "firebase/messaging";
import { app } from "@/lib/firebase"; // Assure-toi d'importer ton instance firebase config

export default function useInitializeChatClient() {
  const { user } = useSession();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
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
        setChatClient(client);

        // 🚀 LOGIQUE FCM : Enregistrement dynamique du token pour chaque utilisateur
        try {
          // On vérifie d'abord si les notifications sont supportées et si on est côté client
          if (typeof window !== "undefined" && "Notification" in window) {
            const messaging = getMessaging(app);
            
            // Demande le token FCM (cela déclenchera la demande de permission si nécessaire)
            const fcmToken = await getToken(messaging, {
              vapidKey: "BOFuO3gXPZPcvGvfbMGtxch6q9H4kmAqN2EDFzK6xMIjPoYeOd2VWe_5s1IOoRk4zrw4KeCFFyxXz0td1g9iSmY", // Ta clé VAPID publique
            });

            if (fcmToken) {
              // On enregistre ce device spécifique auprès de Stream
              // 'firebase' est l'ID du provider configuré dans ton dashboard Stream
              await client.addDevice(fcmToken, "firebase", user.id);
              console.log("FCM Token registered with Stream for user:", user.id);
            }
          }
        } catch (pushError) {
          console.error("Error setting up FCM push notifications:", pushError);
        }
      })
      .catch((error) => console.error("Failed to connect user", error));

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => console.error("Failed to disconnect user", error))
        .then(() => console.log("Connection closed"));
    };
  }, [user.id, user.username, user.displayName, user.avatarUrl]);

  return chatClient;
}