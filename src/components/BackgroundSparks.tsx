import React from 'react';
import { motion } from 'framer-motion';

export function BackgroundSparks() {
  const sparks = React.useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const size = 1 + Math.random() * 3.5;
      const initialLeft = Math.random() * 100;
      const initialTop = Math.random() * 100; // Evenly distributed across the container height
      
      // Determine color palette: fire, orange, copper, gold, amber
      const randColor = Math.random();
      let color: string;
      let shadowColor: string;
      
      if (randColor < 0.25) {
        color = '#f97316'; // orange-500
        shadowColor = 'rgba(249, 115, 22, 0.6)';
      } else if (randColor < 0.5) {
        color = '#eab308'; // gold / yellow-500
        shadowColor = 'rgba(234, 179, 8, 0.6)';
      } else if (randColor < 0.7) {
        color = '#ef4444'; // red-500
        shadowColor = 'rgba(239, 68, 68, 0.6)';
      } else if (randColor < 0.85) {
        color = '#f59e0b'; // amber-500
        shadowColor = 'rgba(245, 158, 11, 0.6)';
      } else {
        color = '#b45309'; // copper
        shadowColor = 'rgba(180, 83, 9, 0.6)';
      }

      return {
        id: i,
        size,
        color,
        shadowColor,
        left: `${initialLeft}%`,
        top: `${initialTop}%`,
        duration: 7 + Math.random() * 10,
        delay: Math.random() * -12, // Pre-stabilize movement distribution
        swayX: (Math.random() - 0.5) * 60,
        floatY: -200 - Math.random() * 300,
        opacity: 0.15 + Math.random() * 0.45,
      };
    });
  }, []);

  return (
    <div className="absolute inset-x-0 top-[84px] bottom-0 overflow-hidden pointer-events-none z-0">
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute rounded-full"
          style={{
            width: spark.size,
            height: spark.size,
            backgroundColor: spark.color,
            boxShadow: `0 0 8px ${spark.shadowColor}, 0 0 16px ${spark.shadowColor}`,
            left: spark.left,
            top: spark.top,
          }}
          animate={{
            y: [0, spark.floatY],
            x: [0, spark.swayX, spark.swayX * -0.5, spark.swayX * 0.5],
            opacity: [0, spark.opacity, spark.opacity * 0.5, 0],
            scale: [0.6, 1.2, 0.8, 0.4],
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            delay: spark.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
