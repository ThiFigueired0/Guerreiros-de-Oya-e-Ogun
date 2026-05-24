import React from 'react';
import { motion } from 'framer-motion';

export function AnimatedLeaves() {
  const leaves = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      size: 15 + Math.random() * 20,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * -20,
      opacity: 0.15 + Math.random() * 0.25,
      pathX: Math.random() * 200 - 100,
      pathY: Math.random() * 150 - 75,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          initial={{ opacity: 0, x: leaf.left, y: leaf.top, rotate: leaf.rotate, scale: leaf.scale }}
          animate={{ 
            y: [`${leaf.top}`, `calc(${leaf.top} + ${leaf.pathY}px)`],
            x: [`${leaf.left}`, `calc(${leaf.left} + ${leaf.pathX}px)`],
            rotate: leaf.rotate + 360,
            opacity: [0, leaf.opacity, leaf.opacity, 0]
          }}
          transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: 'linear' }}
        >
          <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none" className="text-brand-gold drop-shadow-md">
            <path d="M12 2C7.5 2 4 5.5 4 10C4 14.5 7.5 18 12 22C16.5 18 20 14.5 20 10C20 5.5 16.5 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
