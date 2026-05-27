import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { AppSettings } from '../types';
import { useStorage } from '../hooks/useStorage';

export default function ResetPassword({ onSuccess }: { onSuccess: () => void }) {
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
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
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
            <Lock className="w-8 h-8 text-brand-gold" />
          </div>
          <h1 className={cn("text-2xl font-black uppercase tracking-tighter mb-2", settings.darkMode ? "text-white" : "text-brand-navy")}>
            Nova Senha
          </h1>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Digite sua nova senha de acesso abaixo.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[11px] font-bold text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Senha atualizada com sucesso!
            </div>
          )}

          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Nova Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper",
                  settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                )} 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Confirmar Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
              </div>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper",
                  settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                )} 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              "w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all mt-4",
              !loading && !success
                ? "bg-brand-copper text-white shadow-brand-copper/20 hover:bg-brand-gold active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <span>Atualizar Senha</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
