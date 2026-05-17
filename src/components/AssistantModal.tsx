import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, User, Send, RotateCcw, X, Mic, Paperclip, Camera, Volume2, Pause, Loader2, Copy, Check, Maximize, Minimize, Menu, Search, MessageSquare, Plus, Trash2, Shrink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAssistant } from '../lib/AssistantContext';
import { useAuth } from '../lib/AuthContext';
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
  const [hasAnimated, setHasAnimated] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (hasAnimated) {
      setDisplayedContent(content);
      return;
    }
    setDisplayedContent('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < content.length - 1) {
        setDisplayedContent(prev => prev + content.charAt(i));
        i++;
      } else {
        setDisplayedContent(content);
        setHasAnimated(true);
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [content, hasAnimated]);

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

const highlightEntities = (text: string) => {
  const entities = [
    'oxalá', 'iemanjá', 'oxum', 'ogum', 'xangô', 'iansã', 'oxóssi', 'obaluaiê', 'omulu', 'nanã', 'exu', 'pombagira', 'pomba gira', 'caboclo', 'preto velho', 'preta velha', 'erê', 'zé pelintra', 'oxumaré', 'logun edé', 'obá', 'ewa', 'ossain', 'iroko', 'zambi', 'olorun', 'umbanda', 'candomblé', 'olodumaré', 'olodumare', 'pretos velhos', 'guias', 'orixás', 'entidades', 'exu mirim', 'yemanjá', 'yansã', 'obaluaê'
  ];
  const sorted = Array.from(new Set(entities)).sort((a, b) => b.length - a.length);
  const r = new RegExp(`(?<=^|[^a-zA-ZÀ-ÿ\\*])(${sorted.join('|')})(?=[^a-zA-ZÀ-ÿ\\*]|$)`, 'gi');
  
  const urlRegex = /(http[s]?:\/\/[^\s)]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map(part => {
    if (part.startsWith('http')) return part;
    return part.replace(r, '**$1**');
  }).join('');
};

const parseContent = (content: string) => {
  let mainContent = content;
  let suggestions: string[] = [];
  
  const tagStart = '<sugestoes>';
  const tagEnd = '</sugestoes>';
  const startIndex = mainContent.indexOf(tagStart);
  
  if (startIndex !== -1) {
    const suggestBlock = mainContent.substring(startIndex + tagStart.length);
    mainContent = mainContent.substring(0, startIndex).trim();
    
    const endIndex = suggestBlock.indexOf(tagEnd);
    const rawSuggestions = endIndex !== -1 ? suggestBlock.substring(0, endIndex) : suggestBlock;
    
    suggestions = rawSuggestions
      .split('\n')
      .map(s => s.trim().replace(/^[-*]\s*/, ''))
      .filter(s => s.length > 0);
  }
  
  const hasPdfReady = /<pdf_ready\/>/gi.test(mainContent);
  mainContent = mainContent.replace(/<pdf_ready\/>/gi, '').trim();
  
  mainContent = highlightEntities(mainContent);
  
  return { mainContent, suggestions, hasPdfReady };
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
  return content.includes('<pdf_ready/>');
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

const SummarizeMessageButton = ({ onSummarize }: { onSummarize: () => void }) => {
  return (
    <button
      onClick={onSummarize}
      className="p-2 justify-center rounded-lg bg-[#e2e8f0]/40 hover:bg-[#cbd5e1]/60 text-[#475569] shadow-sm transition-all focus:outline-none flex items-center gap-1.5"
      title="Resumir (Modo Resumo)"
    >
      <Shrink className="w-[15px] h-[15px]" />
      <span className="text-[11px] font-medium hidden sm:inline-block">Resumir</span>
    </button>
  );
};

const CopyMessageButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-full bg-[#e2e8f0]/50 hover:bg-[#cbd5e1]/50 text-[#475569] shadow-sm transition-all focus:outline-none"
      title="Copiar texto"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
    </button>
  );
};

const PressableMessageWrapper = ({ text, children, disabled }: { text: string, children: React.ReactNode, disabled?: boolean }) => {
  const [showCopy, setShowCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    if (disabled) return;
    timerRef.current = setTimeout(() => {
      setShowCopy(true);
    }, 500); // 500ms for long press
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopy(false);
    }, 2000);
  };

  return (
    <div 
      className="relative w-full"
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={endPress}
      onPointerCancel={endPress}
      onContextMenu={(e) => {
        // Only show custom copy if it's on mobile/touch, or we don't want to prevent default completely.
        // Actually letting native context menu is fine, but we'll show our copy button too.
      }}
    >
      <AnimatePresence>
        {showCopy && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="text-[12px] font-medium">{copied ? "Copiado!" : "Copiar"}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

const AssistantModal = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { 
        showAssistantModal, setShowAssistantModal, 
        messages, isChatLoading, chatInput, setChatInput, handleChatSend,
        userAvatar, assistantAvatar, setUserAvatar, setAssistantAvatar,
        handleAvatarChange, clearChat,
        guestSelectedModel, setGuestSelectedModel,
        sessions, currentSessionId, setCurrentSessionId, createNewSession, setSessions, setMessages, isPipMode, setIsPipMode
    } = useAssistant();
    
    const [isFocused, setIsFocused] = useState(false);
    const [isChatStarted, setIsChatStarted] = useState(messages.length > 1);
    const [isTyping, setIsTyping] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Slash commands
    const [showCommandMenu, setShowCommandMenu] = useState(false);
    const [commandFilter, setCommandFilter] = useState('');
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const commandInputRef = useRef<HTMLTextAreaElement>(null);

    const SLASH_COMMANDS = [
      { cmd: '/ajuda', desc: 'O que o Mini Chefinho pode fazer por você' },
      { cmd: '/banho', desc: 'Criar uma receita de banho de ervas' },
      { cmd: '/ponto', desc: 'Buscar ou gerar um ponto cantado' },
      { cmd: '/agenda', desc: 'Saber dos próximos eventos do terreiro' },
      { cmd: '/fundamento', desc: 'Mergulhar em um fundamento espiritual' },
      { cmd: '/resumo', desc: 'Resumir a conversa atual' },
      { cmd: '/navegar', desc: 'Mudar de tela automaticamente' },
    ];

    const filteredCommands = SLASH_COMMANDS.filter(c => c.cmd.toLowerCase().includes(commandFilter.toLowerCase()));
    
    // Áudio e Anexos
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    
    const [attachments, setAttachments] = useState<{file: File, type: 'image' | 'pdf'}[]>([]);
    const [isProcessingAttachments, setIsProcessingAttachments] = useState(false);
    const [attachmentError, setAttachmentError] = useState<string | null>(null);
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

    const handleChatInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setChatInput(val);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;

      const words = val.split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord.startsWith('/')) {
        setShowCommandMenu(true);
        setCommandFilter(lastWord);
        setSelectedCommandIndex(0);
      } else {
        setShowCommandMenu(false);
      }
    };

    const handleCommandSelect = (cmd: string) => {
      const words = chatInput.split(' ');
      words.pop(); // Remove the partial command
      const newText = [...words, cmd, ''].join(' ');
      setChatInput(newText);
      setShowCommandMenu(false);
      if (commandInputRef.current) {
        commandInputRef.current.focus();
      }
    };

    const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showCommandMenu && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedCommandIndex(prev => (prev + 1) % filteredCommands.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          handleCommandSelect(filteredCommands[selectedCommandIndex].cmd);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowCommandMenu(false);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processAndSendChat(chatInput);
        e.currentTarget.style.height = 'auto';
      }
    };

    const processAndSendChat = async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;
      setAttachmentError(null);
      
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
          setAttachmentError("Não foi possível analisar o anexo no momento devido a uma instabilidade de conexão. Por favor, tente novamente ou descreva o conteúdo em texto.");
          setIsProcessingAttachments(false);
          return;
        }
        setIsProcessingAttachments(false);
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
        <>
        <AnimatePresence>
        {showAssistantModal && isPipMode && (
           <motion.div
              drag
              dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="fixed bottom-24 right-5 w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-[#D4AF37] overflow-hidden z-[99999] flex items-center justify-center bg-[#0f172a] cursor-pointer group"
              onClick={() => setIsPipMode(false)}
            >
               <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse" />
               {(assistantAvatar || DEFAULT_ASSISTANT_AVATAR) 
                  ? <img src={assistantAvatar || DEFAULT_ASSISTANT_AVATAR} className="w-full h-full object-cover relative z-10 pointer-events-none" /> 
                  : <Bot className="w-8 h-8 text-[#D4AF37] relative z-10 pointer-events-none" />
               }
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-20">
                  <Maximize className="w-6 h-6 text-white" />
               </div>
               <button 
                  onClick={(e) => { e.stopPropagation(); setShowAssistantModal(false); setIsPipMode(false); }} 
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-md"
               >
                  <X className="w-3 h-3" />
               </button>
            </motion.div>
        )}
        </AnimatePresence>
        <AnimatePresence>
        {showAssistantModal && (
        <div className={cn("fixed inset-0 z-[9999] flex flex-col justify-end lg:items-center lg:justify-center", isFullScreen ? "p-0" : "p-0 lg:p-6 pb-0", isPipMode ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-300")}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAssistantModal(false); setIsPipMode(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag={isFullScreen ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setShowAssistantModal(false);
                  setIsPipMode(false);
                }
              }}
              className={cn(
                "relative w-full bg-[#0f172a]/90 backdrop-blur-[16px] flex flex-row shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] border-[0.5px] border-white/10 border-t-[#D4AF37] font-sans tracking-[-0.02em] overflow-hidden transition-all duration-300",
                isFullScreen 
                  ? "max-w-none h-[100dvh] rounded-none border-x-0 border-b-0" 
                  : "lg:max-w-4xl h-[85dvh] lg:h-[80vh] rounded-t-[24px] lg:rounded-[24px]"
              )}
            >
              <AnimatePresence>
                {showSidebar && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 260, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex flex-col border-r border-white/10 bg-[#070a13]/95 shrink-0 overflow-hidden"
                  >
                    <div className="p-4 flex flex-col gap-4 h-full min-w-[260px]">
                      <button 
                        onClick={() => { createNewSession(); setShowSidebar(false); }}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] transition-colors border border-[#D4AF37]/30"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Novo Chat</span>
                      </button>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input 
                          type="text" 
                          placeholder="Buscar histórico..." 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1 -mx-2 px-2">
                        {sessions.filter((s:any) => s.title?.toLowerCase().includes(searchTerm.toLowerCase()) || s.messages?.some((m:any) => m.content?.toLowerCase().includes(searchTerm.toLowerCase()))).map((s:any) => (
                          <div 
                            key={s.id} 
                            onClick={() => { setCurrentSessionId(s.id); setShowSidebar(false); }}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors group",
                              currentSessionId === s.id ? "bg-white/10" : "hover:bg-white/5"
                            )}
                          >
                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                              <MessageSquare className="w-4 h-4 text-white/50 shrink-0" />
                              <span className="text-[13px] text-white/80 truncate">{s.title || 'Chat'}</span>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSessions(prev => prev.filter((sx:any) => sx.id !== s.id)); if(currentSessionId === s.id) createNewSession(); }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-red-400 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {sessions.length === 0 && (
                          <div className="text-center text-xs text-white/30 mt-4">Nenhum histórico salvo.</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col flex-1 min-w-0 h-full relative">
                <div className="bg-[#070a13]/95 backdrop-blur-[15px] border-b-[0.5px] border-white/5 px-6 py-3.5 flex flex-col shrink-0 relative z-10 group/header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors focus:outline-none"
                      >
                        <Menu className="w-5 h-5" />
                      </button>
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
                    {!user && (
                      <select 
                        value={guestSelectedModel}
                        onChange={(e) => setGuestSelectedModel(e.target.value)}
                        title="Selecione a API (Modo Guest)"
                        className="ml-3 bg-black/40 text-[10px] border border-brand-gold/30 rounded px-1.5 py-1 text-white/80 focus:outline-none focus:border-brand-gold max-w-[150px] truncate"
                      >
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Groq)</option>
                        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Groq)</option>
                        <option value="meta-llama/llama-3.3-70b-instruct:free">llama-3.3-70b-instruct (OpenRouter)</option>
                        <option value="deepseek/deepseek-v4-flash:free">deepseek-v4-flash (OpenRouter)</option>
                        <option value="google/gemma-4-31b-it:free">gemma-4-31b-it (OpenRouter)</option>
                      </select>
                    )}
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
                    <button onClick={() => setIsFullScreen(!isFullScreen)} title={isFullScreen ? "Restaurar tamanho" : "Tela cheia"} className="p-2 bg-transparent rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all focus:outline-none">
                      {isFullScreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
                    </button>
                    <button onClick={() => setIsPipMode(true)} title="Minimizar (PiP)" className="p-2 bg-transparent rounded-full text-white/50 hover:text-white hover:bg-white/5 transition-all focus:outline-none">
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
                    const { mainContent, suggestions, hasPdfReady } = isAssistant ? parseContent(m.content) : { mainContent: m.content, suggestions: [], hasPdfReady: false };

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
                        <PressableMessageWrapper text={m.role === 'assistant' ? mainContent : m.content} disabled={i === 0}>
                          <div className={cn(
                            "px-4 py-3 rounded-[20px] overflow-hidden backdrop-blur-md relative z-10 w-full flex flex-col gap-3",
                            m.role === 'assistant' 
                              ? "bg-[#f1f5f9]/95 text-[#0f172a] rounded-tl-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]" 
                              : "bg-gradient-to-br from-[#D4AF37] to-[#B49020] text-black rounded-tr-sm shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                          )}>
                            {m.role === 'assistant' ? (
                              <div className="prose prose-sm prose-p:leading-relaxed prose-headings:text-[#0f172a] prose-headings:font-[600] prose-a:text-[#D4AF37] prose-strong:text-[#D4AF37] prose-strong:font-[700] prose-strong:-tracking-[0.01em] max-w-none text-[#0f172a] font-sans tracking-[-0.02em] prose-td:border prose-td:border-slate-200 prose-th:border prose-th:border-slate-200 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-code:text-[#D4AF37] prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-[400] prose-code:rounded">
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
                              <div className="flex flex-col gap-1 w-full">
                                <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.content}</p>
                                {m.timestamp && (
                                  <span className="text-[10px] text-black/60 self-end">
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            )}
                            {m.role === 'assistant' && (
                              <div className="self-end mt-1 -mb-2 w-full flex flex-col">
                                {hasPdfReady && (i !== messages.length - 1 || (!isTyping && !isChatLoading)) && (
                                  <DownloadPdfButton content={mainContent} />
                                )}
                                <div className="self-end mt-1 flex gap-2">
                                  {isAssistant && i === messages.length - 1 && mainContent.length > 500 && !isTyping && !isChatLoading && (
                                    <SummarizeMessageButton onSummarize={() => handleChatSend('Pode resumir essa última explicação de forma rápida em alguns tópicos, por favor?')} />
                                  )}
                                  {i > 0 && <CopyMessageButton text={mainContent} />}
                                  <MessageAudioButton text={mainContent} isComplete={i !== messages.length - 1 || (!isTyping && !isChatLoading)} />
                                </div>
                              </div>
                            )}
                          </div>
                        </PressableMessageWrapper>
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
                
                {attachmentError && (
                  <div className="flex items-start gap-2 mb-2 w-full bg-red-500/20 backdrop-blur-md rounded-xl px-3 py-2 border border-red-500/30 shadow-sm relative">
                    <span className="text-[13px] font-sans font-medium text-red-200 flex-1">{attachmentError}</span>
                    <button onClick={() => setAttachmentError(null)} className="shrink-0 text-red-300 hover:text-red-100 focus:outline-none p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

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
                             setAttachmentError(null);
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
                             setAttachmentError(null);
                             setAttachments(prev => [...prev, { file: e.target.files![0], type: 'image' }]);
                         }
                      }} 
                    />
                    <button onClick={() => imageInputRef.current?.click()} className="p-2 mb-1 text-white/50 hover:text-[#D4AF37] transition-colors rounded-full focus:outline-none shrink-0" title="Câmera / Imagem">
                      <Camera className="w-[18px] h-[18px]" />
                    </button>
                    <div className="relative flex-1 flex flex-col">
                      <AnimatePresence>
                        {showCommandMenu && filteredCommands.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute bottom-full mb-2 left-0 w-full bg-[#0a0f1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                          >
                            <div className="px-3 py-2 border-b border-white/5 bg-white/5 text-[11px] font-medium text-white/50 uppercase tracking-wider">
                              Comandos
                            </div>
                            <div className="max-h-[200px] overflow-y-auto w-full">
                              {filteredCommands.map((c, i) => (
                                <button
                                  key={c.cmd}
                                  onClick={() => handleCommandSelect(c.cmd)}
                                  className={cn(
                                    "w-full text-left px-3 py-2.5 flex flex-col transition-colors border-l-2",
                                    i === selectedCommandIndex 
                                      ? "bg-white/10 border-[#D4AF37]" 
                                      : "hover:bg-white/5 border-transparent"
                                  )}
                                >
                                  <span className="text-[#D4AF37] font-medium text-sm">{c.cmd}</span>
                                  <span className="text-white/60 text-[11px] truncate">{c.desc}</span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <textarea 
                        ref={commandInputRef}
                        value={chatInput} 
                        onChange={handleChatInputChange} 
                        onKeyDown={handleChatInputKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                          // Allow time for command click before hiding
                          setTimeout(() => {
                            setIsFocused(false);
                            setShowCommandMenu(false);
                          }, 200);
                        }}
                        disabled={isRecording || isTranscribing || isProcessingAttachments}
                        placeholder={isRecording ? "Gravando áudio..." : isTranscribing ? "Transcrevendo..." : isProcessingAttachments ? "Processando anexos..." : "Pergunte ao Mini Chefinho..."}
                        className="w-full bg-transparent px-2 py-3 min-h-[44px] max-h-[120px] resize-none text-[15px] leading-tight font-sans font-[400] tracking-[-0.02em] text-white placeholder-white/30 focus:outline-none caret-[#D4AF37] scrollbar-hide flex items-center justify-center align-middle"
                        rows={1}
                      />
                    </div>
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
              </div>
            </motion.div>
        </div>
        )}
        </AnimatePresence>
        </>
    );
};

export default AssistantModal;

