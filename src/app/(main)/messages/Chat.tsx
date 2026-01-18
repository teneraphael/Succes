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

  const [sidebarOpen, setSidebarOpen] = useState(!initialSelectedUserId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialSelectedUserId
  );
  const [channel, setChannel] = useState<any>(null);
  const [postPreview, setPostPreview] = useState<{ postId: string } | null>(
    null
  );

  // 1. Synchroniser selectedUserId si la prop initiale change (ex: navigation via URL)
  useEffect(() => {
    if (initialSelectedUserId) {
      setSelectedUserId(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  // 2. Gestion du postId dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");
    if (postId) {
      setPostPreview({ postId });
    } else {
      setPostPreview(null);
    }
  }, [selectedUserId]); // Se relance quand on change d'utilisateur

  // 3. Initialisation du canal
  useEffect(() => {
    if (!selectedUserId || !chatClient) {
      setChannel(null);
      return;
    }

    const initChannel = async () => {
      try {
        const currentUserId = chatClient.userID!;
        if (currentUserId === selectedUserId) return;

        const members = [currentUserId, selectedUserId];
        const ch = chatClient.channel("messaging", { members });
        
        // IMPORTANT: On attend que le canal soit prêt et on le surveille
        await ch.watch(); 
        setChannel(ch);
        setSidebarOpen(false);
      } catch (err) {
        console.error("Erreur initialisation canal:", err);
      }
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
          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelectUser={(userId: string) => {
              // Si on clique sur le même utilisateur, on ferme juste la sidebar
              if (userId === selectedUserId) {
                setSidebarOpen(false);
              } else {
                setChannel(null); // Force le rechargement du nouveau canal
                setSelectedUserId(userId);
              }
            }}
          />

          {channel ? (
            <div className={cn("flex-1 h-full flex flex-col min-h-0", sidebarOpen && "hidden md:flex")}>
              {/* Ajout d'une key unique basée sur le canal pour forcer React à rafraîchir le composant */}
              <ChatChannel
                key={channel.cid} 
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
                selectedUserId={selectedUserId!}
                channel={channel}
                postId={postPreview?.postId}
              />
            </div>
          ) : (
            <div className={cn("flex-1 flex items-center justify-center text-muted-foreground", sidebarOpen && "hidden md:flex")}>
              <p>Sélectionnez une discussion pour commencer</p>
            </div>
          )}
        </StreamChat>
      </div>
    </main>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}