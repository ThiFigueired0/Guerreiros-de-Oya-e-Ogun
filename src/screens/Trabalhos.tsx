
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Save, DollarSign, List, Info, Search, Calculator, PlusCircle, MinusCircle, History, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
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
    { id: '3', name: 'Preá', purchaseCost: 90, serviceCost: 250 },
    { id: '4', name: 'Angola', purchaseCost: 0, serviceCost: 300 },
    { id: '5', name: 'Cabrito', purchaseCost: 0, serviceCost: 600 },
    { id: '6', name: 'Calçado', purchaseCost: 0, serviceCost: 850 },
    { id: '7', name: 'Perua', purchaseCost: 0, serviceCost: 300 },
    { id: '8', name: 'Pombo', purchaseCost: 40, serviceCost: 50 },
    { id: '9', name: 'Codorna', purchaseCost: 0, serviceCost: 20 },
    { id: '10', name: 'Garnizé', purchaseCost: 90, serviceCost: 200 }
  ]);

  const formatCurrency = (value: number) => {
    if (value === 0) return '-';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const [isManageMode, setIsManageMode] = useState(false);
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'bicho' | 'history' | 'candle' | 'simulator' } | null>(null);

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

  const [selectedOfferingId, setSelectedOfferingId] = useState<string>(offerings[0]?.id || '');
  const selectedOfferingEntity = offerings.find(o => o.id === selectedOfferingId) || offerings[0];

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
    setItemToDelete({ id, type: 'bicho' });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'bicho') {
      setBichos(bichos.filter(b => b.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'history') {
      setSimulationHistory(simulationHistory.filter(r => r.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'candle') {
      setCandles(candles.filter(c => c.id !== itemToDelete.id));
    } else if (itemToDelete.type === 'simulator') {
      setSimulatorItems(simulatorItems.filter(item => item.id !== itemToDelete.id));
    }

    setShowDeleteConfirm(false);
    setItemToDelete(null);
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
    setItemToDelete({ id, type: 'simulator' });
    setShowDeleteConfirm(true);
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
    setItemToDelete({ id, type: 'history' });
    setShowDeleteConfirm(true);
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
        
        <div className="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl mb-8 border border-gray-100 dark:border-white/5">
          {[
            { id: 'cuts', label: 'Cortes', icon: DollarSign },
            { id: 'ebo', label: 'Ebó', icon: List },
            { id: 'candles', label: 'Velas', icon: CalendarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 active:scale-95",
                activeTab === tab.id 
                  ? (settings.darkMode ? "bg-brand-copper text-white shadow-md" : "bg-brand-navy text-white shadow-md")
                  : (settings.darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-brand-navy")
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="leading-none">{tab.label}</span>
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
            className="space-y-6"
          >
            <div className="space-y-12 pb-12">
              {/* Bichos Section Card */}
              <section className={cn(
                "rounded-[40px] overflow-hidden shadow-sm border transition-colors duration-500",
                settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
              )}>
                <div className="p-6">
                  {/* Quick Actions Header */}
                  <div className="grid grid-cols-2 gap-3 mb-10">
                    <button 
                      onClick={() => {
                        setSimulatorItems([]);
                        setActiveSimulationId(null);
                        setShowSimulator(true);
                      }}
                      className={cn(
                        "p-5 rounded-[28px] flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.95] group relative overflow-hidden",
                        settings.darkMode 
                          ? "bg-brand-copper/10 border border-brand-copper/20" 
                          : "bg-brand-navy border border-brand-navy text-white shadow-lg shadow-brand-navy/20"
                      )}
                    >
                      <div className="p-2 rounded-xl bg-white/10">
                        <Calculator className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-center text-white">
                        Simulador
                      </span>
                    </button>

                    <button 
                      onClick={() => setShowHistoryModal(true)}
                      className={cn(
                        "p-5 rounded-[28px] flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.95] group border",
                        settings.darkMode 
                          ? "bg-white/5 border-white/5 text-brand-copper" 
                          : "bg-white border-gray-100 text-brand-navy shadow-sm"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl", settings.darkMode ? "bg-brand-copper/20" : "bg-brand-navy/5")}>
                        <History className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-center">
                        Histórico
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-8 px-1">
                    <div className="flex flex-col">
                      <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        Bichos & Valores
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Gestão de custos de corte</p>
                    </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsManageMode(!isManageMode)}
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                        isManageMode 
                          ? (settings.darkMode ? "bg-white/10 text-white" : "bg-gray-100 text-brand-navy")
                          : (settings.darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-brand-navy")
                      )}
                    >
                      {isManageMode ? 'Pronto' : 'Gerenciar'}
                    </button>
                    {!isManageMode && (
                      <button 
                        onClick={() => setShowModal(true)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md",
                          settings.darkMode ? "bg-brand-copper text-white shadow-brand-copper/20" : "bg-brand-navy text-white shadow-brand-navy/20"
                        )}
                      >
                        <Plus className="w-3 h-3" /> Novo
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-8 relative">
                  <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", settings.darkMode ? "text-white/20" : "text-gray-400")} />
                  <input 
                    type="text"
                    placeholder="Filtrar por nome do bicho..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full pl-11 pr-4 py-4 rounded-[20px] text-[11px] font-bold transition-all outline-none border",
                      settings.darkMode 
                        ? "bg-black/20 border-white/5 focus:bg-black/40 text-white focus:border-brand-copper/50" 
                        : "bg-gray-50 border-gray-100 focus:bg-white text-brand-navy focus:border-brand-navy/30"
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredBichos.map(bicho => (
                    <div 
                      key={bicho.id} 
                      className={cn(
                        "p-5 rounded-[32px] border group transition-all duration-300 relative",
                        settings.darkMode 
                          ? "bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10" 
                          : "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:border-transparent"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-black uppercase tracking-wider", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {bicho.name}
                          </span>
                        </div>

                        {isManageMode && (
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(bicho); }} className="p-2.5 bg-white dark:bg-white/10 text-gray-400 hover:text-brand-copper rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeBicho(bicho.id); }} className="p-2.5 bg-red-50 text-brand-red active:bg-red-100 rounded-xl shadow-sm border border-red-100/50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center", settings.darkMode ? "bg-black/20" : "bg-white border border-gray-50")}>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Compra</span>
                          <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{formatCurrency(bicho.purchaseCost)}</span>
                        </div>
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center", settings.darkMode ? "bg-black/20" : "bg-white border border-gray-50")}>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Mão</span>
                          <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{formatCurrency(bicho.serviceCost)}</span>
                        </div>
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center", settings.darkMode ? "bg-brand-copper/10" : "bg-brand-navy/5")}>
                          <span className="text-[8px] font-black text-brand-copper uppercase tracking-tighter mb-1">Total</span>
                          <span className={cn("text-[11px] font-black", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>{formatCurrency(bicho.purchaseCost + bicho.serviceCost)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredBichos.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                      <Search className="w-8 h-8 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nenhum bicho encontrado</p>
                    </div>
                  )}
                </div>

                <div className={cn(
                  "mt-8 p-5 rounded-[28px] flex items-start gap-4",
                  settings.darkMode ? "bg-white/5" : "bg-gray-50"
                )}>
                  <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Os valores de <span className="font-bold text-gray-500">Mão</span> referem-se ao valor fixo pago para a realização ritualística do corte. O total é a soma do custo do animal + mão de obra.
                  </p>
                </div>

                {/* Guia de Materiais nested within the same block */}
                <div className={cn(
                  "mt-12 pt-12 border-t",
                  settings.darkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-xl",
                            settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/5 text-brand-navy"
                          )}>
                            <List className="w-4 h-4" />
                          </div>
                          <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            Guia de Materiais
                          </h3>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Oferendas por entidade</p>
                      </div>
                    </div>

                    {/* Entity Selector (Horizontal Tabs) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                      {offerings.map((entity) => {
                        const isSelected = selectedOfferingId === entity.id;
                        return (
                          <motion.button
                            key={entity.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedOfferingId(entity.id)}
                            className={cn(
                              "shrink-0 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                              isSelected
                                ? (settings.darkMode ? "bg-brand-copper border-brand-copper text-white shadow-lg shadow-brand-copper/20" : "bg-brand-navy border-brand-navy text-white shadow-lg shadow-brand-navy/20")
                                : (settings.darkMode ? "bg-white/5 border-white/5 text-gray-400" : "bg-white border-gray-100 text-gray-500 shadow-sm")
                            )}
                          >
                            <span className={cn("w-2 h-2 rounded-full", isSelected ? "bg-white" : entity.color)} />
                            {entity.name}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Selected Entity Content */}
                    <AnimatePresence mode="wait">
                      {selectedOfferingEntity && (
                        <motion.div
                          key={selectedOfferingEntity.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className={cn(
                            "p-6 rounded-[32px] border relative overflow-hidden",
                            settings.darkMode ? "bg-black/40 border-white/5" : "bg-gray-50/50 border-gray-100"
                          )}
                        >
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-copper/10")}>
                                 <div className={cn("w-3 h-3 rounded-full", selectedOfferingEntity.color)} />
                              </div>
                              <div>
                                <h4 className={cn("text-xs font-black uppercase tracking-wider", settings.darkMode ? "text-white" : "text-brand-navy")}>
                                  {selectedOfferingEntity.name}
                                </h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Itens Necessários</p>
                              </div>
                            </div>

                            {isManageMode && (
                              <button 
                                onClick={() => openOfferingEdit(selectedOfferingEntity)}
                                className="p-3 rounded-2xl bg-brand-copper/10 text-brand-copper active:scale-95 transition-all border border-brand-copper/20"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {selectedOfferingEntity.sections.map((section: any, sIdx: number) => {
                              const isFrutas = section.title?.toLowerCase().includes('frutas');
                              const isBebidas = section.title?.toLowerCase().includes('bebida');
                              const isVelas = section.title?.toLowerCase().includes('vela');
                              
                              return (
                                <div key={sIdx} className="space-y-4">
                                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-white/5">
                                    <div className={cn(
                                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px]",
                                      settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"
                                    )}>
                                      {isFrutas ? "🍓" : isBebidas ? "🍷" : isVelas ? "🕯️" : "📦"}
                                    </div>
                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.15em]", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                                      {section.title || "Geral"}
                                    </p>
                                  </div>

                                  {section.items.length > 0 ? (
                                    isFrutas ? (
                                      <div className="flex flex-wrap gap-2">
                                        {section.items.map((item: string, iIdx: number) => (
                                          <span 
                                            key={iIdx} 
                                            className={cn(
                                              "px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm border",
                                              settings.darkMode ? "bg-white/5 border-white/5 text-gray-300" : "bg-white border-gray-50 text-gray-600"
                                            )}
                                          >
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 gap-2">
                                        {section.items.map((item: string, iIdx: number) => (
                                          <div 
                                            key={iIdx} 
                                            className={cn(
                                              "group p-3 rounded-2xl flex items-center gap-3 border transition-colors",
                                              settings.darkMode ? "bg-black/20 border-transparent text-gray-400" : "bg-gray-50 border-transparent text-gray-500"
                                            )}
                                          >
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-copper/30 group-hover:bg-brand-copper transition-colors" />
                                            <span className="text-[10px] font-medium leading-tight">{item}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  ) : (
                                    <p className="text-[9px] text-gray-500 italic py-2">Nenhum item cadastrado</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Info Panel nested */}
                          <div className={cn(
                            "mt-8 p-5 rounded-[24px] border-l-4 border-brand-copper flex items-center gap-4",
                            settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                          )}>
                            <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper">
                              <Info className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                              Recorde que as oferendas são atos de axé. Mantenha os materiais frescos e as guias limpas.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      )}

        {activeTab === 'ebo' && (
          <motion.div
            key="ebo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 pb-20"
          >
            {/* Financials Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Service Cost Card */}
              <section className={cn(
                "rounded-[32px] overflow-hidden shadow-sm border p-6 flex flex-col justify-between relative",
                settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Custo</span>
                    <h4 className={cn("text-[10px] font-black uppercase mt-1", settings.darkMode ? "text-white" : "text-brand-navy")}>Mão de Obra</h4>
                  </div>
                  <button 
                    onClick={() => {
                      setEboForm({ serviceCost: eboConfig.serviceCost, materialsCost: eboConfig.materialsCost });
                      setShowEboEditModal(true);
                    }}
                    className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper active:scale-95 transition-all"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={cn("text-2xl font-black tracking-tighter", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                      {formatCurrency(eboConfig.serviceCost)}
                    </span>
                  </div>
                  <p className={cn("text-[8px] font-bold leading-relaxed", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                    Pago à <span className="text-brand-copper underline underline-offset-2">Mãe Stela</span>.
                  </p>
                </div>
              </section>

              {/* Material Cost Card */}
              <section className={cn(
                "rounded-[32px] overflow-hidden shadow-sm border p-6 transition-colors duration-500",
                settings.darkMode ? "bg-brand-navy/20 border-white/5" : "bg-brand-navy border-brand-navy text-white text-center sm:text-left"
              )}>
                <div className="flex flex-col mb-4">
                  <span className={cn("text-[8px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-copper" : "text-white/60")}>Materiais</span>
                  <h4 className="text-[10px] font-black uppercase mt-1 text-white">Aquisição</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] font-medium text-white/70 uppercase mb-1">Pela Casa:</span>
                    <span className="text-2xl font-black text-white">{formatCurrency(eboConfig.materialsCost)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Observation Below */}
            <div className={cn(
              "p-5 rounded-[28px] border border-dashed transition-all",
              settings.darkMode ? "bg-white/5 border-white/10" : "bg-brand-navy/5 border-brand-navy/10"
            )}>
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-xl",
                  settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/10 text-brand-navy"
                )}>
                  <Info className="w-4 h-4" />
                </div>
                <p className={cn(
                  "text-[10px] font-medium leading-relaxed",
                  settings.darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Você pode adquirir os materiais por conta própria, desde que entregues com <span className="font-bold uppercase tracking-tighter text-brand-copper">antecedência</span> no templo para conferência e preparo.
                </p>
              </div>
            </div>

            {/* Header / Definition Card */}
            <section className={cn(
              "rounded-[40px] overflow-hidden shadow-sm border transition-colors duration-500",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    settings.darkMode ? "bg-brand-red/20 text-brand-red" : "bg-brand-red/5 text-brand-red"
                  )}>
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Fundamento do Ebó
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Orientações e Significados</p>
                  </div>
                </div>

                <div className={cn(
                  "p-6 rounded-[28px] relative overflow-hidden",
                  settings.darkMode ? "bg-white/5" : "bg-gray-50"
                )}>
                  <p className={cn(
                    "text-xs font-medium leading-relaxed mb-6 italic",
                    settings.darkMode ? "text-gray-300" : "text-gray-600"
                  )}>
                    "O ebó é um ritual de oferenda e sacrifício, fundamental para equilibrar as energias e buscar harmonia com os orixás e entidades espirituais."
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-1 rounded-full bg-brand-copper mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <h4 className={cn("text-[10px] font-black uppercase tracking-widest mb-1", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          Equilíbrio & Renovação
                        </h4>
                        <p className={cn("text-[11px] font-medium leading-relaxed", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                          Prática de reconexão com as raízes ancestrais e com a força vital da natureza.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Checklist Card */}
            <section className={cn(
              "rounded-[40px] overflow-hidden shadow-sm border p-8",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-brand-copper/10 text-brand-copper">
                      <List className="w-4 h-4" />
                    </div>
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Lista de Materiais
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ebó Tradicional</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                {[
                  { icon: "🌾", label: "Cereais & Grãos", items: ["500g Feijão Branco", "500g Arroz", "500g Milho de Galinha", "500g Feijão Preto", "500g Milho de Canjica Branca", "500g Milho Pipoca"] },
                  { icon: "🥣", label: "Farinhas & Pós", items: ["1kg Farinha de Milho Amarela", "500g Farinha de Mandioca", "1 Cartucho de Pólvora"] },
                  { icon: "🏺", label: "Líquidos & Itens", items: ["1 Pinga (Cachaça)", "1 Azeite de Dendê", "1 Mel", "7 Charutos de Ebó", "7 Moedas (Qualquer valor)"] },
                  { icon: "🧣", label: "Mantos (Morim)", items: ["1m Morim Branco", "1m Morim Vermelho", "1m Morim Preto", "Linhas: Preta, Branca e Vermelha"] },
                  { icon: "🥚", label: "Perecíveis", items: ["7 Ovos", "7 Qualidades de Verduras/Legumes", "1 Frango(a) Branco(a)"] }
                ].map((group, gIdx) => (
                  <div key={gIdx} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-50 dark:border-white/5">
                      <span className="text-sm">{group.icon}</span>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                       {group.items.map((item, iIdx) => (
                         <div key={iIdx} className="flex items-center gap-3">
                            <div className="w-1 h-1 rounded-full bg-brand-copper/30" />
                            <span className={cn("text-[11px] font-medium leading-tight", settings.darkMode ? "text-gray-500" : "text-gray-600")}>
                              {item}
                            </span>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Warnings */}
              <div className={cn(
                "mt-12 p-6 rounded-[32px] flex items-center gap-4",
                settings.darkMode ? "bg-white/5" : "bg-gray-50"
              )}>
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                  <Info className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
                  <span className="text-orange-500">Nota:</span> Legumes/Verduras usados no Ebó <span className="text-brand-red">não podem ser ingeridos</span> pelo período de 7 dias após o ritual.
                </p>
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
            className="space-y-6 pb-20"
          >
            <div className="grid grid-cols-1 gap-6">
              {/* Planning Card */}
              <section className={cn(
                "rounded-[40px] overflow-hidden shadow-sm border p-8 transition-all duration-500 relative",
                settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
              )}>
                {/* Background Decor */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    settings.darkMode ? "bg-amber-500/20 text-amber-500" : "bg-amber-50 text-amber-600"
                  )}>
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Planejamento
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Velas Brancas (7 Dias)</p>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-5xl font-black tracking-tighter", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                      {sessionsCovered}
                    </span>
                    <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Giras Cobertas</span>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                    sessionsCovered >= 4 ? "bg-emerald-500/10 text-emerald-500" : 
                    sessionsCovered >= 2 ? "bg-amber-500/10 text-amber-500" : 
                    "bg-red-500/10 text-red-500"
                  )}>
                    Status: {sessionsCovered >= 4 ? 'Seguro' : sessionsCovered >= 2 ? 'Alerta' : 'Crítico'}
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mb-8 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((sessionsCovered / 8) * 100, 100)}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      sessionsCovered >= 4 ? "bg-emerald-500" : sessionsCovered >= 2 ? "bg-amber-500" : "bg-red-500"
                    )}
                  />
                </div>
                
                <p className={cn("text-[11px] font-medium leading-relaxed mb-6 px-1", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                  Considerando o uso de 3 velas/gira, seu estoque de <span className="font-bold text-brand-copper">{white7DayCandle?.quantity || 0}</span> unidades garante as próximas giras.
                </p>

                {/* Restock Tip */}
                {white7DayCandle && white7DayCandle.quantity > 0 && white7DayCandle.quantity % 3 !== 0 && (
                  <div className={cn(
                    "mb-8 p-4 rounded-[28px] border border-dashed flex items-center justify-between transition-all hover:scale-[1.02]",
                    settings.darkMode ? "bg-brand-copper/5 border-brand-copper/20" : "bg-brand-navy/5 border-brand-navy/10"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-copper text-brand-navy flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                      <p className={cn("text-[10px] font-bold uppercase tracking-tight leading-snug", settings.darkMode ? "text-gray-300" : "text-brand-navy")}>
                        Dica: Com mais <span className="text-brand-copper font-black underline underline-offset-2">{3 - (white7DayCandle.quantity % 3)}</span> {3 - (white7DayCandle.quantity % 3) === 1 ? 'vela' : 'velas'}, você completa <span className="font-black">{Math.floor(white7DayCandle.quantity / 3) + 1}</span> giras e zera o estoque.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {coveredSessions.length > 0 ? (
                    coveredSessions.slice(0, 3).map((session, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:translate-x-1",
                          settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className={cn("text-[10px] font-black uppercase tracking-tight", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                            {session.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                          </span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{session.title}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    ))
                  ) : (
                    <div className="p-5 rounded-3xl border border-dashed border-red-500/20 text-center bg-red-500/5">
                      <p className="text-[10px] font-black text-brand-red uppercase tracking-[0.15em]">Necessita Reposição Imediata</p>
                    </div>
                  )}
                  {coveredSessions.length > 3 && (
                    <p className="text-[9px] text-gray-400 font-black uppercase text-center mt-4 tracking-widest">+ {coveredSessions.length - 3} Giras Adicionais</p>
                  )}
                </div>
              </section>
            </div>


            {/* Inventory Management */}
            <section className={cn(
              "rounded-[40px] overflow-hidden shadow-sm border p-8",
              settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
            )}>
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <List className="w-4 h-4" />
                    </div>
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Estoque Atual
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Gestão de Cores e Quantidades</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingCandle(null);
                    setCandleForm({ color: '', quantity: 0, type: 'Palito', observations: '' });
                    setShowCandleModal(true);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-navy/10",
                    settings.darkMode ? "bg-brand-copper text-brand-navy" : "bg-brand-navy text-white"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {candles.length > 0 ? candles.map((candle) => (
                  <div 
                    key={candle.id}
                    className={cn(
                      "p-5 rounded-[32px] border flex flex-col justify-between gap-4 transition-all hover:scale-[1.02]",
                      settings.darkMode ? "bg-white/5 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-[22px] flex items-center justify-center shadow-inner relative overflow-hidden group/candle",
                          candle.color.toLowerCase() === 'branca' ? "bg-white border border-gray-100" : 
                          candle.color.toLowerCase() === 'preta' ? "bg-gray-900 border border-gray-800" :
                          candle.color.toLowerCase() === 'vermelha' ? "bg-red-600" :
                          candle.color.toLowerCase() === 'azul' ? "bg-blue-600" :
                          candle.color.toLowerCase() === 'verde' ? "bg-green-600" :
                          candle.color.toLowerCase() === 'amarela' ? "bg-yellow-400" :
                          candle.color.toLowerCase() === 'rosa' ? "bg-pink-500" :
                          candle.color.toLowerCase() === 'roxa' ? "bg-purple-600" :
                          "bg-brand-copper"
                        )}>
                          <div className="w-1.5 h-4 rounded-full bg-white/20 blur-[2px] absolute top-2 rotate-12 opacity-50 transition-opacity group-hover/candle:opacity-100" />
                        </div>
                        <div>
                          <p className={cn("text-xs font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {candle.color}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                            {candle.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={cn("text-2xl font-black tabular-nums", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                          {candle.quantity}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Unid.</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-white/5">
                      <button 
                        onClick={() => {
                          setEditingCandle(candle);
                          setCandleForm(candle);
                          setShowCandleModal(true);
                        }}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-brand-copper hover:bg-brand-copper/10 transition-all active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!(candle.color.toLowerCase() === 'branca' && candle.type === '7 Dias') && (
                        <button 
                          onClick={() => {
                             setItemToDelete({ id: candle.id, type: 'candle' });
                             setShowDeleteConfirm(true);
                           }}
                           className="p-2.5 rounded-xl text-gray-400 hover:text-brand-red hover:bg-brand-red/10 transition-all active:scale-90"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-40">
                    <div className={cn("p-8 rounded-[40px] mb-4", settings.darkMode ? "bg-white/5" : "bg-gray-50")}>
                      <List className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma vela cadastrada</p>
                  </div>
                )}
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

      <DeleteConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={
          itemToDelete?.type === 'bicho' ? "Excluir Bicho" :
          itemToDelete?.type === 'history' ? "Excluir Simulação" :
          itemToDelete?.type === 'simulator' ? "Remover do Simulador" :
          "Excluir Vela"
        }
        message={
          itemToDelete?.type === 'bicho' ? "Deseja realmente excluir este bicho dos registros?" :
          itemToDelete?.type === 'history' ? "Deseja excluir permanentemente este registro de simulação?" :
          itemToDelete?.type === 'simulator' ? "Deseja remover este bicho da sua simulação atual?" :
          "Deseja excluir esta vela do seu estoque?"
        }
      />
    </motion.div>
  );
}
