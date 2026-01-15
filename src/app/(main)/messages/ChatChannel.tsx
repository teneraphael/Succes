"use client";

import {
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Window,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  selectedUserId: string;
  channel: any;
  postId?: string | null;
}

export default function ChatChannel({
  open,
  openSidebar,
  selectedUserId,
  channel,
  postId,
}: ChatChannelProps) {
  const [postSent, setPostSent] = useState(false);

  useEffect(() => {
    if (!postId || postSent || !channel) return;

    const sendPostMessage = async () => {
      try {
        await channel.watch();
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Impossible de récupérer le post");
        const post = await res.json();
        if (!post || !post.content) return;

        const content = `
**Post de ${post.user.displayName || "Utilisateur"}**:
${post.content}
${post.attachments?.length > 0 ? post.attachments.map((m: any) => `![Image](${m.url})`).join("\n") : ""}
[Voir le post ici](/posts/${postId})`;

        await channel.sendMessage({ text: content });
        setPostSent(true);
      } catch (err) {
        console.error("Erreur lors de l'envoi du post:", err);
      }
    };
    sendPostMessage();
  }, [postId, channel, postSent]);

  return (
    <div className={cn("w-full h-full flex flex-col min-h-0", !open && "hidden")}>
      <Channel channel={channel}>
        <div className="flex flex-col h-full overflow-hidden">
          <Window>
            <CustomChannelHeader openSidebar={openSidebar} />
            <MessageList />
            <MessageInput focus />
          </Window>
        </div>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({ openSidebar }: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b p-2 bg-card">
      <div className="flex items-center gap-2">
        {/* FLÈCHE RETOUR : Toujours à gauche */}
        <Link href="/">
          <Button size="icon" variant="ghost">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <ChannelHeader />
      </div>

      {/* BOUTON MENU : À DROITE sur mobile uniquement */}
      <div className="md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
    </div>
  );
}