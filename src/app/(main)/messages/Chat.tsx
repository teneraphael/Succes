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

  useEffect(() => {
    if (initialSelectedUserId) {
      setSelectedUserId(initialSelectedUserId);
    }
  }, [initialSelectedUserId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");
    if (postId) {
      setPostPreview({ postId });
    } else {
      setPostPreview(null);
    }
  }, [selectedUserId]);

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
        
        await ch.watch(); 
        
        setChannel(ch);
        setSidebarOpen(false); 
      } catch (err) {
        console.error("❌ Erreur initialisation canal:", err);
      }
    };

    initChannel();
  }, [selectedUserId, chatClient]);

  if (!chatClient) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      {/* ✅ AJOUT DE flex-row ET items-stretch POUR GARDER CÔTE À CÔTE */}
      <div className="flex h-full w-full flex-row items-stretch overflow-hidden">
        <StreamChat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          {/* SIDEBAR : On s'assure qu'elle garde sa largeur et ne s'écrase pas */}
          <div className={cn("h-full shrink-0", !sidebarOpen && "hidden md:block")}>
            <ChatSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onSelectUser={(userId: string) => {
                setSelectedUserId(userId);
                if (userId === selectedUserId) {
                  setSidebarOpen(false);
                } else {
                  setChannel(null);
                }
              }}
            />
          </div>

          {/* CHANNEL : flex-1 permet de prendre tout le reste de la largeur */}
          <div className={cn(
            "flex-1 h-full flex flex-col min-w-0 overflow-hidden", 
            sidebarOpen && "hidden md:flex"
          )}>
            {channel ? (
              <ChatChannel
                key={channel.cid} 
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
                selectedUserId={selectedUserId!}
                channel={channel}
                postId={postPreview?.postId}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground p-4 text-center">
                <div className="p-8 border-2 border-dashed rounded-full mb-4 opacity-20">
                   {/* Icône vide */}
                </div>
                <p className="text-lg font-medium">Sélectionnez une discussion</p>
                <p className="text-sm">Choisissez un contact pour commencer à parler.</p>
              </div>
            )}
          </div>
        </StreamChat>
      </div>
    </main>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}