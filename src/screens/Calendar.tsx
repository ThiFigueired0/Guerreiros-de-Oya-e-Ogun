import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Search, Trash2, Edit2, Calendar as CalendarIcon, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { Event, AppSettings, NotificationItem } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function CalendarScreen() {
  const location = useLocation();
  const agendaRef = useRef<HTMLDivElement>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (location.state?.scrollToAgenda && agendaRef.current) {
      agendaRef.current.scrollIntoView({ behavior: 'smooth' });
      // Clean up the state so it doesn't scroll again on re-renders unless triggered
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [events, setEvents] = useStorage<Event[]>('templo_events', []);
  const [, setNotifications] = useStorage<NotificationItem[]>('templo_history', []);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte', 'Lembrete'],
    eventNames: [
      'Gira de Baianos', 'Gira de Marinheiros', 'Gira de Exu e Pombagira', 'Gira de Malandros', 'Gira de Ciganos', 'Gira de Exu mirim',
      'Festa de Marias', 'Festa de Oxossi', 'Festa de Iemanjá', 'Festa de Ogun', 'Festa preto velho', 'Festa cigana', 'Festa de Xangô', 'Festa de Nanã', 'Festa de Omolu', 'Festa de Erês'
    ],
    bathCategories: ['Gerais', 'Orixás', 'Entidades'],
    pushNotifications: false
  });
  
  const [isManaging, setIsManaging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const DEFAULT_DEV_REMINDER = "Obrigatório:\n- Bebidas para as quartinhas (Exu, Pombagira, Exu Mirim e Malandro)\n- Velas\n- Isqueiro\n- Roupa branca (Calça, shorts, camisa e Eketê)";

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    type: 'event',
    title: settings.eventCategories[0] === 'Desenvolvimento' ? 'Gira de desenvolvimento' : '',
    category: settings.eventCategories[0],
    date: format(new Date(), 'yyyy-MM-dd'),
    reminder: settings.eventCategories[0] === 'Desenvolvimento' ? DEFAULT_DEV_REMINDER : '',
    isCanceled: false,
    cancelReason: '',
    replacementDate: ''
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showNameSelect, setShowNameSelect] = useState(false);
  const [nameSearch, setNameSearch] = useState('');

  const { queueDelete } = useUndo();

  const parseEventDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Preceito calculation: Monday to Saturday for weeks with Thursday Desenvolvimento + Saturday Gira/Festa
  const preceitoRanges = React.useMemo(() => {
    const ranges: { start: number, end: number }[] = [];
    const targetSaturdays = events.filter(e => {
      const date = parseEventDate(e.date);
      return date.getDay() === 6 && (e.category === 'Gira aberta' || e.category === 'Festa');
    });

    targetSaturdays.forEach(sat => {
      const satDate = parseEventDate(sat.date);
      const thursday = new Date(satDate);
      thursday.setDate(satDate.getDate() - 2);
      const thursdayStr = format(thursday, 'yyyy-MM-dd');

      const isPreceitoWeek = events.some(dev => 
        dev.category === 'Desenvolvimento' && dev.date === thursdayStr
      );

      if (isPreceitoWeek) {
        const monday = new Date(satDate);
        monday.setDate(satDate.getDate() - 5);
        ranges.push({
          start: monday.getTime(),
          end: satDate.getTime()
        });
      }
    });
    return ranges;
  }, [events]);

  const isDayInPreceito = (day: Date) => {
    const time = day.getTime();
    return preceitoRanges.some(range => time >= range.start && time <= range.end);
  };
  
  // Calculate padding days to align the first day of the month with the correct column
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const paddingDays = Array.from({ length: startDayOfWeek });

  const eventsInMonth = events.filter(e => isSameMonth(parseEventDate(e.date), currentDate));

  const suggestDevTitle = (dateStr: string) => {
    if (!dateStr) return 'Gira de desenvolvimento';
    const date = parseEventDate(dateStr);
    const futureEvents = events
      .filter(e => {
        const eDate = parseEventDate(e.date);
        return eDate > date && (e.category === 'Gira aberta' || e.category === 'Festa');
      })
      .sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
    
    if (futureEvents.length > 0) {
      const next = futureEvents[0];
      const baseName = next.title.replace(/Gira de |Festa de |Festa /g, '').trim();
      return `Gira de desenvolvimento - ${baseName}`;
    }
    return 'Gira de desenvolvimento';
  };

  const handleSaveEvent = () => {
    const isReminder = newEvent.type === 'reminder';
    const hasRequired = isReminder ? newEvent.reminder : (newEvent.title && newEvent.date);
    
    if (hasRequired && newEvent.date) {
      const finalEvent = {
        ...newEvent,
        id: editingId || Date.now().toString(),
        title: isReminder ? '' : newEvent.title,
        category: isReminder ? 'Lembrete' : newEvent.category,
      } as Event;

      if (editingId) {
        setEvents(events.map(e => e.id === editingId ? finalEvent : e));
        const newNotif = {
          id: `update_event_${Date.now()}`,
          title: `Evento atualizado: ${finalEvent.title || finalEvent.reminder}`,
          timestamp: Date.now(),
          category: 'edição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      } else {
        setEvents([...events, finalEvent]);
        const newNotif = {
          id: `add_event_${Date.now()}`,
          title: `Novo evento agendado: ${finalEvent.title || finalEvent.reminder}`,
          timestamp: Date.now(),
          category: 'adição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
      closeModal();
    }
  };

  const openEditModal = (event: Event) => {
    setNewEvent({
      ...event,
      isCanceled: !!event.isCanceled,
      cancelReason: event.cancelReason || '',
      replacementDate: event.replacementDate || ''
    });
    setEditingId(event.id);
    setShowModal(true);
    setShowDayEventsModal(false);
  };

  const deleteEvent = (event: Event) => {
    queueDelete({
      id: event.id,
      label: event.title || event.reminder || 'Evento',
      timestamp: Date.now(),
      onConfirm: () => {
        const updatedEvents = events.filter(e => e.id !== event.id);
        setEvents(updatedEvents);
        
        const newNotif = {
          id: `delete_event_${Date.now()}`,
          title: `Evento removido: ${event.title || event.reminder}`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));

        if (selectedDay) {
          const remainingOnDay = updatedEvents.filter(e => isSameDay(parseEventDate(e.date), selectedDay)).length;
          if (remainingOnDay === 0) {
            setShowDayEventsModal(false);
          }
        }
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setShowCategorySelect(false);
    setShowNameSelect(false);
    const cat = settings.eventCategories[0];
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    setNewEvent({ 
      type: 'event',
      title: cat === 'Desenvolvimento' ? suggestDevTitle(dateStr) : '', 
      category: cat, 
      date: dateStr, 
      reminder: cat === 'Desenvolvimento' ? DEFAULT_DEV_REMINDER : '',
      isCanceled: false,
      cancelReason: '',
      replacementDate: ''
    });
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day, true);
    setSelectedDay(day);
    const cat = settings.eventCategories[0];
    const dateStr = format(day, 'yyyy-MM-dd');
    if (dayEvents.length === 0) {
      setNewEvent({ 
        type: 'event',
        title: cat === 'Desenvolvimento' ? suggestDevTitle(dateStr) : '', 
        category: cat, 
        date: dateStr,
        reminder: cat === 'Desenvolvimento' ? DEFAULT_DEV_REMINDER : '',
        isCanceled: false,
        cancelReason: '',
        replacementDate: ''
      });
      setShowModal(true);
    } else {
      setShowDayEventsModal(true);
    }
  };

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Todos']);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Gira aberta': return '#3B82F6'; // Blue
      case 'Gira Fechada': return '#8B5CF6'; // Violet
      case 'Desenvolvimento': return '#10B981'; // Emerald
      case 'Festa': return '#EF4444'; // Red
      case 'Trabalho': return '#F97316'; // Orange
      case 'Reunião': return '#EC4899'; // Pink
      case 'Corte': return '#374151'; // Slate/Gray-700
      case 'Lembrete': return '#06B6D4'; // Cyan
      default: return '#D97706'; // Amber/Copper
    }
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'Todos') {
      setSelectedCategories(['Todos']);
    } else {
      setSelectedCategories(prev => {
        const withoutTodos = prev.filter(c => c !== 'Todos');
        if (prev.includes(cat)) {
          const next = withoutTodos.filter(c => c !== cat);
          return next.length === 0 ? ['Todos'] : next;
        } else {
          return [...withoutTodos, cat];
        }
      });
    }
  };

  const getEventsForDay = (day: Date, ignoreFilter = false) => {
    return events.filter(e => {
      const isDay = isSameDay(parseEventDate(e.date), day);
      if (!isDay) return false;
      if (ignoreFilter || selectedCategories.includes('Todos')) return true;
      return selectedCategories.includes(e.category);
    });
  };

  const filteredEventsInMonth = eventsInMonth
    .filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategories.includes('Todos') || selectedCategories.includes(e.category);
      return matchesSearch && matchesCategory;
    })
    .sort((a,b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className={cn(
        "p-4 bg-[#F9F9F9] min-h-full pb-32 transition-colors duration-500",
        settings.darkMode && "bg-[#121212]"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex flex-col">
          <button 
            onClick={() => setShowDatePicker(true)}
            className={cn(
              "text-3xl font-black text-brand-navy capitalize font-serif tracking-tight flex items-center gap-3 hover:opacity-70 transition-all active:scale-95 group",
              settings.darkMode && "text-white"
            )}
          >
            {format(currentDate, 'MMMM', { locale: ptBR })}
            <span className="text-brand-copper font-sans font-black text-sm px-3 py-1 bg-brand-copper/10 rounded-full group-hover:bg-brand-copper/20 transition-colors">{format(currentDate, 'yyyy')}</span>
            <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-brand-copper transition-colors" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentDate(new Date())}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              settings.darkMode ? "bg-white/5 text-gray-300 border border-white/10" : "bg-white text-brand-navy border border-gray-100 shadow-sm"
            )}
          >
            Hoje
          </button>
        </div>
      </div>

      <div className={cn(
        "bg-white p-6 rounded-[40px] shadow-sm mb-10 border border-gray-100 transition-colors duration-500",
        settings.darkMode && "bg-[#1A1A1A] border-gray-800"
      )}>
        <div className="grid grid-cols-7 gap-1 mb-8">
          {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[8px] uppercase font-black text-gray-400 tracking-[0.2em] mb-4">{d}</div>
          ))}
          {paddingDays.map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square opacity-20" />
          ))}
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isToday = isSameDay(day, new Date());
            const hasPreceito = isDayInPreceito(day);
            
            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 active:scale-95 group overflow-hidden",
                  isToday 
                    ? (settings.darkMode ? "bg-brand-copper text-brand-navy ring-4 ring-brand-copper/20" : "bg-brand-navy text-white shadow-lg ring-4 ring-brand-navy/10") 
                    : hasPreceito
                      ? (settings.darkMode ? "bg-brand-gold/25 text-brand-gold border-2 border-brand-gold/40 shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)]" : "bg-brand-gold/20 text-brand-navy border-2 border-brand-gold/30 shadow-sm")
                      : (settings.darkMode ? "hover:bg-white/5" : "hover:bg-gray-50")
                )}
              >
                <span className={cn(
                  "text-[13px] font-black tabular-nums transition-transform group-hover:scale-110", 
                  !isToday && (settings.darkMode ? "text-gray-200" : "text-brand-navy"),
                  isToday && "text-[15px]"
                )}>{format(day, 'd')}</span>
                
                {dayEvents.length > 0 && !isToday && (
                  <div className="absolute bottom-1.5 flex gap-1 justify-center px-1">
                    {Array.from(new Set(dayEvents.map(e => e.category))).slice(0, 3).map((cat, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 h-1.5 rounded-full shadow-sm" 
                        style={{ backgroundColor: getCategoryColor(cat) }}
                      />
                    ))}
                    {new Set(dayEvents.map(e => e.category)).size > 3 && (
                      <div className="w-1 h-1 rounded-full bg-gray-400 opacity-50" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="my-12 border-t-2 border-dashed border-gray-100 dark:border-white/5" />

        <div className="transition-colors duration-500">
          <p className="text-[10px] font-black uppercase text-brand-copper tracking-[0.2em] mb-6 px-2">Legenda do Calendário</p>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-8 px-2 border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-lg ring-4",
                settings.darkMode 
                  ? "bg-brand-copper text-brand-navy ring-brand-copper/20" 
                  : "bg-brand-navy text-white ring-brand-navy/10"
              )}></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-brand-navy dark:text-white tracking-widest">Dia Atual</span>
                <span className="text-[8px] font-medium text-gray-400">Marca a data de hoje</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/25 border-2 border-brand-gold/40 flex items-center justify-center text-xs text-brand-navy dark:text-brand-gold font-black shadow-[0_0_15px_-5px_rgba(212,175,55,0.3)]"></div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-brand-navy dark:text-white tracking-widest">Preceito</span>
                <span className="text-[8px] font-medium text-gray-400">Preceito</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4 px-2">
            {Array.from(new Set([...settings.eventCategories, 'Lembrete'])).map(cat => (
              <div key={cat} className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10 shadow-sm" 
                  style={{ backgroundColor: getCategoryColor(cat) }} 
                />
                <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={agendaRef} className="space-y-6 px-1 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h3 className={cn("text-xs font-black uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>Agenda Mensal</h3>
              <button 
                onClick={() => setIsManaging(!isManaging)}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full transition-all active:scale-95",
                  isManaging 
                    ? "bg-brand-copper text-brand-navy" 
                    : (settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-400")
                )}
              >
                {isManaging ? 'Concluído' : 'Gerenciar'}
              </button>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Guerreiros de Oya e Ogun</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              const cat = settings.eventCategories[0];
              const dateStr = format(new Date(), 'yyyy-MM-dd');
              setNewEvent({ 
                title: cat === 'Desenvolvimento' ? suggestDevTitle(dateStr) : '', 
                category: cat, 
                date: dateStr, 
                reminder: cat === 'Desenvolvimento' ? DEFAULT_DEV_REMINDER : '',
                isCanceled: false,
                cancelReason: '',
                replacementDate: ''
              });
              setShowModal(true);
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg",
              settings.darkMode ? "bg-brand-copper text-brand-navy shadow-brand-copper/20" : "bg-brand-navy text-white shadow-brand-navy/10"
            )}
          >
            <Plus className="w-4 h-4" /> Agendar
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {Array.from(new Set(['Todos', ...settings.eventCategories, 'Lembrete'])).map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border flex items-center gap-2.5",
                  isSelected
                    ? (settings.darkMode ? "bg-brand-copper border-brand-copper text-brand-navy shadow-lg shadow-brand-copper/20" : "bg-brand-navy border-brand-navy text-white shadow-lg shadow-brand-navy/10")
                    : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-400 hover:border-white/20" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 shadow-sm")
                )}
              >
                {cat !== 'Todos' && (
                  <div 
                    className="w-2 h-2 rounded-full ring-2 ring-white/20" 
                    style={{ backgroundColor: getCategoryColor(cat) }} 
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>


        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 group-focus-within:text-brand-copper transition-colors" />
          <input 
            placeholder="Pesquisar na agenda..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              "w-full bg-white border border-gray-100 rounded-[24px] p-5 pl-12 text-xs font-medium outline-none focus:ring-1 focus:ring-brand-copper shadow-sm transition-all",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white shadow-none focus:border-brand-copper"
            )}
          />
        </div>

        {filteredEventsInMonth.length === 0 ? (
          <div className={cn(
            "bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100 flex flex-col items-center justify-center",
            settings.darkMode && "bg-[#1A1A1A] border-gray-800"
          )}>
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-brand-navy/40 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Nenhum evento agendado para este período</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEventsInMonth.map(event => {
              const eventDate = parseEventDate(event.date);
              const isPast = isBefore(startOfDay(eventDate), startOfDay(new Date()));
              
              return (
                <div 
                  key={event.id} 
                  onClick={() => {
                    if (!isManaging) {
                      setViewingEvent(event);
                      setShowDetailsModal(true);
                    }
                  }}
                  className={cn(
                    "bg-white p-5 rounded-[32px] shadow-sm border border-gray-100 flex items-center gap-6 active:scale-[0.99] transition-all hover:translate-x-1 cursor-pointer",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl",
                    isPast && "opacity-40 grayscale-[0.3]"
                  )}
                >
                  <div className={cn(
                    "flex flex-col items-center justify-center min-w-[60px] h-[60px] rounded-2xl bg-gray-50/50",
                    settings.darkMode && "bg-white/5"
                  )}>
                    <span className={cn("text-2xl font-black text-brand-navy leading-none", settings.darkMode && "text-white")}>{format(eventDate, 'dd')}</span>
                    <span className="text-[9px] font-black text-brand-copper uppercase tracking-tighter mt-1">{format(eventDate, 'eee', { locale: ptBR })}</span>
                  </div>
                  
              <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col gap-1.5 mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(event.category) }}
                        />
                        <span className={cn("text-[9px] font-black uppercase tracking-[0.15em]", settings.darkMode ? "text-brand-copper" : "text-brand-copper")}>
                          {event.category}
                        </span>
                      </div>
                      <h4 className={cn(
                        "font-bold text-brand-navy truncate text-base leading-tight", 
                        settings.darkMode && "text-white",
                        event.isCanceled && "line-through opacity-50"
                      )}>
                        {event.title || 'Lembrete'}
                      </h4>
                      {event.isCanceled && (
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Evento Cancelado</span>
                          {event.replacementDate && (
                            <span className="text-[9px] font-bold text-brand-copper uppercase">
                              Reposição: {format(parseEventDate(event.replacementDate), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      )}
                      {event.reminder && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mt-0.5 leading-relaxed bg-brand-gold/5 dark:bg-white/5 px-2 py-1 rounded-lg border-l-2 border-brand-gold/30">
                          {event.reminder}
                        </p>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isManaging && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="flex items-center gap-2"
                      >
                        <button 
                          onClick={() => openEditModal(event)}
                          className={cn(
                            "p-3 rounded-xl transition-all active:scale-90",
                            settings.darkMode ? "bg-white/5 text-gray-400 hover:text-brand-copper" : "bg-gray-50 text-gray-400 hover:text-brand-navy"
                          )}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteEvent(event)}
                          className={cn(
                            "p-3 rounded-xl transition-all active:scale-90",
                            settings.darkMode ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-brand-red shadow-sm"
                          )}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDayEventsModal && selectedDay && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={cn(
                "bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto border-t border-gray-100",
                settings.darkMode && "bg-[#1A1A1A] text-white border-gray-800"
              )}
            >
              <div className="w-12 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mx-auto mb-8 sm:hidden" />

              <button 
                onClick={() => setShowDayEventsModal(false)} 
                className={cn(
                  "absolute top-8 right-8 p-3 text-gray-400 bg-gray-50 rounded-[20px] transition-colors hover:bg-gray-100",
                  settings.darkMode && "bg-white/5 hover:bg-white/10"
                )}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-8">
                <span className="text-brand-copper text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Eventos da Data</span>
                <h3 className={cn("text-3xl font-black text-brand-navy font-serif tracking-tight", settings.darkMode && "text-white")}>
                  {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
              </div>

              <div className="space-y-4 mb-10">
                {getEventsForDay(selectedDay, true).map(event => (
                  <div key={event.id} className={cn(
                    "flex items-center justify-between p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:scale-[1.02]",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50/50"
                  )}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(event.category) }}
                        />
                        <span className="text-[9px] text-brand-copper font-black uppercase tracking-widest">{event.category}</span>
                      </div>
                      <h4 className={cn(
                        "font-bold text-lg truncate leading-tight",
                        event.isCanceled && "line-through opacity-50"
                      )}>{event.title || 'Lembrete'}</h4>
                      {event.isCanceled && (
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Evento Cancelado</span>
                          {event.replacementDate && (
                            <span className="text-[9px] font-bold text-brand-copper uppercase">
                              Reposição: {format(parseEventDate(event.replacementDate), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      )}
                      {event.reminder && (
                        <p className="text-xs text-gray-400 mt-2 bg-brand-gold/5 dark:bg-white/5 p-3 rounded-2xl border-l-2 border-brand-gold/30 leading-relaxed">
                          {event.reminder}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openEditModal(event)}
                        className={cn(
                          "p-3.5 rounded-2xl transition-all active:scale-90",
                          settings.darkMode ? "bg-white/10 text-white" : "bg-white text-brand-navy shadow-sm border border-gray-100"
                        )}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteEvent(event)}
                        className={cn(
                          "p-3.5 rounded-2xl transition-all active:scale-90",
                          settings.darkMode ? "bg-red-500/10 text-red-100" : "bg-red-50 text-red-500 border border-red-100"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const cat = settings.eventCategories[0];
                  const dateStr = format(selectedDay, 'yyyy-MM-dd');
                  setNewEvent({ 
                    title: cat === 'Desenvolvimento' ? suggestDevTitle(dateStr) : '', 
                    category: cat, 
                    date: dateStr,
                    reminder: cat === 'Desenvolvimento' ? DEFAULT_DEV_REMINDER : '',
                    isCanceled: false,
                    cancelReason: '',
                    replacementDate: ''
                  });
                  setShowDayEventsModal(false);
                  setShowModal(true);
                }}
                className={cn(
                  "w-full rounded-[24px] p-5 font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3",
                  settings.darkMode ? "bg-brand-copper text-brand-navy shadow-brand-copper/20" : "bg-brand-navy text-white shadow-brand-navy/10"
                )}
              >
                <Plus className="w-5 h-5" /> Adicionar Evento
              </button>
            </motion.div>
          </motion.div>
        )}

        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={cn(
                "bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl relative border-t border-gray-100",
                settings.darkMode && "bg-[#1A1A1A] text-white border-gray-800"
              )}
            >
              <div className="w-12 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mx-auto mb-8 sm:hidden" />
              
              <button 
                onClick={closeModal} 
                className={cn(
                  "absolute top-8 right-8 p-3 text-gray-400 bg-gray-50 rounded-[20px] transition-colors hover:bg-gray-100",
                  settings.darkMode && "bg-white/5 hover:bg-white/10"
                )}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-8">
                <span className="text-brand-copper text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
                  {editingId ? 'Agenda Espiritual' : 'Novo Agendamento'}
                </span>
                <h3 className={cn("text-3xl font-black text-brand-navy font-serif tracking-tight", settings.darkMode && "text-white")}>
                  {editingId ? 'Editar Evento' : 'Programar Evento'}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex bg-gray-100 dark:bg-white/5 rounded-[24px] p-1.5 mb-2">
                  <button
                    onClick={() => setNewEvent({ ...newEvent, type: 'event' })}
                    className={cn(
                      "flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                      newEvent.type !== 'reminder' 
                        ? (settings.darkMode ? "bg-brand-copper text-brand-navy shadow-lg" : "bg-white text-brand-navy shadow-sm") 
                        : "text-gray-400 hover:text-gray-500"
                    )}
                  >
                    Evento
                  </button>
                  <button
                    onClick={() => setNewEvent({ ...newEvent, type: 'reminder' })}
                    className={cn(
                      "flex-1 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all",
                      newEvent.type === 'reminder' 
                        ? (settings.darkMode ? "bg-brand-copper text-brand-navy shadow-lg" : "bg-white text-brand-navy shadow-sm") 
                        : "text-gray-400 hover:text-gray-500"
                    )}
                  >
                    Lembrete
                  </button>
                </div>

                {newEvent.type === 'reminder' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Data do Lembrete</label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                        className={cn(
                          "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all cursor-pointer",
                          settings.darkMode && "bg-black/40 text-white"
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Conteúdo do Lembrete</label>
                      <textarea
                        value={newEvent.reminder}
                        onChange={(e) => setNewEvent({...newEvent, reminder: e.target.value})}
                        placeholder="O que você precisa lembrar para este dia?"
                        rows={4}
                        className={cn(
                          "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all resize-none",
                          settings.darkMode && "bg-black/40 text-white"
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <>
                        <div className="relative">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nome do Evento</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newEvent.title}
                              onChange={(e) => {
                                setNewEvent({...newEvent, title: e.target.value});
                                if (!showNameSelect) setShowNameSelect(true);
                              }}
                              onFocus={() => setShowNameSelect(true)}
                              placeholder="Ex: Gira de Pretos Velhos"
                              className={cn(
                                "w-full bg-gray-50 border-none rounded-[24px] p-5 pr-12 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all",
                                settings.darkMode && "bg-black/40 text-white"
                              )}
                            />
                            <button 
                              onClick={() => setShowNameSelect(!showNameSelect)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                              <ChevronDown className={cn("w-4 h-4 transition-transform", showNameSelect && "rotate-180")} />
                            </button>
                          </div>

                          <AnimatePresence>
                            {showNameSelect && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowNameSelect(false)} />
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className={cn(
                                    "absolute left-0 right-0 top-full mt-2 bg-white rounded-[24px] shadow-2xl z-20 border border-gray-100 p-2 max-h-[220px] overflow-y-auto scrollbar-hide",
                                    settings.darkMode && "bg-[#252525] border-white/5"
                                  )}
                                >
                                  {settings.eventNames
                                    .filter(name => name.toLowerCase().includes(newEvent.title?.toLowerCase() || ''))
                                    .map(name => (
                                      <button
                                        key={name}
                                        onClick={() => {
                                          setNewEvent({...newEvent, title: name});
                                          setShowNameSelect(false);
                                        }}
                                        className={cn(
                                          "w-full text-left p-4 rounded-xl text-xs font-bold transition-colors hover:bg-gray-50 flex items-center justify-between",
                                          settings.darkMode && "hover:bg-white/5 text-white"
                                        )}
                                      >
                                        {name}
                                        {newEvent.title === name && <Star className="w-3 h-3 text-brand-copper fill-current" />}
                                      </button>
                                    ))}
                                  {settings.eventNames.filter(name => name.toLowerCase().includes(newEvent.title?.toLowerCase() || '')).length === 0 && (
                                    <div className="p-4 text-center">
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Nome personalizado
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Categoria</label>
                            <button
                              onClick={() => setShowCategorySelect(!showCategorySelect)}
                              className={cn(
                                "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all flex items-center justify-between",
                                settings.darkMode && "bg-black/40 text-white"
                              )}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <div 
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: getCategoryColor(newEvent.category || '') }}
                                />
                                <span className="truncate">{newEvent.category}</span>
                              </div>
                              <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", showCategorySelect && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                              {showCategorySelect && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setShowCategorySelect(false)} />
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={cn(
                                      "absolute left-0 right-0 top-full mt-2 bg-white rounded-[24px] shadow-2xl z-20 border border-gray-100 p-2 max-h-[220px] overflow-y-auto scrollbar-hide",
                                      settings.darkMode && "bg-[#252525] border-white/5"
                                    )}
                                  >
                                    {Array.from(new Set(['Lembrete', ...settings.eventCategories])).map(cat => (
                                      <button
                                        key={cat}
                                        onClick={() => {
                                          let reminder = newEvent.reminder || '';
                                          let title = newEvent.title || '';
                                          
                                          if (cat === 'Desenvolvimento') {
                                            if (!reminder) reminder = DEFAULT_DEV_REMINDER;
                                            if (!title || title === 'Gira de desenvolvimento') {
                                              title = suggestDevTitle(newEvent.date || '');
                                            }
                                          }
                                          
                                          setNewEvent({...newEvent, category: cat, reminder, title});
                                          setShowCategorySelect(false);
                                        }}
                                        className={cn(
                                          "w-full text-left p-4 rounded-xl text-xs font-bold transition-colors hover:bg-gray-50 flex items-center gap-3",
                                          settings.darkMode && "hover:bg-white/5 text-white",
                                          newEvent.category === cat && (settings.darkMode ? "bg-white/5" : "bg-gray-50")
                                        )}
                                      >
                                        <div 
                                          className="w-2.5 h-2.5 rounded-full ring-2 ring-white/50 shadow-sm" 
                                          style={{ backgroundColor: getCategoryColor(cat) }}
                                        />
                                        {cat}
                                      </button>
                                    ))}
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Data</label>
                            <input
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                              className={cn(
                                "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all cursor-pointer",
                                settings.darkMode && "bg-black/40 text-white"
                              )}
                            />
                          </div>
                        </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Lembrete (Opcional)</label>
                      <textarea
                        value={newEvent.reminder}
                        onChange={(e) => setNewEvent({...newEvent, reminder: e.target.value})}
                        placeholder="Ponto de atenção ou anotação para este evento..."
                        rows={2}
                        className={cn(
                          "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all resize-none",
                          settings.darkMode && "bg-black/40 text-white"
                        )}
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                      <div 
                        className="flex items-center justify-between mb-4 cursor-pointer"
                        onClick={() => setNewEvent(prev => ({ ...prev, isCanceled: !prev.isCanceled }))}
                      >
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">Evento Cancelado?</span>
                        <button
                          type="button"
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300 pointer-events-none",
                            newEvent.isCanceled ? "bg-red-500" : "bg-gray-200 dark:bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                            newEvent.isCanceled ? "left-7" : "left-1"
                          )} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {newEvent.isCanceled && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'circOut' }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="pt-2">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Motivo do Cancelamento</label>
                              <textarea
                                value={newEvent.cancelReason || ''}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, cancelReason: e.target.value }))}
                                placeholder="Ex: Chuva forte ou indisponibilidade do terreiro"
                                rows={2}
                                className={cn(
                                  "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all resize-none",
                                  settings.darkMode && "bg-black/40 text-white"
                                )}
                              />
                            </div>
                            <div className="pb-2">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Data de Reposição (Opcional)</label>
                              <input
                                type="date"
                                value={newEvent.replacementDate || ''}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, replacementDate: e.target.value }))}
                                className={cn(
                                  "w-full bg-gray-50 border-none rounded-[24px] p-5 focus:ring-2 focus:ring-brand-copper outline-none text-brand-navy font-bold text-sm transition-all cursor-pointer",
                                  settings.darkMode && "bg-black/40 text-white"
                                )}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={closeModal}
                    className={cn(
                      "flex-1 bg-gray-50 text-gray-400 rounded-[24px] p-5 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all hover:bg-gray-100",
                      settings.darkMode && "bg-white/5 text-gray-500 hover:bg-white/10"
                    )}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className={cn(
                      "flex-[2] rounded-[24px] p-5 font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all",
                      settings.darkMode ? "bg-brand-copper text-brand-navy shadow-brand-copper/20" : "bg-brand-navy text-white shadow-brand-navy/10"
                    )}
                  >
                    Salvar Evento
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDatePicker && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setShowDatePicker(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative overflow-hidden",
                settings.darkMode && "bg-[#1A1A1A] text-white border border-white/10"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-6 flex justify-between items-center px-2">
                <h3 className="text-xl font-bold">Selecionar Data</h3>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase text-brand-copper tracking-widest mb-3 px-2">Ano</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {[2026, 2027, 2028, 2029, 2030].map(year => (
                    <button
                      key={year}
                      onClick={() => setCurrentDate(new Date(year, currentDate.getMonth(), 1))}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all snap-center",
                        currentDate.getFullYear() === year
                          ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/20"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-brand-copper tracking-widest mb-3 px-2">Mês</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { full: 'Janeiro', short: 'Jan' },
                    { full: 'Fevereiro', short: 'Fev' },
                    { full: 'Março', short: 'Mar' },
                    { full: 'Abril', short: 'Abr' },
                    { full: 'Maio', short: 'Mai' },
                    { full: 'Junho', short: 'Jun' },
                    { full: 'Julho', short: 'Jul' },
                    { full: 'Agosto', short: 'Ago' },
                    { full: 'Setembro', short: 'Set' },
                    { full: 'Outubro', short: 'Out' },
                    { full: 'Novembro', short: 'Nov' },
                    { full: 'Dezembro', short: 'Dez' }
                  ].map((month, idx) => (
                    <button
                      key={month.short}
                      onClick={() => {
                        setCurrentDate(new Date(currentDate.getFullYear(), idx, 1));
                        setShowDatePicker(false);
                      }}
                      className={cn(
                        "py-3 rounded-xl text-sm font-bold transition-all",
                        currentDate.getMonth() === idx
                          ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/20"
                          : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-400"
                      )}
                    >
                      {month.short}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modals removed in favor of global undo */}

      <AnimatePresence>
        {showDetailsModal && viewingEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-[360px] bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden",
                settings.darkMode && "bg-[#1A1A1A] border border-white/5"
              )}
            >
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-brand-copper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                      viewingEvent.isCanceled && "grayscale opacity-50"
                    )}
                    style={{ backgroundColor: getCategoryColor(viewingEvent.category) }}
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase text-brand-copper tracking-widest leading-none">
                      {viewingEvent.category}
                      {viewingEvent.isCanceled && <span className="ml-2 text-red-500">• CANCELADO</span>}
                    </span>
                    <h3 className={cn(
                      "text-lg font-black text-brand-navy leading-tight mt-1 truncate", 
                      settings.darkMode && "text-white",
                      viewingEvent.isCanceled && "line-through opacity-50"
                    )}>
                      {viewingEvent.title || 'Lembrete'}
                    </h3>
                  </div>
                </div>

                {viewingEvent.isCanceled && (
                  <div className="mb-6 p-5 bg-red-50 dark:bg-red-500/10 rounded-[24px] border border-red-100 dark:border-red-500/20">
                    <span className="block text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">Informações de Cancelamento</span>
                    {viewingEvent.cancelReason && (
                      <p className="text-sm font-bold text-red-900 dark:text-red-200 leading-relaxed mb-3 italic">
                        "{viewingEvent.cancelReason}"
                      </p>
                    )}
                    {viewingEvent.replacementDate && (
                      <div className="flex items-center gap-2 text-brand-copper">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Reposição em {format(parseEventDate(viewingEvent.replacementDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black/20 rounded-[24px] mb-6 border border-gray-100 dark:border-white/5">
                  <div className="flex flex-col items-center justify-center min-w-[50px] pr-4 border-r border-gray-200 dark:border-white/10 text-center">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Dia</span>
                    <span className={cn("text-xl font-black text-brand-navy leading-none", settings.darkMode && "text-brand-copper")}>
                      {format(parseEventDate(viewingEvent.date), 'dd')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Data Completa</span>
                    <span className={cn("text-xs font-bold text-brand-navy uppercase leading-tight", settings.darkMode && "text-white")}>
                      {format(parseEventDate(viewingEvent.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {viewingEvent.reminder && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                      {viewingEvent.type === 'reminder' ? 'Conteúdo' : 'Observações'}
                    </label>
                    <div className={cn(
                      "bg-gray-50 dark:bg-black/20 p-5 rounded-[24px] border-l-4 border-brand-gold/40 max-h-[250px] overflow-y-auto scrollbar-hide",
                      settings.darkMode && "text-gray-200"
                    )}>
                      <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">
                        {viewingEvent.reminder}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


