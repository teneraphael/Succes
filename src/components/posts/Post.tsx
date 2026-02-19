"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { 
  MessageSquare, ShieldCheck, Music, ShoppingBag
} from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { useSwipeable } from 'react-swipeable';
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SellerBadge from "../SellerBadge";

interface PostProps { post: PostData; }

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️ PRODUIT : (.*)/);
  const priceMatch = content.match(/💰 PRIX : (.*?) FCFA/);
  const descMatch = content.match(/📝 DESCRIPTION :\n([\s\S]*?)(?=\n\n🎵|$)/);
  return {
    productName: productMatch ? productMatch[1] : null,
    price: priceMatch ? priceMatch[1] : null,
    cleanDescription: descMatch ? descMatch[1].trim() : content,
  };
};

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { productName, price, cleanDescription } = extractInfo(post.content);
  const charLimit = 150; 
  const isLongText = cleanDescription.length > charLimit;

  const audioMedia = post.attachments.find(m => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter(m => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;

  const handleChatClick = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/posts/${post.id}`);
      return;
    }
    window.location.href = `/messages?userId=${post.user.id}&postId=${post.id}`;
  };

  return (
    <article className="group/post w-full space-y-3 bg-card p-4 md:p-5 shadow-none md:shadow-sm rounded-none md:rounded-2xl border-x-0 md:border border-y md:border-y-0 border-border transition-colors">
      
      {/* HEADER */}
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}><UserAvatar avatarUrl={post.user.avatarUrl} /></Link>
          </UserTooltip>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/users/${post.user.username}`} className="font-medium hover:underline">{post.user.displayName}</Link>
              <SellerBadge isSeller={post.user.isSeller} followerCount={post.user._count.followers} />
              {post.user.isVerified && <ShieldCheck className="size-4 text-[#4a90e2] fill-current" />}
            </div>
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">{formatRelativeDate(post.createdAt)}</p>
          </div>
        </div>
        <PostMoreButton post={post} />
      </div>

      {/* INFOS PRODUIT & DESCRIPTION */}
      <div className="space-y-2 px-1">
        {productName && (
          <h3 className="font-black text-xl uppercase tracking-tighter leading-none flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" /> {productName}
          </h3>
        )}
        {price && (
          <div className="text-[#6ab344] font-mono font-black text-2xl">
            {price} FCFA
          </div>
        )}
        <div className="relative">
          <Linkify>
            <div className={cn("text-[14px] leading-relaxed text-foreground/90", !isExpanded && "line-clamp-3")}>
              {cleanDescription}
            </div>
          </Linkify>
          {isLongText && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="mt-1 text-primary font-bold text-xs uppercase">
              {isExpanded ? "Réduire" : "Lire la suite"}
            </button>
          )}
        </div>
      </div>

      {/* ZONE MÉDIA */}
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <MediaPreviews 
          attachments={visualAttachments} 
          isGlobalPlaying={isGlobalPlaying}
          setIsGlobalPlaying={setIsGlobalPlaying}
          userAvatar={post.user.avatarUrl}
          audioUrl={finalAudioUrl}
          audioTitle={post.audioTitle || "Son original"}
        />
      </div>

      {/* BOUTON CONTACT */}
      <button 
        onClick={handleChatClick} 
        className={cn(
          "w-full py-3.5 rounded-2xl font-black uppercase text-xs shadow-md transition-all active:scale-[0.98]", 
          user ? "bg-[#6ab344] text-white" : "bg-muted text-muted-foreground"
        )}
      >
        {user ? "Contacter le vendeur" : "Connectez-vous pour acheter"}
      </button>

      {/* ACTIONS */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some(l => l.userId === user?.id) }} />
          {isDesktop ? (
            <Sheet>
              <SheetTrigger><MessageSquare className="size-5 text-muted-foreground" /></SheetTrigger>
              <SheetContent side="right" className="p-0 sm:max-w-[450px]"><Comments post={post} /></SheetContent>
            </Sheet>
          ) : (
            <Drawer>
              <DrawerTrigger><MessageSquare className="size-5 text-muted-foreground" /></DrawerTrigger>
              <DrawerContent className="max-h-[85vh]"><Comments post={post} /></DrawerContent>
            </Drawer>
          )}
        </div>
        <BookmarkButton postId={post.id} initialState={{ isBookmarkedByUser: post.bookmarks.some(b => b.userId === user?.id) }} />
      </div>
    </article>
  );
}

function MediaPreviews({ attachments, isGlobalPlaying, setIsGlobalPlaying, userAvatar, audioUrl, audioTitle }: any) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Utiliser explicitement le type MutableRefObject pour éviter le "read-only"
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = attachments[selectedIndex];
  const isVideo = currentMedia?.type === "VIDEO";

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (!isVideo && audioUrl && audioElement) {
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsGlobalPlaying(true))
          .catch(() => setIsGlobalPlaying(false));
      }
    } else if (audioElement) {
      audioElement.pause();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && audioElement) {
          audioElement.pause();
          setIsGlobalPlaying(false);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (audioElement) audioElement.pause();
      observer.disconnect();
    };
  }, [audioUrl, isVideo, selectedIndex, setIsGlobalPlaying]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setSelectedIndex(p => Math.min(p + 1, attachments.length - 1)),
    onSwipedRight: () => setSelectedIndex(p => Math.max(p - 1, 0)),
  });

  // La solution "Callback Ref" propre pour TypeScript
  const setRefs = (el: HTMLDivElement | null) => {
    // 1. Assigner à notre ref locale pour l'IntersectionObserver
    containerRef.current = el;

    // 2. Passer l'élément à useSwipeable (on appelle handlers.ref comme une fonction)
    handlers.ref(el);
  };

  const toggleAudio = (e: React.MouseEvent) => {
    if (isVideo) return;
    e.stopPropagation();
    if (!audioUrl || !audioRef.current) return;
    
    if (isGlobalPlaying) {
      audioRef.current.pause();
      setIsGlobalPlaying(false);
    } else {
      audioRef.current.play();
      setIsGlobalPlaying(true);
    }
  };

  return (
    <div 
      ref={setRefs} 
      className="relative group/media cursor-pointer" 
      onClick={toggleAudio}
    >
      {audioUrl && !isVideo && <audio ref={audioRef} src={audioUrl} loop />}

      {/* DISQUE TIKTOK */}
      {((audioUrl && !isVideo) || isVideo) && (
        <div className="absolute bottom-6 right-4 z-40 flex items-center gap-2 pointer-events-none">
          {isGlobalPlaying && (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg max-w-[150px]">
              <div className="flex items-center gap-2">
                <Music className="size-3 text-primary animate-pulse flex-shrink-0" />
                <p className="text-[10px] text-white font-bold truncate tracking-tight">
                  {isVideo ? "Son de la vidéo" : audioTitle}
                </p>
              </div>
            </div>
          )}
          <div className="relative">
            <div className={cn(
              "size-14 rounded-full bg-black border-[3px] border-zinc-700 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700",
              isGlobalPlaying ? "animate-spin-slow scale-110 border-primary" : "scale-100 opacity-70"
            )}>
              <UserAvatar avatarUrl={userAvatar} size={48} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* CAROUSEL MÉDIAS */}
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${selectedIndex * 100}%)` }}>
        {attachments.map((media: any) => (
          <div key={media.id} className="w-full flex-shrink-0 flex items-center justify-center min-h-[450px] max-h-[600px] bg-zinc-900">
            {media.type === "IMAGE" ? (
              <Image 
                src={media.url} alt="Product" width={1000} height={1000} unoptimized
                className="w-full h-auto object-contain pointer-events-none" 
              />
            ) : (
              <VideoPost 
                src={media.url} 
                setIsGlobalPlaying={setIsGlobalPlaying} 
              />
            )}
          </div>
        ))}
      </div>

      {/* INDICATEUR DE POSITION */}
      {attachments.length > 1 && (
        <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
          {selectedIndex + 1} / {attachments.length}
        </div>
      )}
    </div>
  );
}