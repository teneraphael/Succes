"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Utilise ton utilitaire standard
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

  // Invalider le cache des messages non lus quand on change de canal
  useEffect(() => {
    if (activeChannel?.id) {
      queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
    }
  }, [activeChannel?.id, queryClient]);

  // Rendu personnalisé pour chaque aperçu de conversation dans la liste
  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <div className="px-2 py-1">
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            // 1. Activer le canal dans Stream
            props.setActiveChannel?.(props.channel, props.watchers);
            
            // 2. Fermer la sidebar (surtout important sur mobile)
            onClose();
            
            // 3. Notifier le parent du changement d'utilisateur
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
        "h-full flex-col border-e border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-md transition-all duration-300 md:flex md:w-80 lg:w-96",
        open ? "flex absolute inset-0 z-50 w-full bg-background/95 md:relative" : "hidden",
      )}
    >
      <MenuHeader onClose={onClose} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ChannelList
          filters={{ type: "messaging", members: { $in: [user.id] } }}
          showChannelSearch
          options={{ state: true, presence: true, limit: 10 }}
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

// --- Sous-composant pour l'en-tête ---
function MenuHeader({ onClose }: { onClose: () => void }) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 pb-4 border-b border-border/20">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          MESSAGES
        </h1>
      </div>
      
      <Button
        size="icon"
        variant="secondary"
        className="rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95"
        title="Nouvelle discussion"
        onClick={() => setShowNewChatDialog(true)}
      >
        <MailPlus className="size-5 text-primary" />
      </Button>

      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose(); // Ferme la sidebar sur mobile après création
          }}
        />
      )}
    </div>
  );
}