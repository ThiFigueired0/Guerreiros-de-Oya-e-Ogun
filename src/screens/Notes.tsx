import React, { useState } from 'react';
import { Plus, X, Trash2, Search, FileText, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { Note, AppSettings } from '../types';
import { cn } from '../lib/utils';

export default function NotesScreen() {
  const [notes, setNotes] = useStorage<Note[]>('templo_notes', [
    { id: '1', title: 'Fundamentos de Oya', content: 'Cores: Vermelho e Cobre.\nComidas: Acarajé.\nSaudação: Eparrey!', lastEdited: Date.now() },
    { id: '2', title: 'Lista de Mantimentos Festa', content: '20kg Frango\n10kg Arroz\nTemperos Variados', lastEdited: Date.now() - 86400000 }
  ]);
  
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteForm, setNoteForm] = useState<Partial<Note>>({ title: '', content: '' });

  const handleSave = () => {
    if (noteForm.title) {
      if (selectedNote && isEditing) {
        setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title: noteForm.title!, content: noteForm.content!, lastEdited: Date.now() } : n));
      } else {
        setNotes([{ id: Date.now().toString(), title: noteForm.title!, content: noteForm.content!, lastEdited: Date.now() }, ...notes]);
      }
      setIsEditing(false);
      setSelectedNote(null);
      setNoteForm({ title: '', content: '' });
    }
  };

  const handleOpenNew = () => {
    setNoteForm({ title: '', content: '' });
    setIsEditing(true);
    setSelectedNote(null);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
      settings.darkMode && "bg-[#121212]"
    )}>
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className={cn("text-2xl font-bold text-brand-navy", settings.darkMode && "text-white")}>Bloco de Notas</h2>
        <button onClick={handleOpenNew} className={cn(
          "p-3 bg-brand-gold text-white rounded-full shadow-lg",
          settings.darkMode && "bg-brand-copper"
        )}>
          <Plus className="w-5 h-5" />
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
        {filteredNotes.map(note => (
          <div 
            key={note.id} 
            onClick={() => { setSelectedNote(note); setNoteForm(note); setIsEditing(false); }}
            className={cn(
              "bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-95 transition-all text-left",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}
          >
            <div className="flex-1 overflow-hidden pr-4">
               <h4 className={cn("font-bold text-brand-navy truncate", settings.darkMode && "text-white")}>{note.title}</h4>
               <p className="text-xs text-gray-400 truncate mb-1">{note.content}</p>
               <span className={cn("text-[9px] font-bold text-brand-gold uppercase tracking-wider", settings.darkMode && "text-brand-copper")}>Última edição: {new Date(note.lastEdited).toLocaleDateString()}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-200" />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {(selectedNote || isEditing) && (
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className={cn(
              "fixed inset-0 z-[400] bg-white flex flex-col transition-colors duration-500",
              settings.darkMode && "bg-[#121212]"
            )}
          >
            <div className={cn("p-4 flex items-center justify-between border-b border-gray-100", settings.darkMode && "border-gray-800")}>
               <button onClick={() => { setSelectedNote(null); setIsEditing(false); }} className="p-2 text-gray-400">
                  <X className="w-6 h-6" />
               </button>
               {isEditing ? (
                  <button onClick={handleSave} className={cn(
                    "bg-brand-gold text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2",
                    settings.darkMode && "bg-brand-copper"
                  )}>
                     <Save className="w-4 h-4" /> Salvar
                  </button>
               ) : (
                  <button onClick={() => setIsEditing(true)} className={cn(
                    "text-brand-navy font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl",
                    settings.darkMode && "bg-[#1A1A1A] text-white"
                  )}>
                     Editar
                  </button>
               )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
               {isEditing ? (
                 <div className="h-full flex flex-col gap-4">
                    <input 
                       className={cn(
                         "text-2xl font-bold text-brand-navy border-none outline-none w-full bg-transparent",
                         settings.darkMode && "text-white"
                       )}
                       placeholder="Título da nota..."
                       value={noteForm.title}
                       onChange={e => setNoteForm({...noteForm, title: e.target.value})}
                    />
                    <textarea 
                       className={cn(
                         "flex-1 w-full border-none outline-none text-gray-600 leading-relaxed resize-none bg-transparent",
                         settings.darkMode && "text-gray-300"
                       )}
                       placeholder="Comece a escrever..."
                       value={noteForm.content}
                       onChange={e => setNoteForm({...noteForm, content: e.target.value})}
                    />
                 </div>
               ) : (
                 <div className="max-w-lg mx-auto">
                    <h2 className={cn("text-3xl font-bold text-brand-navy mb-4 tracking-tight", settings.darkMode && "text-white")}>{selectedNote?.title}</h2>
                    <p className={cn("text-gray-600 leading-relaxed whitespace-pre-wrap", settings.darkMode && "text-gray-200")}>{selectedNote?.content}</p>
                    <div className={cn("mt-8 pt-8 border-t border-gray-50", settings.darkMode && "border-gray-800")}>
                       <button 
                         onClick={() => {
                           setNotes(notes.filter(n => n.id !== selectedNote?.id));
                           setSelectedNote(null);
                         }}
                         className="flex items-center gap-2 text-red-500 font-bold text-sm"
                       >
                         <Trash2 className="w-4 h-4" /> Excluir Anotação
                       </button>
                    </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
