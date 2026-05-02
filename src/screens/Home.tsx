
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Home, Calendar, Leaf, Music, MessageSquare, CreditCard, Copy, CheckCircle2, BookOpen, Search, X, GraduationCap, Anchor } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { AppSettings, HerbBath, Ponto, Event, StudyBook } from '../types';
import { cn } from '../lib/utils';
import { format, isAfter, isToday, startOfToday } from 'date-fns';
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
  const [eventSearch, setEventSearch] = React.useState('');
  const [selectedEventCategory, setSelectedEventCategory] = React.useState<string | null>(null);

  const favBaths = baths.filter(b => b.isFavorite);
  const favPontos = pontos.filter(p => p.isFavorite);
  const favBooks = books.filter(b => b.isFavorite);
  const inProgressBooks = books.filter(b => b.readingStatus === 'in_progress');

  // Próximos eventos (hoje ou no futuro) com filtro
  const upcomingEvents = events
    .filter(e => {
      // Ajuste para evitar problemas de fuso horário com strings de data yyyy-MM-dd
      const [year, month, day] = e.date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      const isFutureOrToday = isToday(eventDate) || isAfter(eventDate, startOfToday());
      
      const matchesSearch = e.title.toLowerCase().includes(eventSearch.toLowerCase());
      const matchesCategory = !selectedEventCategory || e.category === selectedEventCategory;
      
      return isFutureOrToday && matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Agrupar por mes
  const groupedUpcomingEvents = upcomingEvents.reduce((groups, event) => {
    const [year, month, day] = event.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthYear = format(date, 'MMMM yyyy', { locale: ptBR });
    if (!groups[monthYear]) groups[monthYear] = [];
    groups[monthYear].push(event);
    return groups;
  }, {} as Record<string, Event[]>);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={cn(
        "p-4 min-h-full pb-32 transition-colors duration-500",
        settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
      )}
    >
      {/* Welcome Section */}
      <section className="mb-8 px-2">
        <h2 className={cn(
          "text-2xl font-black font-serif tracking-tight",
          settings.darkMode ? "text-white" : "text-brand-navy"
        )}>
          Bem-vindo, Guerreiro!
        </h2>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </section>

      {/* PIX Payments Section */}
      <section className={cn(
        "rounded-[32px] p-6 mb-8 shadow-sm border overflow-hidden relative",
        settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-brand-copper/20 rounded-xl text-brand-copper text-brand-copper">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className={cn("font-black text-xs uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
            Contribuições & Pagamentos
          </h3>
        </div>

        <div className="space-y-4">
          {/* Caixa Card */}
          <div className={cn(
            "p-5 rounded-[28px] border transition-all relative overflow-hidden",
            settings.darkMode ? "bg-black/40 border-gray-800" : "bg-gray-50/50 border-gray-100"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                  {settings.caixaLogo ? (
                    <img src={settings.caixaLogo} alt="Caixa" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Caixa</span>
                  )}
                </div>
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5", settings.darkMode ? "text-white" : "text-brand-navy")}>Mensalidade</p>
                  <p className={cn("font-bold text-base tracking-tight", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>Caixa Econômica</p>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl flex items-center justify-between gap-4 mb-4",
              settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
            )}>
              <div className="overflow-hidden">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Chave PIX (CPF)</p>
                <p className={cn("text-lg font-mono font-black tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>33464358810</p>
              </div>
              <button 
                onClick={() => copyToClipboard('33464358810', 'caixa')}
                className="w-10 h-10 bg-brand-copper text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-copper/20 active:scale-90 transition-all shrink-0"
              >
                {copied === 'caixa' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 font-medium px-1">Utilize esta conta exclusivamente para o pagamento das mensalidades do templo.</p>
          </div>

          {/* Nubank Card */}
          <div className={cn(
            "p-5 rounded-[28px] border transition-all relative overflow-hidden",
            settings.darkMode ? "bg-black/40 border-gray-800" : "bg-gray-50/50 border-gray-100"
          )}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-gray-100 dark:border-white/5 shrink-0 flex items-center justify-center overflow-hidden">
                  {settings.nubankLogo ? (
                    <img src={settings.nubankLogo} alt="Nubank" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Nubank</span>
                  )}
                </div>
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5", settings.darkMode ? "text-white" : "text-brand-navy")}>Diversos & Banhos</p>
                  <p className={cn("font-bold text-base tracking-tight", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>Nubank</p>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-2xl flex items-center justify-between gap-4 mb-4",
              settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
            )}>
              <div className="overflow-hidden">
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Chave PIX (Celular)</p>
                <p className={cn("text-lg font-mono font-black tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>11982350614</p>
              </div>
              <button 
                onClick={() => copyToClipboard('11982350614', 'nubank')}
                className="w-10 h-10 bg-[#8A05BE] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#8A05BE]/20 active:scale-90 transition-all shrink-0"
              >
                {copied === 'nubank' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 font-medium px-1">Utilize esta conta para compra de banhos, materiais e outras necessidades gerais.</p>
          </div>
        </div>
      </section>

      {/* Suggested Content / Favorites */}
      <div className="space-y-6">
        {favBaths.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <Leaf className="w-3 h-3 text-brand-copper fill-brand-copper" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Banhos Favoritos
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {favBaths.map(bath => (
                <button 
                  key={bath.id} 
                  onClick={() => navigate('/herbs', { state: { openBathId: bath.id } })}
                  className={cn(
                    "min-w-[160px] p-4 rounded-[24px] border transition-all active:scale-95 text-left",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <Leaf className="w-4 h-4 text-brand-copper mb-3" />
                  <p className={cn("font-bold text-[11px] leading-tight mb-1 line-clamp-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {bath.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {favPontos.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <Music className="w-3 h-3 text-brand-red fill-brand-red" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Pontos Favoritos
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {favPontos.map(ponto => (
                <button 
                  key={ponto.id} 
                  onClick={() => navigate('/points', { state: { pontoId: ponto.id, folderId: ponto.folderId } })}
                  className={cn(
                    "min-w-[160px] p-4 rounded-[24px] border transition-all active:scale-95 text-left",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <Music className="w-4 h-4 text-brand-red mb-3" />
                  <p className={cn("font-bold text-[11px] leading-tight mb-1 line-clamp-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {ponto.title}
                  </p>
                  <p className="text-[9px] text-gray-400 truncate">{ponto.entity || 'Ponto Cantado'}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {inProgressBooks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <GraduationCap className="w-3 h-3 text-brand-copper fill-brand-copper" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Estudos em Andamento
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {inProgressBooks.map(book => (
                <button 
                  key={book.id} 
                  onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                  className={cn(
                    "min-w-[160px] p-4 rounded-[24px] border transition-all active:scale-95 relative overflow-hidden text-left",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <GraduationCap className="w-4 h-4 text-brand-copper" />
                    {book.isFavorite && (
                      <Heart className="w-3.5 h-3.5 text-brand-copper fill-brand-copper" />
                    )}
                  </div>
                  
                  <p className={cn("font-bold text-[11px] leading-tight mb-1 line-clamp-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {book.name.replace('.pdf', '')}
                  </p>
                  
                  <div className="mt-2">
                    <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">
                      {book.totalPages && book.totalPages > 0 
                        ? `${Math.round(((book.lastPage || 0) / book.totalPages) * 100)}% concluído` 
                        : 'Em andamento'}
                    </p>
                    
                    {book.totalPages && book.totalPages > 0 && (
                      <div className="h-0.5 w-full bg-gray-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(book.lastPage || 0) / book.totalPages * 100}%` }}
                          className="h-full bg-brand-copper"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {favBooks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <GraduationCap className="w-3 h-3 text-brand-copper fill-brand-copper" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Estudos Favoritos
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide">
              {favBooks.map(book => (
                <button 
                  key={book.id} 
                  onClick={() => navigate('/studies', { state: { openBookId: book.id } })}
                  className={cn(
                    "min-w-[160px] p-4 rounded-[24px] border transition-all active:scale-95 relative overflow-hidden text-left",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <GraduationCap className="w-4 h-4 text-brand-copper" />
                    {book.readingStatus === 'completed' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </div>
                  
                  <p className={cn("font-bold text-[11px] leading-tight mb-1 line-clamp-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {book.name.replace('.pdf', '')}
                  </p>
                  
                  <div className="mt-2">
                    <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">
                      {book.readingStatus === 'completed' ? 'Concluído' : 
                       book.readingStatus === 'in_progress' ? (
                         book.totalPages && book.totalPages > 0 
                           ? `${Math.round(((book.lastPage || 0) / book.totalPages) * 100)}% concluído` 
                           : 'Em andamento'
                       ) : 'Não iniciado'}
                    </p>
                    
                    {book.readingStatus === 'in_progress' && book.totalPages && book.totalPages > 0 && (
                      <div className="h-0.5 w-full bg-gray-100 dark:bg-white/10 rounded-full mt-1.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(book.lastPage || 0) / book.totalPages * 100}%` }}
                          className="h-full bg-brand-copper"
                        />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {favBaths.length === 0 && favPontos.length === 0 && favBooks.length === 0 && (
          <div className={cn(
            "p-8 rounded-[32px] text-center border-2 border-dashed",
            settings.darkMode ? "border-gray-800 bg-white/5" : "border-gray-100 bg-white"
          )}>
            <div className="w-12 h-12 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-5 h-5 text-brand-copper" />
            </div>
            <p className={cn("font-bold text-sm mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>Seu App está vazio</p>
            <p className="text-[10px] text-gray-400 px-8">Favorite banhos, pontos e livros para acessá-los rapidamente por aqui.</p>
          </div>
        )}
      </div>

      <section className="mt-8 px-2">
        <div className={cn(
          "p-5 rounded-[32px] border-2 space-y-4",
          settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-navy" />
              <p className={cn("font-black text-[9px] uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
                PRÓXIMOS EVENTOS
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", settings.darkMode ? "text-white/20" : "text-gray-400")} />
              <input 
                type="text"
                placeholder="Buscar eventos..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-2xl text-xs transition-all outline-none",
                  settings.darkMode ? "bg-black/20 border-gray-800 focus:bg-black/40 text-white" : "bg-gray-50 border-gray-100 focus:bg-white text-brand-navy"
                )}
              />
              {eventSearch && (
                <button 
                  onClick={() => setEventSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedEventCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                  !selectedEventCategory 
                    ? "bg-brand-copper text-white" 
                    : settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                )}
              >
                Todos
              </button>
              {settings.eventCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedEventCategory(selectedEventCategory === cat ? null : cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                    selectedEventCategory === cat 
                      ? "bg-brand-copper text-white" 
                      : settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(groupedUpcomingEvents).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedUpcomingEvents).map(([month, events]) => (
                <div key={month} className="space-y-3">
                  <p className={cn("text-[10px] font-black uppercase text-brand-copper tracking-wider border-b pb-1", settings.darkMode ? "border-white/10" : "border-gray-100")}>
                    {month}
                  </p>
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div key={event.id} className="group flex items-start gap-4">
                         <div className={cn(
                           "flex flex-col items-center justify-center min-w-[40px] h-[40px] rounded-xl font-bold",
                           settings.darkMode ? "bg-white/5 text-white" : "bg-brand-navy/5 text-brand-navy"
                         )}>
                            <span className="text-xs leading-none">{event.date.split('-')[2]}</span>
                            <span className="text-[8px] uppercase opacity-50">
                              {format(new Date(event.date.split('-').map(Number)[0], event.date.split('-').map(Number)[1]-1, event.date.split('-').map(Number)[2]), 'EEE', { locale: ptBR }).replace('.', '')}
                            </span>
                         </div>
                         <div className="flex-1">
                           <p className={cn("font-bold text-sm leading-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                             {event.title}
                           </p>
                           <p className="text-[10px] text-gray-400 mt-0.5">
                             {event.category}
                           </p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-gray-400">Nenhum evento agendado recentemente.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}
