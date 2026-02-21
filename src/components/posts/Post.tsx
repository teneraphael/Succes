"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { 
  MessageSquare, ShieldCheck, Music, ShoppingBag,
  ChevronRight, ChevronLeft
} from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { productName, price, cleanDescription } = extractInfo(post.content);
  const charLimit = 150; 
  const isLongText = cleanDescription.length > charLimit;

  // LOGIQUE AUDIO MISE À JOUR : On cherche d'abord le champ direct, puis l'attachment
  const audioMedia = post.attachments.find(m => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter(m => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;
  const finalAudioTitle = post.audioTitle || "Son original";

  const handleChatClick = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/posts/${post.id}`);
      return;
    }
    window.location.href = `/messages?userId=${post.user.id}&postId=${post.id}`;
  };

  return (
    <article className="group/post w-full space-y-3 bg-card py-4 md:p-5 rounded-none md:rounded-2xl border-y md:border border-border shadow-none md:shadow-sm">
      
      {/* HEADER */}
      <div className="flex justify-between gap-3 px-4 md:px-0">
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

      {/* PRODUIT INFOS */}
      <div className="space-y-2 px-4 md:px-1">
        {productName && (
          <h3 className="font-black text-xl uppercase tracking-tighter leading-none flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" /> {productName}
          </h3>
        )}
        {price && <div className="text-[#6ab344] font-mono font-black text-2xl">{price} FCFA</div>}
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

      {/* MEDIA PREVIEW - LE DISQUE TIKTOK S'AFFICHE ICI SI finalAudioUrl EXISTE */}
      <div className="relative overflow-hidden bg-zinc-900 w-full md:rounded-2xl min-h-[400px]">
        <MediaPreviews 
          attachments={visualAttachments} 
          userAvatar={post.user.avatarUrl}
          audioUrl={finalAudioUrl}
          audioTitle={finalAudioTitle}
        />
      </div>

      {/* CONTACT */}
      <div className="px-4 md:px-0">
        <button onClick={handleChatClick} className={cn("w-full py-3.5 rounded-2xl font-black uppercase text-xs shadow-md transition-all active:scale-[0.98]", user ? "bg-[#6ab344] text-white" : "bg-muted text-muted-foreground")}>
          {user ? "Contacter le vendeur" : "Connectez-vous pour acheter"}
        </button>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between px-4 md:px-1 pt-1">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some(l => l.userId === user?.id) }} />
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger className="flex items-center gap-1.5 hover:opacity-70"><MessageSquare className="size-5 text-muted-foreground" /><span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span></SheetTrigger>
                <SheetContent side="right" className="p-0 sm:max-w-[450px]"><Comments post={post} /></SheetContent>
              </Sheet>
            ) : (
              <Drawer>
                <DrawerTrigger className="flex items-center gap-1.5"><MessageSquare className="size-5 text-muted-foreground" /><span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span></DrawerTrigger>
                <DrawerContent className="max-h-[85vh]"><Comments post={post} /></DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
        <BookmarkButton postId={post.id} initialState={{ isBookmarkedByUser: post.bookmarks.some(b => b.userId === user?.id) }} />
      </div>
    </article>
  );
}

function MediaPreviews({ attachments, userAvatar, audioUrl, audioTitle }: any) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = attachments[selectedIndex];
  const isVideo = currentMedia?.type === "VIDEO";

  const playAudio = useCallback(async () => {
    if (!audioRef.current || isVideo || !audioUrl) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
    }
  }, [isVideo, audioUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playAudio();
        } else if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.2 } 
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playAudio]);

  useEffect(() => {
    if (isVideo && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (!isVideo && audioUrl) {
      playAudio();
    }
  }, [selectedIndex, isVideo, audioUrl, playAudio]);

  const goNext = () => setSelectedIndex((p) => Math.min(p + 1, attachments.length - 1));
  const goPrev = () => setSelectedIndex((p) => Math.max(p - 1, 0));

  const handlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div 
      ref={(el) => { containerRef.current = el; handlers.ref(el); }}
      className="relative group/media cursor-pointer select-none overflow-hidden"
      onClick={() => {
        if (isVideo) return;
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            playAudio();
        }
      }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop className="hidden" preload="metadata" />}

      {/* NUMÉROTATION */}
      {attachments.length > 1 && (
        <div className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold border border-white/10">
          {selectedIndex + 1}/{attachments.length}
        </div>
      )}

      {/* NAVIGATION PC */}
      {attachments.length > 1 && (
        <div className="absolute inset-y-0 inset-x-0 pointer-events-none z-40 hidden md:block">
           {selectedIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-auto">
              <ChevronLeft size={24} />
            </button>
          )}
          {selectedIndex < attachments.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-auto">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}

      {/* DISQUE TIKTOK STYLE */}
      {audioUrl && (
        <div className="absolute bottom-12 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">
          {isPlaying && (
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 animate-in slide-in-from-right-full">
              <div className="flex items-center gap-2">
                <Music className="size-3 text-primary animate-pulse" />
                <p className="text-[10px] text-white font-bold truncate max-w-[120px] uppercase tracking-tighter">{audioTitle}</p>
              </div>
            </div>
          )}
          <div className={cn(
            "size-12 rounded-full border-[3px] border-zinc-800 overflow-hidden shadow-2xl transition-all duration-700",
            isPlaying ? "animate-spin-slow scale-110 border-primary" : "opacity-50 scale-90"
          )}>
            <UserAvatar avatarUrl={userAvatar} size={48} />
          </div>
        </div>
      )}

      {/* CAROUSEL */}
      <div 
        className="flex transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
      >
        {attachments.map((m: any, i: number) => (
          <div key={m.id || i} className="w-full flex-shrink-0 bg-zinc-900 overflow-hidden">
            <div className="relative w-full aspect-[4/5] flex items-center justify-center">
              {m.type === "IMAGE" ? (
                <Image 
                  src={m.url} 
                  alt="Product" 
                  width={800} 
                  height={1000} 
                  unoptimized
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full"> 
                  <VideoPost src={m.url} setIsGlobalPlaying={setIsPlaying} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* POINTS DE PROGRESSION */}
      {attachments.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 px-2 py-1.5 rounded-full bg-black/20 backdrop-blur-[2px]">
          {attachments.map((_: any, i: number) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === selectedIndex ? "w-4 bg-primary" : "w-1.5 bg-white/50")} />
          ))}
        </div>
      )}
    </div>
  );
}