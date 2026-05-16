import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, User, Send, RotateCcw, X, Mic, Paperclip, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import { DEFAULT_ASSISTANT_AVATAR } from '../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartSuggestions } from './SmartSuggestions';

// (Removido quickActions fixos, será usado SmartSuggestions no seu lugar no JSX)

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group cursor-pointer" onClick={() => assistantAvatarRef.current?.click()}>
                      <div className="w-14 h-14 rounded-full border-[1.5px] border-[#D4AF37] overflow-hidden bg-gradient-to-tr from-[#D4AF37]/10 to-transparent flex items-center justify-center relative shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-transform group-hover:scale-105">
                        <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse" />
                        {(assistantAvatar || DEFAULT_ASSISTANT_AVATAR) 
                          ? <img src={assistantAvatar || DEFAULT_ASSISTANT_AVATAR} className="w-full h-full object-cover relative z-10" /> 
                          : <Bot className="w-7 h-7 text-[#D4AF37] relative z-10" />
                        }
                        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <input type="file" ref={assistantAvatarRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, setAssistantAvatar)} />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-sans font-[600] text-[#D4AF37] tracking-[-0.02em] flex items-center gap-2 leading-none">
                        Mini Chefinho
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-[#64748b] tracking-wide font-medium leading-none flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/80 animate-pulse shadow-[0_0_6px_rgba(212,175,55,0.4)]" />
                          Online
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-100 transition-opacity duration-300">
                    <div className="relative group cursor-pointer mr-2" onClick={() => userAvatarRef.current?.click()}>
                      <div className="w-10 h-10 rounded-full border-[1px] border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37] to-[#B49020] overflow-hidden flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-105">
                        {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover relative z-10" /> : <User className="w-5 h-5 text-black/80 relative z-10" />}
                        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <input type="file" ref={userAvatarRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, setUserAvatar)} />
                    </div>
                    <button onClick={clearChat} title="Limpar Chat" className="p-2 bg-transparent rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all focus:outline-none">
                      <RotateCcw className="w-[18px] h-[18px]" />
                    </button>
                    <button onClick={() => setShowAssistantModal(false)} title="Minimizar" className="p-2 bg-transparent rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all focus:outline-none">
                      <ChevronDown className="w-[22px] h-[22px]" />
                    </button>
                  </div>
                </div>
              </div>
              
              <LeafAnimation />
              
              <div className="flex-1 overflow-y-auto mt-6 mb-4 px-6 relative scrollbar-hide">
                <div className="space-y-6">
                  {messages.length === 0 && !isChatLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center text-center mt-10"
                    >
                      <div className="w-20 h-20 rounded-full border border-[#D4AF37]/20 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative">
                        <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 animate-pulse" />
                        <Bot className="w-10 h-10 text-[#D4AF37] relative z-10" />
                      </div>
                      <h2 className="text-2xl font-sans font-bold text-white mb-2 tracking-tight">O que vamos fazer hoje?</h2>
                      <p className="text-[#94a3b8] text-sm max-w-[280px] leading-relaxed">
                        Sou o Mini Chefinho, seu assistente terreiro. Posso te ajudar com dúvidas, horários, banhos, e muito mais.
                      </p>
                    </motion.div>
                  )}

                  {messages.map((m, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      key={i} 
                      className={cn(
                        "flex items-start gap-2.5 text-[14px] lg:text-[15px] max-w-[95%] lg:max-w-[85%] relative font-sans",
                        m.role === 'user' ? "flex-row-reverse self-end ml-auto" : "self-start"
                      )}
                    >
                       {m.role === 'assistant' && (
                         <div className="w-8 h-8 rounded-full border-[1.5px] border-[#D4AF37] bg-[#0f172a] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] mt-1">
                             {(assistantAvatar || DEFAULT_ASSISTANT_AVATAR) ? <img src={assistantAvatar || DEFAULT_ASSISTANT_AVATAR} className="w-full h-full object-cover" /> : <Bot className="w-4 h-4 text-[#D4AF37]" />}
                         </div>
                       )}
                       {m.role === 'user' && (
                         <div className="w-8 h-8 rounded-full border-[1.5px] border-[#D4AF37]/50 bg-gradient-to-br from-[#D4AF37] to-[#B49020] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] mt-1">
                             {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-black/80" />}
                         </div>
                       )}
                      <div className={cn(
                        "px-4 py-3 rounded-[20px] overflow-hidden backdrop-blur-md relative z-10 w-full",
                        m.role === 'assistant' 
                          ? "bg-[#f1f5f9]/95 text-[#0f172a] rounded-tl-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" 
                          : "bg-gradient-to-br from-[#D4AF37] to-[#B49020] text-black rounded-tr-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
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
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isChatLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-start gap-2.5 text-[14px] lg:text-[15px] max-w-[95%] lg:max-w-[85%] relative self-start font-sans"
                    >
                       <div className="w-8 h-8 rounded-full border-[1.5px] border-[#D4AF37] bg-[#0f172a] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.2)] relative z-10 mt-1">
                           {(assistantAvatar || DEFAULT_ASSISTANT_AVATAR) ? <img src={assistantAvatar || DEFAULT_ASSISTANT_AVATAR} className="w-full h-full object-cover" /> : <Bot className="w-4 h-4 text-[#D4AF37]" />}
                       </div>
                       <div className="px-4 py-3 rounded-[20px] bg-[#f1f5f9]/95 text-[#0f172a] rounded-tl-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-center min-h-[44px] backdrop-blur-md relative z-10">
                           <div className="flex items-center gap-1.5 h-full pt-1">
                               <motion.div className="w-2 h-2 rounded-full bg-[#0f172a]/40" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} />
                               <motion.div className="w-2 h-2 rounded-full bg-[#0f172a]/40" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} />
                               <motion.div className="w-2 h-2 rounded-full bg-[#0f172a]/40" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} />
                           </div>
                       </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} className="h-2" />
                </div>
              </div>
              
              <div className="pb-4 px-6 shrink-0 flex flex-col gap-1.5 relative z-10">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide px-1">
                  <SmartSuggestions onSuggestionClick={handleChatSend} />
                </div>
                
                <div 
                  className={cn(
                    "flex items-end gap-3 relative transition-all duration-300",
                    isFocused ? "pb-2" : "pb-0"
                  )}
                >
                  <div className={cn(
                    "flex items-end gap-1 flex-1 bg-[#070a13]/90 border-[0.5px] rounded-2xl transition-all duration-300 px-2 py-1 shadow-inner",
                    isFocused ? "border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.05)] bg-[#070a13]" : "border-white/10"
                  )}>
                    <button className="p-2 mb-1 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Anexar arquivo">
                      <Paperclip className="w-[18px] h-[18px]" />
                    </button>
                    <button className="p-2 mb-1 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Câmera">
                      <Camera className="w-[18px] h-[18px]" />
                    </button>
                    <textarea 
                      value={chatInput} 
                      onChange={e => {
                        setChatInput(e.target.value);
                        e.target.style.height = '44px';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatSend(chatInput);
                          e.currentTarget.style.height = '44px';
                        }
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Pergunte ao Mini Chefinho..." 
                      className="flex-1 bg-transparent px-2 py-[10px] mb-0.5 min-h-[44px] max-h-[120px] resize-none text-[15px] leading-snug font-sans font-[400] tracking-[-0.02em] text-white placeholder-white/30 focus:outline-none caret-[#D4AF37] scrollbar-hide"
                      rows={1}
                      style={{ height: '44px' }}
                    />
                    <div className="flex items-center gap-1 shrink-0 pr-1 mb-1">
                      <button className="p-2 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none" title="Mensagem de voz">
                        <Mic className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleChatSend(chatInput)}
                        disabled={!chatInput.trim()}
                        className={cn(
                          "flex items-center justify-center transition-all duration-300 p-2 rounded-full",
                          chatInput.trim() 
                            ? "bg-transparent text-[#D4AF37] hover:scale-105" 
                            : "bg-transparent text-white/50 cursor-not-allowed"
                        )}
                      >
                        <Send className="w-[18px] h-[18px]" />
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

