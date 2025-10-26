import { useEffect } from 'react';

const useAutoplayOnVisible = (videoRef, threshold = 0.5) => {
  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    // 1. Définir le Callback de l'Observateur
    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Si au moins 50% de la vidéo est visible
          videoElement.play().catch(error => {
            // Gérer les erreurs de lecture (ex: si l'utilisateur désactive le son)
            console.warn("Lecture auto impossible:", error);
          });
        } else {
          // Si la vidéo sort de la zone visible
          videoElement.pause();
        }
 });
    };

    // 2. Créer l'Intersection Observer
    const observer = new IntersectionObserver(callback, {
      root: null, // utilise le viewport (la fenêtre) comme zone de référence
      rootMargin: '0px',
      threshold: threshold, // Déclenchement quand 'threshold' pour cent est visible
    });

    // 3. Observer l'élément vidéo
    observer.observe(videoElement);

    // 4. Nettoyage : arrêter l'observation quand le composant est démonté
    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [videoRef, threshold]);
};
export default useAutoplayOnVisible;
