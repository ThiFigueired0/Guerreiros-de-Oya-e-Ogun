import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Exclusão",
  message = "Esta ação não pode ser desfeita. Deseja continuar?"
}) => {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: [],
    eventNames: [],
    pushNotifications: false
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[2001] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto",
                settings.darkMode && "bg-[#1A1A1A] border border-gray-800"
              )}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className={cn(
                  "text-xl font-black mb-3",
                  settings.darkMode ? "text-white" : "text-brand-navy"
                )}>
                  {title}
                </h3>
                <p className={cn(
                  "text-sm leading-relaxed mb-8",
                  settings.darkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {message}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className={cn(
                      "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
                      settings.darkMode ? "bg-white/5 text-white" : "bg-gray-100 text-brand-navy"
                    )}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
