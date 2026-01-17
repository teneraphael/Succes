import React, { useRef, useState } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true); 

  // Hook pour la lecture/pause au défilement
  useAutoplayOnVisible(videoRef, 0.5); 

  const handleClick = (e) => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(error => console.warn("Erreur de lecture:", error));
      } else {
        video.pause();
      }

      if (isMuted) {
          setIsMuted(false);
      }
    }
  };

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}> 
      <video
        ref={videoRef}
        className="w-full h-full object-cover block" 
        loop 
        muted={isMuted} 
        playsInline 
        onClick={handleClick}
        controls 
        preload="metadata"
        // Ajout de crossOrigin pour aider le chargement PC depuis des serveurs tiers
        crossOrigin="anonymous" 
      >
        {/* Correction MIME : On spécifie le type mp4 pour le navigateur PC */}
        <source src={src} type="video/mp4" />
        {/* Alternative pour les formats enregistrés sur Android/Samsung/iPhone */}
        <source src={src} type="video/webm" /> 
        Votre navigateur ne supporte pas la balise vidéo.
      </video>
    </div>
  );
};

export default VideoPost;