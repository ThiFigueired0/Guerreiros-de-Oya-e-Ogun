import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { askAI } from '../services/aiService';
import { useAuth } from './AuthContext';
import { useStorage } from '../hooks/useStorage';
import { supabase } from './supabase';

interface AssistantContextType {
  showAssistantModal: boolean;
  setShowAssistantModal: (show: boolean) => void;
  messages: { role: 'user' | 'assistant', content: string, timestamp?: number }[];
  setMessages: React.Dispatch<React.SetStateAction<{ role: 'user' | 'assistant', content: string, timestamp?: number }[]>>;
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
  isPipMode: boolean;
  setIsPipMode: (pip: boolean) => void;
  handleChatSend: (input: string) => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => void;
  clearChat: () => void;
  guestSelectedModel: string;
  setGuestSelectedModel: (model: string) => void;
  sessions: any[];
  setSessions: React.Dispatch<React.SetStateAction<any[]>>;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  createNewSession: () => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings] = useStorage<any>('templo_settings', {});
  const [dbUser, setDbUser] = useState<any>(null);
  
  const [guestSelectedModel, setGuestSelectedModel] = useState<string>('llama-3.3-70b-versatile');

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

  const [sessions, setSessions] = useStorage<any[]>('templo_chat_sessions', []);
  const [currentSessionId, setCurrentSessionId] = useStorage<string | null>('templo_current_chat_session', null);

  const [showAssistantModal, setShowAssistantModalState] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, timestamp?: number }[]>([
    { role: 'assistant', content: 'Olá! Como posso te ajudar hoje?', timestamp: Date.now() }
  ]);

  // Sincronizar mensagens com was session loaded
  React.useEffect(() => {
    if (currentSessionId && sessions.length > 0) {
      const sess = sessions.find((s: any) => s.id === currentSessionId);
      if (sess && sess.messages?.length > 0) {
        setMessages(sess.messages);
      }
    }
  }, [currentSessionId]);

  // Atualizar sessão sempre que as mensagens mudarem
  React.useEffect(() => {
    if (!currentSessionId) {
      // Se tiver mais de 1 mensagem e nao houver sessão, criar uma
      if (messages.length > 1) {
        const newSessionId = crypto.randomUUID();
        const title = messages[1].content.substring(0, 30) + "..."; // Pega o começo do prompt do user
        const newSess = { id: newSessionId, title, updatedAt: Date.now(), messages };
        setSessions(prev => [newSess, ...prev]);
        setCurrentSessionId(newSessionId);
      }
    } else {
      setSessions(prev => 
        prev.map(s => s.id === currentSessionId ? { ...s, messages, updatedAt: Date.now() } : s)
          .sort((a,b) => b.updatedAt - a.updatedAt)
      );
    }
  }, [messages]);

  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [assistantAvatar, setAssistantAvatar] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const [locationStr, setLocationStr] = useState<string>('');

  const setShowAssistantModal = (show: boolean) => {
    setShowAssistantModalState(show);
    if (show) {
      setIsPipMode(false);
    }
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
    const userMsg = { role: 'user' as const, content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const questionLower = input.toLowerCase();
    const isGeneralQuery = ['cadastrado', 'cadastrados', 'tenho', 'meus', 'minhas', 'banco de dados'].some(kw => questionLower.includes(kw));

    const needsAgenda = isGeneralQuery || ['agenda', 'evento', 'gira', 'festa', 'calendário', 'calendario', 'programação', 'programacao', 'quando', 'próximo', 'proximo', 'mês'].some(kw => questionLower.includes(kw));
    const needsHerbs = isGeneralQuery || ['erva', 'banho', 'estoque', 'folha', 'oxóssi', 'oxossi', 'defumação', 'defumacao', 'planta'].some(kw => questionLower.includes(kw));
    const needsPoints = isGeneralQuery || ['ponto', 'cantiga', 'música', 'musica', 'cantar', 'letra'].some(kw => questionLower.includes(kw));
    const needsFinance = isGeneralQuery || ['caixa', 'financeiro', 'dinheiro', 'gasto', 'receita', 'saldo', 'pagamento', 'conta'].some(kw => questionLower.includes(kw));
    const needsTrabs = isGeneralQuery || ['trabalho', 'oferenda', 'bicho', 'vela', 'firmeza', 'assentamento'].some(kw => questionLower.includes(kw));

    const fetchProjectContext = async () => {
      let supabaseData = '';
      if (user) {
        supabaseData += `Perfil: ${JSON.stringify(dbUser || {})}\n`;
        try {
          const promises = [];
          if (needsAgenda) promises.push(supabase.from('eventos').select('title, data_evento').eq('user_id', user.id).order('data_evento', { ascending: true }).limit(50));
          if (needsHerbs) {
            promises.push(supabase.from('estoques').select('name, in_stock, classification').eq('user_id', user.id).limit(100));
            promises.push(supabase.from('banhos').select('title, category, herbs').eq('user_id', user.id).limit(200));
          }
          if (needsPoints) promises.push(supabase.from('pontos').select('title, type, isFavorite').eq('user_id', user.id).limit(50));
          if (needsFinance) promises.push(supabase.from('financeiro').select('type, amount, description').eq('user_id', user.id).limit(50));
          if (needsTrabs) {
            promises.push(supabase.from('oferendas').select('title, entity').eq('user_id', user.id).limit(30));
            promises.push(supabase.from('bichos').select('name, quantity').eq('user_id', user.id).limit(30));
            promises.push(supabase.from('velas').select('color, quantity').eq('user_id', user.id).limit(30));
          }

          if (promises.length > 0) {
            const results = await Promise.all(promises);
            let idx = 0;
            if (needsAgenda && results[idx]?.data?.length) supabaseData += `Agenda: ${results[idx++].data?.map((x:any) => `${x.data_evento}: ${x.title}`).join(' | ')}\n`;
            if (needsHerbs) {
              const est = results[idx++].data;
              if (est?.length) supabaseData += `Ervas em Estoque: ${est.map((x:any) => `${x.name} (${x.in_stock ? 'Tem' : 'Falta'})`).join(', ')}\n`;
              const bn = results[idx++].data;
              if (bn?.length) supabaseData += `Banhos: ${bn.map((x:any) => `${x.title} (Cat: ${x.category}) -> Ervas: ${x.herbs?.replace(/\n/g, ', ')}`).join(' | ')}\n`;
            }
            if (needsPoints) {
              const pt = results[idx++].data;
              if (pt?.length) supabaseData += `Pontos: ${pt.map((x:any) => `${x.title}`).join(', ')}\n`;
            }
            if (needsFinance) {
              const fn = results[idx++].data;
              if (fn?.length) supabaseData += `Financeiro: ${JSON.stringify(fn)}\n`;
            }
            if (needsTrabs) {
              const of = results[idx++].data;
              if (of?.length) supabaseData += `Oferendas: ${JSON.stringify(of)}\n`;
              const bi = results[idx++].data;
              if (bi?.length) supabaseData += `Bichos: ${JSON.stringify(bi)}\n`;
              const ve = results[idx++].data;
              if (ve?.length) supabaseData += `Velas: ${JSON.stringify(ve)}\n`;
            }
          }
        } catch (e) {
          console.error("Erro ao buscar contexto", e);
        }
      }

      let localData = '';
      const ALL_KEYS = [
        'templo_events', 'templo_baths', 'templo_pontos', 'templo_folders',
        'templo_notes', 'templo_herb_stock', 'templo_bichos', 'templo_simulation_history',
        'templo_offerings', 'templo_candles', 'templo_study_docs', 'templo_glossary',
        'templo_greetings', 'templo_finance', 'templo_history', 'templo_settings',
        'templo_books'
      ];

      for (const key of ALL_KEYS) {
        if (key === 'templo_events' && !needsAgenda) continue;
        if ((key === 'templo_baths' || key === 'templo_herb_stock') && !needsHerbs) continue;
        if (key === 'templo_pontos' && !needsPoints) continue;
        if (key === 'templo_finance' && !needsFinance) continue;
        if ((key === 'templo_offerings' || key === 'templo_candles' || key === 'templo_bichos') && !needsTrabs) continue;

        try {
          const val = window.localStorage.getItem(user ? `templo_${user.id}_${key}` : `templo_guest_${key}`) || window.localStorage.getItem(key);
          if (val) {
             const parsed = JSON.parse(val);
             
             let processed = parsed;
             if (Array.isArray(parsed)) {
               if (key === 'templo_baths') {
                 processed = parsed.map((b: any) => (`${b.title} (Cat: ${b.category}) -> Ervas: ${b.herbs?.replace(/\n/g, ', ')}`)).join(' | ');
               } else if (key === 'templo_pontos') {
                 processed = parsed.map((p: any) => (`${p.title} ${p.isFavorite ? '★' : ''}`)).join(', ');
               } else if (key === 'templo_events') {
                 processed = parsed.map((e: any) => (`${e.date}: ${e.title}`)).join(' | ');
               } else if (key === 'templo_herb_stock') {
                 processed = parsed.map((h: any) => (`${h.name} (${h.inStock ? 'Tem' : 'Falta'})`)).join(', ');
               } else if (key === 'templo_finance') {
                 processed = parsed.map((f: any) => (`${f.type}: ${f.amount}`)).join(', ');
               }
             }

             let strVal = typeof processed === 'string' ? processed : JSON.stringify(processed);
             const limitLen = key.includes('baths') ? 25000 : (key.includes('pontos') ? 8000 : 5000);
             if (strVal.length > limitLen) {
                strVal = strVal.substring(0, limitLen) + '...';
             }
             localData += `[${key}]: ${strVal}\n`;
          }
        } catch(e) {}
      }

      return `[Supabase]\n${supabaseData || 'Nenhum'}\n\n[Local]\n${localData || 'Nenhum'}`;
    };

    const projectStateSummary = await fetchProjectContext();

    try {
      let isStreamingMessageAppended = false;

      const recentMessages = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));

      const response = await askAI(
         [...recentMessages, { role: userMsg.role, content: userMsg.content }],
         locationStr,
         userName,
         projectStateSummary,
         window.location.pathname,
         user?.user_metadata,
         (chunk: string) => {
           if (!isStreamingMessageAppended) {
             setIsChatLoading(false);
             setMessages(prev => [...prev, { role: 'assistant', content: chunk, timestamp: Date.now() }]);
             isStreamingMessageAppended = true;
           } else {
             setMessages(prev => {
               const newMessages = [...prev];
               const lastIdx = newMessages.length - 1;
               if (newMessages[lastIdx].role === 'assistant') {
                 newMessages[lastIdx] = {
                   ...newMessages[lastIdx],
                   content: newMessages[lastIdx].content + chunk
                 };
               }
               return newMessages;
             });
           }
         },
         !user ? guestSelectedModel : undefined
      );
      
      let processedResponse = response;
      const navRegex = /<navigate\s+path=["']([^"']+)["']\s*\/?>(?:<\/navigate>)?/i;
      const navMatch = navRegex.exec(processedResponse);
      let navigationPath: string | null = null;
      if (navMatch) {
         navigationPath = navMatch[1];
         processedResponse = processedResponse.replace(navMatch[0], '').trim();
      }

      if (!isStreamingMessageAppended) {
        setMessages(prev => [...prev, { role: 'assistant', content: processedResponse, timestamp: Date.now() }]);
      } else {
        // If it streamed, the last chunk was already appended, but we still need to strip the tag!
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          newMessages[lastIdx] = { ...newMessages[lastIdx], content: processedResponse };
          return newMessages;
        });
      }

      if (navigationPath) {
         navigate(navigationPath);
         setIsPipMode(true);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, não consegui processar sua mensagem.', timestamp: Date.now() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(URL.createObjectURL(e.target.files[0]));
    }
  };

  const createNewSession = () => {
    setCurrentSessionId(null);
    setMessages([{ role: 'assistant', content: 'Olá! Como posso te ajudar hoje?', timestamp: Date.now() }]);
  };

  const clearChat = () => createNewSession();

  return (
    <AssistantContext.Provider value={{
      showAssistantModal, setShowAssistantModal,
      messages, setMessages,
      isChatLoading, setIsChatLoading,
      chatInput, setChatInput,
      userAvatar, setUserAvatar,
      assistantAvatar, setAssistantAvatar,
      isScrolled, setIsScrolled,
      isPipMode, setIsPipMode,
      handleChatSend, handleAvatarChange, clearChat,
      guestSelectedModel, setGuestSelectedModel,
      sessions, setSessions, currentSessionId, setCurrentSessionId, createNewSession
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
