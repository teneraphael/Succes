"use client";
import Zoom from 'react-medium-image-zoom';
// @ts-ignore
import 'react-medium-image-zoom/dist/styles.css';
import Image from 'next/image';

export default function ZoomableImage({ src, alt, className, fill, priority, size }: any) {
  return (
    <Zoom>
      {fill ? (
        <Image src={src} alt={alt} fill priority={priority} className={className} />
      ) : (
        <Image src={src} alt={alt} width={size} height={size} className={className} />
      )}
    </Zoom>
  );
}