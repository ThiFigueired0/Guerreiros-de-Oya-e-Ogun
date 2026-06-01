import React from 'react';
import { motion } from 'framer-motion';

export function StarryNightBg() {
  const stars = React.useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5; // From 0.5px to 2.5px
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const baseOpacity = 0.3 + Math.random() * 0.7;
      
      // Some stars twinkle more than others, some are static
      const isTwinkling = Math.random() > 0.4;
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * -5;
      
      return {
        id: i,
        size,
        left: `${left}%`,
        top: `${top}%`,
        baseOpacity,
        isTwinkling,
        duration,
        delay,
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            opacity: star.baseOpacity,
            boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
          }}
          animate={
            star.isTwinkling
              ? {
                  opacity: [star.baseOpacity * 0.3, star.baseOpacity, star.baseOpacity * 0.3],
                  scale: [1, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
