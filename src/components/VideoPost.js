import React, { useRef, useState, useEffect } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Loader2, Play } from "lucide-react";

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Hook pour la lecture/pause au défilement
  useAutoplayOnVisible(videoRef, 0.5); 

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className={cn("relative group overflow-hidden bg-black flex items-center justify-center", className)}>
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain block cursor-pointer"
        loop 
        muted={isMuted} 
        playsInline 
        onClick={handleVideoClick}
        preload="metadata"
        crossOrigin="anonymous"
        onWaiting={() => setIsLoading(true)} // Se déclenche si la vidéo bufférise
        onPlaying={() => {
          setIsLoading(false);
          setIsPaused(false);
        }}
        onPause={() => setIsPaused(true)}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" /> {/* Support iPhone natif */}
      </video>

      {/* 1. Indicateur de chargement (Spinner) */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <Loader2 className="size-10 animate-spin text-white/80" />
        </div>
      )}

      {/* 2. Overlay Pause (Affiche un bouton Play quand la vidéo est stoppée) */}
      {isPaused && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <Play className="size-12 text-white/50 fill-current" />
        </div>
      )}

      {/* 3. Bouton Mute/Unmute Personnalisé */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-90"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* 4. Badge "VIDEO" pour l'accessibilité */}
      <div className="absolute top-4 left-4 z-20 rounded-md bg-black/40 px-2 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm pointer-events-none">
        MP4 / 512MB MAX
      </div>
    </div>
  );
};

export default VideoPost;