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
          // ✅ ÉTAPE 1 : On vérifie si la vidéo a un attribut "src" valide et n'est pas vide (readyState > 0)
          // Si le "src" a été retiré par le cleanup du composant, on avorte pour éviter le crash.
          if (!videoElement.src || videoElement.src === window.location.href || videoElement.readyState === 0) {
            return;
          }

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
              
              // ✅ ÉTAPE 2 : On revérifie la source avant le deuxième play de secours
              if (videoElement.src && videoElement.src !== window.location.href && videoElement.readyState > 0) {
                videoElement.play().catch(fallbackError => {
                  console.warn(
                    "La lecture en mode muet a échoué ou a été interrompue (ex: scroll trop rapide) :", 
                    fallbackError.message
                  );
                });
              }
            });
          }
        } else {
          // Mise en pause quand on scrolle et que la vidéo sort de l'écran
          if (videoElement.src && videoElement.src !== window.location.href && videoElement.readyState > 0) {
            videoElement.pause();
          }
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