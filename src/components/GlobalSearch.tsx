import React, { useState, useEffect } from 'react';
import { Search, X, Book, Music, Leaf, Calendar, ArrowRight, FileText, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { cn } from '../lib/utils';
import { Event, StudyBook, AppSettings, StudyContent, GlossaryTerm, Ponto, HerbBath } from '../types';

export function GlobalSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  
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

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    
    const q = query.toLowerCase();
    const matches: any[] = [];

    // Search Events
    events.forEach(e => {
      if (e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        matches.push({ type: 'Evento', item: e, label: e.title || e.category, desc: e.date, icon: Calendar, path: '/calendar' });
      }
    });

    // Search Books
    books.forEach(b => {
      if (b.name.toLowerCase().includes(q)) {
        matches.push({ type: 'Livro', item: b, label: b.name.replace('.pdf', ''), desc: 'Minha Estante', icon: Book, path: '/studies', state: { openBookId: b.id } });
      }
    });

    // Search Studies
    studyContents.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        matches.push({ type: 'Estudo', item: s, label: s.title, desc: s.category, icon: FileText, path: '/studies', state: { activeTab: 'contents' } });
      }
    });

    // Search Glossary
    glossaryTerms.forEach(g => {
      if (g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q)) {
        matches.push({ type: 'Glossário', item: g, label: g.term, desc: g.category || 'Termo', icon: Bookmark, path: '/studies', state: { activeTab: 'glossary' } });
      }
    });

    // Search Pontos
    pontos.forEach(p => {
      if (p.title.toLowerCase().includes(q) || p.lyrics.toLowerCase().includes(q) || p.entity.toLowerCase().includes(q)) {
        matches.push({ type: 'Ponto', item: p, label: p.title, desc: p.entity, icon: Music, path: '/points', state: { pontoId: p.id, folderId: p.folderId } });
      }
    });

    // Search Baths/Herbs
    baths.forEach(b => {
      if (b.title.toLowerCase().includes(q) || b.herbs.toLowerCase().includes(q) || b.observations.toLowerCase().includes(q)) {
        matches.push({ type: 'Banho', item: b, label: b.title, desc: b.category || 'Banho', icon: Leaf, path: '/herbs', state: { openBathId: b.id } });
      }
    });

    return matches.slice(0, 8); // LIMIT to 8 results
  }, [query, events, books, studyContents, glossaryTerms, pontos, baths]);

  const handleNavigate = (result: any) => {
    setIsOpen(false);
    setQuery('');
    navigate(result.path, { state: result.state });
  };

  return (
    <>
      <div className="absolute top-3 left-6 z-[60]">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer backdrop-blur-md transition-all",
            settings.darkMode 
              ? "bg-black/40 border border-white/10" 
              : "bg-white/10 border border-white/20 hover:bg-white/20"
          )}
        >
          <Search className={cn("w-5 h-5", settings.darkMode ? "text-gray-300" : "text-white")} strokeWidth={2.5} />
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
                  <div className="p-12 text-center flex flex-col items-center">
                    <Search className={cn("w-8 h-8 mb-3 opacity-20", settings.darkMode ? "text-white" : "text-brand-navy")} />
                    <p className={cn("text-xs font-black uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>
                      Comece a digitar para pesquisar
                    </p>
                  </div>
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
                      return (
                        <button
                          key={index}
                          onClick={() => handleNavigate(result)}
                          className={cn(
                            "w-full text-left px-5 py-4 flex items-center gap-4 transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                            index !== results.length - 1 && (settings.darkMode ? "border-b border-gray-800" : "border-b border-gray-50")
                          )}
                        >
                          <div className={cn(
                            "p-2.5 rounded-xl shrink-0",
                            settings.darkMode ? "bg-white/5 text-brand-copper" : "bg-gray-100 text-brand-navy"
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
