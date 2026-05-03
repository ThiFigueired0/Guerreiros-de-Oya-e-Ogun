import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export default function SecuritySettings() {
  const { user, signOut } = useAuth();
  const [settings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);
  const [, setIsAuthenticated] = useStorage<boolean>('templo_auth', false);
  const [, setIsGuest] = useStorage<boolean>('templo_guest', false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordErrorMessage('Preencha todos os campos de senha.');
      setPasswordStatus('error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMessage('As novas senhas não coincidem.');
      setPasswordStatus('error');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      setPasswordStatus('error');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus('idle');
    setPasswordErrorMessage('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordErrorMessage('Senha atual incorreta.');
        setPasswordStatus('error');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setPasswordStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      setTimeout(() => setPasswordStatus('idle'), 5000);
    } catch (err: any) {
      console.error("Erro ao alterar senha:", err);
      setPasswordErrorMessage(err.message || 'Erro ao processar alteração.');
      setPasswordStatus('error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    
    try {
      await signOut();
      setIsAuthenticated(false);
      setIsGuest(false);
      setShowDeleteAccountConfirm(false);
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      alert("Erro ao processar exclusão. Tente novamente.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <h3 className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Zona de Segurança</h3>
        </div>

        <div className={cn(
          "rounded-[40px] overflow-hidden border transition-all",
          settings.darkMode ? "bg-black/20 border-red-500/10" : "bg-red-50/20 border-red-100"
        )}>
          {/* Password Change */}
          {user?.app_metadata?.provider === 'email' && (
            <div className="p-8 border-b border-red-500/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">Alterar Credenciais</h4>
              </div>

              <div className="space-y-4">
                {passwordStatus === 'error' && <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold">{passwordErrorMessage}</div>}
                {passwordStatus === 'success' && <div className="p-3 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-bold">Senha atualizada!</div>}

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Senha Atual</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={cn("w-full bg-white px-4 py-3 rounded-xl text-xs font-bold outline-none border border-gray-100", settings.darkMode && "bg-black/40 border-gray-800 text-white")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Nova Senha</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={cn("w-full bg-white px-4 py-3 rounded-xl text-xs font-bold outline-none border border-gray-100", settings.darkMode && "bg-black/40 border-gray-800 text-white")} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Confirmar</label>
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={cn("w-full bg-white px-4 py-3 rounded-xl text-xs font-bold outline-none border border-gray-100", settings.darkMode && "bg-black/40 border-gray-800 text-white")} />
                  </div>
                </div>
                <button onClick={handleChangePassword} disabled={isUpdatingPassword} className="w-full py-4 bg-brand-copper text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold transition-all">
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirmar Troca"}
                </button>
              </div>
            </div>
          )}

          {/* Account Deletion */}
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-red-600">Excluir Conta</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Operação Irreversível</p>
              </div>
            </div>
            <button onClick={() => setShowDeleteAccountConfirm(true)} className="w-full py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all">
              Encerrar Minha Jornada
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showDeleteAccountConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-[#1A1A1A] w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase">Excluir Conta?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">Você perderá o acesso definitivo aos seus registros e configurações.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleConfirmDeleteAccount} disabled={isDeletingAccount} className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 disabled:opacity-50">
                  {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin mx-auto text-white" /> : "Confirmar Exclusão"}
                </button>
                <button onClick={() => setShowDeleteAccountConfirm(false)} className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">Voltar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
