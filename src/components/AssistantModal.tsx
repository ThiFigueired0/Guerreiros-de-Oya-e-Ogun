import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, User, Send, RotateCcw, X, Mic, Paperclip, Camera, Volume2, Pause, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import { DEFAULT_ASSISTANT_AVATAR } from '../types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartSuggestions } from './SmartSuggestions';
import { transcribeAudio, generateSpeech, analyzeImage, extractTextFromPdf } from '../services/aiService';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

// (Removido quickActions fixos, será usado SmartSuggestions no seu lugar no JSX)

const TypewriterMarkdown = ({ content, onComplete }: { content: string, onComplete?: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState('');

  useEffect(() => {
    setDisplayedContent('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.length - 1) {
        setDisplayedContent(prev => prev + content.charAt(i));
        i++;
      } else {
        setDisplayedContent(content);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content, onComplete]);

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

const parseContent = (content: string) => {
  let mainContent = content;
  let suggestions: string[] = [];
  
  const tagStart = '<sugestoes>';
  const tagEnd = '</sugestoes>';
  const startIndex = content.indexOf(tagStart);
  
  if (startIndex !== -1) {
    mainContent = content.substring(0, startIndex).trim();
    const suggestBlock = content.substring(startIndex + tagStart.length);
    
    const endIndex = suggestBlock.indexOf(tagEnd);
    const rawSuggestions = endIndex !== -1 ? suggestBlock.substring(0, endIndex) : suggestBlock;
    
    suggestions = rawSuggestions
      .split('\n')
      .map(s => s.trim().replace(/^[-*]\s*/, ''))
      .filter(s => s.length > 0);
  }
  
  return { mainContent, suggestions };
};

const MessageAudioButton = ({ text, isComplete }: { text: string; isComplete: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClick = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    if (isPlaying && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const audioBlob = await generateSpeech(text);
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      console.warn("Hugging Face TTS falhou ou não está configurado, usando Web Speech API nativa como fallback.");
      if ('speechSynthesis' in window) {
        const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'pt-BR';
        
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.includes('pt'));
        if (ptVoice) {
          utterance.voice = ptVoice;
        }
        
        utterance.onend = () => setIsPlaying(false);
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isComplete) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={isPlaying ? "Pausar" : "Ouvir"}
      className="p-1.5 rounded-full hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-all focus:outline-none disabled:opacity-50 self-start mt-1 flex-shrink-0"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
};

const shouldShowDownloadButton = (content: string) => {
  const cleanContent = content.replace(/<sugestoes>[\s\S]*<\/sugestoes>/g, '');
  const listMatches = (cleanContent.match(/^[-*]\s/gm) || []).length;
  const numberMatches = (cleanContent.match(/^\d+\.\s/gm) || []).length;
  const hasKeywords = /(receita|cronograma|guia|passo a passo|ingredientes|banho de)/i.test(cleanContent);
  return listMatches >= 3 || numberMatches >= 3 || hasKeywords;
};

const DownloadPdfButton = ({ content }: { content: string }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        doc.setFont("helvetica");

        const cleanContent = content
           .replace(/<sugestoes>[\s\S]*<\/sugestoes>/g, '')
           .replace(/[#*]/g, '')
           .split('\n');

        let yOffset = 20;
        doc.setFontSize(16);
        doc.setTextColor(212, 175, 55); // Gold title
        doc.text("Documento - Mini Chefinho", 20, yOffset);
        yOffset += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);

        const pageHeight = doc.internal.pageSize.height;

        cleanContent.forEach(line => {
           if (line.trim() === '') {
               yOffset += 4;
               return;
           }
           const splitText = doc.splitTextToSize(line, 170);
           splitText.forEach((textLine: string) => {
              if (yOffset > pageHeight - 20) {
                 doc.addPage();
                 yOffset = 20;
              }
              doc.text(textLine, 20, yOffset);
              yOffset += 7;
           });
        });

        doc.save("documento-mini-chefinho.pdf");
      } catch (e) {
        console.error("Erro ao gerar PDF:", e);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B49020] hover:brightness-110 active:scale-95 text-black rounded-xl font-medium text-[13px] tracking-tight transition-all shadow-[0_4px_10px_rgba(212,175,55,0.2)] focus:outline-none self-start"
    >
      {isGenerating ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Download className="w-[18px] h-[18px]" />}
      Baixar Documento (PDF)
    </button>
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
    const [isChatStarted, setIsChatStarted] = useState(messages.length > 1);
    const [isTyping, setIsTyping] = useState(false);
    
    // Áudio e Anexos
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    
    const [attachments, setAttachments] = useState<{file: File, type: 'image' | 'pdf'}[]>([]);
    const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setIsChatStarted(messages.length > 1);
    }, [messages.length]);
    
    // When a request is loading, we are about to type soon, so optionally clear or set typing.
    // Setting isTyping(true) when loading ensures that suggestions are hidden.
    useEffect(() => {
      if (isChatLoading) {
         setIsTyping(true);
         if (currentAudioRef.current) {
           currentAudioRef.current.pause();
           currentAudioRef.current = null;
         }
      }
    }, [isChatLoading]);

    useEffect(() => {
      if (!showAssistantModal && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    }, [showAssistantModal]);
    
    const assistantAvatarRef = useRef<HTMLInputElement>(null);
    const userAvatarRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isAutoScrollEnabledRef = useRef(true);

    const handleMicClick = async () => {
      // Pause any ongoing TTS audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      if (isRecording) {
        // Stop recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } else {
        // Start recording
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // Pare os tracks do microfone (libera as permissões visuais e lock)
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);

            if (audioBlob.size > 0) {
              setIsTranscribing(true);
              try {
                const text = await transcribeAudio(audioBlob);
                if (text && text.trim().length > 0) {
                  setIsChatStarted(true);
                  handleChatSend(text);
                }
              } catch (error) {
                console.error("Transcription errored:", error);
              } finally {
                setIsTranscribing(false);
              }
            }
          };

          mediaRecorder.start();
          setIsRecording(true);
        } catch (error) {
          console.error("Could not start recording:", error);
        }
      }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      // If user scrolls up more than 100px from the bottom, pause auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      isAutoScrollEnabledRef.current = isAtBottom;
    };

    const handleTypingComplete = (text: string) => {
      setIsTyping(false);
    };

    const processAndSendChat = async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;
      
      let contextPrefix = "";
      
      if (attachments.length > 0) {
        setIsProcessingAttachments(true);
        try {
          for (const att of attachments) {
             if (att.type === 'image') {
                const desc = await analyzeImage(att.file);
                contextPrefix += `[O usuário anexou uma imagem que contém: ${desc}]\n`;
             } else if (att.type === 'pdf') {
                const pdfText = await extractTextFromPdf(att.file);
                contextPrefix += `[Conteúdo do PDF anexado: ${pdfText}]\n`;
             }
          }
        } catch (e) {
          console.error("Erro ao extrair anexos:", e);
          contextPrefix += `[O usuário tentou anexar arquivos, mas houve um erro técnico ao lê-los.]\n`;
        } finally {
          setIsProcessingAttachments(false);
        }
      }
      
      const finalMsg = contextPrefix + text;
      
      setIsChatStarted(true);
      setAttachments([]);
      handleChatSend(finalMsg);
    };

    useEffect(() => {
        if (isAutoScrollEnabledRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isChatLoading]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      let timeoutId: NodeJS.Timeout;
      
      const observer = new MutationObserver(() => {
        if (isAutoScrollEnabledRef.current) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => {
          observer.disconnect();
          clearTimeout(timeoutId);
      };
    }, []);
    
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
              className="relative w-full lg:max-w-3xl h-[85dvh] lg:h-[80vh] bg-[#0f172a]/90 backdrop-blur-[16px] rounded-t-[24px] lg:rounded-[24px] flex flex-col shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] border-[0.5px] border-white/10 border-t-[#D4AF37] font-sans tracking-[-0.02em] overflow-hidden"
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
              
              <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto mt-6 mb-4 px-6 relative scrollbar-hide"
              >
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

                  {messages.map((m, i) => {
                    const isAssistant = m.role === 'assistant';
                    const { mainContent, suggestions } = isAssistant ? parseContent(m.content) : { mainContent: m.content, suggestions: [] };

                    return (
                    <div key={i} className={cn("flex flex-col gap-2 w-full", m.role === 'user' ? "items-end" : "items-start")}>
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
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
                          "px-4 py-3 rounded-[20px] overflow-hidden backdrop-blur-md relative z-10 w-full flex flex-col gap-3",
                          m.role === 'assistant' 
                            ? "bg-[#f1f5f9]/95 text-[#0f172a] rounded-tl-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" 
                            : "bg-gradient-to-br from-[#D4AF37] to-[#B49020] text-black rounded-tr-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                        )}>
                          {m.role === 'assistant' ? (
                            <div className="prose prose-sm prose-p:leading-relaxed prose-headings:text-[#0f172a] prose-headings:font-[600] prose-a:text-[#D4AF37] prose-strong:text-[#0f172a] prose-strong:font-[600] max-w-none text-[#0f172a] font-sans tracking-[-0.02em] prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-code:text-[#D4AF37] prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-[400] prose-code:rounded">
                              {i === messages.length - 1 ? (
                                  <TypewriterMarkdown 
                                    content={mainContent} 
                                    onComplete={() => handleTypingComplete(mainContent)} 
                                  />
                              ) : (
                                  <Markdown remarkPlugins={[remarkGfm]}>{mainContent}</Markdown>
                              )}
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                          )}
                          {m.role === 'assistant' && (
                            <div className="self-end mt-1 -mb-2 w-full flex flex-col">
                              {shouldShowDownloadButton(mainContent) && (i !== messages.length - 1 || (!isTyping && !isChatLoading)) && (
                                <DownloadPdfButton content={mainContent} />
                              )}
                              <div className="self-end mt-1">
                                <MessageAudioButton text={mainContent} isComplete={i !== messages.length - 1 || (!isTyping && !isChatLoading)} />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {isAssistant && suggestions.length > 0 && i === messages.length - 1 && !isChatLoading && !isTyping && !chatInput.trim() && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                          className="flex flex-wrap gap-2 mt-1 ml-11 pl-1 max-w-[85%]"
                        >
                          {suggestions.map((s, idx) => (
                            <button 
                               key={idx} 
                               onClick={() => {
                                  setIsChatStarted(true);
                                  handleChatSend(s);
                               }}
                               className="px-3 py-1.5 bg-[#0f172a]/70 hover:bg-[#0f172a] text-[12px] font-sans text-white/90 font-medium rounded-[12px] border-[0.5px] border-[#D4AF37]/40 hover:border-[#D4AF37]/80 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)] transition-all duration-300 focus:outline-none text-left"
                            >
                              {s}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                    );
                  })}
                  
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
              
              {(!isChatStarted && !isChatLoading) && (
                <div className="pb-2 px-6 shrink-0 flex flex-col gap-1.5 relative z-10 w-full">
                  <SmartSuggestions onSuggestionClick={(suggestion) => {
                    handleChatSend(suggestion);
                    setIsChatStarted(true);
                  }} />
                </div>
              )}
              
              <div className="pb-[max(1rem,env(safe-area-inset-bottom))] px-6 shrink-0 flex flex-col gap-1.5 relative z-10">
                
                {attachments.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 w-full overflow-x-auto scrollbar-hide">
                     {attachments.map((att, idx) => (
                        <div key={idx} className="relative shrink-0 flex items-center gap-2 bg-[#000000]/40 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 shadow-sm">
                           {att.type === 'image' ? <Camera className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Paperclip className="w-3.5 h-3.5 text-[#D4AF37]" />}
                           <span className="text-[12px] font-sans font-medium text-white/90 truncate max-w-[120px]">{att.file.name}</span>
                           <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="ml-1 text-white/50 hover:text-red-400 focus:outline-none">
                             <X className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     ))}
                  </div>
                )}
                
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
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={pdfInputRef} 
                      accept=".pdf" 
                      onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                             setAttachments(prev => [...prev, { file: e.target.files![0], type: 'pdf' }]);
                         }
                      }} 
                    />
                    <button onClick={() => pdfInputRef.current?.click()} className="p-2 mb-1 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Anexar PDF">
                      <Paperclip className="w-[18px] h-[18px]" />
                    </button>
                    
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={imageInputRef} 
                      accept="image/*" 
                      onChange={(e) => {
                         if (e.target.files && e.target.files[0]) {
                             setAttachments(prev => [...prev, { file: e.target.files![0], type: 'image' }]);
                         }
                      }} 
                    />
                    <button onClick={() => imageInputRef.current?.click()} className="p-2 mb-1 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Câmera / Imagem">
                      <Camera className="w-[18px] h-[18px]" />
                    </button>
                    <textarea 
                      value={chatInput} 
                      onChange={e => {
                        setChatInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          processAndSendChat(chatInput);
                          e.currentTarget.style.height = 'auto';
                        }
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={isRecording || isTranscribing || isProcessingAttachments}
                      placeholder={isRecording ? "Gravando áudio..." : isTranscribing ? "Transcrevendo..." : isProcessingAttachments ? "Processando anexos..." : "Pergunte ao Mini Chefinho..."}
                      className="flex-1 bg-transparent px-2 py-3 min-h-[44px] max-h-[120px] resize-none text-[15px] leading-tight font-sans font-[400] tracking-[-0.02em] text-white placeholder-white/30 focus:outline-none caret-[#D4AF37] scrollbar-hide flex items-center justify-center align-middle"
                      rows={1}
                    />
                    <div className="flex items-center gap-1 shrink-0 pr-1 mb-1">
                      <button 
                        onClick={handleMicClick}
                        disabled={isTranscribing}
                        className={cn(
                          "p-2 transition-all rounded-full focus:outline-none relative",
                          isRecording 
                            ? "text-[#D4AF37]" 
                            : isTranscribing ? "text-white/30 cursor-not-allowed" : "text-white/50 hover:text-[#D4AF37]"
                        )} 
                        title="Mensagem de voz"
                      >
                        <Mic className={cn("w-[18px] h-[18px]", isRecording && "animate-pulse")} />
                        {isRecording && (
                          <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] rounded-full bg-red-500 animate-pulse" />
                        )}
                      </button>
                      <button
                        onClick={() => processAndSendChat(chatInput)}
                        disabled={!chatInput.trim() && attachments.length === 0}
                        className={cn(
                          "flex items-center justify-center transition-all duration-300 p-2 rounded-full",
                          (chatInput.trim() || attachments.length > 0) 
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

