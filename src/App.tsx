import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, Droplets, Music, FileText, Settings, Heart, Plus, Search, Share2, Youtube, Play, X, Save, Trash2, Moon, Sun, ChevronRight, Mic, Star,
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

function TopHeader() {
  const [settings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
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
          {/* Decorative rotating icons around the logo - matching the user's logo style */}
          <div className="absolute -inset-4 pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="w-full h-full relative"
            >
              {[Flame, Anchor, Shield, Star, Heart, Zap].map((Icon, i) => (
                <div 
                  key={i}
                  className="absolute"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${i * 60}deg) translateY(-85px) rotate(-${i * 60}deg)`
                  }}
                >
                  <Icon className="w-3 h-3 text-brand-copper opacity-20" />
                </div>
              ))}
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
        
        <h2 className="text-brand-copper font-serif text-[11px] uppercase tracking-[0.4em] mt-8 font-black text-center px-4">
          Guerreiros de Oya e Ogun
        </h2>
      </div>
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

    // 7. Force clear old logos to show the new official one
    const HAS_CLEARED_LOGO_KEY = 'templo_logo_cleared_v1';
    if (!localStorage.getItem(HAS_CLEARED_LOGO_KEY)) {
      const { logoBase64, ...rest } = settings;
      setSettings(rest as AppSettings);
      localStorage.setItem(HAS_CLEARED_LOGO_KEY, 'true');
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
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-48 px-4 scrollbar-hide">
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
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
