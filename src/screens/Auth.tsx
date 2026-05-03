import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Leaf, Mail, Lock, User, Ghost, Loader2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { supabase } from '../lib/supabase';
import { CustomDatePicker } from '../components/CustomDatePicker';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthScreen({ onLogin }: { onLogin: (isGuest?: boolean) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState(''); // YYYY-MM-DD
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const [gender, setGender] = useState<'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer' | null>(null);
  const [settings] = useStorage<AppSettings>('templo_settings', { darkMode: false } as AppSettings);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos!");
        throw new Error("As chaves de API do Supabase não foram encontradas. Verifique suas configurações de ambiente.");
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(false);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              nickname,
              birth_date: birthDate,
              gender,
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          onLogin(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error("ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não definidos no login com Google!");
        alert("ERRO CRÍTICO: Chaves do Supabase não encontradas! O login do Google falhará.");
        throw new Error("As chaves de API do Supabase não foram encontradas. Verifique suas configurações de ambiente.");
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Fallback para variação com APP_URL definida no .env ou origem atual de janela
          redirectTo: typeof import.meta.env.APP_URL === 'string' ? import.meta.env.APP_URL : window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const leaves = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      size: 32 + Math.random() * 40, // even larger size
      duration: 15 + Math.random() * 30,
      delay: Math.random() * -20,
      opacity: 0.15 + Math.random() * 0.25,
      pathX: Math.random() * 400 - 200, 
      pathY: Math.random() * 400 - 200,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      rotate: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.5
    }));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full relative overflow-hidden w-full">
      {/* Full-screen Background with animations */}
      <div className={cn(
        "absolute inset-0 flex flex-col overflow-hidden transition-colors duration-700",
        settings.darkMode 
          ? "bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]" 
          : "bg-gradient-to-br from-brand-navy via-[#001c38] to-[#000a14]"
      )}>
        {/* Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[1px]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px'
          }}
        />

        {/* Floating leaves */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {leaves.map((leaf) => (
            <motion.div
              key={leaf.id}
              initial={{ 
                left: leaf.left,
                top: leaf.top,
                rotate: leaf.rotate,
                scale: leaf.scale,
                opacity: 0
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
              style={{ left: leaf.left, top: leaf.top }}
            >
              <Leaf 
                className="text-brand-copper/60 fill-brand-copper/10" 
                style={{ width: leaf.size, height: leaf.size }} 
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Back Button for Signup */}
      <div className="absolute top-8 left-6 z-20">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={toggleMode}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/5 active:scale-95 transition-all backdrop-blur-sm border border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center justify-center">
        {/* Form Card */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "w-full rounded-[32px] p-8 flex flex-col relative overflow-hidden",
            settings.darkMode 
              ? "bg-[#18181b]/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]" 
              : "bg-white/85 backdrop-blur-2xl border border-white shadow-2xl"
          )}
        >
          {/* Subtle decoration inside the card */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-copper/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-brand-gold/20 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login-form"
                onSubmit={handleAuth}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 relative z-10"
              >
                <div className="text-center mb-8 mt-2">
                  <h2 className={cn("text-3xl font-black tracking-tighter", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Bem-vindo
                  </h2>
                  <p className={cn("mt-2 text-[13px] font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                    Acesse o terreiro para continuar.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className={cn(
                          "w-full pl-11 pr-5 py-4 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper placeholder-opacity-50",
                          settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                        )} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Senha</label>
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
                          "w-full pl-11 pr-5 py-4 rounded-2xl border outline-none text-sm font-medium tracking-widest transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper placeholder-opacity-50",
                          settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                        )} 
                      />
                    </div>
                    <div className="flex justify-end pt-1 pr-2">
                       <button type="button" className={cn("text-[9px] font-bold uppercase tracking-widest hover:underline transition-colors", settings.darkMode ? "text-brand-gold" : "text-brand-copper")}>Esqueci minha senha</button>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-copper to-[#8b5a00] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-copper/20 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-copper/50 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar'}
                  </button>
                  
                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className={cn("h-[1px] flex-1", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>Ou</span>
                    <div className={cn("h-[1px] flex-1", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.1em] active:scale-95 transition-all outline-none border",
                      settings.darkMode ? "border-white/10 text-white hover:bg-white/5" : "border-brand-navy/10 text-brand-navy hover:bg-gray-50/50"
                    )}
                  >
                    <GoogleIcon />
                    Entrar com Google
                  </button>

                  <button 
                    onClick={() => onLogin(true)}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-all outline-none border",
                      settings.darkMode ? "border-white/10 text-brand-gold hover:bg-white/5" : "border-brand-navy/10 text-brand-navy hover:bg-gray-50/50"
                    )}
                  >
                    <Ghost className="w-4 h-4" />
                    Acessar como Guest
                  </button>

                  <div className="pt-6 pb-2 text-center">
                    <p className={cn("text-xs font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                      Ainda não possui acesso?{' '}
                      <button onClick={toggleMode} className={cn("font-bold hover:underline transition-colors", settings.darkMode ? "text-brand-gold hover:text-brand-copper" : "text-brand-copper hover:text-brand-gold")}>
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                </div>
              </motion.form>
            ) : (
               <motion.form
                key="signup-form"
                onSubmit={handleAuth}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col flex-1 relative z-10"
              >
                <div className="text-center mb-8 mt-2">
                  <h2 className={cn("text-2xl font-black tracking-tighter", settings.darkMode ? "text-white" : "text-brand-navy")}>
                    Criar Conta
                  </h2>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-hide px-1 pb-4">
                  <div className="flex gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Nome</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                        </div>
                        <input 
                          type="text" 
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Nome"
                          className={cn(
                            "w-full pl-10 pr-4 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper",
                            settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                          )} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Sobrenome</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                        </div>
                        <input 
                          type="text" 
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Sobrenome"
                          className={cn(
                            "w-full pl-10 pr-4 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper",
                            settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                          )} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Apelido (Opcional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                      </div>
                      <input 
                        type="text" 
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Como gostaria de ser chamado"
                        className={cn(
                          "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper",
                          settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                        )} 
                      />
                    </div>
                  </div>

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
                        {birthDate ? birthDate.split('-').reverse().join('/') : 'DD/MM/AAAA'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Gênero</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setGender('masculino')}
                        className={cn(
                          "flex-1 py-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-center relative overflow-hidden",
                          gender === 'masculino' 
                            ? "border-brand-copper bg-brand-copper/10 text-brand-copper" 
                            : settings.darkMode 
                              ? "border-white/5 bg-white/5 text-white hover:bg-white/10"
                              : "border-brand-navy/10 bg-white/70 text-brand-navy hover:bg-white"
                        )}
                      >
                        {gender === 'masculino' && (
                          <motion.div layoutId="gender-active" className="absolute inset-0 border-2 border-brand-copper rounded-2xl pointer-events-none" />
                        )}
                        Masculino
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('feminino')}
                        className={cn(
                          "flex-1 py-3.5 rounded-2xl border text-sm font-medium transition-all flex items-center justify-center relative overflow-hidden",
                          gender === 'feminino' 
                            ? "border-brand-copper bg-brand-copper/10 text-brand-copper" 
                            : settings.darkMode 
                              ? "border-white/5 bg-white/5 text-white hover:bg-white/10"
                              : "border-brand-navy/10 bg-white/70 text-brand-navy hover:bg-white"
                        )}
                      >
                        {gender === 'feminino' && (
                          <motion.div layoutId="gender-active" className="absolute inset-0 border-2 border-brand-copper rounded-2xl pointer-events-none" />
                        )}
                        Feminino
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={cn("h-4 w-4", settings.darkMode ? "text-gray-500" : "text-gray-400")} />
                      </div>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className={cn(
                          "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper",
                          settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                        )} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest ml-2", settings.darkMode ? "text-gray-400" : "text-gray-500")}>Senha</label>
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
                          "w-full pl-11 pr-5 py-3.5 rounded-2xl border outline-none text-sm font-medium tracking-widest transition-all focus:border-brand-copper focus:ring-1 focus:ring-brand-copper",
                          settings.darkMode ? "bg-white/5 border-white/5 text-white placeholder-gray-500 focus:bg-white/10" : "bg-white/70 border-brand-navy/10 text-brand-navy placeholder-brand-navy/40 focus:bg-white/95"
                        )} 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 pt-2">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-copper to-[#8b5a00] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand-copper/20 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-copper/50 focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cadastrar'}
                  </button>

                  <div className="flex items-center justify-center gap-4 py-1">
                    <div className={cn("h-[1px] flex-1", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", settings.darkMode ? "text-gray-500" : "text-gray-400")}>Ou</span>
                    <div className={cn("h-[1px] flex-1", settings.darkMode ? "bg-white/10" : "bg-brand-navy/10")} />
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-[0.1em] active:scale-95 transition-all outline-none border",
                      settings.darkMode ? "border-white/10 text-white hover:bg-white/5" : "border-brand-navy/10 text-brand-navy hover:bg-gray-50/50"
                    )}
                  >
                    <GoogleIcon />
                    Cadastrar com Google
                  </button>

                  <div className="text-center pt-4 pb-2">
                    <p className={cn("text-xs font-medium", settings.darkMode ? "text-gray-400" : "text-gray-500")}>
                      Já possui uma conta?{' '}
                      <button onClick={toggleMode} className={cn("font-bold hover:underline transition-colors", settings.darkMode ? "text-brand-gold hover:text-brand-copper" : "text-brand-copper hover:text-brand-gold")}>
                        Conecte-se
                      </button>
                    </p>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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
