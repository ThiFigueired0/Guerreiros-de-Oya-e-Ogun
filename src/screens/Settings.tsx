import React, { useState } from 'react';
import { 
  ChevronRight, ShieldCheck, Layout, Calendar, Settings, Lock, 
  AlertTriangle, LogOut, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

// Modular Sub-screens
import ProfileSettings from './settings/ProfileSettings';
import InterfaceSettings from './settings/InterfaceSettings';
import EventSettings from './settings/EventSettings';
import PreferenceSettings from './settings/PreferenceSettings';
import SecuritySettings from './settings/SecuritySettings';

const SETTINGS_CATEGORIES = [
  { id: 'profile', label: 'Perfil & Identidade', sub: 'Foto, nome e contatos', icon: ShieldCheck, color: 'text-brand-copper bg-brand-copper/10' },
  { id: 'menu', label: 'Menu & Interface', sub: 'Abas, ícones e logos', icon: Layout, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'events', label: 'Agenda & Eventos', sub: 'Categorias e nomes padrão', icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'preferences', label: 'Preferências', sub: 'Modo escuro e cores', icon: Settings, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'security', label: 'Segurança', sub: 'Senha e exclusão de conta', icon: Lock, color: 'text-orange-500 bg-orange-500/10' },
];

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [settings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);
  const [, setIsAuthenticated] = useStorage<boolean>('templo_auth', false);
  const [, setIsGuest] = useStorage<boolean>('templo_guest', false);
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handlePanic = () => {
    window.open('https://aistudio.google.com/', '_blank');
  };

  const renderSubScreen = () => {
    switch (activeSubScreen) {
      case 'profile': return <ProfileSettings />;
      case 'menu': return <InterfaceSettings />;
      case 'events': return <EventSettings />;
      case 'preferences': return <PreferenceSettings />;
      case 'security': return <SecuritySettings />;
      default: return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-4 bg-transparent min-h-[calc(100dvh-180px)] transition-colors duration-500"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-2 pt-2">
        <h2 className={cn("text-3xl font-black text-brand-navy tracking-tighter", settings.darkMode && "text-white")}>Ajustes</h2>
        <div className="w-10 h-10 rounded-2xl bg-brand-copper/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-brand-copper" />
        </div>
      </div>

      <div className="grid gap-4">
        {SETTINGS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveSubScreen(cat.id)}
            className={cn(
              "w-full p-6 rounded-[32px] flex items-center justify-between border transition-all active:scale-[0.97] group border-transparent",
              settings.darkMode ? "bg-[#1A1A1A] hover:bg-[#202020] shadow-xl shadow-black/20" : "bg-white hover:bg-gray-100 shadow-sm border-gray-100"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                <cat.icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className={cn("text-[13px] font-black uppercase tracking-wider text-brand-navy mb-1", settings.darkMode && "text-white")}>{cat.label}</p>
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-widest">{cat.sub}</p>
              </div>
            </div>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity", settings.darkMode ? "bg-white/10" : "bg-gray-100")}>
              <ChevronRight className="w-4 h-4 text-brand-copper" />
            </div>
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={async () => {
            if (showLogoutConfirm) {
              try {
                await signOut();
                setIsAuthenticated(false);
                setIsGuest(false);
              } catch (err) {
                console.error("Erro ao sair:", err);
                setIsAuthenticated(false);
                setIsGuest(false);
              }
            } else {
              setShowLogoutConfirm(true);
              setTimeout(() => setShowLogoutConfirm(false), 3000);
            }
          }}
          className={cn(
            "w-full p-6 rounded-[32px] flex items-center justify-between border transition-all active:scale-[0.97] group mt-2",
            settings.darkMode ? "bg-red-900/10 border-red-900/20 hover:bg-red-900/20" : "bg-white border-red-100 hover:bg-red-50 shadow-sm",
            showLogoutConfirm && "ring-2 ring-red-500 bg-red-50 dark:bg-red-900/30"
          )}
        >
          <div className="flex items-center gap-5">
            <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110 text-red-500 bg-red-100 dark:bg-red-500/20")}>
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className={cn("text-[13px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 mb-1")}>
                {showLogoutConfirm ? "Confirmar Saída" : "Sair"}
              </p>
              <p className="text-[10px] font-bold text-red-500/80 dark:text-red-400/80 uppercase tracking-widest leading-none">
                {showLogoutConfirm ? "Toque novamente para sair" : "Encerrar sessão"}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500 opacity-30" />
        </button>

        {/* Panic Button at Base */}
        <div className="pt-6 mt-4 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={handlePanic}
            className={cn(
              "w-full p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 border border-red-100/50 dark:border-red-900/10 transition-all active:scale-[0.95] group",
              settings.darkMode ? "bg-red-900/10 hover:bg-red-900/20" : "bg-red-50 hover:bg-red-100/30"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] flex items-center justify-center text-white relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
              <AlertTriangle className="w-8 h-8 relative z-10" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase text-red-600 dark:text-red-400 tracking-[0.2em] mb-1">Botão de Pânico</p>
              <p className="text-[9px] font-bold text-red-500/60 dark:text-red-400/50 uppercase tracking-widest leading-relaxed">
                Acesso Fundamental ao AI Studio
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Categories Footnote */}
      <div className="mt-12 text-center pb-20">
        <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.4em]">Guerreiros de Oya e Ogum</p>
      </div>

      {/* Sub-screen Overlay */}
      <AnimatePresence>
        {activeSubScreen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed inset-0 z-[200] flex flex-col",
              "bg-transparent"
            )}
          >
            <div className="p-4 flex items-center justify-between border-b dark:border-white/5">
              <button 
                onClick={() => setActiveSubScreen(null)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all active:scale-95",
                  settings.darkMode ? "bg-white/5 text-white" : "bg-white text-brand-navy shadow-sm"
                )}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
              </button>
              <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] opacity-40", settings.darkMode ? "text-white" : "text-brand-navy")}>
                {SETTINGS_CATEGORIES.find(c => c.id === activeSubScreen)?.label}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-8 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                {renderSubScreen()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
