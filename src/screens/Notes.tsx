import React, { useState, useRef } from 'react';
import { Plus, X, Trash2, Search, FileText, ChevronRight, Save, Camera, Image as ImageIcon, Trash } from 'lucide-react';
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

      <div className="grid gap-3">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <FileText className="w-16 h-16 mb-4 text-brand-navy" strokeWidth={1} />
            <p className="font-bold text-sm uppercase tracking-widest">Nenhuma nota encontrada</p>
          </div>
        ) : filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => { setSelectedNote(note); setNoteForm(note); setIsEditing(false); }}
            className={cn(
              "bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-95 transition-all text-left",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
            )}
          >
            <div className="flex-1 overflow-hidden pr-4">
               <h4 className={cn("font-bold text-brand-navy truncate", settings.darkMode && "text-white")}>{note.title}</h4>
               <p className="text-xs text-gray-400 truncate mb-2">{note.content}</p>
               <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[8px] font-black text-brand-copper uppercase tracking-wider")}>
                      Criada: {new Date(note.createdAt || note.lastEdited).toLocaleDateString()}
                    </span>
                    <span className={cn("text-[8px] font-black text-gray-400 uppercase tracking-wider")}>
                      Editada: {new Date(note.lastEdited).toLocaleDateString()}
                    </span>
                  </div>
                  {note.images && note.images.length > 0 && (
                    <div className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-wider">
                      <ImageIcon className="w-3 h-3" /> {note.images.length}
                    </div>
                  )}
               </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200" />
          </div>
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
