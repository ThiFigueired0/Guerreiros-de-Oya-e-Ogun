import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, LogOut, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { AppSettings } from '../types';
import { useStorage } from '../hooks/useStorage';

export default function CompleteProfile() {
  const { user, signOut } = useAuth();
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer' | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isComplete = nickname && birthDate && gender;

  const handleComplete = async () => {
    if (!user || !isComplete) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          nickname,
          birth_date: birthDate,
          gender
        }
      });

      if (error) throw error;
      
      // Force reload to trigger App.tsx update check
      window.location.reload();
    } catch (err) {
      console.error("Erro ao completar perfil:", err);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 bg-gradient-to-b",
      settings.darkMode ? "from-[#0A0A0A] to-[#121212]" : "from-gray-50 to-white"
    )}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-copper/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-copper/20">
            <Sparkles className="w-8 h-8 text-brand-copper" />
          </div>
          <h1 className={cn("text-2xl font-black uppercase tracking-tighter mb-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
            Quase lá...
          </h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Olá, {user?.user_metadata?.first_name || 'Iniciado'}. Precisamos de apenas mais alguns detalhes para personalizar sua jornada.
          </p>
        </div>

        <div className="space-y-6">
          {/* Apelido */}
          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Como quer ser chamado?</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
              </div>
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Seu Apelido"
                className={cn(
                  "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper",
                  settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                )} 
              />
            </div>
          </div>

          {/* Nascimento */}
          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Data de Nascimento</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
              </div>
              <button 
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className={cn(
                  "w-full text-left pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper",
                  settings.darkMode 
                    ? "bg-white/5 border-white/5 text-white focus:bg-white/10" 
                    : "bg-white/70 border-brand-navy/10 text-brand-navy focus:bg-white/95",
                  !birthDate && (settings.darkMode ? "text-gray-500" : "text-brand-navy/40")
                )} 
              >
                {birthDate ? birthDate.split('-').reverse().join('/') : 'Selecionar Data'}
              </button>
            </div>
          </div>

          {/* Gênero */}
          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Gênero</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'masculino', label: 'Masculino' },
                { id: 'feminino', label: 'Feminino' },
                { id: 'outro', label: 'Outro' },
                { id: 'prefiro_nao_dizer', label: 'Ocultar' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGender(item.id as any)}
                  className={cn(
                    "py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    gender === item.id 
                      ? "bg-brand-copper text-white shadow-lg shadow-brand-copper/20" 
                      : settings.darkMode ? "bg-white/5 text-gray-500 border border-white/5" : "bg-white border border-brand-navy/10 text-brand-navy/60"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComplete}
            disabled={!isComplete || loading}
            className={cn(
              "w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all mt-4",
              isComplete
                ? "bg-brand-copper text-white shadow-brand-copper/20 hover:bg-brand-gold active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <span>Concluir e Começar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-center gap-2 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair agora</span>
          </button>
        </div>
      </motion.div>

      <CustomDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={birthDate}
        onChange={setBirthDate}
        darkMode={settings.darkMode}
      />
    </div>
  );
}
