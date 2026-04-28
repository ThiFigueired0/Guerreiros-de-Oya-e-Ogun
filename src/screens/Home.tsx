
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, Calendar, Droplets, Music, MessageSquare, CreditCard, Copy, CheckCircle2, BookOpen } from 'lucide-react';
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
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    bathCategories: ['Gerais', 'Orixás', 'Entidades'],
    pushNotifications: false
  });

  const [baths] = useStorage<HerbBath[]>('templo_baths', []);
  const [pontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [books] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [events] = useStorage<Event[]>('templo_events', []);
  const [copied, setCopied] = React.useState<string | null>(null);

  const favBaths = baths.filter(b => b.isFavorite);
  const favPontos = pontos.filter(p => p.isFavorite);
  const favBooks = books.filter(b => b.isFavorite);
  const inProgressBooks = books.filter(b => b.readingStatus === 'in_progress');

  // Próximos eventos (hoje ou no futuro)
  const upcomingEvents = events
    .filter(e => {
      // Ajuste para evitar problemas de fuso horário com strings de data yyyy-MM-dd
      const [year, month, day] = e.date.split('-').map(Number);
      const eventDate = new Date(year, month - 1, day);
      return isToday(eventDate) || isAfter(eventDate, startOfToday());
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
        "p-4 min-h-full pb-20 transition-colors duration-500",
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
          <div className={cn(
            "p-4 rounded-2xl border transition-all",
            settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
          )}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>Mensalidade</p>
                <p className={cn("font-bold text-sm", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>Caixa Econômica</p>
              </div>
              <button 
                onClick={() => copyToClipboard('33464358810', 'caixa')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied === 'caixa' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-brand-copper" />}
              </button>
            </div>
            <p className="text-[11px] font-mono font-bold text-brand-copper">33464358810</p>
            <p className="text-[9px] text-gray-400 mt-2 leading-tight">Utilize esta conta exclusivamente para o pagamento das mensalidades do templo.</p>
          </div>

          <div className={cn(
            "p-4 rounded-2xl border transition-all",
            settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
          )}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40 mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>Diversos & Banhos</p>
                <p className={cn("font-bold text-sm", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>Nubank</p>
              </div>
              <button 
                onClick={() => copyToClipboard('11982350614', 'nubank')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied === 'nubank' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-brand-copper" />}
              </button>
            </div>
            <p className="text-[11px] font-mono font-bold text-brand-copper">11982350614</p>
            <p className="text-[9px] text-gray-400 mt-2 leading-tight">Utilize esta conta para compra de banhos, materiais e outras necessidades gerais.</p>
          </div>
        </div>
      </section>

      {/* Suggested Content / Favorites */}
      <div className="space-y-6">
        {favBaths.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <Droplets className="w-3 h-3 text-brand-copper fill-brand-copper" />
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
                  <Droplets className="w-4 h-4 text-brand-copper mb-3" />
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
              <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
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
              <BookOpen className="w-3 h-3 text-brand-copper fill-brand-copper" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Leituras em Andamento
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
                    <BookOpen className="w-4 h-4 text-brand-copper" />
                    {book.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-brand-copper fill-brand-copper" />
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
              <Star className="w-3 h-3 text-brand-copper fill-brand-copper" />
              <h3 className={cn("font-black text-[10px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white/40" : "text-brand-navy/40")}>
                Livros Favoritos
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
                    <BookOpen className="w-4 h-4 text-brand-copper" />
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-brand-navy" />
            <p className={cn("font-black text-[9px] uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
              PRÓXIMOS EVENTOS
            </p>
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
