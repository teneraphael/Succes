import React, { useRef, useState } from 'react';
import useAutoplayOnVisible from '../hooks/useAutoplayOnVisible'; 
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from 'lucide-react'; 

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true); 
  const [progress, setProgress] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false); // AJOUT pour indiquer l'état

  // Hook pour la lecture/pause au défilement
  useAutoplayOnVisible(videoRef, 0.5); 

  // Mise à jour de l'état de lecture/pause au clic
  const handleClick = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        // Tente de jouer
        video.play().then(() => setIsPlaying(true)).catch(error => {
          console.warn("Lecture impossible après clic (problème de média ou de permission):", error);
 });
      } else {
        // Met en pause
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation(); 
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (videoRef.current) {
        videoRef.current.muted = newMutedState;
    }
  };

  // Mise à jour de la progression
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration > 0) { // Vérifie que la durée est valide
      const newProgress = (video.currentTime / video.duration) * 100;
      setProgress(newProgress);
    }
};

  // Gestion de l'avancement/recul par clic sur la barre
  const handleProgressClick = (e) => {
    e.stopPropagation(); // Évite de mettre la vidéo en pause/lecture
    const video = videoRef.current;

    if (video && video.duration > 0) {
      // Calculer la position du clic
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      // Calculer le pourcentage du clic
      const percent = clickX / rect.width;
      
      // Définir le nouveau temps de lecture
      video.currentTime = video.duration * percent;
    }
  };

  // Met à jour l'état de lecture si un événement se produit sur la vidéo
  const handleVideoEvents = (event) => {
      if (event.type === 'play') {
          setIsPlaying(true);
      } else if (event.type === 'pause') {
          setIsPlaying(false);
      }
 }

  return (
    // 1. Le conteneur prend la taille définie par 'className' et est 'relative'
    <div className={cn("relative overflow-hidden", className)}> 
      <video
        ref={videoRef}
        src={src}
        // La vidéo prend 100% de la taille du parent
        className="w-full h-full object-cover block" 
        loop 
        muted={isMuted} 
        playsInline 
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate} // Met à jour la progression
        onPlay={handleVideoEvents}    // Met à jour l'état (isPlaying)
        onPause={handleVideoEvents}   // Met à jour l'état (isPlaying)
      >
        Votre navigateur ne supporte pas la balise vidéo.
      </video>
 {/* 2. Le Bouton de Son (toujours visible) */}
      <button 
        onClick={toggleMute} 
        className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full transition-opacity hover:bg-opacity-75"
      >
        {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
      </button>

      {/* 3. La Barre de Progression (au bas) */}
      <div 
        onClick={handleProgressClick} 
        // Positionné en bas (bottom-0)
        className="absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-30 cursor-pointer"
      >
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear" // Couleur blanche pour un look épuré (comme TikTok)
          style={{ width: `${progress}%` }} 
        />
      </div>

 </div>
  );
};

export default VideoPost;
