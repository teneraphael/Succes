import { useEffect } from 'react';

const useAutoplayOnVisible = (videoRef, threshold = 0.5) => {
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Configuration essentielle pour mobile
    videoElement.playsInline = true;

    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // On tente de lancer la vidéo
          const playPromise = videoElement.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              /**
               * Si l'autoplay avec son est bloqué par le navigateur :
               * On force le mode muet pour que la vidéo puisse AU MOINS tourner visuellement.
               */
              console.warn("Autoplay avec son bloqué, passage en muet auto.");
              videoElement.muted = true;
              videoElement.play();
            });
          }
        } else {
          // Mise en pause quand on scrolle et que la vidéo sort de l'écran
          videoElement.pause();
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      threshold: threshold, // 0.5 signifie que 50% de la vidéo doit être visible
    });

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
    };
  }, [videoRef, threshold]);
};

export default useAutoplayOnVisible;