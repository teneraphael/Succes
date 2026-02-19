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
}

const VideoPost = ({ src, className, style, setIsGlobalPlaying }: VideoPostProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useAutoplayOnVisible(videoRef, 0.5); 

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMuted((prev) => !prev);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className={cn("relative group overflow-hidden bg-black flex items-center justify-center w-full h-full", className)}>
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain block cursor-pointer"
        style={style}
        loop 
        muted={isMuted} 
        playsInline 
        onClick={handleVideoClick}
        preload="metadata"
        crossOrigin="anonymous"
        onWaiting={() => setIsLoading(true)}
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
      </video>

      {/* 1. Chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10">
          <Loader2 className="size-10 animate-spin text-white/80" />
        </div>
      )}

      {/* 2. Overlay Pause */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
          <Play className="size-12 text-white/50 fill-current" />
        </div>
      )}

      {/* 3. BOUTON MUTE EN HAUT À DROITE */}
      <button
        onClick={toggleMute}
        type="button"
        // On le place à top-4 pour l'aligner avec le badge VIDEO de gauche
        // Si tu as l'indicateur "1/2", on peut mettre right-14 pour les décaler
        className="absolute top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all hover:bg-black/80 active:scale-90 border border-white/10 shadow-xl"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* 4. Badge VIDEO (En haut à gauche) */}
      <div className="absolute top-4 left-4 z-20 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm pointer-events-none border border-white/5">
        VIDEO
      </div>
    </div>
  );
};

export default VideoPost;