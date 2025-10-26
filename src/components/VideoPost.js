import React, { useRef, useState } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true); 

  // Hook pour la lecture/pause au défilement
  useAutoplayOnVisible(videoRef, 0.5); 

  // La fonction handleClick est conservée pour le clic Play/Pause et le démutage
  const handleClick = (e) => {
    const video = videoRef.current;
    if (video) {
      
      // La vérification e.target.closest('div[controls]') est complexe en React.
      // Le plus simple est de laisser le Play/Pause s'appliquer MAIS de gérer le mute.
      
      if (video.paused) {
video.play().catch(error => console.warn("Erreur de lecture:", error));
      } else {
        video.pause();
      }

      // UX Améliorée : Si l'utilisateur clique, cela signifie qu'il veut interagir,
      // donc on peut supposer qu'il veut le son s'il est muet.
      if (isMuted) {
          setIsMuted(false);
          // Le DOM sera mis à jour via le setMuted dans le render suivant.
      }
    }
  };
  
  // Note: Nous n'avons pas besoin de toggleMute car les contrôles natifs gèrent le son.

  return (
    <div className={cn("relative overflow-hidden", className)}> 
 <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover block rounded-2xl" 
        loop 
        // L'état 'isMuted' contrôle le statut muet
        muted={isMuted} 
        playsInline 
        
        // CONFLICTUEL MAIS MAINTENU : Gère le Play/Pause au clic n'importe où
        onClick={handleClick}
        
        // CONTRÔLES NATIFS : Affiche la barre de progression
        controls 
      >
        Votre navigateur ne supporte pas la balise vidéo.
      </video>
      
      {/* Nous avons retiré le bouton de son personnalisé pour éviter le triple contrôle du volume. */}
 </div>
  );
};

export default VideoPost;
