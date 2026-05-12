import React, { useState, useRef } from 'react';
import { Search, Plus, Filter, SortDesc, FileText, X, Save, Trash2, Camera, Image as ImageIcon, Link as LinkIcon, PlusCircle, Trash, Copy as CopyIcon, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { Note, AppSettings } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

export default function NotesScreen() {
  const [notes, setNotes] = useStorage<Note[]>('templo_notes', []);
  
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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<Note>>({ title: '', content: '', images: [], links: [], attachments: [] });
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
          content: noteForm.content!, 
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
          content: noteForm.content!, 
          images: noteForm.images || [],
          attachments: noteForm.attachments || [],
          links: noteForm.links || [],
          createdAt: now,
          lastEdited: now
        }, ...notes]);
      }
      setIsEditing(false);
      setSelectedNote(null);
      setNoteForm({ title: '', content: '', images: [], links: [], attachments: [] });
    }
  };

  const handleOpenNew = () => {
    setNoteForm({ title: '', content: '', images: [], links: [], attachments: [] });
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setNoteForm(prev => ({
            ...prev,
            images: [...(prev.images || []), base64String]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setNoteForm(prev => ({
            ...prev,
            attachments: [...(prev.attachments || []), {
              name: file.name,
              type: 'pdf',
              data: base64String
            }]
          }));
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

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    (n.links || []).some(link => link.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full pb-32 transition-colors duration-500",
      settings.darkMode && "bg-[#121212]"
    )}>
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className={cn("text-2xl font-bold text-brand-navy", settings.darkMode && "text-white")}>Bloco de Notas</h2>
        <button onClick={handleOpenNew} className={cn(
          "w-12 h-12 flex items-center justify-center bg-brand-copper text-white rounded-2xl shadow-xl active:scale-95 transition-all",
          settings.darkMode && "shadow-brand-copper/20"
        )}>
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar nas anotações..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-white border-none rounded-2xl p-4 pl-12 shadow-sm focus:ring-1 focus:ring-brand-copper outline-none",
            settings.darkMode && "bg-[#1A1A1A] text-white"
          )}
        />
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 break-inside-avoid">
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
              "break-inside-avoid w-full mb-4 p-5 sm:p-6 rounded-[28px] relative overflow-hidden transition-all duration-300 group cursor-pointer border",
              settings.darkMode 
                ? "bg-gradient-to-b from-[#1a2333] to-[#111827] border-[#2d3748] hover:border-brand-gold/50 shadow-xl" 
                : "bg-white border-brand-gold/10 hover:border-brand-gold/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(192,150,35,0.1)] hover:-translate-y-1"
            )}
          >
            {/* Top decorative gradient or shine */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col h-full">
               <h4 className={cn("font-bold text-lg leading-tight mb-2 line-clamp-2", settings.darkMode ? "text-white" : "text-brand-navy")}>{note.title}</h4>
               <p className={cn("text-sm line-clamp-5 leading-relaxed mb-4", settings.darkMode ? "text-gray-400" : "text-gray-600")}>{note.content}</p>
               
               <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
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
              "fixed inset-0 z-[400] bg-white flex flex-col transition-colors duration-500",
              settings.darkMode && "bg-[#121212]"
            )}
          >
            <div className={cn("p-4 pt-12 flex items-center justify-between border-b border-gray-100", settings.darkMode && "border-gray-800")}>
               <button onClick={() => { setSelectedNote(null); setIsEditing(false); setNoteForm({ title: '', content: '', images: [], links: [], attachments: [] }); }} className="p-3 text-gray-400 active:scale-90 transition-all">
                  <X className="w-7 h-7" />
               </button>
               {isEditing ? (
                  <button onClick={handleSave} className="bg-brand-copper text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2">
                     <Save className="w-4 h-4" /> Salvar
                  </button>
               ) : (
                  <div className="flex items-center gap-2">
                    {selectedNote && navigator.share && (
                      <button 
                        onClick={() => {
                          navigator.share({
                            title: selectedNote.title,
                            text: selectedNote.content,
                          }).catch(() => {});
                        }}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-brand-navy shadow-sm active:scale-95 transition-all text-xs",
                          settings.darkMode && "bg-[#1A1A1A] text-white"
                        )}
                        title="Compartilhar"
                      >
                         <Share2 className="w-5 h-5" />
                      </button>
                    )}
                    {selectedNote && (
                      <button 
                         onClick={() => {
                           navigator.clipboard.writeText(`${selectedNote.title}\n\n${selectedNote.content}`);
                         }}
                         className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-brand-navy shadow-sm active:scale-95 transition-all text-xs",
                          settings.darkMode && "bg-[#1A1A1A] text-white"
                        )}
                        title="Copiar Texto"
                      >
                         <CopyIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => setIsEditing(true)} className={cn(
                      "font-black text-xs uppercase tracking-widest bg-gray-50 px-6 py-2.5 rounded-xl text-brand-navy shadow-sm active:scale-95 transition-all",
                      settings.darkMode && "bg-[#1A1A1A] text-white"
                    )}>
                       Editar
                    </button>
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
                    
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Conteúdo da Anotação</p>
                       <textarea 
                          className={cn(
                            "w-full min-h-[200px] p-4 rounded-2xl border border-gray-100 outline-none text-gray-600 leading-relaxed resize-none bg-white placeholder:text-gray-300",
                            settings.darkMode && "bg-black border-gray-800 text-gray-300"
                          )}
                          placeholder="Escreva algo especial..."
                          value={noteForm.content}
                          onChange={e => setNoteForm({...noteForm, content: e.target.value})}
                       />
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-brand-copper/10 flex items-center justify-center">
                            <PlusCircle className="w-4 h-4 text-brand-copper" />
                          </div>
                          <p className="text-[10px] font-black text-brand-navy dark:text-white uppercase tracking-[0.2em]">Adicionar Mídias</p>
                       </div>
                       <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={cn("p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer", settings.darkMode && "bg-white/5 border-white/5 text-white")}
                          >
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-brand-copper" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black uppercase tracking-widest">Galeria</span>
                              <span className="text-[9px] text-gray-400 font-bold hidden sm:block">Fotos/Imagens</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className={cn("p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer", settings.darkMode && "bg-white/5 border-white/5 text-white")}
                          >
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm flex items-center justify-center shrink-0">
                              <Camera className="w-4 h-4 text-brand-copper" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black uppercase tracking-widest">Câmera</span>
                              <span className="text-[9px] text-gray-400 font-bold hidden sm:block">Tirar Foto</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => pdfInputRef.current?.click()}
                            className={cn("p-4 rounded-[20px] flex items-center gap-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer", settings.darkMode && "bg-white/5 border-white/5 text-white")}
                          >
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1A1A1A] shadow-sm flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-brand-copper" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[11px] font-black uppercase tracking-widest">Arquivo</span>
                              <span className="text-[9px] text-gray-400 font-bold hidden sm:block">PDFs/Docs</span>
                            </div>
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
                       <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <LinkIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <p className="text-[10px] font-black text-brand-navy dark:text-white uppercase tracking-[0.2em]">Adicionar Link</p>
                       </div>
                       <div className="flex gap-2">
                          <input 
                             type="text"
                             className={cn(
                               "flex-1 p-4 rounded-[20px] border border-gray-100 outline-none text-xs font-bold bg-white placeholder:text-gray-300 focus:border-brand-copper/30 transition-colors",
                               settings.darkMode && "bg-[#1A1A1A] border-gray-800 text-white focus:border-brand-copper/50"
                             )}
                             placeholder="Cole um link aqui..."
                             value={newLink}
                             onChange={e => setNewLink(e.target.value)}
                             onKeyDown={e => e.key === 'Enter' && addLink()}
                          />
                          <button 
                            onClick={addLink}
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
                               <button onClick={() => removeLink(idx)} className="text-red-500 p-1">
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
                    <p className={cn("text-lg text-gray-700 leading-relaxed whitespace-pre-wrap font-medium", settings.darkMode && "text-gray-200")}>{selectedNote?.content}</p>
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
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800/60" />
                           </div>
                           <div className="grid gap-3 sm:grid-cols-2">
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
