
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Save, DollarSign, List, Info } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { AppSettings, Bicho } from '../types';
import { cn } from '../lib/utils';

export default function TrabalhosScreen() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [bichos, setBichos] = useStorage<Bicho[]>('templo_bichos', [
    { id: '1', name: 'Carijó', purchaseCost: 65, serviceCost: 150 }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingBicho, setEditingBicho] = useState<Bicho | null>(null);
  const [form, setForm] = useState<Partial<Bicho>>({ name: '', purchaseCost: 0, serviceCost: 0 });

  const handleSave = () => {
    if (!form.name) return;

    if (editingBicho) {
      setBichos(bichos.map(b => b.id === editingBicho.id ? { ...b, ...form } as Bicho : b));
    } else {
      const newBicho: Bicho = {
        id: Date.now().toString(),
        name: form.name!,
        purchaseCost: Number(form.purchaseCost) || 0,
        serviceCost: Number(form.serviceCost) || 0
      };
      setBichos([...bichos, newBicho]);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBicho(null);
    setForm({ name: '', purchaseCost: 0, serviceCost: 0 });
  };

  const openEdit = (bicho: Bicho) => {
    setEditingBicho(bicho);
    setForm(bicho);
    setShowModal(true);
  };

  const removeBicho = (id: string) => {
    setBichos(bichos.filter(b => b.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={cn(
        "p-4 min-h-full transition-colors duration-500",
        settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
      )}
    >
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className={cn(
          "text-xl font-bold tracking-tight",
          settings.darkMode ? "text-white" : "text-brand-navy"
        )}>Gestão de Trabalhos</h2>
      </div>

      {/* Bloco de Bichos */}
      <section className={cn(
        "rounded-[32px] p-6 shadow-sm border transition-colors duration-500",
        settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
            )}>
              <List className="w-4 h-4" />
            </div>
            <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
              Bichos & Valores
            </h3>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95",
              settings.darkMode ? "bg-brand-copper text-white" : "bg-brand-navy text-white"
            )}
          >
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter">Bicho</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center">Compra</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center">Mão</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-center">Total</th>
                <th className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-tighter text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {bichos.map(bicho => (
                <tr key={bicho.id} className="group">
                  <td className={cn("py-4 text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                    {bicho.name}
                  </td>
                  <td className={cn("py-4 text-xs text-center font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                    R${bicho.purchaseCost.toFixed(2)}
                  </td>
                  <td className={cn("py-4 text-xs text-center font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                    R${bicho.serviceCost.toFixed(2)}
                  </td>
                  <td className="py-4 text-xs text-center">
                    <span className={cn(
                      "px-2 py-1 rounded-lg font-black",
                      settings.darkMode ? "bg-brand-copper/10 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
                    )}>
                      R${(bicho.purchaseCost + bicho.serviceCost).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(bicho)} className="p-1.5 text-gray-400 hover:text-brand-copper">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeBicho(bicho.id)} className="p-1.5 text-gray-400 hover:text-brand-red">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {bichos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[10px] text-gray-400 uppercase font-black tracking-widest italic">
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={cn(
          "mt-6 p-4 rounded-2xl flex items-center gap-3",
          settings.darkMode ? "bg-white/5" : "bg-gray-50"
        )}>
          <Info className="w-4 h-4 text-brand-copper" />
          <p className="text-[10px] text-gray-400 font-medium leading-tight">
            Os valores de "Mão" referem-se ao ao valor pago em cada bicho para a mãe Stela cortar. O total é a soma do valor de aquisição + mão.
          </p>
        </div>
      </section>

      {/* Modal Adicionar/Editar */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm rounded-[40px] p-8 relative shadow-2xl overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <h3 className={cn("text-lg font-black mb-6", settings.darkMode ? "text-white" : "text-brand-navy")}>
                {editingBicho ? 'Editar Registro' : 'Novo Bicho'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Nome do Bicho</label>
                  <input 
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Ex: Carijó, Garnizé..."
                    className={cn(
                      "w-full p-4 rounded-2xl outline-none text-sm font-bold border transition-all",
                      settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-brand-copper" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Custo de Compra</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number"
                        value={form.purchaseCost}
                        onChange={e => setForm({...form, purchaseCost: Number(e.target.value)})}
                        className={cn(
                          "w-full p-4 pl-10 rounded-2xl outline-none text-sm font-bold border",
                          settings.darkMode ? "bg-black/20 border-gray-800 text-white" : "bg-gray-50 border-gray-100 text-brand-navy"
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Custo de Mão</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number"
                        value={form.serviceCost}
                        onChange={e => setForm({...form, serviceCost: Number(e.target.value)})}
                        className={cn(
                          "w-full p-4 pl-10 rounded-2xl outline-none text-sm font-bold border",
                          settings.darkMode ? "bg-black/20 border-gray-800 text-white" : "bg-gray-50 border-gray-100 text-brand-navy"
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-2xl flex flex-col items-center justify-center",
                  settings.darkMode ? "bg-brand-copper/10" : "bg-brand-navy/5"
                )}>
                  <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter mb-1">Total Calculado</span>
                  <span className={cn("text-2xl font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                    R${((Number(form.purchaseCost) || 0) + (Number(form.serviceCost) || 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={closeModal}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold text-sm",
                      settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className={cn(
                      "flex-[2] p-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all text-white",
                      settings.darkMode ? "bg-brand-copper shadow-brand-copper/20" : "bg-brand-navy shadow-brand-navy/20"
                    )}
                  >
                    Salvar Registro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
