import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_TEMPLO_LOGO_IMG } from '../types';

interface LogoMediaProps {
  src: string;
  className?: string;
  alt?: string;
  animate?: boolean;
}

export function LogoMedia({ src, className = "w-full h-full object-cover rounded-full", alt = "Logo Templo", animate = false }: LogoMediaProps) {
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!src) return null;

  const isVideo = src.includes('.mp4') && !videoError;
  const finalImgSrc = src.includes('.mp4') ? DEFAULT_TEMPLO_LOGO_IMG : src;

  if (isVideo) {
    return (
      <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black leading-[0] select-none pointer-events-none">
        {/* Crisp static image acts as the instant-render base */}
        <img
          src={finalImgSrc}
          alt={alt}
          className={`${className} absolute inset-0 z-10 transition-opacity duration-700 ${
            isPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          loading="eager"
        />

        {/* The video renders smoothly over it, fading in only when active playback begins */}
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onPlay={() => {
            // A tiny timeout makes sure the video frames are decoded before fading out the poster image
            setTimeout(() => setIsPlaying(true), 150);
          }}
          onError={() => {
            console.warn('Video logo failed to load, switching completely to static fallback.');
            setVideoError(true);
          }}
          className={`${className} absolute inset-0 z-20 transition-opacity duration-1000 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  }

  if (animate) {
    return (
      <motion.img
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        src={finalImgSrc}
        alt={alt}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <img
      src={finalImgSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
