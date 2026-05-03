import React, { useState, useRef } from 'react';
import { 
  Moon, Sun, ChevronRight, Plus, Trash2, ShieldCheck, X, Image as ImageIcon, Camera, AlertTriangle,
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout, Smartphone, ArrowUp, ArrowDown, ArrowLeftRight, FileText, GripVertical,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Clock, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap, Globe, Sparkles,
  UserCircle, Fingerprint, Mail, AtSign, Cake, Dna, ChevronDown, LogOut, Loader2, Check
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useStorage } from '../hooks/useStorage';
import { AppSettings } from '../types';
import { cn } from '../lib/utils';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { CustomDatePicker } from '../components/CustomDatePicker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

const AVAILABLE_ICONS: Record<string, any> = {
  Star, Calendar, Droplets, Heart, Music, Settings, Shield, Info, Book, Map, Hash, User, Users, Home, Layout,
  Anchor, Bell, Bird, Bomb, Bone, Bug, Clock, Cloud, Coffee, Coins, Compass, Crown, Diamond, Eye, Feather, Flame, Flower2, Ghost, Gift, GlassWater, GraduationCap, Hammer, Key, Leaf, Library, Lock, Palette, PawPrint, PenTool, Rocket, Scissors, Send, Target, Ticket, TreePine, Umbrella, Wallet, Zap
};

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

const DEFAULT_PRIMARY = ['/home', '/calendar', '/herbs', '/trab'];
const DEFAULT_SECONDARY = ['/points', '/studies', '/notes', '/finance', '/settings'];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [, setIsAuthenticated] = useStorage<boolean>('templo_auth', false);
  const [, setIsGuest] = useStorage<boolean>('templo_guest', false);
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {
    darkMode: false,
    immersiveMode: true,
    reminderHours: 2,
    silentHoursStart: '22:00',
    silentHoursEnd: '08:00',
    primaryColor: '#B8860B',
    eventCategories: ['Gira aberta', 'Gira Fechada', 'Desenvolvimento', 'Festa', 'Trabalho', 'Reunião', 'Corte'],
    eventNames: ['Gira de Baianos', 'Gira de Pretos Velhos', 'Gira de Caboclos', 'Gira de Exu/Pomba Gira', 'Gira de Erês', 'Gira de Marinheiros', 'Gira de Boiadeiros', 'Gira de Ciganos'],
    pushNotifications: true,
    tabIcons: {},
    primaryTabPaths: DEFAULT_PRIMARY,
    secondaryTabPaths: DEFAULT_SECONDARY,
    caixaLogo: '',
    nubankLogo: '',
    tiktokLogo: '',
    instagramLogo: '',
    orixaPhotos: {},
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: 'masculino'
  });

  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [newCat, setNewCat] = useState('');
  const [newName, setNewName] = useState('');
  const [activeTabPicker, setActiveTabPicker] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'category' | 'name', value: string} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const caixaRef = useRef<HTMLInputElement>(null);
  const nubankRef = useRef<HTMLInputElement>(null);
  const instagramRef = useRef<HTMLInputElement>(null);
  const tiktokRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);
  const orixaRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const primaryTabs = settings.primaryTabPaths || DEFAULT_PRIMARY;
  const secondaryTabs = settings.secondaryTabPaths || DEFAULT_SECONDARY;

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return null;
    const [year, month, day] = birthDate.split('-').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const m = today.getMonth() - (month - 1);
    if (m < 0 || (m === 0 && today.getDate() < day)) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(settings.birthDate);

  const ORIXAS = [
    'Oxala', 'Iemanja', 'Ogum', 'Iansã/Oya', 'Oxossi', 'Oxum', 
    'Xangô', 'Omolu e Obaluaê', 'Nanã', 'Oxumare'
  ];

  // Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings = 'logoBase64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrixaPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, orixaName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ 
          ...settings, 
          orixaPhotos: { 
            ...(settings.orixaPhotos || {}), 
            [orixaName]: reader.result as string 
          } 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setSettings({ ...settings, logoBase64: undefined });

  const addCategory = () => {
    if (newCat.trim() && !settings.eventCategories.includes(newCat.trim())) {
      setSettings({
        ...settings,
        eventCategories: [...settings.eventCategories, newCat.trim()]
      });
      setNewCat('');
    }
  };

  const removeCategory = (cat: string) => {
    setItemToDelete({ type: 'category', value: cat });
    setShowDeleteConfirm(true);
  };

  const addNameSuggestion = () => {
    if (newName.trim() && !settings.eventNames.includes(newName.trim())) {
      setSettings({
        ...settings,
        eventNames: [...settings.eventNames, newName.trim()]
      });
      setNewName('');
    }
  };

  const removeName = (name: string) => {
    setItemToDelete({ type: 'name', value: name });
    setShowDeleteConfirm(true);
  };

  const toggleDarkMode = () => setSettings({ ...settings, darkMode: !settings.darkMode });
  const toggleImmersiveMode = () => setSettings({ ...settings, immersiveMode: !settings.immersiveMode });
  const toggleNotifications = () => setSettings({ ...settings, pushNotifications: !settings.pushNotifications });

  const moveTab = (path: string, from: 'primary' | 'secondary', to: 'primary' | 'secondary') => {
    if (path === '/settings' && to === 'primary' && from === 'secondary') return;
    
    let newPrimary = [...primaryTabs];
    let newSecondary = [...secondaryTabs];

    if (from === 'primary') {
      newPrimary = newPrimary.filter(p => p !== path);
      newSecondary = [...newSecondary, path];
    } else {
      newSecondary = newSecondary.filter(s => s !== path);
      newPrimary = [...newPrimary, path];
    }

    setSettings({
      ...settings,
      primaryTabPaths: newPrimary,
      secondaryTabPaths: newSecondary
    });
  };

  const handleIconSelect = (path: string, iconName: string) => {
    setSettings({
      ...settings,
      tabIcons: {
        ...(settings.tabIcons || {}),
        [path]: iconName
      }
    });
    setActiveTabPicker(null);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'category') {
      setSettings({
        ...settings,
        eventCategories: settings.eventCategories.filter(c => c !== itemToDelete.value)
      });
    } else {
      setSettings({
        ...settings,
        eventNames: settings.eventNames.filter(n => n !== itemToDelete.value)
      });
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const saveProfileToSupabase = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: settings.firstName,
          last_name: settings.lastName,
          nickname: settings.nickname,
          birth_date: settings.birthDate,
          gender: settings.gender,
        }
      });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      setSaveStatus('error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    
    try {
      // 1. Tentar chamar uma RPC ou deletar dados de tabelas públicas se existirem
      // Exemplo: await supabase.from('profiles').delete().eq('id', user.id);
      
      // 2. Nota: Supabase Auth requer Admin API para deletar usuário real.
      // Para apps client-side, o padrão é deslogar e limpar storage local.
      // Se houver uma Edge Function 'delete-user', poderíamos chamá-la aqui.
      
      await signOut();

      // Limpar estados locais
      setIsAuthenticated(false);
      setIsGuest(false);
      setSettings({
        ...settings,
        firstName: '',
        lastName: '',
        nickname: '',
        email: '',
      });
      
      setShowDeleteAccountConfirm(false);
      // Redirecionar será automático pelo App.tsx observando o estado de auth
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      alert("Erro ao processar exclusão. Tente novamente.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const renderSubScreen = () => {
    switch (activeSubScreen) {
      case 'profile':
        return (
          <div className="space-y-8 pb-32 overflow-y-auto max-h-[80vh] px-1 scrollbar-hide">
            {/* Header Summary */}
            <div className={cn(
              "p-8 rounded-[40px] flex flex-col items-center text-center gap-4 relative overflow-hidden",
              settings.darkMode ? "bg-black/40 border border-gray-800" : "bg-brand-navy shadow-xl shadow-brand-navy/20"
            )}>
              <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {settings.firstName ? `${settings.firstName} ${settings.lastName}` : 'Seu Perfil'}
                </h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Meus Dados & Identidade</p>
              </div>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-copper/20 rounded-full blur-3xl p-10 select-none pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl select-none pointer-events-none" />
            </div>

            {/* Informações Pessoais */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                  <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Informações Pessoais</h3>
                </div>
                <UserCircle className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div className={cn(
                "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors space-y-6",
                settings.darkMode && "bg-[#1A1A1A] border-gray-800"
              )}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Nome</label>
                    <input 
                      type="text" 
                      value={settings.firstName || ''}
                      onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                      placeholder="Nome"
                      className={cn(
                        "w-full bg-gray-50 p-4 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                        settings.darkMode && "bg-black/40 border-gray-800 text-white placeholder:text-gray-700"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Sobrenome</label>
                    <input 
                      type="text" 
                      value={settings.lastName || ''}
                      onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                      placeholder="Sobrenome"
                      className={cn(
                        "w-full bg-gray-50 p-4 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                        settings.darkMode && "bg-black/40 border-gray-800 text-white placeholder:text-gray-700"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Apelido (Opcional)</label>
                  <input 
                    type="text" 
                    value={settings.nickname || ''}
                    onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
                    placeholder="Como gostaria de ser chamado"
                    className={cn(
                      "w-full bg-gray-50 p-4 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                      settings.darkMode && "bg-black/40 border-gray-800 text-white placeholder:text-gray-700"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Nascimento</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("opacity-50", settings.darkMode ? "text-white" : "text-gray-500")}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      </div>
                      <button 
                        onClick={() => setIsDatePickerOpen(true)}
                        className={cn(
                          "w-full text-left bg-gray-50 pl-11 pr-4 py-4 rounded-[20px] text-xs font-bold outline-none border border-gray-100 transition-all cursor-pointer",
                          settings.darkMode && "bg-black/40 border-gray-800",
                          !settings.birthDate && !settings.darkMode ? "text-gray-400" : !settings.birthDate && settings.darkMode ? "text-gray-600" : settings.darkMode ? "text-white" : "text-brand-navy"
                        )}
                      >
                        {settings.birthDate ? settings.birthDate.split('-').reverse().join('/') : 'DD/MM/AAAA'}
                      </button>
                    </div>
                    {userAge !== null && (
                      <div className={cn("text-[10px] font-medium px-2 mt-1", settings.darkMode ? "text-brand-copper" : "text-brand-navy")}>
                        Idade atual: <strong>{userAge} anos</strong>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Sexo / Gênero</label>
                    <div className={cn(
                      "flex p-1 bg-gray-50 rounded-[20px] border border-gray-100 h-[52px]",
                      settings.darkMode && "bg-black/40 border-gray-800"
                    )}>
                      <button
                        onClick={() => setSettings({ ...settings, gender: 'masculino' })}
                        className={cn(
                          "flex-1 text-[8px] font-black uppercase tracking-widest rounded-[16px] transition-all relative z-10",
                          (settings.gender === 'masculino' || !settings.gender) 
                            ? "bg-brand-copper text-white shadow-md shadow-brand-copper/20" 
                            : "text-gray-400"
                        )}
                      >
                        Masc
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, gender: 'feminino' })}
                        className={cn(
                          "flex-1 text-[8px] font-black uppercase tracking-widest rounded-[16px] transition-all relative z-10",
                          settings.gender === 'feminino' 
                            ? "bg-brand-copper text-white shadow-md shadow-brand-copper/20" 
                            : "text-gray-400"
                        )}
                      >
                        Fem
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Profile Button */}
                {user && (
                  <div className="pt-2">
                    <button
                      onClick={saveProfileToSupabase}
                      disabled={isSavingProfile}
                      className={cn(
                        "w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                        saveStatus === 'success' 
                          ? "bg-green-600 text-white shadow-green-600/20" 
                          : saveStatus === 'error'
                            ? "bg-red-600 text-white shadow-red-600/20"
                            : "bg-brand-copper text-white shadow-brand-copper/20 hover:bg-brand-gold disabled:opacity-50"
                      )}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Salvando...</span>
                        </>
                      ) : saveStatus === 'success' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Salvo na Nuvem</span>
                        </>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          <span>Erro ao Salvar</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3.5 h-3.5" />
                          <span>Salvar na Conta Supabase</span>
                        </>
                      )}
                    </button>
                    <p className="text-[7px] text-center mt-3 text-gray-400 font-bold uppercase tracking-widest px-4 leading-relaxed">
                      Seus dados serão sincronizados com outros dispositivos ao fazer login
                    </p>
                  </div>
                )}

                {/* Account Deletion Section */}
                {user && (
                  <div className="pt-8 border-t border-red-500/10 mt-8">
                    <div className="bg-red-500/5 rounded-[24px] p-6 border border-red-500/10 mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Zona de Perigo</h4>
                          <p className="text-[9px] text-gray-500 font-medium">Ações irreversíveis para sua conta</p>
                        </div>
                      </div>
                      
                      <p className="text-[9px] text-gray-400 mb-6 leading-relaxed font-medium">
                        Ao excluir sua conta, todos os seus dados personalizados, preferências e registros vinculados a este e-mail serão removidos permanentemente de nossos servidores.
                      </p>

                      <button
                        onClick={() => setShowDeleteAccountConfirm(true)}
                        className="w-full py-4 rounded-[20px] bg-transparent border-2 border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Encerrar Minha Jornada</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Account Deletion Confirmation Modal */}
            <AnimatePresence>
              {showDeleteAccountConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-[#1A1A1A] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
                  >
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight">Tem certeza?</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Esta ação é <span className="text-red-600 font-bold">permanente</span>. Você perderá acesso a todos os seus dados e configurações do Terreiro.
                      </p>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleConfirmDeleteAccount}
                          disabled={isDeletingAccount}
                          className="w-full py-4 rounded-[20px] bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isDeletingAccount ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Sim, excluir permanentemente"
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowDeleteAccountConfirm(false)}
                          disabled={isDeletingAccount}
                          className="w-full py-4 rounded-[20px] bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          Cancelar e voltar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* Contato Institucional */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                  <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contato & Registros</h3>
                </div>
                <Mail className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div className={cn(
                "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors",
                settings.darkMode && "bg-[#1A1A1A] border-gray-800"
              )}>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">E-mail Institucional</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="email" 
                      value={settings.email || ''}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      className={cn(
                        "w-full bg-gray-100/50 pl-11 pr-4 py-4 rounded-[20px] text-xs font-bold outline-none border border-transparent focus:border-brand-copper transition-all",
                        settings.darkMode && "bg-black/40 border-gray-800 text-white placeholder:text-gray-700"
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Identidade do Terreiro */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                  <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Identidade Visual do Axé</h3>
                </div>
                <ShieldCheck className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div className={cn(
                "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 transition-colors space-y-8",
                settings.darkMode && "bg-[#1A1A1A] border-gray-800"
              )}>
                {/* Logo Principal */}
                <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-50 dark:border-white/5">
                  <div className={cn(
                    "w-32 h-32 rounded-full border-2 border-brand-copper/30 relative overflow-hidden bg-gray-50 flex items-center justify-center p-2 shadow-inner",
                    settings.darkMode && "bg-black/40 border-brand-copper/20"
                  )}>
                    {settings.logoBase64 ? (
                      <img src={settings.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-200" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'logoBase64')} />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[9px] bg-brand-navy text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-navy/20 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" /> Alterar Logo
                    </button>
                    {settings.logoBase64 && (
                      <button 
                        onClick={removeLogo} 
                        className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl active:scale-95 transition-all border border-red-100 dark:border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Fotos dos Orixás */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Registros Fotográficos (Orixás)</p>
                    <Sparkles className="w-3 h-3 text-brand-copper opacity-50" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {ORIXAS.map(orixa => (
                      <div key={orixa} className="flex flex-col items-center gap-2 group">
                        <div 
                          onClick={() => orixaRefs.current[orixa]?.click()}
                          className={cn(
                            "w-20 h-20 rounded-[28px] border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-black/20 cursor-pointer transition-all active:scale-90 group-hover:border-brand-copper group-hover:bg-brand-copper/5",
                            settings.orixaPhotos?.[orixa] ? "border-brand-copper/50 border-solid" : "border-gray-200 dark:border-gray-800"
                          )}
                        >
                          {settings.orixaPhotos?.[orixa] ? (
                            <img src={settings.orixaPhotos[orixa]} alt={orixa} className="w-full h-full object-cover" />
                          ) : (
                            <Fingerprint className="w-6 h-6 text-gray-200 dark:text-gray-700/50" />
                          )}
                        </div>
                        <p className="text-[7px] font-black uppercase tracking-widest text-center truncate w-full opacity-40">{orixa}</p>
                        <input 
                          type="file" 
                          ref={el => { orixaRefs.current[orixa] = el; }} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handleOrixaPhotoUpload(e, orixa)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Presença Digital & Financeiro */}
            <section className="space-y-4 pb-20">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
                  <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Conexões & Redes</h3>
                </div>
                <Globe className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <div className={cn(
                "bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 transition-colors space-y-10",
                settings.darkMode && "bg-[#1A1A1A] border-gray-800"
              )}>
                {/* Financeiro */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <Wallet className="w-3 h-3 text-brand-navy dark:text-brand-copper" />
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Interface de Pagamentos (Logos)</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => caixaRef.current?.click()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-5 rounded-[32px] border-2 border-dashed transition-all active:scale-95 group",
                        settings.caixaLogo ? "border-brand-navy/30 bg-brand-navy/5" : "border-gray-50 dark:border-gray-800/50 hover:border-brand-navy/20"
                      )}
                    >
                      <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-[20px] shadow-sm flex items-center justify-center overflow-hidden border border-gray-50 dark:border-white/5">
                        {settings.caixaLogo ? <img src={settings.caixaLogo} className="w-full h-full object-cover" /> : <Plus className="w-4 h-4 text-gray-200" />}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-navy dark:text-white opacity-60">Caixa Logo</span>
                      <input type="file" ref={caixaRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'caixaLogo')} />
                    </button>

                    <button 
                      onClick={() => nubankRef.current?.click()}
                      className={cn(
                        "flex flex-col items-center gap-4 p-5 rounded-[32px] border-2 border-dashed transition-all active:scale-95 group",
                        settings.nubankLogo ? "border-[#8A05BE]/30 bg-[#8A05BE]/5" : "border-gray-50 dark:border-gray-800/50 hover:border-[#8A05BE]/20"
                      )}
                    >
                      <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-[20px] shadow-sm flex items-center justify-center overflow-hidden border border-gray-50 dark:border-white/5">
                        {settings.nubankLogo ? <img src={settings.nubankLogo} className="w-full h-full object-cover" /> : <Plus className="w-4 h-4 text-gray-200" />}
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#8A05BE] opacity-60">Nubank Logo</span>
                      <input type="file" ref={nubankRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'nubankLogo')} />
                    </button>
                  </div>
                </div>

                {/* Social */}
                <div className="space-y-6">
                  <p className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Presença Social</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => instagramRef.current?.click()}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-[24px] border border-gray-100 transition-all active:scale-95",
                        settings.darkMode ? "bg-black/40 border-gray-800 hover:border-purple-500/30" : "bg-white hover:border-purple-500/20"
                      )}
                    >
                      <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/10">
                        <Camera className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-left leading-tight">Instagram<br/><span className="text-[7px] opacity-40 font-bold">Logo Oficial</span></span>
                      <input type="file" ref={instagramRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'instagramLogo')} />
                    </button>

                    <button 
                      onClick={() => tiktokRef.current?.click()}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-[24px] border border-gray-100 transition-all active:scale-95",
                        settings.darkMode ? "bg-black/40 border-gray-800 hover:border-white/30" : "bg-white hover:border-black/5"
                      )}
                    >
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/10">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-left leading-tight">TikTok<br/><span className="text-[7px] opacity-40 font-bold">Logo Oficial</span></span>
                      <input type="file" ref={tiktokRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'tiktokLogo')} />
                    </button>

                    <button 
                      onClick={() => whatsappRef.current?.click()}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-[24px] border border-gray-100 transition-all active:scale-95 col-span-2 sm:col-span-1",
                        settings.darkMode ? "bg-black/40 border-gray-800 hover:border-green-500/30" : "bg-white hover:border-green-500/20"
                      )}
                    >
                      <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-left leading-tight">WhatsApp<br/><span className="text-[7px] opacity-40 font-bold">Logo Oficial</span></span>
                      <input type="file" ref={whatsappRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'whatsappLogo')} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Informação Final */}
              <div className="mt-8 p-6 rounded-[32px] bg-brand-navy/5 dark:bg-white/5 border border-dashed border-brand-navy/10 dark:border-white/10">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed text-center italic">
                  "As informações aqui contidas são fundamentais para o registro histórico e burocrático do templo. Mantenha seus dados sempre atualizados."
                </p>
              </div>
            </section>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> Organização de Abas
              </h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-700 dark:text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                    <Layout className="w-3 h-3" /> Barra de Navegação (Principal)
                  </p>
                  <Reorder.Group 
                    axis="y" 
                    values={primaryTabs} 
                    onReorder={(newOrder) => {
                      if (newOrder[0] === '/home') {
                        setSettings({...settings, primaryTabPaths: newOrder});
                      }
                    }} 
                    className="space-y-2"
                  >
                    {primaryTabs.map((path) => {
                      const tab = ALL_TABS.find(t => t.path === path);
                      if (!tab) return null;
                      const isHome = path === '/home';
                      return (
                        <Reorder.Item 
                          key={path} 
                          value={path} 
                          dragListener={!isHome}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-colors",
                            settings.darkMode ? "bg-black/20 border-gray-100/5" : "bg-gray-50 border-gray-100",
                            !isHome && "cursor-grab active:cursor-grabbing"
                          )}
                        >
                          {!isHome && <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />}
                          <div className="w-8 h-8 rounded-lg bg-brand-copper/10 flex items-center justify-center text-brand-copper">
                            {settings.tabIcons?.[path] && AVAILABLE_ICONS[settings.tabIcons[path]] 
                              ? React.createElement(AVAILABLE_ICONS[settings.tabIcons[path]], { className: "w-4 h-4" })
                              : <tab.defaultIcon className="w-4 h-4" />
                            }
                          </div>
                          <span className={cn("flex-1 text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>
                            {tab.label}
                            {isHome && <span className="ml-2 text-[8px] opacity-40 uppercase font-black tracking-tight">(Fixo)</span>}
                          </span>
                          {!isHome && (
                            <button 
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => moveTab(path, 'primary', 'secondary')} 
                              className="p-2 text-brand-red active:scale-90 transition-all"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          )}
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase text-gray-700 dark:text-gray-400 mb-4 tracking-widest flex items-center gap-2">
                    <Plus className="w-3 h-3" /> Menu Secundário (Mais)
                  </p>
                  <Reorder.Group 
                    axis="y" 
                    values={secondaryTabs} 
                    onReorder={(newOrder) => setSettings({...settings, secondaryTabPaths: newOrder})}
                    className="space-y-2"
                  >
                    {secondaryTabs.map((path) => {
                      const tab = ALL_TABS.find(t => t.path === path);
                      if (!tab) return null;
                      return (
                        <Reorder.Item 
                          key={path} 
                          value={path} 
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing",
                            settings.darkMode ? "bg-black/20 border-gray-100/5" : "bg-gray-50 border-gray-100"
                          )}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="w-8 h-8 rounded-lg bg-gray-200/30 flex items-center justify-center text-gray-400">
                            {settings.tabIcons?.[path] && AVAILABLE_ICONS[settings.tabIcons[path]] 
                              ? React.createElement(AVAILABLE_ICONS[settings.tabIcons[path]], { className: "w-4 h-4" })
                              : <tab.defaultIcon className="w-4 h-4" />
                            }
                          </div>
                          <span className={cn("flex-1 text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{tab.label}</span>
                          <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => moveTab(path, 'secondary', 'primary')} 
                            className="p-2 text-brand-copper active:scale-90 transition-all"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>
              </div>
            </section>

            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
              <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <Palette className="w-3 h-3" /> Customs de Ícones
              </h3>
              <div className="grid gap-4">
                {ALL_TABS.map((tab) => {
                  const currentIconName = settings.tabIcons?.[tab.path];
                  const IconComp = currentIconName ? AVAILABLE_ICONS[currentIconName] : null;

                  return (
                    <div key={tab.path} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                      <div className="flex flex-col">
                        <span className={cn("text-xs font-bold", settings.darkMode ? "text-gray-200" : "text-brand-navy")}>{tab.label}</span>
                        <span className="text-[8px] text-gray-700 dark:text-gray-400 font-black uppercase tracking-widest">Toque no ícone</span>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveTabPicker(activeTabPicker === tab.path ? null : tab.path)}
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm",
                            settings.darkMode ? "bg-black/40 text-brand-copper border border-gray-800" : "bg-white text-brand-navy border border-gray-100"
                          )}
                        >
                          {IconComp ? <IconComp className="w-6 h-6" /> : <tab.defaultIcon className="w-5 h-5 opacity-40" />}
                        </button>

                        <AnimatePresence>
                          {activeTabPicker === tab.path && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              className={cn(
                                "absolute right-0 top-14 z-50 p-4 rounded-3xl shadow-2xl border flex flex-wrap gap-2 w-64 h-64 overflow-y-auto",
                                settings.darkMode ? "bg-[#252525] border-gray-700 shadow-black" : "bg-white border-gray-100"
                              )}
                            >
                              {Object.entries(AVAILABLE_ICONS).map(([name, Comp]) => (
                                <button
                                  key={name}
                                  onClick={() => handleIconSelect(tab.path, name)}
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    settings.darkMode ? "hover:bg-black/40 text-gray-500" : "hover:bg-gray-50 text-gray-400",
                                    currentIconName === name && "text-brand-copper bg-brand-copper/10"
                                  )}
                                >
                                  <Comp className="w-5 h-5" />
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-6">
            <section className={cn(
              "bg-white rounded-[32px] p-6 shadow-sm border border-gray-100",
              settings.darkMode && "bg-[#1A1A1A] border-gray-800"
            )}>
               <h3 className="text-[10px] font-black text-brand-copper uppercase mb-6 tracking-[0.2em]">Gestão de Agenda</h3>
               <div className="space-y-6">
                  <div className={cn("pb-6 border-b border-gray-100", settings.darkMode && "border-gray-800")}>
                    <p className={cn("text-[9px] font-black text-gray-700 dark:text-gray-400 mb-4 uppercase tracking-widest")}>Categorias de Evento</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.eventCategories.map((cat, i) => (
                        <span key={`${cat}-${i}`} className={cn(
                          "bg-brand-navy/5 text-brand-navy px-3 py-2 rounded-xl text-[9px] font-bold flex items-center gap-2 uppercase tracking-widest border border-brand-navy/10",
                          settings.darkMode && "bg-white/5 text-white border-white/10"
                        )}>
                          {cat}
                          <button onClick={() => removeCategory(cat)} className="text-brand-red ml-1"><X className="w-3.5 h-3.5" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Nova Categoria..." 
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCategory()}
                        className={cn(
                          "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                          settings.darkMode && "bg-black/40 border-gray-800 text-white"
                        )}
                      />
                      <button onClick={addCategory} className="bg-brand-navy text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className={cn("text-[9px] font-black text-gray-700 dark:text-gray-400 mb-4 uppercase tracking-widest")}>Sugestões de Nomes</p>
                    <div className="grid gap-2 mb-4 h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {settings.eventNames.map((name, i) => (
                        <div key={`${name}-${i}`} className={cn(
                          "flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100",
                          settings.darkMode && "bg-black/40 border-gray-800"
                        )}>
                          <span className={cn("text-xs font-bold text-brand-navy", settings.darkMode && "text-gray-200")}>{name}</span>
                          <button onClick={() => removeName(name)}><Trash2 className="w-4 h-4 text-red-500 opacity-60 hover:opacity-100" /></button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        placeholder="Novo Nome Padrão..." 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addNameSuggestion()}
                        className={cn(
                          "flex-1 bg-gray-50 p-4 rounded-2xl text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper",
                          settings.darkMode && "bg-black/40 border-gray-800 text-white"
                        )}
                      />
                      <button onClick={addNameSuggestion} className="bg-brand-copper text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
               </div>
            </section>
          </div>
        );

      case 'preferences':
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
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-brand-navy", settings.darkMode && "text-white")}>Modo Escuro</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase tracking-widest">Interface Noturna</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={cn(
                      "w-14 h-7 rounded-full p-1 transition-colors relative shadow-inner",
                      settings.darkMode ? "bg-brand-red" : "bg-gray-300"
                    )}
                  >
                    <motion.div 
                      animate={{ x: settings.darkMode ? 28 : 0 }}
                      className="w-5 h-5 bg-white rounded-full shadow-lg" 
                    />
                  </button>
                </div>

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
                      <p className="text-[10px] text-gray-700 dark:text-gray-400 font-bold px-2 text-center leading-relaxed">
                        Toque nos cartões para ajustar o período sem notificações.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  const SETTINGS_CATEGORIES = [
    { id: 'profile', label: 'Perfil & Identidade', sub: 'Logo e Foto do Terreiro', icon: ShieldCheck, color: 'text-brand-copper bg-brand-copper/10' },
    { id: 'menu', label: 'Menu & Interface', sub: 'Ordem das abas e ícones', icon: Layout, color: 'text-blue-500 bg-blue-500/10' },
    { id: 'events', label: 'Agenda & Eventos', sub: 'Categorias e nomes padrão', icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'preferences', label: 'Preferências', sub: 'Modo escuro e avisos', icon: Settings, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  const handlePanic = () => {
    window.open('https://aistudio.google.com/', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "p-4 bg-[#F9F9F9] min-h-full transition-colors duration-500",
        settings.darkMode && "bg-[#121212]"
      )}
    >
      <div className="flex items-center justify-between mb-8 px-2 pt-2">
        <h2 className={cn("text-3xl font-black text-brand-navy tracking-tighter", settings.darkMode && "text-white")}>Ajustes</h2>
        <div className="w-10 h-10 rounded-2xl bg-brand-copper/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-brand-copper animate-spin-slow" />
        </div>
      </div>

      <div className="grid gap-4">
        {SETTINGS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveSubScreen(cat.id)}
            className={cn(
              "w-full p-6 rounded-[32px] flex items-center justify-between border transition-all active:scale-[0.97] group border-transparent",
              settings.darkMode ? "bg-[#1A1A1A] hover:bg-[#202020] shadow-xl shadow-black/20" : "bg-white hover:bg-gray-50 shadow-sm border-gray-100"
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

        {/* Logout / Exit Button */}
        <button
          onClick={async () => {
            if (showLogoutConfirm) {
              try {
                await signOut();
                setIsAuthenticated(false);
                setIsGuest(false);
                // The redirection should happen automatically via App.tsx observing 'user' state null
              } catch (err) {
                console.error("Erro ao sair:", err);
                // Se falhar o supabase, ainda assim limpamos o local
                setIsAuthenticated(false);
                setIsGuest(false);
              }
            } else {
              setShowLogoutConfirm(true);
              setTimeout(() => setShowLogoutConfirm(false), 3000);
            }
          }}
          className={cn(
            "w-full p-6 rounded-[32px] flex items-center justify-between border transition-all active:scale-[0.97] group mt-4",
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
                {showLogoutConfirm ? "Confirmar Saída" : "Sair do Aplicativo"}
              </p>
              <p className="text-[10px] font-bold text-red-500/80 dark:text-red-400/80 uppercase tracking-widest">
                {showLogoutConfirm ? "Toque novamente para sair" : "Desconectar e voltar ao login"}
              </p>
            </div>
          </div>
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity", settings.darkMode ? "bg-red-500/10" : "bg-red-100")}>
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
        </button>

        {/* Panic Button Section */}
        <div className="pt-4 mt-4 border-t border-red-100/30 dark:border-red-900/20">
          <button
            onClick={handlePanic}
            className={cn(
              "w-full p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 border border-red-100/50 dark:border-red-900/20 transition-all active:scale-[0.95] group",
              settings.darkMode ? "bg-red-900/10 hover:bg-red-900/20" : "bg-red-50 hover:bg-red-100/50"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-red-500 shadow-[0_4px_15px_rgba(239,68,68,0.4)] flex items-center justify-center text-white relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
              <AlertTriangle className="w-8 h-8 relative z-10" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase text-red-600 dark:text-red-400 tracking-[0.2em] mb-1">Botão de Pânico</p>
              <p className="text-[10px] font-bold text-red-500/60 dark:text-red-400/50 uppercase tracking-widest leading-relaxed px-4">
                Redirecionar ao AI Studio para<br />alterações fundamentais no sistema
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Categories Footnote */}
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-gray-700 dark:text-gray-400 uppercase tracking-[0.3em]">Gestão Terreiro Oya & Ogun</p>
      </div>

      <AnimatePresence>
        {activeSubScreen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col p-4",
              settings.darkMode ? "bg-[#121212]" : "bg-[#F9F9F9]"
            )}
          >
            <div className="flex items-center justify-between mb-8 px-2 pt-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveSubScreen(null)}
                  className={cn(
                    "w-12 h-12 rounded-[20px] flex items-center justify-center shadow-sm",
                    settings.darkMode ? "bg-white/5 text-gray-400" : "bg-white text-gray-400"
                  )}
                >
                  <ArrowLeftRight className="w-5 h-5 -rotate-90" />
                </button>
                <div>
                  <h3 className={cn("text-2xl font-black text-brand-navy tracking-tight", settings.darkMode && "text-white")}>
                    {SETTINGS_CATEGORIES.find(c => c.id === activeSubScreen)?.label}
                  </h3>
                  <p className="text-[10px] font-black text-brand-copper uppercase tracking-[0.2em]">Configurações Gerais</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSubScreen(null)}
                className="w-10 h-10 flex items-center justify-center text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-1">
              {renderSubScreen()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'category' ? "Excluir Categoria" : "Excluir Sugestão"}
        message={itemToDelete?.type === 'category' 
          ? "Deseja realmente excluir esta categoria de evento?" 
          : "Deseja realmente excluir esta sugestão de nome?"
        }
      />

      <CustomDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={settings.birthDate || ''}
        onChange={(date) => setSettings({ ...settings, birthDate: date })}
        darkMode={settings.darkMode}
      />
    </motion.div>
  );
}
