import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Droplets, Music, FileText, Settings, Heart, X, Trash2, Star,
  Shield, Info, Book, Map, Hash, User, Users, Home, Layout, LayoutGrid,
  Anchor, Bell, BellOff, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap,
  History as HistoryIcon, LogOut, Bot, ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { cn } from './lib/utils';
import { useStorage } from './hooks/useStorage';
import { AppSettings, Event, Candle, NotificationItem, DEFAULT_TEMPLO_LOGO, DEFAULT_INSTAGRAM_LOGO, DEFAULT_TIKTOK_LOGO } from './types';
import { UndoContext, UndoAction } from './hooks/useUndo';
import { AssistantProvider, useAssistant } from './lib/AssistantContext';

import { AppRoutes } from './AppRoutes';
import { NotificationManager } from './components/NotificationManager';
import { GlobalSearch } from './components/GlobalSearch';
import AuthScreen from './screens/Auth';
import CompleteProfile from './screens/CompleteProfile';
import ResetPassword from './screens/ResetPassword';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { supabase } from './lib/supabase';
import { AssistantButton, AssistantWrapper } from './components/AssistantFeatures';

const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen w-full bg-[#001529]">
      <div className="w-12 h-12 border-4 border-t-brand-gold border-white/20 rounded-full animate-spin" />
    </div>
);

const ICON_MAP: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

const DEFAULT_DEV_REMINDER = "Obrigatório:\n- Bebidas para as quartinhas (Exu, Pombagira, Exu Mirim e Malandro)\n- Velas\n- Isqueiro\n- Roupa branca (Calça, shorts, camisa e Eketê)";

const CALENDAR_2026: Omit<Event, 'id'>[] = [
  { title: 'Festa de Marias', category: 'Festa', date: '2026-01-24' },
  { title: 'Gira de desenvolvimento - Oxóssi', category: 'Desenvolvimento', date: '2026-01-29', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Abertura da casa - festa de Oxossi (Caboclos)', category: 'Festa', date: '2026-01-31' },
  { title: 'Festa de Iemanjá (Marinheiro)', category: 'Festa', date: '2026-02-14' },
  { title: 'Gira de desenvolvimento - Iemanjá', category: 'Desenvolvimento', date: '2026-02-12', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de desenvolvimento - Baianos', category: 'Desenvolvimento', date: '2026-02-26', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de baianos', category: 'Gira aberta', date: '2026-02-28' },
  { title: 'Gira de desenvolvimento - Exu e Pombagira', category: 'Desenvolvimento', date: '2026-03-12', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Exu e Pombagira', category: 'Gira aberta', date: '2026-03-14' },
  { title: 'Gira de desenvolvimento - Malandros', category: 'Desenvolvimento', date: '2026-03-26', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Malandros', category: 'Gira aberta', date: '2026-03-28' },
  { title: 'Gira de desenvolvimento - Ciganos', category: 'Desenvolvimento', date: '2026-04-09', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Ciganos', category: 'Gira aberta', date: '2026-04-11' },
  { title: 'Gira de desenvolvimento - Ogun', category: 'Desenvolvimento', date: '2026-04-23', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Ogun (Baianos)', category: 'Festa', date: '2026-04-25' },
  { title: 'Gira de desenvolvimento - Preto Velho', category: 'Desenvolvimento', date: '2026-05-07', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa preto velho', category: 'Festa', date: '2026-05-09' },
  { title: 'Gira de desenvolvimento - Cigana', category: 'Desenvolvimento', date: '2026-05-21', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa cigana', category: 'Festa', date: '2026-05-23' },
  { title: 'Gira de desenvolvimento - Marinheiro', category: 'Desenvolvimento', date: '2026-06-04', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Marinheiro', category: 'Gira aberta', date: '2026-06-06' },
  { title: 'Gira de desenvolvimento - Xangô', category: 'Desenvolvimento', date: '2026-06-18', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Xangô (Caboclos)', category: 'Festa', date: '2026-06-20' },
  { title: 'Gira de desenvolvimento - Exu e Pombagira', category: 'Desenvolvimento', date: '2026-07-09', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Exu e Pombagira', category: 'Gira aberta', date: '2026-07-11' },
  { title: 'Gira de desenvolvimento - Nanã', category: 'Desenvolvimento', date: '2026-07-23', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Nanã (Preto velho)', category: 'Festa', date: '2026-07-25' },
  { title: 'Gira de Malandros', category: 'Gira aberta', date: '2026-08-01' },
  { title: 'Gira de desenvolvimento - Omolu', category: 'Desenvolvimento', date: '2026-08-13', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Omolu (Baianos)', category: 'Festa', date: '2026-08-15' },
  { title: 'Gira de desenvolvimento - Ciganos', category: 'Desenvolvimento', date: '2026-08-27', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Ciganos', category: 'Gira aberta', date: '2026-08-29' },
  { title: 'Gira de desenvolvimento - Marinheiros', category: 'Desenvolvimento', date: '2026-09-10', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Marinheiros', category: 'Gira aberta', date: '2026-09-12' },
  { title: 'Gira de desenvolvimento - Exu Mirim', category: 'Desenvolvimento', date: '2026-09-23', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Exu mirim', category: 'Gira aberta', date: '2026-09-26' },
  { title: 'Gira de desenvolvimento - Erê', category: 'Desenvolvimento', date: '2026-10-08', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Erê', category: 'Festa', date: '2026-10-10' },
  { title: 'Gira de desenvolvimento - Baianos', category: 'Desenvolvimento', date: '2026-10-22', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Baianos', category: 'Gira aberta', date: '2026-10-24' },
  { title: 'Gira de desenvolvimento - Malandros', category: 'Desenvolvimento', date: '2026-11-05', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Gira de Malandros', category: 'Festa', date: '2026-11-07' },
  { title: 'Gira de desenvolvimento - Exu e Pombagira', category: 'Desenvolvimento', date: '2026-11-19', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Festa de Exu e Pombagira (no terreiro)', category: 'Festa', date: '2026-11-21' },
  { title: 'Gira de desenvolvimento - Encerramento', category: 'Desenvolvimento', date: '2026-12-03', reminder: DEFAULT_DEV_REMINDER },
  { title: 'Enceramento Yabas (Baianos)', category: 'Festa', date: '2026-12-05' },
];

const ALL_TABS = [
  { path: '/home', label: 'Início', defaultIcon: Home, description: 'Visão geral' },
  { path: '/calendar', label: 'Agenda', defaultIcon: Calendar, description: 'Eventos e giras digitais' },
  { path: '/herbs', label: 'Banhos', defaultIcon: Leaf, description: 'Ervas e receitas sagradas' },
  { path: '/trab', label: 'Trabalhos', defaultIcon: Anchor, description: 'Trabalhos e rituais' },
  { path: '/points', label: 'Pontos', defaultIcon: Music, description: 'Hinário cantado' },
  { path: '/studies', label: 'Estudos', defaultIcon: GraduationCap, description: 'Doutrina e fundamentos' },
  { path: '/notes', label: 'Notas', defaultIcon: FileText, description: 'Anotações pessoais' },
  { path: '/finance', label: 'Financeiro', defaultIcon: Wallet, description: 'Gestão de valores e caixa' },
  { path: '/settings', label: 'Ajustes', defaultIcon: Settings, description: 'Perfil e preferências' },
];

const DEFAULT_PRIMARY = ['/home', '/calendar', '/herbs', '/trab'];
const DEFAULT_SECONDARY = ['/points', '/studies', '/notes', '/finance', '/settings'];

function Navigation() {
  const location = useLocation();
  const [showMore, setShowMore] = React.useState(false);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    tabIcons: {},
    primaryTabPaths: DEFAULT_PRIMARY,
    secondaryTabPaths: DEFAULT_SECONDARY,
    immersiveMode: true,
    primaryColor: '#B8860B',
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  const primaryPaths = settings.primaryTabPaths || DEFAULT_PRIMARY;
  const secondaryPaths = settings.secondaryTabPaths || DEFAULT_SECONDARY;

  const currentPrimaryTabs = primaryPaths.map(path => ALL_TABS.find(t => t.path === path)).filter(Boolean) as typeof ALL_TABS;
  const currentSecondaryTabs = secondaryPaths.map(path => ALL_TABS.find(t => t.path === path)).filter(Boolean) as typeof ALL_TABS;

  const activeTabInSecondary = currentSecondaryTabs.find(tab => location.pathname.startsWith(tab.path));
  
  return (
    <>
      <nav className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 min-w-[320px] max-w-sm h-[72px] rounded-full bg-white/70 backdrop-blur-2xl border border-white/40 z-[100] transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex items-center justify-between px-3",
        settings.darkMode && "bg-[#121212]/70 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      )}>
        <div className="flex justify-between items-center w-full relative">
          {currentPrimaryTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const iconName = settings.tabIcons?.[tab.path];
            const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : tab.defaultIcon;

            return (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={() => {
                  setShowMore(false);
                }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ease-out z-10",
                  isActive ? (settings.darkMode ? "text-white" : "text-brand-navy") : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className={cn(
                      "absolute inset-0 rounded-full shadow-sm -z-10",
                      settings.darkMode ? "bg-white/10" : "bg-white"
                    )}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <IconComponent className={cn(
                  "w-6 h-6 transition-transform duration-300", 
                  isActive ? "stroke-[2.5px] scale-105" : "scale-100"
                )} />
                <span className={cn(
                  "text-[9px] font-bold mt-1 transition-all duration-300 max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute bottom-1"
                )}>
                  {isActive && tab.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-500 ease-out z-10",
              (showMore || activeTabInSecondary) ? (settings.darkMode ? "text-white" : "text-brand-navy") : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            {activeTabInSecondary && !showMore && (
              <motion.div 
                layoutId="nav-pill"
                className={cn(
                  "absolute inset-0 rounded-full shadow-sm -z-10",
                  settings.darkMode ? "bg-white/10" : "bg-white"
                )}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <div className="relative">
               <LayoutGrid className={cn(
                 "w-6 h-6 transition-transform duration-300", 
                 (showMore || activeTabInSecondary) ? "stroke-[2.5px] scale-105" : "scale-100"
               )} />
               {activeTabInSecondary && !showMore && (
                 <div className="absolute 0 top-0 right-0 w-2 h-2 bg-[#B8860B] rounded-full border border-white dark:border-[#121212]" />
               )}
            </div>
            
            <span className={cn(
              "text-[9px] font-bold mt-1 transition-all duration-300",
              (showMore || activeTabInSecondary) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute bottom-1"
            )}>
              {(showMore || activeTabInSecondary) && 'Menu'}
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[95]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "fixed bottom-[110px] left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] bg-white/80 backdrop-blur-3xl rounded-[36px] overflow-hidden z-[100] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 pb-2",
                settings.darkMode && "bg-[#1E1E1E]/80 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              )}
            >
              <div className={cn(
                "px-6 py-4 flex items-center justify-end border-b",
                settings.darkMode ? "border-white/5" : "border-gray-100"
              )}>
                 <button onClick={() => setShowMore(false)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                   <X className="w-4 h-4 text-gray-400" />
                 </button>
              </div>
              
              <div className="p-4 grid grid-cols-3 gap-y-6 gap-x-2">
                {currentSecondaryTabs.map((tab) => {
                  const isActive = location.pathname.startsWith(tab.path);
                  const iconName = settings.tabIcons?.[tab.path];
                  const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : tab.defaultIcon;

                  return (
                    <Link
                      key={tab.path}
                      to={tab.path}
                      onClick={() => setShowMore(false)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-300 relative group-hover:scale-105",
                        isActive 
                           ? (settings.darkMode ? "bg-white text-[#121212]" : "bg-brand-navy text-white shadow-lg shadow-brand-navy/20")
                           : (settings.darkMode ? "bg-white/10 text-gray-300 hover:bg-white/20" : "bg-gray-50/80 text-gray-600 hover:bg-gray-100")
                      )}>
                        {isActive && (
                           <div className="absolute inset-0 rounded-[20px] shadow-sm shadow-black/5" />
                        )}
                        <IconComponent className={cn("w-7 h-7", isActive && "stroke-[2.5px]")} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tighter text-center w-full px-1",
                        isActive ? (settings.darkMode ? "text-white" : "text-brand-navy") : "text-gray-500"
                      )}>{tab.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const TopHeader = React.memo(function TopHeader() {
  const { user } = useAuth();
  const [isGuest] = useStorage<boolean>('templo_guest', false);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    immersiveMode: true,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  const fullName = React.useMemo(() => {
    if (isGuest) return "Modo Guest";
    
    // 1. Prefer explicitly set firstName + lastName from local settings (synced/manual)
    const sName = [settings.firstName?.trim(), settings.lastName?.trim()].filter(Boolean).join(' ');
    if (sName) return sName;
    
    // 2. Fallback to Supabase metadata (First/Last from manual signup or full_name from Google)
    const metadata = user?.user_metadata;
    const mFullName = [metadata?.first_name, metadata?.last_name].filter(Boolean).join(' ');
    if (mFullName) return mFullName;
    if (metadata?.full_name) return metadata.full_name;
    if (metadata?.name) return metadata.name;
    
    return settings.nickname || "Guerreiro";
  }, [isGuest, settings.firstName, settings.lastName, settings.nickname, user]);

  const leaves = React.useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      size: 10 + Math.random() * 20,
      duration: 15 + Math.random() * 30,
      delay: Math.random() * -20,
      opacity: 0.15 + Math.random() * 0.25,
      pathX: Math.random() * 200 - 100,
      pathY: Math.random() * 150 - 75,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5
    }));
  }, []);

  return (
    <div 
      className={cn(
        "relative overflow-hidden shadow-2xl flex flex-col items-center min-h-[40dvh] sm:min-h-0",
        settings.darkMode 
          ? "bg-gradient-to-b from-[#0A0A0A] to-black" 
          : "bg-gradient-to-br from-brand-navy via-[#001c38] to-[#000a14]"
      )}
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
        paddingBottom: '4rem',
        backgroundAttachment: 'scroll',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[1px]" 
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/p6.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}
      />

      {/* Decorative Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Leaves across the entire banner - Higher visibility */}
        {(settings.immersiveMode !== false) && leaves.map((leaf) => (
          <motion.div
            key={`leaf-fixed-${leaf.id}`}
            initial={{ 
              left: leaf.left,
              top: leaf.top,
              rotate: leaf.rotate,
              opacity: 0,
              scale: leaf.scale
            }}
            animate={{ 
              x: [0, leaf.pathX, 0],
              y: [0, leaf.pathY, 0],
              rotate: [0, 180, 360],
              opacity: [0, leaf.opacity, leaf.opacity, 0]
            }}
            transition={{ 
              duration: leaf.duration, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: leaf.delay
            }}
            className="absolute z-0"
          >
            <Leaf 
              className="text-brand-copper/60 fill-brand-copper/10" 
              style={{ 
                width: leaf.size, 
                height: leaf.size,
              }} 
            />
          </motion.div>
        ))}

        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-80 h-80 bg-brand-copper rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-red rounded-full blur-[80px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Title Moved above the logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center mb-8 gap-2"
        >
          {fullName && (
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 mb-1 flex items-center justify-center gap-2 focus-within:ring-2 ring-brand-gold/50">
              {isGuest ? (
                <Ghost className="w-3.5 h-3.5 text-white/80" />
              ) : settings.profilePhoto ? (
                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30">
                  <img src={settings.profilePhoto} alt="User" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{fullName}</span>
            </div>
          )}
          <h2 className="text-brand-copper font-serif text-[11px] sm:text-[13px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-black text-center px-2 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Guerreiros de Oya e Ogum
          </h2>
          <motion.div 
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-copper/40 to-transparent mt-1" 
          />
        </motion.div>

        {/* Floating Logo Container */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Outer Glowing Ring */}
          <div className="absolute -inset-4 rounded-full bg-brand-copper/10 blur-xl animate-pulse" />
          <div className="absolute -inset-1 rounded-full border border-brand-copper/20 ring-4 ring-brand-copper/5" />
          
          {/* Rotating decorative icons - Herb Leaves */}
          <div className="absolute -inset-8 pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="w-full h-full relative"
            >
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div 
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-85px) rotate(-${i * 60}deg)`
                  }}
                >
                  <Leaf className="w-4 h-4 text-brand-copper/30 drop-shadow-[0_0_5px_rgba(184,134,11,0.2)]" />
                </div>
              ))}
            </motion.div>
          </div>

          <div className={cn(
            "w-40 h-40 rounded-full border-2 border-brand-copper/40 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center p-1.5 overflow-hidden relative",
            settings.darkMode ? "bg-gray-950 border-brand-copper/20" : "bg-white"
          )}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
            
            {(settings.logoBase64 || DEFAULT_TEMPLO_LOGO) && (
              <img 
                src={settings.logoBase64 || DEFAULT_TEMPLO_LOGO} 
                alt="Logo Templo" 
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
});

function SocialButtons() {
  const location = useLocation();
  const { setShowAssistantModal, isScrolled } = useAssistant();
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    immersiveMode: true,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });

  return (
    <div className="w-full flex-row gap-0 px-8 -mt-6 mb-8 relative z-30 flex items-center justify-center pointer-events-none h-14">
      
      {/* INSTAGRAM (Left) */}
      <motion.a
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        style={{ maxWidth: 180 }}
        transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="https://www.instagram.com/guerreirosdeoyaeogum/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "h-12 rounded-l-[24px] bg-gradient-to-br from-[#FFE4B5] via-[#FFD700] to-[#DAA520] text-[#1a2e4d] shadow-[0_10px_20px_-5px_rgba(218,165,32,0.5)] border border-white/50 flex items-center overflow-hidden relative pointer-events-auto z-10 mr-[-24px]",
          settings.darkMode && "from-[#B8860B] via-[#8B6508] to-[#664500] text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6)] border-white/10"
        )}
      >
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.2, delay: 0.4 }}
           className="h-full flex items-center justify-start gap-3 pl-2 sm:pl-3 pr-[32px] absolute right-0 min-w-[140px] sm:min-w-[170px]"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform relative z-10 shrink-0 overflow-hidden">
            {(settings.instagramLogo || DEFAULT_INSTAGRAM_LOGO) && (
              <img src={settings.instagramLogo || DEFAULT_INSTAGRAM_LOGO} alt="Instagram Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="text-left relative z-10 mx-auto whitespace-nowrap">
            <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none">Instagram</h3>
          </div>
        </motion.div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </motion.a>
      
      {/* ROBÔ (Center) */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1.1, 1], opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="z-50 relative shrink-0 pointer-events-auto flex items-center justify-center w-14 h-14"
      >
        {!isScrolled && <AssistantButton onClick={() => setShowAssistantModal(true)} />}
      </motion.div>

      {/* TIKTOK (Right) */}
      <motion.a
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: "100%", opacity: 1 }}
        style={{ maxWidth: 180 }}
        transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="https://www.tiktok.com/@guerreirosdeoyaeogum?lang=pt-BR"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "h-12 rounded-r-[24px] bg-gradient-to-br from-[#FFE4B5] via-[#FFD700] to-[#DAA520] text-[#1a2e4d] shadow-[0_10px_20px_-5px_rgba(218,165,32,0.5)] border border-white/50 flex items-center overflow-hidden relative pointer-events-auto z-10 ml-[-24px]",
          settings.darkMode && "from-[#B8860B] via-[#8B6508] to-[#664500] text-white shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6)] border-white/10"
        )}
      >
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.2, delay: 0.4 }}
           className="h-full flex items-center justify-end gap-3 pr-2 sm:pr-3 pl-[32px] absolute left-0 min-w-[140px] sm:min-w-[170px]"
        >
          <div className="text-right relative z-10 mx-auto whitespace-nowrap">
            <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none">TikTok</h3>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform relative z-10 shrink-0 overflow-hidden">
            {(settings.tiktokLogo || DEFAULT_TIKTOK_LOGO) && (
              <img src={settings.tiktokLogo || DEFAULT_TIKTOK_LOGO} alt="TikTok Logo" className="w-full h-full object-cover" />
            )}
          </div>
        </motion.div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </motion.a>

    </div>
  );
}

function NotificationCenter({ 
  darkMode, 
  notifications, 
  setNotifications 
}: { 
  darkMode: boolean, 
  notifications: NotificationItem[], 
  setNotifications: (val: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => void 
}) {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [filter, setFilter] = React.useState<'all' | 'calendar' | 'finance' | 'stock' | 'points' | 'work' | 'system'>('all');
  const [isGuest] = useStorage<boolean>('templo_guest', false);
  const location = useLocation();
  const navigate = useNavigate();

  const generateMockNotifications = () => {
    const mocks: NotificationItem[] = [
      { id: `mock_calendar_event_${Date.now()}_1`, title: 'Evento: Gira de Desenvolvimento Iniciada', timestamp: Date.now(), category: 'calendário', read: false },
      { id: `mock_finance_${Date.now()}_2`, title: 'Finanças: Mensalidade recebida de João', timestamp: Date.now() - 1000, category: 'adição', read: false },
      { id: `mock_herb_stock_${Date.now()}_3`, title: 'Estoque: Alecrim adicionado', timestamp: Date.now() - 2000, category: 'adição', read: false },
      { id: `mock_ponto_${Date.now()}_4`, title: 'Pontos: Novo ponto de Oxóssi cadastrado', timestamp: Date.now() - 3000, category: 'adição', read: false },
      { id: `mock_bicho_${Date.now()}_5`, title: 'Trabalhos: Novo Bicho registrado', timestamp: Date.now() - 4000, category: 'adição', read: false },
      { id: `mock_system_${Date.now()}_6`, title: 'Sistema: Teste de Notificação', timestamp: Date.now() - 5000, category: 'sistema', read: false },
    ];
    setNotifications(prev => [...mocks, ...prev].slice(0, 100));
  };

  // Close notifications on route change
  React.useEffect(() => {
    setShowNotifications(false);
  }, [location.pathname]);

  // Auto-expiry: Remove notifications older than 7 days
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  React.useEffect(() => {
    const now = Date.now();
    const validNotifications = notifications.filter(n => now - n.timestamp < SEVEN_DAYS_MS);
    if (validNotifications.length !== notifications.length) {
      setNotifications(validNotifications);
    }
  }, []);

  const clearHistory = () => {
    setNotifications([]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Mark all as read ONLY WHEN panel is closed (transitioning from true to false)
  const previousShowNotifications = React.useRef(showNotifications);
  React.useEffect(() => {
    if (previousShowNotifications.current === true && showNotifications === false) {
      setNotifications(prev => {
        if (prev.some(n => !n.read)) {
          return prev.map(n => ({ ...n, read: true }));
        }
        return prev;
      });
    }
    previousShowNotifications.current = showNotifications;
  }, [showNotifications, setNotifications]);

  const getNotificationModule = (notif: NotificationItem) => {
    if (notif.id.includes('finance')) return 'finance';
    if (notif.id.includes('_event_') || notif.id.startsWith('event_')) return 'calendar';
    if (notif.id.includes('_herb_') || notif.id.includes('_ready_bath')) return 'stock';
    if (notif.id.includes('_ponto_') || notif.id.includes('_folder_')) return 'points';
    if (notif.id.includes('_bicho_') || notif.id.includes('_candle_') || notif.id.includes('_offering_') || notif.id.startsWith('precept_')) return 'work';
    if (notif.category === 'calendário') return 'calendar';
    if (notif.category === 'preceito') return 'work';
    return 'system';
  };

  const getRouteForModule = (module: string) => {
    switch (module) {
      case 'calendar': return '/calendar';
      case 'finance': return '/financeiro';
      case 'stock': return '/herbs';
      case 'points': return '/points';
      case 'work': return '/trabalhos';
      default: return null;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    
    const module = getNotificationModule(notif);
    const route = getRouteForModule(module);
    
    if (route && location.pathname !== route) {
      navigate(route);
      setShowNotifications(false);
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  const filteredNotifications = filter === 'all' 
    ? sortedNotifications 
    : sortedNotifications.filter(n => getNotificationModule(n) === filter);

  const unreadNotifications = filteredNotifications.filter((n: NotificationItem) => !n.read);
  const readNotifications = filteredNotifications.filter((n: NotificationItem) => n.read);
  
  // Badge count: Só mostra se houver não-lidas e o painel estiver fechado
  const showBadge = !showNotifications && notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const FILTERS = [
    { id: 'all', label: 'Todas' },
    { id: 'calendar', label: 'Eventos' },
    { id: 'finance', label: 'Finanças' },
    { id: 'stock', label: 'Estoque' },
    { id: 'work', label: 'Trabalhos' },
    { id: 'points', label: 'Pontos' },
  ] as const;

  return (
    <>
      <div className="absolute top-3 right-6 z-[60]">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNotifications(true)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer backdrop-blur-md transition-all",
            darkMode 
              ? "bg-black/40 border border-white/10" 
              : "bg-white/10 border border-white/20 hover:bg-white/20"
          )}
        >
          <div className="relative">
            <Bell className={cn("w-5 h-5", darkMode ? "text-gray-300" : "text-white")} strokeWidth={2.5} />
            {showBadge && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-brand-red border-2 border-white items-center justify-center">
                  <span className="text-[9px] font-black text-white leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-full max-w-lg h-[75vh] sm:h-[80vh] flex flex-col rounded-[40px] overflow-hidden shadow-2xl relative border",
                darkMode 
                  ? "bg-[#1A1A1A] text-white border-white/5" 
                  : "bg-[#FDFDFD] text-slate-900 border-gray-100"
              )}
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between border-b dark:border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                       Notificações
                       {isGuest && (
                          <button onClick={generateMockNotifications} className="ml-2 text-[10px] bg-brand-navy/10 text-brand-navy dark:bg-brand-gold/20 dark:text-brand-gold px-2 py-1 rounded-lg hover:bg-brand-navy/20 dark:hover:bg-brand-gold/30 transition-colors uppercase tracking-widest font-black flex items-center gap-1" title="Adicionar notificações de teste (Apenas Visitante)">
                             <Zap className="w-3 h-3" />
                             Simular
                          </button>
                       )}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-12 h-12 rounded-2xl bg-brand-navy dark:bg-brand-gold flex items-center justify-center active:scale-90 transition-all text-white hover:shadow-lg shadow-brand-navy/20"
                  aria-label="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-6 shrink-0">
                  <div className="mb-4 p-4 bg-brand-gold/5 dark:bg-white/5 rounded-[24px] border border-brand-gold/10 dark:border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                      <Info className="w-4 h-4 text-brand-gold" />
                    </div>
                    <p className="text-[11px] font-medium leading-tight opacity-70">
                      Limpeza automática: as notificações expiram após 7 dias corridos.
                    </p>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x mb-2">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={cn(
                          "snap-start px-4 py-2 rounded-full whitespace-nowrap text-[11px] font-bold tracking-wider transition-all border",
                          filter === f.id
                            ? "bg-brand-gold text-white border-transparent shadow-md"
                            : darkMode
                              ? "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                              : "bg-gray-50 text-slate-600 border-gray-200 hover:bg-gray-100"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-40">
                      <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                        <BellOff className="w-8 h-8" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">{filter === 'all' ? 'Céu Limpo' : 'Nenhuma notificação'}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">{filter === 'all' ? 'Sem notificações' : `Na categoria ${FILTERS.find(f => f.id === filter)?.label}`}</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {unreadNotifications.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy dark:text-brand-gold">Recentes</span>
                              <span className="px-2 py-0.5 rounded-full bg-brand-gold text-[9px] font-black text-white">{unreadNotifications.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-3 py-1.5 text-brand-navy dark:text-brand-gold bg-brand-navy/5 dark:bg-brand-gold/10 rounded-xl hover:bg-brand-navy hover:text-white dark:hover:bg-brand-gold transition-all active:scale-95 group border border-brand-navy/10 dark:border-brand-gold/20 shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
                                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Lidas</span>
                              </button>
                              {filter === 'all' && (
                                <button 
                                  onClick={clearHistory}
                                  className="flex items-center gap-2 px-3 py-1.5 text-brand-red bg-red-50 dark:bg-brand-red/10 rounded-xl hover:bg-brand-red hover:text-white transition-all active:scale-95 group border border-red-100 dark:border-brand-red/20 shadow-sm"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Limpar</span>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <AnimatePresence>
                              {unreadNotifications.map((notif: NotificationItem) => (
                                <NotificationCard key={notif.id} notif={notif} darkMode={darkMode} isUnread onClick={() => handleNotificationClick(notif)} onDelete={() => handleDeleteNotification(notif.id)} module={getNotificationModule(notif)} />
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {readNotifications.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Anteriores</span>
                            {!unreadNotifications.length && filter === 'all' && (
                               <button 
                                 onClick={clearHistory}
                                 className="flex items-center gap-2 px-3 py-1.5 text-brand-red bg-red-50 dark:bg-brand-red/10 rounded-xl hover:bg-brand-red hover:text-white transition-all active:scale-95 group border border-red-100 dark:border-brand-red/20 shadow-sm"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                                 <span className="text-[9px] font-black uppercase tracking-widest">Limpar</span>
                               </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <AnimatePresence>
                              {readNotifications.map((notif: NotificationItem) => (
                                <NotificationCard key={notif.id} notif={notif} darkMode={darkMode} onClick={() => handleNotificationClick(notif)} onDelete={() => handleDeleteNotification(notif.id)} module={getNotificationModule(notif)} />
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationCard({ notif, darkMode, isUnread, onClick, onDelete, module }: { notif: NotificationItem, darkMode: boolean, isUnread?: boolean, onClick?: () => void, onDelete?: () => void, module: string }) {
  const getStyles = () => {
    switch (module) {
      case 'calendar':
        return {
          iconBg: darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-600',
          dot: 'bg-amber-500',
        };
      case 'finance':
        return {
          iconBg: darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
          dot: 'bg-emerald-500',
        };
      case 'stock':
        return {
          iconBg: darkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600',
          dot: 'bg-green-600',
        };
      case 'points':
        return {
          iconBg: darkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600',
          dot: 'bg-purple-500',
        };
      case 'work':
        return {
          iconBg: darkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600',
          dot: 'bg-orange-500',
        };
      case 'system':
      default:
        return {
          iconBg: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600',
          dot: 'bg-blue-500',
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (module) {
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'finance': return <Wallet className="w-5 h-5" />;
      case 'stock': return <Leaf className="w-5 h-5" />;
      case 'points': return <Music className="w-5 h-5" />;
      case 'work': return <Flame className="w-5 h-5" />;
      default: return <HistoryIcon className="w-5 h-5" />;
    }
  };

  const getTitleText = () => {
    if (notif.category === 'adição') return "Novo Item";
    if (notif.category === 'edição') return "Atualização";
    if (notif.category === 'remoção' || notif.category === 'exclusão') return "Removido";
    switch (module) {
      case 'calendar': return "Evento";
      case 'finance': return "Finança";
      case 'stock': return "Estoque";
      case 'points': return "Pontos";
      case 'work': return "Trabalhos";
      default: return "Sistema";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2 }}
      className="relative group w-full"
    >
      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
         <div 
           className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 cursor-pointer active:scale-95 transition-transform" 
           onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
         >
            <Trash2 className="w-5 h-5" />
         </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          if (info.offset.x < -40) onDelete?.();
        }}
        onClick={onClick}
        className={cn(
          "cursor-pointer p-4 rounded-[24px] border flex items-center gap-4 transition-all relative shadow-sm hover:shadow-md h-full z-10 w-full",
          darkMode 
            ? "bg-[#1C1C1C] border-white/5 hover:border-white/10" 
            : "bg-white border-slate-100 hover:border-slate-200",
          isUnread && (darkMode ? "bg-[#252525]" : "bg-slate-50/80")
        )}
      >
        <div className={cn(
          "relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
          styles.iconBg
        )}>
          {getIcon()}
          {isUnread && (
            <div className={cn("absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2", styles.dot, darkMode ? "border-[#1C1C1C]" : "border-white")} />
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
           <div className="flex items-center gap-2 mb-1">
             <span className={cn(
               "text-[10px] uppercase font-black tracking-widest",
               darkMode ? "text-slate-400" : "text-slate-500"
             )}>{getTitleText()}</span>
             {isUnread && <div className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />}
           </div>
           <p className={cn(
             "text-[13px] font-bold leading-tight line-clamp-2",
             isUnread 
               ? (darkMode ? "text-white" : "text-slate-900")
               : (darkMode ? "text-slate-300" : "text-slate-700")
           )}>
             {notif.title}
           </p>
        </div>

        <div className="text-right shrink-0 flex flex-col items-end gap-1 pointer-events-none">
          <span className={cn("text-[10px] font-semibold", darkMode ? "text-slate-500" : "text-slate-400")}>
            {new Date(notif.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
          <span className={cn("text-[11px] font-black", darkMode ? "text-slate-400" : "text-slate-500")}>
            {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UndoToast({ action, onUndo, onFinish }: { action: UndoAction, onUndo: () => void, onFinish: () => void }) {
  const [progress, setProgress] = React.useState(100);
  const duration = 6000;
  const startTime = React.useRef(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onFinish();
      }
    }, 16);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-brand-navy text-white rounded-3xl overflow-hidden shadow-2xl z-[150] p-4 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-brand-red" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight truncate">Item "{action.label}" excluído</p>
          <p className="text-[10px] opacity-60 font-medium italic">Esta ação não pode ser desfeita após o tempo esgotar</p>
        </div>
      </div>
      
      <button
        onClick={onUndo}
        className="px-4 py-2 bg-brand-copper rounded-xl text-[10px] font-black uppercase tracking-widest text-white active:scale-95 transition-all shadow-lg shadow-brand-copper/30"
      >
        Desfazer
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <motion.div 
          className="h-full bg-brand-copper"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

function InitialLoader({ show, logo }: { show: boolean, logo?: string | null }) {
  const [progress, setProgress] = React.useState(0);
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: [],
    eventNames: [],
    pushNotifications: true,
    immersiveMode: true,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {}
  });
  
  React.useEffect(() => {
    if (!show) return;
    const startTime = Date.now();
    const duration = 4000;
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) clearInterval(timer);
    }, 50);
    
    return () => clearInterval(timer);
  }, [show]);

  const leaves = React.useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      size: 15 + Math.random() * 25,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * -20,
      left: `${Math.random() * 100}%`,
    }));
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden h-[100dvh]"
          style={{ backgroundColor: '#001529' }}
        >
          {/* Global Animated Background */}
          <div className="absolute inset-0 pointer-events-none">
            {settings.immersiveMode !== false && leaves.map((leaf) => (
              <div
                key={`splash-leaf-${leaf.id}`}
                className="leaf-floating"
                style={{
                  '--left': leaf.left,
                  '--duration': `${leaf.duration}s`,
                  '--delay': `${leaf.delay}s`,
                  '--size': `${leaf.size}px`,
                  top: '100%'
                } as React.CSSProperties}
              >
                <Leaf className="text-brand-copper/30 fill-brand-copper/10 w-full h-full" />
              </div>
            ))}
            
            {/* Optimized background glow without blur to save mobile memory */}
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-copper/20 rounded-full"
            />
          </div>

          {/* Logo & Content */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              {/* Pulse Glow - Optimized */}
              <motion.div 
                animate={{ 
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-10 bg-brand-copper/20 rounded-full"
              />

              <div className="w-48 h-48 rounded-full border border-brand-copper/30 bg-white shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 overflow-hidden relative">
                {logo && (
                  <img src={logo} alt="Logo" className="w-full h-full object-contain logo-optimized" />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 text-center"
            >
              <h1 className="text-brand-gold font-serif text-2xl tracking-[0.5em] font-black uppercase drop-shadow-lg flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                GUERREIROS DE OYA E OGUN
              </h1>
              
              {/* Progress Bar */}
              <div className="w-48 h-1 bg-brand-copper/20 mx-auto mt-8 rounded-full overflow-hidden relative">
                <div 
                  className="absolute left-0 top-0 h-full bg-brand-gold transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mt-6">
                Tenda de Umbanda • Oya e Ogum
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if profile is complete (required metadata exists for Google users)
  const isProfileComplete = React.useMemo(() => {
    if (!user) return true; // Let Auth handle login
    const metadata = user.user_metadata;
    // We require birth_date and gender (nickname is optional)
    return !!(metadata?.birth_date && metadata?.gender);
  }, [user]);

  const [isGuest, setIsGuest] = useStorage<boolean>('templo_guest', false);
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {

    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    immersiveMode: true,
    primaryColor: '#B8860B',
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {},
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: 'masculino'
  });

  // Apply the Primary Color dynamically
  React.useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--brand-copper', settings.primaryColor);
      // Also derive a lighter version if needed, or just let it use the same
      document.documentElement.style.setProperty('--brand-gold', settings.primaryColor);
    } else {
      document.documentElement.style.removeProperty('--brand-copper');
      document.documentElement.style.removeProperty('--brand-gold');
    }
  }, [settings.primaryColor]);

  const [notifications, setNotifications] = useStorage<NotificationItem[]>('templo_history', []);
  const [deliveredIds, setDeliveredIds] = useStorage<string[]>('templo_delivered_automated', []);
  const [events, setEvents] = useStorage<Event[]>('templo_events', []);
  const [bichos, setBichos] = useStorage<any[]>('templo_bichos', []);
  const [candles, setCandles] = useStorage<Candle[]>('templo_candles', [
    { id: '1', color: 'Branca', quantity: 10, type: '7 Dias' },
    { id: '2', color: 'Vermelha', quantity: 5, type: 'Palito' },
    { id: '3', color: 'Preta', quantity: 12, type: 'Palito' }
  ]);
  const [processedCandleEvents, setProcessedCandleEvents] = useStorage<string[]>('templo_processed_candle_events', []);
  const [processedOgaEvents, setProcessedOgaEvents] = useStorage<string[]>('templo_processed_oga_events', []);

  // Sync user profile from Supabase metadata if logged in
  React.useEffect(() => {
    if (user && user.user_metadata) {
      const metadata = user.user_metadata;
      let hasChanges = false;
      const newSettings = { ...settings };

      if (!newSettings.firstName && metadata.first_name) {
        newSettings.firstName = metadata.first_name;
        hasChanges = true;
      }
      if (!newSettings.lastName && metadata.last_name) {
        newSettings.lastName = metadata.last_name;
        hasChanges = true;
      }
      if (!newSettings.nickname && metadata.nickname) {
        newSettings.nickname = metadata.nickname;
        hasChanges = true;
      }
      if (!newSettings.gender && metadata.gender) {
        newSettings.gender = metadata.gender;
        hasChanges = true;
      }
      if (!newSettings.birthDate && metadata.birth_date) {
        newSettings.birthDate = metadata.birth_date;
        hasChanges = true;
      }
      if (!newSettings.email && user.email) {
        newSettings.email = user.email;
        hasChanges = true;
      }

      if (hasChanges) {
        setSettings(newSettings);
      }
    }
  }, [user]); // Run when user logs in

  const [activeUndo, setActiveUndo] = React.useState<UndoAction | null>(null);
  const [isAppReady, setIsAppReady] = React.useState(false);
  const [hasRemovedPreloader, setHasRemovedPreloader] = React.useState(false);

  React.useEffect(() => {
    // Stage 1: Mark app as ready after 4 seconds
    const timer = setTimeout(() => {
      setIsAppReady(true);
      
      // Stage 2: Trigger fade out for the native preloader
      const preloader = document.getElementById('splash-preloader');
      if (preloader) {
        preloader.classList.add('fade-out');
        
        // Stage 3: Remove from DOM after transition
        setTimeout(() => {
          preloader.remove();
          setHasRemovedPreloader(true);
        }, 850);
      } else {
        setHasRemovedPreloader(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Automated Notifications for Events and Precepts
  React.useEffect(() => {
    const checkAutomatedNotifications = () => {
      const now = new Date();
      
      // Get hour in Brasília / São Paulo time
      const brHour = parseInt(new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        hour12: false
      }).format(now));
      
      // Check Silent Hours
      const isSilentTime = () => {
        if (!settings.pushNotifications) return true;
        if (!settings.silentHoursStart || !settings.silentHoursEnd) return false;
        const time = brHour * 60 + now.getMinutes();
        const [startH, startM] = settings.silentHoursStart.split(':').map(Number);
        const [endH, endM] = settings.silentHoursEnd.split(':').map(Number);
        const startValue = startH * 60 + (startM || 0);
        const endValue = endH * 60 + (endM || 0);
        
        if (startValue < endValue) {
          return time >= startValue && time <= endValue;
        } else {
          return time >= startValue || time <= endValue;
        }
      };

      if (isSilentTime()) return;
      
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const newNotifs: NotificationItem[] = [];
      const newDeliveredIds: string[] = [...deliveredIds];
      const allEvents = [...CALENDAR_2026, ...events];

      const addAutomatedNotif = (id: string, title: string, category: string) => {
        // Double check: not in current history AND not in deliveredIds list
        if (!notifications.some(n => n.id === id) && !deliveredIds.includes(id)) {
          newNotifs.push({
            id,
            title,
            timestamp: Date.now(),
            category,
            read: false
          });
          newDeliveredIds.push(id);
        }
      };

      // 1. Calendar Event Reminders (1 day before and same day)
      allEvents.forEach(event => {
          const uniqueKey = 'id' in event ? event.id : `${event.date}_${event.title}`;
          const eventId_today = `event_${uniqueKey}_today_${todayStr}`;
          const eventId_tomorrow = `event_${uniqueKey}_tomorrow_${todayStr}`;

          // Today's event
          if (event.date === todayStr) {
            addAutomatedNotif(eventId_today, `Evento hoje: ${event.title}`, 'calendário');
          }
          // Tomorrow's event
          if (event.date === tomorrowStr) {
            addAutomatedNotif(eventId_tomorrow, `Evento amanhã: ${event.title}`, 'calendário');
          }
        });

      // 2. Precept Reminders (Sunday for Monday start)
      const dayOfWeek = now.getDay(); // 0 is Sunday
      if (dayOfWeek === 0) { // Sunday
        const preceptSundayId = `precept_sunday_${todayStr}`;
        addAutomatedNotif(preceptSundayId, "Lembrete: Preceito inicia amanhã (segunda-feira)", 'preceito');
      }

      // 3. New Week Event (Monday)
      if (dayOfWeek === 1) { // Monday
        const preceptMondayId = `precept_monday_${todayStr}`;
        if (!notifications.some(n => n.id === preceptMondayId) && !deliveredIds.includes(preceptMondayId)) {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 6);
          const weekEndStr = weekEnd.toISOString().split('T')[0];
          
          const weekEvents = allEvents.filter(event => event.date >= todayStr && event.date <= weekEndStr);
          const hasOpenRitual = weekEvents.some(e => e.category === 'Festa' || e.category === 'Gira aberta');
          
          let title = "Semana de preceito iniciada.";
          if (weekEvents.length > 0) {
            title += ` Teremos ${weekEvents.length} evento(s) nesta semana, incluindo: ${weekEvents[0].title}.`;
            if (hasOpenRitual) {
              title += " Há gira aberta ou festa programada!";
            }
          } else {
            title += " Não há festas ou giras abertas programadas para esta semana.";
          }

          addAutomatedNotif(preceptMondayId, title, 'preceito');
        }
      }

      // 4. Ogã Payment Reminder (on days with Gira de atendimento or Gira interna)
      const ogaEvents = allEvents.filter(e => 
        e.date === todayStr && 
        (e.category === 'Gira de atendimento' || e.category === 'Gira interna')
      );
        
        ogaEvents.forEach(event => {
          const ogaNotifId = `oga_payment_${todayStr}_${event.title}`;
          addAutomatedNotif(ogaNotifId, `Lembrete Financeiro: Dia de girá (${event.title}). Verifique se possui os R$16 em espécie para o Ogã.`, 'preceito');
        });

      if (newNotifs.length > 0) {
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 100));
        // Cleanup old delivered IDs to keep storage small (keep last 200)
        setDeliveredIds(newDeliveredIds.slice(-200));
      }
    };

    checkAutomatedNotifications();
    const interval = setInterval(checkAutomatedNotifications, 30 * 60 * 1000); // Check every 30 mins
    return () => clearInterval(interval);
  }, [notifications.length, events.length, deliveredIds.length]); 

  const queueDelete = (action: UndoAction) => {
    // If there's an active one, confirm it immediately
    if (activeUndo) {
      finalizeDelete();
    }
    setActiveUndo(action);
  };

  const finalizeDelete = () => {
    if (!activeUndo) return;
    
    // Execute actual deletion
    activeUndo.onConfirm();

    // Add to history
    const newNotif: NotificationItem = {
      id: activeUndo.id,
      title: activeUndo.label,
      timestamp: Date.now(),
      category: 'exclusão',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50
    
    setActiveUndo(null);
  };

  const handleUndo = () => {
    if (activeUndo?.onUndo) {
      activeUndo.onUndo();
    }
    setActiveUndo(null);
  };

  // Migration logic to ensure categories and 2026 calendar are updated
  React.useEffect(() => {
    // 0. Automated deductions (Candles and Ogã)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeEvents = events.length > 0 ? events : [];
    
    // 0.1 Candle deduction logic for "Desenvolvimento" sessions
    const candleEventsToProcess = activeEvents.filter(e => {
      const isDevSession = e.category === 'Desenvolvimento' || 
                          (e.category === 'Gira aberta' && e.title.toLowerCase().includes('desenvolvimento'));
      if (!isDevSession) return false;

      const eventDate = new Date(e.date + 'T12:00:00');
      eventDate.setHours(0, 0, 0, 0);

      const hasPassed = eventDate < today;
      return hasPassed && !processedCandleEvents.includes(e.id);
    });

    if (candleEventsToProcess.length > 0) {
      setCandles(prev => prev.map(c => {
        if (c.color.toLowerCase() === 'branca' && c.type === '7 Dias') {
          return { ...c, quantity: Math.max(0, c.quantity - (candleEventsToProcess.length * 3)) };
        }
        return c;
      }));
      setProcessedCandleEvents(prev => [...prev, ...candleEventsToProcess.map(e => e.id)]);
    }

    // 0.2 Ogã deduction logic (R$16,00 per session)
    // Rule: Thursday Development followed by Saturday Gira/Festa
    const ogaEventsToProcess = activeEvents.filter(e => {
      const isDevSession = e.category === 'Desenvolvimento' || 
                          (e.category === 'Gira aberta' && e.title.toLowerCase().includes('desenvolvimento'));
      if (!isDevSession) return false;

      // Check if it's a Thursday
      const eventDate = new Date(e.date + 'T12:00:00');
      if (eventDate.getDay() !== 4) return false; // Not a Thursday

      // Check for Following Saturday Event
      const saturday = new Date(eventDate);
      saturday.setDate(eventDate.getDate() + 2);
      const satDateStr = saturday.toISOString().split('T')[0];
      const hasSaturdayEvent = activeEvents.some(se => 
        se.date === satDateStr && (
          se.category === 'Gira' || 
          se.category === 'Festa' || 
          se.category === 'Gira aberta' ||
          se.title?.toLowerCase().includes('gira aberta') ||
          se.title?.toLowerCase().includes('festa') ||
          se.title?.toLowerCase().includes('gira de')
        )
      );

      if (!hasSaturdayEvent) return false;

      eventDate.setHours(0, 0, 0, 0);
      const hasPassed = eventDate < today;
      return hasPassed && !processedOgaEvents.includes(e.id);
    });

    if (ogaEventsToProcess.length > 0) {
      setSettings(prev => ({
        ...prev,
        currentCashOnHand: Math.max(0, (prev.currentCashOnHand || 0) - (ogaEventsToProcess.length * 16)),
        lastCashUpdate: today.getTime()
      }));
      setProcessedOgaEvents(prev => [...prev, ...ogaEventsToProcess.map(e => e.id)]);
    }

    // Bicho migration: if user only has 1 bicho (the old default), update to new list
    if (bichos.length === 1 && bichos[0].name === 'Carijó' && bichos[0].purchaseCost === 65) {
      setBichos([
        { id: '1', name: 'Carijó', purchaseCost: 65, serviceCost: 150 },
        { id: '2', name: 'Galo', purchaseCost: 210, serviceCost: 200 },
        { id: '3', name: 'Preá', purchaseCost: 90, serviceCost: 250 },
        { id: '4', name: 'Angola', purchaseCost: 0, serviceCost: 300 },
        { id: '5', name: 'Cabrito', purchaseCost: 0, serviceCost: 600 },
        { id: '6', name: 'Calçado', purchaseCost: 0, serviceCost: 850 },
        { id: '7', name: 'Perua', purchaseCost: 0, serviceCost: 300 },
        { id: '8', name: 'Pombo', purchaseCost: 40, serviceCost: 50 },
        { id: '9', name: 'Codorna', purchaseCost: 0, serviceCost: 20 },
        { id: '10', name: 'Garnizé', purchaseCost: 90, serviceCost: 200 }
      ]);
    }

    // Bicho migration: update Preá cost to 90 and Garnizé service cost to 200
    if (bichos.length > 0) {
      let updated = false;
      const newBichos = bichos.map(b => {
        if (b.name === 'Preá' && (b.purchaseCost === 0 || b.purchaseCost === 250)) {
          updated = true;
          return { ...b, purchaseCost: 90 };
        }
        if (b.name === 'Garnizé' && b.serviceCost === 0) {
          updated = true;
          return { ...b, serviceCost: 200 };
        }
        return b;
      });

      if (updated) {
        setBichos(newBichos);
      }
    }

    let settingsUpdated = false;
    let categories = [...(settings.eventCategories || [])];

    // 1. Rename "Gira" to "Gira aberta" if it exists
    const giraIndex = categories.indexOf('Gira');
    if (giraIndex !== -1) {
      categories[giraIndex] = 'Gira aberta';
      settingsUpdated = true;
    }

    // 2. Add "Gira Fechada" if missing
    if (!categories.includes('Gira Fechada')) {
      categories.push('Gira Fechada');
      settingsUpdated = true;
    }

    // 3. Add "Desenvolvimento" if missing
    if (!categories.includes('Desenvolvimento')) {
      categories.push('Desenvolvimento');
      settingsUpdated = true;
    }

    // 4. Add "Corte" if missing
    if (!categories.includes('Corte')) {
      categories.push('Corte');
      settingsUpdated = true;
    }

    if (settingsUpdated) {
      setSettings({
        ...settings,
        eventCategories: categories
      });
    }

    // Ensure /finance is in secondary tabs if not present anywhere
    const allCurrentPaths = [...(settings.primaryTabPaths || DEFAULT_PRIMARY), ...(settings.secondaryTabPaths || DEFAULT_SECONDARY)];
    if (!allCurrentPaths.includes('/finance')) {
      const currentSecondary = settings.secondaryTabPaths || DEFAULT_SECONDARY;
      if (!currentSecondary.includes('/finance')) {
        setSettings({
          ...settings,
          secondaryTabPaths: [...currentSecondary, '/finance']
        });
      }
    }

    // 5. Calendar 2026 migration
    const existingDatesAndTitles = new Set(events.map(e => `${e.date}|${e.title}`));
    const newEvents = CALENDAR_2026.filter(e => !existingDatesAndTitles.has(`${e.date}|${e.title}`));

    if (newEvents.length > 0) {
      const eventsToAdd = newEvents.map((e, idx) => ({
        ...e,
        id: `m-2026-${Date.now()}-${idx}`
      }));
      setEvents([...events, ...eventsToAdd]);
    }

    // 5. Correct specific dates requested by user if they were already imported
    let eventsNeedCorrection = false;
    const correctedEvents = events.map(e => {
      // Correct Omolu date
      if (e.title === 'Festa de Omolu (Baianos)' && e.date === '2026-08-14') {
        eventsNeedCorrection = true;
        return { ...e, date: '2026-08-15' };
      }
      // Correct Desenvolvimento date (only the one in August)
      if (e.title === 'Gira de desenvolvimento' && e.date === '2026-08-12') {
        eventsNeedCorrection = true;
        return { ...e, date: '2026-08-13' };
      }
      return e;
    });

    // 6. Delete "Gira de Baianos" from 2026-05-23 as requested and update generic development events
    const finalizedEvents = correctedEvents.map(e => {
      if (e.title === 'Gira de desenvolvimento' && e.category === 'Desenvolvimento') {
        const defaultMatch = CALENDAR_2026.find(d => d.date === e.date && d.category === 'Desenvolvimento');
        if (defaultMatch && defaultMatch.title !== e.title) {
          eventsNeedCorrection = true;
          return { ...e, title: defaultMatch.title, reminder: defaultMatch.reminder || e.reminder };
        }
      }
      return e;
    }).filter(e => !(e.title === 'Gira de Baianos' && e.date === '2026-05-23'));

    if (eventsNeedCorrection || finalizedEvents.length !== events.length) {
      setEvents(finalizedEvents);
    }
  }, []);

  // Apply dark mode class to body for Tailwind dark: variants
  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [settings.darkMode]);

  return (
    <UndoContext.Provider value={{ queueDelete }}>
      <AssistantProvider>
        <AssistantWrapper />
      <InitialLoader show={!isAppReady} logo={settings.logoBase64 || DEFAULT_TEMPLO_LOGO} />
      <NotificationManager />
      <div className={cn(
        "min-h-[100dvh] bg-[#050B14] flex flex-col items-center justify-center p-0 sm:p-4 font-sans",
        settings.darkMode && "bg-black"
      )}>
        {/* Outer Glow Effects (Desktop/Tablet feel) */}
        <div className="fixed w-[400px] h-[400px] bg-brand-red rounded-full opacity-5 blur-[100px] top-0 left-0 pointer-events-none" />
        <div className="fixed w-[400px] h-[400px] bg-brand-copper rounded-full opacity-5 blur-[100px] bottom-0 right-0 pointer-events-none" />

        <div className={cn(
          "w-full h-full min-h-[100dvh] sm:h-[812px] sm:min-h-0 max-w-lg bg-[#F9F9F9] flex flex-col relative overflow-hidden rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border-[8px] border-brand-navy",
          settings.darkMode ? "bg-[#121212] border-black" : "bg-[#F9F9F9]"
        )}>
           {authLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <InitialLoader show={true} logo={settings.logoBase64 || DEFAULT_TEMPLO_LOGO} />
            </div>
          ) : isRecovering ? (
            <ResetPassword onSuccess={() => setIsRecovering(false)} />
          ) : (!user && !isGuest) ? (
            <AuthScreen onLogin={(guest) => { if (guest) setIsGuest(true); }} />
          ) : (user && !isProfileComplete) ? (
            <CompleteProfile />
          ) : (
            <>
              {/* Top Floating Buttons */}
              <GlobalSearch />
              <NotificationCenter 
                darkMode={settings.darkMode} 
                notifications={notifications} 
                setNotifications={setNotifications} 
              />

              <Navigation />
              
              <AnimatePresence>
                {activeUndo && (
                  <UndoToast 
                    key={activeUndo.id}
                    action={activeUndo} 
                    onUndo={handleUndo} 
                    onFinish={finalizeDelete} 
                  />
                )}
              </AnimatePresence>

              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <TopHeader />
                <SocialButtons />
                <AppRoutes />
              </div>
            </>
          )}
        </div>
      </div>
      </AssistantProvider>
    </UndoContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
