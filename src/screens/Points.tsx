import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Heart, Share2, Youtube, Play, X, Plus, Trash2, Maximize2, Mic, Music, Square, PenTool, FolderIcon, ChevronLeft, ChevronDown, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { useUndo } from '../hooks/useUndo';
import { Ponto, AppSettings, Folder, NotificationItem } from '../types';
import { cn } from '../lib/utils';

export default function PointsScreen() {
  const location = useLocation();
  const [pontos, setPontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [notifications, setNotifications] = useStorage<NotificationItem[]>('templo_history', []);
  
  // Cleanup test data from storage
  useEffect(() => {
    if (pontos.some(p => p.id === '1' || p.id === '2')) {
      setPontos(pontos.filter(p => p.id !== '1' && p.id !== '2'));
    }
  }, [pontos, setPontos]);

  const [folders, setFolders] = useStorage<Folder[]>('templo_folders', []);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [selectedPonto, setSelectedPonto] = useState<Ponto | null>(null);

  const { queueDelete } = useUndo();

  // Handle redirection from Home screen
  useEffect(() => {
    const state = location.state as { folderId?: string; pontoId?: string } | null;
    if (state && (state.folderId || state.pontoId)) {
      if (state.folderId) {
        setCurrentFolderId(state.folderId);
      }
      if (state.pontoId) {
        const ponto = pontos.find(p => p.id === state.pontoId);
        if (ponto) {
          setSelectedPonto(ponto);
        }
      }
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pontos]);
  const [modoPalco, setModoPalco] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newPonto, setNewPonto] = useState<Partial<Ponto>>({ title: '', entity: '', lyrics: '', youtubeLink: '', isFavorite: false });

  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Screen Wake Lock API for "Modo Palco"
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const handleWakeLock = async () => {
      if (modoPalco) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {
          console.error("Wake Lock failed:", err);
        }
      } else {
        if (wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        }
      }
    };
    handleWakeLock();
    return () => { wakeLockRef.current?.release(); };
  }, [modoPalco]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setRecordingBlob(base64Audio);
          setNewPonto(prev => ({ ...prev, audioUrl: base64Audio }));
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      alert("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSavePonto = () => {
    if (newPonto.title && newPonto.lyrics) {
      if (editingId) {
        setPontos(pontos.map(p => p.id === editingId ? { ...p, ...newPonto } as Ponto : p));
        
        // Add notification for update
        const newNotif: NotificationItem = {
          id: `update_ponto_${Date.now()}`,
          title: `Letra de ponto "${newPonto.title}" atualizada`,
          timestamp: Date.now(),
          category: 'edição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      } else {
        setPontos([...pontos, { ...newPonto, id: Date.now().toString(), folderId: currentFolderId || undefined } as Ponto]);
        const newNotif: NotificationItem = {
          id: `add_ponto_${Date.now()}`,
          title: `Nova letra de ponto "${newPonto.title}" adicionada`,
          timestamp: Date.now(),
          category: 'adição',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
      closeModal();
    }
  };

  const handleSaveFolder = () => {
    if (newFolderName.trim()) {
      if (editingFolderId) {
        setFolders(folders.map(f => f.id === editingFolderId ? { ...f, name: newFolderName } : f));
      } else {
        setFolders([...folders, { id: Date.now().toString(), name: newFolderName, parentId: currentFolderId || undefined }]);
      }
      closeFolderModal();
    }
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setNewFolderName('');
    setEditingFolderId(null);
  };

  const deleteFolder = (folder: Folder) => {
    queueDelete({
      id: folder.id,
      label: `Pasta: ${folder.name}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setFolders(folders => folders.filter(f => f.id !== folder.id));
        // Optionally re-assign items to parent folder
        setPontos(pontos => pontos.map(p => p.folderId === folder.id ? { ...p, folderId: currentFolderId || undefined } : p));
        setFolders(folders => folders.map(f => f.parentId === folder.id ? { ...f, parentId: currentFolderId || undefined } : f));
        const newNotif: NotificationItem = {
          id: `delete_folder_${Date.now()}`,
          title: `Pasta "${folder.name}" removida`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setRecordingBlob(null);
    setNewPonto({ title: '', entity: '', lyrics: '', youtubeLink: '', isFavorite: false });
  };

  const handleEdit = (ponto: Ponto) => {
    setNewPonto(ponto);
    setEditingId(ponto.id);
    setRecordingBlob(ponto.audioUrl || null);
    setShowModal(true);
  };

  const deletePonto = (ponto: Ponto) => {
    queueDelete({
      id: ponto.id,
      label: `Ponto: ${ponto.title}`,
      timestamp: Date.now(),
      onConfirm: () => {
        setPontos(pontos => pontos.filter(p => p.id !== ponto.id));
        if (selectedPonto?.id === ponto.id) setSelectedPonto(null);
        const newNotif: NotificationItem = {
          id: `delete_ponto_${Date.now()}`,
          title: `Letra de ponto "${ponto.title}" removida`,
          timestamp: Date.now(),
          category: 'remoção',
          read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 100));
      }
    });
  };

  const getYoutubeEmbed = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^& \n]+)/);
    return match ? match[1] : null;
  };

  const handleShare = (ponto: Ponto) => {
    const text = `🎤 *Ponto Cantado - ${ponto.title} (${ponto.entity})*\n\n📜 *Letra:*\n${ponto.lyrics}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const currentFolders = folders.filter(f => f.parentId === (currentFolderId || undefined));
  const currentPoints = pontos.filter(p => p.folderId === (currentFolderId || undefined));
  
  const folderName = currentFolderId ? folders.find(f => f.id === currentFolderId)?.name : 'Cantigas e Pontos';

  const filteredFolders = search 
    ? folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())) 
    : currentFolders;

  const filteredPontos = pontos.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         p.entity.toLowerCase().includes(search.toLowerCase());
    if (search) return matchesSearch;
    return p.folderId === (currentFolderId || undefined);
  }).sort((a,b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  const navigateUp = () => {
    if (currentFolderId) {
      const parent = folders.find(f => f.id === currentFolderId)?.parentId;
      setCurrentFolderId(parent || null);
    }
  };
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className={cn(
        "p-4 min-h-full pb-32 transition-colors duration-500 bg-transparent relative"
      )}
    >
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.03] dark:bg-brand-gold/[0.04] rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 transform-gpu will-change-transform" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-white/[0.02] dark:bg-white/[0.03] rounded-full blur-3xl pointer-events-none -translate-x-1/2 transform-gpu will-change-transform" />

      {/* Stage Mode Toggle Banner */}
      <div className={cn(
        "w-full p-4 rounded-2xl flex items-center justify-between shadow-lg mb-8 transition-all relative z-10",
        modoPalco 
          ? (settings.darkMode ? "bg-brand-gold" : "bg-brand-navy shadow-brand-navy/20")
          : (settings.darkMode ? "bg-[#1A1A1A] border border-white/5" : "bg-white border border-gray-100 shadow-gray-200/50")
      )}>
        <div className="flex flex-col flex-1">
          <span className={cn(
            "text-[10px] uppercase font-black tracking-wider mb-0.5",
            modoPalco ? "text-white/60" : "text-brand-gold"
          )}>Imersão Total</span>
          <span className={cn(
            "text-sm font-black",
            modoPalco || settings.darkMode ? "text-white" : "text-brand-navy"
          )}>Modo Palco</span>
          <p className={cn(
            "text-[9px] font-bold mt-0.5 pr-4 leading-tight",
            modoPalco ? "text-white/70" : "text-gray-400"
          )}>
            Mantém a tela sempre iluminada e a letra em destaque para facilitar a leitura.
          </p>
        </div>
        <button 
          onClick={() => setModoPalco(!modoPalco)}
          className={cn(
            "w-14 h-7 rounded-full relative transition-colors",
            modoPalco ? "bg-white/30" : "bg-gray-200 dark:bg-white/10"
          )}
        >
          <motion.div 
            animate={{ x: modoPalco ? 32 : 4 }}
            className={cn(
              "w-5 h-5 rounded-full absolute top-1 shadow-sm",
              modoPalco ? "bg-white" : "bg-gray-400 dark:bg-gray-500"
            )}
          />
        </button>
      </div>

      <div className="flex items-center justify-between mb-8 px-2 relative z-10">
        <div className="flex items-center gap-3">
          {currentFolderId && (
            <button 
              onClick={navigateUp}
              className={cn(
                "p-2.5 rounded-2xl transition-all shadow-sm active:scale-95",
                settings.darkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-white text-brand-navy hover:bg-gray-50 border border-gray-100"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-col">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Pontos & Acervo</p>
            <h2 className={cn(
              "text-3xl sm:text-4xl font-black font-serif tracking-tight",
              settings.darkMode ? "text-brand-gold" : "text-brand-navy"
            )}>
              {folderName}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFolderModal(true)} 
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all outline-none",
              settings.darkMode 
                ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold/20" 
                : "bg-white text-brand-navy border border-gray-100 hover:bg-gray-50"
            )}
            title="Nova Pasta"
          >
            <FolderIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowModal(true)} 
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-navy/20 active:scale-95 transition-all outline-none",
              settings.darkMode ? "bg-brand-gold shadow-brand-gold/20" : "bg-brand-navy hover:bg-brand-navy/90"
            )}
            title="Novo Ponto"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative mb-6 z-10">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Qual ponto você quer cantar?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full rounded-[24px] p-5 pl-14 shadow-sm focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold outline-none text-sm font-bold transition-all border",
            settings.darkMode 
              ? "bg-[#1A1A1A] border-white/5 text-white placeholder:text-gray-600 focus:bg-[#222]" 
              : "bg-white border-gray-100 text-brand-navy placeholder:text-gray-400 focus:bg-gray-50"
          )}
        />
      </div>

      <div className="grid gap-4 z-10 relative">
        {/* Folders List */}
        {filteredFolders.map(folder => (
          <div 
            key={folder.id}
            className={cn(
              "group p-5 rounded-[28px] shadow-sm border flex items-center gap-4 active:scale-[0.99] transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative overflow-hidden",
              settings.darkMode 
                ? "bg-[#161616] border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/10" 
                : "bg-white border-gray-100 hover:border-gray-200"
            )}
            onClick={() => { if(!search) setCurrentFolderId(folder.id); }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 dark:bg-brand-gold/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className={cn(
               "w-[52px] h-[52px] rounded-[18px] flex items-center justify-center shrink-0 border relative z-10",
               settings.darkMode 
                 ? "bg-brand-gold/5 border-brand-gold/10 text-brand-gold" 
                 : "bg-brand-gold/5 border-brand-gold/10 text-brand-gold"
            )}>
              <FolderIcon className="w-6 h-6 fill-current opacity-40" />
            </div>
            <div className="flex-1 relative z-10">
              <h4 className={cn("font-bold text-sm tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>{folder.name}</h4>
              <p className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] mt-1">
                {pontos.filter(p => p.folderId === folder.id).length} pontos
              </p>
            </div>
            <div className="flex gap-1 relative z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolderId(folder.id);
                  setNewFolderName(folder.name);
                  setShowFolderModal(true);
                }}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  settings.darkMode ? "bg-white/5 text-brand-gold/80 hover:bg-white/10 hover:text-brand-gold" : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-brand-gold"
                )}
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder);
                }}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  settings.darkMode ? "bg-red-500/10 text-red-500/60 hover:bg-red-500/20 hover:text-red-400" : "bg-red-50 text-red-400 hover:bg-red-100"
                )}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredPontos.map(ponto => (
          <div 
            key={ponto.id} 
            onClick={() => setSelectedPonto(ponto)}
            className={cn(
              "p-6 rounded-[32px] shadow-sm border flex flex-col gap-4 active:scale-[0.99] transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group relative overflow-hidden",
              settings.darkMode 
                ? "bg-[#161616] border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:border-white/10" 
                : "bg-white border-gray-100 hover:border-gray-200"
            )}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 dark:bg-brand-gold/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-start relative z-10">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "font-black text-[10px] uppercase tracking-[0.2em]",
                    settings.darkMode ? "text-brand-gold" : "text-brand-gold"
                  )}>
                    {ponto.entity}
                  </span>
                </div>
                <h4 className={cn("font-black text-lg leading-tight mb-2 tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>{ponto.title}</h4>
              </div>
              <div className="flex gap-1 shrink-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(ponto);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    settings.darkMode ? "bg-white/5 text-gray-400 hover:text-brand-gold hover:bg-white/10" : "bg-gray-50 text-gray-400 hover:text-brand-gold hover:bg-gray-100"
                  )}
                >
                  <PenTool className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePonto(ponto);
                  }}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    settings.darkMode ? "bg-red-500/10 text-red-500/60 hover:bg-red-500/20 hover:text-red-400" : "bg-red-50 text-red-400 hover:bg-red-100"
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {ponto.isFavorite && <Heart className="w-5 h-5 fill-brand-red text-brand-red ml-1 self-center" />}
              </div>
            </div>
            
            <div className={cn(
              "mt-2 border-l-4 p-4 rounded-xl relative z-10",
              settings.darkMode ? "bg-brand-gold/5 border-brand-gold/40" : "bg-brand-gold/5 border-brand-gold/20"
            )}>
              <p className={cn("text-xs font-medium italic line-clamp-2 leading-relaxed italic", settings.darkMode ? "text-gray-400" : "text-gray-600")}>
                "{ponto.lyrics}"
              </p>
            </div>

            <div className="mt-2 flex items-center gap-3 relative z-10">
              {ponto.youtubeLink && (
                <div className={cn(
                  "p-2.5 rounded-xl",
                  settings.darkMode ? "bg-brand-red/10 text-brand-red" : "bg-red-50 text-red-500"
                )}>
                  <Youtube className="w-4 h-4" />
                </div>
              )}
              {ponto.audioUrl && (
                <div className={cn(
                  "p-2.5 rounded-xl",
                  settings.darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-500"
                )}>
                  <Mic className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1" />
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform",
                settings.darkMode ? "bg-brand-gold shadow-brand-gold/30" : "bg-brand-navy shadow-brand-navy/30"
              )}>
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail View / Stage Mode */}
      <AnimatePresence>
        {selectedPonto && (
          <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-0 z-[200] flex flex-col safe-area-top",
              modoPalco ? "bg-black text-white" : (settings.darkMode ? "bg-[#121212] text-white" : "bg-white text-brand-navy")
            )}
          >
            <div className={cn(
              "px-4 py-6 flex items-center justify-between border-b transition-colors",
              modoPalco 
                ? "bg-black border-white/10" 
                : (settings.darkMode ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100")
            )}>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setSelectedPonto(null); setModoPalco(false); }} 
                  className={cn(
                    "p-3 rounded-2xl active:scale-95 transition-all",
                    settings.darkMode || modoPalco ? "bg-white/5 text-white" : "bg-gray-50 text-brand-navy"
                  )}
                >
                  <X className="w-6 h-6" />
                </button>
                {!modoPalco && (
                  <button 
                    onClick={() => handleEdit(selectedPonto)}
                    className={cn(
                      "p-3 rounded-2xl active:scale-95 transition-all focus:outline-none",
                      settings.darkMode ? "bg-white/5 text-white" : "bg-gray-50 text-brand-navy"
                    )}
                  >
                    <PenTool className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="text-center flex-1 min-w-0 px-4">
                <h3 className="font-black text-sm truncate uppercase tracking-tight">{selectedPonto.title}</h3>
                <p className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em] overflow-hidden truncate">{selectedPonto.entity}</p>
              </div>
              <button 
                onClick={() => setModoPalco(!modoPalco)}
                className={cn(
                  "p-3 rounded-2xl flex items-center gap-2 font-black text-[10px] transition-all uppercase tracking-widest",
                  modoPalco 
                    ? "bg-brand-red text-white shadow-lg shadow-brand-red/40 px-4" 
                    : (settings.darkMode ? "bg-white/5 text-white border border-white/10" : "bg-brand-navy/5 text-brand-navy border border-brand-navy/10")
                )}
              >
                <Maximize2 className="w-4 h-4" /> 
                {modoPalco ? 'ATIVADO' : 'MODO PALCO'}
              </button>
            </div>

            <div className={cn(
              "flex-1 overflow-y-auto p-8 relative custom-scrollbar",
              modoPalco && "flex items-center justify-center"
            )}>
              <div className={cn(
                "whitespace-pre-wrap leading-relaxed max-w-lg mx-auto transition-all duration-500 pb-32",
                modoPalco 
                  ? "text-4xl font-black text-center tracking-tight leading-[1.3] text-white" 
                  : "text-lg font-bold"
              )}>
                {selectedPonto.lyrics}
              </div>
                
              {!modoPalco && (selectedPonto.youtubeLink || selectedPonto.audioUrl) && (
                <div className="mt-12 max-w-lg mx-auto space-y-8 pb-32">
                   {selectedPonto.youtubeLink && (
                     <div>
                       <div className="flex items-center gap-2 mb-4">
                         <Youtube className="w-4 h-4 text-brand-red" />
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guia do Youtube</p>
                       </div>
                       {getYoutubeEmbed(selectedPonto.youtubeLink) ? (
                         <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
                           <iframe 
                             className="w-full aspect-video"
                             src={`https://www.youtube.com/embed/${getYoutubeEmbed(selectedPonto.youtubeLink)}`}
                             frameBorder="0"
                             allowFullScreen
                           />
                         </div>
                       ) : (
                         <a href={selectedPonto.youtubeLink} target="_blank" className="bg-brand-red/10 p-5 rounded-2xl flex items-center gap-3 text-brand-red font-black text-sm transition-all active:scale-95">
                            <Youtube className="w-6 h-6" /> ABRIR NO YOUTUBE
                         </a>
                       )}
                     </div>
                   )}

                   {selectedPonto.audioUrl && (
                     <div className={cn(
                       "p-8 rounded-[32px] border",
                       settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                     )}>
                        <div className="flex items-center gap-2 mb-6">
                           <Mic className="w-4 h-4 text-brand-gold" />
                           <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Gravação do Terreiro</p>
                        </div>
                        <audio controls className="w-full h-12 custom-audio">
                           <source src={selectedPonto.audioUrl} type="audio/wav" />
                        </audio>
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className={cn(
              "p-6 flex gap-4 safe-area-bottom border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)]",
              modoPalco ? "bg-black border-white/10" : (settings.darkMode ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100")
            )}>
               <button onClick={() => {
                 setPontos(pontos.map(p => p.id === selectedPonto.id ? {...p, isFavorite: !p.isFavorite} : p));
                 setSelectedPonto({...selectedPonto, isFavorite: !selectedPonto.isFavorite});
               }} className={cn(
                 "flex-1 p-5 rounded-2xl shadow-sm flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all",
                 settings.darkMode || modoPalco ? "bg-white/5 text-white" : "bg-gray-50 text-brand-navy"
               )}>
                  <Heart className={cn("w-5 h-5", selectedPonto.isFavorite && "fill-brand-red text-brand-red")} /> 
                  {selectedPonto.isFavorite ? 'Salvo' : 'Salvar'}
               </button>
               <button onClick={() => handleShare(selectedPonto)} className={cn(
                 "flex-1 p-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all text-white",
                 settings.darkMode ? "bg-brand-gold shadow-brand-gold/30" : "bg-brand-navy shadow-brand-navy/30"
               )}>
                  <Share2 className="w-5 h-5" /> Enviar
               </button>
            </div>

            {modoPalco && (
              <div className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-brand-red/90 text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
                  Tela Ativa • Imersão Total
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFolderModal && (
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className={cn("w-full max-w-md rounded-[32px] p-6 sm:p-8", settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white shadow-2xl")}
             >
                <div className="flex justify-between items-center mb-6">
                  <h3 className={cn("text-2xl font-bold tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {editingFolderId ? 'Editar Pasta' : 'Nova Pasta'}
                  </h3>
                  <button 
                    onClick={closeFolderModal}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      settings.darkMode ? "bg-white/5 text-gray-400 hover:text-white" : "bg-gray-50 text-gray-400 hover:text-brand-navy"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input 
                    placeholder="Nome da Pasta (ex: Caboclos, Orixás...)" 
                    value={newFolderName} 
                    onChange={e => setNewFolderName(e.target.value)} 
                    className={cn(
                      "w-full rounded-2xl outline-none border p-5 text-sm font-bold transition-all", 
                      settings.darkMode ? "bg-[#161616] text-white border-white/5 focus:border-brand-gold" : "bg-gray-50 border-gray-100 focus:border-brand-gold focus:bg-white"
                    )} 
                    autoFocus
                  />
                  
                  <div className="flex flex-col gap-4 pt-4 mt-2">
                    <button onClick={handleSaveFolder} className="w-full p-4 rounded-2xl bg-brand-gold text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Salvar Pasta</button>

                    {editingFolderId && (
                      <button 
                        onClick={() => {
                          const folder = folders.find(f => f.id === editingFolderId);
                          if (folder) deleteFolder(folder);
                          closeFolderModal();
                        }}
                        className={cn(
                          "w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all",
                          settings.darkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                        )}
                      >
                        <Trash2 className="w-4 h-4" /> Excluir Pasta
                      </button>
                    )}
                  </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} 
               animate={{ scale: 1, opacity: 1, y: 0 }} 
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className={cn("w-full max-w-lg rounded-[32px] p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar", settings.darkMode ? "bg-[#1A1A1A] border border-gray-800" : "bg-white shadow-2xl")}
             >
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-inherit z-20 pb-2">
                  <h3 className={cn("text-2xl font-bold tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    {editingId ? 'Editar Ponto' : 'Novo Ponto'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      settings.darkMode ? "bg-white/5 text-gray-400 hover:text-white" : "bg-gray-50 text-gray-400 hover:text-brand-navy"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Localização</p>
                    <div className="relative">
                      <select 
                        value={newPonto.folderId || ''} 
                        onChange={e => setNewPonto({...newPonto, folderId: e.target.value || undefined})}
                        className={cn("w-full p-5 rounded-2xl outline-none border appearance-none text-sm font-bold transition-all", settings.darkMode ? "bg-[#161616] text-white border-white/5 focus:border-brand-gold" : "bg-gray-50 border-gray-100 focus:border-brand-gold focus:bg-white")}
                      >
                        <option value="">Raiz (Nenhuma pasta)</option>
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <input placeholder="Título" value={newPonto.title} onChange={e => setNewPonto({...newPonto, title: e.target.value})} className={cn("w-full p-5 rounded-2xl outline-none border text-sm font-bold transition-all", settings.darkMode ? "bg-[#161616] text-white border-white/5 focus:border-brand-gold" : "bg-gray-50 border-gray-100 focus:border-brand-gold focus:bg-white")} />
                  <input placeholder="Entidade / Orixá" value={newPonto.entity} onChange={e => setNewPonto({...newPonto, entity: e.target.value})} className={cn("w-full p-5 rounded-2xl outline-none border text-sm font-bold transition-all", settings.darkMode ? "bg-[#161616] text-white border-white/5 focus:border-brand-gold" : "bg-gray-50 border-gray-100 focus:border-brand-gold focus:bg-white")} />
                  <textarea placeholder="Letra do Ponto" rows={8} value={newPonto.lyrics} onChange={e => setNewPonto({...newPonto, lyrics: e.target.value})} className={cn("w-full p-5 rounded-2xl outline-none border text-sm font-medium transition-all resize-none", settings.darkMode ? "bg-[#161616] text-white border-white/5 focus:border-brand-gold" : "bg-gray-50 border-gray-100 focus:border-brand-gold focus:bg-white")} />
                  
                  <div className={cn("p-6 rounded-2xl border-2 border-dashed transition-all", settings.darkMode ? "bg-[#161616] border-white/5 hover:border-brand-gold/30" : "bg-gray-50 border-gray-200 hover:border-brand-gold/30")}>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest text-center">Audio de Referência</p>
                    <div className="flex items-center justify-center gap-4">
                      {!isRecording ? (
                        <button 
                          onClick={startRecording}
                          type="button"
                          className="w-16 h-16 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                        >
                          <Mic className="w-8 h-8" />
                        </button>
                      ) : (
                        <button 
                          onClick={stopRecording}
                          type="button"
                          className="w-16 h-16 bg-brand-navy text-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
                        >
                          <Square className="w-8 h-8 fill-current" />
                        </button>
                      )}
                    </div>
                    {recordingBlob && !isRecording && (
                      <div className="mt-6 flex flex-col items-center gap-2">
                        <audio controls src={recordingBlob} className="w-full h-8" />
                        <button 
                          onClick={() => { setRecordingBlob(null); setNewPonto(p => ({...p, audioUrl: undefined})); }}
                          className="text-[10px] text-red-500 font-bold uppercase"
                        >
                          Remover Gravação
                        </button>
                      </div>
                    )}
                    {isRecording && <p className="text-center mt-4 text-brand-red font-bold animate-pulse text-xs">Gravando...</p>}
                  </div>

                  <input placeholder="Link do Youtube (opcional)" value={newPonto.youtubeLink} onChange={e => setNewPonto({...newPonto, youtubeLink: e.target.value})} className={cn("w-full p-4 rounded-2xl outline-none", settings.darkMode ? "bg-[#1A1A1A] text-white border border-gray-800" : "bg-gray-50")} />
                  
                  <div className="flex flex-col gap-4 pt-4 mt-2">
                    <button onClick={handleSavePonto} className="w-full p-4 rounded-2xl bg-brand-gold text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">Salvar Ponto</button>

                    {editingId && (
                      <button 
                        onClick={() => {
                          const ponto = pontos.find(p => p.id === editingId);
                          if (ponto) deletePonto(ponto);
                          closeModal();
                        }}
                        className={cn(
                          "w-full p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all",
                          settings.darkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100"
                        )}
                      >
                        <Trash2 className="w-4 h-4" /> Excluir Ponto
                      </button>
                    )}
                  </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modals removed in favor of global undo */}
    </motion.div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>;
}
