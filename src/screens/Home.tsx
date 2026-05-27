
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
        "p-4 transition-colors duration-500 w-full",
        "bg-transparent"
      )}
    >
      {/* Global Search Bar (moved from header) */}
      <div className="w-full px-2 mb-2 mt-4">
        <GlobalSearch />
      </div>

      {/* AI Response Display */}
      <AnimatePresence>
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-2 mb-6"
          >
            <div className={cn(
              "p-5 rounded-[32px] border relative overflow-hidden",
              settings.darkMode 
                ? "bg-[#1A1A1A] border-white/10 text-gray-200" 
                : "bg-white border-brand-copper/20 text-white shadow-xl shadow-brand-copper/5"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="p-1.5 bg-brand-copper/10 rounded-xl text-brand-copper"><Bot className="w-4 h-4" /></motion.div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">Assistente Oya Ogum</span>
                </div>
                <button 
                  onClick={() => setAiResponse(null)}
                  className="p-1.5 active:bg-black/5 dark:active:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-sm font-bold leading-relaxed italic">
                "{aiResponse}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento Grid Dashboard */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8 px-2">
        {/* Widget 1: Próxima Gira */}
        <motion.div variants={itemVariants} animate={{ y: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/calendar")}
          className={cn(
            "col-span-2 p-6 rounded-[36px] border relative overflow-hidden transition-all active:scale-[0.98] group cursor-pointer shadow-[0_8px_32px_0_rgba(4,28,12,0.3)] backdrop-blur-lg hover:shadow-[0_8px_32px_0_rgba(212,175,55,0.15)]",
            settings.darkMode 
              ? "bg-gradient-to-br from-black/60 to-black/30 border-white/10 hover:border-brand-gold/25" 
              : "bg-gradient-to-br from-[#041c0c]/45 via-[#010c05]/35 to-black/35 border-brand-gold/15 hover:border-brand-gold/30"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-[1500ms] transition-all -skew-x-12 z-0 pointer-events-none" />
          {/* Decorative Mesh Gradient Blur */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-12 -right-12 w-56 h-56 bg-brand-copper/30 rounded-full blur-[60px] pointer-events-none" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />

          <motion.div animate={{ y: ["-50%", "-55%", "-50%"], rotate: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-4 top-1/2 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
            <Calendar className={cn("w-40 h-40 transition-transform duration-700 ease-out group-hover:scale-[1.15] group-hover:-rotate-6", settings.darkMode ? "text-white" : "text-white")} />
          </motion.div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-brand-copper/20 p-2 rounded-xl text-brand-gold border border-brand-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.15)] backdrop-blur-md">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><Clock className="w-4 h-4" /></motion.div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-gold">Próximo Evento</span>
            </div>
            
            {nextEvent ? (
              <div>
                      <h3 className={cn(
                        "text-2xl font-black text-white leading-tight mb-3 pr-12 drop-shadow-md",
                        nextEvent.isCanceled && "line-through opacity-50"
                      )} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {nextEvent.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2.5 text-white/90">
                        <span className="text-xs font-bold leading-none bg-white/10 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md shadow-sm">
                          {format(parseISO(nextEvent.date), "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 border border-black/10 px-3 py-2 rounded-xl backdrop-blur-md shadow-sm text-white/80">
                          {nextEvent.category}
                        </span>
                        {nextEvent.isCanceled && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/80 border border-red-500 px-3 py-2 rounded-xl backdrop-blur-md shadow-sm text-white flex items-center gap-1">
                            <X className="w-3 h-3" /> Cancelado
                          </span>
                        )}
                      </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-black text-white/50 leading-tight drop-shadow-sm flex items-center gap-2">
                  <HeartOff className="w-5 h-5" /> Nenhum evento próximo
                </h3>
              </div>
            )}
          </div>
        </motion.div>

        {/* Widget 2: Estudo / Progresso */}
        <motion.div variants={itemVariants} animate={{ y: [0, -3, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} whileTap={{ scale: 0.95 }} onClick={() => lastBook ? navigate("/studies", { state: { openBookId: lastBook.id } }) : navigate("/studies")}
          whileHover={{ scale: 1.03, y: -4 }} className={cn(
            "p-5 rounded-[32px] border flex flex-col justify-between relative transition-all active:scale-[0.98] group overflow-hidden cursor-pointer shadow-[0_8px_32px_0_rgba(4,28,12,0.3)] backdrop-blur-lg hover:shadow-[0_8px_32px_0_rgba(212,175,55,0.15)]",
            settings.darkMode 
              ? "bg-black/55 border-white/5 hover:border-brand-gold/30 hover:bg-black/65" 
              : "bg-[#041c0c]/40 border-brand-gold/15 hover:border-brand-gold/30"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-[1500ms] transition-all -skew-x-12 z-0 pointer-events-none" />
          {/* Background Icon Decoration */}
          <motion.div animate={{ y: [0, -8, 0], rotate: [-12, -8, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-700 pointer-events-none group-hover:opacity-[0.06]">
            <BookOpen className="w-44 h-44 stroke-[1] text-brand-gold transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:-translate-y-2" />
          </motion.div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div 
              className={cn(
                "w-12 h-12 rounded-[16px] flex items-center justify-center overflow-hidden shrink-0 border transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-105", 
                (!lastBook?.coverImage && !lastBook?.coverColor) && (
                  settings.darkMode 
                  ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" 
                  : "bg-brand-gold/20 text-brand-gold border-brand-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                )
              )}
              style={lastBook?.coverColor && !lastBook?.coverImage ? { backgroundColor: lastBook.coverColor } : undefined}
            >
              {lastBook?.coverImage ? (
                <img src={lastBook.coverImage} alt="Capa" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <GraduationCap className={cn(
                  "w-6 h-6", 
                  lastBook?.coverColor ? "text-white" : "text-brand-gold"
                )} />
              )}
            </div>
            {lastBook && <span className="text-xs font-black text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-lg">{(lastBook.lastPage! / lastBook.totalPages! * 100).toFixed(0)}%</span>}
          </div>
          <div className="relative z-10">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] mb-1 text-brand-gold">Último Estudo</p>
            <p className="font-bold text-[13px] leading-tight line-clamp-2 text-white">
              {lastBook ? lastBook.name.replace('.pdf', '') : "Comece a estudar"}
            </p>
          </div>
        </motion.div>

        {/* Widget 3: Financeiro / PIX */}
        <motion.div variants={itemVariants} animate={{ y: [0, -3, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPixMenu(true)}
          whileHover={{ scale: 1.03, y: -4 }} className={cn(
            "p-5 rounded-[32px] border flex flex-col justify-between relative transition-all active:scale-[0.98] group overflow-hidden cursor-pointer shadow-[0_8px_32px_0_rgba(4,28,12,0.3)] backdrop-blur-lg hover:shadow-[0_8px_32px_0_rgba(212,175,55,0.15)]",
            settings.darkMode 
              ? "bg-black/55 border-white/5 hover:border-brand-gold/30 hover:bg-black/65" 
              : "bg-[#041c0c]/40 border-brand-gold/15 hover:border-brand-gold/30"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-[1500ms] transition-all -skew-x-12 z-0 pointer-events-none" />
          {/* Background Icon Decoration */}
          <motion.div animate={{ y: [0, -8, 0], rotate: [-12, -8, -12] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-700 pointer-events-none group-hover:opacity-[0.06]">
            <div className="relative">
              <Banknote className="w-44 h-44 stroke-[1] text-emerald-600 transition-all duration-700 ease-out group-hover:scale-110 group-hover:-rotate-6" />
              <div className="absolute inset-0 flex items-center justify-center pt-2">
                <DollarSign className="w-16 h-16 stroke-[2] text-emerald-600 opacity-40" />
              </div>
            </div>
          </motion.div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={cn(
              "p-3 rounded-[16px] backdrop-blur-sm border transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.25)]", 
              settings.darkMode 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            )}>
              <motion.div animate={{ y: [0, -2, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}><Wallet className="w-6 h-6" /></motion.div>
            </div>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronRight className={cn("w-5 h-5 transition-colors", settings.darkMode ? "text-gray-400 group-hover:text-emerald-400" : "text-gray-300 group-hover:text-brand-gold")} /></motion.div>
          </div>
          <div className="relative z-10">
            <p className="text-[8px] font-black uppercase tracking-[0.15em] mb-1 text-emerald-400">Dados Bancários</p>
            <p className="font-bold text-[13px] leading-tight text-white">PIX / Ajuda</p>
          </div>
        </motion.div>

        {/* Area: Contatos e Localização */}
        <div className="col-span-2 space-y-4 mb-4">
          
          {/* Endereço do Terreiro */}
          <motion.div variants={itemVariants} whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02, y: -2 }} className={cn(
            "p-6 sm:p-8 rounded-[36px] transition-all duration-300 relative overflow-hidden flex items-center gap-4 sm:gap-6 group active:translate-y-[-2px] shadow-[0_8px_32px_0_rgba(4,28,12,0.3)] backdrop-blur-lg hover:shadow-[0_8px_32px_0_rgba(212,175,55,0.15)]",
            settings.darkMode 
              ? "bg-black/55 border-white/5 hover:border-brand-gold/30 hover:bg-black/65" 
              : "bg-[#041c0c]/40 border-brand-gold/15 hover:border-brand-gold/30"
          )}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 group-hover:-translate-x-full hover:duration-[1000ms] transition-all -skew-x-12 z-0 pointer-events-none" />
          {/* Background Map Decoration */}
            <motion.div animate={{ y: [0, -12, 0], rotate: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -right-6 -bottom-6 opacity-[0.03] transition-transform duration-500 pointer-events-none">
              <MapPin className="w-48 h-48 sm:w-56 sm:h-56 stroke-[1] transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-[15deg] group-hover:-translate-y-4" />
            </motion.div>

            <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1], y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-[24px] sm:rounded-[28px] shrink-0 transition-transform duration-300 active:scale-105 active:rotate-3 shadow-[0_0_15px_rgba(239,68,68,0.25)] border",
              settings.darkMode ? "bg-red-500/20 text-red-400 border-red-500/20" : "bg-red-500/20 text-red-400 border-red-500/30"
            )}>
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
            </motion.div>
            
            <div className="flex-1 min-w-0 pr-2 relative z-10">
              <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 sm:mb-2 text-red-400">
                Endereço do Terreiro
              </p>
              <p className="font-bold text-[14px] sm:text-[16px] leading-tight mb-1 truncate whitespace-normal transition-colors text-white">
                Av. Sapopemba,<br/>
                16068 - Jd ster
              </p>
              <p className="text-[11px] sm:text-xs font-medium text-gray-300">
                São Paulo - SP, 08830-180
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 relative z-10">
              <button 
                onClick={(e) => { e.preventDefault(); copyToClipboard("Av. Sapopemba, 16068 - Jd ster, São Paulo - SP, 08830-180", "address"); }}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[20px] transition-all active:scale-95 group/btn border",
                  copied === 'address' 
                    ? "bg-green-500 text-white border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                    : settings.darkMode 
                      ? "bg-white/5 border-white/5 text-gray-300 active:bg-red-500/20 active:text-red-400" 
                      : "bg-white/5 border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:border-brand-gold/30 hover:shadow-[0_0_10px_rgba(212,175,55,0.15)] shadow-sm"
                )}
              >
                {copied === 'address' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Copy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" /></motion.div>}
              </button>
              <a 
                href="https://maps.app.goo.gl/bVTm79ZwaBrbJHq19?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[20px] transition-all active:scale-95 group/btn border",
                  settings.darkMode ? "bg-white/5 border-white/5 text-gray-300 active:bg-red-500/20 active:text-red-400" : "bg-white/5 border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:border-brand-gold/30 hover:shadow-[0_0_10px_rgba(212,175,55,0.15)] shadow-sm"
                )}
              >
                <motion.div animate={{ scale: [1, 1.1, 1], y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}><ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" /></motion.div>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>


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

      {/* 3. Atalhos / Favoritos Rápidos */}
      <motion.section variants={itemVariants} className="mb-8 pl-2">
        <div className="flex items-center justify-between mb-4 pr-4">
          <h3 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", settings.darkMode ? "text-gray-400" : "text-gray-300")}>
            Meus Favoritos
          </h3>
          <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><Heart className="w-3 h-3 text-brand-copper/50 fill-brand-copper/10" /></motion.div>
        </div>

        {(favBaths.length > 0 || favPontos.length > 0 || favBooks.length > 0) ? (
          <>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pr-4 p-1 rounded-full" style={{ backgroundColor: settings.darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
              {['all', ...(favBaths.length > 0 ? ['baths'] : []), ...(favPontos.length > 0 ? ['pontos'] : []), ...(favBooks.length > 0 ? ['books'] : [])].map((tab) => {
                const isSelected = favFilter === tab;
                const labels: any = { all: 'Todos', baths: 'Banhos', pontos: 'Pontos', books: 'Estudos' };
                const activeColor = tab === 'baths' ? 'bg-emerald-500 text-white' : tab === 'pontos' ? 'bg-rose-500 text-white' : tab === 'books' ? 'bg-indigo-500 text-white' : settings.darkMode ? 'bg-white text-black' : 'bg-brand-navy text-white';
                const inactiveColor = settings.darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600';
                
                return (
                  <button
                    key={tab}
                    onClick={() => setFavFilter(tab as any)}
                    className={cn(
                      "relative px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors whitespace-nowrap",
                      isSelected ? activeColor : inactiveColor
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeFavFilter"
                        className="absolute inset-0 rounded-full -z-10"
                        style={{ backgroundColor: settings.darkMode ? (tab === 'all' ? '#fff' : tab === 'baths' ? '#10b981' : tab === 'pontos' ? '#f43f5e' : '#6366f1') : (tab === 'all' ? '#1a365d' : tab === 'baths' ? '#10b981' : tab === 'pontos' ? '#f43f5e' : '#6366f1') }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{labels[tab]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-8 pr-4 scrollbar-hide snap-x relative">
              {(favFilter === 'all' || favFilter === 'baths') && favBaths.map(bath => (
                <div key={bath.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 active:border-emerald-500/30 active:shadow-[0_8px_30px_rgba(16,185,129,0.15)] active:-translate-y-1"
                        : "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 shadow-sm active:shadow-[0_12px_40px_rgba(16,185,129,0.12)] active:border-emerald-200 active:-translate-y-1"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 active:scale-110 active:rotate-6",
                      settings.darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-white text-emerald-600 shadow-sm"
                    )}>
                      <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity }}><Leaf className="w-6 h-6" /></motion.div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1.5", settings.darkMode ? "text-emerald-500/80" : "text-emerald-600/80")}>Banho</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 active:text-white" : "text-white active:text-emerald-900")}>{bath.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBath(e, bath.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-emerald-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-emerald-500 opacity-60 active:opacity-100" />
                  </button>
                </div>
              ))}
              
              {(favFilter === 'all' || favFilter === 'pontos') && favPontos.map(ponto => (
                <div key={ponto.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 active:border-rose-500/30 active:shadow-[0_8px_30px_rgba(244,63,94,0.15)] active:-translate-y-1"
                        : "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 shadow-sm active:shadow-[0_12px_40px_rgba(244,63,94,0.12)] active:border-rose-200 active:-translate-y-1"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 active:scale-110 active:-rotate-6",
                      settings.darkMode ? "bg-rose-500/20 text-rose-400" : "bg-white text-rose-600 shadow-sm"
                    )}>
                      <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity }}><Music className="w-6 h-6" /></motion.div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1.5", settings.darkMode ? "text-rose-500/80" : "text-rose-600/80")}>Ponto</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 active:text-white" : "text-white active:text-rose-900")}>{ponto.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavPonto(e, ponto.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-rose-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-rose-500 opacity-60 active:opacity-100" />
                  </button>
                </div>
              ))}

              {(favFilter === 'all' || favFilter === 'books') && favBooks.map(book => (
                <div key={book.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }} onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 active:border-indigo-500/30 active:shadow-[0_8px_30px_rgba(99,102,241,0.15)] active:-translate-y-1"
                        : "bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border-white/10 shadow-sm active:shadow-[0_12px_40px_rgba(99,102,241,0.12)] active:border-indigo-200 active:-translate-y-1"
                    )}
                  >
                    <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className={cn(
                      "w-12 h-12 rounded-[20px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-500 active:scale-110", 
                      (!book.coverImage && !book.coverColor) ? (settings.darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-white text-indigo-600") : ""
                    )} style={book.coverColor && !book.coverImage ? { backgroundColor: book.coverColor } : undefined}>
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                      ) : (
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}><GraduationCap className={cn("w-6 h-6", book.coverColor ? "text-white" : "")} /></motion.div>
                      )}
                    </div>

                    <div className="relative z-10 mt-auto">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5" style={{ color: book.coverColor || (settings.darkMode ? '#818cf8' : '#4f46e5') }}>Estudo</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 active:text-white" : "text-white active:text-indigo-900")}>{book.name.replace('.pdf', '')}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBook(e, book.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all active:bg-indigo-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-indigo-500 opacity-60 active:opacity-100" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={cn(
            "p-6 sm:p-8 rounded-[32px] border flex flex-col items-center justify-center text-center mr-4 mt-2",
            settings.darkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-gray-100 shadow-sm"
          )}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-300"
            )}>
              <Heart className="w-8 h-8 stroke-[1.5]" />
            </motion.div>
            <h4 className={cn("font-bold text-base mb-2", settings.darkMode ? "text-gray-200" : "text-white")}>
              Nenhum favorito ainda
            </h4>
            <p className={cn("text-[13px] leading-relaxed max-w-[220px] mb-6", settings.darkMode ? "text-gray-400" : "text-gray-300")}>
              Salve seus banhos, pontos e estudos preferidos para ter acesso rápido aqui.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/herbs')}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95",
                  settings.darkMode ? "bg-emerald-500/20 text-emerald-400 active:bg-emerald-500/30" : "bg-emerald-50 text-emerald-700 active:bg-emerald-100 border border-white/10"
                )}
              >
                + Banho
              </button>
              <button 
                onClick={() => navigate('/points')}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95",
                  settings.darkMode ? "bg-rose-500/20 text-rose-400 active:bg-rose-500/30" : "bg-rose-50 text-rose-700 active:bg-rose-100 border border-white/10"
                )}
              >
                + Ponto
              </button>
            </div>
          </div>
        )}
      </motion.section>
      {/* 4. Agenda Resumida */}
      <motion.section variants={itemVariants} className="px-2 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-black text-[10px] uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-300")}>
            Próximos Eventos
          </h3>
          <button 
            onClick={() => navigate('/calendar', { state: { scrollToAgenda: true } })}
            className="text-[10px] font-black uppercase tracking-widest text-brand-copper active:underline active:scale-95 transition-all"
          >
            Ver Detalhes
          </button>
        </div>
        
        <div className="space-y-3">
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
                 whileHover={{ scale: 1.02, x: 5 }} className={cn(
                   "w-full flex items-center gap-4 p-4 rounded-[28px] border transition-all active:scale-[0.98] text-left group relative overflow-hidden",
                   settings.darkMode ? "bg-[#1A1A1A] border-white/10 active:border-gray-700" : "bg-white/10 border-white/10 backdrop-blur-md shadow-sm active:border-brand-copper/30 active:shadow-md",
                   isEventToday && (settings.darkMode ? "border-brand-copper/30 bg-brand-copper/10" : "border-brand-copper/30 bg-brand-copper/5 shadow-brand-copper/10")
                 )}
              >
                {/* Decoration line for today */}
                {isEventToday && (
                  <motion.div animate={{ height: ['48px', '32px', '48px'], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 rounded-r-full bg-brand-copper" />
                )}

                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <div className="absolute right-4 opacity-100 transition-all duration-300 pointer-events-none">
                  <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ChevronRight className="w-5 h-5 text-gray-400 opacity-60" /></motion.div>
                </div>
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-[22px] border transition-colors shrink-0"
,
                    isEventToday && (settings.darkMode ? "border-brand-copper/50 text-brand-copper shadow-lg shadow-brand-copper/10" : "text-brand-copper border-brand-copper/30 shadow-lg shadow-brand-copper/20")
                  )}
                  style={!isEventToday ? {
                    backgroundColor: settings.darkMode ? getCategoryColor(event.category) + '15' : getCategoryColor(event.category) + '10',
                    borderColor: settings.darkMode ? getCategoryColor(event.category) + '30' : getCategoryColor(event.category) + '20',
                    color: settings.darkMode ? '#fff' : getCategoryColor(event.category)
                  } : {
                    backgroundColor: settings.darkMode ? 'rgba(184, 134, 11, 0.2)' : 'rgba(184, 134, 11, 0.1)'
                  }}
                >
                  <span className="text-xl leading-none font-black" style={!isEventToday && !settings.darkMode ? { color: '#0f172a' } : {}}>
                    {format(eventDate, 'dd')}
                  </span>
                  <span className={cn("text-[8px] uppercase font-bold tracking-widest mt-1", isEventToday ? "" : "opacity-80")} style={!isEventToday && !settings.darkMode ? { color: getCategoryColor(event.category) } : {}}>
                    {format(eventDate, 'MMM', { locale: ptBR }).replace('.', '')}
                  </span>
                </div>
                 
                 <div className="flex-1 overflow-hidden py-1">
                   <div className="flex items-center gap-2 mb-1.5">
                     <span 
                       className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                       style={{ 
                         color: getCategoryColor(event.category),
                         backgroundColor: settings.darkMode ? getCategoryColor(event.category) + '20' : getCategoryColor(event.category) + '15'
                       }}
                     >
                       {event.category}
                     </span>
                     {isEventToday && (
                       <span className="text-[8px] font-black uppercase tracking-wider text-brand-copper flex items-center gap-1 animate-pulse">
                         <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-brand-copper" /> Hoje
                       </span>
                     )}
                   </div>

                   <p className={cn(
                     "font-medium text-[15px] leading-tight truncate", 
                     settings.darkMode ? "text-white active:text-gray-200 transition-colors" : "text-[#1a202c] active:text-white transition-colors",
                     event.isCanceled && "line-through opacity-50"
                   )}>
                     {event.title}
                     {event.isCanceled && <span className="ml-2 text-[9px] font-black text-red-500 uppercase tracking-widest no-underline opacity-100 italic">Cancelado</span>}
                   </p>
                   
                   {event.reminder && (
                     <div className="flex gap-3 items-center mt-1">
                       <span className={cn("text-[10px] flex items-center gap-1 font-medium", isEventToday ? "text-brand-copper" : "text-gray-400")}>
                         <Clock className="w-3 h-3" /> {event.reminder}
                       </span>
                     </div>
                   )}
                 </div>
                 <div className="opacity-0 active:opacity-100 transition-opacity pr-2 shrink-0">
                   <ChevronRight className={cn("w-5 h-5", settings.darkMode ? "text-gray-300" : "text-gray-300")} />
                 </div>
              </motion.button>
            );
          })}
          
          {upcomingEvents.length === 0 && (
             <div className="p-8 text-center rounded-[32px] border border-dashed border-gray-200 dark:border-white/10">
               <motion.div animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}><Calendar className="w-8 h-8 text-gray-300 dark:text-gray-300 mx-auto mb-3" /></motion.div>
               <p className="text-gray-400 text-xs font-medium">Nenhum evento agendado para os próximos dias.</p>
             </div>
          )}
          
          {upcomingEvents.length > 4 && (
            <button 
              onClick={() => navigate('/calendar')}
              className={cn(
                "w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                settings.darkMode ? "text-gray-400 active:bg-white/5" : "text-gray-300 active:bg-black/5"
              )}
            >
              Ver agenda completa
            </button>
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
