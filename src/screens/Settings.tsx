import React, { useState, useRef } from 'react';
import { 
  Moon, Sun, ChevronRight, Plus, Trash2, ShieldCheck, X, Image as ImageIcon, Camera,
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout, Smartphone, ArrowUp, ArrowDown, ArrowLeftRight, FileText, GripVertical,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';

const AVAILABLE_ICONS: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

const ALL_TABS = [
  { path: '/home', label: 'Início', defaultIcon: Home },
  { path: '/calendar', label: 'Agenda', defaultIcon: Calendar },
  { path: '/herbs', label: 'Banhos', defaultIcon: Leaf },
  { path: '/trab', label: 'Trabalhos', defaultIcon: Anchor },
  { path: '/points', label: 'Pontos', defaultIcon: Music },
  { path: '/studies', label: 'Estudos', defaultIcon: GraduationCap },
  { path: '/notes', label: 'Notas', defaultIcon: FileText },
  { path: '/finance', label: 'Financeiro', defaultIcon: Wallet },
  { path: '/settings', label: 'Ajustes', defaultIcon: Settings },
];

const DEFAULT_PRIMARY = ['/home', '/calendar', '/herbs', '/trab'];
const DEFAULT_SECONDARY = ['/points', '/studies', '/notes', '/finance', '/settings'];

export default function SettingsScreen() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Gira de Pretos Velhos', 'Gira de Caboclos', 'Gira de Exu/Pomba Gira', 'Gira de Erês', 'Gira de Marinheiros', 'Gira de Boiadeiros', 'Gira de Ciganos'],
    pushNotifications: true,
    tabIcons: {},
    primaryTabPaths: DEFAULT_PRIMARY,
    secondaryTabPaths: DEFAULT_SECONDARY
  });

  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [newCat, setNewCat] = useState('');
  const [newName, setNewName] = useState('');
  const [activeTabPicker, setActiveTabPicker] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'category' | 'name', value: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryTabs = settings.primaryTabPaths || DEFAULT_PRIMARY;
  const secondaryTabs = settings.secondaryTabPaths || DEFAULT_SECONDARY;

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setSettings({ ...settings, logoBase64: undefined });

  const addCategory = () => {
    if (newCat.trim() && !settings.eventCategories.includes(newCat.trim())) {
      setSettings({
        ...settings,
        eventCategories: [...settings.eventCategories, newCat.trim()]
      });
      setNewCat('');
    }
  };

  const removeCategory = (cat: string) => {
    setItemToDelete({ type: 'category', value: cat });
    setShowDeleteConfirm(true);
  };

  const addNameSuggestion = () => {
    if (newName.trim() && !settings.eventNames.includes(newName.trim())) {
      setSettings({
        ...settings,
        eventNames: [...settings.eventNames, newName.trim()]
      });
      setNewName('');
    }
  };

  const removeName = (name: string) => {
    setItemToDelete({ type: 'name', value: name });
    setShowDeleteConfirm(true);
  };

  const toggleDarkMode = () => setSettings({ ...settings, darkMode: !settings.darkMode });
  const toggleNotifications = () => setSettings({ ...settings, pushNotifications: !settings.pushNotifications });

  const moveTab = (path: string, from: 'primary' | 'secondary', to: 'primary' | 'secondary') => {
    if (path === '/settings' && to === 'primary' && from === 'secondary') return;
    
    let newPrimary = [...primaryTabs];
    let newSecondary = [...secondaryTabs];

    if (from === 'primary') {
      newPrimary = newPrimary.filter(p => p !== path);
      newSecondary = [...newSecondary, path];
    } else {
      newSecondary = newSecondary.filter(s => s !== path);
      newPrimary = [...newPrimary, path];
    }

    setSettings({
      ...settings,
      primaryTabPaths: newPrimary,
      secondaryTabPaths: newSecondary
    });
  };

  const handleIconSelect = (path: string, iconName: string) => {
    setSettings({
      ...settings,
      tabIcons: {
        ...(settings.tabIcons || {}),
        [path]: iconName
      }
    });
    setActiveTabPicker(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'category') {
      setSettings({
        ...settings,
        eventCategories: settings.eventCategories.filter(c => c !== itemToDelete.value)
      });
    } else {
      setSettings({
        ...settings,
        eventNames: settings.eventNames.filter(n => n !== itemToDelete.value)
      });
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Export Data
  const exportData = () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('templo_')) {
        const value = localStorage.getItem(key);
        try {
          allData[key] = JSON.parse(value!);
        } catch (e) {
          allData[key] = value;
        }
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `templo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('templo_')) {
              localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            }
          });
          window.location.reload();
        } catch (e) {
          alert('Erro ao importar arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderSubScreen = () => {
    switch (activeSubScreen) {
      case 'profile':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Identidade Visual
              </h3>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-32 h-32 rounded-full border-2 border-brand-copper mb-6 relative overflow-hidden bg-gray-50 flex items-center justify-center p-2 shadow-inner",
                  settings.darkMode && "bg-black/40"
                )}>
                  {settings.logoBase64 ? (
                    <img src={settings.logoBase64} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-gray-200" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-brand-navy text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Alterar Logo
                  </button>
                  {settings.logoBase64 && (
                    <button 
                      onClick={removeLogo}
                      className="text-xs bg-red-50 text-red-500 px-6 py-3 rounded-2xl font-black uppercase tracking-widest"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 mt-6 uppercase font-bold text-center tracking-widest leading-loose max-w-[200px]">A logo será exibida no topo de todas as telas em formato circular.</p>
              </div>
            </section>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> Organização de Abas
              </h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Barra de Navegação (Principal)
                  </p>
                  <Reorder.Group 
                    axis="y" 
                    values={primaryTabs} 
                    onReorder={(newOrder) => {
                      if (newOrder[0] === '/home') {
                        setSettings({...settings, primaryTabPaths: newOrder});
                      }
                    }} 
                    className="space-y-2"
                  >
                    {primaryTabs.map((path) => {
                      const tab = ALL_TABS.find(t => t.path === path);
                      if (!tab) return null;
                      const isHome = path === '/home';
                      return (
                        <Reorder.Item 
                          key={path} 
                          value={path} 
                          dragListener={!isHome}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-colors",
                            settings.darkMode ? "bg-black/20 border-gray-100/5" : "bg-gray-50 border-gray-100",
                            !isHome && "cursor-grab active:cursor-grabbing"
                          )}
                        >
                          {!isHome && <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />}
                          <div className="w-8 h-8 rounded-lg bg-brand-copper/10 flex items-center justify-center text-brand-copper">
                            {settings.tabIcons?.[path] && AVAILABLE_ICONS[settings.tabIcons[path]] 
                              ? React.createElement(AVAILABLE_ICONS[settings.tabIcons[path]], { className: "w-4 h-4" })
                              : <tab.defaultIcon className="w-4 h-4" />
                            }
                          </div>
                          <span className={cn("flex-1 text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                            {tab.label}
                            {isHome && <span className="ml-2 text-[8px] opacity-40 uppercase font-black tracking-tight">(Fixo)</span>}
                          </span>
                          {!isHome && (
                            <button 
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => moveTab(path, 'primary', 'secondary')} 
                              className="p-2 text-brand-red active:scale-90 transition-all"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          )}
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                    <Plus className="w-3 h-3" /> Menu Secundário (Mais)
                  </p>
                  <Reorder.Group 
                    axis="y" 
                    values={secondaryTabs} 
                    onReorder={(newOrder) => setSettings({...settings, secondaryTabPaths: newOrder})}
                    className="space-y-2"
                  >
                    {secondaryTabs.map((path) => {
                      const tab = ALL_TABS.find(t => t.path === path);
                      if (!tab) return null;
                      return (
                        <Reorder.Item 
                          key={path} 
                          value={path} 
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing",
                            settings.darkMode ? "bg-black/20 border-gray-100/5" : "bg-gray-50 border-gray-100"
                          )}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="w-8 h-8 rounded-lg bg-gray-200/30 flex items-center justify-center text-gray-400">
                            {settings.tabIcons?.[path] && AVAILABLE_ICONS[settings.tabIcons[path]] 
                              ? React.createElement(AVAILABLE_ICONS[settings.tabIcons[path]], { className: "w-4 h-4" })
                              : <tab.defaultIcon className="w-4 h-4" />
                            }
                          </div>
                          <span className={cn("flex-1 text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{tab.label}</span>
                          <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => moveTab(path, 'secondary', 'primary')} 
                            className="p-2 text-brand-copper active:scale-90 transition-all"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </div>
            </section>

            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <Palette className="w-3 h-3" /> Customs de Ícones
              </h3>
              <div className="grid gap-4">
                {ALL_TABS.map((tab) => {
                  const currentIconName = settings.tabIcons?.[tab.path];
                  const IconComp = currentIconName ? AVAILABLE_ICONS[currentIconName] : null;

                  return (
                    <div key={tab.path} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{tab.label}</span>
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Toque no ícone</span>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveTabPicker(activeTabPicker === tab.path ? null : tab.path)}
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm",
                            settings.darkMode ? "bg-black/40 text-brand-copper border border-gray-800" : "bg-white text-brand-navy border border-gray-100"
                          )}
                        >
                          {IconComp ? <IconComp className="w-6 h-6" /> : <tab.defaultIcon className="w-5 h-5 opacity-40" />}
                        </button>

                        <AnimatePresence>
                          {activeTabPicker === tab.path && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className={cn(
                                "absolute right-0 top-14 z-50 p-4 rounded-3xl shadow-2xl border flex flex-wrap gap-2 w-64 h-64 overflow-y-auto",
                                settings.darkMode ? "bg-[#252525] border-gray-700 shadow-black" : "bg-white border-gray-100"
                              )}
                            >
                              {Object.entries(AVAILABLE_ICONS).map(([name, Comp]) => (
                                <button
                                  key={name}
                                  onClick={() => handleIconSelect(tab.path, name)}
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    settings.darkMode ? "hover:bg-black/40 text-gray-500" : "hover:bg-gray-50 text-gray-400",
                                    currentIconName === name && "text-brand-copper bg-brand-copper/10"
                                  )}
                                >
                                  <Comp className="w-5 h-5" />
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
               <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em]">Gestão de Agenda</h3>
               <div className="space-y-6">
                  <div className={cn("pb-6 border-b border-gray-100", settings.darkMode && "border-gray-800")}>
                    <p className={cn("text-[9px] font-black text-gray-400 mb-4 uppercase tracking-widest")}>Categorias de Evento</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.eventCategories.map((cat, i) => (
                        <span key={`${cat}-${i}`} className={cn(
                          "bg-brand-navy/5 text-brand-navy px-3 py-2 rounded-xl text-[9px] font-bold flex items-center gap-2 uppercase tracking-widest border border-brand-navy/10",
                          settings.darkMode && "bg-white/5 text-white border-white/10"
                        )}>
                          {cat}
                          <button onClick={() => removeCategory(cat)} className="text-brand-red ml-1"><X className="w-3.5 h-3.5" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Nova Categoria..." 
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCategory()}
                        className={cn(
                          "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                          settings.darkMode && "bg-black/40 border-gray-800 text-white"
                        )}
                      />
                      <button onClick={addCategory} className="bg-brand-navy text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className={cn("text-[9px] font-black text-gray-400 mb-4 uppercase tracking-widest")}>Sugestões de Nomes</p>
                    <div className="grid gap-2 mb-4 h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {settings.eventNames.map((name, i) => (
                        <div key={`${name}-${i}`} className={cn(
                          "flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100",
                          settings.darkMode && "bg-black/40 border-gray-800"
                        )}>
                          <span className={cn("text-xs font-bold text-brand-navy", settings.darkMode && "text-gray-200")}>{name}</span>
                          <button onClick={() => removeName(name)}><Trash2 className="w-4 h-4 text-red-500 opacity-60 hover:opacity-100" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Novo Nome Padrão..." 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addNameSuggestion()}
                        className={cn(
                          "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                          settings.darkMode && "bg-black/40 border-gray-800 text-white"
                        )}
                      />
                      <button onClick={addNameSuggestion} className="bg-brand-copper text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
               </div>
            </section>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> Sistema & Visual
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Modo Escuro</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Interface Noturna</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={cn(
                      "w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner",
                      settings.darkMode ? "bg-brand-red" : "bg-gray-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: settings.darkMode ? 28 : 0 }}
                      className="w-5 h-5 bg-white rounded-full shadow-lg" 
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Notificações</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Alertas de Eventos</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleNotifications}
                    className={cn(
                      "w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner",
                      settings.pushNotifications ? "bg-brand-navy" : "bg-gray-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: settings.pushNotifications ? 28 : 0 }}
                      className="w-5 h-5 bg-white rounded-full shadow-lg" 
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <Hash className="w-3 h-3" /> Backup & Importação
              </h3>
              <div className="grid gap-3">
                <button 
                  onClick={exportData}
                  className={cn(
                    "w-full p-5 rounded-3xl flex items-center justify-between border transition-all active:scale-[0.98]",
                    settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <ArrowDown className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={cn("text-xs font-black uppercase text-brand-navy tracking-widest", settings.darkMode && "text-white")}>Exportar Dados</p>
                      <p className="text-[9px] font-bold text-gray-400">Salvar backup do aplicativo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>

                <div className="relative">
                  <input 
                    type="file" 
                    id="import-input" 
                    className="hidden" 
                    accept=".json" 
                    onChange={importData} 
                  />
                  <label 
                    htmlFor="import-input"
                    className={cn(
                      "w-full p-5 rounded-3xl flex items-center justify-between border transition-all active:scale-[0.98] cursor-pointer",
                      settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <ArrowUp className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={cn("text-xs font-black uppercase text-brand-navy tracking-widest", settings.darkMode && "text-white")}>Importar Dados</p>
                        <p className="text-[9px] font-bold text-gray-400">Restaurar de um arquivo</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </label>
                </div>
              </div>
            </section>

            <section className="py-10 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-px bg-brand-copper/30" />
                <p className={cn("text-[10px] font-black text-brand-navy uppercase tracking-[0.4em]", settings.darkMode && "text-white")}>Oya & Ogun</p>
                <div className="w-10 h-px bg-brand-copper/30" />
              </div>
              <div className="inline-block px-6 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 shadow-inner">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Versão Gold • 2.0.0</p>
              </div>
              <p className="mt-6 text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-loose max-w-[200px] mx-auto opacity-50">
                Desenvolvido com fé para a gestão de terreiros de Umbanda.
              </p>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  const SETTINGS_CATEGORIES = [
    { id: 'profile', label: 'Perfil & Identidade', sub: 'Logo e Foto do Terreiro', icon: ShieldCheck, color: 'text-brand-copper bg-brand-copper/10' },
    { id: 'menu', label: 'Menu & Interface', sub: 'Ordem das abas e ícones', icon: Layout, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'events', label: 'Agenda & Eventos', sub: 'Categorias e nomes padrão', icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'preferences', label: 'Preferências', sub: 'Modo escuro e avisos', icon: Settings, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'data', label: 'Dados & Suporte', sub: 'Backup, info e suporte', icon: Hash, color: 'text-brand-navy bg-brand-navy/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
        settings.darkMode && "bg-[#121212]"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-2 pt-2">
        <h2 className={cn("text-3xl font-black text-brand-navy tracking-tighter", settings.darkMode && "text-white")}>Ajustes</h2>
        <div className="w-10 h-10 rounded-2xl bg-brand-copper/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-brand-copper animate-spin-slow" />
        </div>
      </div>

      <div className="grid gap-4">
        {SETTINGS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveSubScreen(cat.id)}
            className={cn(
              "w-full p-6 rounded-[32px] flex items-center justify-between border transition-all active:scale-[0.97] group border-transparent",
              settings.darkMode ? "bg-[#1A1A1A] hover:bg-[#202020] shadow-xl shadow-black/20" : "bg-white hover:bg-gray-50 shadow-sm border-gray-100"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className={cn("text-[13px] font-black uppercase tracking-wider text-brand-navy mb-1", settings.darkMode && "text-white")}>{cat.label}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.sub}</p>
              </div>
            </div>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity", settings.darkMode ? "bg-white/10" : "bg-gray-100")}>
              <ChevronRight className="w-4 h-4 text-brand-copper" />
            </div>
          </button>
        ))}
      </div>

      {/* Categories Footnote */}
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Gestão Terreiro Oya & Ogun</p>
      </div>

      <AnimatePresence>
        {activeSubScreen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col p-4",
              settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
            )}
          >
            <div className="flex items-center justify-between mb-8 px-2 pt-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveSubScreen(null)}
                  className={cn(
                    "w-12 h-12 rounded-[20px] flex items-center justify-center shadow-sm",
                    settings.darkMode ? "bg-white/5 text-gray-400" : "bg-white text-gray-400"
                  )}
                >
                  <ArrowLeftRight className="w-5 h-5 -rotate-90" />
                </button>
                <div>
                  <h3 className={cn("text-2xl font-black text-brand-navy tracking-tight", settings.darkMode && "text-white")}>
                    {SETTINGS_CATEGORIES.find(c => c.id === activeSubScreen)?.label}
                  </h3>
                  <p className="text-[10px] font-black text-brand-copper uppercase tracking-[0.2em]">Configurações Gerais</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSubScreen(null)}
                className="w-10 h-10 flex items-center justify-center text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-1">
              {renderSubScreen()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'category' ? "Excluir Categoria" : "Excluir Sugestão"}
        message={itemToDelete?.type === 'category' 
          ? "Deseja realmente excluir esta categoria de evento?" 
          : "Deseja realmente excluir esta sugestão de nome?"
        }
      />
    </motion.div>
  );
}
