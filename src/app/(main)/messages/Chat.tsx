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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialSelectedUserId);
  const [channel, setChannel] = useState<any>(null);
  const [postPreview, setPostPreview] = useState<{ postId: string } | null>(null);

  useEffect(() => {
    // Récupérer les détails du post à partir des paramètres d'URL
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('postId');

    if (postId) {
      setPostPreview({ postId });
    }
  }, []);

  // Crée ou récupère le channel
  useEffect(() => {
    if (!selectedUserId || !chatClient) return;

    const initChannel = async () => {
      const ch = chatClient.channel("messaging", {
        members: [chatClient.userID!, selectedUserId],
      });
      await ch.watch(); // permet de récupérer les messages
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
          theme={resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}
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
              postId={postPreview?.postId} // Passage uniquement de postId
            />
          )}
        </StreamChat>
      </div>
    </main>
  );
}