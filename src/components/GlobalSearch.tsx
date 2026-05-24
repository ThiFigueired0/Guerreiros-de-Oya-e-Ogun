import React, { useState, useEffect } from 'react';
import { Search, X, Book, Music, Leaf, Calendar, ArrowRight, FileText, Bookmark, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { cn } from '../lib/utils';
import { Event, StudyBook, AppSettings, StudyContent, GlossaryTerm, Ponto, HerbBath } from '../types';

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
    
    events.forEach(e => {
      data.push({ type: 'Evento', item: e, label: e.title || e.category, desc: e.date, icon: Calendar, path: '/calendar', searchContent: [e.title, e.category].join(' ') });
    });

    books.forEach(b => {
      data.push({ type: 'Livro', item: b, label: b.name.replace('.pdf', ''), desc: 'Minha Estante', icon: Book, path: '/studies', state: { openBookId: b.id }, searchContent: b.name });
    });

    studyContents.forEach(s => {
      data.push({ type: 'Estudo', item: s, label: s.title, desc: s.category, icon: FileText, path: '/studies', state: { activeTab: 'contents' }, searchContent: [s.title, s.content, s.category].join(' ') });
    });

    glossaryTerms.forEach(g => {
      data.push({ type: 'Glossário', item: g, label: g.term, desc: g.category || 'Termo', icon: Bookmark, path: '/studies', state: { activeTab: 'glossary' }, searchContent: [g.term, g.definition, g.category].join(' ') });
    });

    pontos.forEach(p => {
      data.push({ type: 'Ponto', item: p, label: p.title, desc: p.entity, icon: Music, path: '/points', state: { pontoId: p.id, folderId: p.folderId }, searchContent: [p.title, p.lyrics, p.entity].join(' ') });
    });

    baths.forEach(b => {
      data.push({ type: 'Banho', item: b, label: b.title, desc: b.category || 'Banho', icon: Leaf, path: '/herbs', state: { openBathId: b.id }, searchContent: [b.title, b.herbs, b.observations, b.category].join(' ') });
    });
    
    return data;
  }, [events, books, studyContents, glossaryTerms, pontos, baths]);

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
      <div className="relative group w-full mb-6 px-1">
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full h-14 rounded-[24px] flex items-center px-5 transition-all duration-300 relative overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] group/search",
            settings.darkMode 
              ? "bg-[#1A1A1A]/80 border border-white/5 text-gray-400 hover:border-white/10 hover:bg-[#222]/90 backdrop-blur-xl" 
              : "bg-white/70 border border-white/40 text-gray-500 hover:bg-white/95 shadow-sm backdrop-blur-xl"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/search:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <motion.div 
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Search className="w-5 h-5 mr-3 shrink-0 text-brand-gold drop-shadow-sm" strokeWidth={2.5} />
          </motion.div>
          <span className="font-medium text-sm tracking-wide">Buscar pontos, orixás, eventos...</span>
          <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-black/5 dark:bg-white/5">
            <Search className="w-3.5 h-3.5 opacity-50" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border",
                settings.darkMode ? "bg-[#1A1A1A] border-gray-800" : "bg-white border-gray-100"
              )}
            >
              <div className={cn(
                "p-4 border-b flex items-center gap-3 relative",
                settings.darkMode ? "border-gray-800 bg-[#222]" : "border-gray-100 bg-gray-50/50"
              )}>
                <Search className={cn("w-5 h-5 ml-2", settings.darkMode ? "text-gray-400" : "text-gray-400")} />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pesquisar em todo o app..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium focus:ring-0 px-0"
                  style={{ color: settings.darkMode ? 'white' : '#1a202c' }}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className={cn("w-5 h-5", settings.darkMode ? "text-gray-400" : "text-gray-400")} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === '' ? (
                  recentSearches.length > 0 ? (
                    <div className="py-2">
                      <div className="px-5 py-2">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest block mb-1", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                          Pesquisas Recentes
                        </span>
                      </div>
                      {recentSearches.map((recentQuery, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuery(recentQuery)}
                          className={cn(
                            "w-full text-left px-5 py-3 flex items-center gap-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          )}
                        >
                          <History className={cn("w-4 h-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                          <span className={cn("text-sm font-medium", settings.darkMode ? "text-gray-300" : "text-gray-600")}>
                            {recentQuery}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                      <Search className={cn("w-8 h-8 mb-3 opacity-20", settings.darkMode ? "text-white" : "text-brand-navy")} />
                      <p className={cn("text-xs font-black uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                        Comece a digitar para pesquisar
                      </p>
                    </div>
                  )
                ) : results.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className={cn("text-xs font-black uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                      Nenhum resultado encontrado
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result, index) => {
                      const Icon = result.icon;
                      const isSelected = index === selectedIndex;
                      return (
                        <button
                          key={index}
                          onClick={() => handleNavigate(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            "w-full text-left px-5 py-4 flex items-center gap-4 transition-colors",
                            isSelected 
                              ? (settings.darkMode ? "bg-white/10" : "bg-black/5") 
                              : "hover:bg-black/5 dark:hover:bg-white/5",
                            index !== results.length - 1 && (settings.darkMode ? "border-b border-gray-800" : "border-b border-gray-50")
                          )}
                        >
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0 transition-colors",
                            isSelected 
                              ? (settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-navy/10 text-brand-navy")
                              : (settings.darkMode ? "bg-white/5 text-brand-copper" : "bg-gray-100 text-brand-navy")
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={cn("font-bold text-sm truncate", settings.darkMode && "text-white")}>
                              {result.label}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn("text-[9px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                                {result.type}
                              </span>
                              <span className={cn("text-[9px]")}>•</span>
                              <span className={cn("text-[11px] truncate", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                                {result.desc}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className={cn("w-4 h-4 opacity-30 shrink-0", settings.darkMode ? "text-white" : "text-brand-navy")} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className={cn(
                "px-5 py-3 border-t text-center",
                settings.darkMode ? "bg-[#222] border-gray-800" : "bg-gray-50/50 border-gray-100"
              )}>
                <span className={cn("text-[8px] font-black uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                  Dica: Use Ctrl+K ou Cmd+K para abrir a pesquisa
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
