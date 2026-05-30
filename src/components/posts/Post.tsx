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
import { getSellerBadge } from "@/lib/badge";
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

function ExpandableDescription({ text, limit = 120 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= limit) return <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 italic font-bold leading-relaxed">{text}</p>;
  
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 italic font-bold leading-relaxed">
        {isExpanded ? text : `${text.slice(0, limit)}...`}
      </p>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[10px] font-black uppercase text-blue-600 mt-1 hover:underline"
      >
        {isExpanded ? "Voir moins" : "Voir plus"}
      </button>
    </div>
  );
}

interface PostProps { post: any; }

const extractInfo = (content: string) => {
  const productMatch = content.match(/🛍️\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/💰\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const descMatch = content.match(/📝\s*DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n🎵|$)/i);
  
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
    cleanDescription: descMatch ? descMatch[1].trim() : content,
  };
};

export default function Post({ post }: PostProps) {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { productName, price: defaultPrice, cleanDescription } = extractInfo(post.content);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<any>(null);

  // Initialiser les attributs sélectionnés par défaut avec la première valeur de chaque axe
  useEffect(() => {
    if (post.attributes && post.attributes.length > 0) {
      const initialSelection: Record<string, string> = {};
      post.attributes.forEach((attr: any) => {
        if (attr.values && attr.values.length > 0) {
          initialSelection[attr.name] = attr.values[0];
        }
      });
      setSelectedAttributes(initialSelection);
    }
  }, [post.attributes]);

  // Trouver la variante correspondante dès que la sélection d'un attribut change
  useEffect(() => {
    if (post.variants && post.variants.length > 0 && Object.keys(selectedAttributes).length > 0) {
      const matched = post.variants.find((variant: any) => {
        const combo = variant.combinations as Record<string, string>;
        return Object.entries(selectedAttributes).every(([key, value]) => combo[key] === value);
      });
      setActiveVariant(matched || null);
    }
  }, [selectedAttributes, post.variants]);

  const currentStock = activeVariant !== null ? activeVariant.stock : (post.stock ?? 0);
  const currentPrice = activeVariant !== null ? activeVariant.price.toLocaleString() : (defaultPrice || "0");
  const isAvailable = currentStock > 0;

  const audioMedia = post.attachments.find((m: any) => m.type === "AUDIO");
  const visualAttachments = post.attachments.filter((m: any) => m.type !== "AUDIO");
  const finalAudioUrl = post.audioUrl || audioMedia?.url;
  const finalAudioTitle = post.audioTitle || "Son original";

const handleAddToCart = async (isPrePayment = false) => {
  if (!isAvailable) {
    toast({ variant: "destructive", description: "Indisponible !", duration: 2000 });
    return;
  }

  const numericPrice = parseInt(currentPrice.replace(/\D/g, ''));
  const firstImage = visualAttachments.find((m: any) => m.type === "IMAGE")?.url || visualAttachments[0]?.url || "";

  // 1. Génération propre du libellé des options
  const choiceLabel = Object.entries(selectedAttributes)
    .map(([key, val]) => `${key}: ${val}`)
    .join(" • ");

  // 2. Identification dynamique de la couleur
  // On cherche une clé qui contient "Couleur" (insensible à la casse)
  const colorKey = Object.keys(selectedAttributes).find(k => k.toLowerCase().includes("couleur"));
  const detectedColor = colorKey ? selectedAttributes[colorKey] : "Standard";

  const product = {
    id: post.id, 
    postId: post.id,
    name: productName ? productName : "Article DealCity",
    price: numericPrice,
    image: firstImage,
    quantity: 1,
    color: detectedColor, 
    variantId: activeVariant?.id || undefined,
    selectedOptions: choiceLabel || "Aucune option" // On force le texte ici
  };

    if (isPrePayment) {
      // Nettoyer l'ancien état pour éviter les chevauchements de produits
      sessionStorage.removeItem("current_product");
      sessionStorage.setItem("current_product", JSON.stringify(product));
      
      const params = new URLSearchParams({
        id: post.id,
        variantId: activeVariant?.id || "",
        productName: product.name,
        price: product.price.toString(),
        image: product.image,
        qty: "1",
        selectedOptions: product.selectedOptions
      });
      router.push(`/pre-payment?${params.toString()}`);
    } else {
      addToCart({ 
        ...product, 
        availableColors: post.attributes?.find((a: any) => a.name === "Couleur")?.values || [] 
      });
      toast({ description: `🛒 Ajouté au panier avec succès !`, duration: 2000 });
    }
  };

  return (
    <article className="group/post w-full space-y-4 bg-card py-4 md:py-5 md:rounded-3xl border-b md:border border-border/70 shadow-sm transition-all duration-200 hover:shadow-md max-w-xl mx-auto mb-5 overflow-hidden">
      
      {/* SELLER HEADER */}
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
              
              {getSellerBadge(post.user._count.sales) && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider text-white",
                  getSellerBadge(post.user._count.sales)?.color
                )}>
                  {getSellerBadge(post.user._count.sales)?.label}
                </span>
              )}

              {post.user.isVerified && <ShieldCheck className="size-4 text-[#4a90e2] fill-current" />}
            </div>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-80">
              {formatRelativeDate(new Date(post.createdAt))}
            </p>
          </div>
        </div>
        <PostMoreButton post={post} />
      </div>

      {/* TITRE, STOCK ET PRIX DYNAMIQUES */}
      <div className="px-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          {productName && (
            <h3 className="font-black text-xl italic uppercase tracking-tighter text-foreground leading-none line-clamp-2">
              {productName}
            </h3>
          )}
          
          {isAvailable ? (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/10">
              Disponible en stock ({currentStock})
            </span>
          ) : (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-500/10 animate-pulse">
              Rupture de Stock
            </span>
          )}
        </div>
        
        {currentPrice && (
          <div className="text-right whitespace-nowrap">
            <span className={cn(
              "text-2xl font-black tracking-tighter bg-emerald-50/70 border-2 border-emerald-500/10 px-3.5 py-1 rounded-2xl block shadow-sm transform -rotate-1",
              isAvailable ? "text-emerald-600" : "text-muted-foreground bg-neutral-100 border-neutral-200 line-through opacity-60"
            )}>
              {currentPrice} <span className="text-xs font-bold tracking-normal">FCFA</span>
            </span>
          </div>
        )}
      </div>

      {cleanDescription && (
        <div className="px-5">
          <ExpandableDescription text={cleanDescription} />
        </div>
      )}

      {/* VISUELS ET SELECTIONNEUR D'ATTRIBUTS DYNAMIQUES */}
      <div className="w-full overflow-hidden border-y border-border/40">
        <MediaPreviews 
          attachments={visualAttachments} 
          userAvatar={post.user.avatarUrl}
          audioUrl={finalAudioUrl}
          audioTitle={finalAudioTitle}
          postId={post.id}
          attributes={post.attributes || []}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
        />
      </div>

      {/* BOUTONS D'ACHAT */}
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

      {/* FEEDBACK ACTIONS FOOTER */}
      <div className="flex items-center justify-between px-5 pt-3 border-t border-border/40">
        <div className="flex items-center gap-6">
          <LikeButton postId={post.id} initialState={{ likes: post._count.likes, isLikedByUser: post.likes.some((l: { userId: string | undefined; }) => l.userId === loggedInUser?.id) }} />
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none group/btn transition-transform active:scale-95">
                    <MessageSquare className="size-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    <span className="text-xs font-black text-muted-foreground group-hover/btn:text-foreground">
                      {post._count.comments}
                    </span>
                  </button>
                </SheetTrigger>
                <SheetTrigger asChild>
                  <SheetContent side="right" className="p-0 sm:max-w-[450px]">
                    <Comments post={post} />
                  </SheetContent>
                </SheetTrigger>
              </Sheet>
            ) : (
              <Drawer>
                <DrawerTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none transition-transform active:scale-95">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <span className="text-xs font-black text-muted-foreground">
                      {post._count.comments}
                    </span>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="max-h-[85vh]">
                  <Comments post={post} />
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
        <BookmarkButton postId={post.id} initialState={{ isBookmarkedByUser: post.bookmarks.some((b: { userId: string | undefined; }) => b.userId === loggedInUser?.id) }} />
      </div>
    </article>
  );
}

function MediaPreviews({ 
  attachments, audioUrl, postId, 
  attributes, selectedAttributes, setSelectedAttributes 
}: any) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const count = attachments?.length || 0;
  const displayedMedia = attachments?.slice(0, 4) || [];

  return (
    <div className="w-full space-y-0">
      {/* GRILLE MULTIMÉDIA PREVIEW - Inchangée pour la structure */}
      {count > 0 && (
        <div className="relative w-full bg-zinc-950 overflow-hidden">
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
                className={cn("relative overflow-hidden bg-zinc-900", count === 3 && i === 0 ? "row-span-2" : "", count === 1 ? "h-[480px]" : "h-full")}
              >
                {m.type === "IMAGE" ? (
                  <Image src={m.url} alt="Product" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover transition-transform duration-500 hover:scale-105" priority={i === 0} />
                ) : (
                  <VideoPost src={m.url} />
                )}
                {count > 4 && i === 3 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
                    <span className="text-white text-2xl font-black italic">+{count - 3}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SÉLECTEUR D'OPTIONS STYLISÉ */}
      {attributes && attributes.length > 0 && (
        <div className="px-5 py-6 space-y-5 bg-card">
          {attributes.map((attr: any) => (
            <div key={attr.id || attr.name} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">
                  {attr.name}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {attr.values.map((val: string) => {
                  const isSelected = selectedAttributes[attr.name] === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAttributes((prev: any) => ({
                          ...prev,
                          [attr.name]: val,
                        }));
                      }}
                      className={cn(
                        "relative px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-2",
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                          : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}