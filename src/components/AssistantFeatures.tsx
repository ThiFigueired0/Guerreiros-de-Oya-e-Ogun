import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';

import AssistantModal from './AssistantModal';

export const AssistantButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-center p-0 rounded-full transition-all duration-300 relative overflow-hidden",
        "w-10 h-10 glimmer-panel",
        "bg-gradient-to-r from-[#0f172a] via-[#1a2e4d] to-[#0f172a] bg-[length:200%_auto] animate-[shimmerBackground_4s_linear_infinite]",
        "shadow-[0_8px_16px_rgba(0,0,0,0.6),0_0_30px_rgba(212,175,55,0.4)] ring-[1px] ring-[#D4AF37]/50"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div 
        animate={{ 
          boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 15px rgba(212,175,55,0.4)', '0 0 0px rgba(212,175,55,0)'] 
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full z-0"
      />
      <div className="relative z-10 text-[#D4AF37] group-hover:text-white transition-colors duration-300 flex items-center justify-center">
        <Bot className="w-5 h-5" />
      </div>
      <div className="absolute inset-0 border border-[#D4AF37]/20 rounded-full group-hover:border-[#D4AF37]/60 transition-colors duration-300 pointer-events-none" />
    </motion.button>
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
