import React, { createContext, useContext, useState, ReactNode } from 'react';
import { askAI } from '../services/aiService';
import { useAuth } from './AuthContext';
import { useStorage } from '../hooks/useStorage';
import { supabase } from './supabase';

interface AssistantContextType {
  showAssistantModal: boolean;
  setShowAssistantModal: (show: boolean) => void;
  messages: { role: 'user' | 'assistant', content: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant', content: string }[]>>;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  userAvatar: string | null;
  setUserAvatar: React.Dispatch<React.SetStateAction<string | null>>;
  assistantAvatar: string | null;
  setAssistantAvatar: React.Dispatch<React.SetStateAction<string | null>>;
  isScrolled: boolean;
  setIsScrolled: (scrolled: boolean) => void;
  handleChatSend: (input: string) => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => void;
  clearChat: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings] = useStorage<any>('templo_settings', {});
  const [dbUser, setDbUser] = useState<any>(null);
  
  // Extrai nome real do profile, se existir
  const userName = dbUser?.full_name || settings?.nickname || settings?.firstName || user?.user_metadata?.nickname || user?.user_metadata?.first_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Guerreiro';

  // Ler o estado do projeto
  const [events] = useStorage<any[]>('templo_events', []);
  const [herbs] = useStorage<any[]>('templo_herb_stock', []);
  const [pontos] = useStorage<any[]>('templo_pontos', []);
  
  React.useEffect(() => {
    async function fetchUserData() {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setDbUser(data);
          }
        } catch (e) {
          console.error("Erro ao buscar perfil:", e);
        }
      }
    }
    fetchUserData();
  }, [user]);

  const [showAssistantModal, setShowAssistantModalState] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Olá! Como posso te ajudar hoje?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [assistantAvatar, setAssistantAvatar] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationStr, setLocationStr] = useState<string>('');

  const setShowAssistantModal = (show: boolean) => {
    setShowAssistantModalState(show);
    if (show && 'geolocation' in navigator) {
      // Pedir a localização imediatamente quando abrir o modal pela primeira vez
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocationStr(`Lat: ${lat}, Lon: ${lon}`);
        },
        (error) => {
          console.warn("Location permission denied", error);
          setLocationStr("São Paulo, Brasil (Aviso ao assistant: O usuário não concedeu permissão de localização. Se perguntado sobre algo local, avise educadamente: 'Estou usando São Paulo como base, já que não tenho acesso à sua localização exata, Guerreiro.')");
        }
      );
    } else if (show && !('geolocation' in navigator)) {
      setLocationStr("São Paulo, Brasil (Aviso ao assistant: Geolocalização indisponível. Se perguntado, avise que está usando São Paulo.)");
    }
  };
  
  const handleChatSend = async (input: string) => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const fetchProjectContext = async () => {
      let supabaseData = '';
      if (user) {
        supabaseData += `Perfil do usuário no Supabase: ${JSON.stringify(dbUser || {})}\n`;
        // Tentamos buscar tabelas comuns se existirem, falhar silenciosamente se não constarem
        try {
          const { data: notes } = await supabase.from('notas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
          if (notes && notes.length > 0) {
            supabaseData += `Últimas Anotações (notas no supabase): ${JSON.stringify(notes)}\n`;
          }
        } catch (e) {
          console.error("Erro ignorado em notas", e);
        }

        try {
          const { data: studies } = await supabase.from('books').select('*').eq('user_id', user.id).limit(10);
          if (studies && studies.length > 0) {
            supabaseData += `Progresso de Estudos (books no supabase): ${JSON.stringify(studies)}\n`;
          }
        } catch(e) {
          console.error("Erro ignorado em books", e);
        }
      }

      let localData = '=== DADOS LOCAIS DO PROJETO ===\n';
      const prefix = user ? `templo_${user.id}_` : `templo_guest_`;
      
      const ALL_KEYS = [
        'templo_events', 'templo_baths', 'templo_pontos', 'templo_folders',
        'templo_notes', 'templo_herb_stock', 'templo_bichos', 'templo_simulation_history',
        'templo_offerings', 'templo_candles', 'templo_study_docs', 'templo_glossary',
        'templo_greetings', 'templo_finance', 'templo_history', 'templo_settings',
        'templo_books'
      ];

      for (const key of ALL_KEYS) {
        try {
          const val = window.localStorage.getItem(user ? `templo_${user.id}_${key}` : `templo_guest_${key}`) || window.localStorage.getItem(key);
          if (val) {
             const parsed = JSON.parse(val);
             // Truncate to avoid exploding context limits
             let strVal = JSON.stringify(parsed);
             if (strVal.length > 500) {
                strVal = strVal.substring(0, 500) + '... (truncado)';
             }
             if (Array.isArray(parsed)) {
                localData += `[${key}] (Total: ${parsed.length} itens): ${strVal}\n\n`;
             } else {
                localData += `[${key}]: ${strVal}\n\n`;
             }
          }
        } catch(e) {
          console.error("Erro ignorado ao ler chave " + key, e);
        }
      }

      return `[Dados Consolidados do Supabase]\n${supabaseData || 'Sem dados remotos identificados para essa sessão.'}\n\n[Dados Armazenados Localmente e Sincronizados]\n${localData}`;
    };

    const projectStateSummary = await fetchProjectContext();

    try {
      const response = await askAI(
         [...messages.map(m => ({ role: m.role, content: m.content })), userMsg], 
         locationStr,
         userName,
         projectStateSummary,
         window.location.pathname,
         user?.user_metadata
      );
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, não consegui processar sua mensagem.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(URL.createObjectURL(e.target.files[0]));
    }
  };

  const clearChat = () => setMessages([{ role: 'assistant', content: 'Olá! Como posso te ajudar hoje?' }]);

  return (
    <AssistantContext.Provider value={{
      showAssistantModal, setShowAssistantModal,
      messages, setMessages,
      isChatLoading, setIsChatLoading,
      chatInput, setChatInput,
      userAvatar, setUserAvatar,
      assistantAvatar, setAssistantAvatar,
      isScrolled, setIsScrolled,
      handleChatSend, handleAvatarChange, clearChat
    }}>
      {children}
    </AssistantContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within AssistantProvider');
  return context;
};
