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

  // Gère la lecture auto quand le post est au milieu de l'écran
  useAutoplayOnVisible(videoRef, 0.5); 

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Force le rendu muet pour satisfaire les politiques de sécurité navigateurs
      video.muted = isMuted;
      video.defaultMuted = true;
      
      // Si on débloque le son, on informe le composant parent (Post)
      if (!isMuted && !video.paused && setIsGlobalPlaying) {
        setIsGlobalPlaying(true);
      }
    }
  }, [isMuted, setIsGlobalPlaying]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMuted(prev => !prev);
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
        muted={true} 
        playsInline 
        onClick={handleVideoClick}
        // CHANGEMENT CLÉ : metadata au lieu de auto pour éviter AbortError
        preload="metadata" 
        crossOrigin="anonymous"
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPaused(false);
          // Si la vidéo joue avec du son, on coupe l'audio de fond du Post
          if (!isMuted && setIsGlobalPlaying) setIsGlobalPlaying(true);
        }}
        onPause={() => {
          setIsPaused(true);
          if (!isMuted && setIsGlobalPlaying) setIsGlobalPlaying(false);
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

      {/* Overlay Pause (apparaît brièvement ou si en pause) */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-10">
          <Play className="size-12 text-white/50 fill-current" />
        </div>
      )}

      {/* Bouton Mute - Positionné en haut pour éviter les conflits avec le texte en bas */}
      <button
        onClick={toggleMute}
        type="button"
        className="absolute top-4 right-4 z-50 rounded-full bg-black/60 p-2 text-white backdrop-blur-md transition-all hover:bg-black/80 border border-white/10 shadow-lg active:scale-90"
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className="absolute bottom-4 left-4 z-20 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm pointer-events-none border border-white/5 uppercase tracking-wider">
        Video
      </div>
    </div>
  );
};

export default VideoPost;