import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { AppSettings, DEFAULT_INSTAGRAM_LOGO, DEFAULT_TIKTOK_LOGO } from '../types';
import { 
  Home, Calendar, Leaf, Anchor, Music, GraduationCap, FileText, Wallet, Settings, 
  LogOut, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

// Copied ALL_TABS since we need it here
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

export function SidebarMenu({ settings, setSettings, fullName, isGuest, closeMenu }: { settings: AppSettings, setSettings: any, fullName: string, isGuest: boolean, closeMenu: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.reload();
  };

  const leaves = React.useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      size: 15 + Math.random() * 20,
      duration: 20 + Math.random() * 30,
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
      "w-[70%] sm:w-[50%] max-w-[320px] h-full flex flex-col relative overflow-hidden",
      settings.darkMode 
        ? "bg-gradient-to-b from-[#0A0A0A] to-black" 
        : "bg-gradient-to-br from-brand-navy via-[#021f08] to-[#010903]"
    )}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none" />
      
      {/* Animated Leaves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            className="absolute"
            initial={{ opacity: 0, x: leaf.left, y: leaf.top, rotate: leaf.rotate, scale: leaf.scale }}
            animate={{ 
              y: [`${leaf.top}`, `calc(${leaf.top} + ${leaf.pathY}px)`],
              x: [`${leaf.left}`, `calc(${leaf.left} + ${leaf.pathX}px)`],
              rotate: leaf.rotate + 360,
              opacity: [0, leaf.opacity, leaf.opacity, 0]
            }}
            transition={{ duration: leaf.duration, delay: leaf.delay, repeat: Infinity, ease: "linear" }}
          >
            <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="none" className="text-brand-gold drop-shadow-md">
              <path d="M12 2C7.5 2 4 5.5 4 10C4 14.5 7.5 18 12 22C16.5 18 20 14.5 20 10C20 5.5 16.5 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 2V22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="flex-1 flex flex-col pt-[max(env(safe-area-inset-top),32px)] pb-8 px-6 z-10 overflow-y-auto w-full no-scrollbar">
        {/* User Profile */}
        <div className="flex items-center gap-4 mb-8 w-full cursor-pointer" onClick={() => { navigate('/settings'); closeMenu(); }}>
          <div className="w-12 h-12 rounded-full border-2 border-brand-gold overflow-hidden bg-brand-navy/50 flex-shrink-0 flex items-center justify-center">
            {settings.profilePhoto ? (
               <img src={settings.profilePhoto} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-brand-gold text-xl font-bold bg-[#041c0c]">
                 {fullName.charAt(0).toUpperCase()}
               </div>
            )}
          </div>
          <div className="flex flex-col flex-1 truncate">
            <span className="text-white font-semibold truncate text-[15px] leading-tight">{fullName}</span>
            <span className="text-brand-gold/80 text-[11px] font-medium tracking-wide flex items-center gap-1 mt-0.5">
              Configurações <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="flex flex-col gap-1.5 w-full">
          {ALL_TABS.map((tab) => {
            const isActive = location.pathname.startsWith(tab.path);
            const Icon = tab.defaultIcon;
            return (
              <Link 
                key={tab.path} 
                to={tab.path}
                onClick={closeMenu}
                className={cn(
                  "flex items-center gap-4 px-3 py-2.5 rounded-[14px] transition-all w-full group",
                  isActive ? "bg-brand-gold/15 text-brand-gold shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                  isActive ? "bg-brand-gold/20" : "group-hover:bg-white/10"
                )}>
                  <Icon className={cn("w-4 h-4", isActive ? "text-brand-gold" : "opacity-80 group-hover:opacity-100")} />
                </div>
                <span className={cn("text-[14px] font-medium tracking-wide", isActive && "font-semibold")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Social Links inside Sidebar */}
        <div className="flex items-center justify-center gap-4 mt-8 w-full border-t border-white/5 pt-6">
           <a href="https://www.instagram.com/guerreirosdeoyaeogum/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <img src={settings.instagramLogo || DEFAULT_INSTAGRAM_LOGO} className="w-[120%] h-[120%] object-cover" alt="Instagram" />
           </a>
           <a href="https://www.tiktok.com/@guerreirosdeoyaeogum?lang=pt-BR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <img src={settings.tiktokLogo || DEFAULT_TIKTOK_LOGO} className="w-full h-full object-cover rounded-full" alt="TikTok" />
           </a>
        </div>

        <div className="mt-auto pt-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 text-red-400 hover:text-red-300 transition-colors w-full group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-medium tracking-wide">Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
