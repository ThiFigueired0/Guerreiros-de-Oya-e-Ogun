import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, X, Heart, Share2, Trash2, Search, CalendarClock, ChevronLeft, Folder, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { HerbBath, AppSettings } from '../types';
import { cn } from '../lib/utils';

export default function HerbsScreen() {
  const location = useLocation();
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    bathCategories: ['Gerais', 'Orixás', 'Entidades'],
    pushNotifications: false
  });

  const [baths, setBaths] = useStorage<HerbBath[]>('templo_baths', []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Initialize bathCategories if they don't exist
  React.useEffect(() => {
    if (!settings.bathCategories) {
      setSettings({
        ...settings,
        bathCategories: ['Gerais', 'Orixás', 'Entidades']
      });
    }
  }, [settings, setSettings]);

  const bathCategories = settings.bathCategories || ['Gerais', 'Orixás', 'Entidades'];
  
  // Cleanup test data if present in storage
  React.useEffect(() => {
    if (baths.some(b => b.id === '1' || b.id === '2')) {
      setBaths(baths.filter(b => b.id !== '1' && b.id !== '2'));
    }
  }, [baths, setBaths]);
  
  const [showModal, setShowModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newBath, setNewBath] = useState<Partial<HerbBath>>({
    title: '',
    herbs: '',
    observations: '',
    isFavorite: false,
    category: 'Gerais'
  });

  const [selectedBathForDetails, setSelectedBathForDetails] = useState<HerbBath | null>(null);

  // Handle openBathId from navigation state
  useEffect(() => {
    const state = location.state as { openBathId?: string } | null;
    if (state?.openBathId && baths.length > 0) {
      const bath = baths.find(b => b.id === state.openBathId);
      if (bath) {
        setSelectedBathForDetails(bath);
        // Clear history state to avoid reopening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, baths]);

  const handleSaveBath = () => {
    if (newBath.title) {
      if (editingId) {
        setBaths(baths.map(b => b.id === editingId ? { ...b, ...newBath } as HerbBath : b));
      } else {
        setBaths([...baths, { ...newBath, id: Date.now().toString() } as HerbBath]);
      }
      setShowModal(false);
      setEditingId(null);
      setNewBath({ title: '', herbs: '', observations: '', isFavorite: false, category: selectedCategory || 'Gerais' });
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName && !bathCategories.includes(newCategoryName)) {
      setSettings({
        ...settings,
        bathCategories: [...bathCategories, newCategoryName]
      });
      setNewCategoryName('');
      setShowCategoryModal(false);
    }
  };

  const openEditModal = (bath: HerbBath) => {
    setNewBath(bath);
    setEditingId(bath.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewBath({ title: '', herbs: '', observations: '', isFavorite: false, category: selectedCategory || 'Gerais' });
  };

  const toggleFavorite = (id: string) => {
    setBaths(baths.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const deleteBath = (id: string) => {
    setBaths(baths.filter(b => b.id !== id));
  };

  const handleShare = async (bath: HerbBath) => {
    const text = `🌿 *Banho Espiritual - ${bath.title}*\n\n🍃 *Ervas:* ${bath.herbs}\n\n📝 *Observações:* ${bath.observations}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: bath.title,
          text: text,
        });
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    }
  };

  const filteredBaths = baths
    .filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.herbs.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? (b.category === selectedCategory || (!b.category && selectedCategory === 'Gerais')) : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500 pb-20",
      settings.darkMode && "bg-[#121212]"
    )}>
      {!selectedCategory && !search && (
        <button 
          onClick={() => setShowRoutineModal(true)}
          className={cn(
            "w-full mb-6 p-5 rounded-[24px] bg-gradient-to-r from-brand-gold-light to-brand-gold-medium text-brand-navy shadow-xl shadow-brand-gold-medium/30 flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden relative",
            settings.darkMode && "from-brand-gold-medium to-brand-gold-dark text-white shadow-black/40"
          )}
        >
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black tracking-tight">Semana de Gira</h3>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm relative z-10">
            Ver Agenda
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </button>
      )}

      <div className="flex items-center gap-3 mb-6 px-2">
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "p-2 rounded-xl border transition-colors",
              settings.darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-100 text-brand-navy"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className={cn(
          "text-xl font-bold text-brand-navy tracking-tight flex-1",
          settings.darkMode && "text-white"
        )}>
          {selectedCategory ? selectedCategory : "Banhos de Ervas"}
        </h2>
        <button onClick={() => setShowModal(true)} className={cn(
          "p-3 bg-brand-navy text-white rounded-2xl shadow-lg",
          settings.darkMode && "bg-brand-copper"
        )}>
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar banho ou ervas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none text-sm",
            settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
          )}
        />
      </div>

      {!selectedCategory && !search ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {bathCategories.map((cat) => {
              const count = baths.filter(b => b.category === cat || (!b.category && cat === 'Gerais')).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "p-6 rounded-[32px] text-left border relative overflow-hidden transition-all active:scale-95 group",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100 shadow-sm"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Folder className="w-5 h-5 text-brand-copper fill-brand-copper" />
                  </div>
                  <h3 className={cn("font-bold text-sm", settings.darkMode ? "text-white" : "text-brand-navy")}>{cat}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-black uppercase tracking-wider">{count} {count === 1 ? 'Banho' : 'Banhos'}</p>
                </button>
              );
            })}
            <button
              onClick={() => setShowCategoryModal(true)}
              className={cn(
                "p-6 rounded-[32px] text-left border border-dashed flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                settings.darkMode ? "border-gray-800 bg-white/5" : "border-gray-200 bg-gray-50"
              )}
            >
              <PlusCircle className="w-6 h-6 text-gray-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nova Pasta</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredBaths.length > 0 ? (
            filteredBaths.map(bath => (
              <motion.div 
                layout
                key={bath.id} 
                className={cn(
                  "bg-white p-6 rounded-[32px] shadow-sm relative overflow-hidden border border-gray-100 transition-colors duration-500",
                  bath.isFavorite && "border-brand-copper/30 bg-white",
                  settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl",
                  settings.darkMode && bath.isFavorite && "border-brand-copper/50 bg-[#1A1A1A]"
                )}
              >
                <div className="flex justify-end items-start mb-2">
                   <button onClick={() => toggleFavorite(bath.id)}>
                    <Heart className={cn("w-6 h-6 transition-all", bath.isFavorite ? "fill-brand-red text-brand-red" : (settings.darkMode ? "text-gray-700" : "text-gray-200"))} />
                  </button>
                </div>
                <div 
                  className="cursor-pointer group/content mb-6" 
                  onClick={() => setSelectedBathForDetails(bath)}
                >
                  <h4 className={cn(
                    "font-bold text-brand-navy text-lg leading-tight group-hover/content:text-brand-copper transition-colors", 
                    settings.darkMode && "text-white dark:group-hover/content:text-brand-gold"
                  )}>
                    {bath.title}
                  </h4>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShare(bath)}
                    className="flex-[2] flex items-center justify-center gap-2 text-white bg-brand-red px-4 py-3 rounded-xl text-xs font-bold shadow-md shadow-brand-red/10 active:scale-95 transition-transform"
                  >
                    <Share2 className="w-4 h-4" /> Whatsapp
                  </button>
                  <button 
                    onClick={() => openEditModal(bath)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform border",
                      settings.darkMode 
                        ? "bg-gray-800 text-gray-200 border-gray-700" 
                        : "bg-gray-100 text-brand-navy border-gray-200"
                    )}
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteBath(bath.id)}
                    className={cn(
                      "p-3 transition-colors rounded-xl",
                      settings.darkMode ? "text-red-500/40 hover:text-red-500 hover:bg-red-500/10" : "text-gray-300 hover:text-red-600 hover:bg-red-50"
                    )}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {bath.isFavorite && (
                  <div className="absolute top-4 right-4 -z-10 opacity-5">
                    <Heart className="w-24 h-24 fill-brand-red" />
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className={cn(
              "p-12 rounded-[40px] text-center border-2 border-dashed",
              settings.darkMode ? "border-white/5" : "border-gray-50"
            )}>
              <p className="text-gray-400 text-sm italic">Nenhum banho nesta pasta.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedBathForDetails && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4"
            onClick={() => setSelectedBathForDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]",
                settings.darkMode && "bg-[#1A1A1A] text-white border border-white/10"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className={cn(
                "p-6 border-b flex justify-between items-center",
                settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50/50 border-gray-100"
              )}>
                <h3 className={cn(
                  "text-xl font-black pr-8",
                  settings.darkMode ? "text-white" : "text-brand-navy"
                )}>{selectedBathForDetails.title}</h3>
                <button 
                  onClick={() => setSelectedBathForDetails(null)}
                  className={cn(
                    "p-2 rounded-xl transition-colors shrink-0",
                    settings.darkMode ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-300"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div>
                   <p className="text-[10px] font-black uppercase text-brand-copper tracking-[0.2em] mb-4">Composição Sagrada</p>
                   <div className="space-y-2">
                     {selectedBathForDetails.herbs.split('\n').filter(line => line.trim()).map((herb, idx) => (
                       <motion.div 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border",
                          settings.darkMode 
                            ? "bg-white/10 border-white/10" 
                            : "bg-gray-50 border-gray-200"
                        )}
                       >
                         <div className="w-1.5 h-1.5 rounded-full bg-brand-copper shrink-0" />
                         <span className={cn(
                           "text-sm font-bold",
                           settings.darkMode ? "text-white" : "text-gray-900"
                         )}>{herb}</span>
                       </motion.div>
                     ))}
                   </div>
                </div>

                {selectedBathForDetails.observations && (
                  <div>
                    <p className="text-[10px] font-black uppercase text-brand-copper tracking-[0.2em] mb-3">Modo de Preparo / Obs.</p>
                    <div className={cn(
                      "p-5 rounded-2xl border",
                      settings.darkMode 
                        ? "bg-brand-gold/20 border-brand-gold/20" 
                        : "bg-brand-gold/10 border-brand-gold/20"
                    )}>
                      <p className={cn(
                        "text-sm font-bold leading-relaxed",
                        settings.darkMode ? "text-white" : "text-gray-800"
                      )}>
                        {selectedBathForDetails.observations}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className={cn(
                "p-6 border-t flex gap-3",
                settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-t-gray-100"
              )}>
                <button 
                  onClick={() => handleShare(selectedBathForDetails)}
                  className="flex-1 bg-brand-red text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Whatsapp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showRoutineModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={() => setShowRoutineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowRoutineModal(false)} className="text-gray-300 hover:text-gray-500">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex flex-col items-center mb-8">
                 <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mb-4">
                    <CalendarClock className="w-8 h-8 text-brand-gold" />
                 </div>
                 <h3 className={cn("text-xl font-bold text-brand-navy text-center", settings.darkMode && "text-white")}>Semana de Gira</h3>
                 <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-1">Cronograma Sagrado</p>
              </div>

              <div className="space-y-3">
                {[
                  { day: 'Segunda-feira', bath: 'Banho de descarrego' },
                  { day: 'Terça-feira', bath: 'Banho de descarrego' },
                  { day: 'Quarta-feira', bath: 'Banho de descarrego' },
                  { day: 'Quinta-feira', bath: 'Banho de desenvolvimento' },
                  { day: 'Sexta-feira', bath: 'Banho energizador' },
                  { day: 'Sábado', bath: 'Banho da gira' },
                ].map((item, idx) => (
                  <div key={idx} className={cn(
                    "flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30",
                    settings.darkMode && "border-gray-800 bg-white/5"
                  )}>
                    <span className={cn("text-[11px] font-black uppercase tracking-tight text-brand-navy/60", settings.darkMode && "text-gray-400")}>
                      {item.day}
                    </span>
                    <span className={cn("text-xs font-bold text-brand-copper", settings.darkMode && "text-brand-gold")}>
                      {item.bath}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowRoutineModal(false)}
                className="w-full mt-8 p-4 rounded-xl bg-brand-navy text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-navy/20 active:scale-95 transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}

        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A] text-white border border-white/10"
              )}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Nova Pasta</h3>
              <input
                placeholder="Nome da pasta..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={cn(
                  "w-full bg-gray-50 border-none rounded-2xl p-4 mb-4 focus:ring-2 focus:ring-brand-copper outline-none",
                  settings.darkMode && "bg-black/40 text-white"
                )}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className={cn(
                    "flex-1 p-4 rounded-2xl font-bold",
                    settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                  )}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="flex-1 p-4 rounded-2xl bg-brand-navy text-white font-bold"
                >
                  Criar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={cn(
                "bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={cn("text-2xl font-bold text-brand-navy mb-6", settings.darkMode && "text-white")}>
                {editingId ? 'Editar Receita' : 'Criar Nova Receita'}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-brand-copper tracking-widest px-2">Pasta</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {bathCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewBath({...newBath, category: cat})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                          newBath.category === cat
                            ? "bg-brand-navy border-brand-navy text-white"
                            : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-white border-gray-100 text-gray-500")
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  placeholder="Título do Banho"
                  value={newBath.title}
                  onChange={(e) => setNewBath({...newBath, title: e.target.value})}
                  className={cn(
                    "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none",
                    settings.darkMode && "bg-black/40 text-white"
                  )}
                />
                <textarea
                  placeholder="Ervas (uma por linha)"
                  rows={4}
                  value={newBath.herbs}
                  onChange={(e) => setNewBath({...newBath, herbs: e.target.value})}
                  className={cn(
                    "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none",
                    settings.darkMode && "bg-black/40 text-white"
                  )}
                />
                <textarea
                  placeholder="Observações / Modo de preparo"
                  rows={4}
                  value={newBath.observations}
                  onChange={(e) => setNewBath({...newBath, observations: e.target.value})}
                  className={cn(
                    "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none",
                    settings.darkMode && "bg-black/40 text-white"
                  )}
                />
                <div className="flex flex-col gap-4 pt-2">
                  <div className="flex gap-4">
                    <button onClick={closeModal} className={cn(
                      "flex-1 p-4 rounded-2xl bg-gray-100 text-gray-500 font-bold",
                      settings.darkMode && "bg-gray-800 text-gray-400"
                    )}>Cancelar</button>
                    <button onClick={handleSaveBath} className="flex-1 p-4 rounded-2xl bg-brand-red text-white font-bold">Salvar</button>
                  </div>
                  
                  {editingId && (
                    <button 
                      onClick={() => {
                        deleteBath(editingId);
                        closeModal();
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-2",
                        settings.darkMode && "bg-red-500/5"
                      )}
                    >
                      <Trash2 className="w-4 h-4" /> Excluir permanentemente
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
