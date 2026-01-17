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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importation du router
import Link from "next/link";
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
    const params = new URLSearchParams(window.location.search);
    const urlPostId = initialPostId || params.get("postId");

    if (urlPostId) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/posts/${urlPostId}`);
          if (res.ok) {
            const data = await res.json();
            setPostToReply(data);
          }
        } catch (err) {
          console.error("Erreur API:", err);
        }
      };
      fetchPost();
    }
  }, [initialPostId, channel]);

  const customSubmitHandler = async (message: any) => {
    let attachments = [];
    
    if (postToReply) {
      attachments.push({
        type: "post-reply",
        post_id: postToReply.id,
        text: postToReply.content || "Voir le post",
        title_link: `/posts/${postToReply.id}`,
        image_url: postToReply.attachments?.[0]?.url || null, 
      });
    }

    await channel.sendMessage({
      text: message.text,
      attachments: attachments,
    });

    setPostToReply(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className={cn("w-full h-full flex flex-col min-h-0", !open && "hidden")}>
      <Channel channel={channel}>
        <div className="flex flex-col h-full overflow-hidden">
          <Window>
            <CustomChannelHeader openSidebar={openSidebar} />
            <MessageList />
            
            {postToReply && (
              <div className="reply-preview-container flex items-center justify-between group">
                <Link 
                  href={`/posts/${postToReply.id}`}
                  className="flex items-center gap-3 overflow-hidden flex-1 hover:opacity-80 transition-opacity"
                >
                  {postToReply.attachments?.[0]?.url && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-black/5">
                      <Image 
                        src={postToReply.attachments[0].url} 
                        alt="Miniature post"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-primary tracking-tighter">
                      Réponse au post de {postToReply.user?.displayName}
                    </span>
                    <p className="text-xs text-muted-foreground italic truncate max-w-[180px]">
                      {postToReply.content || "Image / Vidéo"}
                    </p>
                  </div>
                </Link>

                <Button 
                  type="button"
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 shrink-0 hover:bg-background/50 rounded-full ml-2" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPostToReply(null);
                  }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}

            <MessageInput focus overrideSubmitHandler={customSubmitHandler as any} />
          </Window>
        </div>
      </Channel>
    </div>
  );
}

function CustomChannelHeader({ openSidebar }: { openSidebar: () => void }) {
  const router = useRouter(); // Initialisation du router pour le retour

  return (
    <div className="flex items-center justify-between border-b p-2 bg-card">
      <div className="flex items-center gap-2">
        {/* Remplacement du Link par router.push pour forcer le retour */}
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => router.push("/")}
        >
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