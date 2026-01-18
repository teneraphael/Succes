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
import { Menu, ArrowLeft, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  channel,
  postId: initialPostId,
}: ChatChannelProps) {
  const [postToReply, setPostToReply] = useState<any>(null);

  const clearPostFromUrl = useCallback(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("postId")) {
      url.searchParams.delete("postId");
      window.history.replaceState({}, '', url.pathname);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPostId = initialPostId || params.get("postId");

    if (urlPostId) {
      fetch(`/api/posts/${urlPostId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data) setPostToReply(data); });
    }
  }, [initialPostId, channel?.id]);

  // LE HANDLER QUI VA FIXER TON AFFICHAGE
  const customSubmitHandler = async (message: any) => {
    try {
      // 1. On prépare l'attachment (l'aperçu visuel)
      const attachments = [];
      if (postToReply) {
        attachments.push({
          type: "image", // Type "image" pour un rendu propre
          title: `Post de ${postToReply.user?.displayName || "l'utilisateur"}`,
          title_link: `/posts/${postToReply.id}`,
          image_url: postToReply.attachments?.[0]?.url || null,
          text: postToReply.content, // Texte interne au post ("Lookk")
        });
      }

      // 2. ENVOI : message.text contient "regarde ça" (ta flèche jaune)
      await channel.sendMessage({
        text: message.text, 
        attachments: attachments,
      });

      // 3. ON NETTOIE SEULEMENT APRÈS L'ENVOI RÉUSSI
      setPostToReply(null);
      clearPostFromUrl();

    } catch (err) {
      console.error("Erreur d'envoi:", err);
    }
  };

  if (!channel) return null;

  return (
    <div className={cn("w-full h-full flex flex-col min-h-0", !open && "hidden")}>
      <Channel channel={channel} key={channel.cid}> 
        <div className="flex flex-col h-full overflow-hidden">
          <Window key={`window-${channel.id}`}>
            <CustomChannelHeader openSidebar={openSidebar} />
            <MessageList />
            
            {/* APERÇU AVANT ENVOI (Ton bandeau bleu actuel) */}
            {postToReply && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-900 border-t border-b border-blue-100">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  {postToReply.attachments?.[0]?.url && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border bg-white">
                      <Image 
                        src={postToReply.attachments[0].url} 
                        alt="Aperçu"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden text-sm">
                    <span className="font-bold text-blue-600">RÉPONSE AU POST DE {postToReply.user?.displayName?.toUpperCase()}</span>
                    <p className="truncate italic">&quot;{postToReply.content}&quot;</p>
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={() => { setPostToReply(null); clearPostFromUrl(); }}>
                  <X className="size-4" />
                </Button>
              </div>
            )}

            {/* Utilisation du handler personnalisé quand un post est présent */}
            <MessageInput 
              focus 
              overrideSubmitHandler={postToReply ? (customSubmitHandler as any) : undefined} 
            />
          </Window>
        </div>
      </Channel>
    </div>
  );
}

function CustomChannelHeader({ openSidebar }: { openSidebar: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between border-b p-2 bg-card">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => router.push("/")}>
          <ArrowLeft className="size-5" />
        </Button>
        <ChannelHeader />
      </div>
      <div className="md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
    </div>
  );
}