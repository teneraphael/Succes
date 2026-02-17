"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageSquare, ChevronLeft, ChevronRight, Lock, Sparkles, ShieldCheck } from "lucide-react"; // Ajout de Sparkles et ShieldCheck
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState } from "react";
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

// Imports UI Shadcn
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SellerBadge from "../SellerBadge";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const charLimit = 250;
  const isLongText = post.content.length > charLimit;

  // Gestion du clic sur "Discuter"
  const handleChatClick = () => {
    if (!user) {
      router.push(`/login?callbackUrl=/posts/${post.id}`);
      return;
    }
    window.location.href = `/messages?userId=${post.user.id}&postId=${post.id}`;
  };

  const CommentTrigger = (
    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
      <MessageSquare className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}
      </span>
    </button>
  );

  return (
    <article className="group/post w-full space-y-3 bg-card p-4 md:p-5 shadow-none md:shadow-sm rounded-none md:rounded-2xl border-x-0 md:border border-y md:border-y-0 border-border transition-colors hover:bg-card/80">
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <div className="flex items-center gap-1.5">
              <UserTooltip user={post.user}>
                <Link
                  href={`/users/${post.user.username}`}
                  className="block font-medium hover:underline"
                >
                  {post.user.displayName}
                </Link>
              </UserTooltip>

              {/* SECTION BADGES : Vendeur + Pionnier */}
              <div className="flex items-center gap-1">
                <SellerBadge 
                  isSeller={post.user.isSeller} 
                  followerCount={post.user._count.followers} 
                />
                
                {/* NOUVEAU : Badge Pionnier dynamique */}
                {post.user.isPioneer && (
                  <div className="flex items-center gap-0.5 bg-amber-400/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-400/20 shadow-sm animate-in fade-in zoom-in duration-500">
                    <Sparkles className="size-2.5 fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Pionnier</span>
                  </div>
                )}

                {/* NOUVEAU : Check de vérification (Vérifié) */}
                {post.user.isVerified && (
                  <ShieldCheck className="size-4 text-[#4a90e2] fill-current dark:text-[#4a90e2]" />
                )}
              </div>
            </div>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>

        <PostMoreButton
          post={post}
          className="opacity-100 md:opacity-0 transition-opacity group-hover/post:opacity-100"
        />
      </div>

      <div className="relative">
        <Linkify>
          <div className="whitespace-pre-line break-words px-1 md:px-0 text-[15px]">
            {isExpanded ? post.content : post.content.substring(0, charLimit)}
            {isLongText && !isExpanded && "..."}
          </div>
        </Linkify>
        
        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-primary font-semibold hover:underline text-sm"
          >
            {isExpanded ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>

      {/* MODIFICATION : On passe le statut pionnier aux médias pour l'affichage du badge sur l'image */}
      {!!post.attachments.length && (
        <MediaPreviews attachments={post.attachments} isPioneer={post.user.isPioneer} />
      )}

      {/* BOUTON DISCUTER SÉCURISÉ */}
      <div className="flex justify-center mt-2 px-1 md:px-0">
        <button 
          onClick={handleChatClick}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shadow-sm",
            user 
              ? "bg-[#6ab344] text-white hover:bg-[#5a9c39] shadow-[#6ab344]/20" 
              : "bg-muted text-muted-foreground border border-border hover:bg-muted/80"
          )}
        >
          {!user && <Lock className="size-4" />}
          {user ? "Discuter" : "Connectez-vous pour discuter"}
        </button>
      </div>

      <hr className="text-muted-foreground/10 mx-1 md:mx-0" />
      
      <div className="flex justify-between gap-5 px-1 md:px-0">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user?.id),
            }}
          />

          {isDesktop ? (
            <Sheet>
              <SheetTrigger asChild>
                {CommentTrigger}
              </SheetTrigger>
              <SheetContent side="right" className="p-0 sm:max-w-[450px] flex flex-col gap-0 bg-background shadow-xl">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-center text-sm font-bold">Commentaires</SheetTitle>
                </SheetHeader>
                <Comments post={post} />
              </SheetContent>
            </Sheet>
          ) : (
            <Drawer>
              <DrawerTrigger asChild>
                {CommentTrigger}
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="sr-only">
                  <DrawerTitle>Commentaires</DrawerTitle>
                </DrawerHeader>
                <Comments post={post} />
              </DrawerContent>
            </Drawer>
          )}
        </div>

        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user?.id
            ),
          }}
        />
      </div>
    </article>
  );
}

// --- MEDIA PREVIEWS (MIS À JOUR) ---

interface MediaPreviewsProps {
  attachments: Media[];
  isPioneer?: boolean; // Ajout de la prop
}

function MediaPreviews({ attachments, isPioneer }: MediaPreviewsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const totalMedia = attachments.length;

  const handlers = useSwipeable({
    onSwipedLeft: () => setSelectedIndex((prev) => Math.min(prev + 1, totalMedia - 1)),
    onSwipedRight: () => setSelectedIndex((prev) => Math.max(prev - 1, 0)),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const nextMedia = () => setSelectedIndex((prev) => Math.min(prev + 1, totalMedia - 1));
  const prevMedia = () => setSelectedIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div className="relative -mx-4 md:mx-0 overflow-hidden bg-black group/media rounded-none md:rounded-xl shadow-inner" {...handlers}>
      
      {/* NOUVEAU : Overlay Pionnier sur l'image pour plus de style */}
      {isPioneer && (
        <div className="absolute left-4 bottom-14 z-20 flex items-center gap-1 bg-amber-400/90 text-black px-2 py-1 rounded-lg text-[9px] font-black uppercase italic backdrop-blur-sm">
          <Sparkles className="size-3" />
          Offre Certifiée
        </div>
      )}

      {totalMedia > 1 && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
          {selectedIndex + 1} / {totalMedia}
        </div>
      )}

      {/* ... reste du code MediaPreviews identique ... */}
      {/* (Garde tes boutons ChevronLeft/Right et le mapping des images tel quel) */}
      <div 
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" 
        style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
      >
        {attachments.map((media) => (
          <div key={media.id} className="w-full flex-shrink-0 flex items-center justify-center bg-black min-h-[300px] max-h-[550px]">
            {media.type === "IMAGE" ? (
              <Image
                src={media.url}
                alt="Produit"
                width={800}
                height={800}
                className="w-full h-auto max-h-[550px] object-contain"
                unoptimized
              />
            ) : (
              <VideoPost src={media.url} className="w-full max-h-[550px]" />
            )}
          </div>
        ))}
      </div>

      {totalMedia > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 px-2 py-1.5">
          {attachments.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === selectedIndex ? "bg-white w-5 shadow-sm" : "bg-white/40 w-1.5"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}