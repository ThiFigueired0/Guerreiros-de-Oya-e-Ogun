import React, { useState, useEffect } from 'react';
import { 
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, 
  Shield, Info, Book, Map, Hash, User, Users, Home, Layout, LayoutGrid,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, FileText, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  LayoutGrid, Anchor, Bell, Bird, Bomb, Bone, Bug, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, 
  Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, 
  Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from './hooks/useStorage';
import { AppSettings, Event, EventCategory } from './types';
import { cn } from './lib/utils';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Screens
import Dashboard from './screens/Dashboard';
import Events from './screens/Events';
import Members from './screens/Members';
import SettingsScreen from './screens/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    templeName: 'Guerreiros de Oya e Ogun',
    notificationsEnabled: true,
    pushNotifications: false
  });

  const [events, setEvents] = useStorage<Event[]>('templo_events', []);
  const [members, setMembers] = useStorage<any[]>('templo_members', []);

  useEffect(() => {
    // apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Handle corrections for legacy data
  useEffect(() => {
    let eventsNeedCorrection = false;
    const finalizedEvents = events.map(event => {
      // Ensure category is valid
      if (!settings.eventCategories.includes(event.category as any)) {
        eventsNeedCorrection = true;
        return { ...event, category: settings.eventCategories[0] };
      }
      return event;
    });

    if (eventsNeedCorrection || finalizedEvents.length !== events.length) {
      setEvents(finalizedEvents);
    }

    // Force clear old logos to show the new official one
    const HAS_CLEARED_LOGO_KEY = 'templo_logo_cleared_v1';
    if (!localStorage.getItem(HAS_CLEARED_LOGO_KEY)) {
      const { logoBase64, ...rest } = settings;
      setSettings(rest as AppSettings);
      localStorage.setItem(HAS_CLEARED_LOGO_KEY, 'true');
    }
  }, []);

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans transition-colors duration-300",
      settings.darkMode ? "bg-black text-white" : "bg-brand-white text-gray-900"
    )}>
      {/* Header with Circular Logo */}
      <TopHeader />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8 pt-4 px-4 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <Dashboard events={events} members={members} setEvents={setEvents} />}
            {activeTab === 'events' && <Events events={events} setEvents={setEvents} settings={settings} />}
            {activeTab === 'members' && <Members members={members} setMembers={setMembers} />}
            {activeTab === 'settings' && <SettingsScreen settings={settings} setSettings={setSettings} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around items-center h-20 px-4 transition-all duration-300 backdrop-blur-md",
        settings.darkMode 
          ? "bg-black/90 border-brand-copper/30 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]" 
          : "bg-white/90 border-gray-200 shadow-lg"
      )}>
        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<Home className="w-6 h-6" />} 
          label="Início"
          darkMode={settings.darkMode}
        />
        <NavItem 
          active={activeTab === 'events'} 
          onClick={() => setActiveTab('events')} 
          icon={<Calendar className="w-6 h-6" />} 
          label="Eventos"
          darkMode={settings.darkMode}
        />
        <NavItem 
          active={activeTab === 'members'} 
          onClick={() => setActiveTab('members')} 
          icon={<Users className="w-6 h-6" />} 
          label="Membros"
          darkMode={settings.darkMode}
        />
        <NavItem 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<Settings className="w-6 h-6" />} 
          label="Ajustes"
          darkMode={settings.darkMode}
        />
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, darkMode }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, darkMode?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center w-20 h-full transition-all duration-300",
        active ? "text-brand-copper transform scale-110" : (darkMode ? "text-gray-500" : "text-gray-400"),
        "hover:text-brand-copper/80"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-all duration-300",
        active && (darkMode ? "bg-brand-copper/10" : "bg-brand-copper/5 shadow-sm")
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] sm:text-xs font-semibold mt-1 tracking-wider uppercase",
        active ? "opacity-100" : "opacity-0"
      )}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="absolute bottom-0 w-8 h-1 bg-brand-copper rounded-t-full shadow-[0_-2px_10px_rgba(184,134,11,0.5)]"
        />
      )}
    </button>
  );
}

function NotificationBell({ settings }: { settings: AppSettings }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'Próxima Gira', text: 'Gira de esquerda amanhã às 20h.', time: '1h atrás' },
    { id: 2, title: 'Lembrete de Mensalidade', text: 'Não esqueça de regularizar sua situação.', time: '1 dia atrás' }
  ]);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "p-2 rounded-full border transition-all duration-300 relative hover:bg-white/10",
          settings.darkMode ? "border-brand-copper/30 text-brand-copper" : "border-white/30 text-white"
        )}
      >
        <Bell className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-navy animate-pulse" />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "absolute right-0 mt-4 w-72 rounded-2xl shadow-2xl z-50 p-4 border",
                settings.darkMode ? "bg-gray-900 border-brand-copper/30" : "bg-white border-gray-100"
              )}
            >
              <h4 className={cn(
                "text-sm font-bold mb-3 flex items-center gap-2",
                settings.darkMode ? "text-brand-copper" : "text-brand-navy"
              )}>
                <Bell className="w-4 h-4" /> Notificações
              </h4>
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div key={notif.id} className={cn(
                    "p-3 rounded-xl border transition-colors",
                    settings.darkMode ? "bg-black/20 border-white/5 hover:bg-white/5" : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                  )}>
                    <p className="text-xs font-bold leading-tight mb-1">{notif.title}</p>
                    <p className="text-[10px] opacity-70 leading-relaxed">{notif.text}</p>
                    <p className="text-[9px] opacity-50 mt-1 uppercase font-bold">{notif.time}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopHeader() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    templeName: 'Guerreiros de Oya e Ogun',
    notificationsEnabled: true,
    pushNotifications: false
  });

  return (
    <header className={cn(
      "bg-brand-navy border-b-4 border-brand-copper p-6 pb-4 shadow-xl flex flex-col items-center transition-colors duration-500",
      settings.darkMode ? "bg-black" : "bg-brand-navy"
    )}>
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-brand-copper font-serif text-3xl font-bold italic -mb-1 tracking-tight"
          >
            Templo de Umbanda
          </motion.h1>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-white text-md font-medium tracking-widest uppercase opacity-80 decoration-brand-copper">
              {settings.templeName}
            </span>
          </motion.div>
        </div>
        
        <NotificationBell settings={settings} />
      </div>

      {/* Center Circle with Logo */}
      <div className="relative mt-8 mb-4">
        {/* Decorative Rings */}
        <div className="absolute inset-0 -m-4 rounded-full border border-brand-copper/20 animate-spin-slow" />
        <div className="absolute inset-0 -m-2 rounded-full border border-brand-copper/40 animate-spin-slow-reverse" />
        
        <div className="relative">
          <div className="absolute -top-3 -right-3 z-10">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="bg-brand-copper p-1.5 rounded-full shadow-[0_0_15px_rgba(184,134,11,0.5)]"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div className="w-32 h-32 rounded-full border-4 border-brand-copper bg-white shadow-[0_0_30px_rgba(184,134,11,0.3)] flex items-center justify-center overflow-hidden relative">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col items-center">
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-brand-copper to-transparent mb-1" />
          <span className="text-[10px] text-white tracking-[0.3em] font-black uppercase opacity-60">Santuário de Axé</span>
        </div>
      </div>
    </header>
  );
}
