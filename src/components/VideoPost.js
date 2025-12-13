'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

const VideoPost = ({ src, className }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Autoplay DESKTOP uniquement
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile) return;

    video.play().catch(() => {});
  }, []);

  const handleClick = () => {
    const video = videoRef.current;
    if (!video) return;

    setUserInteracted(true);
    video.muted = false;
    setIsMuted(false);

    video.play().catch(() => {});
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        playsInline
        loop
        preload="metadata"
        onClick={handleClick}
        className="w-full h-full object-cover"
        controls
      />
    </div>
  );
};

export default VideoPost;
