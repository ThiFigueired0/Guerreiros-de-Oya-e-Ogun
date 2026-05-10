import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  BookOpen, Plus, Trash2, Edit2, Save, X, Search, ChevronRight, ChevronDown, Check, GraduationCap, FileText, Upload, Download, Eye, ExternalLink, Star, CheckCircle2,
  Book, MessageSquare, LayoutList, Sparkles, ScrollText, Flame, Bookmark, History, Settings, Bot, Loader2, Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { get, set, del } from 'idb-keyval';
import { useUndo } from '../hooks/useUndo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Greeting, StudyBook, AppSettings, StudyContent, GlossaryTerm } from '../types';
import { DEFAULT_GLOSSARY } from '../data/glossaryData';
import { askAI } from '../services/aiService';
import { generateGlossaryTerm, refineGlossaryDefinition } from '../services/glossaryAiService';
import { searchBooks, GoogleBook } from '../services/googleBooksService';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { PDFReader } from '../components/PDFReader';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

// IndexedDB PDF Storage Helpers
const PDF_STORE_PREFIX = 'templo_pdf_';

async function savePdfBinary(id: string, data: Blob | ArrayBuffer) {
  try {
    await set(`${PDF_STORE_PREFIX}${id}`, data);
  } catch (error) {
    console.error('Failed to save PDF to IDB:', error);
    throw error;
  }
}

async function getPdfBinary(id: string): Promise<Blob | null> {
  try {
    const data = await get(`${PDF_STORE_PREFIX}${id}`);
    if (!data) return null;
    if (data instanceof Blob) return data;
    return new Blob([data], { type: 'application/pdf' });
  } catch (error) {
    console.error('Failed to get PDF from IDB:', error);
    return null;
  }
}

async function deletePdfBinary(id: string) {
  try {
    await del(`${PDF_STORE_PREFIX}${id}`);
  } catch (error) {
    console.error('Failed to delete PDF from IDB:', error);
  }
}

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
    pushNotifications: false,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  const [books, setBooks, isBooksLoading] = useIdbStorage<StudyBook[]>('templo_books', []);
  const { user } = useAuth();
  const [isFetchingSupabase, setIsFetchingSupabase] = useState(false);

  // Load books from Supabase on mount
  useEffect(() => {
    const fetchBooksFromSupabase = async () => {
      if (!user) return;
      setIsFetchingSupabase(true);
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id)
          .order('id', { ascending: false });

        if (error) throw error;
        if (data) {
          const transformedBooks: StudyBook[] = data.map(item => ({
            id: item.id,
            name: item.title,
            author: item.author,
            uploadDate: Date.now(), // Fallback
            isFavorite: false,
            readingStatus: 'not_started',
            totalPages: 0,
            coverImage: item.cover_url,
            pdfUrl: item.pdf_url,
            toc: item.toc
          }));
          setBooks(transformedBooks);
        }
      } catch (error) {
        console.error('Error fetching books from Supabase:', error);
      } finally {
        setIsFetchingSupabase(false);
      }
    };

    fetchBooksFromSupabase();
  }, [user, setBooks]);

  const updateBookInSupabase = async (bookId: string, updates: Partial<StudyBook>) => {
    if (!user) return;
    
    // Map StudyBook fields to DB fields
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.title = updates.name;
    if (updates.author !== undefined) dbUpdates.author = updates.author;
    if (updates.coverImage !== undefined) dbUpdates.cover_url = updates.coverImage;
    if (updates.pdfUrl !== undefined) dbUpdates.pdf_url = updates.pdfUrl;
    if (updates.toc !== undefined) dbUpdates.toc = updates.toc;

    try {
      const { error } = await supabase
        .from('books')
        .update(dbUpdates)
        .eq('id', bookId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating book in Supabase:', error);
    }
  };
  const [greetings, setGreetings] = useStorage<Greeting[]>('templo_greetings', INITIAL_GREETINGS);
  const [studyContents, setStudyContents] = useStorage<StudyContent[]>('templo_study_docs', INITIAL_STUDY_CONTENTS);
  const [glossaryTerms, setGlossaryTerms] = useStorage<GlossaryTerm[]>('templo_glossary', []);
  const [aiGlossaryResponses, setAiGlossaryResponses] = useState<Record<string, string>>({});
  const [loadingAiTermId, setLoadingAiTermId] = useState<string | null>(null);

  // Sync glossary with DEFAULT_GLOSSARY
  useEffect(() => {
    // If completely empty, initialize everything
    if (glossaryTerms.length === 0) {
      const initializedTerms = DEFAULT_GLOSSARY.map((term, index) => ({
        ...term,
        id: `default-${index}-${Date.now()}`
      }));
      setGlossaryTerms(initializedTerms);
      return;
    }

    // Check for missing terms from the default set (by name)
    const existingTermNames = new Set(glossaryTerms.map(t => t.term));
    const missingTerms = DEFAULT_GLOSSARY.filter(t => !existingTermNames.has(t.term));

    if (missingTerms.length > 0) {
      const newTermsToAdd = missingTerms.map((term, index) => ({
        ...term,
        id: `default-sync-${index}-${Date.now()}`
      }));
      setGlossaryTerms(prev => [...prev, ...newTermsToAdd]);
    }
  }, [DEFAULT_GLOSSARY.length]);

  const GLOSSARY_CATEGORIES = useMemo(() => [
    'Orixás e Divindades',
    'Entidades e Linhas',
    'Fundamentos e Ritos',
    'Ervas e Elementos',
    'Tradição e História',
    'Geral e Espiritualidade'
  ], []);

  // Helper to map old/various categories to the new 6 standard categories
  const harmonizeCategory = useCallback((cat: string): string => {
    const c = cat.toLowerCase().trim();
    if (c.includes('orixá') || c.includes('divindade') || c.includes('inkice') || c.includes('vodun')) return 'Orixás e Divindades';
    if (c.includes('entidade') || c.includes('linha') || c.includes('guia') || c.includes('falange') || c.includes('kiumba') || c.includes('cambono')) return 'Entidades e Linhas';
    if (c.includes('fundamento') || c.includes('rito') || c.includes('ritual') || c.includes('axé') || c.includes('feitura') || c.includes('preceito')) return 'Fundamentos e Ritos';
    if (c.includes('erva') || c.includes('elemento') || c.includes('natureza') || c.includes('banho')) return 'Ervas e Elementos';
    if (c.includes('história') || c.includes('tradição') || c.includes('origem') || c.includes('revolta') || c.includes('quilombo') || c.includes('mestre')) return 'Tradição e História';
    
    // Default fallback
    return 'Geral e Espiritualidade';
  }, []);

  // Harmonize categories in LocalStorage once
  useEffect(() => {
    if (glossaryTerms.length > 0) {
      const needsHarmonization = glossaryTerms.some(t => !t.category || !GLOSSARY_CATEGORIES.includes(t.category));
      if (needsHarmonization) {
        setGlossaryTerms(prev => prev.map(t => ({
          ...t,
          category: (t.category && GLOSSARY_CATEGORIES.includes(t.category)) ? t.category : harmonizeCategory(t.category || '')
        })));
      }
    }
  }, [glossaryTerms.length, GLOSSARY_CATEGORIES, harmonizeCategory, setGlossaryTerms]);

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'greetings' | 'contents' | 'glossary'>('library');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['in_progress']);
  const [search, setSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookCoverDraft, setBookCoverDraft] = useState<string | null>(null);
  const [bookTitleDraft, setBookTitleDraft] = useState<string>('');
  const [bookAuthorDraft, setBookAuthorDraft] = useState<string>('');
  const [bookColorDraft, setBookColorDraft] = useState<string>('#b8860b'); // Default copper
  const [bookPdfDraft, setBookPdfDraft] = useState<{name: string, tempId: string | null, totalPages: number} | null>(null);
  const [isProcessingBook, setIsProcessingBook] = useState<string | false>(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<StudyBook | null>(null);
  const [showBookNotesModal, setShowBookNotesModal] = useState(false);
  const [bookNotesDraft, setBookNotesDraft] = useState('');
  const [bookLinksDraft, setBookLinksDraft] = useState<string[]>([]);
  const [bookAttachmentsDraft, setBookAttachmentsDraft] = useState<{name: string, type: 'image' | 'pdf', data: string}[]>([]);
  const [newBookLink, setNewBookLink] = useState('');
  const [viewingBook, setViewingBook] = useState<StudyBook | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  // Google Books Search State
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [googleBooksResults, setGoogleBooksResults] = useState<GoogleBook[]>([]);
  const [isSearchingGoogleBooks, setIsSearchingGoogleBooks] = useState(false);

  const performGoogleBooksSearch = async (query: string) => {
    if (!query || query.length < 3) {
      setGoogleBooksResults([]);
      return;
    }

    setIsSearchingGoogleBooks(true);
    try {
      const results = await searchBooks(query);
      setGoogleBooksResults(results);
    } catch (error) {
      console.error('Error searching Google Books:', error);
    } finally {
      setIsSearchingGoogleBooks(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bookSearchQuery) {
        performGoogleBooksSearch(bookSearchQuery);
      } else {
        setGoogleBooksResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bookSearchQuery]);

  const selectGoogleBook = (book: GoogleBook) => {
    setBookTitleDraft(book.title);
    setBookAuthorDraft(book.authors);
    setBookCoverDraft(book.coverUrl);
    setBookSearchQuery('');
    setGoogleBooksResults([]);
  };

  const { queueDelete } = useUndo();

  const addBookLink = () => {
    if (newBookLink) {
      setBookLinksDraft([...bookLinksDraft, newBookLink]);
      setNewBookLink('');
    }
  };
  
  const removeBookLink = (index: number) => {
    setBookLinksDraft(bookLinksDraft.filter((_, i) => i !== index));
  };

  const handleBookAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const type = file.type.includes('pdf') ? 'pdf' : 'image';
      setBookAttachmentsDraft(prev => [...prev, {
        name: file.name,
        type: type as 'pdf' | 'image',
        data: base64
      }]);
    };
    reader.readAsDataURL(file);
  };

  const removeBookAttachment = (index: number) => {
    setBookAttachmentsDraft(bookAttachmentsDraft.filter((_, i) => i !== index));
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameVal, setEditingNameVal] = useState('');
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [editingGreeting, setEditingGreeting] = useState<Greeting | null>(null);
  const [selectedGreeting, setSelectedGreeting] = useState<Greeting | null>(null);
  
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

  // Glossary State
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [editingGlossaryTerm, setEditingGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const [glossaryForm, setGlossaryForm] = useState<Partial<GlossaryTerm>>({ 
    term: '', 
    definition: '', 
    category: 'Geral e Espiritualidade' 
  });
  const [glossarySearch, setGlossarySearch] = useState('');
  const [isGlossaryCategoryOpen, setIsGlossaryCategoryOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryTerm | null>(null);
  const [glossaryCategoryFilter, setGlossaryCategoryFilter] = useState('Tudo');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isRefiningAi, setIsRefiningAi] = useState(false);

  const filteredGlossaryTerms = useMemo(() => {
    return glossaryTerms.filter(t => {
      const matchesSearch = t.term.toLowerCase().includes(glossarySearch.toLowerCase()) || 
                          t.definition.toLowerCase().includes(glossarySearch.toLowerCase());
      const matchesCategory = glossaryCategoryFilter === 'Tudo' || t.category === glossaryCategoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [glossaryTerms, glossarySearch, glossaryCategoryFilter]);

  const groupedGlossary = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredGlossaryTerms.forEach(term => {
      // Normalize to remove accents for the sorting key
      const normalizedString = term.term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const firstLetter = normalizedString.charAt(0).toUpperCase();
      const groupKey = /^[A-Z]$/.test(firstLetter) ? firstLetter : '#';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(term);
    });
    return groups;
  }, [filteredGlossaryTerms]);

  const glossaryCategories = useMemo(() => {
    const catsAndCounts: Record<string, number> = { 'Tudo': glossaryTerms.length };
    
    // Initialize all standard categories with 0
    GLOSSARY_CATEGORIES.forEach(cat => {
      catsAndCounts[cat] = 0;
    });

    glossaryTerms.forEach(t => {
      if (t.category && t.category in catsAndCounts) {
        catsAndCounts[t.category]++;
      } else if (t.category) {
        // This case should be handled by migration, but just in case
        catsAndCounts['Geral e Espiritualidade']++;
      }
    });

    return Object.entries(catsAndCounts)
      .sort(([a], [b]) => {
        if (a === 'Tudo') return -1;
        if (b === 'Tudo') return 1;
        return a.localeCompare(b);
      })
      .map(([name, count]) => ({ name, count }));
  }, [glossaryTerms, GLOSSARY_CATEGORIES]);

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

  const COVER_COLORS = [
    { name: 'Cobre', value: '#b8860b' },
    { name: 'Branco', value: '#ffffff' },
    { name: 'Marinho', value: '#001c38' },
    { name: 'Vermelho', value: '#8b0000' },
    { name: 'Verde', value: '#006400' },
    { name: 'Roxo', value: '#4b0082' },
    { name: 'Preto', value: '#0a0a0a' },
  ];

  const handleBookCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBookCoverDraft(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveNewBook = async () => {
    console.log("=== INICIANDO PROCESSO DE SALVAMENTO ===");
    console.log("Iniciando salvamento...", { user, file: bookPdfDraft });
    
    if (!bookPdfDraft || !bookPdfDraft.tempId) {
      alert("Erro: Nenhum arquivo PDF selecionado ou processado corretamente.");
      return;
    }

    if (!user) {
      alert("Erro: Você precisa estar logado para adicionar livros. Por favor, faça login novamente.");
      return;
    }

    setIsProcessingBook("Verificando login...");
    
    try {
      // 0. Verificação de Sessão (Obrigatória para o Preview)
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
         console.error("Erro ao verificar sessão ativa no servidor:", authError);
         alert("Erro de autenticação com o servidor. Por favor, feche e abra o aplicativo, ou faça login novamente.");
         setIsProcessingBook(false);
         return;
      }

      console.log("Usuário autenticado no servidor:", currentUser.email, "(ID:", currentUser.id, ")");

      setIsProcessingBook("Enviando arquivo...");
      
      // Get the binary from temp storage
      const blob = await getPdfBinary(bookPdfDraft.tempId);
      if (!blob) throw new Error("O arquivo PDF temporário sumiu do cache local. Tente selecionar o arquivo novamente.");

      const bookId = Date.now().toString();
      const fileName = `${currentUser.id}/${bookId}.pdf`;
      
      console.log(`Iniciando upload para Storage. Bucket: books, Caminho: ${fileName}`);
      
      // 1. Upload PDF
      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.error("Erro específico do Storage:", uploadError);
        throw new Error(`Erro no Storage (Upload): ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(fileName);

      // 3. Preparar dados para o Banco
      const newBookData = {
        user_id: currentUser.id,
        title: bookTitleDraft || bookPdfDraft.name,
        author: bookAuthorDraft || 'Desconhecido',
        cover_url: bookCoverDraft || '',
        pdf_url: publicUrl,
        toc: []
      };

      console.log("DADOS SENDO ENVIADOS PARA A TABELA 'books':", newBookData);

      setIsProcessingBook("Cadastrando na estante...");
      
      // 4. Inserção na Tabela
      const { data: insertedData, error: dbError } = await supabase
        .from('books')
        .insert([newBookData])
        .select()
        .single();

      if (dbError) {
        console.error("Erro ao inserir na tabela 'books':", dbError);
        throw new Error(`Erro no Banco de Dados: ${dbError.message}`);
      }

      if (!insertedData) {
        throw new Error("O livro foi salvo, mas não conseguimos recuperar os dados confirmados do banco.");
      }

      console.log("Sucesso! Livro inserido:", insertedData);

      // 5. Atualizar estado local
      const newBook: StudyBook = {
        id: insertedData.id,
        name: insertedData.title,
        author: insertedData.author,
        uploadDate: Date.now(),
        isFavorite: false,
        readingStatus: 'not_started',
        totalPages: bookPdfDraft.totalPages,
        coverImage: insertedData.cover_url,
        pdfUrl: insertedData.pdf_url,
        toc: insertedData.toc || []
      };

      setBooks(prev => [newBook, ...prev]);
      
      // 6. Limpeza e fechamento
      try {
        await deletePdfBinary(bookPdfDraft.tempId);
      } catch (e) {
        console.warn("Falha ao limpar cache temporário, mas o livro foi salvo.", e);
      }
      
      setShowBookModal(false);
      setBookPdfDraft(null);
      setBookTitleDraft('');
      setBookAuthorDraft('');
      setBookCoverDraft(null);
      setBookColorDraft('#b8860b');
      setBookSearchQuery('');
      setGoogleBooksResults([]);
      
      alert("Sucesso! Livro adicionado à sua estante.");

    } catch (error: any) {
      console.error("=== ERRO CRÍTICO NO SALVAMENTO ===");
      console.error(error);
      
      // Alerta amigável com erro técnico
      alert(
        "FALHA AO SALVAR O LIVRO\n\n" + 
        "Erro: " + (error.message || "Erro desconhecido") + "\n\n" +
        "Verifique se você está logado e se as tabelas do Supabase estão configuradas corretamente conforme as instruções."
      );
    } finally {
      console.log("Processo finalizado. Resetando estado de loading.");
      setIsProcessingBook(false);
    }
  };

  // PDF Upload
  const handlePdfPreview = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    console.log("handlePdfPreview started");
    setIsProcessingBook("Processando documento...");

    try {
      const tempId = `temp_${Date.now()}`;
      console.log("Saving temp PDF binary...", tempId);
      await savePdfBinary(tempId, file);
      
      console.log("Loading PDF metadata...");
      const url = URL.createObjectURL(file);
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      await pdf.destroy();
      URL.revokeObjectURL(url);
      
      console.log("PDF processed. Pages:", totalPages);
      setBookPdfDraft({
        name: file.name,
        tempId: tempId,
        totalPages
      });

      if (!bookTitleDraft) {
        setBookTitleDraft(file.name.replace('.pdf', ''));
      }
    } catch(err) {
       console.error("Error on handlePdfPreview:", err);
       alert("Ocorreu um erro ao processar o arquivo.");
    } finally {
      setIsProcessingBook(false);
      e.target.value = '';
    }
  };

  const cancelBookUpload = async () => {
    if (bookPdfDraft?.tempId) {
      await deletePdfBinary(bookPdfDraft.tempId);
    }
    setBookPdfDraft(null);
    setBookTitleDraft('');
    setBookAuthorDraft('');
    setBookCoverDraft(null);
    setBookSearchQuery('');
    setGoogleBooksResults([]);
    setShowBookModal(false);
  };

  const deleteBook = (book: StudyBook) => {
    queueDelete({
      id: book.id,
      label: book.name.replace('.pdf', ''),
      timestamp: Date.now(),
      onConfirm: async () => {
        // Delete locally
        setBooks((prev: StudyBook[]) => prev.filter(b => b.id !== book.id));
        deletePdfBinary(book.id);

        // Delete from Supabase
        if (user) {
          try {
            // 1. Delete from DB
            await supabase
              .from('books')
              .delete()
              .eq('id', book.id)
              .eq('user_id', user.id);

            // 2. Delete from Storage
            const fileName = `${user.id}/${book.id}.pdf`;
            await supabase.storage
              .from('books')
              .remove([fileName]);
          } catch (error) {
            console.error('Error deleting from Supabase:', error);
          }
        }
      }
    });
  };

  const openBook = async (book: StudyBook) => {
    setIsProcessingBook("Abrindo...");
    try {
      const blob = await getPdfBinary(book.id);
      let url = '';
      
      if (blob) {
        url = URL.createObjectURL(blob);
      } else if (book.pdfUrl) {
        // If not in local cache, use the Supabase public URL
        url = book.pdfUrl;
      } else if (book.pdfBase64) {
        url = book.pdfBase64;
      } else {
        alert("Arquivo não encontrado. Tente baixar novamente.");
        setIsProcessingBook(false);
        return;
      }

      setViewingUrl(url);
      setViewingBook(book);
    } catch (error) {
      console.error("Error opening book:", error);
      alert("Erro ao abrir o arquivo.");
    } finally {
      setIsProcessingBook(false);
    }
  };

  const closeBook = () => {
    if (viewingUrl && viewingUrl.startsWith('blob:')) {
      URL.revokeObjectURL(viewingUrl);
    }
    setViewingUrl(null);
    setViewingBook(null);
  };

  // Migration from Base64 to IDB Blobs
  useEffect(() => {
    const migrate = async () => {
      const legacyBooks = books.filter(b => b.pdfBase64);
      if (legacyBooks.length === 0) return;

      const updatedBooks = [...books];
      let changed = false;

      for (const book of legacyBooks) {
        try {
          if (!book.pdfBase64) continue;
          
          const response = await fetch(book.pdfBase64);
          const blob = await response.blob();
          await savePdfBinary(book.id, blob);
          
          const index = updatedBooks.findIndex(b => b.id === book.id);
          if (index !== -1) {
            updatedBooks[index] = { ...updatedBooks[index], pdfBase64: undefined };
            changed = true;
          }
        } catch (error) {
          console.error(`Migration failed for book ${book.id}:`, error);
        }
      }

      if (changed) {
        setBooks(updatedBooks);
      }
    };

    if (!isBooksLoading && books.length > 0) {
      migrate();
    }
  }, [isBooksLoading, books.length]); // Use length as proxy for items to migrate

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

  const deleteGreeting = (g: Greeting) => {
    queueDelete({
      id: g.id,
      label: g.entity,
      timestamp: Date.now(),
      onConfirm: () => {
        setGreetings((prev: Greeting[]) => prev.filter(item => item.id !== g.id));
      }
    });
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
    const updates = { 
      notes: bookNotesDraft,
      links: bookLinksDraft,
      attachments: bookAttachmentsDraft
    };
    setBooks(books.map(b => b.id === selectedBookForAction.id ? { ...b, ...updates } : b));
    updateBookInSupabase(selectedBookForAction.id, updates);
    
    setShowBookNotesModal(false);
    setSelectedBookForAction(null);
  };

  const openBookDetails = async (book: StudyBook) => {
    setSelectedBookForAction(book);
    setBookNotesDraft(book.notes || '');
    setBookLinksDraft(book.links || []);
    setBookAttachmentsDraft(book.attachments || []);
    setEditingNameVal(book.name.replace('.pdf', ''));
    setIsEditingName(false);
    
    // If total pages is missing, try to calculate it now
    if (!book.totalPages || book.totalPages === 0) {
      try {
        const blob = await getPdfBinary(book.id);
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const totalPages = pdf.numPages;
        await pdf.destroy();
        URL.revokeObjectURL(url);
        
        // Update both state and local selection
        const updatedBook = { ...book, totalPages };
        setBooks(books.map(b => b.id === book.id ? updatedBook : b));
        setSelectedBookForAction(updatedBook);
      } catch (error) {
        console.error('Failed to recover total pages:', error);
      }
    }
  };

  const toggleBookFavorite = (id: string) => {
    const book = books.find(b => b.id === id);
    if (!book) return;

    const newFavoriteStatus = !book.isFavorite;
    setBooks(books.map(b => b.id === id ? { ...b, isFavorite: newFavoriteStatus } : b));
    updateBookInSupabase(id, { isFavorite: newFavoriteStatus });

    if (selectedBookForAction && selectedBookForAction.id === id) {
      setSelectedBookForAction({ ...selectedBookForAction, isFavorite: newFavoriteStatus });
    }
  };

  const updateBookStatus = (id: string, status: StudyBook['readingStatus'], lastPage?: number) => {
    const lastRead = Date.now();
    const updates = { readingStatus: status, lastPage: lastPage ?? undefined, lastRead };
    
    setBooks(books.map(b => b.id === id ? { ...b, ...updates, lastPage: lastPage ?? b.lastPage } : b));
    updateBookInSupabase(id, updates);
    
    if (viewingBook && viewingBook.id === id) {
      setViewingBook({
        ...viewingBook,
        ...updates,
        lastPage: lastPage ?? viewingBook.lastPage
      });
    }

    if (selectedBookForAction && selectedBookForAction.id === id) {
      setSelectedBookForAction({ 
        ...selectedBookForAction, 
        ...updates,
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
    updateBookInSupabase(selectedBookForAction.id, { name: newName });
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

  const handleSaveGlossaryTerm = () => {
    const { term, definition, category } = glossaryForm;
    if (!term || !definition) return;
    
    const normalizedTerm = term.toLowerCase().trim();
    
    // Duplicity check
    const isDuplicate = glossaryTerms.some(t => 
      t.term.toLowerCase().trim() === normalizedTerm && 
      (!editingGlossaryTerm || t.id !== editingGlossaryTerm.id)
    );

    if (isDuplicate) {
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 3000);
      return;
    }

    const newTerm: GlossaryTerm = {
      id: editingGlossaryTerm ? editingGlossaryTerm.id : Date.now().toString(),
      term,
      definition,
      category: category || 'Geral e Espiritualidade'
    };

    if (editingGlossaryTerm) {
      setGlossaryTerms(glossaryTerms.map(t => t.id === editingGlossaryTerm.id ? newTerm : t));
    } else {
      setGlossaryTerms([...glossaryTerms, newTerm]);
    }
    
    setShowGlossaryModal(false);
    setEditingGlossaryTerm(null);
    setGlossaryForm({ term: '', definition: '', category: 'Geral e Espiritualidade' });
  };

  const handleAiGenerate = async () => {
    if (!glossaryForm.term) return;
    setIsGeneratingAi(true);
    try {
      const result = await generateGlossaryTerm(glossaryForm.term);
      setGlossaryForm(prev => ({
        ...prev,
        definition: result.definition,
        category: result.category || 'Geral e Espiritualidade'
      }));
    } catch (error) {
      console.error("Erro ao gerar com IA:", error);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAiRefine = async () => {
    if (!glossaryForm.term || !glossaryForm.definition) return;
    setIsRefiningAi(true);
    try {
      const refined = await refineGlossaryDefinition(glossaryForm.term, glossaryForm.definition);
      setGlossaryForm(prev => ({ ...prev, definition: refined }));
    } catch (error) {
      console.error("Erro ao refinar com IA:", error);
    } finally {
      setIsRefiningAi(false);
    }
  };

  const deleteContent = (item: StudyContent, e: React.MouseEvent) => {
    e.stopPropagation();
    queueDelete({
      id: item.id,
      label: item.title,
      timestamp: Date.now(),
      onConfirm: () => {
        setStudyContents((prev: StudyContent[]) => prev.filter(c => c.id !== item.id));
      }
    });
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
    { id: 'not_started', label: 'Bibliotecas / Pendentes', icon: FileText, color: 'text-gray-400' },
    { id: 'completed', label: 'Livros Lidos', icon: CheckCircle2, color: 'text-green-500' }
  ];

  const categories = ['Gira', 'Entidades', 'Orixás'];
  const filteredGreetings = greetings.filter(g => 
    g.entity.toLowerCase().includes(search.toLowerCase()) || 
    g.greeting.toLowerCase().includes(search.toLowerCase())
  );

  const libraryStats = {
    total: books.length,
    inProgress: books.filter(b => b.readingStatus === 'in_progress').length,
    pending: books.filter(b => b.readingStatus === 'not_started').length,
    completed: books.filter(b => b.readingStatus === 'completed').length
  };

  const inProgressBooks = books
    .filter(b => b.readingStatus === 'in_progress')
    .sort((a, b) => (b.lastRead || (b.uploadDate)) - (a.lastRead || (a.uploadDate)));

  const lastReadBook = inProgressBooks[0];

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
        <button 
          onClick={() => setActiveSubTab('glossary')}
          className={cn(
            "flex-1 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5",
            activeSubTab === 'glossary' 
              ? "bg-brand-navy text-white shadow-md" 
              : "text-gray-400 hover:text-brand-navy"
          )}
        >
          <ScrollText className="w-3.5 h-3.5" />
          <span className="leading-none">Glossário</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewingBook && (
          <PDFReader
            key={viewingBook.id}
            bookId={viewingBook.id}
            title={viewingBook.name.replace('.pdf', '')}
            pdfUrl={viewingUrl || ''}
            initialPage={viewingBook.lastPage || 1}
            totalPages={viewingBook.totalPages}
            initialToc={viewingBook.toc}
            onClose={closeBook}
            onTocChange={(toc) => {
              // Mantém persistência na interface sem duplicar a chamada DB que já ocorre no PDFReader
              setBooks(prev => prev.map(b => b.id === viewingBook.id ? { ...b, toc } : b));
              setViewingBook(prev => prev ? { ...prev, toc } : null);
            }}
            onPageChange={(page) => {
              const status = (viewingBook.totalPages && page >= viewingBook.totalPages) ? 'completed' : 'in_progress';
              updateBookStatus(viewingBook.id, status, page);
            }}
          />
        )}

        {activeSubTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-8"
          >
            {/* Library Header & Stats */}
            <div className="px-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-navy/5 flex items-center justify-center">
                    <Book className="w-5 h-5 text-brand-navy" />
                  </div>
                  <div>
                    <h2 className={cn("text-lg font-black text-brand-navy", settings.darkMode && "text-white")}>Minha Estante</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Organização de leituras</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowBookModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-xl shadow-lg shadow-brand-navy/20 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-8">
                {[
                  { label: 'Total', value: libraryStats.total, color: 'bg-brand-navy' },
                  { label: 'Lendo', value: libraryStats.inProgress, color: 'bg-brand-copper' },
                  { label: 'Pendente', value: libraryStats.pending, color: 'bg-gray-400' },
                  { label: 'Lido', value: libraryStats.completed, color: 'bg-green-500' }
                ].map((stat, i) => (
                  <div key={i} className={cn(
                    "p-2 rounded-xl flex flex-col items-center gap-1 border border-gray-100",
                    settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white"
                  )}>
                    <span className="text-[7px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap">{stat.label}</span>
                    <span className={cn("text-sm font-black", settings.darkMode ? "text-white" : "text-brand-navy")}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Section: Continue Reading */}
            {inProgressBooks.length > 0 && (
              <section className="px-1 overflow-visible">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-brand-copper" />
                  <h3 className={cn("text-[10px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-300" : "text-brand-navy")}>
                    Continuar de onde parou
                  </h3>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide px-1">
                  {inProgressBooks.map((book) => (
                    <motion.div 
                      key={book.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openBookDetails(book)}
                      className={cn(
                        "flex-shrink-0 w-[280px] p-4 rounded-[32px] border border-gray-100 shadow-lg flex items-center gap-4 cursor-pointer relative overflow-hidden group",
                        settings.darkMode ? "bg-gradient-to-br from-[#1A1A1A] to-[#111] border-gray-800" : "bg-gradient-to-br from-white to-gray-50"
                      )}
                    >
                      {/* Visual Background Decoration */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-copper/5 rounded-full blur-2xl -mr-8 -mt-8" />
                      
                      <div 
                        className="w-16 h-24 rounded-xl shadow-md flex items-center justify-center relative overflow-hidden shrink-0"
                        style={{ backgroundColor: !book.coverImage ? (book.coverColor || '#b8860b') : 'transparent' }}
                      >
                        {book.coverImage ? (
                          <img src={book.coverImage} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-y-0 left-0 w-2 bg-black/10 border-r border-black/5" />
                            <FileText className="w-6 h-6 text-white/20" />
                          </>
                        )}
                        <div className="absolute bottom-1 right-1 p-0.5 bg-brand-gold rounded-full shadow-sm">
                          <BookOpen className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                        <h4 className={cn("text-[11px] font-black leading-tight truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>
                          {book.name.replace('.pdf', '')}
                        </h4>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center px-0.5">
                            <span className="text-[7px] font-black text-brand-copper uppercase tracking-widest">
                              {book.lastPage || 0}/{book.totalPages || '?'}
                            </span>
                            {(book.totalPages || 0) > 0 && (
                              <span className="text-[7px] font-black opacity-40">
                                {Math.round(((book.lastPage || 0) / (book.totalPages || 1)) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="h-1 bg-gray-100 dark:bg-black/40 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, book.totalPages && book.totalPages > 0 ? ((book.lastPage || 0) / book.totalPages) * 100 : 0)}%` }}
                              className="h-full bg-brand-copper rounded-full"
                            />
                          </div>
                        </div>

                        <span className="flex items-center gap-1 mt-0.5 text-[8px] font-black uppercase tracking-widest text-brand-copper">
                          Continuar <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Books List Section */}
            <section className="px-1">
              <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Pesquisar na minha estante..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 py-4 pl-12 pr-4 rounded-2xl text-xs font-bold transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-copper/10",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              <div className="space-y-6">
                {bookCategories.map((cat) => {
                  const catBooks = getBooksByStatus(cat.id as any);
                  const isExpanded = expandedCategories.includes(cat.id) || bookSearch.length > 0;
                  
                  if (catBooks.length === 0 && bookSearch) return null;
                  
                  // Hide empty categories unless they have results in search
                  if (catBooks.length === 0 && !bookSearch) return null;

                  return (
                    <div key={cat.id} className={cn(
                      "flex flex-col gap-4",
                      cat.id === 'completed' && "pt-6 border-t dark:border-white/5"
                    )}>
                      <button 
                        onClick={() => toggleCategory(cat.id)}
                        className="flex items-center justify-between px-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-sm", 
                            cat.color.replace('text-', 'bg-'),
                            cat.id === 'completed' && "bg-green-500"
                          )} />
                          <h4 className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em]", 
                            settings.darkMode ? "text-gray-400" : "text-brand-navy/60",
                            cat.id === 'completed' && "text-green-600/60 dark:text-green-500/60"
                          )}>
                            {cat.label}
                          </h4>
                          <span className="text-[9px] font-bold opacity-30">({catBooks.length})</span>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 text-gray-300 transition-transform duration-300",
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
                            {catBooks.length === 0 ? (
                              <div className={cn(
                                "mx-1 p-10 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-2",
                                settings.darkMode && "border-gray-800"
                              )}>
                                <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest">Nenhum livro</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4 pb-4 px-1">
                                {catBooks.map((book) => (
                                  <motion.div 
                                    key={book.id}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => openBookDetails(book)}
                                    className={cn(
                                      "bg-white p-3 rounded-[28px] shadow-sm border border-gray-100 flex flex-col gap-3 group relative cursor-pointer active:shadow-md transition-all",
                                      settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl",
                                      book.readingStatus === 'completed' && "opacity-75 grayscale-[0.3]"
                                    )}
                                  >
                                    <div 
                                      className="w-full aspect-[3/4.2] rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 shadow-sm"
                                      style={{ backgroundColor: !book.coverImage ? (book.coverColor || '#b8860b') : 'transparent' }}
                                    >
                                      {book.coverImage ? (
                                        <img src={book.coverImage} className="w-full h-full object-cover" />
                                      ) : (
                                        <>
                                          <div className="absolute inset-y-0 left-0 w-2 bg-black/10 border-r border-black/5" />
                                          <FileText className="w-10 h-10 text-white/20 group-hover:scale-110 transition-transform duration-500" />
                                        </>
                                      )}
                                      
                                      {book.isFavorite && (
                                        <div className="absolute top-2 right-2 p-1.5 bg-brand-red rounded-full shadow-lg">
                                          <Star className="w-2.5 h-2.5 text-white fill-white" />
                                        </div>
                                      )}
                                      
                                      {book.readingStatus === 'completed' && (
                                        <div className="absolute top-2 left-2 p-1 bg-green-500 rounded-full shadow-lg">
                                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </div>
                                      )}

                                      {book.readingStatus === 'in_progress' && (
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex flex-col pt-6">
                                          <div className="flex justify-between items-center mb-1 px-0.5">
                                            <span className="text-[7px] font-black text-white uppercase tracking-widest drop-shadow-sm">
                                              {Math.round(((book.lastPage || 0) / (book.totalPages || 1)) * 100)}%
                                            </span>
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
                                    
                                    <div className="px-1 pb-1">
                                      <h3 className={cn(
                                        "text-[10px] font-black text-brand-navy line-clamp-2 leading-[1.3] group-hover:text-brand-copper transition-colors", 
                                        settings.darkMode && "text-white group-hover:text-brand-copper"
                                      )}>
                                        {book.name.replace('.pdf', '')}
                                      </h3>
                                      {book.author && (
                                        <p className="text-[8px] text-gray-400 font-bold uppercase truncate mt-0.5">
                                          {book.author}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="text-[8px] font-bold text-gray-400 capitalize">
                                          {book.uploadDate ? new Date(book.uploadDate).toLocaleDateString() : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
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
                                if (g.summary || g.imageUrl || (settings.orixaPhotos && settings.orixaPhotos[g.entity])) {
                                  setSelectedGreeting(g);
                                }
                              }}
                              className={cn(
                                "bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer active:scale-[0.99] transition-transform",
                                settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-lg"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-full border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 dark:bg-white/5",
                                  settings.darkMode && "border-gray-800"
                                )}>
                                  {(settings.orixaPhotos && settings.orixaPhotos[g.entity]) ? (
                                    <img src={settings.orixaPhotos[g.entity]} alt={g.entity} className="w-full h-full object-cover" />
                                  ) : g.imageUrl ? (
                                    <img src={g.imageUrl} alt={g.entity} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{g.entity.substring(0, 2)}</div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] text-brand-copper font-bold uppercase tracking-wider">{g.entity}</span>
                                  <span className={cn("text-sm font-black text-brand-navy", settings.darkMode && "text-white")}>{g.greeting}</span>
                                </div>
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
                                    deleteGreeting(g);
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
                            onClick={(e) => deleteContent(content, e)}
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

        {activeSubTab === 'glossary' && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <section className="mb-10 px-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-copper" />
                    <h2 className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Glossário umbandista</h2>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {filteredGlossaryTerms.length} de {glossaryTerms.length} termos
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setEditingGlossaryTerm(null);
                    setGlossaryForm({ term: '', definition: '', category: 'Geral e Espiritualidade' });
                    setShowGlossaryModal(true);
                  }}
                  className="text-[10px] uppercase font-black tracking-widest text-brand-copper bg-brand-copper/10 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                >
                  Adicionar
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar termo..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className={cn(
                    "w-full bg-white border border-gray-100 py-3 pl-10 pr-4 rounded-2xl text-[11px] font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-copper/20 flex-1",
                    settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white"
                  )}
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <LayoutList className="w-3 h-3 text-brand-copper" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-copper">Filtrar por Categoria</span>
                </div>
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
                  {glossaryCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setGlossaryCategoryFilter(cat.name)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2",
                        glossaryCategoryFilter === cat.name
                          ? "bg-brand-copper text-white shadow-md shadow-brand-copper/20 scale-105"
                          : settings.darkMode 
                            ? "bg-[#1A1A1A] text-gray-400 border border-gray-800" 
                            : "bg-white text-gray-500 border border-gray-100 shadow-sm"
                      )}
                    >
                      {cat.name}
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-lg text-[8px]",
                        glossaryCategoryFilter === cat.name
                          ? "bg-white/20 text-white"
                          : "bg-brand-copper/10 text-brand-copper"
                      )}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {filteredGlossaryTerms.length === 0 ? (
                  <div className={cn(
                    "p-12 border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 text-center",
                    settings.darkMode && "border-gray-800"
                  )}>
                    <BookOpen className="w-12 h-12 text-gray-200" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nenhum termo encontrado</p>
                      <p className="text-[10px] text-gray-300 max-w-[200px]">Adicione palavras ao glossário para consulta futura.</p>
                    </div>
                  </div>
                ) : (
                  Object.entries(groupedGlossary)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([letter, terms]) => (
                      <div key={letter} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border",
                            settings.darkMode 
                              ? "bg-brand-copper/10 border-brand-copper/20 text-brand-copper" 
                              : "bg-white border-brand-copper/10 text-brand-copper shadow-brand-copper/5"
                          )}>
                            {letter}
                          </div>
                          <div className="h-px flex-1 bg-gradient-to-r from-brand-copper/10 to-transparent" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {terms.map((term) => (
                            <motion.div
                              key={term.id}
                              onClick={() => setSelectedGlossaryTerm(term)}
                              className={cn(
                                "p-5 bg-white rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-3 group relative cursor-pointer active:scale-[0.99] transition-all",
                                settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                  {term.category && (
                                    <span className={cn(
                                      "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg w-fit bg-brand-copper/10 text-brand-copper"
                                    )}>
                                      {term.category}
                                    </span>
                                  )}
                                  <h3 className={cn("text-sm font-black text-brand-navy mt-1", settings.darkMode && "text-white")}>
                                    {term.term}
                                  </h3>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingGlossaryTerm(term);
                                      setGlossaryForm({ ...term });
                                      setShowGlossaryModal(true);
                                    }}
                                    className="p-2 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-xl hover:text-brand-copper transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      queueDelete({
                                        id: term.id,
                                        label: term.term,
                                        timestamp: Date.now(),
                                        onConfirm: () => {
                                          setGlossaryTerms((prev: GlossaryTerm[]) => prev.filter(t => t.id !== term.id));
                                        }
                                      });
                                    }}
                                    className="p-2 bg-red-50/50 text-red-400 rounded-xl hover:text-brand-red transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <p className={cn("text-xs text-gray-500 leading-relaxed font-medium line-clamp-2", settings.darkMode && "text-gray-400")}>
                                {term.definition}
                              </p>

                              <AnimatePresence>
                                {aiGlossaryResponses[term.id] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 pt-3 border-t border-brand-copper/10"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <Sparkles className="w-3 h-3 text-brand-copper" />
                                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-copper">Insight do Assistente</span>
                                    </div>
                                    <p className={cn(
                                      "text-[11px] font-bold leading-relaxed italic",
                                      settings.darkMode ? "text-brand-copper/80" : "text-brand-navy"
                                    )}>
                                      {aiGlossaryResponses[term.id]}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <div className="mt-2 flex justify-end">
                                <button
                                  disabled={loadingAiTermId === term.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (aiGlossaryResponses[term.id]) {
                                      setAiGlossaryResponses(prev => {
                                        const next = { ...prev };
                                        delete next[term.id];
                                        return next;
                                      });
                                      return;
                                    }
                                    
                                    setLoadingAiTermId(term.id);
                                    try {
                                      const prompt = `Como um guia de estudos umbandista, forneça uma explicação mais profunda e detalhada para o termo "${term.term}", contextualizando-o na Umbanda, Candomblé ou Quimbanda conforme apropriado. Seja conciso mas rico em fundamentos.`;
                                      const response = await askAI(prompt);
                                      setAiGlossaryResponses(prev => ({ ...prev, [term.id]: response }));
                                    } catch (error) {
                                      console.error('AI Error:', error);
                                    } finally {
                                      setLoadingAiTermId(null);
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95",
                                    aiGlossaryResponses[term.id] 
                                      ? "bg-brand-copper text-white" 
                                      : "bg-brand-copper/10 text-brand-copper hover:bg-brand-copper/20"
                                  )}
                                >
                                  {loadingAiTermId === term.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Bot className="w-3 h-3" />
                                  )}
                                  {aiGlossaryResponses[term.id] ? 'Fechar Dúvida' : 'Tirar Dúvida com IA'}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
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
          <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setSelectedGreeting(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {(selectedGreeting.imageUrl || (settings.orixaPhotos && settings.orixaPhotos[selectedGreeting.entity])) && (
                <div className="relative h-64 w-full">
                  <img 
                    src={settings.orixaPhotos?.[selectedGreeting.entity] || selectedGreeting.imageUrl} 
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
                {!(selectedGreeting.imageUrl || (settings.orixaPhotos && settings.orixaPhotos[selectedGreeting.entity])) && (
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
          <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={cancelBookUpload}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-lg sm:text-xl font-black text-brand-navy mb-2", settings.darkMode && "text-white")}>
                Adicionar Livro
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">Personalize sua biblioteca digital</p>

              <div className="space-y-6">
                {/* Google Books Search */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Buscar dados (Opcional)</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      placeholder="Busque por título ou autor..."
                      className={cn(
                        "w-full bg-gray-50 border-0 py-3 pl-11 pr-10 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                        settings.darkMode && "bg-black text-white"
                      )}
                    />
                    {bookSearchQuery && !isSearchingGoogleBooks && (
                      <button 
                        onClick={() => {
                          setBookSearchQuery('');
                          setGoogleBooksResults([]);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {isSearchingGoogleBooks && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-copper animate-spin" />
                    )}
                  </div>

                  <AnimatePresence>
                    {googleBooksResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "mt-2 max-h-48 overflow-y-auto rounded-2xl border border-gray-100 shadow-xl bg-white z-10 custom-scrollbar",
                          settings.darkMode && "bg-[#1A1A1A] border-gray-800"
                        )}
                      >
                        {googleBooksResults.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => selectGoogleBook(book)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors",
                              settings.darkMode && "hover:bg-white/5"
                            )}
                          >
                            <div className="w-10 h-14 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} className="w-full h-full object-cover" />
                              ) : (
                                <Book className="w-4 h-4 m-auto text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-[11px] font-bold truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>{book.title}</p>
                              <p className="text-[9px] text-gray-400 truncate">{book.authors}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Book Title */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Título do Livro</label>
                  <input 
                    type="text"
                    value={bookTitleDraft}
                    onChange={(e) => setBookTitleDraft(e.target.value)}
                    placeholder="Ex: O Livro dos Espíritos"
                    className={cn(
                      "w-full bg-gray-50 border-0 py-3 px-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                  />
                </div>

                {/* Book Author */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Autor(a)</label>
                  <input 
                    type="text"
                    value={bookAuthorDraft}
                    onChange={(e) => setBookAuthorDraft(e.target.value)}
                    placeholder="Ex: Allan Kardec"
                    className={cn(
                      "w-full bg-gray-50 border-0 py-3 px-4 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                  />
                </div>

                {/* PDF Selection */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Arquivo PDF</label>
                  {isProcessingBook ? (
                    <div className={cn(
                      "flex flex-col items-center justify-center p-8 border-2 border-dashed border-brand-copper/30 rounded-3xl bg-brand-copper/5 cursor-wait transition-all",
                      settings.darkMode && "bg-brand-copper/10"
                    )}>
                      <Book className="w-6 h-6 text-brand-copper animate-pulse mb-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-copper animate-pulse">
                        {typeof isProcessingBook === 'string' ? isProcessingBook : 'Carregando...'}
                      </span>
                    </div>
                  ) : !bookPdfDraft ? (
                    <label className={cn(
                      "flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 cursor-pointer hover:bg-brand-copper/5 hover:border-brand-copper/30 transition-all group",
                      settings.darkMode && "bg-black/50 border-gray-800"
                    )}>
                      <Upload className="w-6 h-6 text-brand-copper/40 group-hover:scale-110 transition-transform mb-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/60">Escolher PDF</span>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handlePdfPreview}
                        className="hidden" 
                      />
                    </label>
                  ) : (
                    <>
                      <div className={cn(
                        "p-4 rounded-2xl bg-brand-navy/5 flex items-center justify-between border border-brand-navy/10",
                        settings.darkMode && "bg-brand-navy/20"
                      )}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={cn("text-xs font-bold truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>{bookPdfDraft.name}</span>
                          </div>
                          {bookPdfDraft.tempId && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <FileText className="w-3 h-3 text-brand-copper" />
                              <span className="text-[10px] text-gray-400 font-medium">PDF vinculado</span>
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={async () => {
                            if (bookPdfDraft?.tempId) {
                              await deletePdfBinary(bookPdfDraft.tempId);
                            }
                            setBookPdfDraft(null);
                          }} 
                          className="text-brand-red p-1 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Cover Customization */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Capa do Livro</label>
                  
                  <div className="flex gap-4">
                    {/* Cover Preview / Image Upload */}
                    <label className={cn(
                      "w-20 h-28 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all shrink-0 relative overflow-hidden shadow-inner",
                      settings.darkMode && "border-gray-800 hover:bg-black/40"
                    )} style={{ backgroundColor: !bookCoverDraft ? bookColorDraft : 'transparent' }}>
                      {bookCoverDraft ? (
                        <img src={bookCoverDraft} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-y-0 left-0 w-2 bg-black/10 border-r border-black/5" />
                          <Upload className={cn("w-5 h-5 mb-1", bookColorDraft === '#ffffff' ? "text-brand-navy" : "text-white")} />
                          <span className={cn("text-[7px] font-black uppercase tracking-widest text-center px-1", bookColorDraft === '#ffffff' ? "text-brand-navy" : "text-white")}>Imagem</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleBookCoverUpload} />
                    </label>

                    {/* Color Picker */}
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cor ou Tema</p>
                      <div className="grid grid-cols-4 gap-2">
                        {COVER_COLORS.map(color => (
                          <button
                            key={color.value}
                            onClick={() => {
                              setBookColorDraft(color.value);
                              setBookCoverDraft(null); 
                            }}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all",
                              bookColorDraft === color.value ? "border-brand-copper scale-110 shadow-md" : "border-transparent"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  disabled={!bookPdfDraft?.tempId || !!isProcessingBook}
                  onClick={(e) => {
                    console.log("Button clicked!");
                    saveNewBook();
                  }}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3",
                    (bookPdfDraft?.tempId && !isProcessingBook)
                      ? "bg-brand-navy text-white active:scale-95 hover:bg-brand-navy/90" 
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  )}
                >
                  {isProcessingBook ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{typeof isProcessingBook === 'string' ? isProcessingBook : 'Processando...'}</span>
                    </>
                  ) : (
                    "Adicionar à Estante"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Greeting Modal */}
      <AnimatePresence>
        {showGreetingModal && (
          <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowGreetingModal(false)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-lg sm:text-xl font-black text-brand-navy mb-6 sm:mb-8", settings.darkMode && "text-white")}>
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
          <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
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
                <div 
                  className="w-20 h-28 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden"
                  style={{ backgroundColor: !selectedBookForAction.coverImage ? (selectedBookForAction.coverColor || '#b8860b') : 'transparent' }}
                >
                  {selectedBookForAction.coverImage ? (
                    <img src={selectedBookForAction.coverImage} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="absolute inset-y-0 left-0 w-2 bg-black/10 border-r border-black/5" />
                      <FileText className="w-8 h-8 text-white/20" />
                    </>
                  )}
                  {/* Change cover button overlay */}
                  <label className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer">
                    <Edit2 className="w-5 h-5 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const base64 = ev.target?.result as string;
                            setBooks(books.map(b => b.id === selectedBookForAction.id ? { ...b, coverImage: base64 } : b));
                            setSelectedBookForAction({ ...selectedBookForAction, coverImage: base64 });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
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
                    <div className="flex flex-col items-center">
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
                      {selectedBookForAction.author && (
                        <p className={cn("text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5", settings.darkMode && "text-gray-500")}>
                          {selectedBookForAction.author}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-3 mb-4">Opções do Livro</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Color Picker for existing book */}
              <div className="flex justify-center gap-2 mb-6">
                {COVER_COLORS.slice(0, 5).map(color => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setBooks(books.map(b => b.id === selectedBookForAction.id ? { ...b, coverColor: color.value, coverImage: undefined } : b));
                      setSelectedBookForAction({ ...selectedBookForAction, coverColor: color.value, coverImage: undefined });
                    }}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      selectedBookForAction.coverColor === color.value ? "border-brand-copper scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
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
                        {(selectedBookForAction.totalPages || 0) > 0 && (
                          <span className="text-[10px] font-bold text-gray-400">/ {selectedBookForAction.totalPages}</span>
                        )}
                      </div>
                      
                      {(selectedBookForAction.totalPages || 0) > 0 && (
                        <div className="px-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] font-black text-brand-copper uppercase tracking-widest">Progresso</span>
                            <span className="text-[9px] font-black text-brand-navy">
                              {Math.round(((selectedBookForAction.lastPage || 0) / (selectedBookForAction.totalPages || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, ((selectedBookForAction.lastPage || 0) / (selectedBookForAction.totalPages || 1)) * 100)}%` }}
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
                    <span className="text-[9px] text-gray-400 font-medium">{(selectedBookForAction.notes || (selectedBookForAction.links && selectedBookForAction.links.length > 0) || (selectedBookForAction.attachments && selectedBookForAction.attachments.length > 0)) ? 'Editar observações e anexos' : 'Adicionar observações e anexos'}</span>
                  </div>
                </button>

                {(selectedBookForAction.notes || (selectedBookForAction.links && selectedBookForAction.links.length > 0) || (selectedBookForAction.attachments && selectedBookForAction.attachments.length > 0)) && (
                  <div className="bg-gray-50/50 rounded-3xl p-4 space-y-4">
                    {selectedBookForAction.notes && (
                      <p className={cn("text-[11px] text-gray-600 leading-relaxed italic", settings.darkMode && "text-gray-400")}>
                        "{selectedBookForAction.notes}"
                      </p>
                    )}
                    
                    {selectedBookForAction.links && selectedBookForAction.links.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {selectedBookForAction.links.map((link, idx) => (
                          <a 
                            key={idx}
                            href={link.startsWith('http') ? link : `https://${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-brand-copper hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="text-[10px] font-bold truncate max-w-[200px]">{link}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {selectedBookForAction.attachments && selectedBookForAction.attachments.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedBookForAction.attachments.map((attach, idx) => (
                          <button 
                            key={idx}
                            onClick={() => {
                              const newWindow = window.open();
                              if (newWindow) {
                                if (attach.type === 'pdf') {
                                  newWindow.document.write(`<iframe src="${attach.data}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                                } else {
                                  newWindow.document.write(`<img src="${attach.data}" style="max-width: 100%;" />`);
                                }
                              }
                            }}
                            className="flex items-center gap-2 p-2 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 group"
                          >
                            {attach.type === 'image' ? <Eye className="w-3 h-3 text-brand-copper" /> : <FileText className="w-3 h-3 text-brand-copper" />}
                            <span className="text-[8px] font-bold text-brand-navy dark:text-gray-400 truncate">{attach.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => {
                    deleteBook(selectedBookForAction);
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
          <div className="fixed inset-0 z-[160] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowBookNotesModal(false)}
                className="absolute top-6 right-6 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
+
              <h2 className={cn("text-xl font-black text-brand-navy mb-2", settings.darkMode && "text-white")}>
                Anotações
              </h2>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-6">
                Observações para {selectedBookForAction.name.replace('.pdf', '')}
              </p>
+
              <div className="space-y-6">
                <div>
                  <textarea 
                    value={bookNotesDraft}
                    onChange={(e) => setBookNotesDraft(e.target.value)}
                    rows={6}
                    className={cn(
                      "w-full bg-gray-50 border-0 p-6 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-brand-copper/20 transition-all outline-none resize-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Escreva suas observações aqui..."
                  />
                </div>
+
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Links (Opcional)</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text"
                        value={newBookLink}
                        onChange={(e) => setNewBookLink(e.target.value)}
                        className={cn(
                          "flex-1 bg-gray-50 border-0 py-3 px-4 rounded-xl text-xs font-bold outline-none",
                          settings.darkMode && "bg-black text-white"
                        )}
                        placeholder="https://..."
                        onKeyDown={(e) => e.key === 'Enter' && addBookLink()}
                      />
                      <button 
                        onClick={addBookLink}
                        className="p-3 bg-brand-copper text-white rounded-xl active:scale-95 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {bookLinksDraft.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-black/40 px-3 py-1.5 rounded-lg group">
                          <span className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{link}</span>
                          <button onClick={() => removeBookLink(idx)} className="text-gray-400 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
+
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-3 block">Anexos (PDFs ou Imagens)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {bookAttachmentsDraft.map((attach, idx) => (
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
                            onClick={() => removeBookAttachment(idx)}
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
                          onChange={handleBookAttachmentUpload} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
+
              <button 
                onClick={handleSaveBookNotes}
                className="w-full bg-brand-navy text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl active:scale-95 transition-all mt-8"
              >
                Salvar Anotações
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modals removed in favor of global undo */}

      {/* Study Content Details Modal */}
      <AnimatePresence>
        {selectedContent && (
          <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col my-8 sm:my-0",
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
          <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-md bg-white rounded-3xl sm:rounded-[40px] p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowContentModal(false)}
                className="absolute top-6 right-6 sm:top-8 sm:right-8 text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className={cn("text-xl sm:text-2xl font-black text-brand-navy mb-6 sm:mb-8", settings.darkMode && "text-white")}>
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

      {/* Glossary Modal */}
      <AnimatePresence>
        {showGlossaryModal && (
          <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm overflow-y-auto pt-10 sm:pt-0 sm:items-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-sm bg-white rounded-3xl sm:rounded-[40px] p-6 sm:p-8 shadow-2xl relative my-8 sm:my-0",
                settings.darkMode && "bg-[#1A1A1A]"
              )}
            >
              <button 
                onClick={() => setShowGlossaryModal(false)}
                className="absolute top-6 right-6 text-gray-400 p-2"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className={cn("text-xl font-black text-brand-navy mb-6", settings.darkMode && "text-white")}>
                {editingGlossaryTerm ? 'Editar Termo' : 'Novo Termo de Glossário'}
              </h2>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Termo</label>
                    {duplicateError && (
                      <motion.span 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] font-bold text-red-500 uppercase tracking-wider"
                      >
                        Este termo já existe!
                      </motion.span>
                    )}
                    {glossaryForm.term && !editingGlossaryTerm && !duplicateError && (
                      <button 
                        onClick={handleAiGenerate}
                        disabled={isGeneratingAi}
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-brand-copper hover:text-brand-navy transition-colors bg-brand-copper/5 px-2 py-1 rounded-full mr-2"
                      >
                        {isGeneratingAi ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Gerar com IA
                      </button>
                    )}
                  </div>
                  <input 
                    type="text"
                    value={glossaryForm.term}
                    onChange={(e) => setGlossaryForm({ ...glossaryForm, term: e.target.value })}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-4 px-5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Ex: Amaci"
                  />
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1 mb-2 block">Categoria</label>
                  <button
                    type="button"
                    onClick={() => setIsGlossaryCategoryOpen(!isGlossaryCategoryOpen)}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-4 px-5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-copper/20 outline-none flex items-center justify-between group transition-all duration-300",
                      settings.darkMode && "bg-black text-white",
                      isGlossaryCategoryOpen && "ring-2 ring-brand-copper/20 bg-white shadow-sm",
                      settings.darkMode && isGlossaryCategoryOpen && "bg-zinc-900"
                    )}
                  >
                    <span className="truncate">{glossaryForm.category}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-brand-copper transition-transform duration-300",
                      isGlossaryCategoryOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {isGlossaryCategoryOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[60]" 
                          onClick={() => setIsGlossaryCategoryOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute top-full left-0 right-0 mt-2 bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden z-[70] py-2",
                            settings.darkMode && "bg-zinc-900 border-zinc-800"
                          )}
                        >
                          {GLOSSARY_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setGlossaryForm({ ...glossaryForm, category: cat });
                                setIsGlossaryCategoryOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-5 py-3 text-xs font-bold transition-all flex items-center justify-between",
                                glossaryForm.category === cat 
                                  ? "bg-brand-copper/10 text-brand-copper" 
                                  : "text-gray-600 hover:bg-gray-50",
                                settings.darkMode && glossaryForm.category !== cat && "text-gray-400 hover:bg-black"
                              )}
                            >
                              {cat}
                              {glossaryForm.category === cat && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-copper ml-1">Definição / Significado</label>
                    {glossaryForm.definition && (
                      <button 
                        onClick={handleAiRefine}
                        disabled={isRefiningAi}
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-brand-copper hover:text-brand-navy transition-colors bg-brand-copper/5 px-2 py-1 rounded-full mr-2"
                      >
                        {isRefiningAi ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wand2 className="w-3 h-3" />
                        )}
                        Melhorar com IA
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={glossaryForm.definition}
                    onChange={(e) => setGlossaryForm({ ...glossaryForm, definition: e.target.value })}
                    rows={6}
                    className={cn(
                      "w-full bg-gray-50 border-0 py-4 px-5 rounded-[24px] text-xs font-medium focus:ring-2 focus:ring-brand-copper/20 outline-none resize-none leading-relaxed",
                      settings.darkMode && "bg-black text-white"
                    )}
                    placeholder="Descreva o significado deste termo na umbanda..."
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveGlossaryTerm}
                    className="w-full bg-brand-navy text-white py-4 rounded-[20px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all text-[11px]"
                  >
                    Salvar Termo
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
