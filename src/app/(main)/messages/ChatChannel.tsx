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
        await channel.watch();

        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) throw new Error("Impossible de récupérer le post");

        const post = await res.json();
        if (!post || !post.content) return;

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

        await channel.sendMessage({ text: content });
        setPostSent(true);
      } catch (err) {
        console.error("Erreur lors de l'envoi du post:", err);
      }
    };

    sendPostMessage();
  }, [postId, channel, postSent]);

  return (
    // AJOUT : h-full, flex et flex-col pour occuper toute la hauteur
    <div className={cn("w-full h-full flex flex-col md:block", !open && "hidden")}>
      <Channel channel={channel}>
        {/* AJOUT : Une div wrapper avec h-full pour forcer Window à s'étirer */}
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