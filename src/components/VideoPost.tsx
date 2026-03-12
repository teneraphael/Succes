"use client";

import React, { useRef, useState, useEffect } from 'react';
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
  
  const [isMuted, setIsMuted] = useState(forcedMuted !== undefined ? false : true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // 1. GESTION DE LA VISIBILITÉ DE L'ONGLET (ARRÊT QUAND ON QUITTE)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Synchronisation du Mute global
    const handleGlobalMuteChange = (e: any) => {
      setIsMuted(e.detail.muted);
    };
    window.addEventListener(MUTE_EVENT, handleGlobalMuteChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(MUTE_EVENT, handleGlobalMuteChange);
      // Sécurité : on met en pause si le composant est démonté
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  // Lecture auto quand visible
  useAutoplayOnVisible(videoRef, 0.5); 

  // Volume et Mixage
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (forcedMuted) {
        video.muted = false; 
        video.volume = 0.25; 
      } else {
        video.muted = isMuted;
        video.volume = 1.0;
      }
    }
  }, [forcedMuted, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    const event = new CustomEvent(MUTE_EVENT, { detail: { muted: newMutedState } });
    window.dispatchEvent(event);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => console.error("Play blocked:", err)); 
    } else {
      video.pause();
    }
  };

  return (
    <div className={cn("relative group overflow-hidden bg-black flex items-center justify-center w-full h-full", className)}>
      
      <video
        ref={videoRef}
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
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" /> 
        Ton navigateur ne supporte pas la lecture de vidéos.
      </video>

      {/* Loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
          <Loader2 className="size-10 animate-spin text-white/80" />
        </div>
      )}

      {/* Overlay Pause */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
          <Play className="size-12 text-white/50 fill-current" />
        </div>
      )}

      {/* Bouton Mute */}
      {!forcedMuted && (
        <button
          onClick={toggleMute}
          type="button"
          className="absolute top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all hover:bg-black/80 border border-white/10 shadow-lg active:scale-90"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      <div className="absolute bottom-4 left-4 z-20 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm pointer-events-none border border-white/5 uppercase tracking-wider">
        Video
      </div>
    </div>
  );
};

export default VideoPost;