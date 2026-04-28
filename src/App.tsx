import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, Droplets, Music, FileText, Settings, Heart, Plus, Search, Share2, Youtube, Play, X, Save, Trash2, Moon, Sun, ChevronRight, Mic, Star,
  Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { useStorage } from './hooks/useStorage';
import { AppSettings } from './types';

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

const TABS = [
  { path: '/home', label: 'Início', defaultIcon: Star },
  { path: '/calendar', label: 'Agenda', defaultIcon: Calendar },
  { path: '/herbs', label: 'Banhos', defaultIcon: Droplets },
  { path: '/trab', label: 'Trabalhos', defaultIcon: Heart },
  { path: '/points', label: 'Pontos', defaultIcon: Music },
  { path: '/studies', label: 'Estudos', defaultIcon: GraduationCap },
  { path: '/settings', label: 'Configurações', defaultIcon: Settings },
];

function BottomNavigation() {
  const location = useLocation();
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false,
    tabIcons: {}
  });
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-50 transition-colors duration-500",
      settings.darkMode && "bg-[#1A1A1A] border-gray-800"
    )}>
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const iconName = settings.tabIcons?.[tab.path];
          const IconComponent = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : tab.defaultIcon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-full transition-all duration-300",
                isActive ? (settings.darkMode ? "text-brand-copper" : "text-brand-navy") : "text-gray-400"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-colors",
                isActive && (settings.darkMode ? "bg-brand-copper/20" : "bg-brand-copper/10")
              )}>
                <IconComponent className={cn("w-5 h-5", isActive && "stroke-[2.5px] scale-110")} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function TopHeader() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

  return (
    <div className={cn(
      "bg-brand-navy border-b-4 border-brand-copper p-6 pb-4 shadow-xl flex flex-col items-center transition-colors duration-500",
      settings.darkMode && "bg-black"
    )}>
      {/* Simulation of Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-6 flex justify-between items-center px-6 opacity-40">
        <span className="text-[9px] text-white font-medium">9:41</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full border border-white/30"></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-brand-copper bg-white shadow-[0_0_30px_rgba(184,134,11,0.3)] flex items-center justify-center p-2 overflow-hidden">
            {settings.logoBase64 ? (
              <img 
                src={settings.logoBase64} 
                alt="Logo Templo" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-brand-navy font-black text-[9px] leading-tight uppercase">Guerreiros de <br/> Oya e Ogun</span>
                <div className="w-8 h-px bg-brand-red my-1 mx-auto" />
                <span className="text-[7px] text-gray-400 font-bold uppercase tracking-tighter">Personalize nas configurações</span>
              </div>
            )}
          </div>
        </div>
        
        <h2 className="text-brand-copper font-serif text-[10px] uppercase tracking-[0.4em] mt-6 font-black text-center px-4">
          Guerreiros de Oya e Ogun
        </h2>
      </div>
    </div>
  );
}

export default function App() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira', 'Festa', 'Trabalho', 'Reunião'],
    eventNames: ['Gira de Baianos', 'Festa de Cosme e Damião', 'Trabalho de Cura'],
    pushNotifications: false
  });

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
          <TopHeader />
          
          <main className="flex-1 pb-24 overflow-y-auto overflow-x-hidden pt-2">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomeScreen />} />
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

          <BottomNavigation />
        </div>
      </div>
    </BrowserRouter>
  );
}
