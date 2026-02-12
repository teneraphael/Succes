"use client";

import { useState } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatSidebar from "./ChatSidebar";
import ChatChannel from "./ChatChannel";
import useInitializeChat from "./useInitializeChatClient"; // Ton hook perso j'imagine
import { Loader2 } from "lucide-react";

interface ChatProps {
  initialSelectedUserId: string | null;
}

export default function Chat({ initialSelectedUserId }: ChatProps) {
  const chatClient = useInitializeChat();
  
  // 1. État pour gérer l'ouverture sur Mobile
  // On commence vrai (sidebar affiché) sauf si on a déjà un ID d'utilisateur
  const [sidebarOpen, setSidebarOpen] = useState(!initialSelectedUserId);
  
  // 2. État pour suivre l'ID de l'utilisateur sélectionné
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialSelectedUserId);

  if (!chatClient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <StreamChat client={chatClient}>
      <div className="relative flex h-screen w-full overflow-hidden bg-card">
        {/* SIDEBAR */}
        <ChatSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectUser={(userId) => {
            setSelectedUserId(userId);
            setSidebarOpen(false); // Ferme le sidebar sur mobile au clic
          }}
        />

        {/* FENÊTRE DE DISCUSSION */}
        <ChatChannel
          open={!sidebarOpen} // Affiche le chat quand le sidebar est fermé
          openSidebar={() => setSidebarOpen(true)}
          selectedUserId={selectedUserId || ""} channel={undefined}          // Le canal actif est géré par le ChatContext de Stream
        />
      </div>
    </StreamChat>
  );
}