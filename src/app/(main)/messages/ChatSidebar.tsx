"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
  onSelectUser?: (userId: string) => void;
}

export default function ChatSidebar({ open, onClose, onSelectUser }: ChatSidebarProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { channel: activeChannel } = useChatContext();

  useEffect(() => {
    if (activeChannel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [activeChannel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <div className="px-2 py-1">
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            props.setActiveChannel?.(props.channel, props.watchers);
            onClose();
            if (onSelectUser) {
              const members = Object.values(props.channel.state.members);
              const otherMember = members.find((m) => m.user?.id !== user.id);
              const otherUserId = otherMember?.user?.id;
              if (otherUserId) onSelectUser(otherUserId);
            }
          }}
        />
      </div>
    ),
    [onClose, onSelectUser, user.id],
  );

  return (
    <div
      className={cn(
        "size-full flex-col border-e border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md md:flex md:w-80",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChannelList
          filters={{ type: "messaging", members: { $in: [user.id] } }}
          showChannelSearch
          options={{ state: true, presence: true, limit: 8 }}
          sort={{ last_message_at: -1 }}
          additionalChannelSearchProps={{
            searchForChannels: true,
            searchQueryParams: { 
              channelFilters: { filters: { members: { $in: [user.id] } } } 
            },
          }}
          Preview={ChannelPreviewCustom}
        />
      </div>
    </div>
  );
}

// --- MenuHeader ---
function MenuHeader({ onClose }: { onClose: () => void }) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 pb-2">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Messages
        </h1>
      </div>
      
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-sm hover:scale-105 transition-transform"
        title="Démarrer une discussion"
        onClick={() => setShowNewChatDialog(true)}
      >
        <MailPlus className="size-5 text-primary" />
      </Button>

      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}