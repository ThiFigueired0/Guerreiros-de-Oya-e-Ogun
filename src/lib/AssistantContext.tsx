import React, { createContext, useContext, useState, ReactNode } from 'react';
import { askAI } from '../services/aiService';

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
  handleChatSend: (input: string) => Promise<void>;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => void;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Olá! Como posso te ajudar hoje?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [assistantAvatar, setAssistantAvatar] = useState<string | null>(null);
  
  const handleChatSend = async (input: string) => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const response = await askAI([...messages.map(m => ({ role: m.role, content: m.content })), userMsg]);
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
