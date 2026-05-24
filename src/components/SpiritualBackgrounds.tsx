import React from 'react';
import { motion } from 'framer-motion';

export const EtherealEnergyBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      
      {/* Abstract Golden Mandala - Rotates almost imperceptibly */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center opacity-[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 250, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 800 800" className="w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] max-w-[800px] max-h-[800px] text-[#CAA472]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Thin lines abstract mandala pattern */}
          <circle cx="400" cy="400" r="380" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" />
          <circle cx="400" cy="400" r="220" stroke="currentColor" strokeWidth="2" opacity="0.5" />
          
          {Array.from({ length: 24 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 15} 400 400)`}>
              <path d="M 400 20 L 415 100 L 400 380 L 385 100 Z" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="400" cy="150" r="20" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 400 130 C 430 80, 480 80, 400 20 C 320 80, 370 80, 400 130" stroke="currentColor" strokeWidth="0.5" />
            </g>
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={`inner-${i}`} transform={`rotate(${i * 30} 400 400)`}>
              <path d="M 400 180 L 420 250 L 400 400 L 380 250 Z" stroke="currentColor" strokeWidth="1" opacity="0.7" />
            </g>
          ))}
          <circle cx="400" cy="400" r="100" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="400" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </motion.div>

      {/* Flowing Energy Orbs - Axé/Spiritual Energy */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full bg-brand-gold/10 blur-[120px] mix-blend-screen"
        animate={{
          x: ['-20%', '20%', '-10%', '-20%'],
          y: ['-20%', '10%', '20%', '-20%'],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '-10%', left: '-10%' }}
      />
      
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full bg-brand-copper/10 blur-[100px] mix-blend-screen"
        animate={{
          x: ['20%', '-20%', '10%', '20%'],
          y: ['20%', '-10%', '-20%', '20%'],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        style={{ bottom: '-10%', right: '-10%' }}
      />

      <motion.div
        className="absolute w-[50vw] h-[50vw] rounded-full bg-[#1e3a8a]/20 blur-[100px] mix-blend-screen"
        animate={{
          x: ['0%', '30%', '-30%', '0%'],
          y: ['30%', '0%', '-30%', '30%'],
          scale: [0.8, 1.1, 1.4, 0.8],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ top: '30%', left: '20%' }}
      />

      {/* Floating Sparkles / Fireflies (Ancestral Spirits) */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, -100 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            delay: Math.random() * 20,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
