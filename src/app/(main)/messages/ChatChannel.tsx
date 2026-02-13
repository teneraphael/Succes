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
import { Menu, ArrowLeft, X, Reply } from "lucide-react";
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

  useEffect(() => {
    if (open && channel) {
      channel.markRead();
    }
  }, [channel, open]);

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
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (postToReply) {
        setPostToReply(null);
        clearPostFromUrl();
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
    }
  };

  if (!channel) return null;

  return (
    <div className={cn("w-full h-full flex flex-col min-h-0 bg-background/50 backdrop-blur-sm", !open && "hidden")}>
      <Channel 
        channel={channel} 
        key={channel.cid}
        markReadOnMount={true}
      > 
        <div className="flex flex-col h-full overflow-hidden">
          <Window key={`window-${channel.id}`}>
            <CustomChannelHeader openSidebar={openSidebar} />
            
            {/* Liste des messages avec un peu plus d'espace */}
            <div className="flex-1 overflow-hidden">
              <MessageList />
            </div>
            
            {/* Zone de prévisualisation de réponse (Style Premium) */}
            {postToReply && (
              <div className="mx-4 mb-2 animate-in slide-in-from-bottom-2 duration-300">
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-3 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-1 rounded-full bg-primary/40" />
                    
                    {postToReply.attachments?.[0]?.url && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-sm border border-background">
                        <Image 
                          src={postToReply.attachments[0].url} 
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-1 flex-col overflow-hidden text-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <Reply className="size-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Réponse à {postToReply.user?.displayName}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/80 italic">
                        &quot;{postToReply.content}&quot;
                      </p>
                    </div>

                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="size-7 rounded-full hover:bg-primary/10"
                      onClick={() => { setPostToReply(null); clearPostFromUrl(); }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input de message plus aéré */}
            <div className="px-4 pb-4">
              <MessageInput 
                focus 
                overrideSubmitHandler={postToReply ? (customSubmitHandler as any) : undefined} 
              />
            </div>
          </Window>
        </div>
      </Channel>
    </div>
  );
}

function CustomChannelHeader({ openSidebar }: { openSidebar: () => void }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between border-b border-border/40 p-3 bg-background/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-3">
        <Button 
          size="icon" 
          variant="ghost" 
          className="rounded-full hover:bg-primary/5 transition-colors"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex flex-col">
          <ChannelHeader />
        </div>
      </div>
      
      <div className="md:hidden">
        <Button 
          size="icon" 
          variant="secondary" 
          className="rounded-full shadow-sm"
          onClick={openSidebar}
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </div>
  );
}