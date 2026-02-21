"use client";

import { cn } from "@/lib/utils";
import { Music, Pause, Play, Volume2 } from "lucide-react";
import { useRef, useState } from "react";

interface PostAudioPlayerProps {
  url: string;
  title: string;
}

export default function PostAudioPlayer({ url, title }: PostAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-[2rem] border border-white/20 bg-secondary/30 p-2 backdrop-blur-md transition-all hover:bg-secondary/40">
      <div className="flex items-center gap-3">
        {/* BOUTON PLAY/PAUSE */}
        <button
          onClick={togglePlay}
          className={cn(
            "relative flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all active:scale-90",
            isPlaying ? "bg-foreground text-background" : "bg-primary text-white"
          )}
        >
          {isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-1" />
          )}
          
          {/* PETITE ANIMATION DE DISQUE QUI TOURNE */}
          <div className={cn(
            "absolute -top-1 -right-1 size-4 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center",
            isPlaying && "animate-spin"
          )}>
            <Music size={8} className="text-white" />
          </div>
        </button>

        {/* INFOS ET BARRE DE PROGRESSION */}
        <div className="flex flex-1 flex-col pr-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/70">
                    Ambiance Sonore
                </span>
                <span className="text-[11px] font-bold italic truncate max-w-[150px]">
                    {title}
                </span>
            </div>
            <Volume2 size={12} className="text-muted-foreground/40" />
          </div>

          {/* BARRE DE PROGRESSION CUSTOM */}
          <div className="relative h-1.5 w-full rounded-full bg-muted/30">
            <div
              className="absolute h-full rounded-full bg-primary transition-all duration-300"
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
      />
    </div>
  );
}