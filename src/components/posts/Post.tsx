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
    cleanDescription: descMatch ? descMatch[1].trim() : null,
  };
};

export default function Post({ post }: PostProps) {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { productName, price, availableColors, cleanDescription } = extractInfo(post.content);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const isAvailable = post.stock !== undefined ? post.stock > 0 : true;

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  const audioMedia = post.attachments.find(m => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter(m => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;
  const finalAudioTitle = post.audioTitle || "Son original";

const handleAddToCart = async (isPrePayment = false) => {
  if (!isAvailable) {
    toast({ variant: "destructive", description: "Article indisponible !", duration: 2000 });
    return;
  }

  // Nettoyage et formatage du prix
  const numericPrice = price ? parseInt(price.replace(/\D/g, '')) : 0;
  const firstImage = visualAttachments.find(m => m.type === "IMAGE")?.url || visualAttachments[0]?.url || "";

  const product = {
    id: post.id,
    name: productName || "Article DealCity",
    price: numericPrice,
    image: firstImage,
    quantity: 1,
    color: selectedColor ?? undefined,
  };

  if (isPrePayment) {
    // 1. Sauvegarde robuste dans la session du navigateur
    sessionStorage.setItem("current_product", JSON.stringify(product));

    // 2. Préparation des paramètres d'URL pour le suivi
    const params = new URLSearchParams({
      directId: product.id,
      productName: product.name,
      price: product.price.toString(),
      image: product.image,
      qty: "1",
      color: product.color || ""
    });
    
    // 3. Redirection vers la page de pré-paiement
    router.push(`/pre-payment?${params.toString()}`);
  } else {
    // Cas classique : ajout au panier
    addToCart({ ...product, availableColors });
    toast({ description: `🛒 ${product.name} ajouté !`, duration: 2000 });
  }
};
  return (
    <article className="group/post w-full space-y-4 bg-card py-4 md:py-5 md:rounded-3xl border-b md:border border-border/70 shadow-sm transition-all duration-200 hover:shadow-md max-w-xl mx-auto mb-5 overflow-hidden">
      
      <div className="flex justify-between items-center gap-3 px-5">
        <div className="flex flex-wrap items-center gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`} className="transition-transform active:scale-95 block">
              <UserAvatar avatarUrl={post.user.avatarUrl} className="ring-2 ring-primary/20 size-10" />
            </Link>
          </UserTooltip>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/users/${post.user.username}`} className="font-black text-sm tracking-tight text-foreground hover:text-primary transition-colors">
                {post.user.displayName}
              </Link>
              <SellerBadge isSeller={post.user.isSeller} followerCount={post.user._count.followers} />
              {post.user.isVerified && <ShieldCheck className="size-4 text-[#4a90e2] fill-current" />}
            </div>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-80">
              {formatRelativeDate(new Date(post.createdAt))}
            </p>
          </div>
        </div>
        <PostMoreButton post={post} />
      </div>

      <div className="px-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          {productName && (
            <h3 className="font-black text-xl italic uppercase tracking-tighter text-foreground leading-none line-clamp-2">
              {productName}
            </h3>
          )}
          
          {isAvailable ? (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/10">
              Disponible en stock ({post.stock})
            </span>
          ) : (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-500/10 animate-pulse">
              Rupture de Stock
            </span>
          )}
        </div>
        
        {price && (
          <div className="text-right whitespace-nowrap">
            <span className={cn(
              "text-2xl font-black tracking-tighter bg-emerald-50/70 border-2 border-emerald-500/10 px-3.5 py-1 rounded-2xl block shadow-sm transform -rotate-1",
              isAvailable ? "text-emerald-600" : "text-muted-foreground bg-neutral-100 border-neutral-200 line-through opacity-60"
            )}>
              {price} <span className="text-xs font-bold tracking-normal">FCFA</span>
            </span>
          </div>
        )}
      </div>

      {cleanDescription && (
        <div className="px-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 italic font-bold leading-relaxed line-clamp-2">
            {cleanDescription}
          </p>
        </div>
      )}

      <div className="w-full overflow-hidden border-y border-border/40">
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

      <div className="px-5 pt-1">
        <div className="flex gap-2 w-full">
          <button 
            disabled={!isAvailable}
            onClick={() => handleAddToCart(false)} 
            className={cn(
              "flex-1 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-secondary-foreground border border-border/80 transition-all flex items-center justify-center gap-2",
              isAvailable ? "bg-secondary hover:bg-secondary/80 active:scale-[0.97]" : "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed opacity-50"
            )}
          >
            <ShoppingBag className="size-4" /> Panier
          </button>
          <button 
            disabled={!isAvailable}
            onClick={() => handleAddToCart(true)} 
            className={cn(
              "flex-[2.5] py-4 rounded-xl font-black uppercase italic text-xs tracking-widest shadow-md transition-all flex items-center justify-center gap-2",
              isAvailable ? "bg-primary text-primary-foreground shadow-primary/20 hover:opacity-95 active:scale-[0.97]" : "bg-neutral-200 text-neutral-400 shadow-none cursor-not-allowed opacity-50"
            )}
          >
            <CreditCard className={cn("size-4 text-orange-400", isAvailable && "animate-pulse")} /> 
            {isAvailable ? "Achat Sécurisé" : "Indisponible"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pt-3 border-t border-border/40">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some(l => l.userId === loggedInUser?.id) }} />
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none group/btn transition-transform active:scale-95">
                    <MessageSquare className="size-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    <span className="text-xs font-black text-muted-foreground group-hover/btn:text-foreground">{post._count.comments}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 sm:max-w-[450px]"><Comments post={post} /></SheetContent>
              </Sheet>
            ) : (
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none transition-transform active:scale-95">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <span className="text-xs font-black text-muted-foreground">{post._count.comments}</span>
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
      <div ref={containerRef} className="relative w-full bg-zinc-950 group/media overflow-hidden">
        {audioUrl && <audio ref={audioRef} src={audioUrl} loop className="hidden" />}
        <div 
          onClick={() => router.push(`/posts/${postId}/photos`, { scroll: false })}
          className={cn(
            "grid gap-[2px] w-full cursor-pointer hover:opacity-95 transition-opacity",
            count === 1 ? "grid-cols-1" : "grid-cols-2",
            count >= 3 ? "aspect-square" : "aspect-video"
          )}
        >
          {displayedMedia.map((m: any, i: number) => (
            <motion.div 
              key={m.id || i} 
              layoutId={`post-image-${m.id}`} 
              className={cn(
                "relative overflow-hidden bg-zinc-900",
                count === 3 && i === 0 ? "row-span-2" : "",
                count === 1 ? "h-[480px] md:h-[520px]" : "h-full"
              )}
            >
              {m.type === "IMAGE" ? (
                <Image 
                  src={m.url} 
                  alt="DealCity Product" 
                  fill 
                  sizes={count === 1 ? "(max-width: 768px) 100vw, 600px" : "(max-width: 768px) 50vw, 300px"}
                  className="object-cover transition-transform duration-300 group-hover/media:scale-[1.02]" 
                  priority={i === 0}
                />
              ) : (
                <VideoPost src={m.url} />
              )}
              {count > 4 && i === 3 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
                  <span className="text-white text-2xl font-black">+{count - 3}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {availableColors.length > 0 && (
        <div className="px-5 pt-1">
          <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-2 tracking-widest">
            Sélectionner une couleur :
          </p>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color: string) => (
              <button
                key={color}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                  selectedColor === color 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105" 
                    : "bg-muted text-muted-foreground border-border/40 hover:bg-muted/80"
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