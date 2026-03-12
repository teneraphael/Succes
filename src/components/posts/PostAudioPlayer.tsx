"use client";

import { cn } from "@/lib/utils";
import { Music, Pause, Play, Volume2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface PostAudioPlayerProps {
  url: string;
  title: string;
}

export default function PostAudioPlayer({ url, title }: PostAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronise l'état visuel si l'audio est manipulé par le navigateur
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche de déclencher d'autres événements sur le post
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/5 p-2.5 backdrop-blur-md transition-all hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="flex items-center gap-3">
        {/* BOUTON PLAY/PAUSE */}
        <button
          onClick={togglePlay}
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all active:scale-95",
            isPlaying ? "bg-foreground text-background" : "bg-primary text-white"
          )}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" className="ml-0.5" />
          )}
          
          {/* INDICATEUR MUSIQUE */}
          <div className={cn(
            "absolute -top-1 -right-1 size-4 rounded-full bg-orange-500 border-2 border-background flex items-center justify-center",
            isPlaying && "animate-spin"
          )}>
            <Music size={8} className="text-white" />
          </div>
        </button>

        {/* CONTENU CENTRAL */}
        <div className="flex flex-1 flex-col min-w-0 pr-2">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-black uppercase tracking-tighter text-primary/80 leading-none mb-0.5">
                Ambiance Sonore
              </span>
              <span className="text-[11px] font-bold truncate">
                {title || "Son original"}
              </span>
            </div>
            <Volume2 size={12} className="text-muted-foreground/40 shrink-0" />
          </div>

          {/* BARRE DE PROGRESSION */}
          <div className="relative h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
            <div
              className="absolute h-full bg-primary transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
        className="hidden"
        preload="metadata"
      />
    </div>
  );
}