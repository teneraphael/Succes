"use client";

import { useChatContext } from "stream-chat-react";
import { useEffect, useState } from "react";
import { Channel, ChannelHeader, MessageList, MessageInput, Window } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  selectedUserId: string;
}

export default function ChatChannel({ open, openSidebar, selectedUserId }: ChatChannelProps) {
  const { client, setActiveChannel } = useChatContext();
  const [channel, setChannel] = useState<any>(null);
  const currentUserId = client.user?.id;

  useEffect(() => {
    async function initChannel() {
      if (!client || !selectedUserId) return;

      const newChannel = client.channel("messaging", {
        members: [currentUserId, selectedUserId],
      });

      await newChannel.watch();

      setChannel(newChannel);
      setActiveChannel(newChannel);
    }

    initChannel();
  }, [client, selectedUserId]);

  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      {channel && (
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader openSidebar={openSidebar} />
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      )}
    </div>
  );
}

function CustomChannelHeader({ openSidebar }: { openSidebar: () => void }) {
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
