import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Smartphone, Layout, Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, ArrowUp, ArrowDown, FileText, GripVertical,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Clock, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap,
  Image as ImageIcon, Camera, AtSign, Fingerprint, Sparkles, Trash2
} from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';

const AVAILABLE_ICONS: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Clock, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
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

const ORIXAS = [
  'Oxala', 'Iemanja', 'Ogum', 'Iansã/Oya', 'Oxossi', 'Oxum', 
  'Xangô', 'Omolu e Obaluaê', 'Nanã', 'Oxumare'
];

export default function InterfaceSettings() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);
  const [activeTabPicker, setActiveTabPicker] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const instagramRef = React.useRef<HTMLInputElement>(null);
  const tiktokRef = React.useRef<HTMLInputElement>(null);
  const whatsappRef = React.useRef<HTMLInputElement>(null);
  const orixaRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const primaryTabs = settings.primaryTabPaths || DEFAULT_PRIMARY;
  const secondaryTabs = settings.secondaryTabPaths || DEFAULT_SECONDARY;

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrixaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, orixaName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ 
          ...settings, 
          orixaPhotos: { 
            ...(settings.orixaPhotos || {}), 
            [orixaName]: reader.result as string 
          } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setSettings({ ...settings, logoBase64: undefined });

  return (
    <div className="space-y-12 pb-32">
      {/* 1. Organização de Abas */}
      <section className={cn(
        "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
        settings.darkMode && "bg-[#1A1A1A] border-gray-800"
      )}>
        <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
          <Smartphone className="w-3 h-3" /> Barra de Navegação
        </h3>
        
        <div className="space-y-8">
          <div>
            <p className="text-[9px] font-black uppercase text-gray-700 dark:text-gray-400 mb-4 tracking-widest flex items-center gap-2">
              <Layout className="w-3 h-3" /> Barra Principal
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
            <p className="text-[9px] font-black uppercase text-gray-700 dark:text-gray-400 mb-4 tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Menu "Mais"
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

      {/* 2. Visual & Branding */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
          <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Identidade Visual do Axé</h3>
        </div>

        <div className={cn(
          "bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-10",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800"
        )}>
          {/* Institutional Email */}
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">E-mail Institucional</label>
            <div className="relative">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="email" 
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="terreiro@email.com"
                className={cn(
                  "w-full bg-gray-50 pl-11 pr-4 py-4 rounded-[20px] text-xs font-bold outline-none border border-transparent focus:border-brand-copper transition-all",
                  settings.darkMode && "bg-black/40 border-gray-800 text-white"
                )}
              />
            </div>
          </div>

          {/* Primary Logo */}
          <div className="space-y-4">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Logo Oficial do Templo</p>
            <div className="flex flex-col items-center gap-6 p-8 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800">
              <div className="w-32 h-32 rounded-full bg-gray-50 dark:bg-black/20 flex items-center justify-center p-4 shadow-inner border border-gray-100 dark:border-gray-800 relative">
                {settings.logoBase64 ? (
                  <img src={settings.logoBase64} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-200" />
                )}
                {settings.logoBase64 && (
                  <button onClick={removeLogo} className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg active:scale-90 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3 bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-brand-navy/20 active:scale-95 transition-all"
              >
                Carregar Nova Logo
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'logoBase64')} />
            </div>
          </div>

          {/* Social Connects */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'instagramLogo', label: 'Instagram', icon: Camera, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', ref: instagramRef },
              { id: 'whatsappLogo', label: 'WhatsApp', icon: Smartphone, color: 'bg-[#25D366]', ref: whatsappRef },
              { id: 'tiktokLogo', label: 'TikTok', icon: Smartphone, color: 'bg-black', ref: tiktokRef }
            ].map(social => (
              <button 
                key={social.id}
                onClick={() => (social.ref.current as any)?.click()}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-[24px] border border-gray-100 transition-all active:scale-95",
                  settings.darkMode ? "bg-black/40 border-gray-800" : "bg-gray-50",
                  social.id === 'tiktokLogo' && "col-span-2 sm:col-span-1"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", social.color)}>
                  <social.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{social.label}</span>
                <input type="file" ref={social.ref} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, social.id as any)} />
              </button>
            ))}
          </div>

          {/* Fotos dos Orixás */}
          <div className="space-y-6 pt-4 border-t border-gray-50 dark:border-white/5">
            <div className="flex items-center justify-between px-1">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Registros de Orixás</p>
              <Sparkles className="w-3.5 h-3.5 text-brand-gold opacity-50" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {ORIXAS.map(orixa => (
                <div key={orixa} className="flex flex-col items-center gap-2 group">
                  <div 
                    onClick={() => orixaRefs.current[orixa]?.click()}
                    className={cn(
                      "w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-black/20 cursor-pointer transition-all active:scale-90 group-hover:border-brand-gold group-hover:bg-brand-gold/5 relative",
                      settings.orixaPhotos?.[orixa] ? "border-brand-gold/50 border-solid" : "border-gray-200 dark:border-gray-800"
                    )}
                  >
                    {settings.orixaPhotos?.[orixa] ? (
                      <img src={settings.orixaPhotos[orixa]} alt={orixa} className="w-full h-full object-cover" />
                    ) : (
                      <Fingerprint className="w-6 h-6 text-gray-200 dark:text-gray-700/50" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-[7px] font-black uppercase tracking-tighter text-center truncate w-full opacity-40">{orixa}</p>
                  <input 
                    type="file" 
                    ref={el => { orixaRefs.current[orixa] = el; }} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleOrixaPhotoUpload(e, orixa)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
