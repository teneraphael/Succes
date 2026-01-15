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
  const { channel } = useChatContext();

  useEffect(() => {
    if (channel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [channel?.id, queryClient]);

const ChannelPreviewCustom = useCallback(
  (props: ChannelPreviewUIComponentProps) => (
    <ChannelPreviewMessenger
      {...props}
      onSelect={() => {
        props.setActiveChannel?.(props.channel, props.watchers);
        onClose();

        if (!onSelectUser) return;

        // members peut être un objet indexé ; on le convertit en array et on le typed comme any[]
        const members = Object.values(props.channel.state.members) as any[];

        // trouve le membre autre que l'utilisateur courant
        const otherMember = members.find((m) => {
          // m.user_id (stream v1) ou m.user?.id (stream v2)
          const id1 = m?.user_id;
          const id2 = m?.user?.id;
          return (id1 && id1 !== user.id) || (id2 && id2 !== user.id);
        });

        // normalise l'ID (priorise user_id)
        const otherUserId: string | undefined =
          (otherMember && (otherMember.user_id ?? otherMember.user?.id)) ?? undefined;

        if (otherUserId) {
          onSelectUser(otherUserId);
        }
      }}
    />
  ),
  [onClose, onSelectUser, user.id],
);


  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      <ChannelList
        filters={{ type: "messaging", members: { $in: [user.id] } }}
        showChannelSearch
        options={{ state: true, presence: true, limit: 8 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: { channelFilters: { filters: { members: { $in: [user.id] } } } },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl  font-bold md:ms-20">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlus className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
