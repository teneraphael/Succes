"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Loader2, Play } from "lucide-react";

interface VideoPostProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  setIsGlobalPlaying?: (playing: boolean) => void;
  muted?: boolean; 
}

const MUTE_EVENT = "video-global-mute-change";

const VideoPost = ({ src, className, style, setIsGlobalPlaying, muted: forcedMuted }: VideoPostProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); 

  // 1. GESTION DES ÉVÉNEMENTS GLOBAUX
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      }
    };

    const handleGlobalMuteChange = (e: any) => {
      setIsMuted(e.detail.muted);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(MUTE_EVENT, handleGlobalMuteChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(MUTE_EVENT, handleGlobalMuteChange);
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src'); 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.load();
      }
    };
  }, []);

  // Autoplay à l'écran
  useAutoplayOnVisible(videoRef, 0.5); 

  // 2. SYNCHRONISATION DU VOLUME
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (forcedMuted) {
      video.muted = false; 
      video.volume = 0.25; 
    } else {
      video.muted = isMuted;
      video.volume = 1.0;
    }
  }, [forcedMuted, isMuted]);

  // Suivi de la barre de progression temporelle
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    const event = new CustomEvent(MUTE_EVENT, { detail: { muted: newMutedState } });
    window.dispatchEvent(event);
  };

  const handleVideoClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.warn("L'interaction vidéo a été bloquée par le navigateur :", err);
    }
  }, []);

  return (
    // 👈 Les classes 'rounded-2xl' et 'sm:rounded-3xl' ont été retirées ici pour avoir des bords droits
    <div className={cn("relative group overflow-hidden bg-zinc-950 flex items-center justify-center w-full h-full shadow-md border border-slate-200/5 dark:border-zinc-800/40 select-none", className)}>
      
      {/* LECTEUR VIDÉO */}
      <video
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover block cursor-pointer transition-transform duration-500"
        style={style}
        loop 
        muted={isMuted && !forcedMuted} 
        playsInline 
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate} 
        preload="metadata" 
        crossOrigin="anonymous"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPaused(false);
          if (setIsGlobalPlaying) setIsGlobalPlaying(true);
        }}
        onPause={() => {
          setIsPaused(true);
          if (setIsGlobalPlaying) setIsGlobalPlaying(false);
        }}
      >
        Ton navigateur ne supporte pas la lecture de vidéos.
      </video>

      {/* GRADIENT D'OMBRAGE INFÉRIEUR */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none z-10" />

      {/* LOADER CENTRAL DESIGN */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs z-20 pointer-events-none">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-xl">
            <Loader2 className="size-8 animate-spin text-[#00b272]" />
          </div>
        </div>
      )}

      {/* BOUTON PLAY CINÉMATIQUE EN PAUSE */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-20">
          <div className="bg-white/15 p-4 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-75 duration-200">
            <Play className="size-10 text-white fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* BOUTON DE SON GLOBAL */}
      {!forcedMuted && (
        <button
          onClick={toggleMute}
          type="button"
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
          className="absolute top-4 right-4 z-30 rounded-xl bg-black/50 p-2.5 text-white backdrop-blur-lg transition-all hover:bg-black/70 border border-white/10 shadow-lg active:scale-95"
        >
          {isMuted ? <VolumeX size={16} className="text-zinc-300" /> : <Volume2 size={16} className="text-[#00b272]" />}
        </button>
      )}

      {/* BADGE DE TYPE DE MÉDIA */}
      <div className="absolute bottom-4 left-4 z-20 rounded-lg bg-black/40 px-2.5 py-1 text-[9px] font-black uppercase text-zinc-100 tracking-widest backdrop-blur-md pointer-events-none border border-white/5 shadow-sm">
        Aperçu
      </div>

      {/* BARRE DE PROGRESSION DISCRÈTE */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#00b272] to-emerald-400 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
};

export default VideoPost;