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

  const [sidebarOpen, setSidebarOpen] = useState(false);
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

    if (postId) {
      setPostPreview({ postId });
    }
  }, []);

  useEffect(() => {
    if (!selectedUserId || !chatClient) return;

    const initChannel = async () => {
      const currentUserId = chatClient.userID!;
      
      if (currentUserId === selectedUserId) {
        console.warn("Chat avec soi-même interdit");
        return;
      }

      const members = Array.from(
        new Set([currentUserId, selectedUserId])
      );

      const ch = chatClient.channel("messaging", {
        members,
      });

      await ch.watch();
      setChannel(ch);
    };

    initChannel();
  }, [selectedUserId, chatClient]);

  if (!chatClient || (selectedUserId && !channel)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    // h-full et suppression de rounded-2xl/shadow-sm pour le plein écran
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
              setSelectedUserId(userId);
              setSidebarOpen(false);
            }}
          />

          {channel && (
            // flex-1 et h-full forcent la partie droite à descendre
            <div className="flex-1 h-full flex flex-col min-h-0">
              <ChatChannel
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
                selectedUserId={selectedUserId!}
                channel={channel}
                postId={postPreview?.postId}
              />
            </div>
          )}
        </StreamChat>
      </div>
    </main>
  );
}