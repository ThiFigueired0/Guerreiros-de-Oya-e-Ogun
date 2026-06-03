import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';

import AssistantModal from './AssistantModal';

export const AssistantButton = ({ onClick }: { onClick: () => void }) => {
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  const controls = useAnimation();
  const [isReady, setIsReady] = useState(false);

  // Layout-aware snapping helper
  const getSnapCoords = (currentX: number, currentY: number) => {
    if (typeof window === 'undefined') return { x: currentX, y: currentY };
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // The central container width is capped at 512px (max-w-lg) on screens wider than 512px
    const isDesktop = width > 512;
    const containerWidth = isDesktop ? 512 : width;
    const containerLeft = isDesktop ? (width - 512) / 2 : 0;
    const containerRight = containerLeft + containerWidth;
    
    // Determine closest side
    const isLeft = currentX < (containerLeft + containerWidth / 2);
    const buttonWidth = 48; // w-12
    const margin = 0; // Stuck ("grudado") to the side edge
    
    const x = isLeft
      ? (isDesktop ? containerLeft + margin : margin)
      : (isDesktop ? containerRight - buttonWidth - margin : width - buttonWidth - margin);
    
    // Clamp Y position with generous margins to avoid overlaying system menus/header
    const y = Math.max(90, Math.min(height - 130, currentY));
    
    return { x, y };
  };

  // Initialize position to the bottom-right of the active container by default
  const [coords, setCoords] = useState(() => {
    try {
      const saved = localStorage.getItem('assistant_coords_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Use fallback default coordinates
    }
    
    const width = typeof window !== 'undefined' ? window.innerWidth : 320;
    const height = typeof window !== 'undefined' ? window.innerHeight : 568;
    const isDesktop = width > 512;
    const containerRight = isDesktop ? (width + 512) / 2 : width;
    const buttonWidth = 48;
    const margin = 0;
    
    const defaultX = containerRight - buttonWidth - margin;
    const defaultY = height * 0.75;
    return { x: defaultX, y: defaultY };
  });

  // Clamp coordinates when viewport resizes to ensure it doesn't get lost off-screen
  useEffect(() => {
    const handleResize = () => {
      setCoords(current => {
        return getSnapCoords(current.x, current.y);
      });
    };

    window.addEventListener('resize', handleResize);
    // Align on mount
    handleResize();
    setIsReady(true);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Framer Motion coordinates whenever coords changes
  useEffect(() => {
    if (isReady) {
      controls.set({ x: coords.x, y: coords.y });
    }
  }, [coords, controls, isReady]);

  const handleDragEnd = (event: any, info: any) => {
    const finalCoords = getSnapCoords(info.point.x, info.point.y);
    setCoords(finalCoords);
    localStorage.setItem('assistant_coords_v2', JSON.stringify(finalCoords));
    
    controls.start({
      x: finalCoords.x,
      y: finalCoords.y,
      transition: { type: 'spring', stiffness: 350, damping: 25 }
    });
  };

  if (!isReady) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      animate={controls}
      onDragEnd={handleDragEnd}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 999999, // Super high z-index to fly over candles and all visual content layers
        touchAction: 'none'
      }}
      className="cursor-grab active:cursor-grabbing flex flex-col items-center justify-center group"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center p-0 rounded-full transition-all duration-300 relative overflow-hidden",
          "w-12 h-12 backdrop-blur-md", 
          settings.darkMode 
            ? "bg-black/60 border border-white/20" 
            : "bg-white/30 hover:bg-white/40",
          "shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(212,175,55,0.3)] ring-[1.5px] ring-[#D4AF37]/60"
        )}
      >
        {/* Subtle hover pattern or border glowing */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <motion.div 
          animate={{ 
            boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 20px rgba(212,175,55,0.5)', '0 0 0px rgba(212,175,55,0)'] 
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full z-0"
        />
        
        {/* Drag visual clue inside button on hover */}
        <div className="relative z-10 text-[#D4AF37] group-hover:text-white transition-colors duration-300 flex flex-col items-center justify-center">
          <Bot className="w-5.5 h-5.5" />
        </div>
        <div className="absolute inset-0 border border-[#D4AF37]/30 rounded-full group-hover:border-[#D4AF37]/70 transition-colors duration-300 pointer-events-none" />
      </motion.button>

      {/* Tiny side helper indicating drag capability on hover */}
      <span className="absolute -bottom-6 text-[8px] tracking-[0.2em] uppercase font-bold text-brand-gold/80 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
        Arraste
      </span>
    </motion.div>
  );
};

export const AssistantWrapper = () => {
    const { showAssistantModal } = useAssistant();

    return (
        <>
            <AnimatePresence>
                {showAssistantModal && <AssistantModal />}
            </AnimatePresence>
        </>
    );
};
