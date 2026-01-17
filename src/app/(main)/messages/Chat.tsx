"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";

interface ChatProps {
  initialSelectedUserId: string | null;
}

export default function Chat({ initialSelectedUserId }: ChatProps) {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  // On initialise la sidebar ouverte si on n'a pas d'utilisateur sélectionné (cas de l'icône message)
  const [sidebarOpen, setSidebarOpen] = useState(!initialSelectedUserId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialSelectedUserId
  );
  const [channel, setChannel] = useState<any>(null);
  const [postPreview, setPostPreview] = useState<{ postId: string } | null>(
    null
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");
    if (postId) setPostPreview({ postId });
  }, []);

  useEffect(() => {
    if (!selectedUserId || !chatClient) {
      setChannel(null); // Reset si aucun utilisateur
      return;
    }

    const initChannel = async () => {
      const currentUserId = chatClient.userID!;
      if (currentUserId === selectedUserId) return;

      const members = Array.from(new Set([currentUserId, selectedUserId]));
      const ch = chatClient.channel("messaging", { members });
      await ch.watch();
      setChannel(ch);
      // Sur mobile, quand on a un canal, on ferme la sidebar
      setSidebarOpen(false);
    };
    initChannel();
  }, [selectedUserId, chatClient]);

  if (!chatClient) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex h-full w-full overflow-hidden bg-background">
      <div className="flex h-full w-full overflow-hidden">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          {/* Sidebar : affichée si sidebarOpen est vrai */}
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectUser={(userId: string) => {
              setSelectedUserId(userId);
              setSidebarOpen(false);
            }}
          />

          {/* Zone de Chat : affichée si on a un canal ET que la sidebar est fermée sur mobile */}
          {channel ? (
            <div className={cn("flex-1 h-full flex flex-col min-h-0", sidebarOpen && "hidden md:flex")}>
              <ChatChannel
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
                selectedUserId={selectedUserId!}
                channel={channel}
                postId={postPreview?.postId}
              />
            </div>
          ) : (
            // Écran d'attente quand aucun message n'est sélectionné (évite l'écran vide)
            <div className={cn("flex-1 flex items-center justify-center text-muted-foreground", sidebarOpen && "hidden md:flex")}>
              <p>Sélectionnez une discussion pour commencer</p>
            </div>
          )}
        </StreamChat>
      </div>
    </main>
  );
}

// Petit utilitaire pour les classes si tu ne l'as pas importé
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}