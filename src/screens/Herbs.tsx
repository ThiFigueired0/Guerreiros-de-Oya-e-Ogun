import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, X, Heart, Share2, Trash2, Search, CalendarClock, ChevronLeft, Folder, PlusCircle, Droplet, Package, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { HerbBath, AppSettings, ReadyBath } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

const INITIAL_READY_BATHS: ReadyBath[] = [
  { id: 'r1', title: 'Banho de descarrego', quantity: 0, isFixed: true, category: 'Gerais' },
  { id: 'r2', title: 'Banho de desenvolvimento', quantity: 0, isFixed: true, category: 'Gerais' },
  { id: 'r3', title: 'Banho energizador', quantity: 0, isFixed: true, category: 'Gerais' },
];

const INITIAL_BATHS: HerbBath[] = [
  {
    id: 'b1',
    title: 'Banho de descarrego',
    category: 'Gerais',
    herbs: 'Alecrim\nArruda\nGuiné\nManjericão\nEspada de são Jorge\nFumo de corda\nCasca de alho\nCasca de cebola\nPinhão roxo\nFolha do fogo\nAroeira\nJurema preta\nAbre caminho\nQuebra demanda\nPara raio\nDanda da costa\nAssa peixe\nEspinheira santa\nAçoita cavalo\nErva do bicho\nBuchinha do norte\nEucalipto\nFolha de chorão\nPicão preto\nDesata nó',
    observations: 'Banho de descarrego é necessário antes de tomar qualquer outro banho, para que limpe o medium de energias baixas, negativas e assim permitindo que os banhos seguintes consigam trazer a energia, um exemplo; não consigo tomar um banho de oxalá e trazer tranquilidade caso a pessoa estiver carregada.',
    isFavorite: false
  },
  {
    id: 'b2',
    title: 'Banho de desenvolvimento',
    category: 'Gerais',
    herbs: 'Casca de Jurema Preta\nPau Resposta\nCipó Caboclo\nFolha de Laranjeira\nFolha de Pitangueira\nSamambaia',
    observations: 'Todos esses elementos são para uma mistura específica assim como um resultado harmônico para sentirmos nossos espíritos e trazemos as nossas energias mais facilmente.\n\n* Como preparar esse banho?\nOs 3 primeiros ingredientes que são paus e cascas precisão ser comprados em casa de umbanda pois não conseguimos achar eles facilmente, eles precisão ser ralados, não tem necessidade nenhuma ferver o pedaço inteiro que é praticamente desperdício e não se usufrui de todo seu benefício assim, e as últimas 3 ervas caso tenham secas pode se ferver, se só tiverem frescas podem ser quinadas normalmente\n\nCaso ferverem as cascas já raladas e alguma das ervas que estiverem secas, e tiverem alguma dessas frescas já quinadas, vocês apenas fazem a fusão de ambos, que é misturar os fervidos com os quinados',
    isFavorite: false
  },
  {
    id: 'b3',
    title: 'Banho neutralizador',
    category: 'Gerais',
    herbs: 'Folha de goiaba\nFolha de manga\nPitanga\nJabuticaba\nArruda',
    observations: '',
    isFavorite: false
  },
  {
    id: 'b4',
    title: 'Banho energizador',
    category: 'Gerais',
    herbs: 'Alecrim\nLouro\nCapim limão\nErva doce\nCamomila',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxala',
    title: 'Banho de Oxalá',
    category: 'Orixás',
    herbs: 'Guaco\nPitanga\nBoldo\nAlecrim\nFolha de laranjeira\nHortelã\nManjericão\nCapim cidreira',
    observations: '',
    isFavorite: false
  },
  {
    id: 'iemanja',
    title: 'Banho de Iemanja',
    category: 'Orixás',
    herbs: 'Cavalinha\nColônia\nFolha de Graviola\nJasmim\nRosas Brancas\nAlfazema\nManjericão\nAnis Estrelado\nPata de vaca\nLírio do brejo',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxum',
    title: 'Banho de Oxum',
    category: 'Orixás',
    herbs: 'Calêndula\nErva doce\nCamomila\nMacaça\nMelissa\nErva cidreira',
    observations: '',
    isFavorite: false
  },
  {
    id: 'iansa',
    title: 'Banho de Iansã/Oya',
    category: 'Orixás',
    herbs: 'Buchinha do norte\nPara raio\nEspada de Santa Barbara\nPeregum vermelho\nAlfavaca\nCalêndula\nDanda da costa\nLosna\nFolha de fumo\nFolha de goiaba\nFolha de limão\nFolha de louro\nFolha de manga\nFolha de romã\nFolha de pitanga\nFlha do fogo\nGirassol (semente)',
    observations: '',
    isFavorite: false
  },
  {
    id: 'ogum',
    title: 'Banho de Ogum',
    category: 'Orixás',
    herbs: 'Peregum verde\nLosna\nComigo ninguém pode\nEspada de são Jorge\nFolha de goiaba, aroeira\nAbre caminho\nCana de brejo\nQuebra demanda\nPicão preto\nPinhão roxo\nDanda da costa\nGuiné\nSálvia\nAssa peixe\nAngico',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxossi',
    title: 'Banho de Oxossi',
    category: 'Orixás',
    herbs: 'Folha de goiabeira\nFolha de groselha\nFolha de mangueira\nQuebra demanda\nFolha de café\nFolha de abacateiro\nFolha de milho\nFolha Chapéu de couro\nSalgueiro chorão\nPicão preto\nJurema preta\nCipó caboclo\nPeregum verde\nSamambaia\nCabelo de milho',
    observations: '',
    isFavorite: false
  },
  {
    id: 'xango',
    title: 'Banho de Xangô',
    category: 'Orixás',
    herbs: 'Aroeira\nPara raio',
    observations: '',
    isFavorite: false
  },
  {
    id: 'obaluae',
    title: 'Banho de Obaluaê',
    category: 'Orixás',
    herbs: 'Pinhão roxo',
    observations: '',
    isFavorite: false
  }
];

export default function HerbsScreen() {
  const location = useLocation();
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    bathCategories: ['Gerais', 'Orixás', 'Entidades'],
    pushNotifications: false
  });

  const [baths, setBaths] = useStorage<HerbBath[]>('templo_baths', INITIAL_BATHS);
  const [readyBaths, setReadyBaths] = useStorage<ReadyBath[]>('templo_ready_baths', INITIAL_READY_BATHS);
  const [activeSubTab, setActiveSubTab] = useState<'composition' | 'ready' | 'herbs_list'>('composition');
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
  
  // Sync missing initial baths and update Orixá compositions
  React.useEffect(() => {
    let hasChanged = false;
    
    // 1. Update existing and remove unwanted Orixá baths
    const filteredAndUpdatedBaths = baths.filter(current => {
      const initial = INITIAL_BATHS.find(i => i.id === current.id);
      // If it's an Orixá bath but not in INITIAL_BATHS, remove it (as requested)
      if (current.category === 'Orixás' && !initial) {
        hasChanged = true;
        return false;
      }
      return true;
    }).map(current => {
      const initial = INITIAL_BATHS.find(i => i.id === current.id);
      if (initial && initial.category === 'Orixás') {
        const isDifferent = current.herbs !== initial.herbs || current.title !== initial.title;
        if (isDifferent) {
          hasChanged = true;
          return { ...current, title: initial.title, herbs: initial.herbs, observations: initial.observations };
        }
      }
      return current;
    });

    const missingBaths = INITIAL_BATHS.filter(initial => !baths.find(b => b.id === initial.id));
    
    if (hasChanged || missingBaths.length > 0) {
      setBaths([...filteredAndUpdatedBaths, ...missingBaths]);
    }
  }, []);
  
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingReady, setIsDeletingReady] = useState(false);

  // Ready Bath Listing State
  const [readySearch, setReadySearch] = useState('');
  const [selectedReadyCategory, setSelectedReadyCategory] = useState<string | null>(null);

  // Ready Bath Form State
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [editingReadyBath, setEditingReadyBath] = useState<ReadyBath | null>(null);
  const [readyForm, setReadyForm] = useState({ title: '', quantity: 1, category: 'Gerais', notes: '' });

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
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBath = () => {
    if (deletingId) {
      if (isDeletingReady) {
        setReadyBaths(readyBaths.filter(r => r.id !== deletingId));
      } else {
        setBaths(baths.filter(b => b.id !== deletingId));
      }
      setDeletingId(null);
      setIsDeletingReady(false);
    }
  };

  const handleSaveReadyBath = () => {
    if (readyForm.title) {
      if (editingReadyBath) {
        setReadyBaths(readyBaths.map(r => r.id === editingReadyBath.id ? { ...r, title: readyForm.title, quantity: readyForm.quantity, category: readyForm.category, notes: readyForm.notes } : r));
      } else {
        setReadyBaths([...readyBaths, { id: Date.now().toString(), title: readyForm.title, quantity: readyForm.quantity, category: readyForm.category, notes: readyForm.notes, isFixed: false }]);
      }
      setShowReadyModal(false);
      setEditingReadyBath(null);
      setReadyForm({ title: '', quantity: 1, category: 'Gerais', notes: '' });
    }
  };

  const adjustReadyQuantity = (id: string, delta: number) => {
    setReadyBaths(readyBaths.map(r => r.id === id ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r));
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

  const filteredReadyBaths = readyBaths.filter(rb => {
    const matchesSearch = rb.title.toLowerCase().includes(readySearch.toLowerCase()) || (rb.notes?.toLowerCase() || '').includes(readySearch.toLowerCase());
    const matchesCategory = selectedReadyCategory ? (rb.category === selectedReadyCategory || (!rb.category && selectedReadyCategory === 'Gerais')) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500 pb-20",
      settings.darkMode && "bg-[#121212]"
    )}>
      {/* Fixed Header Component: Semana de Gira */}
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

      {/* Sub-tabs Submenu */}
      <div className="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl mb-8 border border-gray-100 dark:border-white/5">
        {[
          { id: 'composition', label: 'Banhos (Composição)', icon: Droplet },
          { id: 'ready', label: 'Banhos Prontos', icon: Package },
          { id: 'herbs_list', label: 'Gestor de Ervas', icon: Leaf },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTab(tab.id as any);
              setSelectedCategory(null); // Reset category when switching main sub-tabs
            }}
            className={cn(
              "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 active:scale-95",
              activeSubTab === tab.id 
                ? (settings.darkMode ? "bg-brand-copper text-white shadow-md" : "bg-brand-navy text-white shadow-md")
                : (settings.darkMode ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-brand-navy")
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="leading-none text-center">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeSubTab === 'composition' ? (
        <>
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
                        <Share2 className="w-4 h-4" /> Compartilhar
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
                          settings.darkMode ? "bg-red-500/10 text-red-400 hover:text-red-300" : "bg-red-50 text-red-500 hover:bg-red-100"
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
        </>
      ) : activeSubTab === 'ready' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <div>
              <h2 className={cn("text-2xl font-black text-brand-navy tracking-tight", settings.darkMode && "text-white")}>Banhos Prontos</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mt-1">Gestão de Estoque</p>
            </div>
            <button 
              onClick={() => {
                setEditingReadyBath(null);
                setReadyForm({ title: '', quantity: 1, category: selectedReadyCategory || 'Gerais', notes: '' });
                setShowReadyModal(true);
              }}
              className={cn(
                "w-12 h-12 bg-brand-navy text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform",
                settings.darkMode && "bg-brand-copper"
              )}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 px-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar banho..."
                value={readySearch}
                onChange={(e) => setReadySearch(e.target.value)}
                className={cn(
                  "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none text-sm",
                  settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                )}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedReadyCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                  selectedReadyCategory === null
                    ? "bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/20"
                    : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-500" : "bg-white border-gray-100 text-gray-400")
                )}
              >
                Todos
              </button>
              {[...bathCategories, 'Outros'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedReadyCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                    selectedReadyCategory === cat
                      ? "bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/20"
                      : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-500" : "bg-white border-gray-100 text-gray-400")
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ready Baths List */}
          <div className="grid gap-4">
            {filteredReadyBaths.map((rb) => (
              <motion.div
                layout
                key={rb.id}
                className={cn(
                  "bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-4 group transition-all",
                  settings.darkMode && "bg-[#1A1A1A] border-gray-800",
                  rb.isFixed && rb.quantity === 0 && (settings.darkMode ? "border-red-500/40 bg-red-500/5 shadow-none" : "border-red-200 bg-red-50/50 shadow-red-100 shadow-lg")
                )}
              >
                {/* Specific Alert Badge for Out of Stock Fixed Baths */}
                {rb.isFixed && rb.quantity === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500 flex items-center justify-center gap-2 p-2 rounded-2xl shadow-lg shadow-red-500/20"
                  >
                    <Package className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">REPOSIÇÃO NECESSÁRIA: {rb.title}</span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setEditingReadyBath(rb);
                      setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                      setShowReadyModal(true);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn("font-bold text-brand-navy group-hover:text-brand-copper transition-colors", settings.darkMode && "text-white")}>
                        {rb.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                          settings.darkMode ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"
                        )}>
                          {rb.category || 'Gerais'}
                        </span>
                      <Package className={cn("w-3 h-3 text-gray-400", rb.isFixed && rb.quantity === 0 && "text-red-400 ml-1")} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest text-gray-400",
                        rb.isFixed && rb.quantity === 0 && "text-red-500"
                      )}>
                        {rb.quantity} {rb.quantity === 1 ? 'Pacotinho' : 'Pacotinhos'}
                      </span>
                      {rb.isFixed && (
                        <span className={cn(
                          "ml-2 px-2 py-0.5 text-[8px] font-black uppercase rounded-full",
                          rb.quantity === 0 ? "bg-red-500/10 text-red-500" : "bg-brand-gold/10 text-brand-gold"
                        )}>
                          Fixo
                        </span>
                      )}
                    </div>
                    {rb.notes && (
                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-1 italic">
                        {rb.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setEditingReadyBath(rb);
                        setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                        setShowReadyModal(true);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-brand-navy"
                      )}
                    >
                      Editar
                    </button>
                    {!rb.isFixed && (
                      <button 
                        onClick={() => {
                          setDeletingId(rb.id);
                          setIsDeletingReady(true);
                          setShowDeleteConfirm(true);
                        }}
                        className={cn(
                          "p-3 rounded-xl active:scale-90 transition-all",
                          settings.darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"
                        )}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {readyBaths.length === 0 && (
            <div className={cn(
              "p-12 rounded-[40px] text-center border-2 border-dashed",
              settings.darkMode ? "border-white/5" : "border-gray-50"
            )}>
              <p className="text-gray-400 text-sm italic">Nenhum banho pronto registrado.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={cn(
          "p-12 rounded-[40px] text-center border-2 border-dashed",
          settings.darkMode ? "border-white/5" : "border-gray-50"
        )}>
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-brand-gold" />
          </div>
          <p className="text-gray-400 text-sm italic">Área de gestão de catálogo de ervas em desenvolvimento.</p>
        </div>
      )}

      {/* Modals and other absolute components */}
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
                   <p className="text-[10px] font-black uppercase text-brand-copper tracking-[0.2em] mb-4">Composição</p>
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
                  <Share2 className="w-4 h-4" /> Compartilhar
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
                 <button onClick={() => setShowRoutineModal(false)} className="p-2 text-gray-400 active:text-gray-600 transition-colors">
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

        {showReadyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={() => setShowReadyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A] text-white border border-white/10"
              )}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">
                {editingReadyBath ? 'Editar Banho Pronto' : 'Novo Banho Pronto'}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Categoria / Pasta</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {[...bathCategories, 'Outros'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setReadyForm({...readyForm, category: cat})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                          readyForm.category === cat
                            ? "bg-brand-navy border-brand-navy text-white shadow-md shadow-brand-navy/20"
                            : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-500" : "bg-white border-gray-100 text-gray-400")
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Nome do Banho</p>
                  <input
                    placeholder="Ex: Banho de Gira"
                    value={readyForm.title}
                    onChange={(e) => setReadyForm({...readyForm, title: e.target.value})}
                    disabled={editingReadyBath?.isFixed}
                    className={cn(
                      "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-copper outline-none",
                      settings.darkMode && "bg-black/40 text-white",
                      editingReadyBath?.isFixed && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Quantidade (Pacotinhos)</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setReadyForm({...readyForm, quantity: Math.max(0, readyForm.quantity - 1)})}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 font-bold text-xl active:scale-95",
                        settings.darkMode && "bg-white/5"
                      )}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-black text-lg">
                      {readyForm.quantity}
                    </div>
                    <button 
                      onClick={() => setReadyForm({...readyForm, quantity: readyForm.quantity + 1})}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 font-bold text-xl active:scale-95",
                        settings.darkMode && "bg-white/5"
                      )}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Anotações / Ervas</p>
                  <textarea
                    placeholder="Adicione observações sobre este banho..."
                    rows={3}
                    value={readyForm.notes}
                    onChange={(e) => setReadyForm({...readyForm, notes: e.target.value})}
                    className={cn(
                      "w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-brand-copper outline-none resize-none text-sm",
                      settings.darkMode && "bg-black/40 text-white"
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowReadyModal(false)}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold",
                      settings.darkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveReadyBath}
                    className={cn(
                      "flex-1 p-4 rounded-2xl font-bold transition-all active:scale-95",
                      editingReadyBath 
                        ? "bg-brand-copper text-white shadow-lg shadow-brand-copper/20" 
                        : "bg-brand-navy text-white shadow-lg shadow-brand-navy/20"
                    )}
                  >
                    {editingReadyBath ? 'Confirmar Alterações' : 'Criar Banho'}
                  </button>
                </div>
              </div>
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
                {editingId ? 'Editar Banho' : 'Criar Novo Banho'}
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

      <DeleteConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDeleteBath}
        title="Excluir Banho"
        message="Deseja realmente excluir este banho permanentemente?"
      />
    </motion.div>
  );
}
