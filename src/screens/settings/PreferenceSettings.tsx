import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Leaf, Palette, Bell, Smartphone } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';

export default function PreferenceSettings() {
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);

  const toggleImmersiveMode = () => setSettings({ ...settings, immersiveMode: !settings.immersiveMode });
  const toggleNotifications = () => setSettings({ ...settings, pushNotifications: !settings.pushNotifications });

  return (
    <div className="space-y-6">
      <section className={cn(
        "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
        settings.darkMode && "bg-[#1A1A1A] border-gray-800"
      )}>
        <h3 className="text-[10px] font-black text-brand-copper uppercase mb-8 tracking-[0.2em] flex items-center gap-2">
          <Smartphone className="w-3 h-3" /> Sistema & Visual
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Modo Imersivo</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Animações de Folhas</p>
              </div>
            </div>
            <button 
              onClick={toggleImmersiveMode}
              className={cn(
                "w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner",
                settings.immersiveMode ? "bg-brand-copper" : "bg-gray-300"
              )}
            >
              <motion.div 
                animate={{ x: settings.immersiveMode ? 28 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-lg" 
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Cor Principal</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Tom do Templo</p>
              </div>
            </div>
            <div className="flex gap-2">
              {['#B8860B', '#8B4513', '#1A1A1A', '#CC0000'].map(color => (
                <button
                  key={color}
                  onClick={() => setSettings({ ...settings, primaryColor: color })}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    settings.primaryColor === color ? "border-brand-navy scale-110 shadow-md" : "border-transparent opacity-60"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Notificações</p>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase tracking-widest">Alertas de Eventos</p>
              </div>
            </div>
            <button 
              onClick={toggleNotifications}
              className={cn(
                "w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner",
                settings.pushNotifications ? "bg-brand-navy" : "bg-gray-300"
              )}
            >
              <motion.div 
                animate={{ x: settings.pushNotifications ? 28 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-lg" 
              />
            </button>
          </div>

          {settings.pushNotifications && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] px-1">Lembrete Prévio</span>
                <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden">
                  {[
                    { val: 1, label: '1H' },
                    { val: 2, label: '2H' },
                    { val: 4, label: '4H' },
                    { val: 24, label: '1 Dia' }
                  ].map((opt) => {
                    const isActive = settings.reminderHours === opt.val;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => setSettings({ ...settings, reminderHours: opt.val })}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all relative z-10",
                          isActive ? "text-white" : "text-brand-navy/60 dark:text-gray-400 hover:text-brand-navy dark:hover:text-white"
                        )}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-pill"
                            className="absolute inset-0 bg-brand-copper rounded-xl shadow-lg -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-400 tracking-[0.2em] px-1">Horário de Silêncio</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 group relative">
                    <input 
                      type="time" 
                      value={settings.silentHoursStart || "22:00"}
                      onChange={(e) => setSettings({ ...settings, silentHoursStart: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="bg-white dark:bg-gray-900 rounded-3xl py-4 flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-800 shadow-sm group-hover:border-brand-copper/30 transition-all">
                      <span className="text-[8px] font-black text-brand-navy/40 dark:text-gray-500 uppercase tracking-widest">Início</span>
                      <div className="flex items-center gap-2">
                        <Moon className="w-3 h-3 text-brand-navy opacity-50" />
                        <span className="text-sm font-black text-brand-navy dark:text-white font-mono">
                          {settings.silentHoursStart || "22:00"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-4 h-px bg-gray-200 dark:bg-gray-800" />
                  
                  <div className="flex-1 group relative">
                    <input 
                      type="time" 
                      value={settings.silentHoursEnd || "08:00"}
                      onChange={(e) => setSettings({ ...settings, silentHoursEnd: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="bg-white dark:bg-gray-900 rounded-3xl py-4 flex flex-col items-center justify-center gap-1 border border-gray-100 dark:border-gray-800 shadow-sm group-hover:border-brand-gold/30 transition-all">
                      <span className="text-[8px] font-black text-brand-navy/40 dark:text-gray-500 uppercase tracking-widest">Fim</span>
                      <div className="flex items-center gap-2">
                        <Sun className="w-3 h-3 text-brand-gold opacity-50" />
                        <span className="text-sm font-black text-brand-navy dark:text-white font-mono">
                          {settings.silentHoursEnd || "08:00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
