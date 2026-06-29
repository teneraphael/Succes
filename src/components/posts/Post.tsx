"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { cn, formatRelativeDate } from "@/lib/utils";
import { MessageSquare, ShieldCheck } from "lucide-react";
import Image from "next/image";
import VideoPost from "../VideoPost";
import { getSellerBadge } from "@/lib/badge";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
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
import { useLanguage } from "@/components/LanguageProvider";
// ✅ IMPORTATION DE L'ACTION D'INCRÉMENTATION
import { incrementWhatsAppClicks } from "@/app/(main)/users/[username]/actions"; 

function ExpandableDescription({ text, limit = 120 }: { text: string; limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  if (text.length <= limit) {
    return (
      <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground" style={{ whiteSpace: "pre-wrap" }}>
        {text}
      </p>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground" style={{ whiteSpace: "pre-wrap" }}>
        {isExpanded ? text : `${text.slice(0, limit)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-[10px] font-black uppercase text-[#4a90e2] mt-1 hover:underline tracking-wide"
      >
        {isExpanded ? t.see_less : t.see_more}
      </button>
    </div>
  );
}

interface PostProps {
  post: any;
}

const extractInfo = (content: string) => {
  const productMatch = content.match(/\s*PRODUIT\s*:\s*(.*)/i);
  const priceMatch = content.match(/\s*PRIX\s*:\s*(.*?)\s*FCFA/i);
  const descMatch = content.match(/\s*DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n🎵|$)/i);
  const whatsappMatch = content.match(/\s*WHATSAPP\s*:\s*(.*)/i);
  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch ? priceMatch[1].trim() : null,
    cleanDescription: descMatch ? descMatch[1].trim() : content,
    whatsappNumber: whatsappMatch ? whatsappMatch[1].trim() : null,
  };
};

const isExternalImage = (url: string) =>
  url.includes("ufs.sh") || url.includes("utfs.io") || url.includes("lh3.googleusercontent.com");

// ✅ Helper tracking — fire and forget
async function trackInteraction(postId: string, type: "VIEW" | "CHAT" | "FAVORITE") {
  try {
    await fetch("/api/posts/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, type, itemType: "POST" }),
    });
  } catch {
    // Erreur réseau ignorée silencieusement
  }
}

export default function Post({ post }: PostProps) {
  const { user: loggedInUser } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { t } = useLanguage();

  const { productName, price: defaultPrice, cleanDescription, whatsappNumber } = extractInfo(post.content);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeVariant, setActiveVariant] = useState<any>(null);

  useEffect(() => {
    if (post.attributes && post.attributes.length > 0) {
      const initialSelection: Record<string, string> = {};
      post.attributes.forEach((attr: any) => {
        if (attr.values && attr.values.length > 0) initialSelection[attr.name] = attr.values[0];
      });
      setSelectedAttributes(initialSelection);
    }
  }, [post.attributes]);

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

  // ✅ handleWhatsApp mis à jour avec incrémentation du compteur du vendeur
  const handleWhatsApp = useCallback(async () => {
    if (!isAvailable) {
      toast({ variant: "destructive", description: t.product_unavailable, duration: 2000 });
      return;
    }
    const number = whatsappNumber || post.user?.phoneNumber || post.user?.phone || "";
    if (!number) {
      toast({ variant: "destructive", description: t.whatsapp_unavailable, duration: 2000 });
      return;
    }

    // ✅ 1. Incrémentation du compteur via l'action serveur en lui passant l'ID du Post
  

    // ✅ 2. Tracker l'interaction système — signal pour l'algorithme
    trackInteraction(post.id, "CHAT");

    const choiceLabel = Object.entries(selectedAttributes).map(([key, val]) => `${key}: ${val}`).join(", ");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dealcity.app";
    const postUrl = `${origin}/posts/${post.id}`;
    const shortDesc = cleanDescription
      ? cleanDescription.length > 200 ? cleanDescription.slice(0, 200) + "..." : cleanDescription
      : null;

    const lines: string[] = [];
    lines.push("Bonjour ! 👋");
    lines.push(`Je suis interesse(e) par votre produit sur *DealCity* :`);
    lines.push("");
    lines.push(`*${productName || "Article"}*`);
    lines.push(`Prix : *${currentPrice} FCFA*`);
    if (choiceLabel) lines.push(`Options choisies : *${choiceLabel}*`);
    if (shortDesc) { lines.push(""); lines.push("Description :"); lines.push(shortDesc); }
    lines.push("");
    lines.push("Voir le produit :");
    lines.push(postUrl);
    lines.push("");
    lines.push("Est-ce que ce produit est toujours disponible ? Merci !");

    const cleanNumber = number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }, [isAvailable, whatsappNumber, post, selectedAttributes, cleanDescription, productName, currentPrice, t, toast]);

  return (
    <article className="group/post w-full space-y-4 bg-card py-4 md:py-5 md:rounded-3xl border-b md:border border-border/70 shadow-sm transition-all duration-200 hover:shadow-md max-w-xl mx-auto mb-5 overflow-hidden">

      {/* En-tête */}
      <div className="flex justify-between items-center gap-3 px-5">
        <div className="flex flex-wrap items-center gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`} className="transition-transform active:scale-95 block">
              <UserAvatar avatarUrl={post.user.avatarUrl} className="ring-2 ring-[#4a90e2]/20 size-10" />
            </Link>
          </UserTooltip>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href={`/users/${post.user.username}`} className="font-extrabold text-sm tracking-tight text-foreground hover:text-[#4a90e2] transition-colors">
                {post.user.displayName}
              </Link>
              {getSellerBadge(post.user._count.sales) && (
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider text-white", getSellerBadge(post.user._count.sales)?.color)}>
                  {getSellerBadge(post.user._count.sales)?.label}
                </span>
              )}
              {post.user.isVerified && <ShieldCheck className="size-4 text-[#4a90e2] fill-current" />}
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-80">
              {formatRelativeDate(new Date(post.createdAt))}
            </p>
          </div>
        </div>
        <PostMoreButton post={post} />
      </div>

      {/* Nom + stock + prix */}
      <div className="px-5 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          {productName && (
            <h3 className="font-black text-xl uppercase tracking-tight text-foreground leading-none line-clamp-2">
              {productName}
            </h3>
          )}
          {isAvailable ? (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-[#6ab344] bg-[#6ab344]/10 px-2 py-0.5 rounded-md border border-[#6ab344]/20">
              {t.available} ({currentStock})
            </span>
          ) : (
            <span className="inline-flex text-[9px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-500/10 animate-pulse">
              {t.out_of_stock}
            </span>
          )}
        </div>

        {currentPrice && (
          <div className="text-right whitespace-nowrap">
            <span
              className={cn(
                "text-2xl font-black tracking-tighter px-3.5 py-1 rounded-2xl block shadow-sm transform -rotate-1 border-2",
                isAvailable ? "text-[#6ab344] bg-[#6ab344]/8 border-[#6ab344]/20" : "text-muted-foreground bg-neutral-100 border-neutral-200 line-through opacity-60"
              )}
              style={{ fontFamily: "'Geist Mono', 'Courier New', monospace" }}
            >
              {currentPrice} <span className="text-xs font-bold tracking-normal">FCFA</span>
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      {cleanDescription && (
        <div className="px-5">
          <ExpandableDescription text={cleanDescription} />
        </div>
      )}

      {/* Médias */}
      <div className="w-full overflow-hidden border-y border-border/40">
        <MediaPreviews
          attachments={visualAttachments}
          audioUrl={finalAudioUrl}
          postId={post.id}
          attributes={post.attributes || []}
          selectedAttributes={selectedAttributes}
          setSelectedAttributes={setSelectedAttributes}
        />
      </div>

      {/* Bouton WhatsApp */}
      <div className="px-5 pt-1">
        <button
          onClick={handleWhatsApp}
          disabled={!isAvailable}
          className={cn(
            "w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all flex items-center justify-center gap-3 shadow-md",
            isAvailable
              ? "bg-[#25D366] hover:bg-[#20b858] text-white shadow-[#25D366]/25 active:scale-[0.97]"
              : "bg-neutral-200 text-neutral-400 shadow-none cursor-not-allowed opacity-50"
          )}
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {isAvailable ? t.chat_whatsapp : t.unavailable}
        </button>
      </div>

      {/* Likes, commentaires, bookmark */}
      <div className="flex items-center justify-between px-5 pt-3 border-t border-border/40">
        <div className="flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((l: { userId: string | undefined }) => l.userId === loggedInUser?.id),
            }}
          />
          <div className="flex items-center gap-1.5">
            {isDesktop ? (
              <Sheet>
                <SheetTrigger asChild>
                  <button className="flex items-center gap-1.5 outline-none group/btn transition-transform active:scale-95">
                    <MessageSquare className="size-5 text-muted-foreground group-hover/btn:text-[#4a90e2] transition-colors" />
                    <span className="text-xs font-black text-muted-foreground group-hover/btn:text-foreground">
                      {post._count.comments}
                    </span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 sm:max-w-[450px]">
                  <Comments post={post} />
                </SheetContent>
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
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some((b: { userId: string | undefined }) => b.userId === loggedInUser?.id),
          }}
        />
      </div>
    </article>
  );
}

function MediaPreviews({ attachments, audioUrl, postId, attributes, selectedAttributes, setSelectedAttributes }: any) {
  const router = useRouter();
  const count = attachments?.length || 0;
  const displayedMedia = attachments?.slice(0, 4) || [];

  return (
    <div className="w-full space-y-0">
      {count > 0 && (
        <div className="relative w-full bg-zinc-950 overflow-hidden">
          {audioUrl && <audio src={audioUrl} loop className="hidden" />}

          {/* 1 seul média */}
          {count === 1 ? (
            <div
              onClick={() => router.push(`/posts/${postId}/photos`, { scroll: false })}
              className="w-full h-[500px] md:h-[580px] relative cursor-pointer overflow-hidden bg-zinc-950"
            >
              {displayedMedia[0].type === "IMAGE" ? (
                <Image
                  src={displayedMedia[0].url}
                  alt="Product"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-cover"
                  priority
                  unoptimized={isExternalImage(displayedMedia[0].url)}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover">
                  <VideoPost src={displayedMedia[0].url} />
                </div>
              )}
            </div>
          ) : (
            /* Mosaïque plusieurs médias */
            <div
              onClick={() => router.push(`/posts/${postId}/photos`, { scroll: false })}
              className="grid gap-[2px] w-full cursor-pointer hover:opacity-95 transition-opacity grid-cols-2 aspect-square"
            >
              {displayedMedia.map((m: any, i: number) => (
                <motion.div
                  key={m.id || i}
                  layoutId={`post-image-${m.id}`}
                  className={cn(
                    "relative overflow-hidden bg-zinc-900",
                    count === 3 && i === 0 ? "row-span-2" : "",
                    "h-full"
                  )}
                >
                  {m.type === "IMAGE" ? (
                    <Image
                      src={m.url}
                      alt="Product"
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      priority={i === 0}
                      unoptimized={isExternalImage(m.url)}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover">
                      <VideoPost src={m.url} />
                    </div>
                  )}
                  {count > 4 && i === 3 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
                      <span className="text-white text-2xl font-black italic">+{count - 3}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attributs / variantes */}
      {attributes && attributes.length > 0 && (
        <div className="px-5 py-6 space-y-5 bg-card">
          {attributes.map((attr: any) => (
            <div key={attr.id || attr.name} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a90e2]" />
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
                        setSelectedAttributes((prev: any) => ({ ...prev, [attr.name]: val }));
                      }}
                      className={cn(
                        "relative px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 border-2",
                        isSelected
                          ? "bg-[#4a90e2] text-white border-[#4a90e2] shadow-lg shadow-[#4a90e2]/20 scale-105"
                          : "bg-transparent text-muted-foreground border-border hover:border-[#4a90e2]/50 hover:text-[#4a90e2]"
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