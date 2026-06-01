import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { Plus, Minus, X, Heart, Share2, Trash2, Search, CalendarClock, ChevronLeft, ChevronRight, Folder, PlusCircle, Droplet, Package, Leaf, AlertCircle, CheckCircle2, Settings, Pencil, Sliders, Copy, Check, Flame, Sun, Snowflake, Calendar, CalendarDays, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { HerbBath, AppSettings, ReadyBath, HerbStock, NotificationItem } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

const SUGGESTED_HERBS: { name: string; classification: 'quente' | 'morna' | 'fria' }[] = [
  { name: "Abre caminho", classification: 'quente' },
  { name: "Açoita cavalo", classification: 'quente' },
  { name: "Água de coco", classification: 'fria' },
  { name: "Alecrim", classification: 'morna' },
  { name: "Alfavaca", classification: 'morna' },
  { name: "Alfazema", classification: 'morna' },
  { name: "Amor agarradinho", classification: 'morna' },
  { name: "Amor perfeito", classification: 'morna' },
  { name: "Amora", classification: 'quente' },
  { name: "Angico", classification: 'quente' },
  { name: "Anis estrelado", classification: 'morna' },
  { name: "Aroeira", classification: 'quente' },
  { name: "Arroz (grão)", classification: 'fria' },
  { name: "Arruda", classification: 'quente' },
  { name: "Assa peixe", classification: 'quente' },
  { name: "Boldo", classification: 'morna' },
  { name: "Brinco de princesa", classification: 'morna' },
  { name: "Buchinha do norte", classification: 'quente' },
  { name: "Cabelo de milho", classification: 'morna' },
  { name: "Calêndula", classification: 'morna' },
  { name: "Camomila", classification: 'fria' },
  { name: "Cana de brejo", classification: 'quente' },
  { name: "Canela", classification: 'morna' },
  { name: "Capim cidreira", classification: 'morna' },
  { name: "Capim limão", classification: 'morna' },
  { name: "Carqueja", classification: 'quente' },
  { name: "Casca da laranja", classification: 'morna' },
  { name: "Casca de coco ralado", classification: 'fria' },
  { name: "Cavalinha", classification: 'morna' },
  { name: "Cipó caboclo", classification: 'quente' },
  { name: "Coentro", classification: 'morna' },
  { name: "Colônia", classification: 'fria' },
  { name: "Comigo ninguém pode", classification: 'quente' },
  { name: "Cravo da Índia (ou Cravo)", classification: 'morna' },
  { name: "Danda da costa", classification: 'quente' },
  { name: "Desata nó", classification: 'quente' },
  { name: "Erva cidreira", classification: 'fria' },
  { name: "Erva doce (ou Funcho)", classification: 'fria' },
  { name: "Espada de Santa Bárbara", classification: 'quente' },
  { name: "Espada de São Jorge", classification: 'quente' },
  { name: "Espinheira santa", classification: 'morna' },
  { name: "Eucalipto", classification: 'quente' },
  { name: "Flor de girassol (ou Semente de girassol)", classification: 'morna' },
  { name: "Folha Chapéu de couro", classification: 'morna' },
  { name: "Folha de abacateiro", classification: 'quente' },
  { name: "Folha de anil", classification: 'quente' },
  { name: "Folha de café", classification: 'morna' },
  { name: "Folha de caju", classification: 'morna' },
  { name: "Folha de cana", classification: 'morna' },
  { name: "Folha de coqueiro", classification: 'morna' },
  { name: "Folha de fumo", classification: 'quente' },
  { name: "Folha de goiaba (ou Goiabeira)", classification: 'morna' },
  { name: "Folha de Graviola", classification: 'fria' },
  { name: "Folha de groselha", classification: 'morna' },
  { name: "Folha de laranjeira", classification: 'morna' },
  { name: "Folha de limão", classification: 'morna' },
  { name: "Folha de louro", classification: 'morna' },
  { name: "Folha de manga (ou Mangueira)", classification: 'morna' },
  { name: "Folha de milho", classification: 'morna' },
  { name: "Folha de pitanga (ou Pitanga)", classification: 'morna' },
  { name: "Folha de romã", classification: 'morna' },
  { name: "Folha do fogo", classification: 'quente' },
  { name: "Guaco", classification: 'morna' },
  { name: "Guiné", classification: 'quente' },
  { name: "Hortelã", classification: 'morna' },
  { name: "Jasmim", classification: 'fria' },
  { name: "Jurema preta", classification: 'quente' },
  { name: "Lágrima de nossa senhora", classification: 'morna' },
  { name: "Levante", classification: 'morna' },
  { name: "Lírio do brejo", classification: 'fria' },
  { name: "Losna", classification: 'quente' },
  { name: "Macaça", classification: 'morna' },
  { name: "Mamona", classification: 'quente' },
  { name: "Manjericão", classification: 'morna' },
  { name: "Melissa", classification: 'fria' },
  { name: "Para raio", classification: 'quente' },
  { name: "Pata de vaca", classification: 'fria' },
  { name: "Pau resposta", classification: 'quente' },
  { name: "Pau tenente", classification: 'quente' },
  { name: "Peregum roxo", classification: 'morna' },
  { name: "Peregum verde", classification: 'morna' },
  { name: "Peregum vermelho", classification: 'morna' },
  { name: "Picão preto", classification: 'quente' },
  { name: "Pimenta rosada", classification: 'quente' },
  { name: "Pinhão roxo", classification: 'quente' },
  { name: "Quebra demanda", classification: 'quente' },
  { name: "Rosas Brancas", classification: 'fria' },
  { name: "Rosas cor de rosa", classification: 'fria' },
  { name: "Rosas vermelhas", classification: 'morna' },
  { name: "Salgueiro chorão", classification: 'morna' },
  { name: "Salsão", classification: 'morna' },
  { name: "Sálvia", classification: 'morna' },
  { name: "Samambaia", classification: 'morna' },
  { name: "Tomilho", classification: 'morna' },
  { name: "Trevo (ou Trevo de quatro folhas)", classification: 'morna' },
  { name: "Verbena", classification: 'morna' }
];

const INITIAL_READY_BATHS: ReadyBath[] = [
  { id: 'r1', title: 'Banho de descarrego', quantity: 0, price: 17, isFixed: true, category: 'Gerais' },
  { id: 'r2', title: 'Banho de desenvolvimento', quantity: 0, price: 17, isFixed: true, category: 'Gerais' },
  { id: 'r3', title: 'Banho energizador', quantity: 0, price: 17, isFixed: true, category: 'Gerais' },
];

const INITIAL_BATHS: HerbBath[] = [
  {
    id: 'b1',
    title: 'Banho de descarrego',
    category: 'Gerais',
    thermalProperty: 'quente',
    herbs: 'Alecrim\nArruda\nGuiné\nManjericão\nEspada de são Jorge\nFumo de corda\nCasca de alho\nCasca de cebola\nPinhão roxo\nFolha do fogo\nAroeira\nJurema preta\nAbre caminho\nQuebra demanda\nPara raio\nDanda da costa\nAssa peixe\nEspinheira santa\nAçoita cavalo\nErva do bicho\nBuchinha do norte\nEucalipto\nFolha de chorão\nPicão preto\nDesata nó',
    observations: 'Banho de descarrego é necessário antes de tomar qualquer outro banho, para que limpe o medium de energias baixas, negativas e assim permitindo que os banhos seguintes consigam trazer a energia, um exemplo; não consigo tomar um banho de oxalá e trazer tranquilidade caso a pessoa estiver carregada.',
    isFavorite: false
  },
  {
    id: 'b2',
    title: 'Banho de desenvolvimento',
    category: 'Gerais',
    thermalProperty: 'morna',
    herbs: 'Casca de Jurema Preta\nPau Resposta\nCipó Caboclo\nFolha de Laranjeira\nFolha de Pitangueira\nSamambaia',
    observations: 'Todos esses elementos são para uma mistura específica assim como um resultado harmônico para sentirmos nossos espíritos e trazemos as nossas energias mais facilmente.\n\n* Como preparar esse banho?\nOs 3 primeiros ingredientes que são paus e cascas precisão ser comprados em casa de umbanda pois não conseguimos achar eles facilmente, eles precisão ser ralados, não tem necessidade nenhuma ferver o pedaço inteiro que é praticamente desperdício e não se usufrui de todo seu benefício assim, e as últimas 3 ervas caso tenham secas pode se ferver, se só tiverem frescas podem ser quinadas normalmente\n\nCaso ferverem as cascas já raladas e alguma das ervas que estiverem secas, e tiverem alguma dessas frescas já quinadas, vocês apenas fazem a fusão de ambos, que é misturar os fervidos com os quinados',
    isFavorite: false
  },
  {
    id: 'b3',
    title: 'Banho neutralizador',
    category: 'Gerais',
    thermalProperty: 'morna',
    herbs: 'Folha de goiaba\nFolha de manga\nPitanga\nJabuticaba\nArruda',
    observations: '',
    isFavorite: false
  },
  {
    id: 'b4',
    title: 'Banho energizador',
    category: 'Gerais',
    thermalProperty: 'morna',
    herbs: 'Alecrim\nLouro\nCapim limão\nErva doce\nCamomila',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxala',
    title: 'Banho de Oxalá',
    category: 'Orixás',
    thermalProperty: 'fria',
    herbs: 'Guaco\nPitanga\nBoldo\nAlecrim\nFolha de laranjeira\nHortelã\nManjericão\nCapim cidreira',
    observations: '',
    isFavorite: false
  },
  {
    id: 'iemanja',
    title: 'Banho de Iemanja',
    category: 'Orixás',
    thermalProperty: 'fria',
    herbs: 'Cavalinha\nColônia\nFolha de Graviola\nJasmim\nRosas Brancas\nAlfazema\nManjericão\nAnis Estrelado\nPata de vaca\nLírio do brejo',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxum',
    title: 'Banho de Oxum',
    category: 'Orixás',
    thermalProperty: 'fria',
    herbs: 'Calêndula\nErva doce\nCamomila\nMacaça\nMelissa\nErva cidreira',
    observations: '',
    isFavorite: false
  },
  {
    id: 'iansa',
    title: 'Banho de Iansã/Oya',
    category: 'Orixás',
    thermalProperty: 'quente',
    herbs: 'Buchinha do norte\nPara raio\nEspada de Santa Barbara\nPeregum vermelho\nAlfavaca\nCalêndula\nDanda da costa\nLosna\nFolha de fumo\nFolha de goiaba\nFolha de limão\nFolha de louro\nFolha de manga\nFolha de romã\nFolha de pitanga\nFlha do fogo\nGirassol (semente)',
    observations: '',
    isFavorite: false
  },
  {
    id: 'ogum',
    title: 'Banho de Ogum',
    category: 'Orixás',
    thermalProperty: 'quente',
    herbs: 'Peregum verde\nLosna\nComigo ninguém pode\nEspada de são Jorge\nFolha de goiaba, aroeira\nAbre caminho\nCana de brejo\nQuebra demanda\nPicão preto\nPinhão roxo\nDanda da costa\nGuiné\nSálvia\nAssa peixe\nAngico',
    observations: '',
    isFavorite: false
  },
  {
    id: 'oxossi',
    title: 'Banho de Oxossi',
    category: 'Orixás',
    thermalProperty: 'morna',
    herbs: 'Folha de goiabeira\nFolha de groselha\nFolha de mangueira\nQuebra demanda\nFolha de café\nFolha de abacateiro\nFolha de milho\nFolha Chapéu de couro\nSalgueiro chorão\nPicão preto\nJurema preta\nCipó caboclo\nPeregum verde\nSamambaia\nCabelo de milho',
    observations: '',
    isFavorite: false
  },
  {
    id: 'xango',
    title: 'Banho de Xangô',
    category: 'Orixás',
    thermalProperty: 'quente',
    herbs: 'Aroeira\nPara raio',
    observations: '',
    isFavorite: false
  },
  {
    id: 'obaluae',
    title: 'Banho de Obaluaê',
    category: 'Orixás',
    thermalProperty: 'quente',
    herbs: 'Pinhão roxo',
    observations: '',
    isFavorite: false
  },
  {
    id: 'exu',
    title: 'Banho de Exu',
    category: 'Entidades',
    thermalProperty: 'quente',
    herbs: 'Mamona\nAmora\nAçoita cavalo\nFolha do fogo\ndesata nó\nPau tenente\nPeregum roxo',
    observations: '',
    isFavorite: false
  },
  {
    id: 'pombagira',
    title: 'Banho de Pombagira',
    category: 'Entidades',
    thermalProperty: 'morna',
    herbs: 'Rosa vermelha\nCalêndula\nCanela\nCravo da Índia\nBrinco de princesa\nAmor agarradinho\nAmor perfeito',
    observations: '',
    isFavorite: false
  },
  {
    id: 'exu_mirim',
    title: 'Banho de Exu Mirim',
    category: 'Entidades',
    thermalProperty: 'quente',
    herbs: 'Folha de laranjeira / Casca da laranja\nFolha de limão',
    observations: '',
    isFavorite: false
  },
  {
    id: 'malandros',
    title: 'Banho de Malandros',
    category: 'Entidades',
    thermalProperty: 'morna',
    herbs: 'Alecrim\nTrevo de quarto folhas\nRosas vermelhas\nPimenta rosada\nCapim limão\nFolha de cana',
    observations: '',
    isFavorite: false
  },
  {
    id: 'baianos',
    title: 'Banho de Baianos',
    category: 'Entidades',
    thermalProperty: 'morna',
    herbs: 'Folha de laranjeira\nErva cidreira\nCoentro\nFolha de coqueiro\nFolha de caju\nCasca de coco ralado\nÁgua de coco',
    observations: '',
    isFavorite: false
  },
  {
    id: 'ere',
    title: 'Banho de Erê',
    category: 'Entidades',
    thermalProperty: 'fria',
    herbs: 'Levante\nVerbena\nRosas cor de rosa\nFuncho/erva doce\nAlecrim\nTrevo\nFolha de anil\nFolha de laranjeira\nAlfazema\nJasmim\nCalêndula',
    observations: 'Também pode utilizar ervas de Oxum, pois na umbanda é Oxum quem trás os erês. Além disso, pode adicionar ao banho um pouco de guaraná',
    isFavorite: false
  },
  {
    id: 'caboclo',
    title: 'Banho de Caboclo',
    category: 'Entidades',
    herbs: '',
    observations: '',
    isFavorite: false
  },
  {
    id: 'preto_velho',
    title: 'Banho de Preto velho',
    category: 'Entidades',
    herbs: 'Guiné\nArruda\nAlecrim\nManjericão\nEspinheira santa\nLágrima de nossa senhora\nSálvia',
    observations: '',
    isFavorite: false
  },
  {
    id: 'marujo',
    title: 'Banho de Marujo',
    category: 'Entidades',
    herbs: 'Levante\nCravo da Índia\nHortelã\nManjericão\nBoldo\nLosna\nCarqueja\nSalsão',
    observations: '',
    isFavorite: false
  },
  {
    id: 'ciganos',
    title: 'Banho de Ciganos',
    category: 'Entidades',
    herbs: 'Tomilho\nCalêndula\nCravo\nCanela\nArroz (grão)\nEucalipto\nFlor de girassol\nPau resposta\nAnis estrelado',
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
    pushNotifications: false,
    bathPackagePrice: 17,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  const [baths, setBaths] = useStorage<HerbBath[]>('templo_baths', INITIAL_BATHS);
  const [readyBaths, setReadyBaths] = useStorage<ReadyBath[]>('templo_ready_baths', INITIAL_READY_BATHS);
  const [herbStock, setHerbStock] = useStorage<HerbStock[]>('templo_herb_stock', []);
  const [notifications, setNotifications] = useStorage<NotificationItem[]>('templo_history', []);
  const [activeSubTab, setActiveSubTab] = useState<'composition' | 'ready' | 'herbs_list'>('composition');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isManaging, setIsManaging] = useState(false);
  
  // Reset management mode when tab or category changes
  useEffect(() => {
    setIsManaging(false);
  }, [activeSubTab, selectedCategory]);
  
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
  
  // Sync missing initial baths and update Orixá/Entidades compositions
  React.useEffect(() => {
    let bathsChanged = false;
    const filteredAndUpdatedBaths = baths.filter(current => true).map(current => {
      const initial = INITIAL_BATHS.find(i => i.id === current.id);
      if (initial && (initial.category === 'Orixás' || initial.category === 'Entidades')) {
        const isDifferent = current.herbs !== initial.herbs || current.title !== initial.title || current.thermalProperty !== initial.thermalProperty;
        if (isDifferent) {
          bathsChanged = true;
          return { ...current, title: initial.title, herbs: initial.herbs, observations: initial.observations, thermalProperty: initial.thermalProperty };
        }
      }
      return current;
    });

    const missingBaths = INITIAL_BATHS.filter(initial => !baths.find(b => b.id === initial.id));
    
    if (bathsChanged || missingBaths.length > 0) {
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
    category: 'Gerais',
    thermalProperty: 'morna'
  });

  const [selectedBathForDetails, setSelectedBathForDetails] = useState<HerbBath | null>(null);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        setShowRoutineModal(customEvent.detail);
      }
    };
    const handleSelectBath = (e: Event) => {
      const customEvent = e as CustomEvent;
      const bathId = customEvent.detail?.id;
      if (bathId) {
        const bath = baths.find(b => b.id === bathId);
        if (bath) {
          setSelectedBathForDetails(bath);
        }
      }
    };
    window.addEventListener('toggle-routine-modal', handleToggle);
    window.addEventListener('select-routine-bath', handleSelectBath);
    return () => {
      window.removeEventListener('toggle-routine-modal', handleToggle);
      window.removeEventListener('select-routine-bath', handleSelectBath);
    };
  }, [baths]);

  // Ready Bath Listing State
  const [readySearch, setReadySearch] = useState('');
  const [selectedReadyCategory, setSelectedReadyCategory] = useState<string | null>(null);

  // Ready Bath Form State
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [editingReadyBath, setEditingReadyBath] = useState<ReadyBath | null>(null);
  const [readyForm, setReadyForm] = useState({ title: '', quantity: 1, category: 'Gerais', notes: '' });

  // Herb Stock State
  const [showHerbModal, setShowHerbModal] = useState(false);
  const [herbSearch, setHerbSearch] = useState('');
  const [customHerbName, setCustomHerbName] = useState('');
  const [stockSearch, setStockSearch] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  const { queueDelete } = useUndo();

  const handleCopyPix = () => {
    navigator.clipboard.writeText('11982350614');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

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
        
        // Add notification for update
        const newNotif: NotificationItem = {
          id: `update_bath_${Date.now()}`,
          title: `Banho ${newBath.title} atualizado`,
          timestamp: Date.now(),
          category: 'edição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
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

  const deleteBath = (bath: HerbBath) => {
    queueDelete({
      id: bath.id,
      label: bath.title,
      timestamp: Date.now(),
      onConfirm: () => {
        setBaths(prev => prev.filter(b => b.id !== bath.id));
      }
    });
  };

  const deleteReadyBath = (bath: ReadyBath) => {
    queueDelete({
      id: bath.id,
      label: bath.title,
      timestamp: Date.now(),
      onConfirm: () => {
        setReadyBaths(prev => prev.filter(r => r.id !== bath.id));
        const newNotif: NotificationItem = {
          id: `delete_ready_bath_${Date.now()}`,
          title: `Banho Pronto "${bath.title}" removido`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const handleSaveReadyBath = () => {
    if (readyForm.title) {
      if (editingReadyBath) {
        setReadyBaths(readyBaths.map(r => r.id === editingReadyBath.id ? { ...r, title: readyForm.title, quantity: readyForm.quantity, category: readyForm.category, notes: readyForm.notes } : r));
        
        // Add notification for update
        const newNotif: NotificationItem = {
          id: `update_ready_bath_${Date.now()}`,
          title: `Banho Pronto ${readyForm.title} atualizado`,
          timestamp: Date.now(),
          category: 'edição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      } else {
        setReadyBaths([...readyBaths, { id: Date.now().toString(), title: readyForm.title, quantity: readyForm.quantity, price: settings.bathPackagePrice || 17, category: readyForm.category, notes: readyForm.notes, isFixed: false }]);
        const newNotif: NotificationItem = {
          id: `add_ready_bath_${Date.now()}`,
          title: `Banho Pronto "${readyForm.title}" adicionado`,
          timestamp: Date.now(),
          category: 'adição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
      setShowReadyModal(false);
      setEditingReadyBath(null);
      setReadyForm({ title: '', quantity: 1, category: 'Gerais', notes: '' });
    }
  };

  const adjustReadyQuantity = (id: string, delta: number) => {
    const bath = readyBaths.find(r => r.id === id);
    setReadyBaths(readyBaths.map(r => r.id === id ? { ...r, quantity: Math.max(0, r.quantity + delta) } : r));
    
    if (bath) {
      const newNotif: NotificationItem = {
        id: `adjust_ready_bath_${Date.now()}`,
        title: `Quantidade de ${bath.title} alterada para ${Math.max(0, bath.quantity + delta)}`,
        timestamp: Date.now(),
        category: 'edição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
    }
  };

  const toggleHerbInStock = (id: string) => {
    const herb = herbStock.find(h => h.id === id);
    setHerbStock(herbStock.map(h => h.id === id ? { ...h, inStock: !h.inStock } : h));
    if (herb) {
      const isNowInStock = !herb.inStock;
      const newNotif: NotificationItem = {
        id: `toggle_herb_stock_${Date.now()}`,
        title: `A erva "${herb.name}" foi marcada como ${isNowInStock ? 'disponível' : 'esgotada'}`,
        timestamp: Date.now(),
        category: 'edição',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
    }
  };

  const removeHerbFromStock = (herb: HerbStock) => {
    queueDelete({
      id: herb.id,
      label: `Erva: ${herb.name}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setHerbStock(prev => prev.filter(h => h.id !== herb.id));
        const newNotif: NotificationItem = {
          id: `delete_herb_stock_${Date.now()}`,
          title: `A erva "${herb.name}" foi removida do estoque`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const addHerbToStock = (name: string, classification?: 'quente' | 'morna' | 'fria') => {
    if (herbStock.some(h => h.name.toLowerCase() === name.toLowerCase())) {
      setShowHerbModal(false);
      setCustomHerbName('');
      return;
    }
    setHerbStock([...herbStock, { id: Date.now().toString(), name, inStock: true, classification }]);
    
    const newNotif: NotificationItem = {
      id: `add_herb_stock_${Date.now()}`,
      title: `A erva "${name}" foi adicionada ao estoque`,
      timestamp: Date.now(),
      category: 'adição',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 100));

    setShowHerbModal(false);
    setCustomHerbName('');
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importBaths = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processImport = (text: string) => {
      try {
        const cleanText = text.replace('=== RELAÇÃO DE BANHOS ===', '');
        const blocks = cleanText.split('--------------------------');
        const newBaths: HerbBath[] = [];
        
        blocks.forEach(block => {
          if (!block.trim()) return;
          
          const lines = block.split('\n').map(l => l.trim());
          
          let category = '';
          let title = '';
          let thermalProperty: 'quente' | 'morna' | 'fria' = 'morna';
          const herbsLines: string[] = [];
          const obsLines: string[] = [];
          
          let parsingHerbs = false;
          let parsingObs = false;
          
          lines.forEach(line => {
             if (line.startsWith('Pasta: ')) {
               category = line.substring(7);
               if (category === 'Gerais') category = '';
             } else if (line.startsWith('Nome: ')) {
               title = line.substring(6);
             } else if (line.startsWith('Classificação: ')) {
               const t = line.substring(15).toLowerCase();
               if (t === 'quente' || t === 'morna' || t === 'fria') thermalProperty = t as any;
             } else if (line === 'Ervas:') {
               parsingHerbs = true;
               parsingObs = false;
             } else if (line === 'Observações:') {
               parsingHerbs = false;
               parsingObs = true;
             } else {
               if (parsingHerbs && line) herbsLines.push(line);
               else if (parsingObs && line) obsLines.push(line);
             }
          });
          
          if (title && herbsLines.length > 0) {
             newBaths.push({
               id: crypto.randomUUID(),
               title,
               herbs: herbsLines.join('\n'),
               observations: obsLines.join('\n'),
               category: category || undefined,
               thermalProperty,
               isFavorite: false
             });
          }
        });
        
        if (newBaths.length > 0) {
          setBaths(prev => {
             const copy = [...prev];
             newBaths.forEach(nb => {
               const exists = copy.some(c => c.title === nb.title && Math.abs(c.herbs.length - nb.herbs.length) < 5);
               if (!exists) copy.push(nb);
             });
             return copy;
          });
          setNotifications(prev => [{
             id: `import_${Date.now()}`,
             title: `${newBaths.length} banho(s) importados.`,
             timestamp: Date.now(),
             category: 'sistema',
             read: false
          }, ...prev].slice(0, 100));
          alert(`${newBaths.length} banhos importados com sucesso!`);
        } else {
          alert("Nenhum banho encontrado ou formato inválido. Certifique-se de que o arquivo está no formato correto.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o arquivo.");
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text.includes('')) {
        const reader2 = new FileReader();
        reader2.onload = (evt2) => processImport(evt2.target?.result as string);
        reader2.readAsText(file, 'ISO-8859-1');
      } else {
        processImport(text);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const exportBaths = () => {
    if (baths.length === 0) {
      alert("Não há banhos para exportar.");
      return;
    }

    let content = "=== RELAÇÃO DE BANHOS ===\n\n";
    const sortedBaths = [...baths].sort((a,b) => (a.category || "Gerais").localeCompare(b.category || "Gerais"));
    
    sortedBaths.forEach(b => {
      content += `Pasta: ${b.category || 'Gerais'}\n`;
      content += `Nome: ${b.title}\n`;
      content += `Classificação: ${b.thermalProperty || 'morna'}\n`;
      content += `Ervas:\n${b.herbs}\n`;
      if (b.observations) content += `Observações:\n${b.observations}\n`;
      content += `\n--------------------------\n\n`;
    });

    const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `banhos_templo.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className={cn(
        "p-4 bg-transparent min-h-full pb-32 transition-colors duration-500 relative overflow-hidden"
      )}
    >
      {/* Decorative Aura background - Highly optimized with GPU acceleration to prevent mobile rendering bottlenecks */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.03] dark:bg-brand-gold/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 transform-gpu will-change-transform" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-brand-copper/[0.02] dark:bg-brand-copper/[0.03] rounded-full blur-3xl pointer-events-none -translate-x-1/2 transform-gpu will-change-transform" />

      {/* Main page content wrapper - fades & blurs when routine modal is open */}
      <div className={cn(
        "transition-all duration-500 flex flex-col w-full h-full",
        showRoutineModal ? "opacity-0 scale-95 pointer-events-none filter blur-md" : "opacity-100 scale-100"
      )}>
        {/* Fixed Header Component: Semana de Gira */}
      <button 
        onClick={() => {
          setShowRoutineModal(true);
          window.dispatchEvent(new CustomEvent('toggle-routine-modal', { detail: true }));
        }}
        className={cn(
          "w-full mb-8 p-5 rounded-[24px] flex items-center justify-between group active:scale-[0.98] transition-all overflow-hidden border relative z-10",
          settings.darkMode 
            ? "bg-white/[0.03] backdrop-blur-md border-white/10 hover:border-amber-500/30 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]" 
            : "bg-white border-gray-100 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:border-brand-copper/30 text-brand-navy"
        )}
      >
        {/* Subtle internal glowing light */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-brand-gold/[0.05] dark:bg-brand-gold/[0.08] rounded-full blur-3xl pointer-events-none transition-all group-hover:scale-125" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform",
            settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy"
          )}>
            <CalendarClock className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="text-left">
            <p className="text-[9px] uppercase font-black text-gray-500 dark:text-gray-400 tracking-[0.2em] mb-0.5">Rotina do Templo</p>
            <h3 className={cn("text-lg font-black tracking-tight font-serif", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>Semana de Gira</h3>
          </div>
        </div>
        <div className={cn(
          "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors relative z-10",
          settings.darkMode 
            ? "bg-brand-gold/10 border-brand-gold/25 text-brand-gold hover:bg-brand-gold/20" 
            : "bg-brand-navy/5 border-brand-navy/10 text-brand-navy hover:bg-brand-navy/10 hover:text-brand-copper"
        )}>
          Ver Agenda
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-brand-gold/[0.03] rounded-full blur-2xl pointer-events-none" />
      </button>

      {/* Sub-tabs Submenu */}
      <div className={cn(
        "flex p-1.5 rounded-[24px] mb-10 border transition-all relative z-10",
        settings.darkMode 
          ? "bg-[#161616]/80 backdrop-blur-md border-white/5 shadow-inner" 
          : "bg-gray-50/80 backdrop-blur-md border-gray-100 shadow-sm"
      )}>
        {[
          { id: 'composition', label: 'Composição', icon: Droplet },
          { id: 'ready', label: 'Banhos Prontos', icon: Package },
          { id: 'herbs_list', label: 'Gestor de Ervas', icon: Leaf },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setSelectedCategory(null); // Reset category when switching main sub-tabs
              }}
              className={cn(
                "flex-1 py-3 px-1 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 active:scale-95 border border-transparent",
                isActive 
                  ? (settings.darkMode 
                      ? "bg-brand-copper/20 text-brand-gold border-brand-gold/30 shadow-lg shadow-black/20" 
                      : "bg-brand-navy text-white shadow-md shadow-brand-navy/15"
                    )
                  : (settings.darkMode 
                      ? "text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]" 
                      : "text-gray-400 hover:text-brand-navy hover:bg-gray-50"
                    )
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5 transition-colors", isActive ? (settings.darkMode ? "text-brand-gold animate-pulse" : "text-brand-gold") : "text-gray-400")} />
              <span className="leading-none text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === 'composition' ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8 px-2 relative z-10">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "p-3 rounded-2xl border transition-all active:scale-90 shrink-0 shadow-md",
                    settings.darkMode 
                      ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10 hover:border-brand-gold/30" 
                      : "bg-white border-gray-100 text-brand-navy hover:bg-gray-50 hover:text-brand-copper"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex flex-col overflow-hidden">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-0.5 ml-0.5">Catequese de Ervas</p>
                <h2 className={cn(
                  "text-3xl sm:text-4xl font-black text-brand-navy font-serif tracking-tight truncate",
                  settings.darkMode ? "text-brand-gold" : "text-brand-navy"
                )}>
                  {selectedCategory ? selectedCategory : "Banhos"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <input 
                type="file" 
                accept=".txt" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={importBaths} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shadow-md",
                  settings.darkMode 
                    ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10 hover:border-brand-gold/30" 
                    : "bg-white border-gray-100 text-brand-navy hover:bg-gray-50 text-brand-navy/60"
                )}
                title="Importar banhos (.txt)"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button 
                onClick={exportBaths}
                className={cn(
                  "p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shadow-md",
                  settings.darkMode 
                    ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10 hover:border-brand-gold/30" 
                    : "bg-white border-gray-100 text-brand-navy hover:bg-gray-50 text-brand-navy/60"
                )}
                title="Exportar todos os banhos"
              >
                <Download className="w-5 h-5" />
              </button>
              {selectedCategory && (
                <button 
                  onClick={() => setIsManaging(!isManaging)}
                  className={cn(
                    "px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md border",
                    isManaging 
                      ? "bg-brand-gold border-brand-gold text-brand-navy" 
                      : (settings.darkMode 
                          ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10" 
                          : "bg-gray-100 border-gray-200 text-brand-navy hover:bg-gray-200"
                        )
                  )}
                >
                  {isManaging ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-current animate-pulse" />
                      <span>Voltar</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5 text-current" />
                      <span>Gerenciar</span>
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => setShowModal(true)} 
                className={cn(
                  "w-11 h-11 bg-brand-navy text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all shrink-0 hover:opacity-90",
                  settings.darkMode ? "bg-brand-copper" : "shadow-brand-navy/10"
                )}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          <div className="relative mb-8 px-1 relative z-10">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="text-gray-400 dark:text-gray-500 w-5 h-5 ml-1" />
            </div>
            <input
              type="text"
              placeholder="Buscar banho ou ervas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full rounded-2xl py-4 pl-14 pr-6 outline-none text-sm transition-all shadow-md",
                settings.darkMode 
                  ? "bg-[#161616] border border-white/10 text-white placeholder-gray-500 focus:border-brand-gold/40 focus:ring-1 focus:ring-brand-gold/40" 
                  : "bg-white border border-gray-100 text-brand-navy placeholder-gray-400 focus:border-brand-copper/50 focus:ring-1 focus:ring-brand-copper/30 shadow-gray-200/50"
              )}
            />
          </div>

          {!selectedCategory && !search ? (
            <div className="grid grid-cols-2 gap-4 px-1 relative z-10">
              {bathCategories.map((cat) => {
                const count = baths.filter(b => b.category === cat || (!b.category && cat === 'Gerais')).length;
                const catLower = cat.toLowerCase();
                let folderColorClasses: string;
                let cardHoverClass: string;
                let barClass: string;
                let chevronHoverColor: string;
                
                if (catLower.includes('orixá')) {
                  folderColorClasses = settings.darkMode 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm";
                  cardHoverClass = settings.darkMode 
                    ? "hover:border-emerald-500/30 hover:bg-emerald-500/[0.01]" 
                    : "hover:border-emerald-500/30 hover:bg-emerald-50/10";
                  barClass = "via-emerald-500/40";
                  chevronHoverColor = "group-hover:text-emerald-500";
                } else if (catLower.includes('entidade')) {
                  folderColorClasses = settings.darkMode 
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.15)]" 
                    : "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm";
                  cardHoverClass = settings.darkMode 
                    ? "hover:border-rose-500/30 hover:bg-rose-500/[0.01]" 
                    : "hover:border-rose-500/30 hover:bg-rose-50/10";
                  barClass = "via-rose-500/40";
                  chevronHoverColor = "group-hover:text-rose-500";
                } else if (catLower.includes('geral') || catLower.includes('gerais')) {
                  folderColorClasses = settings.darkMode 
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]" 
                    : "bg-orange-50 text-orange-600 border border-orange-200 shadow-sm";
                  cardHoverClass = settings.darkMode 
                    ? "hover:border-orange-500/30 hover:bg-orange-500/[0.01]" 
                    : "hover:border-orange-500/30 hover:bg-orange-50/10";
                  barClass = "via-orange-500/40";
                  chevronHoverColor = "group-hover:text-orange-500";
                } else {
                  folderColorClasses = settings.darkMode 
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.15)]" 
                    : "bg-sky-50 text-sky-700 border border-sky-200 shadow-sm";
                  cardHoverClass = settings.darkMode 
                    ? "hover:border-sky-500/30 hover:bg-sky-500/[0.01]" 
                    : "hover:border-sky-500/30 hover:bg-sky-50/10";
                  barClass = "via-sky-500/40";
                  chevronHoverColor = "group-hover:text-sky-500";
                }

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "p-6 rounded-3xl text-left border relative overflow-hidden transition-all duration-300 active:scale-[0.97] group shadow-md",
                      settings.darkMode 
                        ? "bg-[#161616] border-white/5 text-white" 
                        : "bg-white border-gray-100 text-brand-navy shadow-gray-200/30",
                      cardHoverClass
                    )}
                  >
                    {/* Tiny decorative category-colored bar at top */}
                    <div className={cn(
                      "absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      barClass
                    )} />
                    
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
                      folderColorClasses
                    )}>
                      <Folder className="w-6 h-6 text-current fill-current/15 stroke-[1.5]" />
                    </div>
                    <h3 className={cn("font-black text-sm tracking-tight", settings.darkMode ? "text-gray-100" : "text-brand-navy")}>{cat}</h3>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 font-black uppercase tracking-widest">{count} {count === 1 ? 'Banho' : 'Banhos'}</p>
                    
                    <div className={cn(
                      "absolute right-3 bottom-3 p-2 opacity-15 dark:opacity-10 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 text-gray-400 dark:text-brand-gold",
                      chevronHoverColor
                    )}>
                      <ChevronRight className="w-5 h-5 text-current" />
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setShowCategoryModal(true)}
                className={cn(
                  "p-6 rounded-3xl text-center border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-[0.97] group min-h-[140px]",
                  settings.darkMode 
                    ? "border-white/10 bg-white/5 text-gray-500 hover:border-brand-gold/30 hover:bg-white/[0.08]" 
                    : "border-gray-200 bg-gray-50/50 text-gray-400 hover:border-brand-copper/30 hover:bg-gray-100/50"
                )}
              >
                <PlusCircle className="w-8 h-8 text-gray-300 transition-transform group-hover:scale-110" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Nova Pasta</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 px-1 relative z-10">
              {filteredBaths.length > 0 ? (
                filteredBaths.map(bath => {
                  const isQuente = bath.thermalProperty === 'quente';
                  const isMorna = bath.thermalProperty === 'morna';
                  const isFria = bath.thermalProperty === 'fria';
                  
                  const thermalBorder = isQuente ? "border-l-4 border-l-red-500/80" : isMorna ? "border-l-4 border-l-amber-500/80" : "border-l-4 border-l-blue-500/80";
                  
                  return (
                    <motion.div 
                      key={bath.id} 
                      className={cn(
                        "p-6 rounded-3xl relative overflow-hidden border border-gray-100 transition-colors duration-350 shadow-md",
                        thermalBorder,
                        bath.isFavorite 
                          ? (settings.darkMode ? "bg-[#1f1715]" : "bg-brand-copper/[0.03]") 
                          : "",
                        settings.darkMode 
                          ? "bg-[#161616] border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-amber-500/20" 
                          : "bg-white text-brand-navy shadow-gray-100/40 hover:border-brand-copper/20"
                      )}
                    >
                      {/* Subtle elegant inner light glow if favorite */}
                      {bath.isFavorite && (
                        <div className="absolute right-0 top-0 w-32 h-32 bg-brand-copper/[0.04] rounded-full blur-2xl pointer-events-none" />
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4" onClick={() => setSelectedBathForDetails(bath)}>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className={cn(
                              "font-black text-brand-navy text-xl font-serif tracking-tight leading-tight hover:text-brand-copper cursor-pointer transition-colors", 
                              settings.darkMode ? "text-white dark:hover:text-brand-gold" : "text-brand-navy dark:hover:text-brand-copper"
                            )}>
                              {bath.title}
                            </h4>
                            {bath.thermalProperty && (
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 shrink-0",
                                bath.thermalProperty === 'quente' ? "bg-red-500/10 text-red-500" :
                                bath.thermalProperty === 'morna' ? "bg-amber-500/10 text-amber-500" :
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                {bath.thermalProperty === 'quente' && <Flame className="w-2.5 h-2.5 stroke-[2.5]" />}
                                {bath.thermalProperty === 'morna' && <Sun className="w-2.5 h-2.5 stroke-[2.5]" />}
                                {bath.thermalProperty === 'fria' && <Snowflake className="w-2.5 h-2.5 stroke-[2.5]" />}
                                {bath.thermalProperty}
                              </span>
                            )}
                          </div>
                        
                          {/* Preview of Herbs */}
                          <div className="mt-3 flex flex-wrap gap-1.5 line-clamp-1 pointer-events-none">
                            {bath.herbs.split('\n').slice(0, 3).map((herb, idx) => (
                              herb.trim() && (
                                <span key={idx} className="text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5">
                                  {herb.trim()}
                                </span>
                              )
                            ))}
                            {bath.herbs.split('\n').length > 3 && (
                              <span className="text-[8px] font-black text-brand-copper dark:text-brand-gold uppercase tracking-widest pt-1">
                                + {bath.herbs.split('\n').length - 3} Ervas
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => toggleFavorite(bath.id)}
                          className={cn(
                            "p-3 rounded-xl transition-all active:scale-90",
                            bath.isFavorite 
                              ? "bg-brand-red/10 text-brand-red" 
                              : (settings.darkMode ? "bg-white/5 text-gray-500 hover:text-gray-400" : "bg-gray-50 text-gray-300 hover:text-gray-400")
                          )}
                        >
                          <Heart className={cn("w-5 h-5 transition-all", bath.isFavorite ? "fill-brand-red stroke-brand-red text-white" : "text-current")} />
                        </button>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                        <button 
                          onClick={() => handleShare(bath)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-white bg-brand-navy py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-md active:scale-95 transition-all shrink-0",
                            settings.darkMode ? "bg-brand-copper hover:bg-brand-copper/90" : "bg-brand-navy hover:bg-brand-navy/95 shadow-brand-navy/10",
                            isManaging && "bg-gray-400 dark:bg-[#202020] border border-white/5 shadow-none opacity-50"
                          )}
                          disabled={isManaging}
                        >
                          <Share2 className="w-3.5 h-3.5" /> <span>Compartilhar</span>
                        </button>
                        
                        {isManaging && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditModal(bath)}
                              className={cn(
                                "p-3 rounded-xl transition-all active:scale-95 border",
                                settings.darkMode 
                                  ? "bg-white/5 border-white/10 text-brand-gold hover:bg-white/10" 
                                  : "bg-white border-gray-200 text-brand-navy hover:bg-gray-50 shadow-sm"
                              )}
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4 text-brand-copper" />
                            </button>
                            <button 
                              onClick={() => deleteBath(bath)}
                              className={cn(
                                "p-3 rounded-xl active:scale-95 transition-all border border-transparent",
                                settings.darkMode 
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                  : "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
                              )}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className={cn(
                  "p-12 rounded-3xl text-center border-2 border-dashed relative z-10",
                  settings.darkMode ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-white"
                )}>
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                    <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest italic">Nenhum banho encontrado</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : activeSubTab === 'ready' ? (
        <div className="space-y-6 relative z-10">
          <div className="px-2 mb-8 space-y-6">
            {/* Main Header with Title and Dashboard Cards */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-0.5 ml-0.5">Gestão de Estoque</p>
                <h2 className={cn(
                  "text-3xl sm:text-4xl font-black text-brand-navy font-serif tracking-tight", 
                  settings.darkMode ? "text-brand-gold" : "text-brand-navy"
                )}>
                  Banhos Prontos
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {/* Nubank Card */}
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all flex-1 min-w-[200px] shadow-sm",
                  settings.darkMode 
                    ? "bg-[#1d1226]/85 border-purple-500/20 text-white" 
                    : "bg-purple-50/50 border-purple-100/80 text-purple-950"
                )}>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20 overflow-hidden">
                    {settings.nubankLogo ? (
                      <img src={settings.nubankLogo} alt="Nubank" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-white uppercase">Nu</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">Chave PIX Nubank</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black truncate">11982350614</span>
                      <button 
                        type="button"
                        onClick={handleCopyPix}
                        className={cn(
                          "p-1.5 rounded-lg transition-all active:scale-95 shrink-0 border border-transparent",
                          copiedPix 
                            ? "bg-green-500 text-white" 
                            : (settings.darkMode 
                                ? "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300" 
                                : "bg-purple-650/10 text-purple-650 hover:bg-purple-600 hover:text-white"
                              )
                        )}
                        title="Copiar PIX"
                      >
                        {copiedPix ? <Check className="w-3 h-3 stroke-[2.5]" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Unit Cost In Header */}
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all flex-1 min-w-[140px] shadow-sm",
                  settings.darkMode 
                    ? "bg-[#181512]/85 border-brand-gold/15 text-white" 
                    : "bg-gray-50/50 border-gray-100 text-brand-navy shadow-sm"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    settings.darkMode ? "bg-brand-gold/10 text-brand-gold" : "bg-brand-navy/5 text-brand-navy"
                  )}>
                    <Droplet className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Custo Unitário</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={cn("text-[10px] font-bold", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>R$</span>
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={settings.bathPackagePrice ? settings.bathPackagePrice.toString().replace('.', ',') : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9,]/g, '').replace(',', '.');
                          setSettings({ ...settings, bathPackagePrice: val === '' ? 0 : parseFloat(val) });
                        }}
                        onFocus={(e) => e.target.select()}
                        className={cn(
                          "w-16 bg-transparent border-b border-brand-copper/20 focus:border-brand-copper outline-none text-sm font-black transition-all",
                          settings.darkMode ? "text-white focus:border-brand-gold" : "text-brand-navy"
                        )}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Replenishment Summary */}
            {(() => {
              const needsReplenishment = readyBaths.filter(rb => rb.isFixed && rb.quantity === 0);
              if (needsReplenishment.length === 0) return null;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-4 rounded-2xl border transition-all duration-500 shadow-sm",
                    settings.darkMode 
                      ? "bg-red-500/10 border-red-500/20" 
                      : "bg-red-50/50 border-red-100"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 shadow-sm flex items-center justify-center shrink-0 text-red-500">
                      <AlertCircle className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 truncate", settings.darkMode ? "text-red-400" : "text-red-600")}>
                        Reposição Necessária
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {needsReplenishment.map(rb => (
                          <div 
                            key={rb.id}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black tracking-tight border flex items-center gap-2 whitespace-nowrap shadow-sm",
                              settings.darkMode 
                                ? "bg-black/30 border-red-500/20 text-red-400" 
                                : "bg-white border-red-100 text-red-500 hover:scale-102 transition-transform"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="truncate">{rb.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {/* Search and Filters with Manage and Add Buttons */}
          <div className="space-y-4 px-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <Search className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar banho..."
                  value={readySearch}
                  onChange={(e) => setReadySearch(e.target.value)}
                  className={cn(
                    "w-full h-12 rounded-2xl pl-12 pr-6 outline-none text-sm transition-all shadow-sm border",
                    settings.darkMode 
                      ? "bg-[#161616] border-white/5 text-white placeholder-gray-500 focus:border-brand-gold/40 focus:ring-1 focus:ring-brand-gold/40" 
                      : "bg-white border-gray-100 text-brand-navy placeholder-gray-400 focus:border-brand-copper/30 shadow-gray-200/20"
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsManaging(!isManaging)}
                  className={cn(
                    "w-12 h-12 rounded-2xl transition-all border flex items-center justify-center shrink-0 active:scale-95 shadow-sm",
                    isManaging 
                      ? "bg-brand-gold border-brand-gold text-brand-navy shadow-[0_0_12px_rgba(212,175,55,0.3)]" 
                      : (settings.darkMode ? "bg-[#161616] border-white/5 text-brand-gold hover:bg-white/5" : "bg-white border-gray-100 text-brand-copper hover:bg-gray-50")
                  )}
                  title={isManaging ? "Concluir" : "Gerenciar"}
                >
                  {isManaging ? (
                    <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Pencil className="w-5 h-5" />
                  )}
                </button>

                <button 
                  onClick={() => {
                    setEditingReadyBath(null);
                    setReadyForm({ title: '', quantity: 1, category: selectedReadyCategory || 'Gerais', notes: '' });
                    setShowReadyModal(true);
                  }}
                  className={cn(
                    "w-12 h-12 text-white rounded-2xl shadow-lg flex items-center justify-center active:scale-95 transition-all shrink-0 hover:opacity-95",
                    settings.darkMode 
                      ? "bg-brand-gold text-brand-navy shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_20px_rgba(212,175,55,0.35)]" 
                      : "bg-brand-navy hover:bg-brand-navy/95"
                  )}
                  title="Adicionar Banho"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide select-none">
              <button
                onClick={() => setSelectedReadyCategory(null)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap shadow-sm duration-300",
                  selectedReadyCategory === null
                    ? (settings.darkMode 
                        ? "bg-[#d4af37] border-[#d4af37] text-[#0f0a05] shadow-[0_3px_15px_rgba(212,175,55,0.3)]" 
                        : "bg-brand-navy border-brand-navy text-white shadow-[0_3px_12px_rgba(0,31,63,0.2)]")
                    : (settings.darkMode 
                        ? "bg-[#1a1a1a]/40 border-white/5 text-gray-400 hover:bg-[#252525]/60 hover:text-white" 
                        : "bg-white border-gray-150 text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                )}
              >
                Todos
              </button>
              {[...bathCategories, 'Outros'].map(cat => {
                const isSelected = selectedReadyCategory === cat;
                const catLower = cat.toLowerCase();
                let activeStyles = "";
                
                if (isSelected) {
                  if (catLower.includes('orixá')) {
                    activeStyles = settings.darkMode 
                      ? "bg-emerald-500/25 border-emerald-500/60 text-emerald-300 shadow-[0_3px_15px_rgba(16,185,129,0.3)]" 
                      : "bg-emerald-600 border-emerald-600 text-white shadow-[0_3px_12px_rgba(5,150,105,0.2)]";
                  } else if (catLower.includes('entidade')) {
                    activeStyles = settings.darkMode 
                      ? "bg-rose-500/25 border-rose-500/60 text-rose-300 shadow-[0_3px_15px_rgba(244,63,94,0.3)]" 
                      : "bg-rose-600 border-rose-600 text-white shadow-[0_3px_12px_rgba(225,29,72,0.2)]";
                  } else if (catLower.includes('geral') || catLower.includes('gerais')) {
                    activeStyles = settings.darkMode 
                      ? "bg-orange-500/25 border-orange-500/60 text-orange-300 shadow-[0_3px_15px_rgba(249,115,22,0.3)]" 
                      : "bg-orange-600 border-orange-600 text-white shadow-[0_3px_12px_rgba(234,88,12,0.25)]";
                  } else {
                    // default/Outros
                    activeStyles = settings.darkMode 
                      ? "bg-sky-500/25 border-sky-500/60 text-sky-300 shadow-[0_3px_15px_rgba(14,165,233,0.3)]" 
                      : "bg-sky-600 border-sky-600 text-white shadow-[0_3px_12px_rgba(3,105,161,0.2)]";
                  }
                }

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedReadyCategory(cat)}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap shadow-sm duration-300",
                      isSelected
                        ? activeStyles
                        : (settings.darkMode 
                            ? "bg-[#1a1a1a]/40 border-white/5 text-gray-400 hover:bg-[#252525]/60 hover:text-white" 
                            : "bg-white border-gray-150 text-gray-500 hover:bg-gray-50 hover:text-gray-900")
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ready Baths List */}
          <div className="grid gap-4">
            {filteredReadyBaths.map((rb) => {
              const statusBorder = rb.quantity > 0 ? "border-l-4 border-l-green-500/80" : "border-l-4 border-l-red-500/80";
              const isOutOfStockFixed = rb.isFixed && rb.quantity === 0;
              return (
                <motion.div
                  key={rb.id}
                  className={cn(
                    "p-6 rounded-3xl relative overflow-hidden border flex flex-col gap-4 group transition-colors duration-300 shadow-md",
                    statusBorder,
                    settings.darkMode 
                      ? "bg-[#161616] border-brand-gold/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                      : "bg-white border-brand-copper/25 shadow-gray-200/20",
                    isOutOfStockFixed && (settings.darkMode ? "bg-gradient-to-br from-red-950/15 to-[#161616] border-red-500/20" : "bg-red-50/15 border-red-200")
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setEditingReadyBath(rb);
                        setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                        setShowReadyModal(true);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={cn(
                          "font-sans font-bold text-base sm:text-lg tracking-tight leading-snug group-hover:text-brand-copper transition-colors", 
                          settings.darkMode ? "text-white group-hover:text-brand-gold" : "text-brand-navy group-hover:text-brand-copper"
                        )}>
                          {rb.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                          (() => {
                            const cat = (rb.category || 'Gerais').toLowerCase();
                            if (cat.includes('orixá')) {
                              return settings.darkMode 
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                                : "bg-emerald-50 text-emerald-800 border-emerald-200";
                            }
                            if (cat.includes('entidade')) {
                              return settings.darkMode 
                                ? "bg-rose-500/10 text-rose-300 border-rose-500/25" 
                                : "bg-rose-50 text-rose-800 border-rose-200";
                            }
                            if (cat.includes('geral') || cat.includes('gerais')) {
                              return settings.darkMode 
                                ? "bg-orange-500/10 text-orange-400 border-orange-500/20" 
                                : "bg-orange-50 text-orange-800 border-orange-200";
                            }
                            // Default / Outros
                            return settings.darkMode 
                              ? "bg-sky-500/10 text-sky-300 border-sky-500/20" 
                              : "bg-sky-50 text-sky-800 border-sky-205";
                          })()
                        )}>
                          {rb.category || 'Gerais'}
                        </span>
                        {rb.isFixed && (
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
                            rb.quantity === 0 ? "bg-red-500/10 text-red-400" : "bg-brand-gold/10 text-brand-gold"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", rb.quantity === 0 ? "bg-red-500 animate-pulse" : "bg-brand-gold")} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Produto Fixo</span>
                          </div>
                        )}
                      </div>
                      {rb.notes && (
                        <div className={cn(
                          "mt-3 p-3 rounded-xl border italic text-[10px] leading-relaxed text-gray-400/90",
                          settings.darkMode ? "bg-black/20 border-white/5" : "bg-gray-50/50 border-gray-100"
                        )}>
                          {rb.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <div className={cn(
                        "flex items-center gap-1.5 p-1 rounded-2xl border",
                        settings.darkMode ? "bg-black/40 border-white/15" : "bg-gray-100/60 border-gray-200/50"
                      )}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustReadyQuantity(rb.id, -1);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90",
                            settings.darkMode 
                              ? "bg-[#202020] text-brand-gold border border-white/5 hover:bg-[#282828]" 
                              : "bg-white text-brand-navy border border-gray-100 hover:bg-gray-50",
                            rb.quantity === 0 && "opacity-30 cursor-not-allowed"
                          )}
                          disabled={rb.quantity === 0}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                        
                        <div className="min-w-[28px] text-center">
                          <motion.span 
                            key={rb.quantity}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              "text-sm font-black tabular-nums",
                              rb.quantity === 0 ? "text-gray-400" : (settings.darkMode ? "text-[#dcae1d]" : "text-brand-navy")
                            )}
                          >
                            {rb.quantity}
                          </motion.span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustReadyQuantity(rb.id, 1);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90",
                            settings.darkMode 
                              ? "bg-[#202020] text-brand-gold border border-white/5 hover:bg-[#282828]" 
                              : "bg-white text-brand-navy border border-gray-100 hover:bg-gray-50"
                          )}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                        </button>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-[0.15em] text-gray-400">Em Estoque</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        rb.quantity > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {rb.quantity > 0 ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        rb.quantity > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {rb.quantity > 0 ? 'Disponível' : (rb.isFixed ? 'Reposição Necessária' : 'Esgotado')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isManaging && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingReadyBath(rb);
                              setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                              setShowReadyModal(true);
                            }}
                            className={cn(
                              "p-2.5 rounded-xl transition-all active:scale-95 border",
                              settings.darkMode 
                                ? "bg-[#161616] border-white/10 text-brand-gold hover:bg-white/10" 
                                : "bg-white border-gray-200 text-brand-navy hover:bg-gray-50 shadow-sm"
                            )}
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5 text-brand-copper" />
                          </button>
                          {!rb.isFixed && (
                            <button 
                              onClick={() => deleteReadyBath(rb)}
                              className={cn(
                                "p-2.5 rounded-xl active:scale-[0.93] transition-all border border-transparent",
                                settings.darkMode 
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
                                  : "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm"
                              )}
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {readyBaths.length === 0 && (
            <div className={cn(
              "p-12 rounded-[40px] text-center border-2 border-dashed",
              settings.darkMode ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-white"
            )}>
              <p className="text-gray-400 text-sm italic">Nenhum banho pronto registrado.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          <div className="flex items-center justify-between gap-4 mb-2 px-2">
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-0.5 ml-0.5">Estoque Geral</p>
              <h2 className={cn(
                "text-3xl sm:text-4xl font-black text-brand-navy font-serif tracking-tight", 
                settings.darkMode ? "text-brand-gold" : "text-brand-navy"
              )}>
                Estoque de Ervas
              </h2>
            </div>
            <button 
              onClick={() => setShowHerbModal(true)}
              className={cn(
                "w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform",
                settings.darkMode ? "bg-brand-copper" : "bg-brand-navy"
              )}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="relative px-2">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
              <Search className="text-gray-400 dark:text-gray-500 w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar no meu estoque..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className={cn(
                "w-full rounded-2xl py-3.5 pl-12 pr-6 outline-none text-sm transition-all shadow-sm border",
                settings.darkMode 
                  ? "bg-[#161616] border-white/5 text-white placeholder-gray-500 focus:border-brand-gold/40 focus:ring-1 focus:ring-brand-gold/40" 
                  : "bg-white border-gray-100 text-brand-navy placeholder-gray-400 focus:border-brand-copper/30 shadow-gray-200/20"
              )}
            />
          </div>

          <div className="grid gap-3 px-2">
            {herbStock
              .filter(h => h.name.toLowerCase().includes(stockSearch.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((herb) => {
                const classificationColors = 
                  herb.classification === 'quente' ? (settings.darkMode ? "bg-red-500/10 text-red-400 border border-red-500/15" : "bg-red-50 text-red-650 border border-red-100") :
                  herb.classification === 'morna' ? (settings.darkMode ? "bg-amber-500/10 text-amber-400 border border-amber-500/15" : "bg-amber-50 text-amber-700 border border-amber-100") :
                  (settings.darkMode ? "bg-blue-500/10 text-blue-400 border border-blue-500/15" : "bg-blue-50 text-blue-600 border border-blue-105");

                const classificationName = herb.classification ? herb.classification.charAt(0).toUpperCase() + herb.classification.slice(1) : "";

                return (
                  <motion.div
                    key={herb.id}
                    className={cn(
                      "p-5 rounded-2xl border flex items-center justify-between transition-colors duration-200 shadow-sm",
                      settings.darkMode 
                        ? "bg-[#161616] border-white/5 hover:border-amber-500/10" 
                        : "bg-white border-gray-100/80 hover:border-brand-copper/15",
                      !herb.inStock && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button 
                        type="button"
                        onClick={() => toggleHerbInStock(herb.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 active:scale-95",
                          herb.inStock 
                            ? "bg-brand-copper border-brand-copper text-white" 
                            : "border-gray-200 dark:border-white/10 dark:hover:border-white/20"
                        )}
                      >
                        {herb.inStock && <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />}
                      </button>
                      
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "font-black text-base tracking-tight leading-tight",
                          settings.darkMode ? "text-white" : "text-brand-navy",
                          !herb.inStock && "line-through text-gray-400 dark:text-gray-500"
                        )}>
                          {herb.name}
                        </span>
                        
                        {herb.classification && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1",
                              classificationColors
                            )}>
                              {herb.classification === 'quente' && <Flame className="w-2.5 h-2.5" />}
                              {herb.classification === 'morna' && <Sun className="w-2.5 h-2.5" />}
                              {herb.classification === 'fria' && <Snowflake className="w-2.5 h-2.5" />}
                              {classificationName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                        herb.inStock 
                          ? (settings.darkMode ? "bg-green-500/10 border-green-500/15 text-green-400" : "bg-green-50 border-green-100 text-green-600") 
                          : (settings.darkMode ? "bg-red-500/10 border-red-500/15 text-red-400" : "bg-red-50 border-red-100 text-red-650")
                      )}>
                        {herb.inStock ? 'Tenho' : 'Acabou'}
                      </span>
                      <button 
                        onClick={() => removeHerbFromStock(herb)}
                        className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

            {herbStock.length === 0 && (
              <div className={cn(
                "p-12 rounded-[32px] text-center border-2 border-dashed relative z-10",
                settings.darkMode ? "border-white/5 bg-white/[0.01]" : "border-gray-100 bg-white"
              )}>
                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                  <Leaf className="w-7 h-7 text-brand-gold animate-bounce" />
                </div>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest italic mb-2">O seu estoque está vazio.</p>
                <button 
                  onClick={() => setShowHerbModal(true)}
                  className="text-brand-copper dark:text-brand-gold font-black text-xs uppercase tracking-widest hover:underline"
                >
                  Adicionar primeira erva
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

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
                <div className="flex flex-col gap-1 pr-8">
                  <h3 className={cn(
                    "text-xl font-black",
                    settings.darkMode ? "text-white" : "text-brand-navy"
                  )}>{selectedBathForDetails.title}</h3>
                  {selectedBathForDetails.thermalProperty && (
                    <div className="flex">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1.5",
                        selectedBathForDetails.thermalProperty === 'quente' ? "bg-red-500/10 text-red-500" :
                        selectedBathForDetails.thermalProperty === 'morna' ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {selectedBathForDetails.thermalProperty === 'quente' && <Flame className="w-3 h-3" />}
                        {selectedBathForDetails.thermalProperty === 'morna' && <Sun className="w-3 h-3" />}
                        {selectedBathForDetails.thermalProperty === 'fria' && <Snowflake className="w-3 h-3" />}
                        Classificação: {selectedBathForDetails.thermalProperty}
                      </span>
                    </div>
                  )}
                </div>
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
                    <div className="space-y-2 text-wrap break-words">
                      {selectedBathForDetails.herbs.split('\n').filter(line => line.trim()).map((herb, idx) => {
                        const normalized = herb.toLowerCase().trim();
                        const found = herbStock.find(s => s.name.toLowerCase().trim() === normalized || 
                          (s.name.includes('(') && s.name.toLowerCase().includes(normalized))
                        );
                        const status = found ? (found.inStock ? 'yes' : 'no') : 'none';

                        return (
                          <motion.div 
                           initial={{ x: -10, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: idx * 0.05 }}
                           key={idx} 
                           className={cn(
                             "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                             status === 'yes' && (settings.darkMode ? "bg-green-500/10 border-green-500/30" : "bg-green-50 border-green-100"),
                             status === 'no' && (settings.darkMode ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-100"),
                             status === 'none' && (settings.darkMode ? "bg-white/10 border-white/10" : "bg-gray-50 border-gray-200")
                           )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              status === 'yes' ? "bg-green-500" : (status === 'no' ? "bg-red-500" : "bg-brand-copper/40")
                            )} />
                            <span className={cn(
                              "text-sm font-bold flex-1",
                              settings.darkMode ? "text-white" : "text-gray-900",
                              status === 'no' && "opacity-60"
                            )}>{herb}</span>
                            
                            {status !== 'none' && (
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                status === 'yes' 
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                                  : "bg-red-500/20 text-red-600 dark:text-red-400"
                              )}>
                                {status === 'yes' ? 'Em Estoque' : 'Esgotado'}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
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

                {/* Status Summary Section */}
                <div className="pt-4 border-t dark:border-white/10">
                  <p className="text-[10px] font-black uppercase text-brand-navy dark:text-white/60 tracking-[0.2em] mb-4">Resumo do Inventário</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {(() => {
                      const bathHerbs = selectedBathForDetails.herbs.split('\n').filter(line => line.trim());
                      const available = bathHerbs.filter(herb => {
                        const normalized = herb.toLowerCase().trim();
                        const found = herbStock.find(s => s.name.toLowerCase().trim() === normalized || 
                          (s.name.includes('(') && s.name.toLowerCase().includes(normalized))
                        );
                        return found && found.inStock;
                      });
                      
                      const unavailable = bathHerbs.filter(herb => {
                        const normalized = herb.toLowerCase().trim();
                        const found = herbStock.find(s => s.name.toLowerCase().trim() === normalized || 
                          (s.name.includes('(') && s.name.toLowerCase().includes(normalized))
                        );
                        return !found || !found.inStock;
                      });

                      return (
                        <>
                          {available.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400">Tenho em casa ({available.length})</span>
                              </div>
                              <p className={cn("text-xs font-medium pl-3.5", settings.darkMode ? "text-white/60" : "text-brand-navy/60")}>
                                {available.join(', ')}
                              </p>
                            </div>
                          )}

                          {unavailable.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">Não possuo / Providenciar ({unavailable.length})</span>
                              </div>
                              <p className={cn("text-xs font-medium pl-3.5 italic", settings.darkMode ? "text-white/60" : "text-brand-navy/60")}>
                                {unavailable.join(', ')}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
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

      {showRoutineModal && typeof document === 'function' && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[95] flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4 bg-black/20 backdrop-blur-xl pointer-events-auto"
          onClick={() => setShowRoutineModal(false)}
        >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
              className={cn(
                "w-full max-w-lg h-[75vh] sm:h-[80vh] flex flex-col rounded-[36px] overflow-hidden shadow-2xl relative border z-50",
                settings.darkMode 
                  ? "bg-[#141414] text-white border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.8)]" 
                  : "bg-[#f8f9fa] text-slate-900 border-white/40 shadow-[0_24px_50px_rgba(15,23,42,0.1)]"
              )}
            >
              {/* Spiritual top elegant ambient aura */}
              <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-brand-copper/10 via-brand-copper/0 to-transparent pointer-events-none" />
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-brand-gold/[0.04] dark:bg-brand-gold/[0.06] rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="p-6 sm:p-8 flex items-center justify-between border-b shrink-0 relative z-30" style={{ borderColor: settings.darkMode ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.15)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 dark:bg-brand-gold/15 text-brand-gold flex items-center justify-center shadow-[inset_0_0_15px_rgba(212,175,55,0.3)] border border-brand-gold/40 shrink-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <CalendarClock className="w-6 h-6 text-brand-gold drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)] stroke-[2.5]" />
                  </div>
                  <div className="pt-1">
                    <h3 className={cn("text-xl sm:text-2xl font-serif font-bold tracking-tight flex items-center gap-3 drop-shadow-sm", settings.darkMode ? "text-brand-gold" : "text-brand-navy")}>
                       Semana de Gira
                    </h3>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowRoutineModal(false)}
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 z-50 shrink-0 ml-4 group overflow-hidden shadow-md",
                    "bg-gradient-to-br from-red-400 to-red-600 border-2 border-white/20 dark:border-red-400/30 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                  )}
                  aria-label="Fechar"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <div className="absolute inset-[1px] rounded-full border border-white/20 dark:border-white/10 pointer-events-none" />
                  <X className="w-5 h-5 stroke-[2.5] text-white relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110" />
                </motion.button>
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar relative z-20 space-y-4 pb-8">
                {[
                  { 
                    shortDay: ['SEG', 'TER', 'QUA'], 
                    bath: 'Banho de descarrego', 
                    id: 'b1', 
                    hoverColor: settings.darkMode ? "group-hover:text-[#d4af37]" : "group-hover:text-brand-navy",
                    hoverBorder: settings.darkMode ? "hover:border-[#d4af37]/35 shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "hover:border-brand-navy/30",
                    theme: 'navy'
                  },
                  { 
                    shortDay: 'QUIN', 
                    bath: 'Banho de desenvolvimento', 
                    id: 'b2', 
                    hoverColor: settings.darkMode ? "group-hover:text-white" : "group-hover:text-brand-gold",
                    hoverBorder: settings.darkMode ? "hover:border-brand-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "hover:border-brand-gold/50",
                    theme: 'gold'
                  },
                  { 
                    shortDay: 'SEX', 
                    bath: 'Banho energizador', 
                    id: 'b4', 
                    hoverColor: settings.darkMode ? "group-hover:text-[#d4af37]" : "group-hover:text-brand-navy",
                    hoverBorder: settings.darkMode ? "hover:border-[#d4af37]/35 shadow-[0_0_15px_rgba(212,175,55,0.1)]" : "hover:border-brand-navy/30",
                    theme: 'navy'
                  },
                  { 
                    shortDay: 'SAB', 
                    bath: 'Banho da Gira', 
                    id: undefined, 
                    hoverColor: settings.darkMode ? "group-hover:text-white" : "group-hover:text-brand-gold",
                    hoverBorder: settings.darkMode ? "hover:border-brand-gold/30" : "hover:border-brand-gold/50",
                    theme: 'gold'
                  },
                ].map((item, idx) => {
                  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon, etc.
                  
                  const isToday = (() => {
                    if (Array.isArray(item.shortDay)) {
                      const dayIndices: Record<string, number> = { 'SEG': 1, 'TER': 2, 'QUA': 3 };
                      return item.shortDay.some(d => dayIndices[d] === currentDayIndex);
                    } else {
                      const dayIndices: Record<string, number> = { 'QUIN': 4, 'SEX': 5, 'SAB': 6, 'DOM': 0 };
                      return dayIndices[item.shortDay] === currentDayIndex;
                    }
                  })();

                  // Find inventory item
                  const readyItem = readyBaths.find(r => 
                    r.title.toLowerCase().trim() === item.bath.toLowerCase().trim()
                  ) || readyBaths.find(r => 
                    r.title.toLowerCase().includes(item.bath.toLowerCase()) || 
                    item.bath.toLowerCase().includes(r.title.toLowerCase())
                  );

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, duration: 0.35, ease: "easeOut" }}
                      onClick={() => {
                        if (item.id) {
                          const bath = baths.find(b => b.id === item.id);
                          if (bath) {
                            setSelectedBathForDetails(bath);
                            setShowRoutineModal(false);
                          }
                        }
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-[24px] border transition-all duration-300 relative overflow-hidden group select-none",
                        !settings.darkMode && item.theme === 'navy' && "bg-gradient-to-r from-slate-50 to-slate-100/50 border-slate-200/60",
                        !settings.darkMode && item.theme === 'gold' && "bg-gradient-to-r from-amber-50/40 to-amber-100/10 border-amber-200/40",
                        item.id && "cursor-pointer active:scale-[0.98]",
                        settings.darkMode && "bg-[#1f1f21] border-[#29292c]",
                        isToday && (
                          settings.darkMode 
                            ? "border-[#d4af37]/60 bg-[#1e1c18] shadow-[0_0_20px_rgba(212,175,55,0.12)]" 
                            : "border-brand-copper/50 bg-[#fffcf5] shadow-[0_4px_20px_rgba(184,115,51,0.08)]"
                        ),
                        item.id && item.hoverBorder
                      )}
                    >
                      {/* Decorative inner glow for active row */}
                      {isToday && (
                        <div className={cn(
                          "absolute top-0 left-0 w-1.5 h-full",
                          settings.darkMode ? "bg-[#d4af37]" : "bg-brand-copper"
                        )} />
                      )}

                      {/* Day Bubble */}
                      <div className={cn(
                        "rounded-xl flex items-center justify-center shrink-0 transition-transform overflow-hidden relative",
                        Array.isArray(item.shortDay) ? "w-11 py-2 flex-col gap-1" : "w-11 h-11",
                        item.theme === 'navy' && (settings.darkMode ? "bg-[#18293e] text-[#9bc1e8] border border-[#233d5d]" : "bg-gradient-to-br from-[#0B1E36] to-[#1a365d] text-white shadow-sm"),
                        item.theme === 'gold' && (settings.darkMode ? "bg-[#2d2212] text-[#e8c67d] border border-[#48371c]" : "bg-gradient-to-br from-[#ae8624] to-[#cfa135] text-white shadow-sm"),
                        isToday && "scale-105"
                      )}>
                        {Array.isArray(item.shortDay) ? (
                          item.shortDay.map((day, dIdx) => (
                            <span key={dIdx} className="relative z-15 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest text-center leading-none">{day}</span>
                          ))
                        ) : (
                          <span className="relative z-15 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest text-center leading-none">{item.shortDay}</span>
                        )}
                        {!settings.darkMode && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-40"></div>}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "text-sm sm:text-[14px] font-extrabold uppercase tracking-wide transition-colors leading-tight",
                            item.id && item.hoverColor,
                            settings.darkMode ? "text-white" : "text-brand-navy"
                          )}>
                            {item.bath}
                          </p>
                          {isToday && (
                            <span className={cn(
                              "text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shrink-0",
                              settings.darkMode ? "bg-amber-500/20 text-brand-gold border border-brand-gold/30" : "bg-amber-100 text-amber-800 border border-amber-300"
                            )}>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              Hoje
                            </span>
                          )}
                        </div>

                        {/* Dynamic Stock Indicator */}
                        <div className="flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-widest select-none pt-0.5">
                          {readyItem ? (
                            readyItem.quantity > 0 ? (
                              <span className="text-[#34d399]/90 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                                {readyItem.quantity} {readyItem.quantity === 1 ? 'Pacotinho' : 'Pacotinhos'} em Estoque
                              </span>
                            ) : (
                              <span className="text-[#f87171] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                                Reposição Necessária
                              </span>
                            )
                          ) : (
                            <span className={cn(
                              settings.darkMode ? "text-[#bfa030]/80" : "text-brand-copper/80",
                              "flex items-center gap-1"
                            )}>
                              Consagrado no Terreiro
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.id ? (
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                          "text-gray-400 group-hover:translate-x-1 cursor-pointer",
                          settings.darkMode 
                            ? "bg-white/[0.04] group-hover:bg-[#d4af37]/20 group-hover:text-[#d4af37]" 
                            : "bg-slate-100 group-hover:bg-brand-navy/10 group-hover:text-brand-navy"
                        )}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 text-amber-500/30">
                          <CheckCircle2 className="w-4.5 h-4.5 stroke-[1.5]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>,
          document.getElementById('app-frame') || document.body
        )}

        {showHerbModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={() => {
              setShowHerbModal(false);
              setHerbSearch('');
              setCustomHerbName('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative flex flex-col max-h-[80vh]",
                settings.darkMode && "bg-[#1A1A1A] text-white border border-white/10"
              )}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Adicionar Material</h3>
                <button onClick={() => setShowHerbModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  placeholder="Pesquisar erva ou material..."
                  value={herbSearch}
                  onChange={(e) => setHerbSearch(e.target.value)}
                  className={cn(
                    "w-full bg-gray-50 border-none rounded-xl p-3 pl-10 focus:ring-2 focus:ring-brand-copper outline-none text-sm",
                    settings.darkMode && "bg-black/40 text-white"
                  )}
                />
              </div>

              <div className="flex-1 overflow-y-auto mb-4 space-y-1 custom-scrollbar">
                {SUGGESTED_HERBS
                  .filter(h => h.name.toLowerCase().includes(herbSearch.toLowerCase()))
                  .map((herb) => {
                    const isAdded = herbStock.some(s => s.name === herb.name);
                    return (
                      <button
                        key={herb.name}
                        onClick={() => !isAdded && addHerbToStock(herb.name, herb.classification)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group",
                          isAdded 
                            ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/5" 
                            : "hover:bg-brand-copper hover:text-white"
                        )}
                        disabled={isAdded}
                      >
                        <div className="flex flex-col">
                          <span>{herb.name}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest flex items-center gap-1",
                            herb.classification === 'quente' ? "text-red-500 group-hover:text-white" :
                            herb.classification === 'morna' ? "text-amber-500 group-hover:text-white" :
                            "text-blue-500 group-hover:text-white"
                          )}>
                            {herb.classification === 'quente' && <Flame className="w-2 h-2" />}
                            {herb.classification === 'morna' && <Sun className="w-2 h-2" />}
                            {herb.classification === 'fria' && <Snowflake className="w-2 h-2" />}
                            {herb.classification}
                          </span>
                        </div>
                        {isAdded && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    );
                  })}
              </div>

              <div className="pt-4 border-t dark:border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-2">Outro material</p>
                <div className="flex gap-2">
                  <input
                    placeholder="Nome do material..."
                    value={customHerbName}
                    onChange={(e) => setCustomHerbName(e.target.value)}
                    className={cn(
                      "flex-1 bg-gray-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-brand-copper outline-none text-sm",
                      settings.darkMode && "bg-black/40 text-white"
                    )}
                    onKeyDown={(e) => e.key === 'Enter' && customHerbName && addHerbToStock(customHerbName)}
                  />
                  <button
                    onClick={() => customHerbName && addHerbToStock(customHerbName)}
                    className="bg-brand-navy text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
                  >
                    Add
                  </button>
                </div>
              </div>
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
                "bg-white w-full max-w-sm rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-gray-150/50",
                settings.darkMode && "bg-gradient-to-b from-[#1C1C1E] to-[#141416] text-white border-white/5"
              )}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={cn(
                "text-xl sm:text-2xl font-black font-serif tracking-tight mb-6",
                settings.darkMode ? "text-white" : "text-brand-navy"
              )}>
                {editingReadyBath ? 'Editar Banho' : 'Novo Banho'}
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Categoria / Pasta
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide select-none">
                    {[...bathCategories, 'Outros'].map(cat => {
                      const isSelected = readyForm.category === cat;
                      const catLower = cat.toLowerCase();
                      let buttonClass: string;
                      
                      if (isSelected) {
                        if (catLower.includes('orixá')) {
                          buttonClass = settings.darkMode 
                            ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]" 
                            : "bg-emerald-100/80 border-emerald-500 text-emerald-950 font-extrabold";
                        } else if (catLower.includes('entidade')) {
                          buttonClass = settings.darkMode 
                            ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]" 
                            : "bg-rose-100/80 border-rose-500 text-rose-950 font-extrabold";
                        } else if (catLower.includes('geral') || catLower.includes('gerais')) {
                          buttonClass = settings.darkMode 
                            ? "bg-orange-500/20 border-orange-500/60 text-orange-350 shadow-[0_0_12px_rgba(249,115,22,0.25)]" 
                            : "bg-orange-100/80 border-orange-500 text-orange-950 font-extrabold";
                        } else {
                          buttonClass = settings.darkMode 
                            ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.25)]" 
                            : "bg-sky-100/80 border-sky-500 text-sky-950 font-extrabold";
                        }
                      } else {
                        buttonClass = settings.darkMode 
                          ? "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                      }

                      return (
                        <button
                          key={cat}
                          onClick={() => setReadyForm({...readyForm, category: cat})}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap duration-200",
                            buttonClass
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Nome do Banho
                  </p>
                  <input
                    placeholder="Ex: Banho de Gira"
                    value={readyForm.title}
                    onChange={(e) => setReadyForm({...readyForm, title: e.target.value})}
                    disabled={editingReadyBath?.isFixed}
                    className={cn(
                      "w-full rounded-2xl p-4 outline-none border transition-all duration-200 text-sm",
                      settings.darkMode 
                        ? "bg-black/30 border-white/15 text-white placeholder-gray-500 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 focus:bg-black/50" 
                        : "bg-gray-50/50 border-gray-200 text-brand-navy placeholder-gray-400 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper focus:bg-white",
                      editingReadyBath?.isFixed && "opacity-50 cursor-not-allowed"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Quantidade (Pacotinhos)
                  </p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setReadyForm({...readyForm, quantity: Math.max(0, readyForm.quantity - 1)})}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-xl border font-bold text-lg active:scale-90 transition-all duration-200",
                        settings.darkMode 
                          ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20" 
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center select-none">
                      <span className={cn(
                        "text-2xl font-black font-mono tracking-tight",
                        settings.darkMode ? "text-brand-gold" : "text-brand-navy"
                      )}>
                        {readyForm.quantity}
                      </span>
                    </div>
                    <button 
                      onClick={() => setReadyForm({...readyForm, quantity: readyForm.quantity + 1})}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-xl border font-bold text-lg active:scale-90 transition-all duration-200",
                        settings.darkMode 
                          ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20" 
                          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Anotações / Ervas
                  </p>
                  <textarea
                    placeholder="Adicione observações sobre este banho..."
                    rows={3}
                    value={readyForm.notes}
                    onChange={(e) => setReadyForm({...readyForm, notes: e.target.value})}
                    className={cn(
                      "w-full rounded-2xl p-4 outline-none resize-none text-sm transition-all duration-200 border",
                      settings.darkMode 
                        ? "bg-black/30 border-white/15 text-white placeholder-gray-500 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 focus:bg-black/50" 
                        : "bg-gray-50/50 border-gray-200 text-brand-navy placeholder-gray-400 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper focus:bg-white"
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowReadyModal(false)}
                    className={cn(
                      "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                      settings.darkMode 
                        ? "bg-[#252528] hover:bg-[#2F2F33] text-gray-300 border border-white/5" 
                        : "bg-gray-100 hover:bg-gray-150 text-gray-600 border border-gray-205"
                    )}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveReadyBath}
                    className={cn(
                      "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                      settings.darkMode 
                        ? "bg-gradient-to-r from-[#d4af37] to-[#bfa030] hover:from-[#e5c147] hover:to-[#d4af37] text-brand-navy shadow-[0_4px_15px_rgba(212,175,55,0.25)]" 
                        : "bg-brand-navy hover:bg-brand-navy/95 text-white shadow-[0_4px_15px_rgba(0,31,63,0.15)]"
                    )}
                  >
                    {editingReadyBath ? 'Confirmar' : 'Criar Banho'}
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
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-lg rounded-[32px] p-6 sm:p-8 shadow-2xl relative border border-gray-150/50 max-h-[90vh] overflow-y-auto custom-scrollbar",
                settings.darkMode && "bg-gradient-to-b from-[#1C1C1E] to-[#141416] text-white border-white/5"
              )}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={cn(
                "text-xl sm:text-2xl font-black font-serif tracking-tight mb-6",
                settings.darkMode ? "text-white" : "text-brand-navy"
              )}>
                {editingId ? 'Editar Composição' : 'Nova Composição'}
              </h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Pasta
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide select-none">
                    {bathCategories.map(cat => {
                      const isSelected = newBath.category === cat;
                      const catLower = cat.toLowerCase();
                      let buttonClass: string;
                      
                      if (isSelected) {
                        if (catLower.includes('orixá')) {
                          buttonClass = settings.darkMode 
                            ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]" 
                            : "bg-emerald-100/80 border-emerald-500 text-emerald-950 font-extrabold";
                        } else if (catLower.includes('entidade')) {
                          buttonClass = settings.darkMode 
                            ? "bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]" 
                            : "bg-rose-100/80 border-rose-500 text-rose-950 font-extrabold";
                        } else if (catLower.includes('geral') || catLower.includes('gerais')) {
                          buttonClass = settings.darkMode 
                            ? "bg-orange-500/20 border-orange-500/60 text-orange-350 shadow-[0_0_12px_rgba(249,115,22,0.25)]" 
                            : "bg-orange-100/80 border-orange-500 text-orange-950 font-extrabold";
                        } else {
                          buttonClass = settings.darkMode 
                            ? "bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.25)]" 
                            : "bg-sky-100/80 border-sky-500 text-sky-950 font-extrabold";
                        }
                      } else {
                        buttonClass = settings.darkMode 
                          ? "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                      }

                      return (
                        <button
                          key={cat}
                          onClick={() => setNewBath({...newBath, category: cat})}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap duration-200",
                            buttonClass
                          )}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Propriedade Térmica
                  </p>
                  <div className="flex gap-2">
                    {(['quente', 'morna', 'fria'] as const).map(prop => {
                      const isSelected = newBath.thermalProperty === prop;
                      let buttonStyleClass: string;
                      
                      if (isSelected) {
                        if (prop === 'quente') {
                          buttonStyleClass = settings.darkMode 
                            ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]" 
                            : "bg-red-50 border-red-500 text-red-900 font-extrabold";
                        } else if (prop === 'morna') {
                          buttonStyleClass = settings.darkMode 
                            ? "bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]" 
                            : "bg-amber-50 border-amber-500 text-amber-900 font-extrabold";
                        } else {
                          buttonStyleClass = settings.darkMode 
                            ? "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.25)]" 
                            : "bg-blue-50 border-blue-200 text-blue-900 font-extrabold";
                        }
                      } else {
                        buttonStyleClass = settings.darkMode 
                          ? "bg-white/[0.03] border-white/10 text-gray-300 hover:bg-white/[0.08]" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
                      }

                      return (
                        <button
                          key={prop}
                          onClick={() => setNewBath({...newBath, thermalProperty: prop})}
                          className={cn(
                            "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center justify-center gap-1.5 duration-200",
                            buttonStyleClass
                          )}
                        >
                          {prop === 'quente' && <Flame className="w-4 h-4 text-red-500" />}
                          {prop === 'morna' && <Sun className="w-4 h-4 text-amber-500" />}
                          {prop === 'fria' && <Snowflake className="w-4 h-4 text-blue-500" />}
                          <span>{prop}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Título do Banho
                  </p>
                  <input
                    placeholder="Ex: Banho de Gira ou Descarrego"
                    value={newBath.title || ''}
                    onChange={(e) => setNewBath({...newBath, title: e.target.value})}
                    className={cn(
                      "w-full rounded-2xl p-4 outline-none border transition-all duration-200 text-sm",
                      settings.darkMode 
                        ? "bg-black/30 border-white/15 text-white placeholder-gray-500 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 focus:bg-black/50" 
                        : "bg-gray-50/50 border-gray-200 text-brand-navy placeholder-gray-400 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper focus:bg-white"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Ervas (uma por linha)
                  </p>
                  <textarea
                    placeholder="Ex: Arruda&#10;Guiné&#10;Alecrim"
                    rows={3}
                    value={newBath.herbs || ''}
                    onChange={(e) => setNewBath({...newBath, herbs: e.target.value})}
                    className={cn(
                      "w-full rounded-2xl p-4 outline-none resize-none text-sm transition-all duration-200 border",
                      settings.darkMode 
                        ? "bg-black/30 border-white/15 text-white placeholder-gray-500 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 focus:bg-black/50" 
                        : "bg-gray-50/50 border-gray-200 text-brand-navy placeholder-gray-400 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper focus:bg-white"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] ml-1",
                    settings.darkMode ? "text-brand-gold/90" : "text-brand-copper"
                  )}>
                    Observações / Modo de preparo
                  </p>
                  <textarea
                    placeholder="Adicione observações ou o modo de preparo deste banho..."
                    rows={3}
                    value={newBath.observations || ''}
                    onChange={(e) => setNewBath({...newBath, observations: e.target.value})}
                    className={cn(
                      "w-full rounded-2xl p-4 outline-none resize-none text-sm transition-all duration-200 border",
                      settings.darkMode 
                        ? "bg-black/30 border-white/15 text-white placeholder-gray-500 focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/60 focus:bg-black/50" 
                        : "bg-gray-50/50 border-gray-200 text-brand-navy placeholder-gray-400 focus:border-brand-copper focus:ring-1 focus:ring-brand-copper focus:bg-white"
                    )}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-3">
                    <button 
                      onClick={closeModal}
                      className={cn(
                        "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                        settings.darkMode 
                          ? "bg-[#252528] hover:bg-[#2F2F33] text-gray-300 border border-white/5" 
                          : "bg-gray-100 hover:bg-gray-150 text-gray-600 border border-gray-200"
                      )}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveBath}
                      className={cn(
                        "flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95",
                        settings.darkMode 
                          ? "bg-gradient-to-r from-[#d4af37] to-[#bfa030] hover:from-[#e5c147] hover:to-[#d4af37] text-brand-navy shadow-[0_4px_15px_rgba(212,175,55,0.25)]" 
                          : "bg-brand-navy hover:bg-brand-navy/95 text-white shadow-[0_4px_15px_rgba(0,31,63,0.15)]"
                      )}
                    >
                      {editingId ? 'Confirmar' : 'Criar Banho'}
                    </button>
                  </div>
                  
                  {editingId && (
                    <button 
                      onClick={() => {
                        const bath = baths.find(b => b.id === editingId);
                        if (bath) deleteBath(bath);
                        closeModal();
                      }}
                      className={cn(
                        "w-full py-3 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 active:scale-95",
                        settings.darkMode ? "bg-red-500/5 hover:bg-red-500/10" : "bg-red-50/50 hover:bg-red-50"
                      )}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Excluir Permanentemente</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modals removed in favor of global undo */}
      {/* Management Mode Overlay Banner */}
      <AnimatePresence>
        {isManaging && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none"
          >
            <div className={cn(
              "max-w-md mx-auto p-4 rounded-[32px] shadow-2xl flex items-center justify-between pointer-events-auto border backdrop-blur-md",
              settings.darkMode ? "bg-brand-navy/90 border-white/10" : "bg-white/90 border-gray-100"
            )}>
              <div className="flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-brand-gold" />
                </div>
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none", settings.darkMode ? "text-white" : "text-brand-navy")}>Modo de Gerenciamento</p>
                  <p className="text-[8px] font-medium text-gray-400 mt-1 uppercase tracking-widest">Edite ou exclua itens da lista</p>
                </div>
              </div>
              <button 
                onClick={() => setIsManaging(false)}
                className="bg-brand-gold text-brand-navy px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-gold/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalizar</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
