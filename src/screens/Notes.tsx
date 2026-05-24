import React, { useState, useRef } from 'react';
import { Plus, X, Trash2, Search, FileText, ChevronRight, Save, Camera, Image as ImageIcon, Trash, Tag, Pin, LayoutGrid, List as ListIcon, Database, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { useAuth } from '../lib/AuthContext';
import { Note, AppSettings } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { RichTextEditor } from '../components/RichTextEditor';

const PRESET_TAGS = ['Estudos', 'Giras', 'Sonhos', 'Insights', 'Consultas', 'Geral'];

const TAG_COLORS: Record<string, string> = {
  'Estudos': 'border-t-blue-500',
  'Giras': 'border-t-purple-500',
  'Sonhos': 'border-t-indigo-500',
  'Insights': 'border-t-emerald-500',
  'Consultas': 'border-t-orange-500',
  'Geral': 'border-t-gray-400',
};

const getTagColor = (tags: string[] = []) => {
  const firstTag = tags[0];
  return TAG_COLORS[firstTag] || 'border-t-gray-300';
};

export default function NotesScreen() {
  const [notes, setNotes] = useStorage<Note[]>('templo_notes', []);
  const { user } = useAuth();
  
  const generateTestData = () => {
    const testNotes = PRESET_TAGS.map((tag, i) => ({
      id: Date.now().toString() + i,
      title: `Nota Teste - ${tag}`,
      content: `Conteúdo de exemplo para a categoria ${tag}. Organização e visualização sendo testadas.`,
      tags: [tag],
      createdAt: Date.now(),
      lastEdited: Date.now()
    } as Note));
    setNotes(prev => [...testNotes, ...prev]);
  };

  const clearAllNotes = () => {
    setNotes([]);
  };

  // Cleanup test data from storage
  React.useEffect(() => {
    if (notes.some(n => n.id === '1' || n.id === '2')) {
      setNotes(notes.filter(n => n.id !== '1' && n.id !== '2'));
    }
  }, [notes, setNotes]);
  
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useStorage<'grid' | 'list'>('templo_notes_viewmode', 'grid');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<Note>>({ title: '', content: '', images: [], links: [], attachments: [], tags: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [newLink, setNewLink] = useState('');

  const { queueDelete } = useUndo();

  const handleSave = () => {
    if (noteForm.title) {
      if (selectedNote && isEditing) {
        setNotes(notes.map(n => n.id === selectedNote.id ? { 
          ...n, 
          title: noteForm.title!, 
          content: noteForm.content || '', 
          tags: noteForm.tags || [],
          images: noteForm.images || [],
          attachments: noteForm.attachments || [],
          links: noteForm.links || [],
          lastEdited: Date.now() 
        } : n));
      } else {
        const now = Date.now();
        setNotes([{ 
          id: now.toString(), 
          title: noteForm.title!, 
          content: noteForm.content || '', 
          tags: noteForm.tags || [],
          images: noteForm.images || [],
          attachments: noteForm.attachments || [],
          links: noteForm.links || [],
          createdAt: now,
          lastEdited: now
        }, ...notes]);
      }
      setIsEditing(false);
      setSelectedNote(null);
      setNoteForm({ title: '', content: '', images: [], links: [], attachments: [], tags: [] });
    }
  };

  const handleOpenNew = () => {
    setNoteForm({ title: '', content: '', images: [], links: [], attachments: [], tags: selectedTag ? [selectedTag] : ['Geral'] });
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!user) return alert('Você precisa estar logado para enviar arquivos.');
      
      Array.from(files).forEach(async (file) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            // Upload immediately to supabase storage helper
            const { uploadFileToSupabase } = await import('../lib/storage');
            const url = await uploadFileToSupabase(
              'templo-uploads', 
              `notas/${user.id}/${Date.now()}_${file.name}`, 
              base64String, 
              file.type
            );
            
            setNoteForm(prev => ({
              ...prev,
              images: [...(prev.images || []), url]
            }));
          } catch(err) {
            console.error('Failed to upload image:', err);
            alert('Falha ao enviar a imagem.');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (!user) return alert('Você precisa estar logado para enviar arquivos.');
      
      Array.from(files).forEach(async (file) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            const { uploadFileToSupabase } = await import('../lib/storage');
            const url = await uploadFileToSupabase(
              'templo-uploads', 
              `notas/${user.id}/${Date.now()}_${file.name}`, 
              base64String, 
              file.type
            );
            
            setNoteForm(prev => ({
              ...prev,
              attachments: [...(prev.attachments || []), {
                name: file.name,
                type: 'pdf',
                data: url // Store URL instead of huge base64
              }]
            }));
          } catch(err) {
            console.error('Failed to upload PDF:', err);
            alert('Falha ao enviar o PDF.');
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addLink = () => {
    if (newLink && newLink.trim()) {
      let url = newLink.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      setNoteForm(prev => ({
        ...prev,
        links: [...(prev.links || []), url]
      }));
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setNoteForm(prev => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
  };

  const removeAttachment = (index: number) => {
    setNoteForm(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    setNoteForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleDelete = () => {
    if (selectedNote) {
      const noteForUndo = { ...selectedNote };
      queueDelete({
        id: noteForUndo.id,
        label: noteForUndo.title,
        timestamp: Date.now(),
        onConfirm: () => {
          setNotes(prev => prev.filter(n => n.id !== noteForUndo.id));
        }
      });
      setSelectedNote(null);
    }
  };

  const allTags = Array.from(new Set([
    ...PRESET_TAGS,
    ...notes.flatMap(n => n.tags || [])
  ]));

  const toggleTag = (tag: string) => {
    const currentTags = noteForm.tags || [];
    setNoteForm(prev => ({
      ...prev,
      tags: currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag]
    }));
  };

  const togglePin = (noteId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes(notes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase()) ||
                          (n.links || []).some(link => link.toLowerCase().includes(search.toLowerCase()));
    
    if (selectedTag) {
      return matchesSearch && (n.tags || []).includes(selectedTag);
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.lastEdited || 0) - (a.lastEdited || 0);
  });

  return (
    <motion.div className={cn(
      "p-4 bg-transparent min-h-full pb-32 transition-colors duration-500"
    )}>
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className={cn("text-2xl font-bold text-brand-navy", settings.darkMode && "text-white")}>Bloco de Notas</h2>
        <div className="flex items-center gap-2">
          {!user && (
            <>
              <button onClick={generateTestData} title="Gerar Notas Teste" className="p-3 text-brand-copper bg-brand-copper/10 rounded-2xl active:scale-95 transition-all">
                <Database className="w-5 h-5" />
              </button>
              <button onClick={clearAllNotes} title="Limpar Todas" className="p-3 text-red-500 bg-red-500/10 rounded-2xl active:scale-95 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button onClick={handleOpenNew} className={cn(
            "w-12 h-12 flex items-center justify-center bg-brand-copper text-white rounded-2xl shadow-xl active:scale-95 transition-all",
            settings.darkMode && "shadow-brand-copper/20"
          )}>
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar nas anotações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-white border-none rounded-2xl p-4 pl-12 pr-24 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none",
            settings.darkMode && "bg-[#1A1A1A] text-white"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === 'grid' 
                ? "bg-white dark:bg-gray-700 shadow-sm text-brand-navy dark:text-white" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              viewMode === 'list' 
                ? "bg-white dark:bg-gray-700 shadow-sm text-brand-navy dark:text-white" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 px-1">
        <button
          onClick={() => setSelectedTag(null)}
          className={cn(
            "px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border",
            !selectedTag 
              ? "bg-brand-navy border-brand-navy text-white shadow-md dark:bg-brand-gold dark:border-brand-gold dark:text-brand-navy"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#1A1A1A] dark:border-gray-800 dark:text-gray-300"
          )}
        >
          Todas
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={cn(
              "px-5 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all border flex items-center gap-1.5",
              tag === selectedTag
                ? "bg-brand-navy border-brand-navy text-white shadow-md dark:bg-brand-gold dark:border-brand-gold dark:text-brand-navy"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#1A1A1A] dark:border-gray-800 dark:text-gray-300"
            )}
          >
            <Tag className="w-3 h-3" />
            {tag}
          </button>
        ))}
      </div>

      <div className={cn(
        viewMode === 'grid' ? "columns-2 lg:columns-3 gap-3 sm:gap-4" : "flex flex-col gap-4"
      )}>
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 break-inside-avoid w-full">
            <FileText className="w-16 h-16 mb-4 text-brand-navy dark:text-white" strokeWidth={1} />
            <p className="font-bold text-sm uppercase tracking-widest dark:text-gray-400">Nenhuma nota encontrada</p>
          </div>
        ) : filteredNotes.map((note, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
            key={note.id} 
            onClick={() => { setSelectedNote(note); setNoteForm(note); setIsEditing(false); }}
            className={cn(
              "break-inside-avoid w-full relative overflow-hidden transition-all duration-300 group cursor-pointer border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]",
              viewMode === 'grid' ? "p-4 sm:p-6 rounded-2xl sm:rounded-[28px] mb-3 sm:mb-4" : "p-4 sm:p-5 rounded-2xl mb-0",
              getTagColor(note.tags),
              settings.darkMode 
                ? "bg-gradient-to-b from-[#1a2333] to-[#111827] border-[#2d3748]" 
                : "bg-white"
            )}
          >
            {/* Top decorative gradient or shine */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col h-full">
               <div className={cn("flex justify-between items-start gap-1 sm:gap-2", viewMode === 'grid' ? "mb-2 sm:mb-3" : "mb-1")}>
                 <div className="flex-1">
                   {note.tags && note.tags.length > 0 && (
                     <div className={cn("flex flex-wrap", viewMode === 'grid' ? "gap-1 sm:gap-1.5 mb-2" : "gap-1 mb-1")}>
                       {note.tags.slice(0, 2).map(tag => (
                         <span key={tag} className={cn("rounded-md bg-gray-100 dark:bg-gray-800 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate max-w-[80px] sm:max-w-none", viewMode === 'grid' ? "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px]" : "px-1.5 py-0.5 whitespace-nowrap text-[8px]")}>
                           {tag}
                         </span>
                       ))}
                       {note.tags.length > 2 && (
                         <span className={cn("rounded-md font-bold text-gray-400", viewMode === 'grid' ? "px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px]" : "px-1.5 py-0.5 text-[8px]")}>+{note.tags.length - 2}</span>
                       )}
                     </div>
                   )}
                 </div>
                 <button 
                   onClick={(e) => togglePin(note.id, e)}
                   className={cn(
                     "p-2 -mr-2 -mt-2 rounded-full transition-all focus:outline-none flex-shrink-0",
                     note.isPinned 
                       ? "text-brand-gold hover:bg-brand-gold/10 opacity-100" 
                       : "text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                   )}
                 >
                   <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
                 </button>
               </div>
               
               <div className={cn(viewMode === 'list' && "flex items-start justify-between gap-4")}>
                 <div className="flex-1">
                   <h4 className={cn("font-bold leading-snug tracking-tight", viewMode === 'grid' ? "text-lg sm:text-xl mb-2 sm:mb-3 line-clamp-2" : "text-lg mb-1 truncate", settings.darkMode ? "text-white" : "text-brand-navy")}>{note.title}</h4>
                   <p className={cn("text-gray-600 dark:text-gray-400", viewMode === 'grid' ? "text-xs sm:text-sm leading-relaxed sm:leading-loose mb-4 sm:mb-6 line-clamp-5 sm:line-clamp-6" : "text-xs leading-relaxed mb-3 line-clamp-2")}>
                     {note.content.replace(/<[^>]*>?/gm, '')}
                   </p>
                 </div>
               </div>
               
               <div className={cn("mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between", viewMode === 'grid' ? "pt-3 sm:pt-4" : "pt-3")}>
                  <div className="flex flex-col gap-0.5">
                    <span className={cn("text-[8px] font-black uppercase tracking-[0.2em]", settings.darkMode ? "text-brand-gold/70" : "text-brand-copper")}>
                      {new Date(note.createdAt || note.lastEdited).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex text-gray-400 gap-3">
                    {note.images && note.images.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4" strokeWidth={2} />
                        <span className="opacity-80">{note.images.length}</span>
                      </div>
                    )}
                    {note.attachments && note.attachments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                        <FileText className="w-4 h-4" strokeWidth={2} />
                        <span className="opacity-80">{note.attachments.length}</span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            {/* Subtle edit hint overlay strictly for large screens if needed, otherwise rely on normal tap on mobile. */}
            <div className="absolute inset-0 bg-brand-navy/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center p-8 pointer-events-none">
              <div className="bg-white/95 dark:bg-black/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Search className="w-4 h-4 text-brand-navy dark:text-white" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy dark:text-white">Abrir Nota</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(selectedNote || isEditing) && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-0 z-[400] flex flex-col transition-colors duration-500",
              "bg-gradient-to-br from-brand-navy via-[#001c38] to-[#000a14]"
            )}
          >
            <div className={cn("p-4 pt-12 flex items-center justify-between border-b border-gray-100", settings.darkMode && "border-gray-800")}>
               <button onClick={() => { setSelectedNote(null); setIsEditing(false); setNoteForm({ title: '', content: '', images: [], links: [], attachments: [], tags: [] }); }} className="p-3 text-gray-400 active:scale-90 transition-all">
                  <X className="w-7 h-7" />
               </button>
               {isEditing ? (
                  <button onClick={handleSave} className="bg-brand-copper text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
                     <Save className="w-4 h-4" /> Salvar
                  </button>
               ) : (
                  <div className="flex flex-col items-end gap-1">
                    <button onClick={() => setIsEditing(true)} className={cn(
                      "font-black text-xs uppercase tracking-widest bg-gray-50 px-6 py-2.5 rounded-xl text-brand-navy shadow-sm active:scale-95 transition-all",
                      settings.darkMode && "bg-[#1A1A1A] text-white"
                    )}>
                       Editar
                    </button>
                    {!isEditing && selectedNote && (
                      <p className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter opacity-70">
                        Edição: {new Date(selectedNote.lastEdited).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
               )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
               {isEditing ? (
                 <div className="h-full flex flex-col gap-6 pb-20">
                    <input 
                       className={cn(
                         "text-3xl font-black text-brand-navy border-none outline-none w-full bg-transparent placeholder:text-gray-300",
                         settings.darkMode && "text-white"
                       )}
                       placeholder="Título da nota"
                       value={noteForm.title}
                       onChange={e => setNoteForm({...noteForm, title: e.target.value})}
                    />
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Categorias / Tags</p>
                       <div className="flex flex-wrap gap-2">
                         {allTags.map(tag => (
                           <button
                             key={tag}
                             onClick={() => toggleTag(tag)}
                             className={cn(
                               "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                               noteForm.tags?.includes(tag)
                                 ? "bg-brand-gold text-white"
                                 : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                             )}
                           >
                             {tag}
                           </button>
                         ))}
                         {/* Input for new tag */}
                         <div className="flex items-center">
                           <input
                             type="text"
                             placeholder="+ Nova tag"
                             className={cn(
                               "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none w-28",
                               settings.darkMode ? "bg-black text-white border border-gray-800" : "bg-white border border-gray-200"
                             )}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 const val = e.currentTarget.value.trim();
                                 if (val && !noteForm.tags?.includes(val)) {
                                   setNoteForm(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                                 }
                                 e.currentTarget.value = '';
                               }
                             }}
                           />
                         </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Conteúdo da Anotação</p>
                       <RichTextEditor 
                         content={noteForm.content || ''} 
                         onChange={(html) => setNoteForm({...noteForm, content: html})} 
                       />
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Anexos e Documentos</p>
                       <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 bg-white", settings.darkMode && "bg-black border-gray-800 text-white")}
                          >
                            <ImageIcon className="w-6 h-6 text-brand-copper" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Galeria</span>
                          </button>
                          <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 bg-white", settings.darkMode && "bg-black border-gray-800 text-white")}
                          >
                            <Camera className="w-6 h-6 text-brand-copper" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Câmera</span>
                          </button>
                          <button 
                            onClick={() => pdfInputRef.current?.click()}
                            className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 bg-white", settings.darkMode && "bg-black border-gray-800 text-white")}
                          >
                            <FileText className="w-6 h-6 text-brand-copper" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">PDF</span>
                          </button>
                       </div>

                       <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
                       <input type="file" ref={cameraInputRef} onChange={handleImageUpload} accept="image/*" capture="environment" className="hidden" />
                       <input type="file" ref={pdfInputRef} onChange={handlePdfUpload} accept="application/pdf" multiple className="hidden" />

                       {((noteForm.images && noteForm.images.length > 0) || (noteForm.attachments && noteForm.attachments.length > 0)) && (
                         <div className="space-y-4">
                           {noteForm.images && noteForm.images.length > 0 && (
                             <div className="grid grid-cols-2 gap-4">
                               {noteForm.images.map((img, idx) => (
                                 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group border-2 border-white">
                                   <img src={img} alt={`Img ${idx}`} className="w-full h-full object-cover" />
                                   <button 
                                     onClick={() => removeImage(idx)}
                                     className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg active:scale-90 transition-all z-10"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 </div>
                               ))}
                             </div>
                           )}

                           {noteForm.attachments && noteForm.attachments.length > 0 && (
                             <div className="space-y-2">
                               {noteForm.attachments.map((att, idx) => (
                                 <div key={idx} className={cn("flex items-center justify-between p-3 rounded-xl bg-gray-50", settings.darkMode && "bg-white/5")}>
                                   <div className="flex items-center gap-3 overflow-hidden">
                                     <FileText className="w-4 h-4 text-brand-copper shrink-0" />
                                     <span className={cn("text-xs font-bold truncate", settings.darkMode && "text-white")}>{att.name}</span>
                                   </div>
                                   <button onClick={() => removeAttachment(idx)} className="text-red-500 p-1">
                                     <Trash className="w-4 h-4" />
                                   </button>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Links Úteis</p>
                       <div className="flex gap-2">
                          <input 
                             type="text"
                             className={cn(
                               "flex-1 p-4 rounded-2xl border border-gray-100 outline-none text-xs font-bold bg-white placeholder:text-gray-300",
                               settings.darkMode && "bg-black border-gray-800 text-white"
                             )}
                             placeholder="Cole um link aqui..."
                             value={newLink}
                             onChange={e => setNewLink(e.target.value)}
                             onKeyDown={e => {
                               if (e.key === 'Enter') {
                                 e.preventDefault();
                                 addLink();
                               }
                             }}
                          />
                          <button 
                            onClick={(e) => { e.preventDefault(); addLink(); }}
                            className="bg-brand-navy dark:bg-brand-copper text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                          >
                            Adicionar
                          </button>
                       </div>

                       {noteForm.links && noteForm.links.length > 0 && (
                         <div className="space-y-2">
                           {noteForm.links.map((link, idx) => (
                             <div key={idx} className={cn("flex items-center justify-between p-3 rounded-xl bg-gray-50", settings.darkMode && "bg-white/5")}>
                               <span className={cn("text-[10px] font-bold truncate pr-4 text-brand-navy", settings.darkMode && "text-gray-400")}>{link}</span>
                               <button onClick={(e) => { e.preventDefault(); removeLink(idx); }} className="text-red-500 p-1">
                                 <Trash className="w-4 h-4" />
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
               ) : (
                 <div className="max-w-lg mx-auto pb-10 space-y-8">
                  <div className="space-y-1">
                    {selectedNote?.tags && selectedNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedNote.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h2 className={cn("text-4xl font-black text-brand-navy mb-2 tracking-tight", settings.darkMode && "text-white")}>{selectedNote?.title}</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brand-copper uppercase tracking-widest">Criada em</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(selectedNote?.createdAt || selectedNote?.lastEdited || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="w-px h-6 bg-gray-100 dark:bg-gray-800" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-brand-copper uppercase tracking-widest">Última edição</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(selectedNote?.lastEdited || Date.now()).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    
                    <div className={cn("text-lg text-gray-700 leading-relaxed font-medium -mx-4 sm:mx-0", settings.darkMode && "text-gray-200")}>
                      <RichTextEditor content={selectedNote?.content || ''} readOnly={true} onChange={() => {}} />
                    </div>
                  </div>
                    
                     {selectedNote?.images && selectedNote.images.length > 0 && (
                       <div className="space-y-4">
                         <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Imagens ({selectedNote.images.length})</p>
                            <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                         </div>
                         <div className="grid gap-6">
                           {selectedNote.images.map((img, idx) => (
                             <img key={idx} src={img} alt={`Ref ${idx}`} className="w-full rounded-[32px] shadow-xl border-4 border-white dark:border-gray-800" />
                           ))}
                         </div>
                       </div>
                     )}

                     {selectedNote?.attachments && selectedNote.attachments.length > 0 && (
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Documentos ({selectedNote.attachments.length})</p>
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                           </div>
                           <div className="grid gap-3">
                              {selectedNote.attachments.map((att, idx) => (
                                 <a 
                                    key={idx}
                                    href={att.data}
                                    download={att.name}
                                    className={cn(
                                       "flex items-center gap-4 p-4 rounded-[24px] bg-gray-50 border border-gray-100 transition-all active:scale-95",
                                       settings.darkMode && "bg-white/5 border-white/5"
                                    )}
                                 >
                                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                                       <FileText className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                       <p className={cn("text-xs font-black text-brand-navy truncate", settings.darkMode && "text-white")}>{att.name}</p>
                                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Clique para baixar</p>
                                    </div>
                                 </a>
                              ))}
                           </div>
                        </div>
                     )}

                     {selectedNote?.links && selectedNote.links.length > 0 && (
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Links ({selectedNote.links.length})</p>
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                           </div>
                           <div className="grid gap-3">
                              {selectedNote.links.map((link, idx) => (
                                 <a 
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                       "flex items-center gap-4 p-4 rounded-[24px] bg-gray-50 border border-gray-100 transition-all active:scale-95",
                                       settings.darkMode && "bg-white/5 border-white/5"
                                    )}
                                 >
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                       <Plus className="w-5 h-5 text-blue-500 rotate-45" />
                                    </div>
                                    <div className="overflow-hidden">
                                       <p className={cn("text-xs font-black text-brand-navy truncate", settings.darkMode && "text-white")}>{link}</p>
                                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Abrir no navegador</p>
                                    </div>
                                 </a>
                              ))}
                           </div>
                        </div>
                     )}
                    
                    <div className={cn("pt-12 border-t border-gray-100", settings.darkMode && "border-gray-800")}>
                       <button 
                         onClick={handleDelete}
                         className="flex items-center gap-3 text-red-500 font-black text-xs uppercase tracking-widest p-4 bg-red-50 rounded-2xl w-full justify-center"
                       >
                         <Trash2 className="w-5 h-5" /> Excluir Anotação
                       </button>
                    </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal removed in favor of global undo */}
    </motion.div>
  );
}
