import { useEffect } from 'react';

const useAutoplayOnVisible = (videoRef, threshold = 0.5) => {
  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videoElement.play().catch(error => {
            console.warn("Lecture auto impossible:", error);
          });
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
