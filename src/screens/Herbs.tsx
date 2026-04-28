import React, { useState } from 'react';
import { Plus, X, Heart, Share2, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { HerbBath, AppSettings } from '../types';
import { cn } from '../lib/utils';

export default function HerbsScreen() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [baths, setBaths] = useStorage<HerbBath[]>('templo_baths', [
    { id: '1', title: 'Banho de Descarrego', herbs: 'Aroeira, Guiné, Espada de São Jorge', observations: 'Ferver por 10 min. Tomar do pescoço para baixo na segunda-feira.', isFavorite: true },
    { id: '2', title: 'Banho de Prosperidade', herbs: 'Canela, Cravo, Louro', observations: 'Pode ser tomado em qualquer dia. Mentalizar abundância.', isFavorite: false }
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newBath, setNewBath] = useState<Partial<HerbBath>>({
    title: '',
    herbs: '',
    observations: '',
    isFavorite: false
  });

  const handleSaveBath = () => {
    if (newBath.title) {
      if (editingId) {
        setBaths(baths.map(b => b.id === editingId ? { ...b, ...newBath } as HerbBath : b));
      } else {
        setBaths([...baths, { ...newBath, id: Date.now().toString() } as HerbBath]);
      }
      setShowModal(false);
      setEditingId(null);
      setNewBath({ title: '', herbs: '', observations: '', isFavorite: false });
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
    setNewBath({ title: '', herbs: '', observations: '', isFavorite: false });
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
    .filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.herbs.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
      settings.darkMode && "bg-[#121212]"
    )}>
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className={cn(
          "text-xl font-bold text-brand-navy tracking-tight",
          settings.darkMode && "text-white"
        )}>Banhos de Ervas</h2>
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

      <div className="grid gap-4">
        {filteredBaths.map(bath => (
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
            <div className="flex justify-between items-start mb-1">
               <span className="text-brand-red font-serif italic text-xs">Receita Sagrada</span>
               <button onClick={() => toggleFavorite(bath.id)}>
                <Heart className={cn("w-6 h-6 transition-all", bath.isFavorite ? "fill-brand-red text-brand-red" : (settings.darkMode ? "text-gray-700" : "text-gray-200"))} />
              </button>
            </div>
            <h4 className={cn("font-bold text-brand-navy text-lg mb-3 leading-tight", settings.darkMode && "text-white")}>{bath.title}</h4>
            
            <div className={cn(
              "bg-gray-50/50 rounded-2xl p-4 mb-4 border border-gray-100/50",
              settings.darkMode && "bg-black/20 border-gray-800"
            )}>
               <p className={cn("text-brand-navy font-bold text-xs uppercase tracking-widest mb-1 opacity-40", settings.darkMode && "text-white opacity-40")}>Composição</p>
               <p className={cn("text-brand-navy font-semibold text-sm", settings.darkMode && "text-gray-200")}>{bath.herbs}</p>
            </div>

            <p className={cn("text-gray-500 text-xs italic leading-relaxed mb-6 px-1", settings.darkMode && "text-gray-400")}>{bath.observations}</p>
            
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
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={cn(
                "bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <h3 className={cn("text-2xl font-bold text-brand-navy mb-6", settings.darkMode && "text-white")}>
                {editingId ? 'Editar Receita' : 'Criar Nova Receita'}
              </h3>
              <div className="space-y-4">
                <input
                  placeholder="Título do Banho"
                  value={newBath.title}
                  onChange={(e) => setNewBath({...newBath, title: e.target.value})}
                  className={cn(
                    "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-gold outline-none",
                    settings.darkMode && "bg-black/40 text-white"
                  )}
                />
                <input
                  placeholder="Ervas (separadas por vírgula)"
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
