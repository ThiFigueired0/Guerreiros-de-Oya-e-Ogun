import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import { lazy, Suspense } from 'react';

const AssistantModal = lazy(() => import('./AssistantModal'));

export const AssistantButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center p-0 rounded-full transition-all duration-300 relative overflow-hidden",
        "w-12 h-12 bg-gradient-to-b from-[#001c38] to-[#000a14]",
        "shadow-[0_10px_15px_rgba(37,99,235,0.2)] ring-1 ring-white/30"
      )}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent" />
      <div className="relative z-10 text-white" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
        <Bot className="w-6 h-6" />
      </div>
    </motion.button>
  );
};

export const AssistantWrapper = () => {
    const { setShowAssistantModal, isScrolled } = useAssistant();
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <>
            {isLoaded && (
               <Suspense fallback={null}>
                  <AssistantModal />
               </Suspense>
            )}
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed bottom-24 right-5 z-[500]"
                >
                  <AssistantButton onClick={() => { setIsLoaded(true); setShowAssistantModal(true); }} />
                </motion.div>
              )}
            </AnimatePresence>
        </>
    );
};
