"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Loader2,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  MapPin,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useSession } from "@/app/(main)/SessionProvider";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";
import BookmarkButton from "./posts/BookmarkButton";
import LikeButton from "./posts/LikeButton";
import PostMoreButton from "./posts/PostMoreButton";
import Comments from "./comments/Comments";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface VideoPostProps {
  post?: any;
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  setIsGlobalPlaying?: (playing: boolean) => void;
  muted?: boolean;
}

const MUTE_EVENT = "video-global-mute-change";
const PLAY_EVENT = "dealcity-video-playing";

const formatTime = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};

const extractInfo = (content: string) => {
  if (!content) return { productName: null, price: null, priceType: null, cleanDescription: null, whatsappNumber: null, location: null };
  const productMatch = content.match(/PRODUIT\s*:\s*([^\n]+)/i);
  const priceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA\s*\(([^)]+)\)/i);
  const simplePriceMatch = content.match(/PRIX\s*:\s*([\d\s,._]+)\s*FCFA/i);
  const descMatch = content.match(/DESCRIPTION\s*:\s*\n?([\s\S]*?)(?=\n\n|📞|🔗|$)/i);
  const whatsappMatch = content.match(/WHATSAPP\s*:\s*([^\n]+)/i);
  const locationMatch = content.match(/LOCALISATION\s*:\s*([^\n]+)/i);

  return {
    productName: productMatch ? productMatch[1].trim() : null,
    price: priceMatch
      ? priceMatch[1].trim().replace(/\s/g, "")
      : simplePriceMatch
        ? simplePriceMatch[1].trim().replace(/\s/g, "")
        : null,
    priceType: priceMatch ? priceMatch[2].trim() : "Prix taxer / Discutable",
    cleanDescription: descMatch ? descMatch[1].trim() : content,
    whatsappNumber: whatsappMatch ? whatsappMatch[1].trim() : null,
    location: locationMatch ? locationMatch[1].trim() : null,
  };
};

async function trackInteraction(postId: string, type: "VIEW" | "CHAT" | "FAVORITE" | "SHARE") {
  try {
    await fetch("/api/posts/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId, type, itemType: "POST" }),
    });
  } catch (error) {
    console.error("Erreur tracking interaction:", error);
  }
}

export default function VideoPost({
  post,
  src,
  poster,
  className,
  style,
  setIsGlobalPlaying,
  muted: forcedMuted,
}: VideoPostProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const manuallyPaused = useRef(false);
  const { lang } = useLanguage();
  const en = lang === "en";
  const { user: loggedInUser } = useSession();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { t } = useLanguage();

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const effectiveMuted = forcedMuted ?? isMuted;

  const {
    productName,
    price: defaultPrice,
    cleanDescription,
    whatsappNumber,
    location,
  } = extractInfo(post?.content || "");

  const currentPrice = defaultPrice || "0";
  const isAvailable = (post?.stock ?? 1) > 0;

  const tryAutoplay = useCallback(() => {
    const video = videoRef.current;
    if (
      !video ||
      !visible.current ||
      manuallyPaused.current ||
      document.hidden ||
      video.readyState < 1
    )
      return;
    void video.play().catch(() => {
      video.muted = true;
      setIsMuted(true);
      if (visible.current && !document.hidden && !manuallyPaused.current)
        void video.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    manuallyPaused.current = false;
    setHasError(false);
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current =
          entry.isIntersecting && entry.intersectionRatio >= 0.5;
        if (visible.current) tryAutoplay();
        else video.pause();
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(video);
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else tryAutoplay();
    };
    const onMute = (event: Event) =>
      setIsMuted((event as CustomEvent<{ muted: boolean }>).detail.muted);
    const onOtherPlay = (event: Event) => {
      if ((event as CustomEvent<HTMLVideoElement>).detail !== video)
        video.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(MUTE_EVENT, onMute);
    window.addEventListener(PLAY_EVENT, onOtherPlay);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(MUTE_EVENT, onMute);
      window.removeEventListener(PLAY_EVENT, onOtherPlay);
      video.pause();
    };
  }, [src, tryAutoplay]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video || hasError) return;
    manuallyPaused.current = !video.paused;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else video.pause();
  };

  const fullscreen = async () => {
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (playerRef.current?.requestFullscreen)
        await playerRef.current.requestFullscreen();
      else video?.webkitEnterFullscreen?.();
    } catch {
      video?.webkitEnterFullscreen?.();
    }
  };

  const handleWhatsApp = useCallback(async () => {
    if (!post) return;
    const number = whatsappNumber || post.user?.phoneNumber || post.user?.phone || "";
    if (!number) return;

    trackInteraction(post.id, "CHAT");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dealcity.app";
    const postUrl = `${origin}/posts/${post.id}`;

    const lines = [
      "Bonjour ! 👋",
      "Je suis interesse(e) par votre produit sur *DealCity* :",
      "",
      `*${productName || "Article"}*`,
      `Prix : *${currentPrice} FCFA*`,
      "",
      "Voir le produit :",
      postUrl,
      "",
      "Est-ce toujours disponible ? Merci !",
    ];

    const cleanNumber = number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  }, [post, whatsappNumber, productName, currentPrice]);

  const handleShare = async () => {
    if (!post) return;
    trackInteraction(post.id, "SHARE");
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dealcity.app";
    const postUrl = `${origin}/posts/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName || "DealCity Vidéo",
          text: cleanDescription?.slice(0, 100) || "Découvrez cette vidéo sur DealCity !",
          url: postUrl,
        });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(postUrl);
    }
  };

  const controlClass =
    "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <div
      ref={playerRef}
      className={cn(
        "group/video relative isolate w-full overflow-hidden bg-zinc-950 text-white shadow-none sm:shadow-md mb-2 md:mb-4",
        className || "h-[80vh] sm:h-[700px] rounded-none sm:rounded-3xl max-w-xl mx-auto",
      )}
      style={style}
      onClick={togglePlayback}
    >
      {/* 1. La Vidéo en arrière-plan */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 size-full object-cover z-0"
        loop
        muted={effectiveMuted}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDuration(Number.isFinite(video.duration) ? video.duration : 0);
        }}
        onLoadedData={() => {
          setIsLoading(false);
          tryAutoplay();
        }}
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
        onPlaying={() => {
          if (!visible.current || document.hidden) {
            videoRef.current?.pause();
            return;
          }
          setIsLoading(false);
          setIsPlaying(true);
          setIsGlobalPlaying?.(true);
          window.dispatchEvent(
            new CustomEvent(PLAY_EVENT, { detail: videoRef.current }),
          );
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsGlobalPlaying?.(false);
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />

      {/* 2. Superposition de dégradés (visible uniquement en pause ou sur les côtés pour garder la lisibilité) */}
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300", isPlaying ? "opacity-40" : "opacity-100")} />
      <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300", isPlaying ? "opacity-40" : "opacity-100")} />

      {/* 3. Bouton Play central (uniquement visible si en pause) */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/40 shadow-xl backdrop-blur-md">
            <Play className="size-7 translate-x-0.5 fill-white text-white" />
          </span>
        </div>
      )}

      {/* 4. En-tête de l'auteur superposé en haut */}
      {post && (
        <div className="absolute top-0 inset-x-0 p-3.5 sm:p-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2.5 min-w-0 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <UserTooltip user={post.user}>
              <Link href={`/users/${post.user.username}`} className="transition-transform active:scale-95 block shrink-0">
                <UserAvatar avatarUrl={post.user.avatarUrl} className="ring-2 ring-white/40 size-9 shadow-md" />
              </Link>
            </UserTooltip>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link href={`/users/${post.user.username}`} className="font-bold text-xs sm:text-sm tracking-tight text-white hover:underline truncate drop-shadow-md">
                  {post.user.displayName}
                </Link>
                {post.user.isVerified && <ShieldCheck className="size-3.5 text-[#4a90e2] fill-current shrink-0" />}
              </div>
              <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest bg-black/30 px-2 py-0.2 rounded-full backdrop-blur-sm inline-block mt-0.5">
                Vidéo
              </span>
            </div>
          </div>

          <div className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-xl p-1 text-white shadow-md" onClick={(e) => e.stopPropagation()}>
            <PostMoreButton post={post} />
          </div>
        </div>
      )}

      {/* 5. Chargement & Erreur */}
      {isLoading && !hasError && (
        <div role="status" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Loader2 className="size-9 animate-spin text-white" />
        </div>
      )}

      {hasError && (
        <div role="alert" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 px-6 text-center" onClick={(e) => e.stopPropagation()}>
          <AlertCircle className="size-8 text-white/70" />
          <p className="text-sm">Impossible de charger cette vidéo.</p>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
              videoRef.current?.load();
            }}
          >
            <RotateCcw className="size-4" />
            Réessayer
          </button>
        </div>
      )}

      {/* 6. Éléments superposés en bas */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-3.5 pb-3 pt-6 sm:px-4 flex flex-col justify-end space-y-2" onClick={(e) => e.stopPropagation()}>
        {post && (
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              {productName && (
                <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-white leading-snug line-clamp-2 drop-shadow-md">
                  {productName}
                </h3>
              )}
              {location && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/30 shadow-sm">
                  <MapPin className="size-3 shrink-0" />
                  {location}
                </span>
              )}
            </div>

            {currentPrice && (
              <div className="text-right whitespace-nowrap">
                <span className="text-lg sm:text-xl font-black tracking-tighter px-3 py-1 rounded-xl block shadow-lg transform -rotate-1 border border-white/30 text-white bg-[#6ab344]/95 backdrop-blur-md">
                  {currentPrice} <span className="text-[10px] font-bold tracking-normal">FCFA</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {cleanDescription && (
          <div className="text-xs text-white/90 drop-shadow">
            <p className={cn("leading-relaxed", !showFullDesc && "line-clamp-2")}>
              {cleanDescription}
            </p>
            {cleanDescription.length > 100 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-[11px] font-bold text-[#4a90e2] mt-0.5 hover:underline"
              >
                {showFullDesc ? (en ? "See less" : "Voir moins") : (en ? "See more" : "Voir plus")}
              </button>
            )}
          </div>
        )}

        {/* ✅ Barre de progression (Slider) : n'apparaît QUE si la vidéo est EN PAUSE (!isPlaying) */}
        {!isPlaying && (
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            disabled={!duration || hasError}
            aria-label="Position dans la vidéo"
            className="block h-1.5 w-full cursor-pointer accent-[#4a90e2] bg-white/30 rounded-lg disabled:cursor-default animate-in fade-in duration-200"
            onChange={(event) => {
              const time = Number(event.target.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
          />
        )}

        {/* Barre d'actions du bas */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={hasError}
              aria-label={isPlaying ? "Pause" : "Lecture"}
              className={controlClass}
            >
              {isPlaying ? <Pause className="size-5 fill-white" /> : <Play className="size-5 fill-white" />}
            </button>

            {post && (
              <>
                <div className="text-white">
                  <LikeButton
                    postId={post.id}
                    initialState={{
                      likes: post._count?.likes || 0,
                      isLikedByUser: post.likes?.some((l: any) => l.userId === loggedInUser?.id) || false,
                    }}
                  />
                </div>

                {isDesktop ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="flex items-center gap-1.5 text-white outline-none group/btn transition-transform active:scale-95">
                        <MessageCircle className="size-4 group-hover/btn:text-[#4a90e2] transition-colors" />
                        <span className="text-xs font-bold">{post._count?.comments || 0}</span>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 sm:max-w-[450px]">
                      <Comments post={post} />
                    </SheetContent>
                  </Sheet>
                ) : (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <button className="flex items-center gap-1.5 text-white outline-none transition-transform active:scale-95">
                        <MessageCircle className="size-4" />
                        <span className="text-xs font-bold">{post._count?.comments || 0}</span>
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[85vh]">
                      <Comments post={post} />
                    </DrawerContent>
                  </Drawer>
                )}

                <div className="text-white">
                  <BookmarkButton
                    postId={post.id}
                    initialState={{
                      isBookmarkedByUser: post.bookmarks?.some((b: any) => b.userId === loggedInUser?.id) || false,
                    }}
                  />
                </div>

                <button
                  onClick={handleShare}
                  title="Partager"
                  className="flex items-center gap-1 text-white hover:text-[#4a90e2] transition-colors active:scale-95 outline-none"
                >
                  <Share2 className="size-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {forcedMuted === undefined && (
              <button
                type="button"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
                aria-pressed={!isMuted}
                className={controlClass}
                onClick={() => {
                  const muted = !isMuted;
                  setIsMuted(muted);
                  window.dispatchEvent(
                    new CustomEvent(MUTE_EVENT, { detail: { muted } }),
                  );
                }}
              >
                {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
            )}

            <button
              type="button"
              onClick={fullscreen}
              aria-label="Plein écran"
              className={controlClass}
            >
              <Maximize className="size-4" />
            </button>

            {/* Bouton WhatsApp */}
            {post && (
              <button
                onClick={handleWhatsApp}
                disabled={!isAvailable}
                className="p-2 rounded-xl transition-all flex items-center justify-center bg-[#25D366] hover:bg-[#20b858] text-white shadow-lg active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="size-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}