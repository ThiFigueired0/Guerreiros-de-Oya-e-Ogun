import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';

import AssistantModal from './AssistantModal';

export const AssistantButton = ({ onClick, className }: { onClick: () => void, className?: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px -5px rgba(212,175,55,0.4)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      animate={{ boxShadow: ["0 0 10px rgba(212,175,55,0.2)", "0 0 20px rgba(212,175,55,0.6)", "0 0 10px rgba(212,175,55,0.2)"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-[16px] bg-gradient-to-r from-[#001a33] to-[#003366] border border-[#D4AF37] shadow-lg",
        className
      )}
    >
      <motion.div 
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bot className="w-5 h-5 text-[#D4AF37]" />
      </motion.div>
      <span className="text-white text-xs font-semibold whitespace-nowrap font-sans font-[600]">Assistente Virtual</span>
    </motion.div>
  );
};

export const AssistantWrapper = () => {
    const { showAssistantModal } = useAssistant();

    return (
        <AnimatePresence>
            {showAssistantModal && <AssistantModal />}
        </AnimatePresence>
    );
};
