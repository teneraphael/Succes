import { useEffect, useState } from "react";
import { Channel, ChannelHeader, MessageInput, MessageList, Window } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  channel: any; 
  selectedUserId: string;
}

export default function ChatChannel({ open, openSidebar, selectedUserId }: ChatChannelProps) {
  const [channel, setChannel] = useState<any>(null);
  const currentUserId = "User_Id"; // remplacer par ton utilisateur courant

  useEffect(() => {
    async function initChannel() {
      const newChannel = window.streamClient!.channel("messaging", {
        members: [currentUserId, selectedUserId],
      });
      await newChannel.watch();
      setChannel(newChannel);
    }
    if (selectedUserId) initChannel();
  }, [selectedUserId]);


  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
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
