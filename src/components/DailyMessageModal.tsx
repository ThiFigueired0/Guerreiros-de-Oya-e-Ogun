import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface DailyMessageModalProps {
  content: string;
  onClose: () => void;
}

export const DailyMessageModal: React.FC<DailyMessageModalProps> = ({ content, onClose }) => {
  const [revealed, setRevealed] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20]);
    }
  };

  const handleReveal = () => {
    triggerHaptic();
    setRevealed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Intense Blur Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
      />

      {/* The Luxury Card Wrapper */}
      <motion.div
        className="relative w-[85%] max-w-sm"
        animate={revealed ? { rotateY: 360, scale: 1.05 } : { rotateY: 0, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.div
          className="bg-gradient-to-br from-[#000814] to-[#001D3D] rounded-[30px] border-[0.5px] border-[#C5A059] shadow-2xl p-8 overflow-hidden relative"
        >
          {/* Subtle Flash Effect on Reveal */}
          {revealed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-[#C5A059]/20"
            />
          )}

          {/* Minimalist Bronze Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-[#C5A059] hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6 font-thin" strokeWidth={1} />
          </button>

          <AnimatePresence mode="wait">
            {!revealed ? (
              /* Locked State */
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleReveal}
                className="flex flex-col items-center justify-center py-16 cursor-pointer"
              >
                <div className="relative mb-8">
                  <div className="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-[#C5A059]/30" />
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-[#C5A059]/30" />
                  <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}><Sparkles className="w-12 h-12 text-[#C5A059]" strokeWidth={1} /></motion.div>
                </div>
                <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="text-white/80 text-sm font-light tracking-widest text-center uppercase">Toque para despertar sua força</motion.p>
              </motion.div>
            ) : (
              /* Revealed State */
              <motion.div
                key="revealed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col items-center py-4 relative"
              >
                {/* Subtle Quote Mark Background */}
                <span className="absolute -top-10 -left-6 text-[#C5A059] text-[120px] font-serif opacity-5">"</span>
                
                <h3 className="font-serif text-[#C5A059] text-xl font-bold tracking-[0.2em] uppercase text-center mb-8 z-10">
                  A PALAVRA DE HOJE
                </h3>
                
                <div className="w-full bg-white/5 backdrop-blur-sm rounded-[24px] p-6 border border-white/10 z-10">
                  <p className="font-sans text-[#FDFCF0] text-base leading-relaxed tracking-[0.5px] text-center italic">
                    {content}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
