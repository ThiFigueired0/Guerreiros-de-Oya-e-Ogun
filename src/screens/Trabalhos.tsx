
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Save, DollarSign, List, Info, Search, Calculator, PlusCircle, Flame, MinusCircle, History, ChevronRight, ChevronDown, Calendar as CalendarIcon, CheckCircle2, Minus } from 'lucide-react';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { AppSettings, Bicho, SimulatorItem, SimulationRecord, OfferingEntity, Candle, CandlePlan, Event, NotificationItem } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

const PRESET_CANDLE_COLORS = {
  single: [
    'Amarela',
    'Azul claro',
    'Azul escuro',
    'Branca',
    'Laranja',
    'Lilás',
    'Marrom',
    'Verde escuro',
    'Vermelha'
  ],
  bicolor: [
    'Azul e branca',
    'Azul e rosa',
    'Preta e branca',
    'Preta e vermelha',
    'Verde e amarela'
  ],
  tricolor: [
    'Colorida',
    'Preta, branca e vermelha'
  ]
};

const TAILWIND_CANDLE_COLORS: Record<string, string> = {
  'branca': 'bg-white',
  'branco': 'bg-white',
  'preta': 'bg-zinc-900',
  'preto': 'bg-zinc-900',
  'vermelha': 'bg-red-600',
  'vermelho': 'bg-red-600',
  'azul escuro': 'bg-blue-800',
  'azul': 'bg-blue-600',
  'azul claro': 'bg-sky-400',
  'marrom': 'bg-amber-800',
  'verde escuro': 'bg-emerald-800',
  'verde-escuro': 'bg-emerald-800',
  'verde': 'bg-green-600',
  'lilás': 'bg-purple-300',
  'lilas': 'bg-purple-300',
  'amarela': 'bg-yellow-400',
  'amarelo': 'bg-yellow-400',
  'laranja': 'bg-orange-500',
  'rosa': 'bg-pink-500',
  'roxo': 'bg-purple-700',
  'roxa': 'bg-purple-700',
};

const getTailwindColorClass = (colorName: string): string => {
  const norm = colorName.toLowerCase().trim();
  if (TAILWIND_CANDLE_COLORS[norm]) {
    return TAILWIND_CANDLE_COLORS[norm];
  }
  for (const k of Object.keys(TAILWIND_CANDLE_COLORS)) {
    if (norm.includes(k)) {
      return TAILWIND_CANDLE_COLORS[k];
    }
  }
  return 'bg-amber-600';
};

const ORIXAS_GUIDES = [
  { name: 'Oxalá', color: 'Branca' },
  { name: 'Ogum', color: 'Azul escuro' },
  { name: 'Oya', color: 'Vermelha' },
  { name: 'Yamanja', color: 'Azul claro' },
  { name: 'Xango', color: 'Marrom' },
  { name: 'Oxossi', color: 'Verde escuro' },
  { name: 'Oxumare', color: 'Verde e amarela' },
  { name: 'Omolu / Obaluaê', color: 'Preta e branca' },
  { name: 'Nanã', color: 'Lilás' },
  { name: 'Oxum', color: 'Amarela' }
];

const ENTIDADES_GUIDES = [
  { name: 'Erê', color: 'Azul e rosa' },
  { name: 'Marujo', color: 'Azul e branca' },
  { name: 'Ciganos', color: 'Colorida' },
  { name: 'Santa Sara', color: 'Azul escuro' },
  { name: 'Pretos Velhos', color: 'Preta e branca' },
  { name: 'Baianos', color: 'Laranja' },
  { name: 'Caboclos', color: 'Verde e amarela' },
  { name: 'Malandros prateleira', color: 'Preta e vermelha', label: 'ou preta, branca e vermelha' }
];

function CandleColorIcon({ colorName, size = 'md', darkMode }: { colorName: string, size?: 'sm' | 'md' | 'lg', darkMode: boolean }) {
  const normalized = (colorName || 'branca').toLowerCase().trim();
  const isColorida = normalized === 'colorida';
  
  const parts = isColorida ? ['colorida'] : normalized
    .split(/\s+e\s+|,\s*|\/\s*|-\s*/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const containerClasses = cn(
    "flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner border",
    size === 'sm' ? "w-6 h-6 rounded-[8px]" : 
    size === 'md' ? "w-10 h-10 rounded-xl" : 
    "w-12 h-12 rounded-[22px]",
    darkMode ? "border-white/10 bg-black/20" : "border-slate-200/80 bg-gray-50"
  );

  if (isColorida) {
    return (
      <div className={containerClasses}>
        <div className="w-full h-full flex">
          <div className="flex-1 h-full bg-red-500" />
          <div className="flex-1 h-full bg-yellow-400" />
          <div className="flex-1 h-full bg-green-500" />
          <div className="flex-1 h-full bg-blue-500" />
          <div className="flex-1 h-full bg-purple-500" />
        </div>
        <div className="w-1.5 h-4 rounded-full bg-white/25 blur-[1px] absolute top-2 rotate-12" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="w-full h-full flex">
        {parts.map((part, index) => {
          const bgClass = getTailwindColorClass(part);
          const isWhite = bgClass === 'bg-white';
          const isBlack = bgClass === 'bg-zinc-900';
          return (
            <div 
              key={index}
              className={cn(
                "flex-1 h-full", 
                bgClass,
                isWhite && (darkMode ? "border-zinc-800" : "border-gray-150"),
                isBlack && (darkMode ? "border-zinc-700" : "border-zinc-350")
              )} 
            />
          );
        })}
      </div>
      <div className="w-1.5 h-4 rounded-full bg-white/20 blur-[1px] absolute top-2 rotate-12 pointer-events-none" />
    </div>
  );
}

export default function TrabalhosScreen() {
  const { queueDelete } = useUndo();

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
  const [candlePlanning, setCandlePlanning] = useStorage<CandlePlan[]>('templo_candle_planning', [
    { id: '1', color: 'Branca', type: '7 Dias', quantityPerSession: 3 }
  ]);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showPlanTypeDropdown, setShowPlanTypeDropdown] = useState(false);
  const [showPlanningColorDropdown, setShowPlanningColorDropdown] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CandlePlan | null>(null);
  const [planForm, setPlanForm] = useState<Partial<CandlePlan>>({ color: '', type: '7 Dias', quantityPerSession: 1 });
  const [showCandleModal, setShowCandleModal] = useState(false);
  const [showCandleTypeModal, setShowCandleTypeModal] = useState(false);
  const [showCandleColorDropdown, setShowCandleColorDropdown] = useState(false);
  const [editingCandle, setEditingCandle] = useState<Candle | null>(null);
  const [candleForm, setCandleForm] = useState<Partial<Candle>>({ color: '', quantity: 0, type: 'Palito', observations: '' });
  const [showColorGuideModal, setShowColorGuideModal] = useState(false);
  const [showMaterialsGuideModal, setShowMaterialsGuideModal] = useState(false);

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
      color: 'bg-white',
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
    const newNotif: NotificationItem = {
      id: `update_offering_${Date.now()}`,
      title: `Oferenda "${offeringForm.name}" atualizada`,
      timestamp: Date.now(),
      category: 'edição',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 100));
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
      const newNotif: NotificationItem = {
        id: `update_bicho_${Date.now()}`,
        title: `Bicho "${form.name}" atualizado`,
        timestamp: Date.now(),
        category: 'edição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
    } else {
      const newBicho: Bicho = {
        id: Date.now().toString(),
        name: form.name!,
        purchaseCost: Number(form.purchaseCost) || 0,
        serviceCost: Number(form.serviceCost) || 0
      };
      setBichos([...bichos, newBicho]);
      const newNotif: NotificationItem = {
        id: `add_bicho_${Date.now()}`,
        title: `Bicho "${form.name}" adicionado`,
        timestamp: Date.now(),
        category: 'adição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
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

  const removeBicho = (bicho: Bicho) => {
    queueDelete({
      id: bicho.id,
      label: `Bicho: ${bicho.name}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setBichos(prev => prev.filter(b => b.id !== bicho.id));
        const newNotif: NotificationItem = {
          id: `delete_bicho_${Date.now()}`,
          title: `Bicho "${bicho.name}" removido`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const deleteHistoryRecord = (record: SimulationRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    queueDelete({
      id: record.id,
      label: record.title || "Simulação",
      timestamp: Date.now(),
      onConfirm: () => {
        setSimulationHistory(prev => prev.filter(r => r.id !== record.id));
      }
    });
  };

  const removeFromSimulator = (item: SimulatorItem) => {
    // Immediate removal from simulator is usually fine, but let's stick to the pattern if requested
    // However, the user said "any part of the system", so I will queue it.
    const bichoName = bichos.find(b => b.id === item.bichoId)?.name || "Item";
    queueDelete({
      id: item.id,
      label: `Item do Simulador: ${bichoName}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setSimulatorItems(prev => prev.filter(i => i.id !== item.id));
      }
    });
  };

  const removeCandle = (candle: Candle) => {
    queueDelete({
      id: candle.id,
      label: `Vela: ${candle.color} ${candle.type}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setCandles(prev => prev.filter(c => c.id !== candle.id));
        const newNotif: NotificationItem = {
          id: `delete_candle_${Date.now()}`,
          title: `Vela "${candle.color} ${candle.type}" removida`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const [notifications, setNotifications] = useStorage<NotificationItem[]>('templo_history', []);

  const handleSaveCandle = () => {
    if (!candleForm.color || !candleForm.type) return;

    if (editingCandle) {
      setCandles(candles.map(c => c.id === editingCandle.id ? { ...c, ...candleForm } as Candle : c));
      
      // Add notification for update
      const newNotif: NotificationItem = {
        id: `update_candle_${Date.now()}`,
        title: `Vela ${candleForm.color} (${candleForm.type}) atualizada`,
        timestamp: Date.now(),
        category: 'edição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
    } else {
      const newCandle: Candle = {
        id: Date.now().toString(),
        color: candleForm.color!,
        quantity: Number(candleForm.quantity) || 0,
        type: candleForm.type!,
        observations: candleForm.observations
      };
      setCandles([...candles, newCandle]);
      const newNotif: NotificationItem = {
        id: `add_candle_${Date.now()}`,
        title: `Vela "${newCandle.color} ${newCandle.type}" adicionada`,
        timestamp: Date.now(),
        category: 'adição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
    }
    setShowCandleModal(false);
    setShowCandleColorDropdown(false);
    setEditingCandle(null);
    setCandleForm({ color: '', quantity: 0, type: 'Palito', observations: '' });
  };

  const handleSavePlan = () => {
    if (!planForm.color || !planForm.quantityPerSession) return;
    const colorName = planForm.color.trim();
    if (editingPlan) {
      setCandlePlanning(candlePlanning.map(p => p.id === editingPlan.id ? { ...p, color: colorName, type: planForm.type || '7 Dias', quantityPerSession: Number(planForm.quantityPerSession) } : p));
    } else {
      const newPlan: CandlePlan = {
        id: Date.now().toString(),
        color: colorName,
        type: planForm.type || '7 Dias',
        quantityPerSession: Number(planForm.quantityPerSession)
      };
      setCandlePlanning([...candlePlanning, newPlan]);
    }
    setShowPlanningModal(false);
    setShowPlanTypeDropdown(false);
    setShowPlanningColorDropdown(false);
    setEditingPlan(null);
    setPlanForm({ color: '', type: '7 Dias', quantityPerSession: 1 });
  };

  const handleDeletePlan = (id: string) => {
    setCandlePlanning(candlePlanning.filter(p => p.id !== id));
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

  const sessionsCovered = React.useMemo(() => {
    const list = candlePlanning || [];
    if (list.length === 0) return 0;
    let minCovered = Infinity;
    list.forEach(plan => {
      const match = (candles || []).find(c => 
        c.color.toLowerCase() === plan.color.toLowerCase() && 
        c.type.toLowerCase() === plan.type.toLowerCase()
      );
      const stock = match ? match.quantity : 0;
      const rate = plan.quantityPerSession > 0 ? plan.quantityPerSession : 1;
      const covered = Math.floor(stock / rate);
      if (covered < minCovered) {
        minCovered = covered;
      }
    });
    return minCovered === Infinity ? 0 : minCovered;
  }, [candles, candlePlanning]);

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
        "p-4 min-h-full pb-32 transition-colors duration-500 bg-transparent relative"
      )}
    >
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.03] dark:bg-brand-gold/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 transform-gpu will-change-transform" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-white/[0.02] dark:bg-white/[0.03] rounded-full blur-3xl pointer-events-none -translate-x-1/2 transform-gpu will-change-transform" />

      <div className="mb-8 px-2 relative z-10">
        <div className="flex flex-col mb-6">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-0.5 ml-0.5">Gestão de</p>
          <h2 className={cn(
            "text-3xl sm:text-4xl font-black font-serif tracking-tight",
            settings.darkMode ? "text-brand-gold" : "text-brand-navy"
          )}>
            Trabalhos e Rituais
          </h2>
        </div>
        
        <div className="flex gap-1.5 p-1.5 bg-gray-100/80 dark:bg-black/40 dark:backdrop-blur-md rounded-[20px] mb-8 border border-gray-200/50 dark:border-white/5 relative z-10 w-full shadow-inner">
          {[
            { id: 'cuts', label: 'Cortes', icon: DollarSign },
            { id: 'ebo', label: 'Ebó', icon: List },
            { id: 'candles', label: 'Velas', icon: CalendarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 px-2 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 group relative overflow-hidden form-transition",
                activeTab === tab.id 
                  ? (settings.darkMode 
                      ? "bg-white/[0.08] sm:bg-white/[0.06] border border-brand-gold/30 text-brand-gold shadow-lg shadow-brand-gold/10" 
                      : "bg-white border border-gray-200 text-brand-navy shadow-sm")
                  : (settings.darkMode 
                      ? "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent" 
                      : "text-gray-500 hover:text-brand-navy hover:bg-black/5 border border-transparent")
              )}
            >
              <tab.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "" : "opacity-70")} />
              <span className="leading-none mt-1">{tab.label}</span>
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
                "rounded-[36px] overflow-hidden flex flex-col relative z-10",
                "transition-all duration-300 shadow-2xl sm:backdrop-blur-md border",
                settings.darkMode 
                  ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                  : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30"
              )}>
                <div className="p-6 sm:p-8 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 px-1">
                    <div className="flex flex-col gap-1.5">
                      <h3 className={cn("text-4xl sm:text-5xl font-black tracking-tighter leading-none text-left flex items-center gap-1", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        Bichos <span className={cn("text-3xl sm:text-4xl text-brand-gold mx-1")}>&</span> Valores
                      </h3>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 font-extrabold uppercase tracking-[0.25em] mt-3 text-left leading-relaxed">Gestão de Custos de Corte</p>
                    </div>
                  <div className="flex relative z-20 items-center justify-between sm:justify-end w-full sm:w-auto shrink-0 gap-4">
                    <button 
                      onClick={() => setIsManageMode(!isManageMode)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-80 active:scale-95",
                        isManageMode 
                          ? (settings.darkMode ? "text-white" : "text-brand-navy")
                          : (settings.darkMode ? "text-gray-400" : "text-gray-500")
                      )}
                    >
                      {isManageMode ? 'Pronto' : 'Gerenciar'}
                    </button>
                    {!isManageMode && (
                      <button 
                        onClick={() => setShowModal(true)}
                        className={cn(
                          "flex items-center gap-2 px-6 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-none hover:shadow-lg focus:outline-none",
                          settings.darkMode ? "bg-brand-gold border-transparent text-brand-navy hover:bg-brand-gold/90" : "bg-brand-navy text-white hover:bg-brand-navy/90"
                        )}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" /> Novo
                      </button>
                    )}
                  </div>
                </div>

                  {/* Quick Actions Header */}
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <button 
                      onClick={() => {
                        setSimulatorItems([]);
                        setActiveSimulationId(null);
                        setShowSimulator(true);
                      }}
                      className={cn(
                        "p-4 sm:p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden",
                         "rounded-[24px] sm:rounded-[32px] shadow-lg relative overflow-hidden hover:translate-y-[1px] border focus:outline-none",
                         settings.darkMode 
                           ? "bg-[#1f1f1f] sm:bg-[#1a1a1a] sm:backdrop-blur-md border-gray-800 hover:bg-[#252525] hover:border-brand-gold/30 text-white" 
                           : "bg-white sm:backdrop-blur-md border-gray-200 hover:border-brand-gold/40 shadow-xl hover:shadow-2xl text-brand-navy"
                      )}
                    >
                      <div className="absolute -right-4 -top-4 w-28 h-28 bg-brand-gold/[0.03] rounded-full blur-xl pointer-events-none group-hover:bg-brand-gold/5 transition-colors duration-500" />
                      <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-colors shadow-inner", settings.darkMode ? "bg-white/5 group-hover:bg-brand-gold/10" : "bg-black/[0.02] group-hover:bg-brand-navy/10")}>
                        <Calculator className={cn("w-5 h-5 sm:w-6 sm:h-6", settings.darkMode ? "text-gray-400 group-hover:text-brand-gold" : "text-brand-navy group-hover:text-brand-navy")} />
                      </div>
                      <span className={cn("text-[8px] sm:text-xs uppercase font-black tracking-widest text-center transition-colors", settings.darkMode ? "text-gray-400 group-hover:text-brand-gold" : "text-brand-navy group-hover:text-brand-navy")}>
                        Simulador
                      </span>
                    </button>

                    <button 
                      onClick={() => setShowHistoryModal(true)}
                      className={cn(
                        "p-4 sm:p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 active:scale-[0.98] group relative overflow-hidden",
                         "rounded-[24px] sm:rounded-[32px] shadow-lg relative overflow-hidden hover:-translate-y-[1px] border focus:outline-none",
                         settings.darkMode 
                           ? "bg-[#1f1f1f] sm:bg-[#1a1a1a] sm:backdrop-blur-md border-gray-800 hover:bg-[#252525] hover:border-brand-gold/30 text-white" 
                           : "bg-white sm:backdrop-blur-md border-gray-200 hover:border-brand-gold/40 shadow-xl hover:shadow-2xl text-brand-navy"
                      )}
                    >
                      <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-white/[0.03] rounded-full blur-xl pointer-events-none group-hover:bg-brand-gold/5 transition-colors duration-500" />
                      <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-colors shadow-inner", settings.darkMode ? "bg-white/5 group-hover:bg-brand-gold/10" : "bg-black/[0.02] group-hover:bg-brand-navy/10")}>
                        <History className={cn("w-5 h-5 sm:w-6 sm:h-6", settings.darkMode ? "text-gray-400 group-hover:text-brand-gold" : "text-brand-navy group-hover:text-brand-navy")} />
                      </div>
                      <span className={cn("text-[8px] sm:text-xs uppercase font-black tracking-widest text-center transition-colors", settings.darkMode ? "text-gray-400 group-hover:text-brand-gold" : "text-brand-navy group-hover:text-brand-navy")}>
                        Histórico
                      </span>
                    </button>
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
                        ? "bg-black/20 border-white/5 focus:bg-black/40 text-white focus:border-brand-gold/50" 
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
                          ? "bg-black/20 border-white/5 hover:bg-black/40 hover:border-brand-navy/30" 
                          : "bg-white border-black/[0.03] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:border-brand-gold/30"
                      )}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex flex-col">
                          <span className={cn("text-[11px] font-black uppercase tracking-[0.1em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                            {bicho.name}
                          </span>
                        </div>

                        {isManageMode && (
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(bicho); }} className="p-2.5 bg-white dark:bg-white/10 text-gray-400 hover:text-brand-gold rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeBicho(bicho); }} className="p-2.5 bg-red-50 text-brand-red active:bg-red-100 rounded-xl shadow-sm border border-red-100/50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center border", settings.darkMode ? "bg-black/40 border-white/5" : "bg-gray-50/50 border-gray-100")}>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Compra</span>
                          <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{formatCurrency(bicho.purchaseCost)}</span>
                        </div>
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center border", settings.darkMode ? "bg-black/40 border-white/5" : "bg-gray-50/50 border-gray-100")}>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-1">Mão</span>
                          <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{formatCurrency(bicho.serviceCost)}</span>
                        </div>
                        <div className={cn("p-3 rounded-2xl flex flex-col items-center border", settings.darkMode ? "bg-brand-gold/10 border-brand-gold/20" : "bg-brand-navy/5 border-brand-navy/10")}>
                          <span className="text-[8px] font-black tracking-tighter mb-1 text-brand-gold">Total</span>
                          <span className={cn("text-[11px] font-black", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>{formatCurrency(bicho.purchaseCost + bicho.serviceCost)}</span>
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
                  <div className="p-2 rounded-xl bg-brand-gold/10 text-brand-gold shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Os valores de <span className="font-bold text-gray-500">Mão</span> referem-se ao valor fixo pago para a realização ritualística do corte. O total é a soma do custo do animal + mão de obra.
                  </p>
                </div>

                {/* Guia de Materiais nested within the same block (Replaced with Button) */}
                <div className={cn(
                  "mt-12 pt-12 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4",
                  settings.darkMode ? "border-white/5" : "border-gray-100"
                )}>
                  <div className="flex flex-col">
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Guia de Materiais
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Oferendas por entidade</p>
                  </div>
                  <button
                    onClick={() => setShowMaterialsGuideModal(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95",
                      settings.darkMode 
                        ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10" 
                        : "bg-gray-100/80 border-gray-250 text-brand-navy hover:bg-gray-200"
                    )}
                  >
                    <List className="w-4 h-4 text-brand-gold" />
                    Ver Guia
                  </button>
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
                "rounded-[32px] overflow-hidden shadow-2xl sm:backdrop-blur-md border p-6 flex flex-col justify-between relative transition-all duration-300",
                settings.darkMode 
                  ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                  : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(205,127,50,0.2)]"
              )}>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Custo</span>
                    <h4 className={cn("text-[10px] font-black uppercase mt-1", settings.darkMode ? "text-white" : "text-brand-navy")}>Mão de Obra</h4>
                  </div>
                  <button 
                    onClick={() => {
                      setEboForm({ serviceCost: eboConfig.serviceCost, materialsCost: eboConfig.materialsCost });
                      setShowEboEditModal(true);
                    }}
                    className={cn(
                      "p-2 rounded-xl active:scale-95 transition-all relative z-10",
                      settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-black/5 hover:bg-black/10 text-gray-500"
                    )}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative z-10">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={cn("text-2xl font-black tracking-tighter", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                      {formatCurrency(eboConfig.serviceCost)}
                    </span>
                  </div>
                  <p className={cn("text-[8px] font-bold leading-relaxed", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                    Pago à <span className="text-brand-gold underline underline-offset-2">Mãe Stela</span>.
                  </p>
                </div>
              </section>

              {/* Material Cost Card */}
              <section className={cn(
                "rounded-[32px] overflow-hidden shadow-2xl sm:backdrop-blur-md border p-6 flex flex-col justify-between relative transition-all duration-300",
                settings.darkMode 
                  ? "bg-brand-navy/20 border-white/10" 
                  : "bg-gradient-to-br from-brand-navy to-[#1e2a4a] border-brand-navy/50 text-white shadow-[0_4px_10px_rgba(15,23,42,0.2)]"
              )}>
                <div className="flex flex-col mb-4 relative z-10">
                  <span className={cn("text-[8px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-gold" : "text-white/60")}>Materiais</span>
                  <h4 className="text-[10px] font-black uppercase mt-1 text-white">Aquisição</h4>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex flex-col items-start">
                    <span className="text-[8px] font-medium text-white/70 uppercase mb-1">Pela Casa:</span>
                    <span className="text-2xl font-black text-white">{formatCurrency(eboConfig.materialsCost)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Observation Below */}
            <div className={cn(
              "p-5 rounded-[28px] border border-dashed transition-all relative overflow-hidden ",
              settings.darkMode ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"
            )}>
              <div className="flex items-start gap-4 relative z-10">
                <div className={cn(
                  "p-2 rounded-xl",
                  settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-black/5 text-gray-500"
                )}>
                  <Info className="w-4 h-4" />
                </div>
                <p className={cn(
                  "text-[10px] font-medium leading-relaxed",
                  settings.darkMode ? "text-gray-400" : "text-gray-600"
                )}>
                  Você pode adquirir os materiais por conta própria, desde que entregues com <span className="font-bold uppercase tracking-tighter text-brand-gold">antecedência</span> no templo para conferência e preparo.
                </p>
              </div>
            </div>

            {/* Header / Definition Card */}
            <section className={cn(
              "rounded-[36px] overflow-hidden flex flex-col relative z-10",
              "transition-all duration-300 shadow-2xl sm:backdrop-blur-md border",
              settings.darkMode 
                ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30 hover:shadow-[0_8px_40px_-12px_rgba(205,127,50,0.2)]"
            )}>
              <div className="p-8 space-y-6 relative z-10">
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
                    settings.darkMode ? "text-brand-gold" : "text-gray-600"
                  )}>
                    "O ebó é um ritual de oferenda e sacrifício, fundamental para equilibrar as energias e buscar harmonia com os orixás e entidades espirituais."
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-1 h-1 rounded-full bg-white mt-1.5 shrink-0" />
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
              "rounded-[36px] overflow-hidden flex flex-col relative z-10 transition-all duration-300 shadow-2xl sm:backdrop-blur-md border",
              settings.darkMode 
                ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30"
            )}>
              <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-brand-gold/20 text-brand-gold">
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
                            <div className="w-1 h-1 rounded-full bg-white/20" />
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
                "rounded-[36px] overflow-hidden flex flex-col relative z-10 transition-all duration-300 shadow-2xl sm:backdrop-blur-md border",
                settings.darkMode 
                  ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                  : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30"
              )}>
                {/* Background Decor */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="p-8 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        settings.darkMode ? "bg-white/10 text-white" : "bg-amber-50 text-amber-600"
                      )}>
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          Planejamento Dinâmico de Velas
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Selecione e controle as velas das giras</p>
                      </div>
                    </div>
                    {/* Add Planning Button */}
                    <button
                      onClick={() => {
                        setEditingPlan(null);
                        setPlanForm({ color: '', type: '7 Dias', quantityPerSession: 1 });
                        setShowPlanningModal(true);
                      }}
                      className={cn(
                        "flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-md self-start sm:self-center",
                        settings.darkMode ? "bg-brand-gold text-brand-navy hover:bg-brand-gold/90" : "bg-brand-navy text-white hover:bg-brand-navy/90"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Fluxo
                    </button>
                  </div>

                  {/* Summary of coverage */}
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-5xl font-black tracking-tighter", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                        {sessionsCovered}
                      </span>
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Giras Cobertas</span>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                      sessionsCovered >= 4 ? "bg-emerald-500/10 text-emerald-500" : 
                      sessionsCovered >= 2 ? "bg-[#e2a229]/10 text-[#e2a229]" : 
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
                    Sua cobertura é configurada pelas regras abaixo. O estoque de cada cor e tipo determina a quantidade de giras de desenvolvimento garantidas.
                  </p>

                  {/* Configured Flows List */}
                  <div className="mb-8 space-y-3">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Velas Planejadas e Abatimento</h4>
                    {candlePlanning && candlePlanning.length > 0 ? (
                      candlePlanning.map((plan) => {
                        const match = (candles || []).find(c => 
                          c.color.toLowerCase() === plan.color.toLowerCase() && 
                          c.type.toLowerCase() === plan.type.toLowerCase()
                        );
                        const currentQuantity = match ? match.quantity : 0;
                        const singleCoverage = plan.quantityPerSession > 0 ? Math.floor(currentQuantity / plan.quantityPerSession) : 0;
                        const hasInsufficiency = singleCoverage < 3;

                        return (
                          <div 
                            key={plan.id}
                            className={cn(
                              "p-4 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.01]",
                              settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <CandleColorIcon colorName={plan.color} size="md" darkMode={settings.darkMode} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("text-xs font-black uppercase tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                                    Vela {plan.color}
                                  </span>
                                  <span className="text-[9px] font-bold text-gray-400">({plan.type})</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                                  <span>Abate Programado: <span className={settings.darkMode ? "text-white" : "text-brand-navy"}>-{plan.quantityPerSession} unid.</span></span>
                                  <span className="text-gray-300 dark:text-gray-750">•</span>
                                  <span>Em Estoque: <span className={cn("font-black", currentQuantity > 0 ? "text-brand-gold" : "text-brand-red")}>{currentQuantity} unid.</span></span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-gray-200/50 dark:border-white/5 pt-3 sm:pt-0">
                              <div className="text-left sm:text-right">
                                <span className={cn(
                                  "text-xs font-black uppercase tracking-widest block",
                                  singleCoverage >= 4 ? "text-emerald-500" : singleCoverage >= 2 ? "text-[#e2a229]" : "text-red-500"
                                )}>
                                  {singleCoverage} {singleCoverage === 1 ? 'Gira' : 'Giras'}
                                </span>
                                <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">Cobertura individual</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPlan(plan);
                                    setPlanForm(plan);
                                    setShowPlanningModal(true);
                                  }}
                                  className="p-2 rounded-xl text-gray-450 hover:text-brand-gold hover:bg-white/10 transition-all"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePlan(plan.id)}
                                  className="p-2 rounded-xl text-gray-450 hover:text-brand-red hover:bg-white/10 transition-all"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 rounded-[32px] border border-dashed border-gray-300 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-black/10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nenhum fluxo de planejamento cadastrado</p>
                        <p className="text-[9px] text-gray-400 uppercase mt-1">Adicione velas acima para definir suas quantidades de abatimento por gira.</p>
                      </div>
                    )}
                  </div>

                  {/* Restock Tip for dynamic needs */}
                  {candlePlanning && candlePlanning.map((plan) => {
                    const match = (candles || []).find(c => 
                      c.color.toLowerCase() === plan.color.toLowerCase() && 
                      c.type.toLowerCase() === plan.type.toLowerCase()
                    );
                    const currentQuantity = match ? match.quantity : 0;
                    const rem = currentQuantity % plan.quantityPerSession;
                    
                    if (currentQuantity > 0 && rem !== 0) {
                      const needed = plan.quantityPerSession - rem;
                      const nextGiras = Math.floor(currentQuantity / plan.quantityPerSession) + 1;
                      return (
                        <div 
                          key={`tip-${plan.id}`}
                          className={cn(
                            "mb-4 p-4 rounded-[28px] border border-dashed flex items-center justify-between transition-all hover:scale-[1.01]",
                            settings.darkMode ? "bg-white/5 border-white/20" : "bg-brand-navy/5 border-brand-navy/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white text-brand-navy flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                              <Plus className="w-4 h-4 text-brand-gold" />
                            </div>
                            <p className={cn("text-[10px] font-bold uppercase tracking-tight leading-snug", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                              Dica: Com mais <span className="text-brand-gold font-black underline underline-offset-2">{needed}</span> vela(s) <span className="font-semibold">{plan.color} ({plan.type})</span>, você completa <span className="font-black">{nextGiras}</span> giras e zera o estoque.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Warnings */}
                  <div className={cn(
                    "mb-6 p-4 rounded-[28px] border border-dashed flex items-start gap-3",
                    settings.darkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
                  )}>
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest leading-none">Abate Automático de Estoque</p>
                      <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400/80 uppercase leading-relaxed mt-1">
                        O sistema desconta as unidades programadas de cada vela ativa após as <span className="font-black text-amber-800 dark:text-amber-300">23h59</span> de cada Gira de Desenvolvimento ocorrida.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Previsão das Próximas Giras</h4>
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
                        <p className="text-[9px] text-gray-400 uppercase mt-1">Seu estoque de velas não atende à quantidade programada para a próxima gira.</p>
                      </div>
                    )}
                    {coveredSessions.length > 3 && (
                      <p className="text-[9px] text-gray-400 font-black uppercase text-center mt-4 tracking-widest">+ {coveredSessions.length - 3} Giras Adicionais</p>
                    )}
                  </div>
                </div>
              </section>
            </div>


            {/* Inventory Management */}
            <section className={cn(
              "rounded-[36px] overflow-hidden flex flex-col relative z-10 transition-all duration-300 shadow-2xl sm:backdrop-blur-md border",
              settings.darkMode 
                ? "bg-white/[0.08] sm:bg-white/[0.03] border-white/10 hover:bg-white/10 hover:border-brand-gold/30 hover:-translate-y-[2px]" 
                : "bg-white/80 border-black/[0.05] hover:border-brand-navy/30"
            )}>
              <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/10 text-white">
                      <List className="w-4 h-4" />
                    </div>
                    <h3 className={cn("font-black text-xs uppercase tracking-[0.2em]", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Estoque Atual
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Gestão de Cores e Quantidades</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button 
                    onClick={() => setShowColorGuideModal(true)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all active:scale-95",
                      settings.darkMode 
                        ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10" 
                        : "bg-gray-100/80 border-gray-250 text-brand-navy hover:bg-gray-200"
                    )}
                  >
                    <Info className="w-4 h-4 text-brand-gold" />
                    Guia de Cores
                  </button>
                  <button 
                    onClick={() => {
                      setEditingCandle(null);
                      setCandleForm({ color: '', quantity: 0, type: 'Palito', observations: '' });
                      setShowCandleModal(true);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                      settings.darkMode ? "bg-white text-brand-navy" : "bg-brand-navy text-white hover:bg-[#001f3f]"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
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
                        <CandleColorIcon colorName={candle.color} size="lg" darkMode={settings.darkMode} />
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
                        <span className={cn("text-2xl font-black tabular-nums", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                          {candle.quantity}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Unid.</span>
                      </div>
                    </div>

                    {candle.color.toLowerCase() === 'branca' && candle.type === '7 Dias' && (
                      <div className={cn(
                        "p-3 rounded-2xl flex items-start gap-3",
                        settings.darkMode ? "bg-white/10 border border-amber-500/20" : "bg-amber-50 border border-amber-100"
                      )}>
                        <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[8px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-relaxed">
                          O sistema abate automaticamente <span className="font-black text-amber-800 dark:text-amber-300">-3 unidades</span> após as 23h59 de cada Gira de Desenvolvimento.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 dark:border-white/5">
                      <button 
                        onClick={() => {
                          setEditingCandle(candle);
                          setCandleForm(candle);
                          setShowCandleModal(true);
                        }}
                        className="p-2.5 rounded-xl text-gray-400 hover:text-brand-gold hover:bg-white/10 transition-all active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!(candle.color.toLowerCase() === 'branca' && candle.type === '7 Dias') && (
                        <button 
                          onClick={() => removeCandle(candle)}
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
                      settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
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
                  settings.darkMode ? "bg-white/10" : "bg-brand-navy/5"
                )}>
                  <span className="text-[9px] uppercase font-black text-gray-400 tracking-tighter mb-1">Total Calculado</span>
                  <span className={cn("text-2xl font-black", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
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
                      settings.darkMode ? "bg-brand-gold shadow-brand-gold/20 text-brand-navy" : "bg-brand-navy shadow-brand-navy/20"
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
                    settings.darkMode ? "border-white/5 text-gray-500 hover:border-brand-gold/50" : "border-gray-100 text-gray-400 hover:border-brand-navy/30"
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
                    settings.darkMode ? "bg-brand-gold shadow-brand-gold/20 text-brand-navy" : "bg-brand-navy shadow-brand-navy/20"
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
          <div className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSimulator(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn(
                "w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl rounded-t-[40px] sm:rounded-[40px] p-6 sm:p-8 pb-28 sm:pb-8 relative shadow-2xl flex flex-col overflow-hidden",
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
                        settings.darkMode ? "bg-white/5 text-brand-gold border border-white/5" : "bg-gray-50 text-brand-navy border border-gray-100"
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
                              settings.darkMode ? "bg-white/10 text-white" : "bg-brand-navy text-white"
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
                              onClick={() => removeFromSimulator(item)}
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
                                settings.darkMode ? "bg-black/20 border-white/5 text-white focus:border-gray-500" : "bg-white border-gray-100 text-brand-navy focus:border-brand-navy"
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
                                settings.darkMode ? "bg-black/20 border-white/5 text-white focus:border-gray-500" : "bg-white border-gray-100 text-brand-navy focus:border-brand-navy"
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/20">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subtotal</p>
                          <p className={cn("text-xs font-black", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                            {formatCurrency((bicho.purchaseCost + bicho.serviceCost) * item.quantity)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className={cn("p-4 rounded-3xl mb-4", settings.darkMode ? "bg-white/5 text-gray-600" : "bg-gray-50 text-brand-gold")}>
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
                settings.darkMode ? "bg-white/10" : "bg-brand-navy/5"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className={cn("w-4 h-4", settings.darkMode ? "text-brand-gold" : "text-brand-navy")} />
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-gold font-medium" : "text-brand-navy")}>
                      Valor Total do Trabalho
                    </p>
                  </div>
                  <p className={cn("text-2xl font-black", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                    {formatCurrency(calculateSimulatorTotal())}
                  </p>
                </div>

                <div className={cn(
                  "p-3 rounded-xl flex items-start gap-3",
                  settings.darkMode ? "bg-black/20" : "bg-white/50"
                )}>
                  <Info className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
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
                      settings.darkMode ? "bg-brand-gold shadow-brand-gold/20 text-brand-navy" : "bg-brand-navy shadow-brand-navy/20"
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
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 pb-28 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-2xl max-h-[80vh] rounded-[40px] p-6 sm:p-8 relative shadow-2xl flex flex-col overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl",
                    settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-navy/5 text-brand-navy"
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
                          settings.darkMode ? "bg-black/30 text-brand-gold" : "bg-white text-brand-navy shadow-sm"
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
                             <p className={cn("text-[10px] font-black uppercase tracking-tight", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                               {record.items.reduce((acc, item) => acc + item.quantity, 0)} bichos
                             </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className={cn("text-base font-black", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                            {formatCurrency(record.total)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => deleteHistoryRecord(record, e)}
                            className="p-3 bg-red-50 text-brand-red rounded-2xl active:bg-red-100 transition-all shadow-sm border border-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-brand-gold" />
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
      {/* Modal Planejamento de Velas */}
      <AnimatePresence>
        {showPlanningModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setShowPlanningModal(false);
                setShowPlanTypeDropdown(false);
                setEditingPlan(null);
                setPlanForm({ color: '', type: '7 Dias', quantityPerSession: 1 });
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm rounded-[40px] p-8 relative shadow-2xl overflow-hidden",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800 text-white" : "bg-white text-brand-navy"
              )}
            >
              <h3 className={cn("text-lg font-black mb-6", settings.darkMode ? "text-white" : "text-brand-navy")}>
                {editingPlan ? 'Editar Fluxo' : 'Novo Fluxo de Planejamento'}
              </h3>
              
              <div className="space-y-4">
                {/* Candle Choice */}
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Cor da Vela</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={planForm.color || ''}
                      onChange={e => {
                        setPlanForm({...planForm, color: e.target.value});
                        setShowPlanningColorDropdown(true);
                      }}
                      onFocus={() => setShowPlanningColorDropdown(true)}
                      placeholder="Ex: Branca, Vermelha, Preta..."
                      className={cn(
                        "w-full p-4 pr-12 rounded-2xl outline-none text-sm font-bold border transition-all",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPlanningColorDropdown(!showPlanningColorDropdown)}
                      className="absolute right-4 p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showPlanningColorDropdown && "rotate-180")} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showPlanningColorDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-[550]" 
                          onClick={() => setShowPlanningColorDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            "absolute z-[560] left-0 right-0 mt-2 p-3 rounded-2xl border max-h-[220px] overflow-y-auto space-y-3 shadow-2xl",
                            settings.darkMode ? "bg-[#252525] border-gray-700 text-white" : "bg-white border-gray-150 text-brand-navy"
                          )}
                        >
                          {(() => {
                            const filterTerm = (planForm.color || '').toLowerCase().trim();
                            const filteredSingle = PRESET_CANDLE_COLORS.single.filter(c => c.toLowerCase().includes(filterTerm));
                            const filteredBicolor = PRESET_CANDLE_COLORS.bicolor.filter(c => c.toLowerCase().includes(filterTerm));
                            const filteredTricolor = PRESET_CANDLE_COLORS.tricolor.filter(c => c.toLowerCase().includes(filterTerm));
                            const totalFound = filteredSingle.length + filteredBicolor.length + filteredTricolor.length;

                            if (totalFound === 0) {
                              return (
                                <div className="p-4 text-center">
                                  <p className="text-[10px] font-black text-gray-450 uppercase tracking-widest leading-none">Cor não listada</p>
                                  <p className="text-[9px] text-gray-400 uppercase mt-1">Pressione Enter ou clique fora para usar sua cor digitada.</p>
                                </div>
                              );
                            }

                            return (
                              <>
                                {filteredSingle.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Cor Única</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredSingle.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setPlanForm({ ...planForm, color });
                                            setShowPlanningColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (planForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(planForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredBicolor.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Bicolor</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredBicolor.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setPlanForm({ ...planForm, color });
                                            setShowPlanningColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (planForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(planForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredTricolor.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-450 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Tricolor</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredTricolor.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setPlanForm({ ...planForm, color });
                                            setShowPlanningColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (planForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(planForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tipo de Vela</label>
                    <button
                      type="button"
                      onClick={() => setShowPlanTypeDropdown(!showPlanTypeDropdown)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl outline-none text-sm font-bold border transition-all text-left",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                      )}
                    >
                      <span>{planForm.type || '7 Dias'}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform text-gray-400", showPlanTypeDropdown && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {showPlanTypeDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowPlanTypeDropdown(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "absolute z-50 top-[76px] left-0 right-0 rounded-2xl shadow-xl overflow-hidden border",
                              settings.darkMode ? "bg-[#2A2A2A] border-gray-700" : "bg-white border-gray-100"
                            )}
                          >
                            {['Palito', '7 Dias'].map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  setPlanForm({...planForm, type});
                                  setShowPlanTypeDropdown(false);
                                }}
                                className={cn(
                                  "w-full text-left p-4 text-sm font-bold transition-colors",
                                  settings.darkMode ? "hover:bg-brand-gold/10 text-white" : "hover:bg-brand-navy/5 text-brand-navy",
                                  (planForm.type || '7 Dias') === type && (settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-navy/10 text-brand-navy")
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Consumo (Abate)</label>
                    <div className={cn(
                      "flex items-center justify-between p-2 rounded-2xl border",
                      settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
                    )}>
                      <button
                        type="button"
                        onClick={() => setPlanForm({...planForm, quantityPerSession: Math.max(1, (planForm.quantityPerSession || 1) - 1)})}
                        className={cn(
                          "p-2 rounded-xl transition-all active:scale-95",
                          settings.darkMode 
                            ? "bg-white/5 text-white hover:bg-white/10" 
                            : "bg-white text-brand-navy shadow-sm hover:shadow-md border border-gray-100"
                        )}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={cn("text-base font-black px-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        {planForm.quantityPerSession || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPlanForm({...planForm, quantityPerSession: (planForm.quantityPerSession || 1) + 1})}
                        className={cn(
                          "p-2 rounded-xl transition-all active:scale-95",
                          settings.darkMode 
                            ? "bg-white/5 text-white hover:bg-white/10" 
                            : "bg-white text-brand-navy shadow-sm hover:shadow-md border border-gray-100"
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPlanningModal(false);
                      setShowPlanTypeDropdown(false);
                      setEditingPlan(null);
                      setPlanForm({ color: '', type: '7 Dias', quantityPerSession: 1 });
                    }}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold text-sm",
                      settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handleSavePlan}
                    className={cn(
                      "flex-[2] p-4 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all text-white",
                      settings.darkMode ? "bg-brand-gold shadow-brand-gold/20 text-brand-navy font-black hover:bg-brand-gold" : "bg-brand-navy shadow-brand-navy/20 hover:bg-brand-navy-dark"
                    )}
                  >
                    Salvar
                  </button>
                </div>
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
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Cor da Vela</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text"
                      value={candleForm.color || ''}
                      onChange={e => {
                        setCandleForm({...candleForm, color: e.target.value});
                        setShowCandleColorDropdown(true);
                      }}
                      onFocus={() => setShowCandleColorDropdown(true)}
                      placeholder="Ex: Branca, Vermelha, Preta..."
                      className={cn(
                        "w-full p-4 pr-12 rounded-2xl outline-none text-sm font-bold border transition-all",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCandleColorDropdown(!showCandleColorDropdown)}
                      className="absolute right-4 p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showCandleColorDropdown && "rotate-180")} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showCandleColorDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-[550]" 
                          onClick={() => setShowCandleColorDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={cn(
                            "absolute z-[560] left-0 right-0 mt-2 p-3 rounded-2xl border max-h-[220px] overflow-y-auto space-y-3 shadow-2xl",
                            settings.darkMode ? "bg-[#252525] border-gray-700 text-white" : "bg-white border-gray-150 text-brand-navy"
                          )}
                        >
                          {(() => {
                            const filterTerm = (candleForm.color || '').toLowerCase().trim();
                            const filteredSingle = PRESET_CANDLE_COLORS.single.filter(c => c.toLowerCase().includes(filterTerm));
                            const filteredBicolor = PRESET_CANDLE_COLORS.bicolor.filter(c => c.toLowerCase().includes(filterTerm));
                            const filteredTricolor = PRESET_CANDLE_COLORS.tricolor.filter(c => c.toLowerCase().includes(filterTerm));
                            const totalFound = filteredSingle.length + filteredBicolor.length + filteredTricolor.length;

                            if (totalFound === 0) {
                              return (
                                <div className="p-4 text-center">
                                  <p className="text-[10px] font-black text-gray-450 uppercase tracking-widest leading-none">Cor não listada</p>
                                  <p className="text-[9px] text-gray-400 uppercase mt-1">Pressione Enter ou clique fora para usar sua cor digitada.</p>
                                </div>
                              );
                            }

                            return (
                              <>
                                {filteredSingle.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-455 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Cor Única</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredSingle.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setCandleForm({ ...candleForm, color });
                                            setShowCandleColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (candleForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(candleForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredBicolor.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-455 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Bicolor</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredBicolor.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setCandleForm({ ...candleForm, color });
                                            setShowCandleColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (candleForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(candleForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {filteredTricolor.length > 0 && (
                                  <div>
                                    <span className="text-[8px] font-black text-gray-455 dark:text-gray-500 uppercase tracking-widest mb-1.5 block px-2">Tricolor</span>
                                    <div className="flex flex-col gap-0.5">
                                      {filteredTricolor.map(color => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => {
                                            setCandleForm({ ...candleForm, color });
                                            setShowCandleColorDropdown(false);
                                          }}
                                          className={cn(
                                            "w-full text-left p-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                            (candleForm.color || '').toLowerCase() === color.toLowerCase()
                                              ? (settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy")
                                              : (settings.darkMode ? "hover:bg-white/5 text-gray-200" : "hover:bg-gray-100 text-gray-700")
                                          )}
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <CandleColorIcon colorName={color} size="sm" darkMode={settings.darkMode} />
                                            <span>{color}</span>
                                          </div>
                                          {(candleForm.color || '').toLowerCase() === color.toLowerCase() && <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Quantidade</label>
                    <div className={cn(
                      "flex items-center justify-between p-2 rounded-2xl border",
                      settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
                    )}>
                      <button
                        type="button"
                        onClick={() => setCandleForm({...candleForm, quantity: Math.max(0, (candleForm.quantity || 0) - 1)})}
                        className={cn(
                          "p-2.5 rounded-xl transition-all active:scale-95",
                          settings.darkMode 
                            ? "bg-white/5 text-white hover:bg-white/10" 
                            : "bg-white text-brand-navy shadow-sm hover:shadow-md border border-gray-100"
                        )}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={cn("text-base font-black px-4", settings.darkMode ? "text-white" : "text-brand-navy")}>
                        {candleForm.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCandleForm({...candleForm, quantity: (candleForm.quantity || 0) + 1})}
                        className={cn(
                          "p-2.5 rounded-xl transition-all active:scale-95",
                          settings.darkMode 
                            ? "bg-white/5 text-white hover:bg-white/10" 
                            : "bg-white text-brand-navy shadow-sm hover:shadow-md border border-gray-100"
                        )}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tipo</label>
                    <button
                      type="button"
                      onClick={() => setShowCandleTypeModal(!showCandleTypeModal)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl outline-none text-sm font-bold border transition-all text-left",
                        settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
                      )}
                    >
                      {candleForm.type}
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showCandleTypeModal && "rotate-180")} />
                    </button>
                    
                    <AnimatePresence>
                      {showCandleTypeModal && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowCandleTypeModal(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "absolute z-50 top-[76px] left-0 right-0 rounded-2xl shadow-xl overflow-hidden border",
                              settings.darkMode ? "bg-[#2A2A2A] border-gray-700" : "bg-white border-gray-100"
                            )}
                          >
                            {['Palito', '7 Dias'].map(type => (
                              <button
                                key={type}
                                onClick={() => {
                                  setCandleForm({...candleForm, type});
                                  setShowCandleTypeModal(false);
                                }}
                                className={cn(
                                  "w-full text-left p-4 text-sm font-bold transition-colors",
                                  settings.darkMode ? "hover:bg-brand-gold/10 text-white" : "hover:bg-brand-navy/5 text-brand-navy",
                                  candleForm.type === type && (settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-brand-navy/10 text-brand-navy")
                                )}
                              >
                                {type}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
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
                      settings.darkMode ? "bg-black/20 border-gray-800 text-white focus:border-gray-500" : "bg-gray-50 border-gray-100 text-brand-navy focus:border-brand-navy"
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
                      settings.darkMode ? "bg-brand-gold shadow-brand-gold/20 text-brand-navy" : "bg-brand-navy shadow-brand-navy/20"
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
                    settings.darkMode ? "bg-white/5 border-white/5 focus-within:border-brand-gold/50" : "bg-gray-50 border-gray-100 focus-within:border-brand-navy/30"
                  )}>
                    <DollarSign className="w-4 h-4 text-brand-gold" />
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
                    settings.darkMode ? "bg-white/5 border-white/5 focus-within:border-brand-gold/50" : "bg-gray-50 border-gray-100 focus-within:border-brand-navy/30"
                  )}>
                    <Plus className="w-4 h-4 text-brand-gold" />
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
                    className="flex-3 p-4 rounded-2xl bg-brand-navy text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Guia de Cores de Velas */}
      {createPortal(
        <AnimatePresence>
          {showColorGuideModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pb-20">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowColorGuideModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-3xl rounded-[32px] p-5 sm:p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 sm:mb-6 shrink-0 relative">
                <div className="flex items-center gap-4 pr-2">
                  <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
                      settings.darkMode ? "bg-white/5 border border-white/10" : "bg-gray-100/80 border border-gray-200"
                    )}>
                    <Flame className={cn("w-6 h-6 sm:w-7 sm:h-7", settings.darkMode ? "text-brand-gold" : "text-brand-navy")} />
                  </div>
                  <div>
                    <h3 className={cn("text-xl sm:text-2xl font-black leading-tight tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Guia de Velas
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1.5">
                      Orixás e Entidades
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowColorGuideModal(false)}
                  className={cn("p-2 sm:p-2.5 rounded-2xl transition-all shrink-0 active:scale-95", settings.darkMode ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10" : "bg-gray-100/80 text-gray-500 hover:text-brand-navy hover:bg-gray-200")}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4 border-t border-gray-100 dark:border-white/5 pt-6 sm:pt-8 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-start mb-6">
                  
                  {/* Orixás Section */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-2.5 mb-2 px-1">
                      <div className="w-1.5 h-4 rounded-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
                      <h4 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                        Orixás
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                      {ORIXAS_GUIDES.map((item) => (
                        <div 
                          key={item.name}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-[20px] border transition-all hover:scale-[1.01] hover:shadow-lg",
                            settings.darkMode ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-brand-gold/30" : "bg-gray-50/80 border-gray-150 hover:bg-white hover:border-brand-navy/20"
                          )}
                        >
                          <CandleColorIcon colorName={item.color} size="md" darkMode={settings.darkMode} />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs sm:text-sm font-black uppercase tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-[0.1em] truncate">
                              Vela <span className={cn(settings.darkMode ? "text-gray-300" : "text-gray-600")}>{item.color}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Entidades Section */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-2.5 mb-2 px-1">
                      <div className="w-1.5 h-4 rounded-full bg-brand-red shadow-[0_0_10px_rgba(200,30,30,0.4)]" />
                      <h4 className={cn("text-[11px] font-black uppercase tracking-[0.2em]", settings.darkMode ? "text-brand-red font-semibold" : "text-brand-navy")}>
                        Entidades
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                      {ENTIDADES_GUIDES.map((item) => (
                        <div 
                          key={item.name}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-[20px] border transition-all hover:scale-[1.01] hover:shadow-lg",
                            settings.darkMode ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-brand-red/30" : "bg-gray-50/80 border-gray-150 hover:bg-white hover:border-brand-navy/20"
                          )}
                        >
                          <CandleColorIcon colorName={item.color} size="md" darkMode={settings.darkMode} />
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs sm:text-sm font-black uppercase tracking-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-[0.1em] truncate">
                              Vela <span className={cn(settings.darkMode ? "text-gray-300" : "text-gray-600")}>{item.color}</span> {item.label && <span className="lowercase font-bold text-gray-500 font-sans italic ml-1">({item.label})</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowColorGuideModal(false)}
                  className={cn(
                    "px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]",
                    settings.darkMode 
                      ? "bg-brand-gold text-brand-navy font-semibold text-[10px] hover:bg-brand-gold/90" 
                      : "bg-brand-navy text-white hover:bg-brand-navy/90"
                  )}
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal Guia de Materiais */}
      {createPortal(
        <AnimatePresence>
          {showMaterialsGuideModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pb-20">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowMaterialsGuideModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-3xl rounded-[32px] p-5 sm:p-8 relative shadow-2xl overflow-hidden flex flex-col max-h-[85vh]",
                settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5 sm:mb-6 shrink-0 relative">
                <div className="flex items-center gap-4 pr-2">
                  <div className={cn(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
                      settings.darkMode ? "bg-white/5 border border-white/10" : "bg-gray-100/80 border border-gray-200"
                    )}>
                    <List className={cn("w-6 h-6 sm:w-7 sm:h-7", settings.darkMode ? "text-brand-gold" : "text-brand-navy")} />
                  </div>
                  <div>
                    <h3 className={cn("text-xl sm:text-2xl font-black leading-tight tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                      Guia de Materiais
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1.5">
                      Oferendas por entidade
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMaterialsGuideModal(false)}
                  className={cn("p-2 sm:p-2.5 rounded-2xl transition-all shrink-0 active:scale-95", settings.darkMode ? "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10" : "bg-gray-100/80 text-gray-500 hover:text-brand-navy hover:bg-gray-200")}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4 border-t border-gray-100 dark:border-white/5 pt-6 sm:pt-8 mt-2">
                 {/* Entity Selector (Horizontal Tabs) */}
                 <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                   {offerings.map((entity) => {
                     const isSelected = selectedOfferingId === entity.id;
                     return (
                       <motion.button
                         key={entity.id}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => setSelectedOfferingId(entity.id)}
                         className={cn(
                           "shrink-0 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2",
                           isSelected
                             ? (settings.darkMode ? "bg-white/[0.08] border-brand-gold/30 text-brand-gold shadow-lg" : "bg-[#d4af37]/10 border-brand-gold/30 text-brand-gold shadow-lg")
                             : (settings.darkMode ? "bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.05]" : "bg-black/[0.02] border-black/5 text-gray-500 hover:bg-black/[0.05]")
                         )}
                       >
                         <span className={cn("w-2 h-2 rounded-full", isSelected ? "bg-current" : entity.color)} />
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
                         "p-6 rounded-[32px] border relative overflow-hidden mt-4 mb-4",
                         settings.darkMode ? "bg-black/40 border-white/5" : "bg-gray-50/50 border-gray-100"
                       )}
                     >
                       <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                           <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-gold/10")}>
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
                             className="p-3 rounded-2xl bg-brand-gold/10 text-brand-gold active:scale-95 transition-all border border-brand-gold/20"
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
                                           settings.darkMode ? "bg-white/5 border-white/5 text-brand-gold" : "bg-white border-gray-50 text-gray-600"
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
                                         <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
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
                         "mt-8 p-5 rounded-[24px] border-l-4 border-gray-500 flex items-center gap-4",
                         settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                       )}>
                         <div className="p-2 rounded-xl bg-brand-gold/20 text-brand-gold">
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

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end shrink-0">
                <button 
                  onClick={() => setShowMaterialsGuideModal(false)}
                  className={cn(
                    "px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]",
                    settings.darkMode 
                      ? "bg-brand-gold text-brand-navy font-semibold text-[10px] hover:bg-brand-gold/90" 
                      : "bg-brand-navy text-white hover:bg-brand-navy/90"
                  )}
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete confirmation modals removed in favor of global undo */}
    </motion.div>
  );
}
