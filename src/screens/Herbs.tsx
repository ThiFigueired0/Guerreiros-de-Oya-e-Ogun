import React, { useState, useEffect, useRef } from 'react';
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
        const blocks = text.split('--------------------------');
        const newBaths: HerbBath[] = [];
        
        blocks.forEach(block => {
          if (!block.trim() || block.includes('=== RELAÇÃO DE BANHOS ===')) return;
          
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
          if (window.confirm(`${newBaths.length} banhos encontrados. Deseja adicionar?`)) {
            setBaths(prev => {
               const copy = [...prev];
               newBaths.forEach(nb => {
                 const exists = copy.some(c => c.title === nb.title && Math.abs(c.herbs.length - nb.herbs.length) < 5);
                 if (!exists) copy.push(nb);
               });
               return copy;
            });
            alert("Banhos importados com sucesso!");
          }
        } else {
          alert("Nenhum banho encontrado ou formato inválido.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o arquivo.");
      }
      e.target.value = '';
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
          <div className="flex items-center justify-between gap-4 mb-8 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "p-2.5 rounded-2xl border transition-all active:scale-90 shrink-0",
                    settings.darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-100 text-brand-navy shadow-sm"
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex flex-col overflow-hidden">
                <h2 className={cn(
                  "text-2xl font-black text-brand-navy tracking-tight truncate",
                  settings.darkMode && "text-white"
                )}>
                  {selectedCategory ? selectedCategory : "Banhos"}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-copper mt-1">Catequese de Ervas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
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
                  "p-3.5 rounded-2xl border transition-all active:scale-95 flex items-center justify-center",
                  settings.darkMode ? "bg-white/5 border-white/10 text-brand-copper" : "bg-white border-gray-100 text-brand-navy shadow-sm"
                )}
                title="Importar banhos (.txt)"
              >
                <Upload className="w-5 h-5" />
              </button>
              <button 
                onClick={exportBaths}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all active:scale-95 flex items-center justify-center",
                  settings.darkMode ? "bg-white/5 border-white/10 text-brand-copper" : "bg-white border-gray-100 text-brand-navy shadow-sm"
                )}
                title="Exportar todos os banhos"
              >
                <Download className="w-5 h-5" />
              </button>
              {selectedCategory && (
                <button 
                  onClick={() => setIsManaging(!isManaging)}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    isManaging 
                      ? "bg-brand-gold text-brand-navy shadow-lg shadow-brand-gold/20" 
                      : (settings.darkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-brand-navy")
                  )}
                >
                  {isManaging ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Finalizar</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Gerenciar</span>
                    </>
                  )}
                </button>
              )}
              <button 
                onClick={() => setShowModal(true)} 
                className={cn(
                  "w-12 h-12 bg-brand-navy text-white rounded-[20px] shadow-xl flex items-center justify-center active:scale-95 transition-all shrink-0",
                  settings.darkMode && "bg-brand-copper"
                )}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="relative mb-8 px-1">
            <div className={cn(
              "absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl",
              settings.darkMode ? "bg-white/5" : "bg-gray-50"
            )}>
              <Search className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar banho ou ervas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full bg-white border-none rounded-[28px] py-5 pl-14 pr-6 shadow-xl shadow-gray-200/40 focus:ring-2 focus:ring-brand-copper/30 outline-none text-sm transition-all",
                settings.darkMode && "bg-[#1A1A1A] shadow-none border border-white/5 text-white focus:ring-white/10"
              )}
            />
          </div>

          {!selectedCategory && !search ? (
            <div className="grid grid-cols-2 gap-5 px-1">
              {bathCategories.map((cat) => {
                const count = baths.filter(b => b.category === cat || (!b.category && cat === 'Gerais')).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "p-6 rounded-[40px] text-left border-none relative overflow-hidden transition-all active:scale-95 group shadow-xl shadow-gray-200/30",
                      settings.darkMode ? "bg-[#1A1A1A] shadow-none border border-white/5" : "bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                      settings.darkMode ? "bg-gradient-to-br from-[#102b4e] to-[#1a365d]" : "bg-gradient-to-br from-[#0B1E36] via-[#102b4e] to-[#1a365d] shadow-[0_4px_10px_rgba(15,32,59,0.3)]"
                    )}>
                      <Folder className="w-6 h-6 text-white fill-white/20" />
                    </div>
                    <h3 className={cn("font-black text-sm tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>{cat}</h3>
                    <p className="text-[10px] text-gray-400 mt-1.5 font-black uppercase tracking-widest">{count} {count === 1 ? 'Banho' : 'Banhos'}</p>
                    
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ChevronLeft className="w-10 h-10 rotate-180" />
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setShowCategoryModal(true)}
                className={cn(
                  "p-6 rounded-[40px] text-left border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all active:scale-95",
                  settings.darkMode ? "border-white/10 bg-white/5" : "border-gray-200 bg-gray-50/50"
                )}
              >
                <PlusCircle className="w-8 h-8 text-gray-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Nova Pasta</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 px-1">
              {filteredBaths.length > 0 ? (
                filteredBaths.map(bath => (
                  <motion.div 
                    layout
                    key={bath.id} 
                    className={cn(
                      "bg-white p-7 rounded-[40px] shadow-xl shadow-gray-200/40 relative overflow-hidden border-none transition-all duration-500",
                      bath.isFavorite && (settings.darkMode ? "bg-brand-copper/5 shadow-brand-copper/5" : "bg-brand-copper/5 shadow-brand-copper/5"),
                      settings.darkMode && "bg-[#1A1A1A] shadow-none border border-white/5",
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 pr-4" onClick={() => setSelectedBathForDetails(bath)}>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              "font-black text-brand-navy text-xl leading-tight hover:text-brand-copper cursor-pointer transition-colors", 
                              settings.darkMode && "text-white dark:hover:text-brand-gold"
                            )}>
                              {bath.title}
                            </h4>
                            {bath.thermalProperty && (
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1",
                                bath.thermalProperty === 'quente' ? "bg-red-500/10 text-red-500" :
                                bath.thermalProperty === 'morna' ? "bg-amber-500/10 text-amber-500" :
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                {bath.thermalProperty === 'quente' && <Flame className="w-2.5 h-2.5" />}
                                {bath.thermalProperty === 'morna' && <Sun className="w-2.5 h-2.5" />}
                                {bath.thermalProperty === 'fria' && <Snowflake className="w-2.5 h-2.5" />}
                                {bath.thermalProperty}
                              </span>
                            )}
                          </div>
                        
                        {/* Preview of Herbs */}
                        <div className="mt-3 flex flex-wrap gap-1.5 line-clamp-1 pointer-events-none">
                          {bath.herbs.split('\n').slice(0, 3).map((herb, idx) => (
                            herb.trim() && (
                              <span key={idx} className="text-[8px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md border border-gray-100 dark:border-white/5">
                                {herb.trim()}
                              </span>
                            )
                          ))}
                          {bath.herbs.split('\n').length > 3 && (
                            <span className="text-[8px] font-black text-brand-copper uppercase tracking-widest pt-0.5">
                              + {bath.herbs.split('\n').length - 3} Ervas
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => toggleFavorite(bath.id)}
                        className={cn(
                          "p-4 rounded-3xl transition-all active:scale-90",
                          bath.isFavorite 
                            ? (settings.darkMode ? "bg-brand-copper/20" : "bg-brand-copper/10") 
                            : (settings.darkMode ? "bg-white/5" : "bg-gray-50")
                        )}
                      >
                        <Heart className={cn("w-6 h-6 transition-all", bath.isFavorite ? "fill-brand-red text-brand-red" : (settings.darkMode ? "text-gray-700" : "text-gray-200"))} />
                      </button>
                    </div>

                    <div className="flex gap-2.5 mt-2">
                      <button 
                        onClick={() => handleShare(bath)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2.5 text-white bg-brand-navy px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-brand-navy/20 active:scale-95 transition-all",
                          isManaging && "bg-gray-400 shadow-none opacity-50"
                        )}
                        disabled={isManaging}
                      >
                        <Share2 className="w-4 h-4" /> Compartilhar
                      </button>
                      
                      {isManaging && (
                        <>
                          <button 
                            onClick={() => openEditModal(bath)}
                            className={cn(
                              "p-4 rounded-[20px] transition-all active:scale-95 border bg-white dark:bg-white/5",
                              settings.darkMode 
                                ? "text-white border-white/10" 
                                : "text-brand-navy border-gray-100 shadow-sm"
                            )}
                            title="Editar"
                          >
                            <Pencil className="w-5 h-5 text-brand-copper" />
                          </button>
                          <button 
                            onClick={() => deleteBath(bath)}
                            className={cn(
                              "p-4 rounded-[20px] active:scale-95 transition-all",
                              settings.darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500 shadow-sm"
                            )}
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className={cn(
                  "p-16 rounded-[48px] text-center border-4 border-dashed",
                  settings.darkMode ? "border-white/5" : "border-gray-50 bg-white"
                )}>
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 text-sm font-black uppercase tracking-widest italic">Nenhum banho encontrado</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : activeSubTab === 'ready' ? (
        <div className="space-y-6">
          <div className="px-2 mb-8 space-y-8">
            {/* Main Header with Title and Dashboard Cards */}
            <div className="flex flex-col gap-6">
              <h2 className={cn("text-3xl sm:text-4xl font-black text-brand-navy tracking-tight", settings.darkMode && "text-white")}>
                Banhos Prontos
              </h2>
              
              <div className="flex flex-wrap items-stretch gap-3">
                {/* Nubank Card */}
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all flex-1 min-w-[200px]",
                  settings.darkMode ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-100 shadow-sm"
                )}>
                  <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/30 overflow-hidden">
                    {settings.nubankLogo ? (
                      <img src={settings.nubankLogo} alt="Nubank" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-white uppercase">Nu</span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-400">Chave PIX Nubank</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-black truncate", settings.darkMode ? "text-white" : "text-purple-900")}>11982350614</span>
                      <button 
                        onClick={handleCopyPix}
                        className={cn(
                          "p-1.5 rounded-lg transition-all active:scale-95 shrink-0",
                          copiedPix ? "bg-green-500 text-white" : "bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white"
                        )}
                        title="Copiar PIX"
                      >
                        {copiedPix ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Unit Cost In Header */}
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all flex-1 min-w-[140px]",
                  settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100 shadow-sm"
                )}>
                  <div className="w-9 h-9 rounded-xl bg-brand-copper/10 dark:bg-brand-gold/10 flex items-center justify-center shrink-0">
                    <Droplet className="w-4 h-4 text-brand-copper dark:text-brand-gold" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Custo Unitário</span>
                    <div className="flex items-center gap-1">
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
                          settings.darkMode ? "text-white" : "text-brand-navy"
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
                    "p-4 rounded-2xl border transition-all duration-500",
                    settings.darkMode 
                      ? "bg-red-500/10 border-red-500/20" 
                      : "bg-red-50/50 border-red-100 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-500 shadow-lg shadow-red-500/30 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn("text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-4 truncate", settings.darkMode ? "text-red-400" : "text-red-600")}>
                        Reposição Necessária
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {needsReplenishment.map(rb => (
                          <div 
                            key={rb.id}
                            className={cn(
                              "px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[9px] sm:text-[11px] font-black tracking-tight border flex items-center gap-2 whitespace-nowrap",
                              settings.darkMode ? "bg-black/30 border-red-500/20 text-red-400" : "bg-white border-red-100 text-red-500 shadow-md shadow-red-500/5 hover:scale-105 transition-transform"
                            )}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar banho..."
                  value={readySearch}
                  onChange={(e) => setReadySearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none text-sm transition-all",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsManaging(!isManaging)}
                  className={cn(
                    "w-12 sm:w-14 h-12 sm:h-14 rounded-2xl transition-all border flex items-center justify-center shrink-0 active:scale-95",
                    isManaging 
                      ? "bg-brand-gold border-brand-gold text-brand-navy shadow-lg shadow-brand-gold/20" 
                      : (settings.darkMode ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-gray-100 text-brand-navy shadow-sm hover:bg-gray-50")
                  )}
                  title={isManaging ? "Concluir" : "Gerenciar"}
                >
                  {isManaging ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Pencil className="w-6 h-6" />
                  )}
                </button>

                <button 
                  onClick={() => {
                    setEditingReadyBath(null);
                    setReadyForm({ title: '', quantity: 1, category: selectedReadyCategory || 'Gerais', notes: '' });
                    setShowReadyModal(true);
                  }}
                  className={cn(
                    "w-12 sm:w-14 h-12 sm:h-14 bg-brand-navy text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-all shrink-0",
                    settings.darkMode && "bg-brand-gold text-brand-navy"
                  )}
                  title="Adicionar Banho"
                >
                  <Plus className="w-6 h-6 stroke-[3px]" />
                </button>
              </div>
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
                  "bg-white p-6 rounded-[40px] shadow-xl shadow-gray-200/40 border-none flex flex-col gap-5 group transition-all",
                  settings.darkMode && "bg-[#1A1A1A] shadow-none border border-white/5",
                  rb.isFixed && rb.quantity === 0 && (settings.darkMode ? "border-red-500/40 bg-red-500/5 shadow-none" : "border-red-100 bg-red-50/30 shadow-none")
                )}
              >
                {rb.isFixed && rb.quantity === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500 flex items-center justify-center gap-2 p-3 rounded-2xl shadow-xl shadow-red-500/30"
                  >
                    <Package className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">REPOSIÇÃO NECESSÁRIA</span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between gap-6">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      setEditingReadyBath(rb);
                      setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                      setShowReadyModal(true);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className={cn("font-black text-brand-navy text-xl leading-tight group-hover:text-brand-copper transition-colors", settings.darkMode && "text-white")}>
                        {rb.title}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cn(
                          "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest",
                          settings.darkMode ? "bg-white/5 text-gray-500" : "bg-gray-100 text-gray-400"
                        )}>
                          {rb.category || 'Gerais'}
                        </span>
                      {rb.isFixed && (
                        <div className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-xl",
                          rb.quantity === 0 ? "bg-red-500/10 text-red-500" : "bg-brand-gold/10 text-brand-gold"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", rb.quantity === 0 ? "bg-red-500" : "bg-brand-gold")} />
                          <span className="text-[9px] font-black uppercase tracking-widest">Produto Fixo</span>
                        </div>
                      )}
                    </div>
                    {rb.notes && (
                      <div className="mt-3 p-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] text-gray-400 leading-relaxed italic">
                          {rb.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={cn(
                      "flex items-center gap-2 p-1.5 rounded-[24px] transition-all duration-300",
                      settings.darkMode ? "bg-black/60 border border-white/10 shadow-inner" : "bg-gray-100/80 border border-gray-200/50 shadow-inner"
                    )}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          adjustReadyQuantity(rb.id, -1);
                        }}
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90",
                          settings.darkMode 
                            ? "bg-[#252525] text-brand-gold border border-white/10 hover:bg-[#303030]" 
                            : "bg-white text-brand-navy border border-gray-100 hover:bg-gray-50 hover:shadow-lg shadow-gray-200/30",
                          rb.quantity === 0 && "opacity-30 cursor-not-allowed"
                        )}
                        disabled={rb.quantity === 0}
                      >
                        <Minus className="w-4 h-4 stroke-[4px]" />
                      </button>
                      
                      <div className="min-w-[32px] text-center">
                        <motion.span 
                          key={rb.quantity}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "text-base font-black tabular-nums",
                            rb.quantity === 0 ? "text-gray-400" : (settings.darkMode ? "text-brand-gold" : "text-brand-navy")
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
                          "w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90",
                          settings.darkMode 
                            ? "bg-[#252525] text-brand-gold border border-white/10 hover:bg-[#303030]" 
                            : "bg-white text-brand-navy border border-gray-100 hover:bg-gray-50 hover:shadow-lg shadow-gray-200/30"
                        )}
                      >
                        <Plus className="w-4 h-4 stroke-[4px]" />
                      </button>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400/80">Em Estoque</span>
                  </div>
                </div>

                  <div className="flex items-center justify-between pt-4 mt-1 border-t border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center",
                        rb.quantity > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        rb.quantity > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {rb.quantity > 0 ? 'Disponível' : 'Esgotado'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isManaging && (
                        <>
                          <button 
                            onClick={() => {
                              setEditingReadyBath(rb);
                              setReadyForm({ title: rb.title, quantity: rb.quantity, category: rb.category || 'Gerais', notes: rb.notes || '' });
                              setShowReadyModal(true);
                            }}
                            className={cn(
                              "p-3 rounded-2xl transition-all active:scale-95 border",
                              settings.darkMode ? "bg-white/5 text-gray-400 hover:text-white border-white/10" : "bg-gray-50 text-gray-400 hover:text-brand-navy shadow-sm border-gray-100"
                            )}
                            title="Editar"
                          >
                            <Pencil className="w-5 h-5 text-brand-copper" />
                          </button>
                          {!rb.isFixed && (
                            <button 
                              onClick={() => deleteReadyBath(rb)}
                              className={cn(
                                "p-3 rounded-2xl active:scale-95 transition-all",
                                settings.darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500 shadow-sm"
                              )}
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <div>
              <h2 className={cn("text-2xl font-black text-brand-navy tracking-tight", settings.darkMode && "text-white")}>Estoque de Ervas</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-copper mt-1">Materiais em Casa</p>
            </div>
            <button 
              onClick={() => setShowHerbModal(true)}
              className={cn(
                "w-12 h-12 bg-brand-navy text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform",
                settings.darkMode && "bg-brand-copper"
              )}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar no meu estoque..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className={cn(
                "w-full bg-white border border-gray-100 rounded-2xl p-4 pl-12 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none text-sm",
                settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
              )}
            />
          </div>

          <div className="grid gap-3">
            {herbStock
              .filter(h => h.name.toLowerCase().includes(stockSearch.toLowerCase()))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((herb) => (
                <motion.div
                  layout
                  key={herb.id}
                  className={cn(
                    "bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800",
                    !herb.inStock && "opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleHerbInStock(herb.id)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        herb.inStock 
                          ? "bg-brand-copper border-brand-copper text-white" 
                          : "border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {herb.inStock && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-bold text-sm",
                        settings.darkMode ? "text-white" : "text-brand-navy",
                        !herb.inStock && "line-through text-gray-400"
                      )}>
                        {herb.name}
                      </span>
                      {herb.classification && (
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest flex items-center gap-1",
                          herb.classification === 'quente' ? "text-red-500" :
                          herb.classification === 'morna' ? "text-amber-500" :
                          "text-blue-500"
                        )}>
                          {herb.classification === 'quente' && <Flame className="w-2 h-2" />}
                          {herb.classification === 'morna' && <Sun className="w-2 h-2" />}
                          {herb.classification === 'fria' && <Snowflake className="w-2 h-2" />}
                          {herb.classification}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                      herb.inStock 
                        ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" 
                        : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    )}>
                      {herb.inStock ? 'Tenho' : 'Acabou'}
                    </span>
                    <button 
                      onClick={() => removeHerbFromStock(herb)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

            {herbStock.length === 0 && (
              <div className={cn(
                "p-12 rounded-[40px] text-center border-2 border-dashed",
                settings.darkMode ? "border-white/5" : "border-gray-50"
              )}>
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-brand-gold" />
                </div>
                <p className="text-gray-400 text-sm italic">O seu estoque está vazio.</p>
                <button 
                  onClick={() => setShowHerbModal(true)}
                  className="mt-4 text-brand-copper font-bold text-sm underline"
                >
                  Adicionar primeira erva
                </button>
              </div>
            )}
          </div>
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
        {showRoutineModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4"
            onClick={() => setShowRoutineModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden group",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
              onClick={e => e.stopPropagation()}
            >
              {/* Background Icon Decoration */}
              <div className="absolute -right-12 -bottom-12 opacity-[0.03] pointer-events-none z-0 group-hover:scale-105 group-hover:-rotate-6 transition-transform duration-700">
                <CalendarDays className={cn("w-64 h-64 stroke-[1]", settings.darkMode ? "text-white" : "text-brand-navy")} />
              </div>

              {/* Contorno interno duplo azul com margem lateral */}
              <div className={cn(
                "absolute inset-[6px] rounded-[26px] border-2 pointer-events-none z-10",
                settings.darkMode ? "border-[#152e51]" : "border-brand-navy/10"
              )}>
                <div className={cn(
                  "absolute inset-[2px] rounded-[22px] border pointer-events-none",
                  settings.darkMode ? "border-[#152e51]/50" : "border-brand-navy/5"
                )} />
              </div>

              <div className="absolute top-0 right-0 p-4 z-20">
                 <button onClick={() => setShowRoutineModal(false)} className="p-2 text-gray-400 active:text-gray-600 transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="flex flex-col items-center mb-8">
                 <motion.div 
                    animate={{ rotateY: [-8, 8, -8], y: [-4, 4, -4], rotateX: [2, -2, 2] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 p-1.5 bg-gradient-to-br from-brand-gold-light via-brand-gold-medium to-brand-gold-dark rounded-[24px] flex items-center justify-center mb-6 relative shadow-[0_12px_24px_rgba(192,150,35,0.4),inset_0_2px_6px_rgba(255,255,255,0.6),inset_0_-4px_8px_rgba(0,0,0,0.3)] border border-brand-gold-dark"
                 >
                    {/* Reflexo exterior */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent mix-blend-overlay outline-none rounded-[24px] pointer-events-none"></div>
                    {/* Ponto de luz detalhe dourado */}
                    <div className="absolute top-1 right-1 w-6 h-6 bg-white/40 rounded-full blur-md pointer-events-none"></div>

                    {/* Fundo interno azul */}
                    <div className="w-full h-full bg-gradient-to-br from-[#0B1E36] via-[#102b4e] to-[#1a365d] rounded-[18px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-4px_6px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden z-10 border border-[#1a365d]">
                        {/* Reflexo interno */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent mix-blend-overlay outline-none pointer-events-none"></div>
                       <CalendarClock className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-20" strokeWidth={1.5} />
                    </div>
                 </motion.div>
                 <h3 className={cn("text-xl font-bold text-brand-navy text-center", settings.darkMode && "text-white")}>Semana de Gira</h3>
              </div>

              <div className="space-y-3 mt-6">
                {[
                  { 
                    shortDay: ['SEG', 'TER', 'QUA'], 
                    bath: 'Banho de Descarrego', 
                    id: 'b1', 
                    hoverColor: settings.darkMode ? "group-hover:text-brand-gold" : "group-hover:text-brand-navy",
                    hoverBorder: settings.darkMode ? "hover:border-[#2A2A2A]" : "hover:border-brand-navy/30",
                    theme: 'navy'
                  },
                  { 
                    shortDay: 'QUIN', 
                    bath: 'Banho de Desenvolvimento', 
                    id: 'b2', 
                    hoverColor: settings.darkMode ? "group-hover:text-white" : "group-hover:text-brand-gold",
                    hoverBorder: settings.darkMode ? "hover:border-brand-gold/30" : "hover:border-brand-gold/50",
                    theme: 'gold'
                  },
                  { 
                    shortDay: 'SEX', 
                    bath: 'Banho Energizador', 
                    id: 'b4', 
                    hoverColor: settings.darkMode ? "group-hover:text-brand-gold" : "group-hover:text-brand-navy",
                    hoverBorder: settings.darkMode ? "hover:border-[#2A2A2A]" : "hover:border-brand-navy/30",
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
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
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
                        "flex items-center gap-4 p-3 sm:p-4 rounded-2xl border shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all relative overflow-hidden group",
                        !settings.darkMode && item.theme === 'navy' && "bg-[#F0F4F8] border-brand-navy/10",
                        !settings.darkMode && item.theme === 'gold' && "bg-[#FFFDF5] border-brand-gold/20",
                        item.id && cn("cursor-pointer active:opacity-70 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-black/10", item.hoverBorder),
                        settings.darkMode && cn("bg-[#252528] border-gray-800 shadow-none", item.id && item.hoverBorder)
                      )}
                    >
                      <div className={cn(
                        "rounded-2xl flex items-center justify-center shrink-0 transition-transform overflow-hidden relative",
                        Array.isArray(item.shortDay) ? "w-12 h-auto py-2.5 flex-col gap-1.5" : "w-12 h-12",
                        item.theme === 'navy' && (settings.darkMode ? "bg-gradient-to-br from-[#102b4e] to-[#1a365d] text-white border border-[#1a365d]" : "bg-gradient-to-br from-[#0B1E36] via-[#102b4e] to-[#1a365d] text-white shadow-[0_4px_10px_rgba(15,32,59,0.4)]"),
                        item.theme === 'gold' && (settings.darkMode ? "bg-gradient-to-br from-brand-gold-medium to-brand-gold-dark text-white border border-brand-gold/30" : "bg-gradient-to-br from-brand-gold-light to-brand-gold-medium text-brand-navy shadow-[0_4px_10px_rgba(192,150,35,0.4)]"),
                      )}>
                        {Array.isArray(item.shortDay) ? (
                          item.shortDay.map((day, dIdx) => (
                            <span key={dIdx} className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center leading-tight">{day}</span>
                          ))
                        ) : (
                          <span className="relative z-10 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center leading-tight">{item.shortDay}</span>
                        )}
                        {/* Overlay brilho */}
                        {!settings.darkMode && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={cn("text-sm sm:text-base font-bold truncate transition-colors", item.id && item.hoverColor, settings.darkMode ? "text-white" : "text-brand-navy")}>
                          {item.bath}
                        </p>
                      </div>
                      
                      {item.id && (
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                          "text-gray-400 group-hover:text-brand-navy group-hover:translate-x-1 cursor-pointer",
                          settings.darkMode ? "bg-white/5 group-hover:bg-white/10 group-hover:text-white" : "bg-gray-50 group-hover:bg-gray-100"
                        )}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
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

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-brand-copper tracking-widest px-2">Propriedade Térmica</p>
                  <div className="flex gap-2">
                    {(['quente', 'morna', 'fria'] as const).map(prop => (
                      <button
                        key={prop}
                        onClick={() => setNewBath({...newBath, thermalProperty: prop})}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold transition-all border capitalize flex flex-col items-center justify-center gap-1",
                          newBath.thermalProperty === prop
                            ? (prop === 'quente' ? "bg-red-500 border-red-500 text-white" : 
                               prop === 'morna' ? "bg-amber-500 border-amber-500 text-white" : 
                               "bg-blue-500 border-blue-500 text-white")
                            : (settings.darkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-white border-gray-100 text-gray-500")
                        )}
                      >
                        {prop === 'quente' && <Flame className="w-4 h-4 mb-0.5" />}
                        {prop === 'morna' && <Sun className="w-4 h-4 mb-0.5" />}
                        {prop === 'fria' && <Snowflake className="w-4 h-4 mb-0.5" />}
                        {prop}
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
                        const bath = baths.find(b => b.id === editingId);
                        if (bath) deleteBath(bath);
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
