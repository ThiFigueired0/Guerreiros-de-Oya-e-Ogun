
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
      <section className="grid grid-cols-2 gap-3 mb-8">
        {/* Widget 1: Próxima Gira (Ocupa 2 colunas se for muito importante ou 1 coluna grande) */}
        <div 
          onClick={() => navigate('/calendar')}
          className={cn(
            "col-span-2 p-5 rounded-[32px] border relative overflow-hidden transition-all active:scale-[0.98]",
            settings.darkMode 
              ? "bg-gradient-to-br from-[#1A1A1A] to-[#222] border-gray-800" 
              : "bg-brand-navy border-brand-navy shadow-xl shadow-brand-navy/20"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className={cn("w-24 h-24", settings.darkMode ? "text-white" : "text-brand-copper")} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-brand-copper/20 p-1.5 rounded-xl text-brand-copper">
                <Clock className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest",
                settings.darkMode ? "text-brand-copper" : "text-brand-copper"
              )}>Próximo Evento</span>
            </div>
            
            {nextEvent ? (
              <div>
                <h3 className="text-xl font-black text-white leading-tight mb-2 pr-8">{nextEvent.title}</h3>
                <div className="flex items-center gap-3 text-white/70">
                  <span className="text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {format(parseISO(nextEvent.date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  <span className="text-xs font-medium">{nextEvent.category}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-black text-white/50 leading-tight">Nenhum evento próximo</h3>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Estudo / Progresso */}
        <div 
          onClick={() => lastBook ? navigate('/studies', { state: { openBookId: lastBook.id } }) : navigate('/studies')}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98]",
            settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-2 rounded-xl", settings.darkMode ? "bg-white/5" : "bg-gray-50")}>
              <GraduationCap className={cn("w-5 h-5", settings.darkMode ? "text-white" : "text-brand-navy")} />
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

        {/* Widget 3: Financeiro / PIX (Compacto) */}
        <div 
          onClick={() => setShowPixMenu(!showPixMenu)}
          className={cn(
            "p-5 rounded-[28px] border flex flex-col justify-between relative transition-all active:scale-[0.98] overflow-hidden",
            settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-brand-copper border-brand-copper shadow-lg shadow-brand-copper/20"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-2 rounded-xl", settings.darkMode ? "bg-white/5 text-brand-copper" : "bg-white/20 text-white")}>
              <Wallet className="w-5 h-5" />
            </div>
            <ChevronRight className={cn("w-4 h-4 opacity-50", settings.darkMode ? "text-gray-400" : "text-white")} />
          </div>
          <div>
            <p className={cn("text-[8px] font-black uppercase tracking-widest mb-1", settings.darkMode ? "text-gray-400" : "text-white/60")}>Dados Bancários</p>
            <p className={cn(
              "font-bold text-sm leading-tight",
              settings.darkMode ? "text-white" : "text-white"
            )}>PIX / Ajuda</p>
          </div>
          
          {/* Menu PIX Expandido (Overlay interno) */}
          <AnimatePresence>
            {showPixMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 z-20 flex flex-col justify-center p-4 bg-brand-navy/95 backdrop-blur-md rounded-[28px]"
              >
                <button 
                   onClick={(e) => { e.stopPropagation(); copyToClipboard('33464358810', 'caixa'); }}
                   className="bg-white/10 p-2.5 rounded-xl mb-2 flex items-center justify-between active:scale-95 transition-all text-white border border-white/5"
                >
                   <div className="flex flex-col items-start gap-0.5 text-left">
                     <span className="text-[9px] font-black uppercase tracking-wider text-white/50">Caixa (Mensalidade)</span>
                     <span className="text-xs font-mono font-bold font-black">33464358810</span>
                   </div>
                   {copied === 'caixa' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" />}
                </button>
                <button 
                   onClick={(e) => { e.stopPropagation(); copyToClipboard('11982350614', 'nubank'); }}
                   className="bg-white/10 p-2.5 rounded-xl flex items-center justify-between active:scale-95 transition-all text-white border border-white/5"
                >
                   <div className="flex flex-col items-start gap-0.5 text-left">
                     <span className="text-[9px] font-black uppercase tracking-wider text-white/50">Nubank (Banhos/Diversos)</span>
                     <span className="text-xs font-mono font-bold font-black">11982350614</span>
                   </div>
                   {copied === 'nubank' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 opacity-50" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. Atalhos / Favoritos Rápidos */}
      {(favBaths.length > 0 || favPontos.length > 0) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className={cn("font-black text-[10px] uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
              Meus Favoritos
            </h3>
            <Heart className="w-3 h-3 text-brand-copper/50 fill-brand-copper/10" />
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x">
            {favBaths.map(bath => (
              <button 
                key={bath.id} 
                onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                className={cn(
                  "min-w-[120px] max-w-[120px] p-4 rounded-[24px] border transition-all active:scale-95 text-left snap-start flex-shrink-0 flex flex-col justify-between aspect-square",
                  settings.darkMode ? "bg-[#1A1A1A]/80 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", settings.darkMode ? "bg-brand-copper/10" : "bg-brand-copper/5")}>
                  <Leaf className="w-4 h-4 text-brand-copper" />
                </div>
                <div>
                  <p className={cn("font-bold text-[10px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{bath.title}</p>
                </div>
              </button>
            ))}
            
            {favPontos.map(ponto => (
              <button 
                key={ponto.id} 
                onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                className={cn(
                  "min-w-[120px] max-w-[120px] p-4 rounded-[24px] border transition-all active:scale-95 text-left snap-start flex-shrink-0 flex flex-col justify-between aspect-square",
                  settings.darkMode ? "bg-[#1A1A1A]/80 border-gray-800" : "bg-white border-gray-100 shadow-sm"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", settings.darkMode ? "bg-brand-red/10" : "bg-brand-red/5")}>
                  <Music className="w-4 h-4 text-brand-red" />
                </div>
                <div>
                  <p className={cn("font-bold text-[10px] leading-tight line-clamp-2", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{ponto.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. Agenda Resumida */}
      <section className="px-2 mb-6">
        <h3 className={cn("font-black text-[10px] uppercase tracking-widest mb-4", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
          Agenda da Semana
        </h3>
        
        <div className="space-y-3">
          {upcomingEvents.slice(0, 4).map((event) => {
            const eventDate = parseISO(event.date);
            const isEventToday = isToday(eventDate);
            
            return (
              <div 
                 key={event.id}
                 className={cn(
                   "flex items-center gap-4 p-4 rounded-[24px] border transition-all",
                   settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm",
                   isEventToday && (settings.darkMode ? "border-brand-copper/30 bg-brand-copper/5" : "border-brand-copper/20 bg-brand-copper/5")
                 )}
              >
                <div className={cn(
                   "flex flex-col items-center justify-center min-w-[48px] h-[48px] rounded-2xl font-bold border",
                   settings.darkMode ? "bg-[#222] border-gray-700/50 text-white" : "bg-gray-50 border-gray-100 text-brand-navy",
                   isEventToday && "bg-brand-copper border-brand-copper text-white shadow-lg shadow-brand-copper/20"
                 )}>
                    <span className="text-sm leading-none">{format(eventDate, 'dd')}</span>
                    <span className={cn("text-[9px] uppercase font-black", isEventToday ? "opacity-100 text-white" : "opacity-50")}>
                      {format(eventDate, 'eee', { locale: ptBR }).replace('.', '')}
                    </span>
                 </div>
                 
                 <div className="flex-1">
                   <div className="flex items-center justify-between gap-2 mb-0.5">
                     <p className={cn("font-bold text-sm leading-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                       {event.title}
                     </p>
                     {isEventToday && (
                       <span className="text-[8px] font-black uppercase bg-brand-copper text-white px-2 py-0.5 rounded-full shrink-0">Hoje</span>
                     )}
                   </div>
                   <div className="flex gap-2 items-center">
                     <span className={cn(
                       "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg",
                       settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                     )}>
                       {event.category}
                     </span>
                     {event.reminder && (
                       <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                         <Clock className="w-3 h-3" /> {event.reminder}
                       </span>
                     )}
                   </div>
                 </div>
              </div>
            );
          })}
          
          {upcomingEvents.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-xs">
               Nenhum evento agendado para os próximos dias.
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
