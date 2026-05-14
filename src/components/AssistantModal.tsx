import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, User, Send, RotateCcw, X, Mic, Paperclip, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const quickActions = [
  "📋 Resumir",
  "🕒 São Paulo",
  "📚 Biblioteca"
];

const TypewriterMarkdown = ({ content }: { content: string }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.length-1) {
        setDisplayedContent(prev => prev + content.charAt(i));
        i++;
      } else {
        setDisplayedContent(content);
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content]);

  return <Markdown remarkPlugins={[remarkGfm]}>{displayedContent}</Markdown>;
};

const LeafAnimation = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="leaf-particle"
                    style={{
                        '--duration': `${25 + Math.random() * 20}s`,
                        '--delay': `${Math.random() * 15}s`,
                        '--left': `${Math.random() * 100}%`
                    } as React.CSSProperties}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 opacity-80">
                        <path d="M17 8C17 8 21 0 12 0C3 0 7 8 7 8C7 8 3 16 12 24C21 16 17 8 17 8Z" />
                    </svg>
                </div>
            ))}
        </div>
    );
};

const AssistantModal = () => {
    const { 
        showAssistantModal, setShowAssistantModal, 
        messages, isChatLoading, chatInput, setChatInput, handleChatSend,
        userAvatar, assistantAvatar, setUserAvatar, setAssistantAvatar,
        handleAvatarChange, clearChat
    } = useAssistant();
    
    const [isFocused, setIsFocused] = useState(false);
    const assistantAvatarRef = useRef<HTMLInputElement>(null);
    const userAvatarRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatLoading]);
    
    return (
        <AnimatePresence>
        {showAssistantModal && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end lg:items-center lg:justify-center p-0 lg:p-6 pb-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssistantModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowAssistantModal(false);
                }
              }}
              className="relative w-full lg:max-w-3xl h-[85vh] lg:h-[80vh] bg-[#0f172a]/90 backdrop-blur-[16px] rounded-t-[24px] lg:rounded-[24px] flex flex-col shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] border-[0.5px] border-white/10 border-t-[#D4AF37] font-sans tracking-[-0.02em] overflow-hidden"
            >
              <div className="bg-[#070a13]/95 backdrop-blur-[15px] border-b-[0.5px] border-white/5 px-6 py-3.5 flex flex-col shrink-0 relative z-10 group/header">
                <motion.div 
                  whileHover={{ opacity: 0.7 }}
                  whileTap={{ opacity: 0.5 }}
                  onClick={() => setShowAssistantModal(false)}
                  className="w-12 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)] rounded-full mx-auto mb-3 cursor-pointer lg:hidden" 
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer" onClick={() => assistantAvatarRef.current?.click()}>
                      <div className="w-8 h-8 rounded-full border-[0.5px] border-[#D4AF37]/30 overflow-hidden bg-gradient-to-tr from-[#D4AF37]/10 to-transparent flex items-center justify-center relative shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                        <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse" />
                        {assistantAvatar 
                          ? <img src={assistantAvatar} className="w-full h-full object-cover relative z-10" /> 
                          : <Bot className="w-4 h-4 text-[#D4AF37] relative z-10" />
                        }
                      </div>
                      <input type="file" ref={assistantAvatarRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, setAssistantAvatar)} />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-sans font-[600] text-[#D4AF37] tracking-[-0.02em] flex items-center gap-2 leading-none">
                        Mini Chefinho
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] text-[#64748b] tracking-wide font-medium leading-none flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80 animate-pulse shadow-[0_0_6px_rgba(212,175,55,0.4)]" />
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300">
                    <button onClick={clearChat} title="Limpar Chat" className="p-2 bg-transparent rounded-full text-white/30 hover:text-white/80 hover:bg-white/5 transition-all focus:outline-none">
                      <RotateCcw className="w-[14px] h-[14px]" />
                    </button>
                    <button onClick={() => setShowAssistantModal(false)} title="Fechar" className="p-2 bg-transparent rounded-full text-white/30 hover:text-white/80 hover:bg-white/5 hover:text-red-400 transition-all focus:outline-none">
                      <X className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                </div>
              </div>
              
              <LeafAnimation />
              
              <div className="flex-1 overflow-y-auto mt-6 mb-4 space-y-6 scrollbar-hide px-6 relative">
                {messages.map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    key={i} 
                    className={cn(
                      "flex items-start gap-4 text-[15px] max-w-[90%] relative font-sans",
                      m.role === 'user' ? "flex-row-reverse self-end" : "self-start"
                    )}
                  >
                     {m.role === 'assistant' && (
                       <div className="w-8 h-8 rounded-full border-[0.5px] border-[#D4AF37]/30 bg-[#0f172a] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)]">
                           {assistantAvatar ? <img src={assistantAvatar} className="w-full h-full object-cover" /> : <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />}
                       </div>
                     )}
                    <div className={cn(
                      "px-[16px] py-[12px] rounded-[24px] overflow-hidden backdrop-blur-md relative z-10",
                      m.role === 'assistant' 
                        ? "bg-[#f1f5f9]/95 text-[#0f172a] rounded-bl-[4px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" 
                        : "bg-[#1e293b]/95 text-white rounded-br-[4px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                    )}>
                      {m.role === 'assistant' ? (
                        <div className="prose prose-sm prose-p:leading-relaxed prose-headings:text-[#0f172a] prose-headings:font-[600] prose-a:text-[#D4AF37] prose-strong:text-[#0f172a] prose-strong:font-[600] max-w-none text-[#0f172a] font-sans tracking-[-0.02em] prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-code:text-[#D4AF37] prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-[400] prose-code:rounded">
                          {i === messages.length - 1 ? (
                              <TypewriterMarkdown content={m.content} />
                          ) : (
                              <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                          )}
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isChatLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-start gap-4 text-[15px] max-w-[85%] relative self-start font-sans"
                  >
                     <div className="w-8 h-8 rounded-full border-[0.5px] border-[#D4AF37]/30 bg-[#0f172a] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] relative z-10">
                         {assistantAvatar ? <img src={assistantAvatar} className="w-full h-full object-cover" /> : <Bot className="w-3.5 h-3.5 text-[#D4AF37]" />}
                     </div>
                     <div className="px-[16px] py-[12px] rounded-[24px] bg-[#f1f5f9]/95 text-[#0f172a] rounded-bl-[4px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col gap-3 min-w-[150px] backdrop-blur-md relative z-10">
                         <span className="text-[11px] text-[#0f172a]/60 flex items-center gap-2 tracking-wide font-medium">
                           ⚡ Processando...
                         </span>
                         <div className="w-full h-[2px] overflow-hidden bg-[#0f172a]/10 rounded-full">
                           <motion.div 
                             className="w-[40%] h-full bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent rounded-full"
                             animate={{ x: ["-100%", "250%"] }}
                             transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                           />
                         </div>
                     </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="pb-4 px-6 shrink-0 flex flex-col gap-1.5 relative z-10">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
                  {quickActions.map(action => (
                     <button 
                       key={action}
                       onClick={() => handleChatSend(action)}
                       className="shrink-0 px-[12px] py-[8px] bg-[#0f172a]/50 hover:bg-[#D4AF37]/10 text-[13px] font-sans text-[#D4AF37] font-[500] rounded-[20px] border-[0.5px] border-[#D4AF37]/60 transition-all duration-300 focus:outline-none"
                     >
                       {action}
                     </button>
                  ))}
                </div>
                
                <div 
                  className={cn(
                    "flex items-center gap-3 relative transition-all duration-300",
                    isFocused ? "pb-2" : "pb-0"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-1 flex-1 bg-[#070a13]/90 border-[0.5px] rounded-full transition-all duration-300 px-2 py-1 shadow-inner",
                    isFocused ? "border-white/20 bg-[#070a13]" : "border-white/5"
                  )}>
                    <button className="p-2 text-white/40 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Anexar arquivo">
                      <Paperclip className="w-[18px] h-[18px]" />
                    </button>
                    <button className="p-2 text-white/40 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Câmera">
                      <Camera className="w-[18px] h-[18px]" />
                    </button>
                    <input 
                      value={chatInput} 
                      onChange={e => setChatInput(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && handleChatSend(chatInput)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Mensagem..." 
                      className="flex-1 bg-transparent px-2 py-2.5 text-[15px] font-sans font-[400] tracking-[-0.02em] text-white placeholder-white/30 focus:outline-none caret-white"
                    />
                    <div className="flex items-center gap-1 shrink-0 pr-1">
                      <button className="p-2 text-white/40 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none" title="Mensagem de voz">
                        <Mic className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleChatSend(chatInput)}
                        disabled={!chatInput.trim()}
                        className={cn(
                          "flex items-center justify-center transition-all duration-300 p-2 rounded-full",
                          chatInput.trim() 
                            ? "text-[#D4AF37] hover:scale-110" 
                            : "text-[#D4AF37]/30 cursor-not-allowed"
                        )}
                      >
                        <Send className="w-[18px] h-[18px] -ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
        </div>
        )}
        </AnimatePresence>
    );
};

export default AssistantModal;

