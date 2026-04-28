import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X, Search, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { Event, AppSettings } from '../types';
import { cn } from '../lib/utils';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useStorage<Event[]>('templo_events', []);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });
  
  const [showModal, setShowModal] = useState(false);
  const [showDayEventsModal, setShowDayEventsModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    category: settings.eventCategories[0],
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const parseEventDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const eventsInMonth = events.filter(e => isSameMonth(parseEventDate(e.date), currentDate));

  const handleSaveEvent = () => {
    if (newEvent.title && newEvent.date) {
      if (editingId) {
        setEvents(events.map(e => e.id === editingId ? { ...e, ...newEvent } as Event : e));
      } else {
        setEvents([...events, { ...newEvent, id: Date.now().toString() } as Event]);
      }
      closeModal();
    }
  };

  const openEditModal = (event: Event) => {
    setNewEvent(event);
    setEditingId(event.id);
    setShowModal(true);
    setShowDayEventsModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewEvent({ title: '', category: settings.eventCategories[0], date: format(new Date(), 'yyyy-MM-dd') });
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    setSelectedDay(day);
    if (dayEvents.length === 0) {
      setNewEvent({ 
        title: '', 
        category: settings.eventCategories[0], 
        date: format(day, 'yyyy-MM-dd') 
      });
      setShowModal(true);
    } else {
      setShowDayEventsModal(true);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(parseEventDate(e.date), day));
  };

  const [search, setSearch] = useState('');

  const filteredEventsInMonth = eventsInMonth
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className={cn(
        "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
        settings.darkMode && "bg-[#121212]"
      )}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className={cn(
          "text-xl font-black text-brand-navy capitalize font-serif tracking-tight",
          settings.darkMode && "text-white"
        )}>
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={cn(
            "p-2 border border-gray-100 bg-white rounded-xl shadow-sm text-brand-navy hover:bg-gray-50 transition-colors",
            settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
          )}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={cn(
            "p-2 border border-gray-100 bg-white rounded-xl shadow-sm text-brand-navy hover:bg-gray-50 transition-colors",
            settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
          )}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={cn(
        "bg-white p-6 rounded-[32px] shadow-sm mb-8 border border-gray-100 transition-colors duration-500",
        settings.darkMode && "bg-[#1A1A1A] border-gray-800"
      )}>
        <div className="grid grid-cols-7 gap-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[10px] uppercase font-black text-gray-200 tracking-tighter mb-4">{d}</div>
          ))}
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            return (
              <button
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 active:scale-95 group",
                  isSameDay(day, new Date()) 
                    ? (settings.darkMode ? "bg-brand-copper text-white shadow-lg shadow-brand-copper/40 scale-110 z-10" : "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 scale-110 z-10") 
                    : (settings.darkMode ? "hover:bg-[#252525]" : "hover:bg-gray-50")
                )}
              >
                <span className={cn(
                  "text-xs font-bold", 
                  !isSameDay(day, new Date()) && (settings.darkMode ? "text-gray-200" : "text-brand-navy")
                )}>{format(day, 'd')}</span>
                {dayEvents.length > 0 && !isSameDay(day, new Date()) && (
                  <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-brand-copper animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 px-1">
        <div className="flex items-center justify-end mb-2">
          <button 
            onClick={() => {
              setEditingId(null);
              setNewEvent({ title: '', category: settings.eventCategories[0], date: format(new Date(), 'yyyy-MM-dd') });
              setShowModal(true);
            }}
            className="flex items-center gap-1 bg-brand-navy text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-brand-navy/10 active:scale-95 transition-transform"
          >
            <Plus className="w-3 h-3" /> Agendar
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input 
            placeholder="Pesquisar eventos..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(
              "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-10 text-xs outline-none focus:ring-1 focus:ring-brand-copper shadow-sm",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
            )}
          />
        </div>

        {filteredEventsInMonth.length === 0 ? (
          <div className={cn(
            "bg-white rounded-[24px] p-10 text-center border-2 border-dashed border-gray-100",
            settings.darkMode && "bg-[#1A1A1A] border-gray-800"
          )}>
            <p className="text-gray-400 text-xs italic">Nenhum evento encontrado nos Guerreiros de Oya e Ogun.</p>
          </div>
        ) : (
          filteredEventsInMonth.map(event => (
            <div key={event.id} className={cn(
              "bg-white p-5 rounded-[24px] shadow-sm border border-gray-50 flex gap-5 active:scale-[0.98] transition-all",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
            )}>
              <div className={cn(
                "flex flex-col items-center justify-center pr-5 border-r border-gray-50 min-w-[55px]",
                settings.darkMode && "border-gray-800"
              )}>
                <span className={cn("text-2xl font-black text-brand-navy leading-none mb-1", settings.darkMode && "text-white")}>{format(parseEventDate(event.date), 'dd')}</span>
                <span className="text-[9px] font-black text-brand-copper uppercase tracking-tighter">{format(parseEventDate(event.date), 'EEEE', { locale: ptBR }).split('-')[0]}</span>
              </div>
              <div className="flex-1 overflow-hidden py-1">
                <h4 className={cn("font-bold text-brand-navy truncate text-base leading-tight mb-2", settings.darkMode && "text-white")}>{event.title}</h4>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 bg-brand-navy/5 rounded-full border border-brand-navy/10",
                  settings.darkMode && "bg-white/5 border-white/10"
                )}>
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                   <span className={cn("text-[9px] text-brand-navy font-black uppercase tracking-widest leading-none", settings.darkMode && "text-gray-200")}>
                    {event.category}
                   </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 self-start">
                <button 
                  onClick={() => openEditModal(event)}
                  className="text-gray-400 hover:text-brand-copper transition-colors p-2"
                  title="Editar Evento"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Excluir Evento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
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
                "bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto",
                settings.darkMode && "bg-[#1A1A1A] text-white"
              )}
            >
              <button 
                onClick={() => setShowDayEventsModal(false)} 
                className={cn(
                  "absolute top-6 right-6 p-2 text-gray-400 bg-gray-50 rounded-full",
                  settings.darkMode && "bg-black/40"
                )}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="mb-6">
                <h3 className={cn("text-2xl font-bold text-brand-navy", settings.darkMode && "text-white")}>
                  {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-brand-copper text-[10px] font-black uppercase tracking-widest mt-1">Eventos do Dia</p>
              </div>

              <div className="space-y-3 mb-8">
                {getEventsForDay(selectedDay).map(event => (
                  <div key={event.id} className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border border-gray-100",
                    settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50"
                  )}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{event.title}</h4>
                      <span className="text-[10px] text-brand-copper font-black uppercase tracking-widest">{event.category}</span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => openEditModal(event)}
                        className="p-2 text-gray-400 hover:text-brand-navy transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const updatedEvents = events.filter(e => e.id !== event.id);
                          setEvents(updatedEvents);
                          if (updatedEvents.filter(e => isSameDay(new Date(e.date), selectedDay)).length === 0) {
                            setShowDayEventsModal(false);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setNewEvent({ 
                    title: '', 
                    category: settings.eventCategories[0], 
                    date: format(selectedDay, 'yyyy-MM-dd') 
                  });
                  setShowDayEventsModal(false);
                  setShowModal(true);
                }}
                className="w-full bg-brand-navy text-white rounded-2xl p-5 font-bold text-lg shadow-lg shadow-brand-navy/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar Outro Evento
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
                "bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A] text-white"
              )}
            >
              <button 
                onClick={closeModal} 
                className={cn(
                  "absolute top-6 right-6 p-2 text-gray-400 bg-gray-50 rounded-full",
                  settings.darkMode && "bg-black/40"
                )}
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className={cn("text-2xl font-bold text-brand-navy mb-6", settings.darkMode && "text-white")}>
                {editingId ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome do Evento</label>
                  <input
                    list="event-suggestions"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="Ex: Gira de Pretos Velhos"
                    className={cn(
                      "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-navy font-medium",
                      settings.darkMode && "bg-black/40 text-white"
                    )}
                  />
                  <datalist id="event-suggestions">
                    {settings.eventNames.map(name => <option key={name} value={name} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Categoria</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                      className={cn(
                        "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-navy font-medium",
                        settings.darkMode && "bg-black/40 text-white"
                      )}
                    >
                      {settings.eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Data</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className={cn(
                        "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none text-brand-navy font-medium",
                        settings.darkMode && "bg-black/40 text-white"
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className={cn(
                      "flex-1 bg-gray-100 text-gray-500 rounded-2xl p-5 font-bold text-lg active:scale-95 transition-transform",
                      settings.darkMode && "bg-gray-800 text-gray-400"
                    )}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-[2] bg-brand-navy text-white rounded-2xl p-5 font-bold text-lg shadow-lg shadow-brand-navy/20 active:scale-95 transition-transform"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


