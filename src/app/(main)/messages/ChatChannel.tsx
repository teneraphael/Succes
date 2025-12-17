"use client";

import { Channel, ChannelHeader, MessageInput, MessageList, Window } from "stream-chat-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
  selectedUserId: string;
  channel: any; // Remplacez "any" par le type approprié si possible
  postId?: string | null;
}

export default function ChatChannel({ open, openSidebar, selectedUserId, channel, postId }: ChatChannelProps) {
  const router = useRouter();
  const [previewMessageSent, setPreviewMessageSent] = useState(false);

  // Fonction pour envoyer un message basé sur un post
  const sendPostMessage = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error(`Erreur d'API : ${response.status}`);
      }
      
      const post = await response.json();

      // Vérifiez si le post est correctement structuré
      if (!post || !post.user || !post.content) {
        throw new Error("Le post est mal formaté");
      }

      // Formatez le contenu du message
      const content = `
        **Post de ${post.user.displayName || 'Utilisateur Inconnu'}** :
        
        ${post.content || 'Contenu indisponible'}
        
        ${post.attachments && post.attachments.length > 0 ? post.attachments.map((media: any) => `![Image](${media.url})`).join('\n') : 'Aucune image attachée'}
        
        [Voir le post ici](/posts/${postId})
      `;

      const message = {
        text: content,
        user: { id: selectedUserId },
      };

      await channel.sendMessage(message);
      console.log("Post envoyé !");
    } catch (error) {
      console.error("Erreur lors de l'envoi du post:", error);
    }
  }, [selectedUserId, channel]);

  // Effect pour envoyer le message au chargement
  useEffect(() => {
    if (postId && !previewMessageSent) {
      sendPostMessage(postId);
      setPreviewMessageSent(true);
    }
  }, [postId, previewMessageSent, sendPostMessage]);

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

// En-tête personnalisé pour le canal
function CustomChannelHeader({ openSidebar }: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Bouton pour ouvrir la barre latérale sur mobile */}
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader />
    </div>
  );
}