"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { 
  MessageSquare, ShieldCheck, ShoppingBag, 
  CreditCard 
} from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "@/context/cart-context";
import { motion } from "framer-motion"; 
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SellerBadge from "../SellerBadge";

interface PostProps { post: PostData; }

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const colorsMatch = content.match(/🎨\s*COULEURS\s*:\s*(.*)/i);
  const descMatch = content.match(/📝\s*DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n🎵|$)/i);
  
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  const charLimit = 150; 
  const isLongText = cleanDescription.length > charLimit;

  const audioMedia = post.attachments.find(m => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter(m => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;
  const finalAudioTitle = post.audioTitle || "Son original";

  const handleAddToCart = (redirect = false) => {
    const numericPrice = price ? parseInt(price.replace(/\D/g, '')) : 0;
    const firstImage = visualAttachments.find(m => m.type === "IMAGE")?.url || visualAttachments[0]?.url || "";

    const product = {
      id: post.id,
      name: productName || "Article DealCity",
      price: numericPrice,
      image: firstImage,
      quantity: 1,
      color: selectedColor,
    };

    if (redirect) {
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
      toast({ description: `🛒 ${product.name} ajouté !`, duration: 2000 });
    }
  };

  return (
    <article className="group/post w-full space-y-3 bg-card py-4 md:py-6 rounded-none border-b border-border shadow-none">
      {/* HEADER */}
      <div className="flex justify-between gap-3 px-4">
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
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-tight">{formatRelativeDate(new Date(post.createdAt))}</p>
          </div>
        </div>
        <PostMoreButton post={post} />
      </div>

      {/* INFOS PRODUIT */}
      <div className="space-y-2 px-4">
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

      {/* GRILLE DE MÉDIAS */}
      <div className="w-full overflow-hidden">
        <MediaPreviews 
          attachments={visualAttachments} 
          userAvatar={post.user.avatarUrl}
          audioUrl={finalAudioUrl}
          audioTitle={finalAudioTitle}
          availableColors={availableColors}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          postId={post.id}
        />
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="px-4 space-y-2 mt-4">
        <div className="flex gap-2">
          <button onClick={() => handleAddToCart(false)} className="flex-1 py-4 rounded-2xl font-bold uppercase text-[10px] bg-secondary text-secondary-foreground border border-border transition-all active:scale-[0.95] flex items-center justify-center gap-2">
            <ShoppingBag className="size-4" /> Panier
          </button>
          <button onClick={() => handleAddToCart(true)} className="flex-[2.5] py-4 rounded-2xl font-black uppercase text-xs shadow-lg transition-all active:scale-[0.95] bg-black text-white flex items-center justify-center gap-2 hover:bg-zinc-800">
            <CreditCard className="size-4 text-orange-500" /> Achat Sécurisé
          </button>
        </div>
      </div>

      {/* ACTIONS SOCIALES */}
      <div className="flex items-center justify-between px-4 pt-1 border-t border-border/50 mt-2">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some(l => l.userId === loggedInUser?.id) }} />
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none group/btn">
                    <MessageSquare className="size-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    <span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 sm:max-w-[450px]"><Comments post={post} /></SheetContent>
              </Sheet>
            ) : (
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <span className="text-sm font-bold text-muted-foreground">{post._count.comments}</span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]"><Comments post={post} /></DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
        <BookmarkButton postId={post.id} initialState={{ isBookmarkedByUser: post.bookmarks.some(b => b.userId === loggedInUser?.id) }} />
      </div>
    </article>
  );
}

function MediaPreviews({ attachments, audioUrl, availableColors, selectedColor, setSelectedColor, postId }: any) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const count = attachments.length;
  const displayedMedia = attachments.slice(0, 4);

  if (count === 0) return null;

  return (
    <div className="w-full space-y-3">
      <div ref={containerRef} className="relative w-full bg-zinc-900 group/media overflow-hidden">
        {audioUrl && <audio ref={audioRef} src={audioUrl} loop className="hidden" />}

        {/* GRILLE CLIQUABLE */}
        <div 
          onClick={() => router.push(`/posts/${postId}/photos`, { scroll: false })}
          className={cn(
            "grid gap-1 w-full cursor-pointer hover:opacity-95 transition-opacity",
            count === 1 ? "grid-cols-1" : "grid-cols-2",
            count >= 3 ? "aspect-square" : "aspect-video"
          )}
        >
          {displayedMedia.map((m: any, i: number) => (
            <motion.div 
              key={m.id || i} 
              layoutId={`post-image-${m.id}`} 
              className={cn(
                "relative overflow-hidden bg-zinc-800",
                count === 3 && i === 0 ? "row-span-2" : "",
                count === 1 ? "h-[500px]" : "h-full"
              )}
            >
              {m.type === "IMAGE" ? (
                <Image 
                  src={m.url} 
                  alt="DealCity Product" 
                  fill 
                  // 🔥 FIX : Optimisation de la taille demandée au CDN selon le nombre de colonnes dans la grille
                  sizes={
                    count === 1 
                      ? "(max-width: 768px) 100vw, 600px" 
                      : "(max-width: 768px) 50vw, 300px"
                  }
                  className="object-cover" 
                  priority={i === 0} // Optionnel : Donne la priorité au premier média pour le LCP
                />
              ) : (
                <VideoPost src={m.url} />
              )}

              {count > 4 && i === 3 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="text-white text-3xl font-black">+{count - 3}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* SÉLECTEUR DE COULEURS */}
      {availableColors.length > 0 && (
        <div className="px-4">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest">
            Couleurs disponibles :
          </p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color: string) => (
              <button
                key={color}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all border",
                  selectedColor === color 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                    : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}