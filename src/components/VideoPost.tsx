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
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface VideoPostProps {
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

export default function VideoPost({
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
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ratio, setRatio] = useState(16 / 9);
  const effectiveMuted = forcedMuted ?? isMuted;

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
      // Sound preferences must reflect the browser's actual autoplay fallback.
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
    setRatio(16 / 9);
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

  const controlClass =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

  return (
    <div
      ref={playerRef}
      className={cn(
        "group/video relative isolate max-h-[75svh] min-h-[220px] w-full overflow-hidden bg-zinc-950 text-white",
        className,
      )}
      style={{ aspectRatio: ratio, ...style }}
      onClick={(event) => event.stopPropagation()}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="absolute inset-0 size-full object-cover"
        loop
        muted={effectiveMuted}
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDuration(Number.isFinite(video.duration) ? video.duration : 0);
          if (video.videoWidth && video.videoHeight)
            setRatio(video.videoWidth / video.videoHeight);
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
      <button
        type="button"
        onClick={togglePlayback}
        disabled={hasError}
        aria-label={
          isPlaying
            ? en
              ? "Pause video"
              : "Mettre en pause"
            : en
              ? "Play video"
              : "Lire la vidéo"
        }
        className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
      >
        {!isPlaying && !isLoading && !hasError && (
          <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/35 shadow-xl backdrop-blur-md">
            <Play className="size-7 translate-x-0.5 fill-white" />
          </span>
        )}
      </button>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-black/50 to-transparent" />
      <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] font-semibold tracking-widest backdrop-blur-md">
        DEALCITY VIDÉO
      </span>
      {isLoading && !hasError && (
        <div
          role="status"
          aria-label={en ? "Loading video" : "Chargement de la vidéo"}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
          <Loader2 className="size-9 animate-spin text-white" />
        </div>
      )}
      {hasError && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-zinc-950/90 px-6 text-center"
        >
          <AlertCircle className="size-8 text-white/70" />
          <p className="text-sm">
            {en
              ? "Unable to load this video."
              : "Impossible de charger cette vidéo."}
          </p>
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
            {en ? "Retry" : "Réessayer"}
          </button>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 sm:px-4">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          disabled={!duration || hasError}
          aria-label={en ? "Video position" : "Position dans la vidéo"}
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="block h-4 w-full cursor-pointer accent-[#4a90e2] disabled:cursor-default"
          onChange={(event) => {
            const time = Number(event.target.value);
            if (videoRef.current) videoRef.current.currentTime = time;
            setCurrentTime(time);
          }}
        />
        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={togglePlayback}
            disabled={hasError}
            aria-label={
              isPlaying ? (en ? "Pause" : "Pause") : en ? "Play" : "Lecture"
            }
            className={controlClass}
          >
            {isPlaying ? (
              <Pause className="size-5 fill-white" />
            ) : (
              <Play className="size-5 fill-white" />
            )}
          </button>
          <span className="flex-1 text-xs tabular-nums text-white/85">
            {formatTime(currentTime)}{" "}
            <span className="text-white/45">/ {formatTime(duration)}</span>
          </span>
          {forcedMuted === undefined && (
            <button
              type="button"
              aria-label={
                isMuted
                  ? en
                    ? "Enable sound"
                    : "Activer le son"
                  : en
                    ? "Mute"
                    : "Couper le son"
              }
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
              {isMuted ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={fullscreen}
            aria-label={en ? "Fullscreen" : "Plein écran"}
            className={controlClass}
          >
            <Maximize className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPost;