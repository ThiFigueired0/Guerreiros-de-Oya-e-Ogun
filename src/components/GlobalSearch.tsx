import React, { useState, useEffect } from 'react';
import { Search, X, Book, Music, Leaf, Calendar, ArrowRight, FileText, Bookmark, History, Flame, Gift, Bird, StickyNote, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { cn } from '../lib/utils';
import { Event, StudyBook, AppSettings, StudyContent, GlossaryTerm, Ponto, HerbBath, Trabalho, Candle, Bicho, Note } from '../types';

export function GlobalSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  const [recentSearches, setRecentSearches] = useStorage<string[]>('templo_recent_searches', []);
  
  // Data sources
  const [events] = useStorage<Event[]>('templo_events', []);
  const [books] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [studyContents] = useStorage<StudyContent[]>('templo_study_docs', []);
  const [glossaryTerms] = useStorage<GlossaryTerm[]>('templo_glossary', []);
  const [pontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [baths] = useStorage<HerbBath[]>('templo_baths', []);
  const [trabalhos] = useStorage<Trabalho[]>('templo_offerings', []);
  const [candles] = useStorage<Candle[]>('templo_candles', []);
  const [bichos] = useStorage<Bicho[]>('templo_bichos', []);
  const [notes] = useStorage<Note[]>('templo_notes', []);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchData = React.useMemo(() => {
    const data: any[] = [];
    
    // App Sections
    data.push({ type: 'Seção', item: null, label: 'Trabalhos e Oferendas', desc: 'Gerenciamento de trabalhos', icon: Gift, path: '/trabalhos', state: { activeTab: 'trabalhos' }, searchContent: ['trabalho', 'oferenda', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Gestão de Velas', desc: 'Controle de estoque e planejamento', icon: Flame, path: '/trabalhos', state: { activeTab: 'velas' }, searchContent: ['vela', 'velas', 'estoque', 'planejamento', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Bichos / Cortes', desc: 'Valores e tipos', icon: Bird, path: '/trabalhos', state: { activeTab: 'bichos' }, searchContent: ['bicho', 'bichos', 'corte', 'animal', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Banhos e Ervas', desc: 'Receitas e indicações', icon: Leaf, path: '/herbs', state: {}, searchContent: ['banho', 'erva', 'banhos', 'ervas', 'mato', 'folha', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Glossário', desc: 'Dicionário de termos', icon: Bookmark, path: '/studies', state: { activeTab: 'glossary' }, searchContent: ['glossario', 'dicionario', 'termo', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Pontos Cantados', desc: 'Letras de pontos', icon: Music, path: '/points', state: {}, searchContent: ['ponto', 'cantado', 'musica', 'cantiga', 'letra', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Estudos', desc: 'Livros e conteúdos', icon: Book, path: '/studies', state: {}, searchContent: ['estudo', 'livro', 'apostila', 'conteudo', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Anotações (Notas)', desc: 'Suas notas pessoais', icon: StickyNote, path: '/notes', state: {}, searchContent: ['nota', 'anotação', 'notas', 'anotações', 'rascunho', 'seção', 'pagina'].join(' ') });
    data.push({ type: 'Seção', item: null, label: 'Calendário (Agenda)', desc: 'Eventos e Giras', icon: Calendar, path: '/calendar', state: {}, searchContent: ['calendario', 'agenda', 'evento', 'gira', 'data', 'seção', 'pagina'].join(' ') });

    events.forEach(e => {
      data.push({ type: 'Evento', item: e, label: e.title || e.category, desc: e.date, icon: Calendar, path: '/calendar', searchContent: [e.title, e.category].filter(Boolean).join(' ') });
    });

    books.forEach(b => {
      data.push({ type: 'Livro', item: b, label: b.name.replace('.pdf', ''), desc: 'Minha Estante', icon: Book, path: '/studies', state: { openBookId: b.id }, searchContent: b.name });
    });

    studyContents.forEach(s => {
      data.push({ type: 'Estudo', item: s, label: s.title, desc: s.category, icon: FileText, path: '/studies', state: { activeTab: 'contents' }, searchContent: [s.title, s.content, s.category].filter(Boolean).join(' ') });
    });

    glossaryTerms.forEach(g => {
      data.push({ type: 'Glossário', item: g, label: g.term, desc: g.category || 'Termo', icon: Bookmark, path: '/studies', state: { activeTab: 'glossary' }, searchContent: [g.term, g.definition, g.category].filter(Boolean).join(' ') });
    });

    pontos.forEach(p => {
      data.push({ type: 'Ponto', item: p, label: p.title, desc: p.entity, icon: Music, path: '/points', state: { pontoId: p.id, folderId: p.folderId }, searchContent: [p.title, p.lyrics, p.entity].filter(Boolean).join(' ') });
    });

    baths.forEach(b => {
      data.push({ type: 'Banho', item: b, label: b.title, desc: b.category || 'Banho', icon: Leaf, path: '/herbs', state: { openBathId: b.id }, searchContent: [b.title, b.herbs, b.observations, b.category].filter(Boolean).join(' ') });
    });

    trabalhos.forEach(t => {
      data.push({ type: 'Trabalho / Oferenda', item: t, label: t.title, desc: t.description, icon: Gift, path: '/trabalhos', state: { activeTab: 'trabalhos' }, searchContent: [t.title, t.description].filter(Boolean).join(' ') });
    });

    candles.forEach(c => {
      data.push({ type: 'Vela', item: c, label: `${c.color} (${c.type})`, desc: c.observations || `Vela ${c.color}`, icon: Flame, path: '/trabalhos', state: { activeTab: 'velas' }, searchContent: [c.color, c.type, c.observations, 'vela', 'velas'].filter(Boolean).join(' ') });
    });

    bichos.forEach(b => {
      data.push({ type: 'Bicho', item: b, label: b.name, desc: `Custo Extra: R$ ${b.purchaseCost + b.serviceCost}`, icon: Bird, path: '/trabalhos', state: { activeTab: 'bichos' }, searchContent: [b.name, 'bichos', 'corte'].filter(Boolean).join(' ') });
    });

    notes.forEach(n => {
      data.push({ type: 'Nota', item: n, label: n.title, desc: n.tags ? n.tags.join(', ') : 'Anotação', icon: StickyNote, path: '/notes', state: { activeNoteId: n.id }, searchContent: [n.title, n.content, n.tags?.join(' ')].filter(Boolean).join(' ') });
    });
    
    return data;
  }, [events, books, studyContents, glossaryTerms, pontos, baths, trabalhos, candles, bichos, notes]);

  const fuse = React.useMemo(() => new Fuse(searchData, {
    keys: ['label', 'searchContent', 'desc'],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true
  }), [searchData]);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const searchResults = fuse.search(query);
    return searchResults.map(result => result.item).slice(0, 8);
  }, [query, fuse]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleNavigate(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleNavigate = (result: any) => {
    if (query.trim()) {
      setRecentSearches(prev => {
        const updated = [query.trim(), ...prev.filter(q => q !== query.trim())].slice(0, 5);
        return updated;
      });
    }
    setIsOpen(false);
    setQuery('');
    navigate(result.path, { state: result.state });
  };

  return (
    <>
      <div className="absolute top-[36px] left-4 sm:left-6 z-[60] pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer backdrop-blur-md transition-all border relative group",
            settings.darkMode 
              ? "bg-black/40 border-brand-gold/50 hover:border-brand-gold/70 text-white" 
              : "bg-black/40 border-brand-gold/50 hover:border-brand-gold/70 text-white"
          )}
        >
          <div className="absolute inset-[3px] rounded-full border border-brand-gold/30 pointer-events-none z-0 transition-colors duration-300 group-hover:border-brand-gold/50" />
          <Search className="w-5 h-5 relative z-10 text-white" strokeWidth={2.5} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full max-w-lg rounded-[24px] overflow-hidden border backdrop-blur-2xl relative shadow-2xl",
                settings.darkMode 
                  ? "bg-gradient-to-b from-[#1a1512]/95 to-[#121212]/95 border-brand-gold/30" 
                  : "bg-white/95 border-brand-gold/20"
              )}
            >
              <div className={cn(
                "p-4 border-b flex items-center gap-3 relative overflow-hidden",
                settings.darkMode ? "border-brand-gold/20 bg-black/20" : "border-brand-gold/10 bg-brand-gold/5"
              )}>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 to-transparent pointer-events-none" />
                <Search className={cn("w-5 h-5 ml-2 relative z-10", settings.darkMode ? "text-white" : "text-gray-900")} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pesquisar em todo o app..."
                  className="flex-1 bg-transparent border-none outline-none text-[16px] focus:ring-0 px-2 placeholder-brand-gold/40 relative z-10"
                  style={{ color: settings.darkMode ? '#fff' : '#111' }}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all bg-red-500/90 hover:bg-red-500 shadow-md active:scale-95 group relative z-10"
                >
                  <X className="w-5 h-5 text-white transition-transform group-hover:scale-110" strokeWidth={2.5} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                {query.trim() === '' ? (
                  recentSearches.length > 0 ? (
                    <div className="py-2">
                      <div className="px-3 pb-2 pt-1">
                        <span className={cn("text-[9px] font-black text-brand-gold/60 uppercase tracking-widest pl-1")}>
                          Buscas Recentes
                        </span>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((recentQuery, idx) => (
                          <div key={idx} className={cn(
                              "w-full px-4 py-3 flex items-center gap-4 transition-all rounded-xl group cursor-pointer",
                              settings.darkMode ? "hover:bg-brand-gold/10" : "hover:bg-brand-gold/10"
                            )}
                            onClick={() => setQuery(recentQuery)}
                          >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors", settings.darkMode ? "bg-white/5 text-brand-gold/70 group-hover:bg-brand-gold/20 group-hover:text-brand-gold" : "bg-brand-gold/10 text-brand-gold/70 group-hover:bg-brand-gold/20 group-hover:text-brand-gold")}>
                                <History className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex items-center gap-3 text-left">
                              <span className={cn("text-[15px] font-medium", settings.darkMode ? "text-white/90" : "text-gray-800")}>
                                {recentQuery}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecentSearches(prev => prev.filter(q => q !== recentQuery));
                              }}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95",
                                settings.darkMode 
                                  ? "bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400" 
                                  : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"
                              )}
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all", settings.darkMode ? "bg-white/5" : "bg-gray-100")}>
                        <Search className={cn("w-8 h-8 opacity-50", settings.darkMode ? "text-white" : "text-gray-900")} />
                      </div>
                      <p className={cn("text-xs font-black uppercase tracking-widest", settings.darkMode ? "text-white/60" : "text-gray-500")}>
                        Digite para iniciar a busca
                      </p>
                    </div>
                  )
                ) : results.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center justify-center relative overflow-hidden rounded-2xl">
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10", settings.darkMode ? "bg-white/5" : "bg-gray-100")}>
                       <Search className={cn("w-8 h-8 opacity-30", settings.darkMode ? "text-white" : "text-gray-900")} />
                       <X className={cn("w-4 h-4 absolute bottom-3 right-3 text-red-500", settings.darkMode ? "" : "")} strokeWidth={3} />
                    </div>
                    <p className={cn("text-xs font-black uppercase tracking-widest relative z-10", settings.darkMode ? "text-white/60" : "text-gray-500")}>
                      Sem resultados para "{query}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 mt-1">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={index}
                          onClick={() => handleNavigate(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full text-left px-4 py-3 flex items-center gap-4 transition-all rounded-xl",
                            isSelected 
                              ? (settings.darkMode ? "bg-brand-gold/15 shadow-sm" : "bg-brand-gold/10 shadow-sm") 
                              : "hover:bg-brand-gold/5 dark:hover:bg-white/5"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 shadow-sm",
                            isSelected 
                              ? (settings.darkMode ? "bg-brand-gold/20 text-brand-gold" : "bg-white text-brand-gold border border-brand-gold/30")
                              : (settings.darkMode ? "bg-white/5 text-brand-gold/60" : "bg-brand-gold/5 text-brand-gold/60")
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("text-[15px] font-bold truncate transition-colors", 
                                isSelected ? (settings.darkMode ? "text-white" : "text-gray-900") : (settings.darkMode ? "text-white/80" : "text-gray-700")
                            )}>
                              {result.label}
                            </h4>
                            {result.desc && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={cn("text-[9px] font-black uppercase tracking-widest", settings.darkMode ? "text-brand-gold/60" : "text-brand-gold/80")}>
                                    {result.type}
                                  </span>
                                  <span className="text-[9px] text-brand-gold/30">•</span>
                                  <span className={cn("text-[11px] truncate", settings.darkMode ? "text-white/40" : "text-gray-500")}>
                                    {result.desc}
                                  </span>
                                </div>
                            )}
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                            isSelected ? (settings.darkMode ? "bg-brand-gold/20" : "bg-brand-gold/10") : "opacity-0 -translate-x-2"
                          )}>
                             <ArrowRight className={cn("w-3.5 h-3.5", settings.darkMode ? "text-brand-gold" : "text-brand-gold")} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
