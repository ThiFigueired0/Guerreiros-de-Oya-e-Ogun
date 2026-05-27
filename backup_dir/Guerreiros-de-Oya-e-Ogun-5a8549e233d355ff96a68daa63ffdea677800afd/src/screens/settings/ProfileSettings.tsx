import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, AtSign, Loader2, Phone, Plus, Trash2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useStorage<AppSettings>('templo_settings', {} as AppSettings);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const contactPhotoRef = useRef<HTMLInputElement>(null);
  const editContactPhotoRef = useRef<HTMLInputElement>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactPhoto, setNewContactPhoto] = useState<string | undefined>(undefined);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AppSettings) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContactPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, contactId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isNew) {
          setNewContactPhoto(result);
        } else if (contactId) {
          setSettings({
            ...settings,
            usefulContacts: settings.usefulContacts?.map(c => 
              c.id === contactId ? { ...c, photo: result } : c
            )
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const addContact = () => {
    if (newContactName.trim() && newContactPhone.length >= 14) {
      const newContact = {
        id: Math.random().toString(36).substr(2, 9),
        name: newContactName.trim(),
        phone: newContactPhone,
        photo: newContactPhoto,
        isFixed: false
      };
      setSettings({
        ...settings,
        usefulContacts: [...(settings.usefulContacts || []), newContact]
      });
      setNewContactName('');
      setNewContactPhone('');
      setNewContactPhoto(undefined);
    }
  };

  const removeContact = (id: string) => {
    setSettings({
      ...settings,
      usefulContacts: settings.usefulContacts?.filter(c => c.id !== id)
    });
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

  return (
    <div className="space-y-12 pb-32">
      {/* 1. Resumo do Perfil */}
      <div className={cn(
        "p-8 rounded-[40px] flex flex-col items-center text-center gap-4 relative overflow-hidden",
        settings.darkMode ? "bg-black/40 border border-gray-800" : "bg-brand-navy shadow-xl shadow-brand-navy/20"
      )}>
        <div 
          onClick={() => profilePhotoRef.current?.click()}
          className="group w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl relative z-10 cursor-pointer overflow-hidden transition-all active:scale-95"
        >
          {settings.profilePhoto ? (
            <img src={settings.profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <input 
            type="file" 
            ref={profilePhotoRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handlePhotoUpload(e, 'profilePhoto')} 
          />
        </div>

        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black text-white tracking-tight">
            {settings.firstName ? `${settings.firstName} ${settings.lastName}` : 'Seu Perfil'}
          </h2>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">{user?.email}</p>
            {settings.profilePhoto && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSettings({ ...settings, profilePhoto: undefined });
                }}
                className="text-[8px] text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors"
              >
                Remover Foto
              </button>
            )}
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-copper/20 rounded-full blur-3xl p-10 select-none pointer-events-none" />
      </div>

      {/* 2. Informações Pessoais */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-copper" />
          <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Identidade Pessoal</h3>
        </div>
        
        <div className={cn(
          "bg-white rounded-[40px] p-8 shadow-sm border border-gray-100",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800"
        )}>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Primeiro Nome</label>
                <input 
                  type="text" 
                  value={settings.firstName || ''}
                  onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                  className={cn(
                    "w-full bg-gray-50 px-4 py-3.5 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                    settings.darkMode && "bg-black/40 border-gray-800 text-white"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Sobrenome</label>
                <input 
                  type="text" 
                  value={settings.lastName || ''}
                  onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                  className={cn(
                    "w-full bg-gray-50 px-4 py-3.5 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                    settings.darkMode && "bg-black/40 border-gray-800 text-white"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Como quer ser chamado</label>
                <input 
                  type="text" 
                  value={settings.nickname || ''}
                  onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
                  placeholder="Seu apelido"
                  className={cn(
                    "w-full bg-gray-50 px-4 py-3.5 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-brand-copper transition-all",
                    settings.darkMode && "bg-black/40 border-gray-800 text-white"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Gênero</label>
                <div className={cn(
                  "flex p-1 bg-gray-50 rounded-[22px] border border-gray-100 h-14",
                  settings.darkMode && "bg-black/40 border-gray-800"
                )}>
                  {['masculino', 'feminino'].map(g => (
                    <button
                      key={g}
                      onClick={() => setSettings({ ...settings, gender: g as any })}
                      className={cn(
                        "flex-1 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all",
                        (settings.gender === g || (!settings.gender && g === 'masculino'))
                          ? "bg-brand-copper text-white shadow-lg" 
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      {g.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={saveProfileToSupabase}
                disabled={isSavingProfile}
                className={cn(
                  "w-full py-5 rounded-[28px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.97]",
                  saveStatus === 'success' 
                    ? "bg-green-600 text-white shadow-green-600/30" : "bg-brand-copper text-white shadow-brand-copper/20 hover:bg-brand-gold disabled:opacity-50"
                )}
              >
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sincronizar Perfil</span>}
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contatos Úteis */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <h3 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contatos de Emergência/Apoio</h3>
        </div>
        
        <div className={cn(
          "bg-white rounded-[40px] p-8 shadow-sm border border-gray-100",
          settings.darkMode && "bg-[#1A1A1A] border-gray-800"
        )}>
          <div className="space-y-6">
            <div className="space-y-3">
              {settings.usefulContacts?.map((contact) => (
                <div key={contact.id} className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border",
                  settings.darkMode ? "bg-black/20 border-gray-800" : "bg-gray-50 border-gray-100"
                )}>
                  <div 
                    onClick={() => {
                      setEditingContactId(contact.id);
                      editContactPhotoRef.current?.click();
                    }}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer active:scale-95 transition-all",
                      settings.darkMode ? "bg-white/5" : "bg-white shadow-sm"
                    )}
                  >
                    {contact.photo ? (
                      <img src={contact.photo} className="w-full h-full object-cover" alt={contact.name} />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 truncate">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5", settings.darkMode ? "text-gray-400" : "text-brand-navy")}>
                      {contact.name}
                      {contact.isFixed && <span className="ml-2 text-[7px] text-brand-gold opacity-100">(FIXO)</span>}
                    </span>
                    <span className={cn("font-bold text-xs tracking-tight", settings.darkMode ? "text-white" : "text-brand-navy")}>{contact.phone}</span>
                  </div>
                  {!contact.isFixed && (
                    <button 
                      onClick={() => removeContact(contact.id)}
                      className="p-2 text-red-400 hover:text-red-500 active:scale-90 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <input 
                type="file" 
                ref={editContactPhotoRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => editingContactId && handleContactPhotoUpload(e, false, editingContactId)} 
              />
            </div>

            <div className="pt-6 border-t border-gray-50 dark:border-white/5 space-y-4">
              <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Novo Contato</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col items-center gap-2">
                  <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Foto</label>
                  <div 
                    onClick={() => contactPhotoRef.current?.click()}
                    className={cn(
                      "w-16 h-16 rounded-[20px] border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all",
                      newContactPhoto ? "border-blue-500" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/40"
                    )}
                  >
                    {newContactPhoto ? (
                      <img src={newContactPhoto} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={contactPhotoRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleContactPhotoUpload(e, true)} 
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Nome/Apelido</label>
                    <input 
                      type="text" 
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="Ex: Mãe Maria"
                      className={cn(
                        "w-full bg-gray-50 px-4 py-3.5 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-blue-500 transition-all",
                        settings.darkMode && "bg-black/40 border-gray-800 text-white"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider px-1">Telefone</label>
                    <input 
                      type="text" 
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(formatPhone(e.target.value))}
                      placeholder="(00) 90000-0000"
                      className={cn(
                        "w-full bg-gray-50 px-4 py-3.5 rounded-[20px] text-xs font-bold outline-none border border-gray-100 focus:border-blue-500 transition-all",
                        settings.darkMode && "bg-black/40 border-gray-800 text-white"
                      )}
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={addContact}
                disabled={!newContactName.trim() || newContactPhone.length < 14}
                className={cn(
                  "w-full py-4 rounded-[24px] font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                  (!newContactName.trim() || newContactPhone.length < 14)
                    ? "bg-gray-100 text-gray-400 dark:bg-white/5"
                    : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
                )}
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Contato</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
