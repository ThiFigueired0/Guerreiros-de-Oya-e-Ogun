
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Save, DollarSign, List, Info, Search, Calculator, PlusCircle, MinusCircle, History, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { AppSettings, Bicho, SimulatorItem, SimulationRecord, OfferingEntity, Candle, Event } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

export default function TrabalhosScreen() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [bichos, setBichos] = useStorage<Bicho[]>('templo_bichos', [
    { id: '1', name: 'Carijó', purchaseCost: 65, serviceCost: 150 },
    { id: '2', name: 'Galo', purchaseCost: 210, serviceCost: 200 },
    { id: '3', name: 'Preá', purchaseCost: 0, serviceCost: 250 },
    { id: '4', name: 'Angola', purchaseCost: 0, serviceCost: 300 },
    { id: '5', name: 'Cabrito', purchaseCost: 0, serviceCost: 600 },
    { id: '6', name: 'Calçado', purchaseCost: 0, serviceCost: 850 },
    { id: '7', name: 'Perua', purchaseCost: 0, serviceCost: 300 },
    { id: '8', name: 'Pombo', purchaseCost: 40, serviceCost: 50 },
    { id: '9', name: 'Codorna', purchaseCost: 0, serviceCost: 20 },
    { id: '10', name: 'Garnizé', purchaseCost: 90, serviceCost: 0 }
  ]);

  const formatCurrency = (value: number) => {
    if (value === 0) return '-';
    return `R$${value.toFixed(2)}`;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [simulatorItems, setSimulatorItems] = useState<SimulatorItem[]>([]);
  const [simulationHistory, setSimulationHistory] = useStorage<SimulationRecord[]>('templo_simulation_history', []);
  const [editingBicho, setEditingBicho] = useState<Bicho | null>(null);
  const [form, setForm] = useState<Partial<Bicho>>({ name: '', purchaseCost: 0, serviceCost: 0 });

  const [offeringsExpanded, setOfferingsExpanded] = useState(false);
  const [eboExpanded, setEboExpanded] = useState(false);
  const [showEboEditModal, setShowEboEditModal] = useState(false);

  const [eboConfig, setEboConfig] = useStorage<{serviceCost: number; materialsCost: number}>('templo_ebo_config', {
    serviceCost: 600,
    materialsCost: 200
  });

  const [eboForm, setEboForm] = useState({ 
    serviceCost: eboConfig.serviceCost, 
    materialsCost: eboConfig.materialsCost 
  });

  const [candles, setCandles] = useStorage<Candle[]>('templo_candles', [
    { id: '1', color: 'Branca', quantity: 10, type: '7 Dias' },
    { id: '2', color: 'Vermelha', quantity: 5, type: 'Palito' },
    { id: '3', color: 'Preta', quantity: 12, type: 'Palito' }
  ]);
  const [showCandleModal, setShowCandleModal] = useState(false);
  const [editingCandle, setEditingCandle] = useState<Candle | null>(null);
  const [candleForm, setCandleForm] = useState<Partial<Candle>>({ color: '', quantity: 0, type: 'Palito', observations: '' });

  const [events] = useStorage<Event[]>('templo_events', []);

  const [activeTab, setActiveTab] = useState<'cuts' | 'ebo' | 'candles'>('cuts');

  const [offerings, setOfferings] = useStorage<OfferingEntity[]>('templo_offerings', [
    {
      id: 'exu',
      name: 'Exu',
      color: 'bg-brand-red',
      sections: [
        {
          title: 'Oferenda exu',
          items: ['Vela preta', 'Cachaça', 'Pimenta', 'Bisteca', 'Bife de boi', 'Miúdo', 'Costela de boi/porco', 'Banana frita', 'Bife de fígado', 'Banana da terra']
        },
        {
          title: 'Frutas (cítricas)',
          items: ['Limão', 'Maracujá', 'Acerola', 'Laranja', 'Tangerina', 'Caju', 'Abacaxi']
        }
      ]
    },
    {
      id: 'pombagira',
      name: 'Pombagira',
      color: 'bg-pink-500',
      sections: [
        {
          items: ['Rosas', 'Cigarro', 'Champanhe', 'Coração de galinha', 'Frutas (doces)', 'Miudo', 'Groselha', 'Cereja', 'Pêssego', 'Frutas cristalizadas']
        }
      ]
    },
    {
      id: 'exu_mirim',
      name: 'Exu Mirim',
      color: 'bg-brand-copper',
      sections: [{ items: [] }]
    },
    {
      id: 'malandros',
      name: 'Malandros',
      color: 'bg-brand-navy',
      sections: [{ items: [] }]
    }
  ]);

  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [editingOfferingId, setEditingOfferingId] = useState<string | null>(null);
  const [offeringForm, setOfferingForm] = useState<{ name: string; sections: { title?: string; items: string[] }[] }>({ name: '', sections: [] });

  const openOfferingEdit = (offering: OfferingEntity) => {
    setEditingOfferingId(offering.id);
    setOfferingForm({
      name: offering.name,
      sections: offering.sections.map((s: { title?: string; items: string[] }) => ({ ...s, items: [...s.items] }))
    });
    setShowOfferingModal(true);
  };

  const saveOffering = () => {
    setOfferings(offerings.map(o => 
      o.id === editingOfferingId 
        ? { ...o, name: offeringForm.name, sections: offeringForm.sections }
        : o
    ));
    setShowOfferingModal(false);
  };

  const addOfferingSection = () => {
    setOfferingForm({
      ...offeringForm,
      sections: [...offeringForm.sections, { title: '', items: [] }]
    });
  };

  const removeOfferingSection = (index: number) => {
    setOfferingForm({
      ...offeringForm,
      sections: offeringForm.sections.filter((_, i) => i !== index)
    });
  };

  const updateSectionTitle = (index: number, title: string) => {
    const newSections = [...offeringForm.sections];
    newSections[index].title = title;
    setOfferingForm({ ...offeringForm, sections: newSections });
  };

  const addOfferingItem = (sectionIndex: number) => {
    const newSections = [...offeringForm.sections];
    newSections[sectionIndex].items.push('');
    setOfferingForm({ ...offeringForm, sections: newSections });
  };

  const updateOfferingItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...offeringForm.sections];
    newSections[sectionIndex].items[itemIndex] = value;
    setOfferingForm({ ...offeringForm, sections: newSections });
  };

  const removeOfferingItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...offeringForm.sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setOfferingForm({ ...offeringForm, sections: newSections });
  };

  const filteredBichos = bichos.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleSaveCandle = () => {
    if (!candleForm.color || !candleForm.type) return;

    if (editingCandle) {
      setCandles(candles.map(c => c.id === editingCandle.id ? { ...c, ...candleForm } as Candle : c));
    } else {
      const newCandle: Candle = {
        id: Date.now().toString(),
        color: candleForm.color!,
        quantity: Number(candleForm.quantity) || 0,
        type: candleForm.type!,
        observations: candleForm.observations
      };
      setCandles([...candles, newCandle]);
    }
    setShowCandleModal(false);
    setEditingCandle(null);
    setCandleForm({ color: '', quantity: 0, type: 'Palito', observations: '' });
  };

  const addToSimulator = (bicho: Bicho) => {
    const newItem: SimulatorItem = {
      id: Date.now().toString(),
      bichoId: bicho.id,
      quantity: 1,
      entidade: '',
      observations: ''
    };
    setSimulatorItems([...simulatorItems, newItem]);
  };

  const updateSimulatorItem = (id: string, updates: Partial<SimulatorItem>) => {
    setSimulatorItems(simulatorItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeFromSimulator = (id: string) => {
    setSimulatorItems(simulatorItems.filter(item => item.id !== id));
  };

  const calculateSimulatorTotal = () => {
    return simulatorItems.reduce((total, item) => {
      const bicho = bichos.find(b => b.id === item.bichoId);
      if (!bicho) return total;
      return total + ((bicho.purchaseCost + bicho.serviceCost) * item.quantity);
    }, 0);
  };

  const handleFinishSimulation = () => {
    if (simulatorItems.length === 0) {
      setShowSimulator(false);
      return;
    }

    const total = calculateSimulatorTotal();
    const now = Date.now();

    if (activeSimulationId) {
      // Update existing
      setSimulationHistory(simulationHistory.map(record => 
        record.id === activeSimulationId 
          ? { ...record, items: [...simulatorItems], total, timestamp: now }
          : record
      ));
    } else {
      // Create new
      const newRecord: SimulationRecord = {
        id: now.toString(),
        items: [...simulatorItems],
        total,
        timestamp: now,
        title: `Simulação ${simulationHistory.length + 1}`
      };
      setSimulationHistory([newRecord, ...simulationHistory]);
    }

    setShowSimulator(false);
    setSimulatorItems([]);
    setActiveSimulationId(null);
  };

  const openSimulatorFromHistory = (record: SimulationRecord) => {
    setSimulatorItems([...record.items]);
    setActiveSimulationId(record.id);
    setShowHistoryModal(false);
    setShowSimulator(true);
  };

  const deleteHistoryRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSimulationHistory(simulationHistory.filter(r => r.id !== id));
  };

  const white7DayCandle = candles.find(c => c.color.toLowerCase() === 'branca' && c.type === '7 Dias');
  const sessionsCovered = white7DayCandle ? Math.floor(white7DayCandle.quantity / 3) : 0;

  const coveredSessions = React.useMemo(() => {
    const sessions: { date: Date; title: string }[] = [];
    const today = new Date();
    let current = new Date(today);
    
    // Find next Saturday
    const day = current.getDay();
    const diff = day === 6 ? 0 : (6 - day); // If today is saturday, start from today? Or next?
    // User said "visto que a gira aberta ocorre sempre no sábado então indique quais giras terei velas o suficiente"
    // Usually "next" means upcoming. If today is saturday, maybe it includes today if it's early?
    // Let's stick to the previous "upcoming" logic or adjust it.
    // If today is Saturday, let's include it if it's not too late? 
    // Actually, diff = day === 6 ? 0 : (6 - day) would include today.
    // Let's use 0 to include today if it's Saturday.
    const startDiff = day === 6 ? 0 : (6 - day);
    current.setDate(current.getDate() + startDiff);

    for (let i = 0; i < sessionsCovered; i++) {
      const date = new Date(current);
      const dateStr = format(date, 'yyyy-MM-dd');
      const event = events.find(e => e.date === dateStr);
      
      sessions.push({
        date,
        title: event ? event.title : 'Gira de Desenvolvimento'
      });
      current.setDate(current.getDate() + 7);
    }
    return sessions;
  }, [sessionsCovered, events]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={cn(
        "p-4 min-h-full pb-32 transition-colors duration-500",
        settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
      )}
    >
      <div className="mb-8">
        <h2 className={cn(
          "text-2xl font-black mb-6 tracking-tight",
          settings.darkMode ? "text-white" : "text-brand-navy"
        )}>Trabalhos & Rituais</h2>
        
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-3xl self-start inline-flex">
          {[
            { id: 'cuts', label: 'Cortes', icon: DollarSign },
            { id: 'ebo', label: 'Ebó', icon: List },
            { id: 'candles', label: 'Velas', icon: CalendarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                activeTab === tab.id 
                  ? (settings.darkMode ? "bg-brand-copper text-white shadow-lg shadow-brand-copper/20" : "bg-brand-navy text-white shadow-lg shadow-brand-navy/10")
                  : (settings.darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-brand-navy")
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cuts' && (
          <motion.div
            key="cuts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Bloco Cortes */}
            <section className={cn(
              "rounded-[32px] overflow-hidden shadow-sm border transition-colors duration-500",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
        <div className={cn(
          "p-6 border-b",
          settings.darkMode ? "border-gray-800" : "border-gray-50"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
            )}>
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
              Cortes
            </h3>
          </div>
        </div>

        {/* Bichos e Valores */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className={cn("text-[10px] font-black uppercase text-gray-400 tracking-widest")}>Bichos & Valores</h4>
            <button 
              onClick={() => setShowModal(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95",
                settings.darkMode ? "bg-brand-copper text-white" : "bg-brand-navy text-white"
              )}
            >
              <Plus className="w-2.5 h-2.5" /> Adicionar
            </button>
          </div>

          <div className="mb-6 relative">
            <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", settings.darkMode ? "text-white/20" : "text-gray-400")} />
            <input 
              type="text"
              placeholder="Buscar bicho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-11 pr-4 py-3 rounded-2xl text-[10px] font-bold transition-all outline-none",
                settings.darkMode ? "bg-black/20 border-gray-800 focus:bg-black/40 text-white" : "bg-gray-50 border-gray-100 focus:bg-white text-brand-navy"
              )}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800/50">
                  <th className="py-2 text-[8px] font-black text-gray-400 uppercase tracking-tighter">Bicho</th>
                  <th className="py-2 text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Compra</th>
                  <th className="py-2 text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Mão</th>
                  <th className="py-2 text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Total</th>
                  <th className="py-2 text-[8px] font-black text-gray-400 uppercase tracking-tighter text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/20">
                {filteredBichos.map(bicho => (
                  <tr key={bicho.id} className="group">
                    <td className={cn("py-3 text-[10px] font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                      {bicho.name}
                    </td>
                    <td className={cn("py-3 text-[10px] text-center font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                      {formatCurrency(bicho.purchaseCost)}
                    </td>
                    <td className={cn("py-3 text-[10px] text-center font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                      {formatCurrency(bicho.serviceCost)}
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] font-black",
                        settings.darkMode ? "bg-brand-copper/10 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
                      )}>
                        {formatCurrency(bicho.purchaseCost + bicho.serviceCost)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-xs">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(bicho)} className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 active:text-brand-copper rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeBicho(bicho.id)} className="p-2 bg-red-50 text-brand-red active:bg-red-100 rounded-lg shadow-sm border border-red-100/50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button 
              onClick={() => {
                setSimulatorItems([]);
                setActiveSimulationId(null);
                setShowSimulator(true);
              }}
              className={cn(
                "p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group",
                settings.darkMode 
                  ? "bg-brand-copper/10 border border-brand-copper/20" 
                  : "bg-brand-navy/5 border border-brand-navy/10"
              )}
            >
              <Calculator className={cn("w-4 h-4", settings.darkMode ? "text-brand-copper" : "text-brand-navy")} />
              <span className={cn("text-[10px] uppercase font-black tracking-widest text-center", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                Simulador
              </span>
            </button>

            <button 
              onClick={() => setShowHistoryModal(true)}
              className={cn(
                "p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] group",
                settings.darkMode 
                  ? "bg-white/5 border border-white/5" 
                  : "bg-gray-50 border-gray-100"
              )}
            >
              <History className={cn("w-4 h-4", settings.darkMode ? "text-brand-copper" : "text-brand-navy")} />
              <span className={cn("text-[10px] uppercase font-black tracking-widest text-center", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                Histórico
              </span>
            </button>
          </div>

          <div className={cn(
            "mt-4 p-4 rounded-2xl flex items-center gap-3",
            settings.darkMode ? "bg-white/5" : "bg-gray-50"
          )}>
            <Info className="w-4 h-4 text-brand-copper shrink-0" />
            <p className="text-[9px] text-gray-400 font-medium leading-tight">
              Os valores de "Mão" referem-se ao valor pago para a mãe Stela cortar cada bicho. O total é a soma de aquisição + mão.
            </p>
          </div>
        </div>

        {/* Oferendas */}
        <div className={cn(
          "p-2 border-t",
          settings.darkMode ? "border-gray-800" : "border-gray-50"
        )}>
          <button 
            onClick={() => setOfferingsExpanded(!offeringsExpanded)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-[24px] transition-all active:scale-[0.98] group/header",
              settings.darkMode 
                ? "bg-brand-navy/40 border border-white/5 text-white/90 hover:bg-brand-navy/60" 
                : "bg-brand-navy text-white shadow-lg shadow-brand-navy/10 hover:bg-brand-navy/90"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Oferendas / Guia de Materiais</h4>
            </div>
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform duration-300",
              offeringsExpanded ? "rotate-90" : "rotate-0"
            )} />
          </button>
          
          <AnimatePresence>
            {offeringsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden px-4 pb-6"
              >
                <div className="space-y-8">
                  {offerings.map((entity) => (
                    <div key={entity.id} className="relative group/offering">
                      <button 
                        onClick={() => openOfferingEdit(entity)}
                        className="absolute -right-2 -top-2 p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-brand-copper shadow-sm border border-gray-100 dark:border-white/5 active:scale-90"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-2 mb-4">
                        <span className={cn("w-1.5 h-1.5 rounded-full", entity.color)} />
                        <h5 className={cn("text-[11px] font-black uppercase tracking-wider", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                          {entity.name}
                        </h5>
                      </div>

                      <div className="space-y-4">
                        {entity.sections.map((section: { title?: string; items: string[] }, sIdx: number) => (
                          <div key={sIdx}>
                            {section.title && (
                              <p className={cn("text-[9px] font-black uppercase tracking-tighter mb-2", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                                {section.title}
                              </p>
                            )}
                            {section.items.length > 0 ? (
                              section.title?.toLowerCase().includes('frutas') ? (
                                <div className="flex flex-wrap gap-2">
                                  {section.items.map((item: string, iIdx: number) => (
                                    <span key={iIdx} className={cn("px-2 py-1 rounded-lg text-[9px] font-bold", settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500")}>
                                      {item}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                  {section.items.map((item: string, iIdx: number) => (
                                    <div key={iIdx} className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                      <span className="text-[10px] font-medium text-gray-400">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            ) : (
                              <p className="text-[9px] text-gray-500 italic">Nenhum item cadastrado</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
          </motion.div>
        )}

        {activeTab === 'ebo' && (
          <motion.div
            key="ebo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Bloco Ebó */}
            <section className={cn(
              "rounded-[32px] overflow-hidden shadow-sm border transition-colors duration-500",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
        <div className={cn(
          "p-6 border-b",
          settings.darkMode ? "border-gray-800" : "border-gray-50"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              settings.darkMode ? "bg-brand-red/20 text-brand-red" : "bg-brand-red/5 text-brand-red"
            )}>
              <List className="w-4 h-4" />
            </div>
            <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
              Ebó
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className={cn(
            "p-5 rounded-3xl space-y-4",
            settings.darkMode ? "bg-white/5" : "bg-gray-50"
          )}>
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-copper shrink-0 mt-0.5" />
              <p className={cn(
                "text-xs font-medium leading-relaxed",
                settings.darkMode ? "text-gray-300" : "text-gray-600"
              )}>
                No Candomblé ebó é um ritual de oferenda e sacrifício, uma prática fundamental para equilibrar as energias e buscar a harmonia com os orixás e entidades espirituais. O ebó pode envolver oferendas de alimentos, objetos simbólicos e até animais, cada um com um significado específico dentro do contexto ritualístico.
              </p>
            </div>
            
            <div className="pl-7">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  Princípio de renovação
                </h4>
              </div>
              <p className={cn(
                "text-xs font-medium leading-relaxed",
                settings.darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                O ebó é uma prática de renovação espiritual, onde o indivíduo se reconecta com suas raízes ancestrais e com a força da natureza.
              </p>
            </div>
          </div>

          <div className={cn(
            "p-5 rounded-3xl",
            settings.darkMode ? "bg-brand-copper/10" : "bg-brand-navy/5"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo do Trabalho</span>
                <button 
                  onClick={() => {
                    setEboForm({ 
                      serviceCost: eboConfig.serviceCost, 
                      materialsCost: eboConfig.materialsCost 
                    });
                    setShowEboEditModal(true);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg shadow-sm border transition-all active:scale-95",
                    settings.darkMode 
                      ? "bg-white/10 text-brand-copper border-white/5" 
                      : "bg-white text-brand-copper border-gray-100"
                  )}
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              </div>
              <span className={cn("text-xl font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                {formatCurrency(eboConfig.serviceCost)}
              </span>
            </div>
            <p className={cn(
              "text-[10px] font-medium leading-relaxed mb-3",
              settings.darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Este valor deve ser pago diretamente à <span className="font-bold">mãe Stela</span> e não inclui a lista de materiais.
            </p>
            
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-white/5">
               <div className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-copper mt-1 shrink-0" />
                 <p className={cn("text-[10px] font-medium", settings.darkMode ? "text-gray-300" : "text-gray-600")}>
                   <span className="font-bold">Com materiais inclusos:</span> Aproximadamente <span className={cn("font-bold", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>{formatCurrency(eboConfig.serviceCost + eboConfig.materialsCost)}</span> (Custo de +{formatCurrency(eboConfig.materialsCost)} aprox. para aquisição pela casa).
                 </p>
               </div>
               <div className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-copper mt-1 shrink-0" />
                 <p className={cn("text-[10px] font-medium", settings.darkMode ? "text-gray-300" : "text-gray-600")}>
                   A compra dos materiais pode ser feita por conta própria, desde que sejam entregues no templo com <span className="font-bold">antecedência</span>.
                 </p>
               </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50 dark:border-gray-800">
            <button 
              onClick={() => setEboExpanded(!eboExpanded)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-[24px] transition-all active:scale-[0.98] group/ebo",
                settings.darkMode 
                  ? "bg-brand-navy/40 border border-white/5 text-white/90 hover:bg-brand-navy/60" 
                  : "bg-brand-navy text-white shadow-lg shadow-brand-navy/10 hover:bg-brand-navy/90"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Lista de materiais necessários</h4>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform duration-300",
                eboExpanded ? "rotate-90" : "rotate-0"
              )} />
            </button>
            
            <AnimatePresence>
              {eboExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden px-4 pb-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      "500 gramas de feijão branco",
                      "500 gramas de arroz",
                      "500 milho de galinha",
                      "500 feijão preto",
                      "500 milho de canjica branca",
                      "500 gramas farinha de milho amarela",
                      "500 milho de pipoca",
                      "500 gramas farinha de milho amarela",
                      "500 gramas de farinha de mandioca",
                      "1 pinga",
                      "1 dendê",
                      "1 mel",
                      "7 charutos de ebó",
                      "7 moedas em qualquer valor",
                      "1 metro de morin branco",
                      "1 metro de morin vermelho",
                      "1 metro de morin preto",
                      "1 metros de linha pequeno preto",
                      "1 metros de linha pequeno branco",
                      "1 metros de linha pequeno vermelho",
                      "1 frango branco se for homem / se for mulher 1 franga",
                      "7 qualidades de verduras ou legumes (os mesmo não poderiam ser comido durante 7 dias)",
                      "7 ovos",
                      "1 cartucho de pólvora"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 group">
                        <span className="w-1 h-1 rounded-full bg-brand-copper/40 group-hover:bg-brand-copper transition-colors" />
                        <span className={cn(
                          "text-[10px] font-medium transition-colors",
                          settings.darkMode ? "text-gray-400 group-hover:text-gray-200" : "text-gray-600 group-hover:text-brand-navy"
                        )}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
          </motion.div>
        )}

        {activeTab === 'candles' && (
          <motion.div
            key="candles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Gestor de Velas */}
            <section className={cn(
              "rounded-[32px] overflow-hidden shadow-sm border transition-colors duration-500 mb-6",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
        <div className={cn(
          "p-6 border-b flex items-center justify-between",
          settings.darkMode ? "border-gray-800" : "border-gray-50"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-xl",
              settings.darkMode ? "bg-amber-500/20 text-amber-500" : "bg-amber-50 text-amber-600"
            )}>
              <List className="w-4 h-4" />
            </div>
            <h3 className={cn("font-black text-sm uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
              Gestor de Velas
            </h3>
          </div>
          <button 
            onClick={() => {
              setEditingCandle(null);
              setCandleForm({ color: '', quantity: 0, type: 'Palito', observations: '' });
              setShowCandleModal(true);
            }}
            className={cn(
              "p-2 rounded-xl transition-all active:scale-95",
              settings.darkMode ? "bg-brand-copper/10 text-brand-copper" : "bg-brand-navy text-white"
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {candles.length > 0 ? candles.map((candle) => (
              <div 
                key={candle.id}
                className={cn(
                  "p-4 rounded-3xl border flex items-center justify-between group",
                  settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner",
                    candle.color.toLowerCase() === 'branca' ? "bg-white border border-gray-100" : 
                    candle.color.toLowerCase() === 'preta' ? "bg-gray-900" :
                    candle.color.toLowerCase() === 'vermelha' ? "bg-red-600" :
                    candle.color.toLowerCase() === 'azul' ? "bg-blue-600" :
                    candle.color.toLowerCase() === 'verde' ? "bg-green-600" :
                    candle.color.toLowerCase() === 'amarela' ? "bg-yellow-400" :
                    candle.color.toLowerCase() === 'rosa' ? "bg-pink-500" :
                    candle.color.toLowerCase() === 'roxa' ? "bg-purple-600" :
                    "bg-brand-copper"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                  </div>
                  <div>
                    <p className={cn("text-xs font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      {candle.color}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      {candle.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={cn("text-sm font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                      {candle.quantity}
                    </p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">unid.</p>
                  </div>
                  <div className="flex gap-1.5 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingCandle(candle);
                        setCandleForm(candle);
                        setShowCandleModal(true);
                      }}
                      className="p-2 rounded-lg bg-white dark:bg-white/10 text-gray-400 hover:text-brand-copper"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {!(candle.color.toLowerCase() === 'branca' && candle.type === '7 Dias') && (
                      <button 
                        onClick={() => setCandles(candles.filter(c => c.id !== candle.id))}
                        className="p-2 rounded-lg bg-white dark:bg-white/10 text-gray-400 hover:text-brand-red"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40">
                <div className={cn("p-4 rounded-3xl mb-4", settings.darkMode ? "bg-white/5" : "bg-gray-50")}>
                  <List className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma vela cadastrada</p>
              </div>
            )}
          </div>

          {/* Planejamento de Consumo - Velas Brancas 7 Dias */}
          <div className={cn(
            "mt-8 p-6 rounded-[32px] border",
            settings.darkMode ? "bg-brand-copper/5 border-brand-copper/10" : "bg-brand-navy/5 border-brand-navy/5"
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  Planejamento: Velas Brancas (7 Dias)
                </h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Projeção por Gira de Desenvolvimento</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={cn("text-3xl font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                    {sessionsCovered}
                  </span>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Giras Cobertas</span>
                </div>
                <p className={cn("text-[11px] font-medium leading-relaxed", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                  Considerando o uso de <span className="font-bold text-brand-copper">3 velas por gira</span> (aos sábados), seu estoque atual de <span className="font-bold text-brand-copper">{white7DayCandle?.quantity || 0}</span> velas brancas de 7 dias é suficiente para as próximas giras listadas.
                </p>
              </div>

              <div className="space-y-2">
                {coveredSessions.length > 0 ? (
                  coveredSessions.map((session, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 rounded-xl border",
                        settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"
                      )}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-gray-300" : "text-brand-navy")}>
                            {session.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                          </span>
                        </div>
                        <span className="text-[9px] font-medium text-gray-400 ml-4.5 mt-0.5">
                          {session.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">OK</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                    <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Estoque Insuficiente</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
          </motion.div>
        )}
      </AnimatePresence>

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
                    {formatCurrency(((Number(form.purchaseCost) || 0) + (Number(form.serviceCost) || 0)))}
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
 
      {/* Modal Editar Oferendas */}
      <AnimatePresence>
        {showOfferingModal && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowOfferingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-xl max-h-[85vh] rounded-[40px] p-8 relative shadow-2xl flex flex-col",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                  Editar Guias: {offeringForm.name}
                </h3>
                <button onClick={() => setShowOfferingModal(false)} className="p-2 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
 
              <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {offeringForm.sections.map((section: { title?: string; items: string[] }, sIdx: number) => (
                  <div key={sIdx} className={cn(
                    "p-6 rounded-[32px] border relative",
                    settings.darkMode ? "bg-black/20 border-white/5" : "bg-gray-50 border-gray-100"
                  )}>
                    <button 
                      onClick={() => removeOfferingSection(sIdx)}
                      className="absolute -right-2 -top-2 p-2 bg-red-50 text-brand-red rounded-xl shadow-sm z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
 
                    <div className="mb-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Título da Seção (opcional)</label>
                      <input 
                        type="text"
                        value={section.title}
                        onChange={e => updateSectionTitle(sIdx, e.target.value)}
                        placeholder="Ex: Frutas, Carnes..."
                        className={cn(
                          "w-full p-4 rounded-2xl outline-none text-xs font-bold border",
                          settings.darkMode ? "bg-black/40 border-gray-800 text-white" : "bg-white border-gray-100 text-brand-navy"
                        )}
                      />
                    </div>
 
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Itens</label>
                      <div className="grid grid-cols-1 gap-2">
                        {section.items.map((item: string, iIdx: number) => (
                          <div key={iIdx} className="flex gap-2">
                            <input 
                              type="text"
                              value={item}
                              onChange={e => updateOfferingItem(sIdx, iIdx, e.target.value)}
                              className={cn(
                                "flex-1 p-3 rounded-xl outline-none text-[10px] font-bold border",
                                settings.darkMode ? "bg-black/40 border-gray-800 text-white" : "bg-white border-gray-100 text-brand-navy"
                              )}
                            />
                            <button 
                              onClick={() => removeOfferingItem(sIdx, iIdx)}
                              className="p-3 text-gray-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addOfferingItem(sIdx)}
                          className="w-full p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" /> Adicionar Item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
 
                <button 
                  onClick={addOfferingSection}
                  className={cn(
                    "w-full p-5 rounded-3xl border-2 border-dashed flex items-center justify-center gap-3 transition-all",
                    settings.darkMode ? "border-white/5 text-gray-500 hover:border-brand-copper/50" : "border-gray-100 text-gray-400 hover:border-brand-navy/30"
                  )}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Nova Seção de Oferendas</span>
                </button>
              </div>
 
              <div className="pt-6 mt-6 border-t border-gray-50 dark:border-gray-800 flex gap-3 shrink-0">
                <button 
                  onClick={() => setShowOfferingModal(false)}
                  className={cn(
                    "flex-1 p-4 rounded-2xl font-bold text-xs uppercase tracking-widest",
                    settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                  )}
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveOffering}
                  className={cn(
                    "flex-[2] p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all text-white",
                    settings.darkMode ? "bg-brand-copper shadow-brand-copper/20" : "bg-brand-navy shadow-brand-navy/20"
                  )}
                >
                  Salvar Todas as Guias
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Modal do Simulador */}
      <AnimatePresence>
        {showSimulator && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSimulator(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "w-full h-[95vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px] p-6 sm:p-8 relative shadow-2xl flex flex-col overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A]" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Simulador de Trabalhos
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Calcule o custo total dos cortes</p>
                </div>
                <button 
                  onClick={() => setShowSimulator(false)}
                  className={cn("p-2 rounded-xl", settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seletor de Bicho para Adicionar */}
              <div className="mb-6 shrink-0">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Selecione para adicionar ao simulador</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {bichos.map(b => (
                    <button
                      key={b.id}
                      onClick={() => addToSimulator(b)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all active:scale-95",
                        settings.darkMode ? "bg-white/5 text-gray-300 border border-white/5" : "bg-gray-50 text-brand-navy border border-gray-100"
                      )}
                    >
                      + {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-6">
                {simulatorItems.length > 0 ? (
                  simulatorItems.map((item, index) => {
                    const bicho = bichos.find(b => b.id === item.bichoId);
                    if (!bicho) return null;
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-3xl border space-y-4",
                          settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-xl font-black text-xs",
                              settings.darkMode ? "bg-brand-copper/20 text-white" : "bg-brand-navy text-white"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <p className={cn("text-xs font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>{bicho.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                Unit: {formatCurrency(bicho.purchaseCost + bicho.serviceCost)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateSimulatorItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
                              >
                                <MinusCircle className="w-4 h-4 text-gray-400" />
                              </button>
                              <span className={cn("text-xs font-black min-w-[20px] text-center", settings.darkMode ? "text-white" : "text-brand-navy")}>
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateSimulatorItem(item.id, { quantity: item.quantity + 1 })}
                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10"
                              >
                                <PlusCircle className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromSimulator(item.id)}
                              className="p-2 text-brand-red hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Entidade</label>
                            <input 
                              type="text"
                              placeholder="Ex: Sr. Tranca Rua"
                              value={item.entidade}
                              onChange={e => updateSimulatorItem(item.id, { entidade: e.target.value })}
                              className={cn(
                                "w-full p-3 rounded-xl outline-none text-[10px] font-bold border transition-all",
                                settings.darkMode ? "bg-black/20 border-white/5 text-white focus:border-brand-copper" : "bg-white border-gray-100 text-brand-navy focus:border-brand-navy"
                              )}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Observação</label>
                            <input 
                              type="text"
                              placeholder="Ex: Bicho claro..."
                              value={item.observations}
                              onChange={e => updateSimulatorItem(item.id, { observations: e.target.value })}
                              className={cn(
                                "w-full p-3 rounded-xl outline-none text-[10px] font-bold border transition-all",
                                settings.darkMode ? "bg-black/20 border-white/5 text-white focus:border-brand-copper" : "bg-white border-gray-100 text-brand-navy focus:border-brand-navy"
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/20">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subtotal</p>
                          <p className={cn("text-xs font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                            {formatCurrency((bicho.purchaseCost + bicho.serviceCost) * item.quantity)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className={cn("p-4 rounded-3xl mb-4", settings.darkMode ? "bg-white/5 text-gray-600" : "bg-gray-50 text-gray-300")}>
                      <Calculator className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-normal">
                      Nenhum bicho adicionado<br/>selecione acima para começar
                    </p>
                  </div>
                )}
              </div>

              <div className={cn(
                "shrink-0 p-6 rounded-[32px] space-y-4",
                settings.darkMode ? "bg-brand-copper/10" : "bg-brand-navy/5"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className={cn("w-4 h-4", settings.darkMode ? "text-brand-copper" : "text-brand-navy")} />
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-copper font-medium" : "text-brand-navy")}>
                      Valor Total do Trabalho
                    </p>
                  </div>
                  <p className={cn("text-2xl font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                    {formatCurrency(calculateSimulatorTotal())}
                  </p>
                </div>

                <div className={cn(
                  "p-3 rounded-xl flex items-start gap-3",
                  settings.darkMode ? "bg-black/20" : "bg-white/50"
                )}>
                  <Info className="w-3.5 h-3.5 text-brand-copper shrink-0 mt-0.5" />
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight leading-normal">
                    Este valor refere-se exclusivamente aos custos do(s) bicho(s) + mão. Não inclui despesas com materiais, velas, ervas ou outros elementos.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSimulatorItems([])}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all",
                      settings.darkMode ? "bg-red-500/10 text-brand-red hover:bg-red-500/20" : "bg-red-50 text-brand-red hover:bg-red-100"
                    )}
                  >
                    Limpar Tudo
                  </button>
                  <button 
                    onClick={handleFinishSimulation}
                    className={cn(
                      "flex-[2] p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all text-white",
                      settings.darkMode ? "bg-brand-copper shadow-brand-copper/20" : "bg-brand-navy shadow-brand-navy/20"
                    )}
                  >
                    Concluir Simulação
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Histórico de Simulações */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-2xl max-h-[85vh] rounded-[40px] p-6 sm:p-8 relative shadow-2xl flex flex-col overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
                  )}>
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Histórico de Simulações
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registros de custos anteriores</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className={cn("p-2 rounded-xl", settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {simulationHistory.length > 0 ? (
                  simulationHistory.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => openSimulatorFromHistory(record)}
                      className={cn(
                        "w-full p-5 rounded-[32px] border flex items-center justify-between group transition-all text-left",
                        settings.darkMode ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-gray-50 border-gray-100 hover:bg-gray-100 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          settings.darkMode ? "bg-black/30 text-brand-copper" : "bg-white text-brand-navy shadow-sm"
                        )}>
                          <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={cn("text-sm font-black mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {record.title || `Simulação ${new Date(record.timestamp).toLocaleDateString()}`}
                          </p>
                          <div className="flex items-center gap-2">
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                               {new Date(record.timestamp).toLocaleDateString('pt-BR')} às {new Date(record.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                             </p>
                             <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                             <p className={cn("text-[10px] font-black uppercase tracking-tight", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                               {record.items.reduce((acc, item) => acc + item.quantity, 0)} bichos
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className={cn("text-base font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                            {formatCurrency(record.total)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => deleteHistoryRecord(record.id, e)}
                            className="p-3 bg-red-50 text-brand-red rounded-2xl active:bg-red-100 transition-all shadow-sm border border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <History className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhuma simulação registrada</p>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-gray-50 dark:border-gray-800 flex shrink-0">
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className={cn(
                    "w-full p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest bg-gray-100 text-gray-500",
                    settings.darkMode && "bg-gray-800 text-gray-400"
                  )}
                >
                  Voltar para Gestão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Gestor de Velas */}
      <AnimatePresence>
        {showCandleModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCandleModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm rounded-[40px] p-8 relative shadow-2xl overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <h3 className={cn("text-lg font-black mb-6", settings.darkMode ? "text-white" : "text-brand-navy")}>
                {editingCandle ? 'Editar Vela' : 'Nova Vela'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Cor da Vela</label>
                  <input 
                    type="text"
                    value={candleForm.color}
                    onChange={e => setCandleForm({...candleForm, color: e.target.value})}
                    placeholder="Ex: Branca, Preta, Sete Encruzas..."
                    className={cn(
                      "w-full p-4 rounded-2xl outline-none text-sm font-bold border transition-all",
                      settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-brand-copper" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Quantidade</label>
                    <input 
                      type="number"
                      value={candleForm.quantity}
                      onChange={e => setCandleForm({...candleForm, quantity: Number(e.target.value)})}
                      className={cn(
                        "w-full p-4 rounded-2xl outline-none text-sm font-bold border",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white" : "bg-gray-50 border-gray-100 text-brand-navy"
                      )}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tipo</label>
                    <select
                      value={candleForm.type}
                      onChange={e => setCandleForm({...candleForm, type: e.target.value})}
                      className={cn(
                        "w-full p-4 rounded-2xl outline-none text-sm font-bold border appearance-none",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white" : "bg-gray-50 border-gray-100 text-brand-navy"
                      )}
                    >
                      <option value="Palito">Palito</option>
                      <option value="7 Dias">7 Dias</option>
                      <option value="9 Dias">9 Dias</option>
                      <option value="Rechaud">Rechaud</option>
                      <option value="Votiva">Votiva</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Observações (opcional)</label>
                  <textarea 
                    value={candleForm.observations}
                    onChange={e => setCandleForm({...candleForm, observations: e.target.value})}
                    placeholder="Ex: Guardar no armário de cima..."
                    rows={2}
                    className={cn(
                      "w-full p-4 rounded-2xl outline-none text-sm font-regular border transition-all resize-none",
                      settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-brand-copper" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowCandleModal(false)}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold text-sm",
                      settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCandle}
                    className={cn(
                      "flex-[2] p-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all text-white",
                      settings.darkMode ? "bg-brand-copper shadow-brand-copper/20" : "bg-brand-navy shadow-brand-navy/20"
                    )}
                  >
                    Salvar Vela
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Editar Ebó */}
      <AnimatePresence>
        {showEboEditModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEboEditModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-md rounded-[40px] p-8 relative shadow-2xl overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={cn("text-lg font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Editar Custos Ebó
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Atualize os valores de referência</p>
                </div>
                <button 
                  onClick={() => setShowEboEditModal(false)}
                  className={cn("p-2 rounded-xl", settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 ml-4">Custo do Trabalho (Mão)</label>
                  <div className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all",
                    settings.darkMode ? "bg-white/5 border-white/5 focus-within:border-brand-copper/50" : "bg-gray-50 border-gray-100 focus-within:border-brand-navy/30"
                  )}>
                    <DollarSign className="w-4 h-4 text-brand-copper" />
                    <input 
                      type="number" 
                      value={eboForm.serviceCost}
                      onChange={(e) => setEboForm({ ...eboForm, serviceCost: Number(e.target.value) })}
                      className="flex-1 bg-transparent border-none outline-none font-black text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 ml-4">Adicional de Materiais (Opcional)</label>
                  <div className={cn(
                    "flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all",
                    settings.darkMode ? "bg-white/5 border-white/5 focus-within:border-brand-copper/50" : "bg-gray-50 border-gray-100 focus-within:border-brand-navy/30"
                  )}>
                    <Plus className="w-4 h-4 text-brand-copper" />
                    <input 
                      type="number" 
                      value={eboForm.materialsCost}
                      onChange={(e) => setEboForm({ ...eboForm, materialsCost: Number(e.target.value) })}
                      className="flex-1 bg-transparent border-none outline-none font-black text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowEboEditModal(false)}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98]",
                      settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      setEboConfig(eboForm);
                      setShowEboEditModal(false);
                    }}
                    className="flex-3 p-4 rounded-2xl bg-brand-copper text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-brand-copper/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Salvar Alterações
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
