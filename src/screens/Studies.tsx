import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  BookOpen, Plus, Trash2, Edit2, Save, X, Search, ChevronRight, GraduationCap, FileText, Upload, Download, Eye, ExternalLink, Star, CheckCircle2,
  Book, MessageSquare, LayoutList, Sparkles, ScrollText, Flame, Bookmark
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { Greeting, StudyBook, AppSettings, StudyContent } from '../types';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const INITIAL_GREETINGS: Greeting[] = [
  // Gira
  { id: 'g1', category: 'Gira', entity: 'Abertura e fechamento dos trabalhos', greeting: 'Salve!' },
  { id: 'g2', category: 'Gira', entity: 'Defumação', greeting: 'Salve!' },
  { id: 'g3', category: 'Gira', entity: 'Olorum', greeting: 'Olorum é nosso pai!' },
  { id: 'g4', category: 'Gira', entity: 'Sete linhas de umbanda', greeting: 'Salve!' },
  // Entidades
  { id: 'e1', category: 'Entidades', entity: 'Exu/Pombagira/Exu Mirim', greeting: 'Laroye!' },
  { id: 'e2', category: 'Entidades', entity: 'Malandro', greeting: 'Salve/Salve a malandragem' },
  { id: 'e3', category: 'Entidades', entity: 'Baianos', greeting: 'Amém Bahia!' },
  { id: 'e4', category: 'Entidades', entity: 'Erê', greeting: 'Eremin/ Erê mim' },
  { id: 'e5', category: 'Entidades', entity: 'Caboclos', greeting: 'okê caboclo!' },
  { id: 'e6', category: 'Entidades', entity: 'Boiadeiro', greeting: 'xetrua/jetrua boiadeiro' },
  { id: 'e7', category: 'Entidades', entity: 'Cangaço', greeting: 'Salve!' },
  { id: 'e8', category: 'Entidades', entity: 'Pretos Velhos', greeting: 'Adorei as Almas!' },
  { id: 'e9', category: 'Entidades', entity: 'Marujo', greeting: 'Elamano!' },
  { id: 'e10', category: 'Entidades', entity: 'Ciganos', greeting: 'Optcha!' },
  // Orixás
  { 
    id: 'o1', 
    category: 'Orixás', 
    entity: 'Oxala', 
    greeting: 'Epa Baba!',
    beads: 'branco',
    firma: 'branca',
    summary: 'Orixá da paz, da criação e da pureza. Pai de todos os Orixás, ele é a representação da calma e da sabedoria ancestral. Sua cor é o branco absoluto, e seu dia é a sexta-feira, momento em que seus filhos buscam a purificação e o equilíbrio espiritual.\n\nApresenta-se em duas formas principais: Oxalufan, o velho sábio e pacífico que caminha com o opaxorô (seu cajado de prata), simbolizando a paciência e a reflexão que vem com a idade avançada.\n\nE Oxaguian, o jovem guerreiro que traz a inovação, o progresso e a força necessária para as transformações do mundo. Ele é o senhor do inhame e da mão que molda o futuro com vigor e coragem.'
  },
  { 
    id: 'o2', 
    category: 'Orixás', 
    entity: 'Iemanja', 
    greeting: 'Odoya!',
    beads: 'azul bebê',
    firma: 'azul bebê',
    summary: 'Rainha do Mar e mãe de muitos Orixás. Ela rege a fecundidade, a harmonia familiar e é a grande protetora dos marinheiros, pescadores e de todos que buscam conforto em suas águas salgadas.\n\nSua energia é acolhedora e poderosa, como o movimento das marés que limpam e renovam tudo o que tocam. É a senhora das cabeças (Ori), zelando pela saúde mental e emocional de seus filhos.\n\nAparece como a imagem da mãe generosa, mas que também possui a força indomável do oceano em fúria quando precisa defender sua prole ou a justiça divina.'
  },
  { 
    id: 'o3', 
    category: 'Orixás', 
    entity: 'Ogum', 
    greeting: 'Ogun ye!',
    beads: 'azul escuro',
    firma: 'azul escuro',
    summary: 'Orixá guerreiro, senhor do ferro e de todos os caminhos. Ele rege a coragem, a iniciativa física e a força necessária para enfrentar as batalhas diárias da vida. É o patrono da tecnologia, das leis e de tudo que abre trilhas para a evolução humana.\n\nOnde houver uma estrada a ser aberta ou uma demanda a ser vencida, Ogum estará lá com sua espada flamejante e seu escudo impenetrável. Ele não conhece o medo e ensina seus filhos a lutarem com honra e retidão.\n\nSua energia é impetuosa, mas focada na ordem. Ele é o primeiro a entrar no campo de batalha e o último a sair, garantindo que o progresso nunca pare diante das dificuldades terrestres.'
  },
  { 
    id: 'o4', 
    category: 'Orixás', 
    entity: 'Iansã/Oya', 
    greeting: 'Epa Hey!',
    beads: 'vermelha',
    firma: 'vermelha',
    summary: 'Senhora dos ventos, dos raios e das tempestades. Guerreira audaz e independente, ela não conhece amarras e rege as transformações rápidas e necessárias da alma. É sinônimo de liberdade e movimento constante.\n\nComo senhora do cemitério (Igbale), ela é a única que tem o poder de conduzir os espíritos desencarnados para seu lugar de repouso, dominando os Eguns com sua força e determinação. Ela é o vento que varre as impurezas e traz o novo.\n\nSua personalidade é vibrante e apaixonada. Oya não aceita a injustiça e luta com a força de um furacão por seus ideais. É a rainha que cavalga ao lado de Xangô, compartilhando o domínio sobre os elementos ígneos e aéreos.'
  },
  { 
    id: 'o5', 
    category: 'Orixás', 
    entity: 'Oxossi', 
    greeting: 'Okê Arô!',
    beads: 'verde escuro',
    firma: 'verde escuro',
    summary: 'Orixá da caça, das matas virgens e de todo o conhecimento oculto na natureza. Ele é o grande provedor da fartura, garantindo que nunca falte o sustento físico e espiritual para aqueles que respeitam o equilíbrio do meio ambiente.\n\nSenhor da flecha única (Ofá), ele representa a precisão, o foco e a paciência do caçador que aguarda o momento certo para agir. Oxossi é o patrono das artes, da contemplação e da cura através das ervas medicinais.\n\nSua energia é leve, mas extremamente profunda. Ele vaga pelas florestas trazendo o frescor da mata e a sabedoria intuitiva que só o silêncio da natureza pode proporcionar aos que sabem ouvir.'
  },
  { 
    id: 'o6', 
    category: 'Orixás', 
    entity: 'Oxum', 
    greeting: 'Ora yê yê ô!',
    beads: 'dourada',
    firma: 'dourada',
    summary: 'Orixá das águas doces, das cachoeiras, do amor, da fertilidade e da prosperidade. Ela rege as emoções mais profundas, a delicadeza feminina e a riqueza tanto material quanto espiritual de seus devotos.\n\nSempre associada ao ouro e à vaidade construtiva, Oxum ensina que o autoamor é a base de todo relacionamento saudável. Ela é a dona do ventre e protetora das crianças, cuidando da vida desde a concepção.\n\nPor trás de sua suavidade e do brilho de seus metais, esconde-se uma diplomata astuta e estrategista, capaz de vencer as maiores lutas usando a doçura e a inteligência emocional em vez da força bruta.'
  },
  { 
    id: 'o7', 
    category: 'Orixás', 
    entity: 'Xangô', 
    greeting: 'Kaô Kabecilê!',
    summary: 'Rei da justiça, senhor do trovão e do fogo. Ele rege a retidão absoluta, as leis divinas e humanas, a política e o equilíbrio necessário entre o certo e o errado. É o justiceiro implacável que não hesita em punir a maldade.\n\nSentado em seu trono de pedra, Xangô observa as ações de todos os seres com seu Oxé (machado de dois gumes), pronto para pesar os corações e aplicar a lei de retorno. Ele é o símbolo do poder real e da administração justa.\n\nSua energia é majestosa e imponente. Ele representa a estabilidade das montanhas e o calor do sol que ilumina a verdade, sendo buscado por todos que sofrem injustiças ou que precisam de discernimento em momentos críticos.'
  },
  { 
    id: 'o8', 
    category: 'Orixás', 
    entity: 'Omolu e Obaluaê', 
    greeting: 'Atotô!',
    beads: 'Omolu: 7 preta, 7 vermelhas e 7 brancas | Obaluaê: preto e branco',
    firma: 'Omolu: preta, vermelha ou branca | Obaluaê: preto e branco',
    summary: 'Senhor da terra, das doenças e, acima de tudo, da cura milagrosa. Ele rege a palha da costa (Xaxará) que esconde e revela os mistérios da vida e da morte. É o Orixá da renovação celular e da superação das dores físicas.\n\nSua energia é densa e introspectiva, ligada ao solo sagrado onde tudo nasce e para onde tudo retorna. Ele ensina a humildade diante da fragilidade humana e a força resiliente que surge através do sofrimento transformador.\n\nApesar de seu aspecto severo, é um dos orixás mais benevolentes, sendo o portador da salvação para os que estão em leitos de dor, transformando a doença em saúde e a escuridão em luz renovada.'
  },
  { 
    id: 'o9', 
    category: 'Orixás', 
    entity: 'Nanã', 
    greeting: 'Salubá!',
    beads: 'lilás',
    firma: 'lilás',
    summary: 'A mais velha entre todos os Orixás, senhora da lama primordiais e dos pântanos onde a vida se originou. Ela rege a decantação das emoções, o fim necessário de ciclos e a paciência infinita dos anciãos.\n\nComo avó celestial, Nanã acolhe os espíritos cansados e prepara o barro sagrado para que novas vidas sejam moldadas por Oxalá. Ela detém o conhecimento sobre os antepassados e o segredo da transmutação da matéria.\n\nSua presença traz a calma e a aceitação do tempo cronológico. Ela nos ensina que o repouso é tão importante quanto a ação, e que a sabedoria só é plenamente alcançada através da experiência acumulada ao longo das eras.'
  },
  { 
    id: 'o10', 
    category: 'Orixás', 
    entity: 'Oxumare', 
    greeting: 'Arroboboi!',
    summary: 'Orixá do arco-íris e da serpente sagrada. Ele rege os ciclos incessantes de mudança, a continuidade da vida e a riqueza que se renova através do movimento. Representa a dualidade harmoniosa entre o céu e a terra.\n\nMetade do ano vive como homem, metade como mulher, simbolizando a completude e o equilíbrio de todas as forças opostas do universo. Ele é o elo que conecta os homens aos deuses através das cores do arco-íris.\n\nSua energia é fluida e graciosa, trazendo a promessa de dias melhores após a tempestade. Oxumare garante que a roda da fortuna continue girando, trazendo crescimento e renovação para aqueles que não temem o fluxo da vida.'
  },
];

const INITIAL_STUDY_CONTENTS: StudyContent[] = [];

export default function StudiesScreen() {
  const location = useLocation();
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [books, setBooks, isBooksLoading] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [greetings, setGreetings] = useStorage<Greeting[]>('templo_greetings', INITIAL_GREETINGS);
  const [studyContents, setStudyContents] = useStorage<StudyContent[]>('templo_study_docs', INITIAL_STUDY_CONTENTS);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'greetings' | 'contents'>('library');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['in_progress']);
  const [search, setSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<StudyBook | null>(null);
  const [showBookNotesModal, setShowBookNotesModal] = useState(false);
  const [bookNotesDraft, setBookNotesDraft] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameVal, setEditingNameVal] = useState('');
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [editingGreeting, setEditingGreeting] = useState<Greeting | null>(null);
  const [selectedGreeting, setSelectedGreeting] = useState<Greeting | null>(null);
  
  const [showDeleteBookConfirm, setShowDeleteBookConfirm] = useState(false);
  const [showDeleteGreetingConfirm, setShowDeleteGreetingConfirm] = useState(false);
  const [bookToDeleteId, setBookToDeleteId] = useState<string | null>(null);
  const [greetingToDeleteId, setGreetingToDeleteId] = useState<string | null>(null);
  
  // New Content state
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<StudyContent | null>(null);
  const [contentForm, setContentForm] = useState<Partial<StudyContent>>({
    title: '',
    category: 'Fundamento',
    content: '',
    attachments: [],
    links: []
  });
  const [selectedContent, setSelectedContent] = useState<StudyContent | null>(null);
  const [contentSearch, setContentSearch] = useState('');
  const [showDeleteContentConfirm, setShowDeleteContentConfirm] = useState(false);
  const [contentToDeleteId, setContentToDeleteId] = useState<string | null>(null);

  const [newLink, setNewLink] = useState('');
  const addLink = () => {
    if (newLink) {
      setContentForm({ ...contentForm, links: [...(contentForm.links || []), newLink] });
      setNewLink('');
    }
  };
  const removeLink = (index: number) => {
    setContentForm({ ...contentForm, links: contentForm.links?.filter((_, i) => i !== index) });
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const type = file.type.includes('pdf') ? 'pdf' : 'image';
      const newAttachment = {
        name: file.name,
        type: type as 'pdf' | 'image',
        data: base64
      };
      setContentForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (index: number) => {
    setContentForm({ ...contentForm, attachments: contentForm.attachments?.filter((_, i) => i !== index) });
  };

  const CONTENT_CATEGORIES = ['Fundamento', 'Reza', 'Magia', 'Outros'];
  
  // New Greeting state
  const [newGreeting, setNewGreeting] = useState<Partial<Greeting>>({
    category: 'Orixás',
    entity: '',
    greeting: '',
    summary: '',
    imageUrl: ''
  });

  // Handle openBookId from navigation state
  useEffect(() => {
    const state = location.state as { openBookId?: string } | null;
    if (state?.openBookId && books.length > 0) {
      const book = books.find(b => b.id === state.openBookId);
      if (book) {
        openBookDetails(book);
        // Clear history state to avoid reopening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, books]);

  // PDF Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const base64 = `data:application/pdf;base64,${btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      )}`;
      
      let totalPages = 0;
      try {
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
        const pdf = await loadingTask.promise;
        totalPages = pdf.numPages;
        console.log('PDF loaded successfully, total pages:', totalPages);
      } catch (error) {
        console.error('Error counting PDF pages:', error);
      }

      const newBook: StudyBook = {
        id: Date.now().toString(),
        name: file.name,
        pdfBase64: base64,
        uploadDate: Date.now(),
        isFavorite: false,
        readingStatus: 'not_started',
        totalPages
      };
      setBooks([newBook, ...books]);
      setShowBookModal(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const deleteBook = (id: string) => {
    setBookToDeleteId(id);
    setShowDeleteBookConfirm(true);
  };

  const confirmDeleteBook = () => {
    if (bookToDeleteId) {
      setBooks(books.filter(b => b.id !== bookToDeleteId));
      setBookToDeleteId(null);
    }
  };

  const openBook = (book: StudyBook) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${book.pdfBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    } else {
      alert('Por favor, habilite popups para abrir o livro.');
    }
  };

  // Greeting CRUD
  const handleSaveGreeting = () => {
    if (!newGreeting.entity || !newGreeting.greeting) return;

    const greetingToSave = {
      ...newGreeting,
      id: editingGreeting ? editingGreeting.id : Date.now().toString()
    } as Greeting;

    if (editingGreeting) {
      setGreetings(greetings.map(g => g.id === editingGreeting.id ? greetingToSave : g));
    } else {
      setGreetings([...greetings, greetingToSave]);
    }

    setShowGreetingModal(false);
    setEditingGreeting(null);
    setNewGreeting({ category: 'Orixás', entity: '', greeting: '', summary: '', imageUrl: '', beads: '', firma: '' });
  };

  const deleteGreeting = (id: string) => {
    setGreetingToDeleteId(id);
    setShowDeleteGreetingConfirm(true);
  };

  const confirmDeleteGreeting = () => {
    if (greetingToDeleteId) {
      setGreetings(greetings.filter(g => g.id !== greetingToDeleteId));
      setGreetingToDeleteId(null);
    }
  };

  const startEditGreeting = (g: Greeting) => {
    setEditingGreeting(g);
    setNewGreeting({ 
      category: g.category, 
      entity: g.entity, 
      greeting: g.greeting,
      summary: g.summary || '',
      imageUrl: g.imageUrl || '',
      beads: g.beads || '',
      firma: g.firma || ''
    });
    setShowGreetingModal(true);
  };

  // Image Upload helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewGreeting({ ...newGreeting, imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBookNotes = () => {
    if (!selectedBookForAction) return;
    setBooks(books.map(b => b.id === selectedBookForAction.id ? { ...b, notes: bookNotesDraft } : b));
    setShowBookNotesModal(false);
    setSelectedBookForAction(null);
  };

  const openBookDetails = async (book: StudyBook) => {
    setSelectedBookForAction(book);
    setBookNotesDraft(book.notes || '');
    setEditingNameVal(book.name.replace('.pdf', ''));
    setIsEditingName(false);
    
    // If total pages is missing, try to calculate it now
    if (!book.totalPages || book.totalPages === 0) {
      try {
        const binaryString = atob(book.pdfBase64.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const loadingTask = pdfjsLib.getDocument(bytes);
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        
        // Update both state and local selection
        const updatedBook = { ...book, totalPages };
        setBooks(books.map(b => b.id === book.id ? updatedBook : b));
        setSelectedBookForAction(updatedBook);
        console.log('Total pages recovered:', totalPages);
      } catch (error) {
        console.error('Failed to recover total pages:', error);
      }
    }
  };

  const toggleBookFavorite = (id: string) => {
    setBooks(books.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
    if (selectedBookForAction && selectedBookForAction.id === id) {
      setSelectedBookForAction({ ...selectedBookForAction, isFavorite: !selectedBookForAction.isFavorite });
    }
  };

  const updateBookStatus = (id: string, status: StudyBook['readingStatus'], lastPage?: number) => {
    setBooks(books.map(b => b.id === id ? { ...b, readingStatus: status, lastPage: lastPage ?? b.lastPage } : b));
    if (selectedBookForAction && selectedBookForAction.id === id) {
      setSelectedBookForAction({ 
        ...selectedBookForAction, 
        readingStatus: status, 
        lastPage: lastPage ?? selectedBookForAction.lastPage 
      });
    }
  };

  const handleUpdateBookName = () => {
    if (!selectedBookForAction || !editingNameVal.trim()) return;
    
    // Add .pdf back if it was removed for display but needed for storage consistency
    // Although the name.replace('.pdf', '') suggests we keep it without extension in display
    const newName = editingNameVal.trim();
    
    setBooks(books.map(b => b.id === selectedBookForAction.id ? { ...b, name: newName } : b));
    setSelectedBookForAction({ ...selectedBookForAction, name: newName });
    setIsEditingName(false);
  };

  const handleSaveContent = () => {
    if (!contentForm.title || !contentForm.content) return;

    const contentToSave: StudyContent = {
      ...contentForm,
      id: editingContent ? editingContent.id : Date.now().toString(),
      createdAt: editingContent ? editingContent.createdAt : Date.now(),
      attachments: contentForm.attachments || [],
      links: contentForm.links || []
    } as StudyContent;

    if (editingContent) {
      setStudyContents(studyContents.map(c => c.id === editingContent.id ? contentToSave : c));
    } else {
      setStudyContents([contentToSave, ...studyContents]);
    }

    setShowContentModal(false);
    setEditingContent(null);
    setContentForm({ title: '', category: 'Fundamento', content: '', attachments: [], links: [] });
  };

  const deleteContent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setContentToDeleteId(id);
    setShowDeleteContentConfirm(true);
  };

  const confirmDeleteContent = () => {
    if (contentToDeleteId) {
      setStudyContents(studyContents.filter(c => c.id !== contentToDeleteId));
      setContentToDeleteId(null);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredBooks = books.filter(b => 
    b.name.toLowerCase().includes(bookSearch.toLowerCase())
  ).sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.uploadDate - a.uploadDate;
  });

  const filteredStudyContents = studyContents.filter(c => 
    c.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.content.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(contentSearch.toLowerCase())
  );

  const getBooksByStatus = (status: StudyBook['readingStatus']) => {
    return filteredBooks.filter(b => b.readingStatus === status);
  };

  const bookCategories = [
    { id: 'in_progress', label: 'Em Andamento', icon: BookOpen, color: 'text-brand-copper' },
    { id: 'not_started', label: 'Não Iniciados', icon: FileText, color: 'text-gray-400' },
    { id: 'completed', label: 'Concluídos', icon: CheckCircle2, color: 'text-green-500' }
  ];

  const categories = ['Gira', 'Entidades', 'Orixás'];
  const filteredGreetings = greetings.filter(g => 
    g.entity.toLowerCase().includes(search.toLowerCase()) || 
    g.greeting.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pb-32"
    >
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className={cn("text-2xl font-black text-brand-navy", settings.darkMode && "text-white")}>Estudos</h1>
          <p className="text-xs text-gray-400">PDFs, Saudações e Fundamentos</p>
        </div>
      </header>

      {/* Submenu Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-100/50 dark:bg-white/5 rounded-2xl mb-8 border border-gray-100 dark:border-white/5">
        <button 
          onClick={() => setActiveSubTab('library')}
          className={cn(
            "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",
            activeSubTab === 'library' 
              ? "bg-brand-navy text-white shadow-md" 
              : "text-gray-400 hover:text-brand-navy"
          )}
        >
          <Book className="w-3.5 h-3.5" />
          <span className="leading-none">Biblioteca</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('greetings')}
          className={cn(
            "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",
            activeSubTab === 'greetings' 
              ? "bg-brand-navy text-white shadow-md" 
              : "text-gray-400 hover:text-brand-navy"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="leading-none">Saudações</span>
        </button>
        <button 
          onClick={() => setActiveSubTab('contents')}
          className={cn(
            "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",
            activeSubTab === 'contents' 
              ? "bg-brand-navy text-white shadow-md" 
              : "text-gray-400 hover:text-brand-navy"
          )}
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span className="leading-none">Conteúdos</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {/* Books Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-copper" />
                  <h2 className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Biblioteca Digital</h2>
                </div>
                <button 
                  onClick={() => setShowBookModal(true)}
                  className="text-[10px] uppercase font-black tracking-widest text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                >
                  Upload PDF
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar livros pelo título..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 py-3 pl-10 pr-4 rounded-2xl text-[11px] font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-copper/20",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              <div className="flex flex-col gap-4">
                {bookCategories.map((cat) => {
                  const catBooks = getBooksByStatus(cat.id as any);
                  const isExpanded = expandedCategories.includes(cat.id) || bookSearch.length > 0;
                  
                  if (catBooks.length === 0 && bookSearch) return null;

                  return (
                    <div key={cat.id} className="flex flex-col gap-3">
                      <button 
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] border border-gray-50",
                          settings.darkMode ? "bg-[#1A1A1A] border-gray-800 shadow-xl" : "bg-white shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <cat.icon className={cn("w-4 h-4", cat.color)} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-300" : "text-brand-navy")}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">({catBooks.length})</span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 text-gray-400 transition-transform duration-300",
                          isExpanded && "rotate-90"
                        )} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide pt-1">
                              {isBooksLoading ? (
                                <div className="flex-shrink-0 w-full p-8 flex flex-col items-center justify-center gap-3">
                                  <div className="w-6 h-6 border-2 border-brand-copper border-t-transparent rounded-full animate-spin" />
                                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Carregando...</p>
                                </div>
                              ) : catBooks.length === 0 ? (
                                <div className={cn(
                                  "flex-shrink-0 w-full p-8 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-2",
                                  settings.darkMode && "border-gray-800"
                                )}>
                                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Vazio</p>
                                </div>
                              ) : (
                                catBooks.map((book) => (
                                  <motion.div 
                                    key={book.id}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                      "flex-shrink-0 w-40 bg-white p-4 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-3 group relative",
                                      settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
                                    )}
                                  >
                                    <div 
                                      onClick={() => openBookDetails(book)}
                                      className="cursor-pointer"
                                    >
                                      <div className="w-full aspect-[3/4] bg-brand-navy/5 rounded-2xl flex items-center justify-center mb-3 relative overflow-hidden">
                                        <FileText className="w-10 h-10 text-brand-copper/40" />
                                        {book.isFavorite && (
                                          <div className="absolute top-2 right-2 p-1 bg-white/80 rounded-full shadow-sm backdrop-blur-sm">
                                            <Star className="w-3 h-3 text-brand-copper fill-brand-copper" />
                                          </div>
                                        )}
                                        {book.readingStatus === 'completed' && (
                                          <div className="absolute bottom-2 right-2 p-1 bg-green-500 rounded-full shadow-sm">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                          </div>
                                        )}
                                        {book.readingStatus === 'in_progress' && (
                                          <div className="absolute inset-x-0 bottom-0 pt-6 pb-2 px-2 bg-gradient-to-t from-black/60 to-transparent flex flex-col gap-1">
                                            <div className="flex justify-between items-center px-1">
                                              <span className="text-[7px] font-black text-white uppercase tracking-widest drop-shadow-sm">
                                                Pág {book.lastPage || 0}/{book.totalPages || '?'}
                                              </span>
                                              {book.totalPages && book.totalPages > 0 && (
                                                <span className="text-[7px] font-black text-white drop-shadow-sm">
                                                  {Math.round(((book.lastPage || 0) / book.totalPages) * 100)}%
                                                </span>
                                              )}
                                            </div>
                                            <div className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-[2px]">
                                              <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, book.totalPages && book.totalPages > 0 ? ((book.lastPage || 0) / book.totalPages) * 100 : 0)}%` }}
                                                className="h-full bg-brand-copper"
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      <h3 className={cn("text-[11px] font-bold text-brand-navy line-clamp-2 leading-tight", settings.darkMode && "text-white")}>
                                        {book.name.replace('.pdf', '')}
                                      </h3>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          </motion.div>
        )}

        {activeSubTab === 'greetings' && (
          <motion.div
            key="greetings"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {/* Greetings Section */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-copper" />
                  <h2 className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Saudações</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingGreeting(null);
                    setNewGreeting({ category: 'Orixás', entity: '', greeting: '', summary: '', imageUrl: '', beads: '', firma: '' });
                    setShowGreetingModal(true);
                  }}
                  className="text-[10px] uppercase font-black tracking-widest text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-full"
                >
                  Adicionar
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar saudações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 py-3 pl-10 pr-4 rounded-2xl text-[11px] font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-copper/20",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              {categories.map((cat) => {
                const isExpanded = expandedCategories.includes(cat) || search.length > 0;
                const catGreetings = filteredGreetings.filter(g => g.category === cat);
                
                if (catGreetings.length === 0 && search.length > 0) return null;

                return (
                  <div key={cat} className="mb-4">
                    <button 
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-[24px] transition-all",
                        isExpanded ? "bg-brand-copper/5 mb-3" : "bg-white shadow-sm border border-gray-100",
                        settings.darkMode && !isExpanded && "bg-[#1A1A1A] border-gray-800 shadow-lg",
                        settings.darkMode && isExpanded && "bg-brand-copper/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          cat === 'Orixás' ? 'bg-brand-copper' : cat === 'Entidades' ? 'bg-brand-red' : 'bg-brand-navy'
                        )} />
                        <h3 className={cn("font-black text-[11px] uppercase tracking-widest pt-0.5", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          {cat}
                        </h3>
                        <span className="text-[10px] font-bold text-gray-400">({catGreetings.length})</span>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-3 px-1"
                        >
                          {catGreetings.map((g) => (
                            <div 
                              key={g.id}
                              onClick={() => {
                                if (g.summary || g.imageUrl) {
                                  setSelectedGreeting(g);
                                }
                              }}
                              className={cn(
                                "bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-transform",
                                settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-lg"
                              )}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-brand-copper font-bold uppercase tracking-wider">{g.entity}</span>
                                <span className={cn("text-sm font-black text-brand-navy", settings.darkMode && "text-white")}>{g.greeting}</span>
                              </div>
                              <div className="flex gap-1 transition-opacity">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditGreeting(g);
                                  }}
                                  className={cn(
                                    "p-2 transition-colors",
                                    settings.darkMode ? "text-gray-400 hover:text-brand-copper" : "text-gray-400 hover:text-brand-copper"
                                  )}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteGreeting(g.id);
                                  }}
                                  className={cn(
                                    "p-2 transition-colors",
                                    settings.darkMode ? "text-red-500/60 hover:text-red-500" : "text-red-400 hover:text-red-500"
                                  )}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </section>
          </motion.div>
        )}

        {activeSubTab === 'contents' && (
          <motion.div
            key="contents"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            {/* Study Contents Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-copper" />
                  <h2 className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Conteúdos Relevantes</h2>
                </div>
                <button 
                  onClick={() => {
                    setEditingContent(null);
                    setContentForm({ title: '', category: 'Fundamento', content: '' });
                    setShowContentModal(true);
                  }}
                  className="text-[10px] uppercase font-black tracking-widest text-brand-red bg-brand-red/5 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                >
                  Adicionar
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar fundamentos, rezas, magias..."
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 py-3 pl-10 pr-4 rounded-2xl text-[11px] font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-copper/20",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredStudyContents.length === 0 ? (
                  <div className={cn(
                    "p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 text-center",
                    settings.darkMode && "border-gray-800"
                  )}>
                    <ScrollText className="w-12 h-12 text-gray-200" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhum conteúdo</p>
                      <p className="text-[10px] text-gray-300 max-w-[200px]">Adicione fundamentos, rezas ou magias para consulta rápida.</p>
                    </div>
                  </div>
                ) : (
                  filteredStudyContents.map((content) => (
                    <motion.div
                      key={content.id}
                      onClick={() => setSelectedContent(content)}
                      className={cn(
                        "p-5 bg-white rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-3 group relative cursor-pointer active:scale-[0.99] transition-all",
                        settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg w-fit",
                            content.category === 'Magia' ? 'bg-purple-50 text-purple-600' :
                            content.category === 'Reza' ? 'bg-blue-50 text-blue-600' :
                            'bg-brand-copper/10 text-brand-copper'
                          )}>
                            {content.category}
                          </span>
                          <h3 className={cn("text-sm font-black text-brand-navy mt-1", settings.darkMode && "text-white")}>
                            {content.title}
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingContent(content);
                              setContentForm({ ...content });
                              setShowContentModal(true);
                            }}
                            className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl hover:text-brand-copper transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => deleteContent(content.id, e)}
                            className="p-2 bg-red-50/50 text-red-400 rounded-xl hover:text-brand-red transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className={cn("text-[11px] text-gray-500 line-clamp-2 leading-relaxed", settings.darkMode && "text-gray-400")}>
                        {content.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {content.attachments && content.attachments.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                            <Upload className="w-2.5 h-2.5 text-brand-copper" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{content.attachments.length} Anexos</span>
                          </div>
                        )}
                        {content.links && content.links.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                            <ExternalLink className="w-2.5 h-2.5 text-brand-copper" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{content.links.length} Links</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-gray-50 dark:border-white/5 pt-3">
                        <div className="flex items-center gap-1.5 text-brand-copper">
                          <span className="text-[9px] font-black uppercase tracking-widest">Ver detalhes</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orixa Details Modal */}
      <AnimatePresence>
        {selectedGreeting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setSelectedGreeting(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {selectedGreeting.imageUrl && (
                <div className="relative h-64 w-full">
                  <img 
                    src={selectedGreeting.imageUrl} 
                    alt={selectedGreeting.entity}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8">
                    <h2 className="text-2xl font-black text-white">{selectedGreeting.entity}</h2>
                  </div>
                </div>
              )}

              <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {!selectedGreeting.imageUrl && (
                  <h2 className={cn("text-2xl font-black text-brand-navy mb-1", settings.darkMode && "text-white")}>
                    {selectedGreeting.entity}
                  </h2>
                )}
                
                <div className="flex flex-col gap-4">
                  <div className="bg-brand-copper/10 px-4 py-3 rounded-2xl border border-brand-copper/20">
                    <p className="text-[10px] text-brand-copper font-black uppercase tracking-widest mb-1">Saudação</p>
                    <p className={cn("text-lg font-black text-brand-navy", settings.darkMode && "text-white")}>
                      {selectedGreeting.greeting}
                    </p>
                  </div>

                  {(selectedGreeting.beads || selectedGreeting.firma) && (
                    <div className={cn(
                      "grid grid-cols-1 gap-2 p-4 rounded-2xl",
                      settings.darkMode ? "bg-black/40" : "bg-gray-50"
                    )}>
                      {selectedGreeting.beads && (
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Miçangas</p>
                          <p className={cn("text-[11px] font-bold text-brand-navy", settings.darkMode && "text-gray-300")}>
                            {selectedGreeting.beads}
                          </p>
                        </div>
                      )}
                      {selectedGreeting.firma && (
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Firma</p>
                          <p className={cn("text-[11px] font-bold text-brand-navy", settings.darkMode && "text-gray-300")}>
                            {selectedGreeting.firma}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedGreeting.summary && (
                    <div className={cn(
                      "text-xs leading-relaxed text-gray-500 font-medium whitespace-pre-wrap",
                      settings.darkMode && "text-gray-400"
                    )}>
                      {selectedGreeting.summary}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setSelectedGreeting(null)}
                  className="w-full mt-8 py-4 bg-brand-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg shadow-brand-navy/20"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Upload Modal */}
      <AnimatePresence>
        {showBookModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowBookModal(false)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-xl font-black text-brand-navy mb-2", settings.darkMode && "text-white")}>
                Adicionar Livro
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">Selecione um PDF para sua biblioteca</p>

              <div className="space-y-4">
                <label className={cn(
                  "flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 cursor-pointer hover:bg-brand-copper/5 hover:border-brand-copper/30 transition-all group",
                  settings.darkMode && "bg-black/50 border-gray-800"
                )}>
                  <Upload className="w-8 h-8 text-brand-copper/40 group-hover:scale-110 transition-transform mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/60">Selecionar arquivo</span>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Greeting Modal */}
      <AnimatePresence>
        {showGreetingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowGreetingModal(false)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-xl font-black text-brand-navy mb-8", settings.darkMode && "text-white")}>
                {editingGreeting ? 'Editar Saudação' : 'Nova Saudação'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Categoria</label>
                  <div className="flex gap-2">
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setNewGreeting({ ...newGreeting, category: c })}
                        className={cn(
                          "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          newGreeting.category === c 
                            ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Orixá / Entidade</label>
                    <input 
                      type="text"
                      value={newGreeting.entity}
                      onChange={(e) => setNewGreeting({ ...newGreeting, entity: e.target.value })}
                      className={cn(
                        "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "bg-black text-white"
                      )}
                      placeholder="Ex: Ogum"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Saudação</label>
                    <input 
                      type="text"
                      value={newGreeting.greeting}
                      onChange={(e) => setNewGreeting({ ...newGreeting, greeting: e.target.value })}
                      className={cn(
                        "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "bg-black text-white"
                      )}
                      placeholder="Ex: Ogun ye!"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Miçangas</label>
                    <input 
                      type="text"
                      value={newGreeting.beads || ''}
                      onChange={(e) => setNewGreeting({ ...newGreeting, beads: e.target.value })}
                      className={cn(
                        "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "bg-black text-white"
                      )}
                      placeholder="Cores das miçangas"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Firma</label>
                    <input 
                      type="text"
                      value={newGreeting.firma || ''}
                      onChange={(e) => setNewGreeting({ ...newGreeting, firma: e.target.value })}
                      className={cn(
                        "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "bg-black text-white"
                      )}
                      placeholder="Cor da firma"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Resumo / Detalhes</label>
                  <textarea 
                    value={newGreeting.summary}
                    onChange={(e) => setNewGreeting({ ...newGreeting, summary: e.target.value })}
                    rows={4}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-brand-copper/20 outline-none resize-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Escreva um breve resumo..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Imagem</label>
                  <label className={cn(
                    "flex items-center gap-4 p-4 border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all",
                    settings.darkMode && "border-gray-800 hover:bg-black/40"
                  )}>
                    {newGreeting.imageUrl ? (
                      <img src={newGreeting.imageUrl} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {newGreeting.imageUrl ? 'Trocar Imagem' : 'Upload Foto'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <button 
                  onClick={handleSaveGreeting}
                  className="w-full bg-brand-navy text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Book Options Modal */}
      <AnimatePresence>
        {selectedBookForAction && !showBookNotesModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setSelectedBookForAction(null)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center gap-4 mb-8 text-center pt-2">
                <div className="w-16 h-16 bg-brand-copper/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-8 h-8 text-brand-copper" />
                </div>
                <div className="w-full">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={editingNameVal}
                        onChange={(e) => setEditingNameVal(e.target.value)}
                        onBlur={handleUpdateBookName}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateBookName();
                          if (e.key === 'Escape') setIsEditingName(false);
                        }}
                        className={cn(
                          "w-full bg-gray-50 border-2 border-brand-copper/20 py-2 px-3 rounded-xl text-sm font-bold focus:outline-none focus:border-brand-copper transition-all text-center",
                          settings.darkMode && "bg-black text-white"
                        )}
                      />
                      <button 
                        onClick={handleUpdateBookName}
                        className="p-2 bg-brand-copper text-white rounded-xl active:scale-95 transition-all"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 group">
                      <h2 className={cn("text-lg font-black text-brand-navy leading-tight max-w-[200px] truncate", settings.darkMode && "text-white")}>
                        {selectedBookForAction.name.replace('.pdf', '')}
                      </h2>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="p-1.5 bg-gray-50 text-gray-400 rounded-lg active:text-brand-copper transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Opções do Livro</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => toggleBookFavorite(selectedBookForAction.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                      selectedBookForAction.isFavorite ? "bg-brand-red/5" : "bg-gray-50 hover:bg-brand-copper/5"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl shadow-sm transition-all",
                      selectedBookForAction.isFavorite ? "bg-brand-red text-white" : "bg-white"
                    )}>
                      <Star className={cn("w-3.5 h-3.5", selectedBookForAction.isFavorite ? "fill-white" : "text-brand-navy")} />
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest text-left leading-tight",
                      selectedBookForAction.isFavorite ? "text-brand-red" : "text-brand-navy"
                    )}>
                      {selectedBookForAction.isFavorite ? 'Remover' : 'Favoritar'}
                    </span>
                  </button>

                  <button 
                    onClick={() => openBook(selectedBookForAction)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-brand-copper/5 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <ExternalLink className="w-3.5 h-3.5 text-brand-navy" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy">Abrir PDF</span>
                  </button>
                </div>

                <div className="bg-gray-50 rounded-[28px] p-4 flex flex-col gap-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 block">Status da Leitura</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'not_started', label: 'Não lido', color: 'gray' },
                      { id: 'in_progress', label: 'Lendo', color: 'brand-copper' },
                      { id: 'completed', label: 'Lido', color: 'green' }
                    ].map(st => (
                      <button
                        key={st.id}
                        onClick={() => updateBookStatus(selectedBookForAction.id, st.id as any)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                          selectedBookForAction.readingStatus === st.id 
                            ? "bg-brand-navy text-white shadow-lg" 
                            : "bg-white text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {selectedBookForAction.readingStatus === 'in_progress' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                        <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Página</span>
                        <input 
                          type="number"
                          value={selectedBookForAction.lastPage || ''}
                          max={selectedBookForAction.totalPages}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const finalVal = selectedBookForAction.totalPages ? Math.min(val, selectedBookForAction.totalPages) : val;
                            updateBookStatus(selectedBookForAction.id, 'in_progress', finalVal);
                          }}
                          className={cn(
                            "flex-1 bg-gray-50 border-0 py-2 px-4 rounded-xl text-xs font-black focus:ring-0 outline-none",
                            settings.darkMode && "bg-black text-white"
                          )}
                          placeholder="0"
                        />
                        {selectedBookForAction.totalPages && (
                          <span className="text-[10px] font-bold text-gray-400">/ {selectedBookForAction.totalPages}</span>
                        )}
                      </div>
                      
                      {selectedBookForAction.totalPages && (
                        <div className="px-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-brand-copper uppercase tracking-widest">Progresso</span>
                            <span className="text-[9px] font-black text-brand-navy">
                              {Math.round(((selectedBookForAction.lastPage || 0) / selectedBookForAction.totalPages) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((selectedBookForAction.lastPage || 0) / selectedBookForAction.totalPages) * 100)}%` }}
                              className="h-full bg-brand-copper shadow-[0_0_8px_rgba(184,134,11,0.3)]"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={() => setShowBookNotesModal(true)}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-brand-copper/5 transition-colors group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Edit2 className="w-4 h-4 text-brand-navy" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-navy">Anotações</span>
                    <span className="text-[9px] text-gray-400 font-medium">{selectedBookForAction.notes ? 'Editar observações' : 'Adicionar observações'}</span>
                  </div>
                </button>

                <button 
                  onClick={() => {
                    deleteBook(selectedBookForAction.id);
                    setSelectedBookForAction(null);
                  }}
                  className="flex items-center gap-4 p-4 bg-red-50/30 rounded-2xl hover:bg-red-50 transition-colors group"
                >
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-red-500">Excluir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Notes Modal */}
      <AnimatePresence>
        {showBookNotesModal && selectedBookForAction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowBookNotesModal(false)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-xl font-black text-brand-navy mb-2", settings.darkMode && "text-white")}>
                Anotações
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">
                Observações para {selectedBookForAction.name.replace('.pdf', '')}
              </p>

              <textarea 
                value={bookNotesDraft}
                onChange={(e) => setBookNotesDraft(e.target.value)}
                rows={8}
                className={cn(
                  "w-full bg-gray-50 border-0 p-6 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-brand-copper/20 transition-all outline-none resize-none",
                  settings.darkMode && "bg-black text-white"
                )}
                placeholder="Escreva suas observações aqui..."
              />

              <button 
                onClick={handleSaveBookNotes}
                className="w-full bg-brand-navy text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-6"
              >
                Salvar Anotações
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DeleteConfirmationModal 
        isOpen={showDeleteContentConfirm}
        onClose={() => {
          setShowDeleteContentConfirm(false);
          setContentToDeleteId(null);
        }}
        onConfirm={confirmDeleteContent}
        title="Excluir Conteúdo"
        message="Deseja realmente excluir este conteúdo permanentemente?"
      />

      <DeleteConfirmationModal 
        isOpen={showDeleteBookConfirm}
        onClose={() => {
          setShowDeleteBookConfirm(false);
          setBookToDeleteId(null);
        }}
        onConfirm={confirmDeleteBook}
        title="Excluir Livro"
        message="Deseja realmente excluir este livro da sua biblioteca permanentemente?"
      />

      <DeleteConfirmationModal 
        isOpen={showDeleteGreetingConfirm}
        onClose={() => {
          setShowDeleteGreetingConfirm(false);
          setGreetingToDeleteId(null);
        }}
        onConfirm={confirmDeleteGreeting}
        title="Excluir Saudação"
        message="Deseja realmente excluir esta saudação permanentemente?"
      />

      {/* Study Content Details Modal */}
      <AnimatePresence>
        {selectedContent && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <div className="p-8 pb-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg",
                    selectedContent.category === 'Magia' ? 'bg-purple-50 text-purple-600' :
                    selectedContent.category === 'Reza' ? 'bg-blue-50 text-blue-600' :
                    'bg-brand-copper/10 text-brand-copper'
                  )}>
                    {selectedContent.category}
                  </span>
                  <h2 className={cn("text-xl font-black text-brand-navy mt-1", settings.darkMode && "text-white")}>
                    {selectedContent.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-400 hover:text-brand-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className={cn(
                  "text-sm leading-relaxed text-gray-600 whitespace-pre-wrap font-medium mb-8",
                  settings.darkMode && "text-gray-400"
                )}>
                  {selectedContent.content}
                </div>

                {selectedContent.links && selectedContent.links.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-4">Links de Referência</h4>
                    <div className="flex flex-col gap-3">
                      {selectedContent.links.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl bg-gray-50 group hover:bg-brand-copper/5 transition-all text-left",
                            settings.darkMode && "bg-black/40"
                          )}
                        >
                          <div className="p-2 bg-white dark:bg-white/10 rounded-xl">
                            <ExternalLink className="w-4 h-4 text-brand-copper" />
                          </div>
                          <span className={cn("text-[11px] font-bold text-brand-navy truncate", settings.darkMode && "text-gray-300")}>
                            {link}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContent.attachments && selectedContent.attachments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-copper mb-4">Anexos</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedContent.attachments.map((attach, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            if (attach.type === 'pdf') {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(
                                  `<iframe src="${attach.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                );
                              }
                            } else {
                              const newWindow = window.open();
                              if (newWindow) {
                                newWindow.document.write(`<img src="${attach.data}" style="max-width: 100%;" />`);
                              }
                            }
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-brand-copper/5 transition-all",
                            settings.darkMode && "bg-black/40"
                          )}
                        >
                          {attach.type === 'image' ? (
                            <img src={attach.data} className="w-full aspect-square object-cover rounded-lg" alt={attach.name} />
                          ) : (
                            <div className="w-full aspect-square bg-white dark:bg-white/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-8 h-8 text-brand-copper/40" />
                            </div>
                          )}
                          <span className={cn("text-[10px] font-bold text-brand-navy truncate w-full px-1", settings.darkMode && "text-gray-400")}>
                            {attach.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-8 pt-4">
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="w-full py-4 bg-brand-navy text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Study Content Modal */}
      <AnimatePresence>
        {showContentModal && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md bg-white rounded-[40px] p-8 shadow-2xl relative",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowContentModal(false)}
                className="absolute top-8 right-8 text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className={cn("text-2xl font-black text-brand-navy mb-8", settings.darkMode && "text-white")}>
                {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Título</label>
                  <input 
                    type="text"
                    value={contentForm.title}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-4 px-6 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Ex: Rezado de Ogum"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Categoria</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_CATEGORIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setContentForm({ ...contentForm, category: c })}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          contentForm.category === c 
                            ? "bg-brand-navy text-white border-brand-navy shadow-lg" 
                            : "bg-white border-gray-100 text-gray-400 hover:border-brand-copper/30"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Conteúdo</label>
                  <textarea 
                    value={contentForm.content}
                    onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                    rows={8}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-5 px-6 rounded-[32px] text-xs font-medium focus:ring-2 focus:ring-brand-copper/20 outline-none resize-none leading-relaxed",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Escreva as rezas, fundamentos, ou procedimentos..."
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Links (Opcional)</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className={cn(
                          "flex-1 bg-gray-50 border-0 py-3 px-4 rounded-xl text-xs font-bold outline-none",
                          settings.darkMode && "bg-black text-white"
                        )}
                        placeholder="https://..."
                        onKeyDown={(e) => e.key === 'Enter' && addLink()}
                      />
                      <button 
                        onClick={addLink}
                        className="p-3 bg-brand-copper text-white rounded-xl active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contentForm.links?.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-black/40 px-3 py-1.5 rounded-lg group">
                          <span className="text-[10px] font-bold text-gray-500 truncate max-w-[150px]">{link}</span>
                          <button onClick={() => removeLink(idx)} className="text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Anexos (PDFs ou Imagens)</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {contentForm.attachments?.map((attach, idx) => (
                        <div key={idx} className="relative group">
                          <div className={cn(
                            "flex flex-col items-center gap-1 p-3 rounded-2xl bg-gray-50",
                            settings.darkMode && "bg-black/40"
                          )}>
                            {attach.type === 'image' ? (
                              <img src={attach.data} className="w-full aspect-square object-cover rounded-lg" alt={attach.name} />
                            ) : (
                              <div className="w-full aspect-square bg-white dark:bg-white/10 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-brand-copper/40" />
                              </div>
                            )}
                            <span className="text-[8px] font-bold text-gray-400 truncate w-full text-center">{attach.name}</span>
                          </div>
                          <button 
                            onClick={() => removeAttachment(idx)}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className={cn(
                        "flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all",
                        settings.darkMode && "border-gray-800 hover:bg-black/40"
                      )}>
                        <Upload className="w-6 h-6 text-gray-300" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mt-2">Upload</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          className="hidden" 
                          onChange={handleAttachmentUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveContent}
                    className="w-full bg-brand-navy text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all text-xs"
                  >
                    Salvar Conteúdo
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
