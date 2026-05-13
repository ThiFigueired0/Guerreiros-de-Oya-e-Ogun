import React from 'react';
import { motion } from 'framer-motion';
import { Bot, X, User, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';

const AssistantModal = () => {
    const { 
        showAssistantModal, setShowAssistantModal, 
        messages, isChatLoading, chatInput, setChatInput, handleChatSend,
        userAvatar, assistantAvatar, setUserAvatar, setAssistantAvatar,
        handleAvatarChange
    } = useAssistant();
    const assistantAvatarRef = React.useRef<HTMLInputElement>(null);
    const userAvatarRef = React.useRef<HTMLInputElement>(null);
    
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssistantModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[80vh] bg-[#F2F4F7] rounded-t-[30px] p-6 flex flex-col shadow-[0_-5px_15px_rgba(0,0,0,0.1)]"
            >
              <div className="w-16 h-1.5 bg-brand-gold rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative group cursor-pointer" onClick={() => assistantAvatarRef.current?.click()}>
                    <div className="w-12 h-12 rounded-full border-2 border-brand-gold overflow-hidden bg-white flex items-center justify-center">
                      {assistantAvatar 
                        ? <img src={assistantAvatar} className="w-full h-full object-cover" /> 
                        : <Bot className="w-6 h-6 text-brand-gold" />
                      }
                    </div>
                    <input type="file" ref={assistantAvatarRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, setAssistantAvatar)} />
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#2D3436] tracking-wide">
                    Mini <span className="text-brand-gold">Chefinho</span>
                  </h3>
                </div>
                <button onClick={() => setShowAssistantModal(false)} className="p-1 border border-brand-gold rounded-full text-brand-gold hover:bg-brand-gold/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto mb-6 space-y-6">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-start gap-3 text-sm max-w-[85%] relative",
                      m.role === 'user' ? "flex-row-reverse self-end" : "self-start"
                    )}
                  >
                     <div className="w-8 h-8 rounded-full border border-brand-gold overflow-hidden shrink-0 flex items-center justify-center bg-white cursor-pointer" onClick={() => m.role === 'user' && userAvatarRef.current?.click()}>
                         {m.role === 'assistant' ? (
                            assistantAvatar ? <img src={assistantAvatar} className="w-full h-full object-cover" /> : <Bot className="w-4 h-4 text-brand-gold" />
                         ) : (
                             userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-gray-500" />
                         )}
                     </div>
                     {m.role === 'user' && <input type="file" ref={userAvatarRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, setUserAvatar)} />}
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm",
                      m.role === 'assistant' 
                        ? "bg-white text-[#2D3436]" 
                        : "bg-[#E3E8EE] text-[#2D3436]"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))}
            </div>
            <div className="pb-2">
                <div className="flex items-center gap-2">
                  <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && handleChatSend(chatInput)}
                    placeholder="Como posso te ajudar hoje, Chefinho?" 
                    className="flex-1 bg-transparent p-2 text-sm text-[#2D3436] placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleChatSend(chatInput)}
                    disabled={!chatInput.trim()}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      chatInput.trim() ? "bg-brand-gold text-white shadow-lg shadow-brand-gold/20" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
        </div>
    );
};

export default AssistantModal;
