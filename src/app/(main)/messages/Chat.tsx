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

  // 🔗 Récupération du postId depuis l'URL (?postId=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get("postId");

    if (postId) {
      setPostPreview({ postId });
    }
  }, []);

  // ✅ Création / récupération du channel (SANS doublons)
  useEffect(() => {
    if (!selectedUserId || !chatClient) return;

    const initChannel = async () => {
      const currentUserId = chatClient.userID!;
      
      // ❗ Protection anti chat avec soi-même
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
    return <Loader2 className="mx-auto my-3 animate-spin" />;
  }

  return (
    <main className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="absolute bottom-0 top-0 flex w-full">
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
            <ChatChannel
              open={!sidebarOpen}
              openSidebar={() => setSidebarOpen(true)}
              selectedUserId={selectedUserId!}
              channel={channel}
              postId={postPreview?.postId}
            />
          )}
        </StreamChat>
      </div>
    </main>
  );
}
