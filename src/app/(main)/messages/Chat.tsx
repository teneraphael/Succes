"use client";

import { Loader2, MailPlus } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";
import { cn } from "@/lib/utils";

interface ChatProps {
  initialSelectedUserId: string | null;
}

export default function Chat({ initialSelectedUserId }: ChatProps) {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(!initialSelectedUserId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialSelectedUserId);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (initialSelectedUserId) setSelectedUserId(initialSelectedUserId);
  }, [initialSelectedUserId]);

  useEffect(() => {
    // Garde de type cruciale pour éviter l'erreur 'true'
    if (!chatClient || typeof chatClient === "boolean" || !selectedUserId) {
      setChannel(null);
      return;
    }

    const initChannel = async () => {
      try {
        const currentUserId = chatClient.userID;
        if (!currentUserId || currentUserId === selectedUserId) return;

        const ch = chatClient.channel("messaging", {
          members: [currentUserId, selectedUserId],
        });

        await ch.watch();
        setChannel(ch);
        setSidebarOpen(false);
      } catch (err) {
        console.error("❌ Erreur canal:", err);
      }
    };

    initChannel();
  }, [selectedUserId, chatClient]);

  if (!chatClient || typeof chatClient === "boolean") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="animate-spin text-primary size-10" />
        <p className="text-muted-foreground font-medium animate-pulse">Initialisation du chat...</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-background to-background dark:from-slate-900 dark:via-background dark:to-background p-2 md:p-4">
      <div className="flex h-full w-full max-w-[1600px] m-auto flex-row overflow-hidden rounded-[2rem] border border-white/20 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <StreamChat
          client={chatClient}
          theme={resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}
        >
          <div className={cn(
            "h-full shrink-0 border-r border-border/30 bg-white/20 dark:bg-black/10 backdrop-blur-md transition-all duration-300",
            !sidebarOpen && "hidden md:block md:w-80 lg:w-96"
          )}>
            <ChatSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onSelectUser={(id) => {
                setSelectedUserId(id);
                if (id === selectedUserId) setSidebarOpen(false);
                else setChannel(null);
              }}
            />
          </div>

          <div className={cn("flex-1 h-full flex flex-col min-w-0 relative", sidebarOpen && "hidden md:flex")}>
            {channel ? (
              <ChatChannel
                key={channel.cid}
                open={!sidebarOpen}
                openSidebar={() => setSidebarOpen(true)}
                selectedUserId={selectedUserId!}
                channel={channel}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-6 animate-in fade-in duration-500">
                <div className="relative mb-6">
                  <div className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl animate-pulse"></div>
                  <div className="relative bg-background/50 rounded-full p-8 border border-primary/20">
                    <MailPlus className="size-12 text-primary opacity-60" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Messages</h3>
                <p className="text-muted-foreground mt-2">Sélectionnez une discussion pour commencer.</p>
              </div>
            )}
          </div>
        </StreamChat>
      </div>
    </main>
  );
}