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
  const { user } = useSession(); // 'user' peut être null selon tes types
  const queryClient = useQueryClient();
  const { channel: activeChannel } = useChatContext();

  // Invalider le cache des messages non lus
  useEffect(() => {
    if (activeChannel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [activeChannel?.id, queryClient]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ChannelPreviewMessenger
        {...props}
        onSelect={() => {
          // 1. Activer le canal
          if (props.setActiveChannel) {
            props.setActiveChannel(props.channel, props.watchers);
          }

          // 2. Fermer le sidebar
          onClose();

          // 3. Logique de sélection d'utilisateur (avec sécurité null)
          if (onSelectUser && user) {
            const members = Object.values(props.channel.state.members);
            const otherMember = members.find((m: any) => m.user?.id !== user.id);
            const otherUserId = otherMember?.user?.id;

            if (otherUserId) {
              onSelectUser(otherUserId);
            }
          }
        }}
      />
    ),
    [onClose, onSelectUser, user], // On dépend de 'user' tout entier ici
  );

  // SI PAS D'UTILISATEUR, ON N'AFFICHE RIEN (C'est ici qu'on règle l'erreur TypeScript)
  if (!user) return null;

  return (
    <div
      className={cn(
        "size-full flex-col border-e md:flex md:w-72 bg-card",
        open ? "flex" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      
      <ChannelList
        filters={{ 
          type: "messaging", 
          members: { $in: [user.id] } // Ici TypeScript sait que user n'est pas null
        }}
        showChannelSearch
        options={{ state: true, presence: true, limit: 10 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchQueryParams: { 
            channelFilters: { 
              filters: { members: { $in: [user.id] } } 
            } 
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

/**
 * COMPOSANT HEADER DU MENU
 */
interface MenuHeaderProps {
  onClose: () => void;
}

function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Nouvelle discussion"
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