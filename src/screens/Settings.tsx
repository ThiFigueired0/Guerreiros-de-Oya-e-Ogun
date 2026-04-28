import React, { useState, useRef } from 'react';
import { 
  Moon, Sun, ChevronRight, Plus, Trash2, ShieldCheck, X, Image as ImageIcon, Camera,
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout, Smartphone,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';

const AVAILABLE_ICONS: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

const TAB_CONFIG = [
  { path: '/home', label: 'Início' },
  { path: '/calendar', label: 'Agenda' },
  { path: '/herbs', label: 'Banhos' },
  { path: '/trab', label: 'Trabalhos' },
  { path: '/points', label: 'Pontos' },
  { path: '/settings', label: 'Configurações' },
];

export default function SettingsScreen() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    tabIcons: {}
  });

  const [newCat, setNewCat] = useState('');
  const [newName, setNewName] = useState('');
  const [activeTabPicker, setActiveTabPicker] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => setSettings({ ...settings, darkMode: !settings.darkMode });

  const toggleNotifications = async () => {
    const newState = !settings.pushNotifications;
    
    // Update UI state immediately
    setSettings({ ...settings, pushNotifications: newState });
    
    // Side effect: request permission if turning on
    if (newState && 'Notification' in window) {
      try {
        // We don't await this so the UI doesn't hang if the prompt is blocked in the iframe
        Notification.requestPermission().then(permission => {
          console.log('Notification permission:', permission);
          if (permission !== 'granted' && permission !== 'default') {
            // Optional: revert if they explicitly denied? 
            // Better to keep the switch as "intent to have it on"
          }
        });
      } catch (e) {
        console.warn('Notification permission error:', e);
      }
    }
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

  const removeLogo = () => {
    const { logoBase64, ...rest } = settings;
    setSettings(rest);
  };

  const addCategory = () => {
    if (newCat && !settings.eventCategories.includes(newCat)) {
      setSettings({...settings, eventCategories: [...settings.eventCategories, newCat]});
      setNewCat('');
    }
  };

  const removeCategory = (cat: string) => {
    setSettings({...settings, eventCategories: settings.eventCategories.filter(c => c !== cat)});
  };

  const addNameSuggestion = () => {
    if (newName && !settings.eventNames.includes(newName)) {
      setSettings({...settings, eventNames: [...settings.eventNames, newName]});
      setNewName('');
    }
  };

  const removeName = (name: string) => {
    setSettings({...settings, eventNames: settings.eventNames.filter(n => n !== name)});
  };

  return (
    <motion.div className={cn(
      "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
      settings.darkMode && "bg-[#121212]"
    )}>
      <h2 className={cn(
        "text-xl font-bold text-brand-navy mb-6 px-2 tracking-tight",
        settings.darkMode && "text-white"
      )}>Configurações</h2>

      <div className="space-y-6">
        <section className={cn(
          "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors duration-500",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
        )}>
          <h3 className="text-[10px] font-black text-brand-copper uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" /> Identidade Guerreiros
          </h3>
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-24 h-24 rounded-full border-2 border-brand-copper mb-4 relative overflow-hidden bg-gray-50 flex items-center justify-center p-2",
              settings.darkMode && "bg-black/40"
            )}>
              {settings.logoBase64 ? (
                <img src={settings.logoBase64} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-200" />
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
                className="text-xs bg-brand-navy text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                <Camera className="w-3 h-3" /> {settings.logoBase64 ? 'Alterar Logo' : 'Adicionar Logo'}
              </button>
              {settings.logoBase64 && (
                 <button 
                  onClick={removeLogo}
                  className="text-xs bg-red-50 text-red-500 px-4 py-2 rounded-xl font-bold"
                >
                  Remover
                </button>
              )}
            </div>
            <p className="text-[8px] text-gray-400 mt-4 uppercase font-bold text-center tracking-widest">A logo será exibida no topo de todas as telas em formato circular.</p>
          </div>
        </section>

        <section className={cn(
          "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors duration-500",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
        )}>
          <h3 className="text-[10px] font-black text-brand-copper uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <Smartphone className="w-3 h-3" /> Personalizar Navegação
          </h3>
          <div className="space-y-4">
            {TAB_CONFIG.map((tab) => {
              const currentIconName = settings.tabIcons?.[tab.path];
              const IconComp = currentIconName ? AVAILABLE_ICONS[currentIconName] : null;

              return (
                <div key={tab.path} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{tab.label}</span>
                    <span className="text-[9px] text-gray-400 font-medium">Toque no ícone para alterar</span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveTabPicker(activeTabPicker === tab.path ? null : tab.path)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95",
                        settings.darkMode ? "bg-black/40 text-brand-copper border border-gray-800" : "bg-gray-50 text-brand-navy border border-gray-100"
                      )}
                    >
                      {IconComp ? <IconComp className="w-5 h-5" /> : <Plus className="w-4 h-4 opacity-30" />}
                    </button>

                    <AnimatePresence>
                      {activeTabPicker === tab.path && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className={cn(
                            "absolute right-0 top-12 z-50 p-3 rounded-2xl shadow-2xl border flex flex-wrap gap-2 w-48",
                            settings.darkMode ? "bg-[#252525] border-gray-700" : "bg-white border-gray-200"
                          )}
                        >
                          {Object.entries(AVAILABLE_ICONS).map(([name, Comp]) => (
                            <button
                              key={name}
                              onClick={() => handleIconSelect(tab.path, name)}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                settings.darkMode ? "hover:bg-black/40 text-gray-400" : "hover:bg-gray-50 text-gray-400",
                                currentIconName === name && "text-brand-copper"
                              )}
                            >
                              <Comp className="w-4 h-4" />
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

        <section className={cn(
          "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors duration-500",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
        )}>
          <h3 className="text-[10px] font-black text-brand-copper uppercase mb-4 tracking-[0.2em] flex items-center gap-2">
            <Moon className="w-3 h-3" /> Visual & Estilo
          </h3>
          <div className="flex items-center justify-between">
            <div>
               <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Modo Escuro</p>
               <p className="text-[10px] text-gray-400 font-medium">Adaptação para rituais noturnos</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={cn(
                "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
                settings.darkMode ? "bg-brand-red" : "bg-gray-200"
              )}
            >
               <motion.div 
                 animate={{ x: settings.darkMode ? 24 : 0 }}
                 className="w-4 h-4 bg-white rounded-full shadow-md" 
               />
            </button>
          </div>
        </section>

        <section className={cn(
          "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors duration-500",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
        )}>
           <h3 className="text-[10px] font-black text-brand-copper uppercase mb-4 tracking-[0.2em]">
             Gestão de Agenda
           </h3>
           
           <div className="space-y-4">
              <div className={cn("pb-4 border-b border-gray-50", settings.darkMode && "border-gray-800")}>
                <p className={cn("text-xs font-bold text-brand-navy mb-3 opacity-60", settings.darkMode && "text-white opacity-40")}>Categorias de Evento</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {settings.eventCategories.map((cat, i) => (
                    <span key={`${cat}-${i}`} className={cn(
                      "bg-brand-navy/5 text-brand-navy px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-2 uppercase tracking-widest border border-brand-navy/10",
                      settings.darkMode && "bg-white/5 text-white border-white/10"
                    )}>
                      {cat}
                      <button onClick={() => removeCategory(cat)} className="text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    placeholder="Nova Categoria..." 
                    value={newCat}
                    onChange={e => setNewCat(e.target.value)}
                    className={cn(
                      "flex-1 bg-gray-50 p-3 rounded-xl text-xs outline-none border border-gray-100 focus:border-brand-copper",
                      settings.darkMode && "bg-black/40 border-gray-800 text-white"
                    )}
                  />
                  <button onClick={addCategory} className={cn(
                    "bg-brand-navy text-white p-3 rounded-xl shadow-lg shadow-brand-navy/10",
                    settings.darkMode && "bg-brand-copper shadow-brand-copper/10"
                  )}><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <div>
                <p className={cn("text-xs font-bold text-brand-navy mb-3 opacity-60", settings.darkMode && "text-white opacity-40")}>Sugestões de Nomes</p>
                <div className="grid gap-2 mb-3">
                  {settings.eventNames.map((name, i) => (
                    <div key={`${name}-${i}`} className={cn(
                      "flex items-center justify-between bg-gray-50/50 p-3 px-4 rounded-xl border border-gray-100 italic",
                      settings.darkMode && "bg-black/40 border-gray-800"
                    )}>
                      <span className={cn("text-[11px] font-medium text-brand-navy", settings.darkMode && "text-gray-200")}>{name}</span>
                      <button onClick={() => removeName(name)}><X className="w-3 h-3 text-red-500" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    placeholder="Novo Nome Padrão..." 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className={cn(
                      "flex-1 bg-gray-50 p-3 rounded-xl text-xs outline-none border border-gray-100 focus:border-brand-copper",
                      settings.darkMode && "bg-black/40 border-gray-800 text-white"
                    )}
                  />
                  <button onClick={addNameSuggestion} className="bg-brand-copper text-white p-3 rounded-xl shadow-lg shadow-brand-copper/10"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
           </div>
        </section>

        <section className={cn(
          "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors duration-500",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800 shadow-xl"
        )}>
           <div className="flex items-center justify-between">
              <div>
                <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Habilitar Notificações</p>
                <p className="text-[10px] text-gray-400">Eventos agendados</p>
              </div>
              <button 
                onClick={toggleNotifications}
                className={cn(
                  "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
                  settings.pushNotifications ? "bg-brand-red" : "bg-gray-200"
                )}
              >
                 <motion.div 
                   animate={{ x: settings.pushNotifications ? 24 : 0 }}
                   className="w-4 h-4 bg-white rounded-full shadow-md" 
                 />
              </button>
           </div>
        </section>

        <section className="py-8 text-center">
           <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-px bg-brand-copper/30" />
              <p className={cn("text-[9px] font-black text-brand-navy uppercase tracking-[0.3em]", settings.darkMode && "text-white")}>Oya & Ogun</p>
              <div className="w-8 h-px bg-brand-copper/30" />
           </div>
           <p className="text-[8px] text-gray-300 font-bold uppercase">Tecnologia & Fé • v1.2.1</p>
        </section>
      </div>
    </motion.div>
  );
}
