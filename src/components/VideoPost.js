'use client';

import React, { useRef, useState } from 'react';


export default function VideoPost({ src }) {
  const videoRef = useRef(null);
  const [started, setStarted] = useState(false);

  const startVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.play().catch(() => {});
    setStarted(true);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        className="w-full"
        controls={started}
      />

      {!started && (
        <button
          onClick={startVideo}
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xl"
        >
          ▶️ Play
        </button>
      )}
    </div>
  );
}