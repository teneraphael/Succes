"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { 
  MessageSquare, ShieldCheck, Music, ShoppingBag,
  ChevronRight, ChevronLeft, Truck, Loader2, CreditCard 
} from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/cart-context";
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
  const colorsMatch = content.match(/🎨 COULEURS : (.*)/);
  const descMatch = content.match(/📝 DESCRIPTION :\n([\s\S]*?)(?=\n\n🎵|$)/);
  
  return {
    productName: productMatch ? productMatch[1] : null,
    price: priceMatch ? priceMatch[1] : null,
    availableColors: colorsMatch ? colorsMatch[1].split(',').map(c => c.trim()).filter(c => c !== "") : [],
    cleanDescription: descMatch ? descMatch[1].trim() : content,
  };
};

export default function Post({ post }: PostProps) {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { productName, price, cleanDescription, availableColors } = extractInfo(post.content);
  const charLimit = 150; 
  const isLongText = cleanDescription.length > charLimit;

  const audioMedia = post.attachments.find(m => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter(m => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;
  const finalAudioTitle = post.audioTitle || "Son original";

  // --- LOGIQUE D'ACHAT CORRIGÉE POUR MONETBIL ---
  const handleAddToCart = (redirect = false) => {
    // Nettoyage du prix pour n'avoir que des chiffres
    const numericPrice = price ? parseInt(price.replace(/\D/g, '')) : 0;
    const firstImage = visualAttachments.find(m => m.type === "IMAGE")?.url || visualAttachments[0]?.url || "";

    const product = {
      id: post.id,
      name: productName || "Article DealCity",
      price: numericPrice,
      image: firstImage,
      quantity: 1,
      color: availableColors.length > 0 ? availableColors[0] : null,
    };

    if (redirect) {
      // Préparation des paramètres pour la page Checkout (Monetbil)
      const params = new URLSearchParams({
        directId: post.id,
        name: product.name,
        price: product.price.toString(),
        image: product.image,
        qty: "1",
        color: product.color || ""
      });
      router.push(`/checkout?${params.toString()}`);
    } else {
      addToCart({ ...product, availableColors });
      toast({ 
        description: `🛒 ${product.name} ajouté au panier !`,
        duration: 2000 
      });
    }
  };

  return (
    <article className="group/post w-full space-y-3 bg-card py-4 md:p-5 rounded-none md:rounded-2xl border-y md:border border-border shadow-none md:shadow-sm">
      
      {/* HEADER : Infos Vendeur */}
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

      {/* INFOS PRODUIT */}
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

      {/* MÉDIA : Photos / Vidéos / Audio */}
      <div className="relative overflow-hidden bg-zinc-900 w-full md:rounded-2xl min-h-[400px]">
        <MediaPreviews 
          attachments={visualAttachments} 
          userAvatar={post.user.avatarUrl}
          audioUrl={finalAudioUrl}
          audioTitle={finalAudioTitle}
        />
      </div>

      {/* BOUTONS D'ACTION (Paiement Sécurisé mis en avant) */}
      <div className="px-4 md:px-0 space-y-2">
        <div className="flex gap-2">
          <button 
            onClick={() => handleAddToCart(false)}
            className="flex-1 py-4 rounded-2xl font-bold uppercase text-[10px] bg-secondary text-secondary-foreground border border-border transition-all active:scale-[0.95] flex items-center justify-center gap-2"
          >
            <ShoppingBag className="size-4" /> Panier
          </button>

          <button 
            onClick={() => handleAddToCart(true)}
            className="flex-[2.5] py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all active:scale-[0.95] bg-black text-white flex items-center justify-center gap-2 hover:bg-zinc-800"
          >
            <CreditCard className="size-4 text-orange-500" /> Achat Sécurisé
          </button>
        </div>

        {loggedInUser?.hasDeliveryPass && (
          <button 
            onClick={() => router.push(`/delivery-request?postId=${post.id}`)}
            className="w-full py-3 rounded-2xl border-2 border-[#4a90e2] text-[#4a90e2] font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
          >
            <Truck className="size-4" /> Livraison gratuite activée
          </button>
        )}
      </div>

      {/* ACTIONS SOCIALES */}
      <div className="flex items-center justify-between px-4 md:px-1 pt-1 border-t border-border/50 mt-2">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some(l => l.userId === loggedInUser?.id) }} />
          
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 outline-none group/btn">
                    <MessageSquare className="size-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    <span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 sm:max-w-[450px]">
                  <Comments post={post} />
                </SheetContent>
              </Sheet>
            ) : (
              <Drawer>
                <DrawerTrigger asChild>
                  <button type="button" className="flex items-center gap-1.5 outline-none">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <Comments post={post} />
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
        <BookmarkButton postId={post.id} initialState={{ isBookmarkedByUser: post.bookmarks.some(b => b.userId === loggedInUser?.id) }} />
      </div>
    </article>
  );
}

// --- SOUS-COMPOSANT MÉDIA ---
function MediaPreviews({ attachments, userAvatar, audioUrl, audioTitle }: any) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) playAudio();
        else stopAudio();
      },
      { threshold: 0.2 } 
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playAudio, stopAudio]);

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
      className="relative group/media cursor-pointer select-none overflow-hidden h-full flex items-center justify-center"
      onClick={() => {
        if (isVideo) return;
        isPlaying ? stopAudio() : playAudio();
      }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} loop className="hidden" />}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
      )}

      {/* ROUELLE MUSICALE (VINYLE) */}
      {audioUrl && !isVideo && (
        <div className="absolute bottom-6 left-4 z-50 flex items-center gap-3 bg-black/40 backdrop-blur-md p-2 pr-4 rounded-full border border-white/10 pointer-events-none transition-transform group-hover/media:scale-105">
          <div className={cn(
            "relative size-10 rounded-full border-2 border-white/20 overflow-hidden shadow-2xl",
            isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
          )}>
            <Image 
              src={userAvatar || "/avatar-placeholder.png"} 
              fill 
              alt="Music" 
              className="object-cover" 
            />
          </div>
          <div className="flex flex-col overflow-hidden max-w-[130px]">
            <span className="text-white text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
              <Music className={cn("size-2", isPlaying && "animate-pulse")} /> 
              {isPlaying ? "En lecture" : "Pause"}
            </span>
            <span className="text-white/90 text-[11px] font-bold truncate leading-none">
              {audioTitle}
            </span>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      {attachments.length > 1 && (
        <>
          <div className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold border border-white/10">
            {selectedIndex + 1}/{attachments.length}
          </div>
          <div className="absolute inset-0 z-40 pointer-events-none hidden md:block">
            {selectedIndex > 0 && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); goPrev(); }} 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-auto hover:bg-black/80"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            {selectedIndex < attachments.length - 1 && (
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); goNext(); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover/media:opacity-100 transition-opacity pointer-events-auto hover:bg-black/80"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>
        </>
      )}

      {/* CONTENEUR DES MÉDIAS */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-out" 
        style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
      >
        {attachments.map((m: any, i: number) => (
          <div key={m.id || i} className="w-full flex-shrink-0 bg-zinc-900 h-full relative aspect-[4/5]">
            {m.type === "IMAGE" ? (
              <Image 
                src={m.url} 
                alt="Product" 
                fill
                unoptimized
                className="object-cover" 
                onLoadingComplete={() => setIsLoading(false)}
              />
            ) : (
              <VideoPost src={m.url} setIsGlobalPlaying={setIsPlaying} />
            )}
          </div>
        ))}
      </div>

      {/* DOTS DE PROGRESSION */}
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