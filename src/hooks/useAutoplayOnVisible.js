import { useEffect } from 'react';

const useAutoplayOnVisible = (videoRef, threshold = 0.5) => {
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // 1. Force le mode muet (indispensable pour l'autoplay sur la plupart des navigateurs)
    videoElement.muted = true;
    videoElement.playsInline = true;

    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 2. On vérifie que la vidéo est prête à être lue
          if (videoElement.readyState >= 2) { 
            videoElement.play().catch(error => {
              // Souvent bloqué si aucune interaction utilisateur préalable
              console.warn("Autoplay bloqué par le navigateur:", error);
            });
          }
        } else {
          videoElement.pause();
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      root: null, 
      rootMargin: '0px',
      threshold: threshold, 
    });

    observer.observe(videoElement);

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [videoRef, threshold]);
};

export default useAutoplayOnVisible;