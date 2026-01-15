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
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

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
        // Attendre que le channel soit prêt
        await channel.watch();

        // Récupérer le post
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Impossible de récupérer le post");

        const post = await res.json();
        if (!post || !post.content) return;

        // Créer le contenu du message
        const content = `
**Post de ${post.user.displayName || "Utilisateur"}**:

${post.content}

${
  post.attachments && post.attachments.length > 0
    ? post.attachments.map((m: any) => `![Image](${m.url})`).join("\n")
    : ""
}

[Voir le post ici](/posts/${postId})
`;

        // Envoyer le message normalement
        await channel.sendMessage({ text: content });

        setPostSent(true);
      } catch (err) {
        console.error("Erreur lors de l'envoi du post:", err);
      }
    };

    sendPostMessage();
  }, [postId, channel, postSent]);

  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel channel={channel}>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput focus />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({ openSidebar }: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader />
    </div>
  );
}
