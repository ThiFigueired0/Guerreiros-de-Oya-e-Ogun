
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Home, Calendar, Leaf, Music, MessageSquare, CreditCard, Copy, CheckCircle2, BookOpen, Search, X, GraduationCap, Anchor, ChevronRight, Sparkles, Clock, Wallet } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { AppSettings, HerbBath, Ponto, Event, StudyBook } from '../types';
import { cn } from '../lib/utils';
import { format, isAfter, isToday, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HomeScreen() {
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

  const [baths] = useStorage<HerbBath[]>('templo_baths', []);
  const [pontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [books] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [events] = useStorage<Event[]>('templo_events', []);
  
  const [copied, setCopied] = React.useState<string | null>(null);
  const [showPixMenu, setShowPixMenu] = React.useState(false);

  const favBaths = baths.filter(b => b.isFavorite);
  const favPontos = pontos.filter(p => p.isFavorite);
  const favBooks = books.filter(b => b.isFavorite);
  const inProgressBooks = books.filter(b => b.readingStatus === 'in_progress');

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
  const firstName = settings.firstName?.split(' ')[0] || "Guerreiro";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={cn(
        "p-4 min-h-full pb-32 transition-colors duration-500",
        settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
      )}
    >
      {/* 1. Header Profiling */}
      <header className="flex items-center justify-between mb-8 mt-2 px-2">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-1"
          >
            <Sparkles className="w-4 h-4 text-brand-copper" />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
          </motion.div>
          <h2 className={cn(
            "text-2xl font-black tracking-tight flex items-center gap-2",
            settings.darkMode ? "text-white" : "text-brand-navy"
          )}>
            {greeting}, {firstName}!
          </h2>
        </div>
        {settings.logoBase64 && (
          <div className={cn(
            "w-12 h-12 rounded-full border-2 overflow-hidden shadow-lg",
            settings.darkMode ? "border-white/10" : "border-brand-copper/20"
          )}>
            <img src={settings.logoBase64} alt="Terreiro" className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      {/* 2. Bento Grid Dashboard */}
      <section className="grid grid-cols-2 gap-3 mb-8 px-2">
        {/* Widget 1: Próxima Gira */}
        <div 
          onClick={() => navigate('/calendar')}
          className={cn(
            "col-span-2 p-5 rounded-[32px] border relative overflow-hidden transition-all active:scale-[0.98]",
            settings.darkMode 
              ? "bg-gradient-to-br from-[#121a2f] to-[#1A1A1A] border-[#1e293b]" 
              : "bg-gradient-to-br from-[#0B1E36] via-[#102b4e] to-[#1a365d] border-[#0B1E36] shadow-xl shadow-brand-navy/20"
          )}
        >
          {/* Decorative Mesh Gradient Blur */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-brand-copper/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 opacity-5">
            <Calendar className={cn("w-32 h-32", settings.darkMode ? "text-blue-100" : "text-white")} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-copper/20 p-1.5 rounded-xl text-brand-copper border border-brand-copper/30 shadow-sm shadow-brand-copper/10">
                <Clock className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                settings.darkMode ? "text-brand-copper" : "text-brand-copper"
              )}>Próximo Evento</span>
            </div>
            
            {nextEvent ? (
              <div>
                <h3 className="text-xl font-black text-white leading-tight mb-2 pr-12 drop-shadow-sm">{nextEvent.title}</h3>
                <div className="flex items-center gap-2.5 text-white/90">
                  <span className="text-xs font-bold leading-none bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm">
                    {format(parseISO(nextEvent.date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 border border-black/10 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-sm text-white/80">{nextEvent.category}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-black text-white/50 leading-tight drop-shadow-sm">Nenhum evento próximo</h3>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Estudo / Progresso */}
        <div 
          onClick={() => lastBook ? navigate('/studies', { state: { openBookId: lastBook.id } }) : navigate('/studies')}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98]",
            settings.darkMode ? "bg-gradient-to-br from-[#1A1A1A] to-[#222] border-gray-800" : "bg-gradient-to-b from-white to-blue-50/20 border-gray-100 shadow-sm hover:border-gray-200"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div 
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0", 
                (!lastBook?.coverImage && !lastBook?.coverColor) && (settings.darkMode ? "bg-white/5" : "bg-gray-50")
              )}
              style={lastBook?.coverColor && !lastBook?.coverImage ? { backgroundColor: lastBook.coverColor } : undefined}
            >
              {lastBook?.coverImage ? (
                <img src={lastBook.coverImage} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <GraduationCap className={cn(
                  "w-5 h-5", 
                  lastBook?.coverColor ? "text-white" : (settings.darkMode ? "text-white" : "text-brand-navy")
                )} />
              )}
            </div>
            {lastBook && <span className="text-[10px] font-black text-brand-copper">{(lastBook.lastPage! / lastBook.totalPages! * 100).toFixed(0)}%</span>}
          </div>
          <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Último Estudo</p>
            <p className={cn(
              "font-bold text-xs leading-tight line-clamp-2",
              settings.darkMode ? "text-gray-200" : "text-brand-navy"
            )}>{lastBook ? lastBook.name.replace('.pdf', '') : "Comece a estudar"}</p>
          </div>
        </div>

        {/* Widget 3: Financeiro / PIX */}
        <div 
          onClick={() => setShowPixMenu(true)}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98]",
            settings.darkMode ? "bg-[#1A1A1A] border-gray-800 hover:border-gray-700" : "bg-gradient-to-br from-brand-copper to-[#A07000] border-brand-copper shadow-xl shadow-brand-copper/20"
          )}
        >
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className={cn("p-2 rounded-xl backdrop-blur-sm border", settings.darkMode ? "bg-white/5 text-brand-copper border-white/5 shadow-sm" : "bg-white/15 text-white border-white/10 shadow-lg shadow-black/5")}>
              <Wallet className="w-5 h-5" />
            </div>
            <ChevronRight className={cn("w-4 h-4 opacity-50", settings.darkMode ? "text-gray-400" : "text-white")} />
          </div>
          <div className="relative z-10">
            <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1", settings.darkMode ? "text-gray-400" : "text-white/60")}>Dados Bancários</p>
            <p className={cn(
              "font-bold text-sm leading-tight",
              settings.darkMode ? "text-white" : "text-white"
            )}>PIX / Ajuda</p>
          </div>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className={cn(
                "relative w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white border border-gray-100"
              )}
            >
              <div className="p-6 border-b flex items-center justify-between shrink-0" style={{ borderColor: settings.darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-copper/10 text-brand-copper rounded-2xl flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Contas do Templo
                  </h3>
                </div>
                <button onClick={() => setShowPixMenu(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full active:scale-95 transition-all">
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto scrollbar-hide">
                {/* Caixa */}
                <div className={cn(
                  "p-5 rounded-[28px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-gray-800" : "bg-brand-copper/5 border-brand-copper/10 shadow-sm"
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
                      <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>Caixa Econômica</p>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between gap-4 mt-auto border",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-white shadow-sm"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Chave PIX (CPF)</p>
                      <p className={cn("text-sm sm:text-base font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>33464358810</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('33464358810', 'caixa')}
                      className="w-11 h-11 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/20 active:scale-95 transition-all shrink-0"
                    >
                      {copied === 'caixa' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Nubank */}
                <div className={cn(
                  "p-5 rounded-[28px] border transition-all relative overflow-hidden flex flex-col",
                  settings.darkMode ? "bg-black/40 border-gray-800" : "bg-[#8A05BE]/5 border-[#8A05BE]/10 shadow-sm"
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
                        <p className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>Nubank</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center justify-between gap-4 mt-auto border",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-white shadow-sm"
                  )}>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Chave PIX (Celular)</p>
                      <p className={cn("text-sm sm:text-base font-mono font-black tracking-widest truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>11982350614</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard('11982350614', 'nubank')}
                      className="w-11 h-11 bg-[#8A05BE] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#8A05BE]/20 active:scale-95 transition-all shrink-0"
                    >
                      {copied === 'nubank' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Atalhos / Favoritos Rápidos */}
      {(favBaths.length > 0 || favPontos.length > 0 || favBooks.length > 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className={cn("font-black text-[10px] uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              Meus Favoritos
            </h3>
            <Heart className="w-3 h-3 text-brand-copper/50 fill-brand-copper/10" />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x -mx-2">
            {favBaths.map(bath => (
              <button 
                key={bath.id} 
                onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                className={cn(
                  "min-w-[200px] max-w-[240px] p-3 rounded-[20px] border transition-all active:scale-95 text-left snap-start flex-shrink-0 flex items-center gap-3",
                  settings.darkMode ? "bg-[#1A1A1A]/80 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", settings.darkMode ? "bg-brand-copper/10" : "bg-brand-copper/5")}>
                  <Leaf className="w-5 h-5 text-brand-copper" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-wider mb-0.5 text-brand-copper">Banho</p>
                  <p className={cn("font-bold text-xs leading-tight truncate", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{bath.title}</p>
                </div>
              </button>
            ))}
            
            {favPontos.map(ponto => (
              <button 
                key={ponto.id} 
                onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                className={cn(
                  "min-w-[200px] max-w-[240px] p-3 rounded-[20px] border transition-all active:scale-95 text-left snap-start flex-shrink-0 flex items-center gap-3",
                  settings.darkMode ? "bg-[#1A1A1A]/80 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", settings.darkMode ? "bg-brand-red/10" : "bg-brand-red/5")}>
                  <Music className="w-5 h-5 text-brand-red" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-wider mb-0.5 text-brand-red">Ponto</p>
                  <p className={cn("font-bold text-xs leading-tight truncate", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{ponto.title}</p>
                </div>
              </button>
            ))}

            {favBooks.map(book => (
              <button 
                key={book.id} 
                onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                className={cn(
                  "min-w-[200px] max-w-[240px] p-3 rounded-[20px] border transition-all active:scale-95 text-left snap-start flex-shrink-0 flex items-center gap-3 overflow-hidden",
                  settings.darkMode ? "bg-[#1A1A1A]/80 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden", 
                  (!book.coverImage && !book.coverColor) ? (settings.darkMode ? "bg-white/10" : "bg-gray-100") : ""
                )} style={book.coverColor && !book.coverImage ? { backgroundColor: book.coverColor } : undefined}>
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className={cn("w-5 h-5", book.coverColor ? "text-white" : (settings.darkMode ? "text-white" : "text-brand-navy"))} />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black uppercase tracking-wider mb-0.5" style={{ color: book.coverColor || (settings.darkMode ? '#e5e7eb' : '#9ca3af') }}>Estudo</p>
                  <p className={cn("font-bold text-xs leading-tight truncate", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{book.name.replace('.pdf', '')}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

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

                   <p className={cn("font-medium text-[15px] leading-tight truncate", settings.darkMode ? "text-white group-hover:text-gray-200 transition-colors" : "text-[#1a202c] group-hover:text-brand-navy transition-colors")}>
                     {event.title}
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
      </section>
    </motion.div>
  );
}
