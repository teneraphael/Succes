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
  
  // État initial du mute basé sur la prop ou le défaut (true pour autoplay)
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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
        videoRef.current.removeAttribute('src'); // Libère la mémoire
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.load();
      }
    };
  }, []);

  // Hook personnalisé pour l'autoplay
  useAutoplayOnVisible(videoRef, 0.5); 

  // 2. SYNCHRONISATION DU VOLUME
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (forcedMuted) {
      video.muted = false; // On gère le volume manuellement si forcé
      video.volume = 0.25; 
    } else {
      video.muted = isMuted;
      video.volume = 1.0;
    }
  }, [forcedMuted, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Notification à tous les autres composants VideoPost
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
    <div className={cn("relative group overflow-hidden bg-black flex items-center justify-center w-full h-full", className)}>
      
      <video
        ref={videoRef}
        src={src} // Utilisation directe pour une meilleure réactivité
        className="w-full h-full object-cover block cursor-pointer"
        style={style}
        loop 
        muted={isMuted && !forcedMuted} 
        playsInline 
        onClick={handleVideoClick}
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

      {/* Loader central */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none">
          <Loader2 className="size-10 animate-spin text-white/80" />
        </div>
      )}

      {/* Icône Play au milieu quand en pause */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10 transition-opacity">
          <div className="bg-black/20 p-4 rounded-full backdrop-blur-sm">
            <Play className="size-12 text-white/70 fill-current" />
          </div>
        </div>
      )}

      {/* Bouton Mute individuel/global */}
      {!forcedMuted && (
        <button
          onClick={toggleMute}
          type="button"
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
          className="absolute top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all hover:bg-black/80 border border-white/10 shadow-lg active:scale-90"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      {/* Badge indicateur */}
      <div className="absolute bottom-4 left-4 z-20 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm pointer-events-none border border-white/5 uppercase tracking-wider">
        Video
      </div>
    </div>
  );
};

export default VideoPost;