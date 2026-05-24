
import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, Calendar, Leaf, Music, MessageSquare, CreditCard, Copy, CheckCircle2, BookOpen, Search, X, GraduationCap, Anchor, ChevronRight, ChevronLeft, Sparkles, Clock, Wallet, MapPin, ExternalLink, Phone, HeartOff, User, MessageCircle, Bot, Loader2, Banknote, DollarSign, GripVertical, Mic, ArrowUp, Sun, Sword , CloudSun, Moon, MoonStar } from 'lucide-react';
import { DailyMessageModal } from '../components/DailyMessageModal';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { AppSettings, HerbBath, Ponto, Event, StudyBook, Note, DEFAULT_ASSISTANT_AVATAR } from '../types';
import { cn } from '../lib/utils';
import { format, isAfter, isToday, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { askAI, getDailyKnowledge } from '../services/aiService';
import { DID_YOU_KNOW_DATA } from '../data/didYouKnowData';
import { useAssistant } from '../lib/AssistantContext';
import { GlobalSearch } from '../components/GlobalSearch';
import { supabase } from '../lib/supabase';

export default function HomeScreen() {
  const { setIsScrolled } = useAssistant();
  const navigate = useNavigate();
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    bathCategories: ['Gerais', 'Orixás', 'Entidades'],
    pushNotifications: false,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  const [baths, setBaths] = useStorage<HerbBath[]>('templo_baths', []);
  const [pontos, setPontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [books, setBooks] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [events] = useStorage<Event[]>('templo_events', []);
  
  const [copied, setCopied] = React.useState<string | null>(null);
  const [showPixMenu, setShowPixMenu] = React.useState(false);
  const [favFilter, setFavFilter] = React.useState<'all' | 'baths' | 'pontos' | 'books'>('all');
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = React.useState(false);
  const [dailyFact, setDailyFact] = React.useState<{title: string, content: string, category: string} | null>(null);
  const [isLoadingFact, setIsLoadingFact] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);
  const [assistantAvatar, setAssistantAvatar] = React.useState<string | null>(null);
  const userAvatarRef = useRef<HTMLInputElement>(null);
  const assistantAvatarRef = useRef<HTMLInputElement>(null);
  const [showDailyFactModal, setShowDailyFactModal] = React.useState(false);
  const [isFactTabCollapsed, setIsFactTabCollapsed] = React.useState(false);
  const [factTabSide, setFactTabSide] = React.useState<'left' | 'right'>('left');
  const [factTabX, setFactTabX] = React.useState(0);
  const [factTabY, setFactTabY] = React.useState(window.innerHeight * 0.25);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'note'>('chat');
  const [noteTitle, setNoteTitle] = React.useState('');
  const [noteContent, setNoteContent] = React.useState('');
  const [chatInput, setChatInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Olá! Como posso te ajudar hoje?' }
  ]);
  const [isChatLoading, setIsChatLoading] = React.useState(false);
  const [notes, setNotes] = useStorage<Note[]>('templo_notes', []);
  const factTabRef = React.useRef<HTMLDivElement>(null);
  const factClickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await askAI([...messages.map(m => ({ role: m.role, content: m.content })), userMsg]);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, não consegui processar sua mensagem.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  React.useEffect(() => {
    const fetchDailyFact = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const cachedFact = localStorage.getItem('templo_daily_fact_v2');
      const cachedDate = localStorage.getItem('templo_daily_fact_date');

      if (cachedFact && cachedDate === today) {
        try {
          setDailyFact(JSON.parse(cachedFact));
          return;
        } catch (e) {
          // Fallback if parse fails
        }
      }

      setIsLoadingFact(true);
      try {
        const factJsonStr = await getDailyKnowledge();
        const factData = JSON.parse(factJsonStr);
        
        setDailyFact(factData);
        
        localStorage.setItem('templo_daily_fact_v2', factJsonStr);
        localStorage.setItem('templo_daily_fact_date', today);
      } catch (error) {
        const randomIndex = Math.floor(Math.random() * DID_YOU_KNOW_DATA.length);
        const randomItem = DID_YOU_KNOW_DATA[randomIndex];
        setDailyFact({
          title: randomItem.title,
          content: randomItem.content,
          category: randomItem.category
        });
      } finally {
        setIsLoadingFact(false);
      }
    };

    fetchDailyFact();
  }, []);

  const handleAskAI = async () => {
    setIsLoadingAI(true);
    setAiResponse(null);
    try {
      const response = await askAI([{ role: 'user', content: 'Olá, qual é o seu nome e como você pode me ajudar?' }]);
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Ocorreu um erro ao conectar com o assistente. Verifique se a chave API está configurada.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const favBaths = baths.filter(b => b.isFavorite);
  const favPontos = pontos.filter(p => p.isFavorite);
  const favBooks = books.filter(b => b.isFavorite);
  const inProgressBooks = books.filter(b => b.readingStatus === 'in_progress');

  const toggleFavBath = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBaths(baths.map(b => b.id === id ? { ...b, isFavorite: false } : b));
  };
  const toggleFavPonto = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPontos(pontos.map(p => p.id === id ? { ...p, isFavorite: false } : p));
  };
  const toggleFavBook = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBooks(books.map(b => b.id === id ? { ...b, isFavorite: false } : b));
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      createdAt: Date.now(),
      lastEdited: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Próximos eventos (hoje ou no futuro)
  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => {
        const [year, month, day] = e.date.split('-').map(Number);
        const eventDate = new Date(year, month - 1, day);
        return isToday(eventDate) || isAfter(eventDate, startOfToday());
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Gira aberta': return '#3B82F6'; // Blue
      case 'Gira Fechada': return '#8B5CF6'; // Violet
      case 'Desenvolvimento': return '#10B981'; // Emerald
      case 'Festa': return '#EF4444'; // Red
      case 'Trabalho': return '#F97316'; // Orange
      case 'Preceito': return '#EAB308'; // Yellow
      case 'Lembrete': return '#6B7280'; // Gray
      default: return '#10B981';
    }
  };

  const nextEvent = upcomingEvents[0];
  const lastBook = inProgressBooks[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="hidden" 
      className={cn(
        "px-4 pb-32 pt-6 transition-colors duration-500 w-full max-w-2xl mx-auto space-y-8",
        "bg-transparent"
      )}
    >
      {/* 1. Hero Section (Híbrida) & Search */}
      <motion.div variants={itemVariants} className="flex flex-col gap-6 items-center justify-center relative mt-2 pt-8 sm:pt-6">
        <div className="relative text-center w-full">
             {/* Partículas flutuantes para adicionar mais vida (10 animações) */}
             {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className={cn("absolute rounded-full w-1 h-1 pointer-events-none", settings.darkMode ? "bg-brand-gold/40" : "bg-brand-copper/40")}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0], 
                    scale: [0.5, 1.5, 0.5],
                    y: [0, -30, -60],
                    x: Math.sin(i * 10) * 20
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity, 
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                  style={{ left: `${20 + (i * 15)}%`, top: '10%' }}
                />
             ))}
             {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className={cn("absolute rounded-full w-2 h-2 pointer-events-none blur-[1px]", settings.darkMode ? "bg-white/10" : "bg-brand-copper/10")}
                  animate={{ 
                    opacity: [0.2, 0.6, 0.2], 
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 180]
                  }}
                  transition={{ 
                    duration: 4 + Math.random() * 3, 
                    repeat: Infinity, 
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                  style={{ right: `${20 + (i * 12)}%`, bottom: '10%' }}
                />
             ))}
        </div>

        <div className="w-full max-w-2xl mx-auto z-10 pt-4">
          <GlobalSearch />
        </div>
      </motion.div>

      {/* AI Response Display */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
          >
            <div className={cn(
              "p-5 rounded-[32px] border relative overflow-hidden",
              settings.darkMode 
                ? "bg-gradient-to-br from-[#1a1a1a] to-[#222] border-white/10 shadow-lg shadow-black/50" 
                : "bg-gradient-to-br from-white to-brand-copper/5 border-brand-copper/20 shadow-xl shadow-brand-copper/5"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className={cn("p-1.5 rounded-xl", settings.darkMode ? "bg-white/10 text-brand-gold" : "bg-brand-copper/10 text-brand-copper")}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-gold" : "text-brand-copper")}>Assistente Oya Ogum</span>
                </div>
                <button 
                  onClick={() => setAiResponse(null)}
                  className="p-1.5 active:bg-black/5 dark:active:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <p className={cn("text-sm sm:text-base font-bold leading-relaxed italic", settings.darkMode ? "text-gray-200" : "text-gray-700")}>
                "{aiResponse}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento Grid Dashboard - Acesso Rápido */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[120px] sm:auto-rows-[140px] px-2 mb-8">
         {/* Eventos e Giras - Destaque Principal */}
         <motion.div
            onClick={() => navigate("/calendar")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "col-span-2 md:col-span-2 row-span-2 p-5 sm:p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-white/60 shadow-[0_8px_32px_rgba(31,56,100,0.06)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-0 right-0 w-48 h-48 bg-brand-copper/10 dark:bg-brand-gold/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
           <motion.div animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1], x: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 left-0 w-32 h-32 bg-brand-copper/5 dark:bg-brand-gold/5 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
           
           <div className="flex justify-between items-start z-10 relative">
             <div className={cn(
               "w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
               settings.darkMode ? "bg-white/5 text-brand-gold" : "bg-gradient-to-br from-brand-copper to-brand-gold text-white"
             )}>
                <motion.div animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" />
             </motion.div>
             </div>
             <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
               <ChevronRight className={cn("w-5 h-5", settings.darkMode ? "text-white" : "text-black")} />
             </div>
           </div>
           
           <div className="z-10 relative mt-4">
             <span className={cn("text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] block mb-1.5", settings.darkMode ? "text-brand-gold/80" : "text-brand-copper/80")}>Agenda do Terreiro</span>
             {nextEvent ? (
                <>
                  <h3 className={cn("text-xl sm:text-2xl font-black leading-tight font-display mb-2 line-clamp-2", nextEvent.isCanceled && "line-through opacity-50", settings.darkMode ? "text-white" : "text-gray-900")}>{nextEvent.title}</h3>
                  <div className="flex items-center gap-2 mt-auto">
                     <span className={cn("text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-lg font-bold", settings.darkMode ? "bg-white/10 text-gray-300" : "bg-gray-100 text-gray-700")}>{format(parseISO(nextEvent.date), "dd/MM", { locale: ptBR })}</span>
                     <span className={cn("text-[9px] sm:text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider", settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-copper/10 text-brand-copper")}>{nextEvent.category}</span>
                  </div>
                </>
             ) : (
                <>
                   <h3 className={cn("text-xl sm:text-2xl font-black leading-tight font-display mb-2", settings.darkMode ? "text-white" : "text-gray-900")}>Eventos e Giras</h3>
                   <p className={cn("text-sm font-medium leading-tight", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Sua agenda está livre.</p>
                </>
             )}
           </div>
         </motion.div>

         {/* Biblioteca - Col-Span-2 na mobile, adaptável no tablet/desktop */}
         <motion.div
            onClick={() => lastBook ? navigate("/studies", { state: { openBookId: lastBook.id } }) : navigate("/studies")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "col-span-2 md:col-span-1 lg:col-span-2 row-span-1 md:row-span-2 p-5 rounded-2xl border relative overflow-hidden flex flex-row md:flex-col items-center md:items-start md:justify-between group cursor-pointer gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-white/60 shadow-[0_8px_32px_rgba(31,56,100,0.06)] hover:bg-white/90"
            )}
         >
            <div className={cn(
               "w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-105",
               !lastBook?.coverImage && !lastBook?.coverColor && (settings.darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600")
            )} style={lastBook?.coverColor && !lastBook?.coverImage ? { backgroundColor: lastBook.coverColor } : undefined}>
              {lastBook?.coverImage ? (
                 <img src={lastBook.coverImage} alt="Capa" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                <BookOpen className={cn("w-6 h-6", lastBook?.coverColor ? "text-white" : "")} />
              </motion.div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 md:mt-auto">
               <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] block mb-1", settings.darkMode ? "text-indigo-400" : "text-indigo-600")}>Biblioteca</span>
               <p className={cn("text-base sm:text-lg font-black leading-tight truncate font-display", settings.darkMode ? "text-white" : "text-gray-900")}>
                 {lastBook ? lastBook.name.replace('.pdf', '') : "Comece a estudar"}
               </p>
               {lastBook && (
                 <div className="flex items-center gap-3 mt-2 hidden md:flex">
                   <div className="flex-1 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden relative">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${(lastBook.lastPage! / lastBook.totalPages!) * 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={cn("absolute left-0 top-0 bottom-0 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]", settings.darkMode ? "bg-indigo-400" : "bg-indigo-500")} />
                   </div>
                   <span className={cn("text-[10px] sm:text-xs font-mono font-bold", settings.darkMode ? "text-indigo-400" : "text-indigo-600")}>{(lastBook.lastPage! / lastBook.totalPages! * 100).toFixed(0)}%</span>
                 </div>
               )}
            </div>
         </motion.div>

         {/* Banhos */}
         <motion.div
            onClick={() => navigate('/herbs')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-emerald-100 shadow-[0_4px_16px_rgba(16,185,129,0.05)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] relative z-10",
             settings.darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-md shadow-emerald-500/20"
           )}>
              <motion.div animate={{ rotate: [0, -10, 15, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <Leaf className="w-5 h-5 drop-shadow-sm" />
           </motion.div>
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", settings.darkMode ? "text-emerald-50" : "text-emerald-950")}>Banhos</h3>
         </motion.div>

         {/* Pontos */}
         <motion.div
            onClick={() => navigate('/points')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-rose-100 shadow-[0_4px_16px_rgba(244,63,94,0.05)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-[15deg] relative z-10",
             settings.darkMode ? "bg-rose-500/20 text-rose-400" : "bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-md shadow-rose-500/20"
           )}>
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Music className="w-5 h-5 drop-shadow-sm" />
           </motion.div>
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", settings.darkMode ? "text-rose-50" : "text-rose-950")}>Pontos</h3>
         </motion.div>

         {/* Anotações */}
         <motion.div
            onClick={() => navigate('/notes')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-blue-100 shadow-[0_4px_16px_rgba(59,130,246,0.05)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] relative z-10",
             settings.darkMode ? "bg-blue-500/20 text-blue-400" : "bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md shadow-blue-500/20"
           )}>
              <motion.div animate={{ y: [0, -2, 0], scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <MessageSquare className="w-5 h-5 drop-shadow-sm" />
           </motion.div>
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", settings.darkMode ? "text-blue-50" : "text-blue-950")}>Anotações</h3>
         </motion.div>

         {/* Trabalhos */}
         <motion.div
            onClick={() => navigate('/trab')}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-amber-100 shadow-[0_4px_16px_rgba(245,158,11,0.05)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-[15deg] relative z-10",
             settings.darkMode ? "bg-amber-500/20 text-amber-400" : "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20"
           )}>
              <motion.div animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
              <Sparkles className="w-5 h-5 drop-shadow-sm" />
           </motion.div>
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", settings.darkMode ? "text-amber-50" : "text-amber-950")}>Trabalhos</h3>
         </motion.div>

         {/* Financeiro */}
         <motion.div
            onClick={() => setShowPixMenu(true)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-violet-100 shadow-[0_4px_16px_rgba(139,92,246,0.05)] hover:bg-white/90"
            )}
         >
           <motion.div animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] relative z-10",
             settings.darkMode ? "bg-violet-500/20 text-violet-400" : "bg-gradient-to-br from-violet-400 to-violet-500 text-white shadow-md shadow-violet-500/20"
           )}>
              <motion.div animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Wallet className="w-5 h-5 drop-shadow-sm" />
           </motion.div>
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", settings.darkMode ? "text-violet-50" : "text-violet-950")}>Financeiro</h3>
         </motion.div>

         {/* Address */}
         <motion.div
            onClick={(e) => { e.preventDefault(); copyToClipboard("Av. Sapopemba, 16068 - Jd ster, São Paulo - SP, 08830-180", "address"); }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "col-span-1 p-4 sm:p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-center items-center text-center cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-2xl",
              settings.darkMode 
                ? "bg-white/5 backdrop-blur-md border-white/10 shadow-xl hover:bg-white/10" 
                : "bg-white/70 backdrop-blur-md border-rose-100 shadow-[0_4px_16px_rgba(244,63,94,0.05)] hover:bg-white/90",
              copied === 'address' && (settings.darkMode ? "!bg-green-500/20 !border-green-500/50" : "!bg-green-50 !border-green-200")
            )}
         >
           <motion.div animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
           <div className={cn(
             "w-10 h-10 rounded-[16px] flex items-center justify-center mb-2 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-[15deg] relative z-10",
             copied === 'address'
               ? (settings.darkMode ? "bg-green-500/20 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg shadow-green-500/30")
               : (settings.darkMode ? "bg-rose-500/20 text-rose-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]" : "bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/30")
           )}>
              {copied === 'address' ? <CheckCircle2 className="w-5 h-5 drop-shadow-sm" /> : <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><MapPin className="w-5 h-5 drop-shadow-sm" /></motion.div>}
           </div>
           <h3 className={cn("font-black text-xs sm:text-sm leading-tight font-display tracking-tight", copied === 'address' ? (settings.darkMode ? "text-green-50" : "text-green-950") : (settings.darkMode ? "text-rose-50" : "text-rose-950"))}>{copied === 'address' ? "Copiado!" : "Endereço"}</h3>
         </motion.div>
      </motion.div>


      {/* Menu PIX Expandido (Overlay Modal) */}
      <AnimatePresence>
        {showPixMenu && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPixMenu(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className={cn(
                "relative w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]",
                settings.darkMode ? "bg-[#1A1A1A] border border-white/10" : "bg-white border border-gray-100"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-copper/10 text-brand-copper rounded-2xl flex items-center justify-center">
                    <motion.div animate={{ y: [0, -2, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}><Wallet className="w-5 h-5" /></motion.div>
                  </div>
                  <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-white")}>
                    Contas do Templo
                  </h3>
                </div>
                <motion.button animate={{ rotate: [0, 90, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} onClick={() => setShowPixMenu(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full active:scale-95 transition-all">
                  <X className="w-4 h-4 text-gray-300 dark:text-gray-400" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto scrollbar-hide">
                {/* Caixa */}
                <div className={cn(
                  "p-5 rounded-[28px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-white/10" : "bg-brand-copper/5 border-brand-copper/10 shadow-sm"
                )}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                      {settings.caixaLogo ? (
                        <img src={settings.caixaLogo} alt="Caixa" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-black text-blue-900 uppercase tracking-widest px-1 text-center leading-none">Caixa</span>
                      )}
                    </div>
                    <div>
                      <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5", settings.darkMode ? "text-brand-copper" : "text-brand-copper")}>Mensalidade</p>
                      <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-white" : "text-white")}>Caixa Econômica</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between gap-4 mt-auto border",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-white/10 border-white/10 backdrop-blur-md"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mb-1">Chave PIX (CPF)</p>
                      <p className={cn("text-sm sm:text-base font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-white")}>33464358810</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('33464358810', 'caixa')}
                      className="w-11 h-11 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/20 active:scale-95 transition-all shrink-0"
                    >
                      {copied === 'caixa' ? <CheckCircle2 className="w-5 h-5" /> : <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Copy className="w-5 h-5" /></motion.div>}
                    </button>
                  </div>
                </div>

                {/* Nubank */}
                <div className={cn(
                  "p-5 rounded-[28px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-white/10" : "bg-[#8A05BE]/5 border-[#8A05BE]/10 shadow-sm"
                )}>
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 shrink-0 flex items-center justify-center overflow-hidden">
                        {settings.nubankLogo ? (
                          <img src={settings.nubankLogo} alt="Nubank" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] font-black text-[#8A05BE] uppercase tracking-widest px-1 text-center leading-none">Nubank</span>
                        )}
                      </div>
                      <div>
                        <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5", settings.darkMode ? "text-[#8A05BE]" : "text-[#8A05BE]")}>Diversos & Banhos</p>
                        <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-white" : "text-white")}>Nubank</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between gap-4 mt-auto border",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-white/10 border-white/10 backdrop-blur-md"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mb-1">Chave PIX (Celular)</p>
                      <p className={cn("text-sm sm:text-base font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-white")}>11982350614</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('11982350614', 'nubank')}
                      className="w-11 h-11 bg-[#8A05BE] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#8A05BE]/20 active:scale-95 transition-all shrink-0"
                    >
                      {copied === 'nubank' ? <CheckCircle2 className="w-5 h-5" /> : <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Copy className="w-5 h-5" /></motion.div>}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Favoritos / Carousel Expandido */}
      <motion.section variants={itemVariants} className="">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className={cn("font-black text-[12px] sm:text-sm uppercase tracking-[0.2em] flex items-center gap-2", settings.darkMode ? "text-gray-300" : "text-gray-800")}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" /> Meus Favoritos
          </h3>
        </div>

        {(favBaths.length > 0 || favPontos.length > 0 || favBooks.length > 0) ? (
          <>
            <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-hide p-1.5 rounded-[20px] mx-2" style={{ backgroundColor: settings.darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
              {['all', ...(favBaths.length > 0 ? ['baths'] : []), ...(favPontos.length > 0 ? ['pontos'] : []), ...(favBooks.length > 0 ? ['books'] : [])].map((tab) => {
                const isSelected = favFilter === tab;
                const labels: any = { all: 'Todos', baths: 'Banhos', pontos: 'Pontos', books: 'Estudos' };
                const activeColor = tab === 'baths' ? 'text-white' : tab === 'pontos' ? 'text-white' : tab === 'books' ? 'text-white' : settings.darkMode ? 'text-black' : 'text-white';
                const inactiveColor = settings.darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800';
                
                return (
                  <button
                    key={tab}
                    onClick={() => setFavFilter(tab as any)}
                    className={cn(
                      "relative px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors whitespace-nowrap",
                      isSelected ? activeColor : inactiveColor
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeFavFilter2"
                        className="absolute inset-0 rounded-xl shadow-sm -z-10"
                        style={{ backgroundColor: settings.darkMode ? (tab === 'all' ? '#fff' : tab === 'baths' ? '#10b981' : tab === 'pontos' ? '#f43f5e' : '#6366f1') : (tab === 'all' ? '#111827' : tab === 'baths' ? '#10b981' : tab === 'pontos' ? '#f43f5e' : '#6366f1') }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{labels[tab]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x relative">
              {(favFilter === 'all' || favFilter === 'baths') && favBaths.map((bath, i) => (
                <div key={bath.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                    className={cn(
                      "relative w-[140px] sm:w-[160px] h-[160px] sm:h-[180px] p-5 rounded-[32px] border transition-colors duration-500 text-left flex flex-col justify-between group overflow-hidden cursor-pointer",
                      settings.darkMode
                        ? "bg-[#1A1A1A]/80 backdrop-blur-xl border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        : "bg-gradient-to-br from-emerald-50/80 to-white/80 backdrop-blur-xl border-emerald-200/60 shadow-[0_8px_24px_rgba(16,185,129,0.08)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.15)] hover:border-emerald-300"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[15deg] shadow-inner",
                      settings.darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-emerald-500/30"
                    )}>
                      <motion.div animate={{ rotate: [0, -10, 15, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                      <Leaf className="w-6 h-6 drop-shadow-sm" />
                    </motion.div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1", settings.darkMode ? "text-emerald-500/80" : "text-emerald-600/80")}>Banho</p>
                      <p className={cn("font-bold text-sm leading-tight line-clamp-2 font-display tracking-tight", settings.darkMode ? "text-white" : "text-emerald-950")}>{bath.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBath(e, bath.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-emerald-500/10 active:scale-95 z-20 backdrop-blur-sm bg-black/5 dark:bg-white/5"
                  >
                    <HeartOff className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              ))}
              
              {(favFilter === 'all' || favFilter === 'pontos') && favPontos.map((ponto, i) => (
                <div key={ponto.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                    className={cn(
                      "relative w-[140px] sm:w-[160px] h-[160px] sm:h-[180px] p-5 rounded-[32px] border transition-colors duration-500 text-left flex flex-col justify-between group overflow-hidden cursor-pointer",
                      settings.darkMode
                        ? "bg-[#1A1A1A]/80 backdrop-blur-xl border-rose-500/20 hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
                        : "bg-gradient-to-br from-rose-50/80 to-white/80 backdrop-blur-xl border-rose-200/60 shadow-[0_8px_24px_rgba(244,63,94,0.08)] hover:shadow-[0_16px_32px_rgba(244,63,94,0.15)] hover:border-rose-300"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-[15deg] shadow-inner",
                      settings.darkMode ? "bg-rose-500/20 text-rose-400" : "bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-rose-500/30"
                    )}>
                      <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                      <Music className="w-6 h-6 drop-shadow-sm" />
                    </motion.div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1", settings.darkMode ? "text-rose-500/80" : "text-rose-600/80")}>Ponto</p>
                      <p className={cn("font-bold text-sm leading-tight line-clamp-2 font-display tracking-tight", settings.darkMode ? "text-white" : "text-rose-950")}>{ponto.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavPonto(e, ponto.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-rose-500/10 active:scale-95 z-20 backdrop-blur-sm bg-black/5 dark:bg-white/5"
                  >
                    <HeartOff className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              ))}

              {(favFilter === 'all' || favFilter === 'books') && favBooks.map((book, i) => (
                <div key={book.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                    className={cn(
                      "relative w-[140px] sm:w-[160px] h-[160px] sm:h-[180px] p-5 rounded-[32px] border transition-colors duration-500 text-left flex flex-col justify-between group overflow-hidden cursor-pointer",
                      settings.darkMode
                        ? "bg-[#1A1A1A]/80 backdrop-blur-xl border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                        : "bg-gradient-to-br from-indigo-50/80 to-white/80 backdrop-blur-xl border-indigo-200/60 shadow-[0_8px_24px_rgba(99,102,241,0.08)] hover:shadow-[0_16px_32px_rgba(99,102,241,0.15)] hover:border-indigo-300"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className={cn(
                      "w-12 h-12 rounded-[20px] shadow-inner flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-500 group-hover:scale-110", 
                      (!book.coverImage && !book.coverColor) ? (settings.darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-gradient-to-br from-indigo-400 to-indigo-500 text-white shadow-indigo-500/30") : ""
                    )} style={book.coverColor && !book.coverImage ? { backgroundColor: book.coverColor } : undefined}>
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                        <GraduationCap className={cn("w-6 h-6", book.coverColor ? "text-white" : "drop-shadow-sm")} />
                      </motion.div>
                      )}
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: book.coverColor || (settings.darkMode ? '#818cf8' : '#4f46e5') }}>Estudo</p>
                      <p className={cn("font-bold text-sm leading-tight line-clamp-2 font-display tracking-tight", settings.darkMode ? "text-white" : "text-indigo-950")}>{book.name.replace('.pdf', '')}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBook(e, book.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-indigo-500/10 active:scale-95 z-20 backdrop-blur-sm bg-black/5 dark:bg-white/5"
                  >
                    <HeartOff className="w-4 h-4 text-indigo-500" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={cn(
            "p-8 sm:p-10 rounded-[32px] border text-center mx-2",
            settings.darkMode ? "bg-white/[0.02] border-white/5 border-dashed" : "bg-white/40 border-gray-200 border-dashed backdrop-blur-xl"
          )}>
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className={cn(
              "w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-inner rotate-3",
              settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-400"
            )}>
              <Heart className="w-7 h-7 stroke-[2]" />
            </motion.div>
            <h4 className={cn("font-black text-lg mb-2 font-display tracking-tight", settings.darkMode ? "text-white" : "text-gray-900")}>
              Nenhum favorito selecionado
            </h4>
            <p className={cn("text-[13px] leading-relaxed max-w-[260px] mx-auto mb-6", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              Quando você marcar banhos, pontos ou estudos como favoritos, eles aparecerão aqui magicamente.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => navigate('/herbs')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95",
                  settings.darkMode ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-sm"
                )}
              >
                Explorar Banhos
              </button>
              <button 
                onClick={() => navigate('/points')}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95",
                  settings.darkMode ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-sm"
                )}
              >
                Ouvir Pontos
              </button>
            </div>
          </div>
        )}
      </motion.section>
      {/* 4. Agenda Resumida (Bento Style) */}
      <motion.section variants={itemVariants} className="px-2 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-black text-[12px] sm:text-sm uppercase tracking-[0.2em] flex items-center gap-2", settings.darkMode ? "text-gray-300" : "text-gray-800")}>
            <Calendar className="w-4 h-4 text-brand-copper" /> Agenda
          </h3>
          <button 
            onClick={() => navigate('/calendar', { state: { scrollToAgenda: true } })}
            className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full bg-brand-copper/10 text-brand-copper active:scale-95 transition-all"
          >
            Ver Tudo
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {upcomingEvents.slice(0, 4).map((event, index) => {
            const eventDate = parseISO(event.date);
            const isEventToday = isToday(eventDate);
            
            return (
              <motion.button 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.1 }}
                 key={event.id}
                 onClick={() => navigate('/calendar', { state: { scrollToAgenda: true } })}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 className={cn(
                   "w-full flex items-center gap-4 p-5 rounded-[32px] border transition-colors text-left group relative overflow-hidden h-[100px]",
                   settings.darkMode ? "bg-[#1A1A1A]" : "bg-white/80 backdrop-blur-md shadow-[0_8px_24px_rgba(31,56,100,0.05)]",
                   isEventToday ? (settings.darkMode ? "border-brand-copper/40" : "border-brand-copper/40 shadow-[0_8px_32px_rgba(184,134,11,0.15)]") : (settings.darkMode ? "border-white/5" : "border-gray-200")
                 )}
              >
                {/* Decoration wave */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/5 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div 
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-[20px] transition-all shrink-0 group-hover:scale-105",
                    isEventToday && (settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-gradient-to-br from-brand-copper/80 to-brand-copper text-white shadow-lg")
                  )}
                  style={!isEventToday ? {
                    backgroundColor: settings.darkMode ? getCategoryColor(event.category) + '15' : getCategoryColor(event.category) + '10',
                    color: settings.darkMode ? '#fff' : getCategoryColor(event.category)
                  } : {}}
                >
                  <span className={cn("text-xl leading-none font-black font-display", !isEventToday && !settings.darkMode && "text-gray-900")}>
                    {format(eventDate, 'dd')}
                  </span>
                  <span className={cn("text-[8px] uppercase font-bold tracking-widest mt-1", isEventToday ? "" : "opacity-80")} style={!isEventToday && !settings.darkMode ? { color: getCategoryColor(event.category) } : {}}>
                    {format(eventDate, 'MMM', { locale: ptBR }).replace('.', '')}
                  </span>
                </div>
                 
                 <div className="flex-1 overflow-hidden">
                   <div className="flex items-center gap-2 mb-1.5">
                     <span 
                       className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                       style={{ 
                         color: getCategoryColor(event.category),
                         backgroundColor: settings.darkMode ? getCategoryColor(event.category) + '20' : getCategoryColor(event.category) + '15'
                       }}
                     >
                       {event.category}
                     </span>
                     {isEventToday && (
                       <span className="text-[8px] font-black uppercase tracking-wider text-brand-copper flex items-center gap-1">
                         Hoje
                       </span>
                     )}
                   </div>

                   <p className={cn(
                     "font-bold text-sm sm:text-base leading-tight truncate font-display tracking-tight", 
                     settings.darkMode ? "text-white group-hover:text-brand-gold" : "text-gray-900 group-hover:text-brand-copper",
                     event.isCanceled && "line-through opacity-50"
                   )}>
                     {event.title}
                     {event.isCanceled && <span className="ml-2 text-[8px] font-black text-red-500 uppercase tracking-widest no-underline opacity-100">Cancelado</span>}
                   </p>
                   
                   {event.reminder && !event.isCanceled && (
                     <div className="flex items-center gap-1 mt-1 font-mono text-[9px] font-bold text-gray-500">
                       <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}><Clock className="w-3 h-3" /></motion.div> {event.reminder}
                     </div>
                   )}
                 </div>
              </motion.button>
            );
          })}
          
          {upcomingEvents.length === 0 && (
             <div className="col-span-1 sm:col-span-2 p-8 text-center rounded-[32px] border border-dashed border-gray-200 dark:border-white/10 dark:bg-white/[0.02]">
               <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Calendar className="w-8 h-8 text-gray-300 dark:text-gray-500 mx-auto mb-3" /></motion.div>
               <h4 className={cn("font-black text-base font-display tracking-tight mb-1", settings.darkMode ? "text-white" : "text-gray-900")}>Agenda Livre</h4>
               <p className="text-gray-400 text-xs font-medium">Você não tem compromissos próximos no terreiro.</p>
             </div>
          )}
        </div>
      </motion.section>

      {/* Contatos Úteis */}
        <motion.div variants={itemVariants} className={cn(
          "p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] transition-all duration-300 relative overflow-hidden group active:translate-y-[-2px] mt-8 max-w-lg mx-auto",
          settings.darkMode 
            ? "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/5 active:border-blue-500/30 active:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
            : "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 active:border-blue-200 shadow-[0_10px_40px_rgba(59,130,246,0.05)] active:shadow-[0_20px_60px_rgba(59,130,246,0.1)]"
        )}>
          {/* Background Phone Decoration */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] active:scale-110 active:rotate-6 transition-transform duration-700 pointer-events-none">
            <Phone className="w-40 h-40 sm:w-56 sm:h-56 stroke-[1]" />
          </div>

          <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 relative z-10">
            <motion.div animate={{ rotate: [0, 15, -15, 0], y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl sm:rounded-[28px] shrink-0 transition-all duration-500 active:scale-105 active:-rotate-6 shadow-lg",
              settings.darkMode ? "bg-blue-500/20 text-blue-400 shadow-blue-500/10" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
            )}>
              <Phone className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
            </motion.div>
            <div>
              <p className={cn("text-[8px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-0.5 sm:mb-1", settings.darkMode ? "text-blue-400/80" : "text-blue-600")}>
                Canais de Apoio
              </p>
              <h3 className={cn("text-lg sm:text-2xl font-black tracking-tighter", settings.darkMode ? "text-white" : "text-white")}>
                Contatos Úteis
              </h3>
            </div>
          </div>
          
          <div className="grid gap-3 sm:gap-4 relative z-10">
            {(settings.usefulContacts && settings.usefulContacts.length > 0 ? settings.usefulContacts : [
              { id: 'fixed-1', name: "Terreiro", phone: "(11) 98555-0847" },
              { id: 'fixed-2', name: "Mãe Stela", phone: "(11) 98235-0614" }
            ]).map((contact, index) => {
              const isEven = index % 2 === 1;
              return (
                <div key={contact.id} className={cn(
                  "group/item relative flex items-center justify-between p-3.5 sm:p-4.5 rounded-[24px] sm:rounded-[32px] transition-all border",
                  isEven && "flex-row-reverse",
                  settings.darkMode 
                    ? "bg-white/[0.02] border-white/5 active:bg-white/[0.06] active:border-blue-500/30 shadow-xl" 
                    : "bg-white border-white active:border-blue-200 shadow-sm active:shadow-xl shadow-blue-900/5"
                )}>
                  <div className={cn(
                    "flex items-center gap-3 sm:gap-4 flex-1 truncate",
                    isEven && "flex-row-reverse text-right"
                  )}>
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover/item:scale-110 shadow-inner overflow-hidden",
                      settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-400"
                    )}>
                      {contact.photo ? (
                        <img src={contact.photo} className="w-full h-full object-cover" alt={contact.name} />
                      ) : (
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className={cn(
                        "text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] block mb-0.5 opacity-40 group-hover/item:opacity-100 transition-opacity",
                        settings.darkMode ? "text-gray-400" : "text-white"
                      )}>
                        {contact.name}
                        {contact.isFixed && <span className={cn("ml-1.5 text-[7px] text-brand-gold font-black", isEven && "mr-1.5 ml-0")}>(FIXO)</span>}
                      </span>
                      <span className={cn(
                        "font-bold text-[13px] sm:text-[16px] tracking-tight truncate",
                        settings.darkMode ? "text-white" : "text-white"
                      )}>
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "flex items-center gap-1.5 sm:gap-2.5 shrink-0 relative z-10",
                    isEven ? "mr-3 sm:mr-4" : "ml-3 sm:ml-4"
                  )}>
                    {!isEven && (
                      <button 
                        onClick={() => copyToClipboard(contact.phone.replace(/\D/g, ''), contact.id)}
                        className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all active:scale-[0.85] border",
                          copied === contact.id 
                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" 
                            : settings.darkMode 
                              ? "bg-white/5 border-white/5 text-gray-300 active:text-blue-400 active:border-blue-400/30" 
                              : "bg-gray-50/50 border-gray-100/50 text-gray-400 active:text-blue-600 active:bg-blue-50 active:border-blue-200"
                        )}
                      >
                        {copied === contact.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    
                    <a
                      href={`https://wa.me/55${contact.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all active:scale-[0.8] text-white shadow-lg overflow-hidden",
                        settings.whatsappLogo 
                          ? (settings.darkMode ? "bg-white/5 p-1.5" : "bg-gray-50 p-1.5")
                          : "bg-gradient-to-br from-[#25D366] to-[#1fac53] shadow-[#25D366]/20 active:shadow-[#25D366]/40 active:-translate-y-0.5"
                      )}
                    >
                      {settings.whatsappLogo ? (
                        <img src={settings.whatsappLogo} className="w-full h-full object-contain" alt="WA" />
                      ) : (
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current stroke-none" />
                      )}
                    </a>

                    {isEven && (
                      <button 
                        onClick={() => copyToClipboard(contact.phone.replace(/\D/g, ''), contact.id)}
                        className={cn(
                          "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all active:scale-[0.85] border",
                          copied === contact.id 
                            ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20" 
                            : settings.darkMode 
                              ? "bg-white/5 border-white/5 text-gray-300 active:text-blue-400 active:border-blue-400/30" 
                              : "bg-gray-50/50 border-gray-100/50 text-gray-400 active:text-blue-600 active:bg-blue-50 active:border-blue-200"
                        )}
                      >
                        {copied === contact.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
                        })}
          </div>
        </motion.div>
      {/* Daily Fact Modal */}
      <AnimatePresence>
        {showDailyFactModal && (
          <DailyMessageModal 
            content={dailyFact?.content || ''} 
            onClose={() => setShowDailyFactModal(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
