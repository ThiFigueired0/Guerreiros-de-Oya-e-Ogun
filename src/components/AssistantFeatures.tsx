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
        "group flex items-center justify-center p-0 rounded-[20px] transition-all duration-300 relative overflow-hidden",
        "w-14 h-14 bg-[#0f172a]",
        "shadow-[0_8px_16px_rgba(0,0,0,0.4),0_0_20px_rgba(212,175,55,0.2)] ring-[0.5px] ring-[#D4AF37]/50"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <motion.div 
        animate={{ 
          boxShadow: ['0 0 0px rgba(212,175,55,0)', '0 0 20px rgba(212,175,55,0.4)', '0 0 0px rgba(212,175,55,0)'] 
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-[20px]"
      />
      <div className="relative z-10 text-[#D4AF37] group-hover:text-white transition-colors duration-300">
        <Bot className="w-6 h-6" />
      </div>
      <div className="absolute inset-0 border border-[#D4AF37]/20 rounded-[20px] group-hover:border-[#D4AF37]/60 transition-colors duration-300" />
    </motion.button>
  );
};

export const AssistantWrapper = () => {
    const { showAssistantModal, setShowAssistantModal, isScrolled } = useAssistant();

    return (
        <>
            <AnimatePresence>
                {showAssistantModal && <AssistantModal />}
            </AnimatePresence>
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed bottom-24 right-5 z-[9999]"
                >
                  <AssistantButton onClick={() => { setShowAssistantModal(true); console.log("AssistantButton clicado da navbar flutuante"); }} />
                </motion.div>
              )}
            </AnimatePresence>
        </>
    );
};
