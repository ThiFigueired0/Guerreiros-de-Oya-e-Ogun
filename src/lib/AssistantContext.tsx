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

  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Olá! Como posso te ajudar hoje?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [assistantAvatar, setAssistantAvatar] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [locationStr, setLocationStr] = useState<string>('');

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // we send simple lat/lon to Groq directly, it's smarter this way, or we could leave it to Tavily to figure out.
            setLocationStr(`Lat: ${lat}, Lon: ${lon}`);
          } catch(e) {
            setLocationStr(`Lat: ${lat}, Lon: ${lon}`);
          }
        },
        (error) => {
          console.warn("Location permission denied", error);
          setLocationStr("São Paulo, Brasil (Aviso ao assistant: O usuário não concedeu permissão de localização. Se perguntado sobre algo local, avise educadamente: 'Estou usando São Paulo como base, já que não tenho acesso à sua localização exata, Guerreiro.')");
        }
      );
    } else {
      setLocationStr("São Paulo, Brasil (Aviso ao assistant: Geolocalização indisponível. Se perguntado, avise que está usando São Paulo.)");
    }
  }, []);
  
  const handleChatSend = async (input: string) => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    // Build summary string of project data efficiently
    let projectStateSummary = '';
    if (events?.length > 0) {
       projectStateSummary += `Agenda de Eventos (Total: ${events.length}): \n` + events.slice(-10).map(e => `- ${e.title} (${e.date})`).join('\n') + '\n\n';
    }
    if (herbs?.length > 0) {
       projectStateSummary += `Ervas em Estoque: ${herbs.length} ervas cadastradas.\n\n`;
    }
    if (pontos?.length > 0) {
       projectStateSummary += `Pontos Cantados: ${pontos.length} pontos cadastrados.\n\n`;
    }

    try {
      const response = await askAI(
         [...messages.map(m => ({ role: m.role, content: m.content })), userMsg], 
         locationStr,
         userName,
         projectStateSummary
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

  return (
    <AssistantContext.Provider value={{
      showAssistantModal, setShowAssistantModal,
      messages, setMessages,
      isChatLoading, setIsChatLoading,
      chatInput, setChatInput,
      userAvatar, setUserAvatar,
      assistantAvatar, setAssistantAvatar,
      isScrolled, setIsScrolled,
      handleChatSend, handleAvatarChange
    }}>
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) throw new Error('useAssistant must be used within AssistantProvider');
  return context;
};
