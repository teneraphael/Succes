"use client";

import { Channel, ChannelHeader, MessageInput, MessageList, Window } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  selectedUserId: string;
  channel: any;
  postId?: string | null;
}

export default function ChatChannel({ open, openSidebar, selectedUserId, channel, postId }: ChatChannelProps) {
  const router = useRouter();

  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      {/* Affichage de la preview du post en haut */}
      {postId && (
        <div
          className="p-3 border-b bg-muted cursor-pointer hover:bg-muted/80"
          onClick={() => router.push(`/posts/${postId}`)}
        >
          Voir le post auquel on répond
        </div>
      )}

      <Channel channel={channel}>
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList />
          <MessageInput />
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
