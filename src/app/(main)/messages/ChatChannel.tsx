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

  const customSubmitHandler = async (message: any) => {
    try {
      const attachments = [];
      if (postToReply) {
        attachments.push({
          type: "image",
          title: `Post de ${postToReply.user?.displayName || "l'utilisateur"}`,
          title_link: `/posts/${postToReply.id}`,
          image_url: postToReply.attachments?.[0]?.url || null,
          text: postToReply.content,
        });
      }

      await channel.sendMessage({
        text: message.text, 
        attachments: attachments,
      });

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
            
            {/* APERÇU AVANT ENVOI (Corrigé pour Mobile) */}
            {postToReply && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-slate-900 border-t border-b border-blue-100 shrink-0">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
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
                  {/* Zone de texte protégée contre le débordement */}
                  <div className="flex flex-col overflow-hidden text-sm min-w-0">
                    <span className="font-bold text-blue-600 text-xs uppercase truncate">
                      Réponse au post de {postToReply.user?.displayName}
                    </span>
                    <p className="italic line-clamp-2 leading-tight text-muted-foreground break-words">
                      &quot;{postToReply.content}&quot;
                    </p>
                  </div>
                </div>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="shrink-0 ml-2"
                  onClick={() => { setPostToReply(null); clearPostFromUrl(); }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

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
    <div className="flex items-center justify-between border-b p-2 bg-card shrink-0">
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