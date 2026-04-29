import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, Droplets, Music, FileText, Settings, Heart, Plus, Search, Share2, Youtube, Play, X, Save, Trash2, Moon, Sun, ChevronRight, Mic, Star, Instagram,
  Shield, Info, Book, Map, Hash, User, Users, Home, Layout, LayoutGrid,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { useStorage } from './hooks/useStorage';
import { AppSettings, Event } from './types';

const CALENDAR_2026: Omit<Event, 'id'>[] = [
  { title: 'Festa de Marias', category: 'Festa', date: '2026-01-24' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-01-29' },
  { title: 'Abertura da casa - festa de Oxossi (Caboclos)', category: 'Festa', date: '2026-01-31' },
  { title: 'Festa de Iemanjá (Marinheiro)', category: 'Festa', date: '2026-02-14' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-02-12' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-02-26' },
  { title: 'Gira de baianos', category: 'Gira aberta', date: '2026-02-28' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-03-12' },
  { title: 'Gira de Exu e Pombagira', category: 'Gira aberta', date: '2026-03-14' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-03-26' },
  { title: 'Gira de Malandros', category: 'Gira aberta', date: '2026-03-28' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-04-09' },
  { title: 'Gira de Ciganos', category: 'Gira aberta', date: '2026-04-11' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-04-23' },
  { title: 'Festa de Ogun (Baianos)', category: 'Festa', date: '2026-04-25' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-05-07' },
  { title: 'Festa preto velho', category: 'Festa', date: '2026-05-09' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-05-21' },
  { title: 'Festa cigana', category: 'Festa', date: '2026-05-23' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-06-04' },
  { title: 'Gira de Marinheiro', category: 'Gira aberta', date: '2026-06-06' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-06-18' },
  { title: 'Festa de Xangô (Caboclos)', category: 'Festa', date: '2026-06-20' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-07-09' },
  { title: 'Gira de Exu e Pombagira', category: 'Gira aberta', date: '2026-07-11' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-07-23' },
  { title: 'Festa de Nanã (Preto velho)', category: 'Festa', date: '2026-07-25' },
  { title: 'Gira de Malandros', category: 'Gira aberta', date: '2026-08-01' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-08-13' },
  { title: 'Festa de Omolu (Baianos)', category: 'Festa', date: '2026-08-15' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-08-27' },
  { title: 'Gira de Ciganos', category: 'Gira aberta', date: '2026-08-29' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-09-10' },
  { title: 'Gira de Marinheiros', category: 'Gira aberta', date: '2026-09-12' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-09-23' },
  { title: 'Gira de Exu mirim', category: 'Gira aberta', date: '2026-09-26' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-10-08' },
  { title: 'Festa de Erê', category: 'Festa', date: '2026-10-10' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-10-22' },
  { title: 'Gira de Baianos', category: 'Gira aberta', date: '2026-10-24' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-11-05' },
  { title: 'Gira de Malandros', category: 'Festa', date: '2026-11-07' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-11-19' },
  { title: 'Festa de Exu e Pombagira (no terreiro)', category: 'Festa', date: '2026-11-21' },
  { title: 'Gira de desenvolvimento', category: 'Desenvolvimento', date: '2026-12-03' },
  { title: 'Enceramento Yabas (Baianos)', category: 'Festa', date: '2026-12-05' },
];

// Screens
import CalendarScreen from './screens/Calendar';
import HerbsScreen from './screens/Herbs';
import PointsScreen from './screens/Points';
import NotesScreen from './screens/Notes';
import SettingsScreen from './screens/Settings';
import TrabalhosScreen from './screens/Trabalhos';
import HomeScreen from './screens/Home';
import StudiesScreen from './screens/Studies';
import { NotificationManager } from './components/NotificationManager';

const ALL_TABS = [
  { path: '/home', label: 'Início', defaultIcon: Star },
  { path: '/calendar', label: 'Agenda', defaultIcon: Calendar },
  { path: '/herbs', label: 'Banhos', defaultIcon: Droplets },
  { path: '/trab', label: 'Trabalhos', defaultIcon: Heart },
  { path: '/points', label: 'Pontos', defaultIcon: Music },
  { path: '/studies', label: 'Estudos', defaultIcon: GraduationCap },
  { path: '/notes', label: 'Notas', defaultIcon: FileText },
  { path: '/settings', label: 'Ajustes', defaultIcon: Settings },
];

const DEFAULT_PRIMARY = ['/home', '/calendar', '/herbs', '/trab'];
const DEFAULT_SECONDARY = ['/points', '/studies', '/notes', '/settings'];

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
  });

  const primaryPaths = settings.primaryTabPaths || DEFAULT_PRIMARY;
  const secondaryPaths = settings.secondaryTabPaths || DEFAULT_SECONDARY;

  const currentPrimaryTabs = primaryPaths.map(path => ALL_TABS.find(t => t.path === path)).filter(Boolean) as typeof ALL_TABS;
  const currentSecondaryTabs = secondaryPaths.map(path => ALL_TABS.find(t => t.path === path)).filter(Boolean) as typeof ALL_TABS;

  const activeTabInSecondary = currentSecondaryTabs.find(tab => location.pathname.startsWith(tab.path));
  
  return (
    <>
      <nav className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-20 rounded-[28px] bg-white/95 backdrop-blur-xl border border-gray-100/50 z-[100] transition-all duration-500 flex items-center shadow-2xl",
        settings.darkMode && "bg-[#1A1A1A]/95 border-gray-800 shadow-black/60"
      )}>
        <div className="flex justify-around items-center w-full px-2">
          {currentPrimaryTabs.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const iconName = settings.tabIcons?.[tab.path];
            const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : tab.defaultIcon;

            return (
              <Link
                key={tab.path}
                to={tab.path}
                onClick={() => setShowMore(false)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[64px] py-1 transition-all duration-300 relative",
                  isActive ? (settings.darkMode ? "text-brand-copper" : "text-brand-navy") : "text-gray-400"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-line"
                    className="absolute bottom-0 w-8 h-0.5 bg-brand-copper rounded-t-full"
                  />
                )}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-0.5 transition-colors",
                  isActive && (settings.darkMode ? "bg-brand-copper/20" : "bg-brand-copper/10")
                )}>
                  <IconComponent className={cn("w-6 h-6", isActive && "stroke-[2.5px] scale-110")} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-center px-1 leading-none">
                  {tab.label}
                </span>
              </Link>
            );
          })}

          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] py-1 transition-all duration-300 relative",
              (showMore || activeTabInSecondary) ? (settings.darkMode ? "text-brand-copper" : "text-brand-navy") : "text-gray-400"
            )}
          >
            {activeTabInSecondary && !showMore && (
              <motion.div 
                layoutId="active-nav-line"
                className="absolute bottom-0 w-8 h-0.5 bg-brand-copper rounded-t-full"
              />
            )}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-0.5 transition-colors",
              (showMore || activeTabInSecondary) && (settings.darkMode ? "bg-brand-copper/20" : "bg-brand-copper/10")
            )}>
              <div className="relative">
                 <LayoutGrid className={cn("w-6 h-6", (showMore || activeTabInSecondary) && "stroke-[2.5px] scale-110")} />
                 {activeTabInSecondary && !showMore && (
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-copper rounded-full shadow-sm" />
                 )}
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-center px-1 leading-none">
              Mais
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95]"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={cn(
                "fixed bottom-[130px] left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/98 backdrop-blur-xl rounded-[32px] p-6 grid grid-cols-2 gap-4 z-[100] shadow-2xl border border-gray-100",
                settings.darkMode && "bg-[#1A1A1A]/98 border-gray-800 shadow-black/80"
              )}
            >
              {currentSecondaryTabs.map((tab) => {
                const isActive = location.pathname.startsWith(tab.path);
                const iconName = settings.tabIcons?.[tab.path];
                const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : tab.defaultIcon;

                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98]",
                      isActive 
                        ? (settings.darkMode ? "bg-brand-copper/20 text-brand-copper" : "bg-brand-copper/10 text-brand-navy")
                        : (settings.darkMode ? "text-gray-400 hover:bg-white/5" : "text-gray-500 hover:bg-black/5")
                    )}
                  >
                    <IconComponent className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                    <span className="text-sm font-black uppercase tracking-tight">{tab.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function TempleLogo() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Circle Background */}
      <circle cx="100" cy="100" r="95" fill="white" />
      
      {/* Decorative Orbs around the edge - representing Orixá symbols */}
      <g opacity="0.3">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <circle 
            key={i}
            cx={100 + 80 * Math.cos((angle * Math.PI) / 180)} 
            cy={100 + 80 * Math.sin((angle * Math.PI) / 180)} 
            r="4" 
            fill="#B8860B" 
          />
        ))}
      </g>

      {/* Main Sword (Ogum) - Sharp grey sword */}
      <path 
        d="M60 170 L160 40 L175 30 L180 45 L170 155 L60 170" 
        fill="#4A4A4A" 
        stroke="#1A1A1A" 
        strokeWidth="1.5"
      />
      <path 
        d="M60 170 L170 35" 
        stroke="white" 
        strokeWidth="0.5" 
        opacity="0.3" 
      />
      {/* Handle */}
      <rect x="50" y="160" width="20" height="30" transform="rotate(-45 60 175)" fill="#1A1A1A" rx="2" />
      <path d="M45 165 Q35 175 45 185" fill="none" stroke="#CC0000" strokeWidth="4" />

      {/* Oya Figure - Silhouette with red/white details */}
      <g transform="translate(60, 80) scale(0.6)">
        {/* Sky/Wind elements around Oya */}
        <path d="M20 20 Q50 0 80 20" fill="none" stroke="#CC0000" strokeWidth="2" opacity="0.5" />
        
        {/* Oya Figure Body */}
        <circle cx="50" cy="30" r="10" fill="#1A1A1A" /> {/* Head */}
        <path d="M30 65 Q50 40 70 65 L80 120 L20 120 Z" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="1" /> {/* Dress */}
        <path d="M30 70 L70 70 L70 90 L30 90 Z" fill="#CC0000" opacity="0.8" /> {/* Red sash */}
        
        {/* Arms and smaller swords */}
        <path d="M35 50 Q20 60 25 80" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M65 50 Q80 60 75 80" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M15 75 L35 85" stroke="#4A4A4A" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Texts around or near the logo */}
      <defs>
        <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
      </defs>
      <text fill="#0A0F1F" fontSize="9" fontWeight="900" letterSpacing="1">
        <textPath xlinkHref="#circlePath" startOffset="0%">TENDA DE UMBANDA • GUERREIROS DE OYA E PAI OGUM •</textPath>
      </text>
    </svg>
  );
}

function TopHeader() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  return (
    <div className={cn(
      "relative overflow-hidden pt-12 pb-8 shadow-2xl flex flex-col items-center transition-all duration-500",
      settings.darkMode 
        ? "bg-gradient-to-b from-[#0A0A0A] to-black border-b border-white/5" 
        : "bg-gradient-to-br from-brand-navy via-[#001c38] to-[#000a14] border-b-2 border-brand-copper/30"
    )}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] blur-[1px]" />

      {/* Decorative Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Leaves across the entire banner - Higher visibility */}
        {[...Array(60)].map((_, i) => {
          const size = 10 + Math.random() * 20;
          const duration = 15 + Math.random() * 30;
          const delay = Math.random() * -20;
          const opacity = 0.15 + Math.random() * 0.25;
          const pathX = Math.random() * 200 - 100;
          const pathY = Math.random() * 150 - 75;
          
          return (
            <motion.div
              key={`leaf-fixed-${i}`}
              initial={{ 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                rotate: Math.random() * 360,
                opacity: 0,
                scale: 0.5 + Math.random() * 0.5
              }}
              animate={{ 
                x: [0, pathX, 0],
                y: [0, pathY, 0],
                rotate: [0, 180, 360],
                opacity: [0, opacity, opacity, 0]
              }}
              transition={{ 
                duration: duration, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: delay
              }}
              className="absolute z-0"
            >
              <Leaf 
                className="text-brand-copper/60 fill-brand-copper/10" 
                style={{ 
                  width: size, 
                  height: size,
                }} 
              />
            </motion.div>
          );
        })}

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
          className="flex flex-col items-center mb-8"
        >
          <h2 className="text-brand-copper font-serif text-[11px] sm:text-[13px] uppercase tracking-[0.4em] sm:tracking-[0.5em] font-black text-center px-2 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            Guerreiros de Oya e Ogun
          </h2>
          <motion.div 
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-brand-copper/40 to-transparent mt-3" 
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
            settings.darkMode && "bg-gray-950 border-brand-copper/20"
          )}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
            
            {settings.logoBase64 ? (
               <img 
                src={settings.logoBase64} 
                alt="Logo Templo" 
                className="w-full h-full object-contain filter drop-shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }
                }}
              />
            ) : (
              <TempleLogo />
            )}
            <div className="logo-fallback hidden absolute inset-0">
              <TempleLogo />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SocialButtons() {
  const location = useLocation();
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  if (location.pathname !== '/home') return null;

  return (
    <div className="w-full flex justify-center gap-3 px-8 -mt-4 relative z-30 pointer-events-none">
      <motion.a
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#B8860B] via-[#DAA520] to-[#8B6508] text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-auto"
      >
        <Instagram className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Instagram</span>
      </motion.a>
      
      <motion.a
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="#"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-br from-[#B8860B] via-[#DAA520] to-[#8B6508] text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-auto"
      >
        <Music className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">TikTok</span>
      </motion.a>
    </div>
  );
}

export default function App() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  const [events, setEvents] = useStorage<Event[]>('templo_events', []);
  const [bichos, setBichos] = useStorage<any[]>('templo_bichos', []);

  // Migration logic to ensure categories and 2026 calendar are updated
  React.useEffect(() => {
    // Bicho migration: if user only has 1 bicho (the old default), update to new list
    if (bichos.length === 1 && bichos[0].name === 'Carijó' && bichos[0].purchaseCost === 65) {
      setBichos([
        { id: '1', name: 'Carijó', purchaseCost: 65, serviceCost: 150 },
        { id: '2', name: 'Galo', purchaseCost: 210, serviceCost: 200 },
        { id: '3', name: 'Preá', purchaseCost: 0, serviceCost: 250 },
        { id: '4', name: 'Angola', purchaseCost: 0, serviceCost: 300 },
        { id: '5', name: 'Cabrito', purchaseCost: 0, serviceCost: 600 },
        { id: '6', name: 'Calçado', purchaseCost: 0, serviceCost: 850 },
        { id: '7', name: 'Perua', purchaseCost: 0, serviceCost: 300 },
        { id: '8', name: 'Pombo', purchaseCost: 40, serviceCost: 50 },
        { id: '9', name: 'Codorna', purchaseCost: 0, serviceCost: 20 },
        { id: '10', name: 'Garnizé', purchaseCost: 90, serviceCost: 0 }
      ]);
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

    // 6. Delete "Gira de Baianos" from 2026-05-23 as requested
    const finalizedEvents = correctedEvents.filter(e => !(e.title === 'Gira de Baianos' && e.date === '2026-05-23'));

    if (eventsNeedCorrection || finalizedEvents.length !== events.length) {
      setEvents(finalizedEvents);
    }
  }, []);

  return (
    <BrowserRouter>
      <NotificationManager />
      <div className={cn(
        "min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-0 sm:p-4 font-sans transition-colors duration-500",
        settings.darkMode && "bg-black"
      )}>
        {/* Outer Glow Effects (Desktop/Tablet feel) */}
        <div className="fixed w-[400px] h-[400px] bg-brand-red rounded-full opacity-5 blur-[100px] top-0 left-0 pointer-events-none" />
        <div className="fixed w-[400px] h-[400px] bg-brand-copper rounded-full opacity-5 blur-[100px] bottom-0 right-0 pointer-events-none" />

        <div className={cn(
          "w-full h-full sm:h-[812px] max-w-lg bg-[#F9F9F9] flex flex-col relative overflow-hidden rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border-[8px] border-brand-navy transition-colors duration-500",
          settings.darkMode && "bg-[#121212] border-black"
        )}>
          <Navigation />
          
    <div className="flex-1 flex flex-col h-full overflow-hidden">
            <TopHeader />
            <SocialButtons />
            
            <Routes>
              <Route path="/home" element={
                <main className="flex-1 overflow-y-auto overflow-x-hidden pt-1 pb-48 px-4 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    <HomeScreen />
                  </AnimatePresence>
                </main>
              } />
              <Route path="*" element={
                <main className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-48 px-4 scrollbar-hide">
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/calendar" element={<CalendarScreen />} />
                      <Route path="/herbs" element={<HerbsScreen />} />
                      <Route path="/trab" element={<TrabalhosScreen />} />
                      <Route path="/points" element={<PointsScreen />} />
                      <Route path="/studies" element={<StudiesScreen />} />
                      <Route path="/notes" element={<NotesScreen />} />
                      <Route path="/settings" element={<SettingsScreen />} />
                    </Routes>
                  </AnimatePresence>
                </main>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
