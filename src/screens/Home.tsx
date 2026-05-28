
import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, Calendar, Leaf, Music, MessageSquare, CreditCard, Copy, CheckCircle2, BookOpen, Search, X, GraduationCap, Anchor, ChevronRight, ChevronLeft, Sparkles, Clock, Wallet, MapPin, ExternalLink, Phone, HeartOff, User, MessageCircle, Bot, Loader2, Banknote, DollarSign, GripVertical, Mic, ArrowUp, Sun, Sword, ShieldCheck } from 'lucide-react';
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

export default function HomeScreen() {
  const { setIsScrolled } = useAssistant();
  const navigate = useNavigate();

  // 100 Permanent ambient particles representing Axé energy (Sparks of Oya with gold/copper & Ogum with blue)
  const ambientParticles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      const size = Math.random() * 3.5 + 1.5; // 1.5px to 5.0px
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 18 + 12; // 12s to 30s
      const delay = Math.random() * -30;
      const maxOpacity = Math.random() * 0.35 + 0.15;
      
      const color = i % 3 === 0 
        ? 'rgba(212, 175, 55, 0.55)' // Divine Gold
        : i % 3 === 1 
          ? 'rgba(249, 115, 22, 0.5)' // Divine Copper / Warm Orange (Oya)
          : 'rgba(57, 150, 255, 0.45)'; // Divine Blue (Ogum)

      // Distribute types: 0=float, 1=wind, 2=twinkle, 3=pulse
      const typeNum = i % 4;
      let initialStyle: { left: string; top: string } = { left: `${x}%`, top: `${y}%` };
      let animate: any;
      
      if (typeNum === 0) {
        // Classical spiritual floating upward
        animate = {
          y: ['105vh', '-10vh'],
          x: ['0%', i % 2 === 0 ? '30px' : '-30px', '0%'],
          opacity: [0, maxOpacity, maxOpacity, 0],
          scale: [1, 1.3, 0.9, 1],
        };
      } else if (typeNum === 1) {
        // Winds of Oya: horizontal sweep from left to right, rising slightly
        animate = {
          x: ['-15vw', '115vw'],
          y: [`${y}%`, `${Math.max(0, y - 30)}%`],
          opacity: [0, maxOpacity, maxOpacity * 0.6, 0],
          scale: [0.7, 1.4, 0.7],
        };
        // Override initialStyle left
        initialStyle.left = '-15vw';
      } else if (typeNum === 2) {
        // Twinkling points of light: rise slowly, oscillate size rapidly
        animate = {
          y: ['105vh', '-10vh'],
          opacity: [0, maxOpacity, maxOpacity * 0.15, maxOpacity, 0],
          scale: [0.5, 1.7, 0.5, 1.7, 0.5],
        };
      } else {
        // Stationary power circles: drift slightly, breathe rhythmically
        animate = {
          y: [`${y}%`, `${Math.min(100, y + 6)}%`, `${y}%`],
          x: [`${x}%`, `${Math.min(100, x + 4)}%`, `${x}%`],
          scale: [1, 1.9, 1],
          opacity: [maxOpacity * 0.25, maxOpacity, maxOpacity * 0.25],
        };
        // Handled coordinate within keyframes relative to placement
        initialStyle = { left: '0%', top: '0%' };
      }

      return {
        id: i,
        size,
        color,
        duration,
        delay,
        initialStyle,
        animate,
      };
    });
  }, []);

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

  const currentDate = new Date();
  const greeting = currentDate.getHours() < 12 ? "Bom dia" : currentDate.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const displayName = settings.nickname?.trim() 
    ? settings.nickname.trim() 
    : settings.firstName?.trim() 
      ? settings.firstName.trim().split(' ')[0] 
      : "Guerreiro";

  return (
    <div 
      className={cn(
        "p-4 pb-32 transition-colors duration-500 bg-transparent relative overflow-hidden min-h-screen"
      )}
    >
      {/* 100 Permanent background particles floating infinitely representing spiritual force / Axé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {ambientParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2.8}px ${p.color}`,
              ...p.initialStyle,
            }}
            animate={p.animate}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* 1. Header Profiling */}
      <header className="flex items-center justify-between mb-8 mt-2 px-2 gap-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-brand-copper" />
            </motion.div>
            <span className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <h2 className={cn(
            "text-2xl tracking-tight flex items-center gap-2",
            settings.darkMode ? "text-white" : "text-brand-navy"
          )} style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            {greeting}, {displayName}!
          </h2>
        </div>

        {/* Premium Daily Message Card removed as per user request */}
      </header>

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
                ? "bg-[#1A1A1A] border-gray-800 text-gray-200" 
                : "bg-white border-brand-copper/20 text-brand-navy shadow-xl shadow-brand-copper/5"
            )}>
              {/* Spiritual whisper background ripple */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-brand-copper/0 via-brand-copper/[0.04] to-brand-copper/0 pointer-events-none"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-copper/10 rounded-xl text-brand-copper">
                    <Bot className="w-4 h-4 animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">Assistente Oya Ogum</span>
                </div>
                <button 
                  onClick={() => setAiResponse(null)}
                  className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative z-10"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-sm font-bold leading-relaxed italic relative z-10">
                "{aiResponse}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento Grid Dashboard */}
      <section className="grid grid-cols-2 gap-3 mb-8 px-2 relative z-10">
        {/* Widget 1: Próxima Gira */}
        <motion.div 
          onClick={() => navigate('/calendar')}
          className={cn(
            "col-span-2 p-5 rounded-[28px] border relative overflow-hidden transition-all duration-300 active:scale-[0.98] group cursor-pointer",
            settings.darkMode 
              ? "bg-[#1E140F] border-brand-gold/20 hover:border-brand-gold/40 hover:shadow-[0_8px_30px_rgba(212,175,55,0.06)] shadow-xl shadow-black/50" 
              : "bg-[#FAF5F0] border-[#CD7F32]/20 shadow-md shadow-[#CD7F32]/5 hover:border-[#CD7F32]/45 hover:shadow-[0_8px_30px_rgba(205,127,50,0.08)]"
          )}
          animate={{
            borderColor: settings.darkMode 
              ? ["rgba(212,175,55,0.15)", "rgba(212,175,55,0.35)", "rgba(212,175,55,0.15)"]
              : ["rgba(205,127,50,0.15)", "rgba(205,127,50,0.3)", "rgba(205,127,50,0.15)"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Inner ambient spiritual warm breathing aura */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-[#CD7F32]/0 via-[#CD7F32]/[0.03] to-brand-gold/[0.03] pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Background Icon Decoration - Gentle looping rotation */}
          <motion.div 
            className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-105 pointer-events-none"
            animate={{ rotate: [-12, -7, -12] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Calendar className={cn("w-44 h-44 stroke-[1]", settings.darkMode ? "text-brand-gold" : "text-[#CD7F32]")} />
          </motion.div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                {/* Continuous radiating waves under the next event badge */}
                <motion.div 
                  className="absolute inset-0 rounded-xl bg-brand-gold/20 dark:bg-brand-gold/15 blur-[2px]"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className={cn(
                  "p-1.5 rounded-xl border flex items-center justify-center shrink-0 relative z-10",
                  settings.darkMode 
                    ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" 
                    : "bg-brand-copper/10 text-[#CD7F32] border-[#CD7F32]/25"
                )}>
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                settings.darkMode ? "text-brand-gold/80" : "text-[#CD7F32]/90"
              )}>
                Próximo Evento
              </span>
            </div>
            
            {nextEvent ? (
              <div>
                <h3 className={cn(
                  "text-[14px] font-extrabold leading-snug mb-1.5 pr-12 font-sans tracking-tight",
                  settings.darkMode ? "text-white" : "text-brand-navy",
                  nextEvent.isCanceled && "line-through opacity-50"
                )}>
                  {nextEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={cn(
                    "text-[8px] font-bold leading-none px-2 py-1 rounded-md border",
                    settings.darkMode 
                      ? "bg-white/5 border-white/5 text-gray-300" 
                      : "bg-brand-navy/5 border-brand-navy/10 text-brand-navy/80"
                  )}>
                    {format(parseISO(nextEvent.date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border",
                    settings.darkMode 
                      ? "bg-white/5 border-white/5 text-brand-gold-light" 
                      : "bg-brand-copper/5 border-brand-copper/15 text-brand-copper"
                  )}>
                    {nextEvent.category}
                  </span>
                  {nextEvent.isCanceled && (
                    <span className="text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md text-red-400">
                      Cancelado
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h3 className={cn(
                  "text-[14px] font-extrabold leading-snug mb-1 pr-12 font-sans tracking-tight",
                  settings.darkMode ? "text-white/90" : "text-[#3E2723]"
                )}>
                  A Casa está em Harmonia
                </h3>
                <p className={cn(
                  "text-[10px] leading-normal font-medium max-w-[280px]",
                  settings.darkMode ? "text-gray-400" : "text-brand-navy/60"
                )}>
                  Nenhum evento agendado para os próximos dias.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Widget 2: Estudo / Progresso */}
        <motion.div 
          onClick={() => lastBook ? navigate('/studies', { state: { openBookId: lastBook.id } }) : navigate('/studies')}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98] group overflow-hidden",
            settings.darkMode 
              ? "bg-[#141414] border-gray-800 hover:border-brand-gold/30" 
              : "bg-white border-[#FAF5F0] hover:border-brand-gold/20 shadow-md shadow-brand-gold/5"
          )}
          animate={{
            borderColor: settings.darkMode 
              ? ["rgba(212,175,55,0.06)", "rgba(212,175,55,0.18)", "rgba(212,175,55,0.06)"]
              : ["rgba(212,175,55,0.08)", "rgba(212,175,55,0.20)", "rgba(212,175,55,0.08)"]
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Inner ambient spiritual gold aura */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-brand-gold/0 via-[#D4AF37]/[0.03] to-brand-gold/0 pointer-events-none"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Background Icon Decoration - floating loop */}
          <motion.div 
            className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:scale-110 pointer-events-none"
            animate={{ y: [0, -4, 0], rotate: [-12, -15, -12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <BookOpen className="w-44 h-44 stroke-[1] text-brand-gold" />
          </motion.div>

          <div className="flex items-center justify-between mb-3 relative z-10">
            <motion.div 
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border transition-colors", 
                (!lastBook?.coverImage && !lastBook?.coverColor) && (
                  settings.darkMode 
                  ? "bg-brand-gold/10 text-brand-gold border-brand-gold/20" 
                  : "bg-brand-gold text-white border-brand-gold/40 shadow-lg shadow-brand-gold/20"
                )
              )}
              style={lastBook?.coverColor && !lastBook?.coverImage ? { backgroundColor: lastBook.coverColor } : undefined}
            >
              {lastBook?.coverImage ? (
                <img src={lastBook.coverImage} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className={cn(
                  "w-5 h-5", 
                  lastBook?.coverColor ? "text-white" : (settings.darkMode ? "text-brand-gold" : "text-white")
                )} />
              )}
            </motion.div>
            {lastBook && <span className="text-[10px] font-black text-brand-gold">{(lastBook.lastPage! / lastBook.totalPages! * 100).toFixed(0)}%</span>}
          </div>
          <div className="relative z-10">
            <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1", settings.darkMode ? "text-brand-gold/70" : "text-brand-gold/80")}>Último Estudo</p>
            <p className={cn(
              "font-bold text-xs leading-tight line-clamp-2",
              settings.darkMode ? "text-white" : "text-brand-navy"
            )}>{lastBook ? lastBook.name.replace('.pdf', '') : "Comece a estudar"}</p>
          </div>
        </motion.div>

        {/* Widget 3: Financeiro / PIX */}
        <motion.div 
          onClick={() => setShowPixMenu(true)}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98] group overflow-hidden",
            settings.darkMode 
              ? "bg-[#141414] border-gray-800 hover:border-emerald-500/30" 
              : "bg-white border-emerald-50 shadow-md shadow-emerald-500/5 hover:border-emerald-200"
          )}
          animate={{
            borderColor: settings.darkMode 
              ? ["rgba(16,185,129,0.06)", "rgba(16,185,129,0.2)", "rgba(16,185,129,0.06)"]
              : ["rgba(16,185,129,0.08)", "rgba(16,185,129,0.22)", "rgba(16,185,129,0.08)"]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Inner ambient spiritual emerald aura */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/[0.03] to-emerald-500/0 pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Background Icon Decoration - floating loop */}
          <motion.div 
            className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:scale-110 pointer-events-none"
            animate={{ x: [0, -3, 0], y: [0, -2, 0], rotate: [-12, -9, -12] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative">
              <Banknote className="w-44 h-44 stroke-[1] text-emerald-600" />
              <div className="absolute inset-0 flex items-center justify-center pt-2">
                <DollarSign className="w-16 h-16 stroke-[2] text-emerald-600 opacity-40" />
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between mb-3 relative z-10">
            <motion.div 
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "p-2 rounded-xl backdrop-blur-sm border transition-colors", 
                settings.darkMode 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
              )}
            >
              <Wallet className="w-5 h-5" />
            </motion.div>
            <ChevronRight className={cn("w-4 h-4 opacity-50", settings.darkMode ? "text-gray-400" : "text-emerald-600")} />
          </div>
          <div className="relative z-10">
            <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1", settings.darkMode ? "text-emerald-500/70" : "text-emerald-600/80")}>Dados Bancários</p>
            <p className={cn(
              "font-bold text-sm leading-tight",
              settings.darkMode ? "text-white" : "text-brand-navy"
            )}>PIX / Ajuda</p>
          </div>
        </motion.div>

        {/* Area: Contatos e Localização */}
        <div className="col-span-2 space-y-4 mb-4">
          
          {/* Endereço do Terreiro - Energetic Wave Pulsing Border */}
          <motion.div 
            className={cn(
              "p-6 sm:p-8 rounded-[36px] transition-all duration-300 relative overflow-hidden flex items-center gap-4 sm:gap-6 group hover:translate-y-[-2px]",
              settings.darkMode 
                ? "bg-[#141414] border border-gray-800 hover:border-red-500/30" 
                : "bg-white border border-[#fce8e8] hover:border-[#fcd9d9] shadow-[0_8px_30px_rgba(239,68,68,0.04)]"
            )}
            animate={{
              borderColor: settings.darkMode 
                ? ["rgba(239, 68, 68, 0.08)", "rgba(239, 68, 68, 0.22)", "rgba(239, 68, 68, 0.08)"]
                : ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 0.26)", "rgba(239, 68, 68, 0.1)"]
            }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Shimmer sweep animation representing Oya currents of air / spiritual currents */}
            <motion.div 
              className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-red-500/[0.04] to-transparent pointer-events-none"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Background Map Decoration */}
            <motion.div 
              className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 pointer-events-none"
              animate={{ rotate: [-6, 2, -6] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="w-48 h-48 sm:w-56 sm:h-56 stroke-[1]" />
            </motion.div>

            {/* Pulsing indicator pin wrapper representing energy pulse (axé) */}
            <motion.div 
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-[24px] sm:rounded-[28px] shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm relative overflow-visible",
                settings.darkMode ? "bg-red-500/20 text-red-400" : "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/20"
              )}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <MapPin className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2]" />
              
              {/* Radiating wave of energy radiating outward dynamically */}
              <motion.div 
                className="absolute inset-0 rounded-[24px] sm:rounded-[28px] border-2 border-red-500/50"
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            
            <div className="flex-1 min-w-0 pr-2 relative z-10">
              <p className={cn("text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1.5 sm:mb-2", settings.darkMode ? "text-red-400/70" : "text-red-600/80")}>
                Endereço do Terreiro
              </p>
              <p className={cn("font-bold text-[14px] sm:text-[16px] leading-tight mb-1 truncate whitespace-normal transition-colors", settings.darkMode ? "text-gray-100 group-hover:text-white" : "text-brand-navy group-hover:text-[#0a182c]")}>
                Av. Sapopemba,<br/>
                16068 - Jd ster
              </p>
              <p className={cn("text-[11px] sm:text-xs font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                São Paulo - SP, 08830-180
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 shrink-0 relative z-10">
              <button 
                onClick={(e) => { e.preventDefault(); copyToClipboard("Av. Sapopemba, 16068 - Jd ster, São Paulo - SP, 08830-180", "address"); }}
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[20px] transition-all active:scale-95 group/btn",
                  copied === 'address' 
                    ? "bg-green-500 text-white shadow-md shadow-green-500/20" 
                    : settings.darkMode 
                      ? "bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-400" 
                      : "bg-white border border-gray-100 text-brand-navy hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
                )}
              >
                {copied === 'address' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Copy className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />}
              </button>
              <a 
                href="https://maps.app.goo.gl/bVTm79ZwaBrbJHq19?g_st=aw"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[20px] transition-all active:scale-95 group/btn",
                  settings.darkMode ? "bg-white/5 text-gray-300 hover:bg-red-500/20 hover:text-red-400" : "bg-white border border-gray-100 text-brand-navy hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
                )}
              >
                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Menu PIX Expandido (Overlay Modal) */}
      <AnimatePresence>
        {showPixMenu && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPixMenu(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 120, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 120, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={cn(
                "relative w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]",
                settings.darkMode ? "bg-[#141414] border border-gray-800/80" : "bg-white border border-gray-100"
              )}
            >
              {/* Top ambient luxury background aura */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-brand-copper/10 via-brand-copper/0 to-transparent pointer-events-none" />

              <div className="p-6 pb-5 border-b flex flex-col gap-2 shrink-0 relative overflow-hidden" style={{ borderColor: settings.darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                {/* Spiritual spark circle decoration */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/[0.04] dark:bg-brand-gold/[0.06] rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-copper/10 text-brand-copper rounded-2xl flex items-center justify-center shadow-inner">
                      <Wallet className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className={cn("font-black text-[10px] uppercase tracking-[0.25em] mb-0.5", settings.darkMode ? "text-brand-gold" : "text-brand-copper")}>
                        Apoio Coletivo
                      </h3>
                      <h4 className={cn("font-black text-lg tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        Contas do Templo
                      </h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPixMenu(false)} 
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-full active:scale-90 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
                
                <p className={cn("text-xs leading-relaxed mt-1 tracking-tight font-medium relative z-10", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                  O Terreiro é mantido por amor e cooperação. Colabore com o Axé das mensalidades, banhos ou benfeitorias.
                </p>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto scrollbar-hide py-5 relative z-10">
                {/* Caixa Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                  className={cn(
                    "p-5 sm:p-6 rounded-[32px] border transition-all duration-300 relative overflow-hidden group/card flex flex-col",
                    settings.darkMode 
                      ? "bg-gradient-to-br from-[#121c2c]/80 to-[#0b1019]/90 border-blue-900/40 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]" 
                      : "bg-gradient-to-br from-blue-50/70 to-white border-blue-100/80 hover:border-blue-200 hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)]"
                  )}
                >
                  {/* Watermark Logo Decorative */}
                  <div className="absolute -right-4 -top-4 w-28 h-28 bg-blue-500/[0.03] rounded-full blur-xl pointer-events-none group-hover/card:bg-blue-500/5 transition-colors duration-500" />
                  <DollarSign className="absolute right-4 top-4 w-24 h-24 text-blue-500/[0.02] dark:text-blue-500/[0.03] pointer-events-none transform translate-x-4 -translate-y-4 group-hover/card:scale-110 transition-transform duration-500" />

                  <div className="flex items-center gap-3.5 mb-5 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-blue-50/50 shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover/card:scale-105">
                      {settings.caixaLogo ? (
                        <img src={settings.caixaLogo} alt="Caixa" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#105391] flex flex-col items-center justify-center p-1">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">CAIXA</span>
                          <span className="text-[6px] font-bold text-orange-400 mt-0.5 tracking-tight">FEDERAL</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className={cn("text-[8px] font-black uppercase tracking-[0.2em] mb-0.5", settings.darkMode ? "text-blue-400" : "text-blue-600")}>
                          Mensalidade Oficial
                        </p>
                      </div>
                      <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-gray-100" : "text-brand-navy")}>
                        Caixa Econômica
                      </p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-[22px] flex items-center justify-between gap-4 mt-auto border transition-all duration-300",
                    settings.darkMode 
                      ? "bg-slate-950/40 border-slate-800/60" 
                      : "bg-white border-blue-100/50 shadow-sm"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-[0.16em] mb-1">Chave Copiar PIX (CPF)</p>
                      <p className={cn("text-xs sm:text-[13px] font-mono font-black tracking-widest truncate select-all", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        33464358810
                      </p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('33464358810', 'caixa')}
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 shrink-0 shadow-lg cursor-pointer",
                        copied === 'caixa'
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 hover:shadow-blue-500/30"
                      )}
                    >
                      {copied === 'caixa' ? (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><CheckCircle2 className="w-5 h-5" /></motion.div>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Nubank Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className={cn(
                    "p-5 sm:p-6 rounded-[32px] border transition-all duration-300 relative overflow-hidden group/card flex flex-col",
                    settings.darkMode 
                      ? "bg-gradient-to-br from-[#211124]/80 to-[#120715]/90 border-purple-950/40 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(138,5,190,0.15)]" 
                      : "bg-gradient-to-br from-purple-50/70 to-white border-purple-100/80 hover:border-purple-200 hover:shadow-[0_12px_40px_rgba(138,5,190,0.08)]"
                  )}
                >
                  {/* Watermark Logo Decorative */}
                  <div className="absolute -right-4 -top-4 w-28 h-28 bg-purple-500/[0.03] rounded-full blur-xl pointer-events-none group-hover/card:bg-purple-500/5 transition-colors duration-500" />
                  <Banknote className="absolute right-4 top-4 w-24 h-24 text-purple-500/[0.02] dark:text-purple-500/[0.03] pointer-events-none transform translate-x-4 -translate-y-4 group-hover/card:scale-110 transition-transform duration-500" />

                  <div className="flex items-center gap-3.5 mb-5 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-purple-50/50 shrink-0 flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover/card:scale-105">
                      {settings.nubankLogo ? (
                        <img src={settings.nubankLogo} alt="Nubank" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#8A05BE] flex items-center justify-center">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">NU</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        <p className={cn("text-[8px] font-black uppercase tracking-[0.18em] mb-0.5", settings.darkMode ? "text-purple-400" : "text-purple-600")}>
                          Diversos & Banhos
                        </p>
                      </div>
                      <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-gray-100" : "text-brand-navy")}>
                        Nubank
                      </p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-[22px] flex items-center justify-between gap-4 mt-auto border transition-all duration-300",
                    settings.darkMode 
                      ? "bg-purple-950/20 border-purple-900/10" 
                      : "bg-white border-purple-100/50 shadow-sm"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-[0.16em] mb-1">Chave Copiar PIX (Celular)</p>
                      <p className={cn("text-xs sm:text-[13px] font-mono font-black tracking-widest truncate select-all", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        11982350614
                      </p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('11982350614', 'nubank')}
                      className={cn(
                        "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 shrink-0 shadow-lg cursor-pointer",
                        copied === 'nubank'
                          ? "bg-emerald-500 text-white shadow-emerald-500/20"
                          : "bg-[#8A05BE] hover:bg-[#a607e4] text-white shadow-purple-500/20 hover:shadow-purple-500/30"
                      )}
                    >
                      {copied === 'nubank' ? (
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><CheckCircle2 className="w-5 h-5" /></motion.div>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Secure checkout footer badge */}
              <div className={cn(
                "p-4 border-t flex items-center gap-2.5 justify-center shrink-0 text-center relative z-10",
                settings.darkMode ? "border-white/5 bg-black/30 text-gray-400" : "border-gray-100 bg-gray-50/50 text-gray-500"
              )}>
                <ShieldCheck className="w-4 h-4 text-emerald-500 stroke-[2] animate-pulse" />
                <p className="text-[10px] sm:text-[11px] font-bold tracking-tight">
                  PIX Oficiais do Terreiro. Obrigado por apoiar!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Atalhos / Favoritos Rápidos */}
      <section className="mb-8 pl-2">
        <div className="flex items-center justify-between mb-4 pr-4">
          <h3 className={cn("font-black text-[10px] uppercase tracking-[0.2em]", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
            Meus Favoritos
          </h3>
          <Heart className="w-3 h-3 text-brand-copper/50 fill-brand-copper/10" />
        </div>

        {(favBaths.length > 0 || favPontos.length > 0 || favBooks.length > 0) ? (
          <>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pr-4">
              <button
                onClick={() => setFavFilter('all')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                  favFilter === 'all' 
                    ? (settings.darkMode ? "bg-white text-black" : "bg-brand-navy text-white")
                    : (settings.darkMode ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200")
                )}
              >
                Todos
              </button>
              {favBaths.length > 0 && (
                <button
                  onClick={() => setFavFilter('baths')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    favFilter === 'baths' 
                      ? (settings.darkMode ? "bg-emerald-500 text-white" : "bg-emerald-500 text-white")
                      : (settings.darkMode ? "bg-emerald-500/10 text-emerald-500/70 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")
                  )}
                >
                  Banhos
                </button>
              )}
              {favPontos.length > 0 && (
                <button
                  onClick={() => setFavFilter('pontos')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    favFilter === 'pontos' 
                      ? (settings.darkMode ? "bg-rose-500 text-white" : "bg-rose-500 text-white")
                      : (settings.darkMode ? "bg-rose-500/10 text-rose-500/70 hover:bg-rose-500/20" : "bg-rose-50 text-rose-600 hover:bg-rose-100")
                  )}
                >
                  Pontos
                </button>
              )}
              {favBooks.length > 0 && (
                <button
                  onClick={() => setFavFilter('books')}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                    favFilter === 'books' 
                      ? (settings.darkMode ? "bg-indigo-500 text-white" : "bg-indigo-500 text-white")
                      : (settings.darkMode ? "bg-indigo-500/10 text-indigo-500/70 hover:bg-indigo-500/20" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100")
                  )}
                >
                  Estudos
                </button>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-8 pr-4 scrollbar-hide snap-x relative animate-none">
              {(favFilter === 'all' || favFilter === 'baths') && favBaths.map(bath => (
                <div key={bath.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button 
                    onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-[#111c18] to-[#0d1411] border-[#182b22] hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1"
                        : "bg-gradient-to-b from-emerald-50 to-white border-emerald-100 shadow-sm hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)] hover:border-emerald-200 hover:-translate-y-1"
                    )}
                    animate={{
                      borderColor: settings.darkMode 
                        ? ["rgba(16, 185, 129, 0.1)", "rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.1)"]
                        : ["rgba(16, 185, 129, 0.15)", "rgba(16, 185, 129, 0.35)", "rgba(16, 185, 129, 0.15)"]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.85, 0.6] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 relative z-10",
                        settings.darkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-white text-emerald-600 shadow-sm"
                      )}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Leaf className="w-5 h-5 animate-none" />
                    </motion.div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1.5", settings.darkMode ? "text-emerald-500/80" : "text-emerald-600/80")}>Banho</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 group-hover:text-white" : "text-brand-navy group-hover:text-emerald-900")}>{bath.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBath(e, bath.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all hover:bg-emerald-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-emerald-500 opacity-60 hover:opacity-100" />
                  </button>
                </div>
              ))}
              
              {(favFilter === 'all' || favFilter === 'pontos') && favPontos.map(ponto => (
                <div key={ponto.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button 
                    onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-[#1c1114] to-[#140d0f] border-[#2b181a] hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgba(244,63,94,0.15)] hover:-translate-y-1"
                        : "bg-gradient-to-b from-rose-50 to-white border-rose-100 shadow-sm hover:shadow-[0_12px_40px_rgba(244,63,94,0.12)] hover:border-rose-200 hover:-translate-y-1"
                    )}
                    animate={{
                      borderColor: settings.darkMode 
                        ? ["rgba(244, 63, 94, 0.1)", "rgba(244, 63, 94, 0.3)", "rgba(244, 63, 94, 0.1)"]
                        : ["rgba(244, 63, 94, 0.15)", "rgba(244, 63, 94, 0.35)", "rgba(244, 63, 94, 0.15)"]
                    }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" 
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.85, 0.6] }}
                      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform duration-500 relative z-10",
                        settings.darkMode ? "bg-rose-500/20 text-rose-400" : "bg-white text-rose-600 shadow-sm"
                      )}
                      animate={{ rotate: [-6, 6, -6] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Music className="w-5 h-5 animate-none" />
                    </motion.div>

                    <div className="relative z-10 mt-auto">
                      <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1.5", settings.darkMode ? "text-rose-500/80" : "text-rose-600/80")}>Ponto</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 group-hover:text-white" : "text-brand-navy group-hover:text-rose-900")}>{ponto.title}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavPonto(e, ponto.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all hover:bg-rose-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-rose-500 opacity-60 hover:opacity-100" />
                  </button>
                </div>
              ))}

              {(favFilter === 'all' || favFilter === 'books') && favBooks.map(book => (
                <div key={book.id} className="relative group/card snap-start flex-shrink-0">
                  <motion.button 
                    onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                    className={cn(
                      "relative w-[150px] sm:w-[160px] h-[180px] sm:h-[190px] p-5 rounded-[32px] border transition-all duration-500 active:scale-95 text-left flex flex-col justify-between group overflow-hidden",
                      settings.darkMode
                        ? "bg-gradient-to-b from-[#11131c] to-[#0d0f14] border-[#181d2b] hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:-translate-y-1"
                        : "bg-gradient-to-b from-indigo-50 to-white border-indigo-100 shadow-sm hover:shadow-[0_12px_40px_rgba(99,102,241,0.12)] hover:border-indigo-200 hover:-translate-y-1"
                    )}
                    animate={{
                      borderColor: settings.darkMode 
                        ? ["rgba(99, 102, 241, 0.1)", "rgba(99, 102, 241, 0.3)", "rgba(99, 102, 241, 0.1)"]
                        : ["rgba(99, 102, 241, 0.15)", "rgba(99, 102, 241, 0.35)", "rgba(99, 102, 241, 0.15)"]
                    }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" 
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.85, 0.6] }}
                      transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-[20px] shadow-sm flex items-center justify-center shrink-0 overflow-hidden transition-transform duration-500 relative z-10", 
                        (!book.coverImage && !book.coverColor) ? (settings.darkMode ? "bg-indigo-500/20 text-indigo-400" : "bg-white text-indigo-600") : ""
                      )} 
                      style={book.coverColor && !book.coverImage ? { backgroundColor: book.coverColor } : undefined}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover animate-none" />
                      ) : (
                        <GraduationCap className={cn("w-5 h-5", book.coverColor ? "text-white" : "")} />
                      )}
                    </motion.div>

                    <div className="relative z-10 mt-auto">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1.5" style={{ color: book.coverColor || (settings.darkMode ? '#818cf8' : '#4f46e5') }}>Estudo</p>
                      <p className={cn("font-bold text-[14px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-100 group-hover:text-white" : "text-brand-navy group-hover:text-indigo-900")}>{book.name.replace('.pdf', '')}</p>
                    </div>
                  </motion.button>
                  <button
                    onClick={(e) => toggleFavBook(e, book.id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover/card:opacity-100 transition-all hover:bg-indigo-500/10 active:scale-95 z-20"
                  >
                    <HeartOff className="w-4 h-4 text-indigo-500 opacity-60 hover:opacity-100" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <motion.div 
            className={cn(
              "p-6 sm:p-8 rounded-[32px] border flex flex-col items-center justify-center text-center mr-4 mt-2 relative overflow-hidden",
              settings.darkMode ? "bg-white/5 border-white/10" : "bg-white/80 border-gray-100 shadow-sm"
            )}
            animate={{
              borderColor: settings.darkMode
                ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.18)", "rgba(255, 255, 255, 0.1)"]
                : ["rgba(0, 0, 0, 0.05)", "rgba(205, 127, 50, 0.15)", "rgba(0, 0, 0, 0.05)"]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Ambient gold/copper floating sphere behind it */}
            <motion.div 
              className="absolute -top-12 -left-12 w-24 h-24 bg-brand-copper/10 rounded-full blur-2xl pointer-events-none"
              animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10",
                settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-300"
              )}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-8 h-8 stroke-[1.5] text-brand-copper animate-pulse" />
            </motion.div>
            <h4 className={cn("font-bold text-base mb-2 relative z-10", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
              Nenhum favorito ainda
            </h4>
            <p className={cn("text-[13px] leading-relaxed max-w-[220px] mb-6 relative z-10", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              Salve seus banhos, pontos e estudos preferidos para ter acesso rápido aqui.
            </p>
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => navigate('/herbs')}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95",
                  settings.darkMode ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100"
                )}
              >
                + Banho
              </button>
              <button 
                onClick={() => navigate('/points')}
                className={cn(
                  "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95",
                  settings.darkMode ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100"
                )}
              >
                + Ponto
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* 4. Agenda Resumida */}
      <section className="px-2 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-black text-[10px] uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
            Próximos Eventos
          </h3>
          <button 
            onClick={() => navigate('/calendar', { state: { scrollToAgenda: true } })}
            className="text-[10px] font-black uppercase tracking-widest text-brand-copper hover:underline active:scale-95 transition-all"
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
                 className={cn(
                   "w-full flex items-center gap-4 p-4 rounded-[28px] border transition-all active:scale-[0.98] text-left group relative overflow-hidden",
                   settings.darkMode ? "bg-[#1A1A1A] border-gray-800 hover:border-gray-700" : "bg-white border-gray-100 shadow-sm hover:border-brand-copper/30 hover:shadow-md",
                   isEventToday && (settings.darkMode ? "border-brand-copper/30 bg-brand-copper/10" : "border-brand-copper/30 bg-brand-copper/5 shadow-brand-copper/10")
                 )}
              >
                {/* Decoration line for today */}
                {isEventToday && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full bg-brand-copper" />
                )}

                <div 
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-[22px] border transition-colors shrink-0",
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
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" /> Hoje
                       </span>
                     )}
                   </div>

                   <p className={cn(
                     "font-medium text-[15px] leading-tight truncate", 
                     settings.darkMode ? "text-white group-hover:text-gray-200 transition-colors" : "text-[#1a202c] group-hover:text-brand-navy transition-colors",
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
                 <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
                   <ChevronRight className={cn("w-5 h-5", settings.darkMode ? "text-gray-600" : "text-gray-300")} />
                 </div>
              </motion.button>
            );
          })}
          
          {upcomingEvents.length === 0 && (
             <div className="p-8 text-center rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
               <Calendar className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
               <p className="text-gray-400 text-xs font-medium">Nenhum evento agendado para os próximos dias.</p>
             </div>
          )}
          
          {upcomingEvents.length > 4 && (
            <button 
              onClick={() => navigate('/calendar')}
              className={cn(
                "w-full py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all",
                settings.darkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-black/5"
              )}
            >
              Ver agenda completa
            </button>
          )}
        </div>

        {/* Contatos Úteis */}
        <div className={cn(
          "p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] transition-all duration-300 relative overflow-hidden group hover:translate-y-[-2px] mt-8 max-w-lg mx-auto",
          settings.darkMode 
            ? "bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-white/5 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
            : "bg-gradient-to-br from-[#f0f7ff] to-white border border-blue-100/50 hover:border-blue-200 shadow-[0_10px_40px_rgba(59,130,246,0.05)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.1)]"
        )}>
          {/* Background Phone Decoration */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 pointer-events-none">
            <Phone className="w-40 h-40 sm:w-56 sm:h-56 stroke-[1]" />
          </div>

          <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 relative z-10">
            <div className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl sm:rounded-[28px] shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:-rotate-6 shadow-lg",
              settings.darkMode ? "bg-blue-500/20 text-blue-400 shadow-blue-500/10" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30"
            )}>
              <Phone className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>
            <div>
              <p className={cn("text-[8px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-0.5 sm:mb-1", settings.darkMode ? "text-blue-400/80" : "text-blue-600")}>
                Canais de Apoio
              </p>
              <h3 className={cn("text-lg sm:text-2xl font-black tracking-tighter", settings.darkMode ? "text-white" : "text-brand-navy")}>
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
                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 shadow-xl" 
                    : "bg-white border-white hover:border-blue-200 shadow-sm hover:shadow-xl shadow-blue-900/5"
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
                        settings.darkMode ? "text-gray-400" : "text-brand-navy"
                      )}>
                        {contact.name}
                        {contact.isFixed && <span className={cn("ml-1.5 text-[7px] text-brand-gold font-black", isEven && "mr-1.5 ml-0")}>(FIXO)</span>}
                      </span>
                      <span className={cn(
                        "font-bold text-[13px] sm:text-[16px] tracking-tight truncate",
                        settings.darkMode ? "text-white" : "text-brand-navy"
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
                              ? "bg-white/5 border-white/5 text-gray-500 hover:text-blue-400 hover:border-blue-400/30" 
                              : "bg-gray-50/50 border-gray-100/50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
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
                          : "bg-gradient-to-br from-[#25D366] to-[#1fac53] shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-0.5"
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
                              ? "bg-white/5 border-white/5 text-gray-500 hover:text-blue-400 hover:border-blue-400/30" 
                              : "bg-gray-50/50 border-gray-100/50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
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
        </div>
      </section>
      {/* Daily Fact Modal */}
      <AnimatePresence>
        {showDailyFactModal && (
          <DailyMessageModal 
            content={dailyFact?.content || ''} 
            onClose={() => setShowDailyFactModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
