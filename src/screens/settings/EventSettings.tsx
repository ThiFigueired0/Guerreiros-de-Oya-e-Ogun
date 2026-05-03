import React, { useState } from 'react';
import { Plus, Trash2, X, Calendar } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { DeleteConfirmationModal } from '../../components/DeleteConfirmationModal';

export default function EventSettings() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);
  const [newCat, setNewCat] = useState('');
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'category' | 'name', value: string} | null>(null);

  const addCategory = () => {
    if (newCat.trim() && !settings.eventCategories.includes(newCat.trim())) {
      setSettings({
        ...settings,
        eventCategories: [...settings.eventCategories, newCat.trim()]
      });
      setNewCat('');
    }
  };

  const removeCategory = (cat: string) => {
    setItemToDelete({ type: 'category', value: cat });
    setShowDeleteConfirm(true);
  };

  const addNameSuggestion = () => {
    if (newName.trim() && !settings.eventNames.includes(newName.trim())) {
      setSettings({
        ...settings,
        eventNames: [...settings.eventNames, newName.trim()]
      });
      setNewName('');
    }
  };

  const removeName = (name: string) => {
    setItemToDelete({ type: 'name', value: name });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'category') {
      setSettings({
        ...settings,
        eventCategories: settings.eventCategories.filter(c => c !== itemToDelete.value)
      });
    } else {
      setSettings({
        ...settings,
        eventNames: settings.eventNames.filter(n => n !== itemToDelete.value)
      });
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  return (
    <div className="space-y-6">
      <section className={cn(
        "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
        settings.darkMode && "bg-[#1A1A1A] border-gray-800"
      )}>
         <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em]">Gestão de Agenda</h3>
         <div className="space-y-6">
            <div className={cn("pb-6 border-b border-gray-100", settings.darkMode && "border-gray-800")}>
              <p className={cn("text-[9px] font-black text-gray-700 dark:text-gray-400 mb-4 uppercase tracking-widest")}>Categorias de Evento</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.eventCategories.map((cat, i) => (
                  <span key={`${cat}-${i}`} className={cn(
                    "bg-brand-navy/5 text-brand-navy px-3 py-2 rounded-xl text-[9px] font-bold flex items-center gap-2 uppercase tracking-widest border border-brand-navy/10",
                    settings.darkMode && "bg-white/5 text-white border-white/10"
                  )}>
                    {cat}
                    <button onClick={() => removeCategory(cat)} className="text-brand-red ml-1"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  placeholder="Nova Categoria..." 
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCategory()}
                  className={cn(
                    "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                    settings.darkMode && "bg-black/40 border-gray-800 text-white"
                  )}
                />
                <button onClick={addCategory} className="bg-brand-navy text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <p className={cn("text-[9px] font-black text-gray-700 dark:text-gray-400 mb-4 uppercase tracking-widest")}>Sugestões de Nomes</p>
              <div className="grid gap-2 mb-4 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {settings.eventNames.map((name, i) => (
                  <div key={`${name}-${i}`} className={cn(
                    "flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100",
                    settings.darkMode && "bg-black/40 border-gray-800"
                  )}>
                    <span className={cn("text-xs font-bold text-brand-navy", settings.darkMode && "text-gray-200")}>{name}</span>
                    <button onClick={() => removeName(name)}><Trash2 className="w-4 h-4 text-red-500 opacity-60 hover:opacity-100" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  placeholder="Novo Nome Padrão..." 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNameSuggestion()}
                  className={cn(
                    "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                    settings.darkMode && "bg-black/40 border-gray-800 text-white"
                  )}
                />
                <button onClick={addNameSuggestion} className="bg-brand-copper text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
         </div>
      </section>

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'category' ? "Excluir Categoria" : "Excluir Sugestão"}
        message={itemToDelete?.type === 'category' 
          ? "Deseja realmente excluir esta categoria de evento?" 
          : "Deseja realmente excluir esta sugestão de nome?"
        }
      />
    </div>
  );
}
