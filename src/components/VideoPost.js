import React, { useRef, useState, useEffect } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // Lecture automatique quand visible
  useAutoplayOnVisible(videoRef, 0.5);

  // Quand isMuted change, appliquer directement au DOM
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleClick = () => {
    const video = videoRef.current;
    if (!video) return;

    // Toggle Play/Pause
    if (video.paused) {
      video
        .play()
        .catch((err) => console.warn("Erreur auto-play :", err));
    } else {
      video.pause();
    }

    // Si l’utilisateur clique → il veut entendre
    if (isMuted) setIsMuted(false);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover block"
        loop
        playsInline
        muted={isMuted}   // rendu React
        controls          // pas de conflit maintenant
        onClick={handleClick}
      >
        Votre navigateur ne supporte pas la vidéo.
      </video>
    </div>
  );
};

export default VideoPost;
