import { useEffect } from 'react';

const useAutoplayOnVisible = (videoRef, threshold = 0.5, userInteracted = false) => {
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const callback = (entries) => {
      const entry = entries[0];
      if (userInteracted) return; // stop si l'utilisateur a cliqué

      if (entry.isIntersecting) {
        videoElement.play().catch(error => {
          console.warn("Lecture auto impossible:", error);
        });
      } else {
        videoElement.pause();
      }
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: threshold,
    });

    observer.observe(videoElement);

    return () => {
      observer.unobserve(videoElement);
    };
  }, [videoRef, threshold, userInteracted]);
};

export default useAutoplayOnVisible;
