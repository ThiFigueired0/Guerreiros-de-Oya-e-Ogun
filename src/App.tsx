import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, Droplets, Music, FileText, Settings, Heart, X, Trash2, Star,
  Shield, Info, Book, Map, Hash, User, Users, Home, Layout, LayoutGrid,
  Anchor, Bell, BellOff, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap,
  History as HistoryIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { useStorage } from './hooks/useStorage';
import { AppSettings, Event, Candle, NotificationItem } from './types';
import { UndoContext, UndoAction } from './hooks/useUndo';

// Screens
import CalendarScreen from './screens/Calendar';
import HerbsScreen from './screens/Herbs';
import PointsScreen from './screens/Points';
import NotesScreen from './screens/Notes';
import SettingsScreen from './screens/Settings';
import TrabalhosScreen from './screens/Trabalhos';
import HomeScreen from './screens/Home';
import StudiesScreen from './screens/Studies';
import FinanceiroScreen from './screens/Financeiro';
import { NotificationManager } from './components/NotificationManager';

const ICON_MAP: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

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
                onClick={() => {
                  setShowMore(false);
                }}
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
                    onClick={() => {
                      setShowMore(false);
                    }}
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

function TempleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn("w-full h-full", className)}>
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

const TopHeader = React.memo(function TopHeader() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

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
    <div className={cn(
      "relative overflow-hidden pt-20 pb-16 shadow-2xl flex flex-col items-center",
      settings.darkMode 
        ? "bg-gradient-to-b from-[#0A0A0A] to-black" 
        : "bg-gradient-to-br from-brand-navy via-[#001c38] to-[#000a14]"
    )}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] blur-[1px]" />

      {/* Decorative Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Leaves across the entire banner - Higher visibility */}
        {leaves.map((leaf) => (
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
            settings.darkMode ? "bg-gray-950 border-brand-copper/20" : "bg-white"
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
});

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
    <div className="w-full flex flex-row gap-3 px-8 -mt-6 mb-8 relative z-30 pointer-events-none">
      <motion.a
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="https://www.instagram.com/guerreirosdeoyaeogum/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex-1 p-3 rounded-[24px] bg-gradient-to-r from-brand-gold-light to-brand-gold-medium text-brand-navy shadow-xl shadow-brand-gold-medium/30 flex items-center gap-3 group transition-all overflow-hidden relative pointer-events-auto",
          settings.darkMode && "from-brand-gold-medium to-brand-gold-dark text-white shadow-black/40"
        )}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform relative z-10 shrink-0">
          {/* Placeholder for Instagram Logo */}
        </div>
        <div className="text-left relative z-10">
          <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none">Instagram</h3>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
      </motion.a>
      
      <motion.a
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        href="https://www.tiktok.com/@guerreirosdeoyaeogum?lang=pt-BR"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex-1 p-3 rounded-[24px] bg-gradient-to-r from-brand-gold-light to-brand-gold-medium text-brand-navy shadow-xl shadow-brand-gold-medium/30 flex items-center gap-3 group transition-all overflow-hidden relative pointer-events-auto",
          settings.darkMode && "from-brand-gold-medium to-brand-gold-dark text-white shadow-black/40"
        )}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform relative z-10 shrink-0">
          {/* Placeholder for TikTok Logo */}
        </div>
        <div className="text-left relative z-10">
          <h3 className="text-xs sm:text-sm font-black tracking-tight leading-none">TikTok</h3>
        </div>
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
  const location = useLocation();

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

  const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
  const unreadNotifications = sortedNotifications.filter((n: NotificationItem) => !n.read);
  const readNotifications = sortedNotifications.filter((n: NotificationItem) => n.read);
  
  // Badge count: Só mostra se houver não-lidas e o painel estiver fechado
  const showBadge = !showNotifications && unreadNotifications.length > 0;
  const unreadCount = unreadNotifications.length;

  return (
    <>
      <div className="absolute top-3 right-6 z-[60]">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNotifications(true)}
          className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-brand-copper/20 cursor-pointer"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-brand-navy" strokeWidth={2.5} />
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
                    <h2 className="text-xl font-black tracking-tight">Notificações</h2>
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
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="mb-6 p-4 bg-brand-gold/5 dark:bg-white/5 rounded-[24px] border border-brand-gold/10 dark:border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4 text-brand-gold" />
                  </div>
                  <p className="text-[11px] font-medium leading-tight opacity-70">
                    Limpeza automática: as notificações expiram após 7 dias corridos.
                  </p>
                </div>

                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-40">
                    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6">
                      <BellOff className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Céu Limpo</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1">Sem notificações</p>
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
                          <button 
                            onClick={clearHistory}
                            className="flex items-center gap-2 px-3 py-1.5 text-brand-red bg-red-50 dark:bg-brand-red/10 rounded-xl hover:bg-brand-red hover:text-white transition-all active:scale-95 group border border-red-100 dark:border-brand-red/20 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Limpar</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {unreadNotifications.map((notif: NotificationItem) => (
                            <NotificationCard key={notif.id} notif={notif} darkMode={darkMode} isUnread />
                          ))}
                        </div>
                      </div>
                    )}

                    {readNotifications.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Anteriores</span>
                          {!unreadNotifications.length && (
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
                          {readNotifications.map((notif: NotificationItem) => (
                            <NotificationCard key={notif.id} notif={notif} darkMode={darkMode} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationCard({ notif, darkMode, isUnread }: { notif: NotificationItem, darkMode: boolean, isUnread?: boolean }) {
  const getStyles = () => {
    switch (notif.category) {
      case 'edição':
        return {
          bg: darkMode ? 'bg-blue-500/10' : 'bg-white',
          border: darkMode ? 'border-blue-500/20' : 'border-blue-100',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-600 dark:text-blue-400',
          dot: 'bg-blue-500'
        };
      case 'calendário':
        return {
          bg: darkMode ? 'bg-brand-gold/5' : 'bg-white',
          border: darkMode ? 'border-brand-gold/20' : 'border-amber-200',
          iconBg: 'bg-brand-gold/10',
          iconColor: 'text-brand-gold',
          dot: 'bg-brand-gold'
        };
      case 'preceito':
        return {
          bg: darkMode ? 'bg-brand-copper/5' : 'bg-white',
          border: darkMode ? 'border-brand-copper/20' : 'border-emerald-200',
          iconBg: 'bg-brand-copper/10',
          iconColor: 'text-brand-copper',
          dot: 'bg-brand-copper'
        };
      case 'exclusão':
        return {
          bg: darkMode ? 'bg-brand-red/5' : 'bg-white',
          border: darkMode ? 'border-brand-red/20' : 'border-red-200',
          iconBg: 'bg-brand-red/10',
          iconColor: 'text-brand-red',
          dot: 'bg-brand-red'
        };
      default:
        return {
          bg: darkMode ? 'bg-white/5' : 'bg-white',
          border: darkMode ? 'border-white/10' : 'border-gray-200',
          iconBg: 'bg-gray-100 dark:bg-white/10',
          iconColor: 'text-gray-500 dark:text-gray-400',
          dot: 'bg-gray-500'
        };
    }
  };

  const styles = getStyles();
  const titleColor = isUnread 
    ? (darkMode ? "text-white" : "text-slate-950") 
    : (darkMode ? "text-slate-400" : "text-slate-800");

  const getIcon = () => {
    switch (notif.category) {
      case 'edição': return <PenTool className={cn("w-5 h-5", styles.iconColor)} />;
      case 'calendário': return <Calendar className={cn("w-5 h-5", styles.iconColor)} />;
      case 'preceito': return <Shield className={cn("w-5 h-5", styles.iconColor)} />;
      default: return <HistoryIcon className={cn("w-5 h-5", styles.iconColor)} />;
    }
  };

  const getTitleText = () => {
    switch (notif.category) {
      case 'edição': return "Atualização";
      case 'calendário': return "Lembrete";
      case 'preceito': return "Aviso Importante";
      case 'exclusão': return "Item Removido";
      default: return "Notificação";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "p-4 rounded-[28px] border flex items-center gap-4 transition-all relative overflow-hidden",
        styles.bg,
        styles.border,
        isUnread && "ring-2 ring-inset " + (darkMode ? "ring-white/10" : "ring-brand-gold/10 shadow-lg shadow-brand-gold/5")
      )}
    >
      {isUnread && (
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", styles.dot)} />
      )}
      
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-transparent shadow-sm",
        styles.iconBg,
        isUnread && "animate-pulse"
      )}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn("text-[9px] uppercase font-black tracking-[0.2em]", isUnread ? styles.iconColor : (darkMode ? "text-slate-500" : "text-slate-400"))}>
            {getTitleText()}
          </p>
          {isUnread && <div className={cn("w-1.5 h-1.5 rounded-full", styles.dot)} />}
        </div>
        <p className={cn(
          "text-[13px] leading-tight transition-colors break-words font-bold",
          titleColor
        )}>
          {notif.title}
        </p>
      </div>

      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <span className={cn("text-[10px] font-bold whitespace-nowrap", darkMode ? "text-slate-500" : "text-slate-400")}>
          {new Date(notif.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </span>
        <span className={cn("text-[10px] font-black", darkMode ? "text-slate-600" : "text-slate-500")}>
          {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#001529' }}
        >
          {/* Global Animated Background */}
          <div className="absolute inset-0 pointer-events-none">
            {leaves.map((leaf) => (
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
            
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                opacity: [0.08, 0.12, 0.08],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-copper rounded-full blur-[150px]"
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
              {/* Glow */}
              <motion.div 
                animate={{ 
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-10 bg-brand-copper/40 rounded-full blur-3xl"
              />

              <div className="w-48 h-48 rounded-full border-2 border-brand-copper/30 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center p-2 overflow-hidden relative">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <TempleLogo />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10 text-center"
            >
              <h1 className="text-brand-gold font-serif text-2xl tracking-[0.5em] font-black uppercase drop-shadow-lg flex items-center gap-2">
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

export default function App() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

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
      
      // Only proceed with event reminders after 06:00 AM Brasília time
      const isAfterSixAM = brHour >= 6;
      
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
      // Only send these if it's after 06:00 AM
      if (isAfterSixAM) {
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
      }

      // 2. Precept Reminders (Sunday for Monday start)
      const dayOfWeek = now.getDay(); // 0 is Sunday
      if (dayOfWeek === 0 && isAfterSixAM) { // Sunday after 06:00
        const preceptSundayId = `precept_sunday_${todayStr}`;
        addAutomatedNotif(preceptSundayId, "Lembrete: Preceito inicia amanhã (segunda-feira)", 'preceito');
      }

      // 3. New Week Event (Monday)
      if (dayOfWeek === 1 && isAfterSixAM) { // Monday after 06:00
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
      if (isAfterSixAM) {
        const ogaEvents = allEvents.filter(e => 
          e.date === todayStr && 
          (e.category === 'Gira de atendimento' || e.category === 'Gira interna')
        );
        
        ogaEvents.forEach(event => {
          const ogaNotifId = `oga_payment_${todayStr}_${event.title}`;
          addAutomatedNotif(ogaNotifId, `Lembrete Financeiro: Dia de girá (${event.title}). Verifique se possui os R$16 em espécie para o Ogã.`, 'preceito');
        });
      }

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

    // 6. Delete "Gira de Baianos" from 2026-05-23 as requested
    const finalizedEvents = correctedEvents.filter(e => !(e.title === 'Gira de Baianos' && e.date === '2026-05-23'));

    if (eventsNeedCorrection || finalizedEvents.length !== events.length) {
      setEvents(finalizedEvents);
    }
  }, []);

  // Apply dark mode class to body for Tailwind dark: variants
  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <UndoContext.Provider value={{ queueDelete }}>
      <BrowserRouter>
      <InitialLoader show={!isAppReady} logo={settings.logoBase64} />
      <NotificationManager />
      <div className={cn(
        "min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-0 sm:p-4 font-sans",
        settings.darkMode && "bg-black"
      )}>
        {/* Outer Glow Effects (Desktop/Tablet feel) */}
        <div className="fixed w-[400px] h-[400px] bg-brand-red rounded-full opacity-5 blur-[100px] top-0 left-0 pointer-events-none" />
        <div className="fixed w-[400px] h-[400px] bg-brand-copper rounded-full opacity-5 blur-[100px] bottom-0 right-0 pointer-events-none" />

        <div className={cn(
          "w-full h-full sm:h-[812px] max-w-lg bg-[#F9F9F9] flex flex-col relative overflow-hidden rounded-none sm:rounded-[40px] shadow-2xl border-0 sm:border-[8px] border-brand-navy",
          settings.darkMode ? "bg-[#121212] border-black" : "bg-[#F9F9F9]"
        )}>
          {/* Notification Icon - Global */}
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
                      <Route path="/finance" element={<FinanceiroScreen />} />
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
  </UndoContext.Provider>
  );
}
