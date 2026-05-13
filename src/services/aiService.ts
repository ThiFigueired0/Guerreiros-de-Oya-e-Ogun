// Tenta obter a chave de diferentes fontes, priorizando Vite (import.meta.env)
const getApiKey = () => {
  console.log('Chave Groq presente:', !!import.meta.env.VITE_GROQ_API_KEY);
  // 1. Prioridade absoluta para Vite
  if (import.meta.env && import.meta.env.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  
  // 2. Fallback para Node/Expo process.env se disponível
  if (typeof process !== 'undefined' && process.env) {
    return process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  }
  
  return undefined;
};

const getTavilyApiKey = () => {
  if (import.meta.env && import.meta.env.VITE_TAVILY_API_KEY) {
    return import.meta.env.VITE_TAVILY_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_TAVILY_API_KEY || process.env.TAVILY_API_KEY;
  }
  return undefined;
};

const searchTavily = async (query: string): Promise<string> => {
  const apiKey = getTavilyApiKey();
  if (!apiKey) return "";
  
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        max_results: 3
      })
    });
    
    if (!response.ok) return "";
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return "";
    
    return data.results.map((r: any) => `Fonte: ${r.url}\nResumo: ${r.content}`).join("\n\n");
  } catch (error) {
    console.error("Tavily search error:", error);
    return "";
  }
};

export const askAI = async (messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('Erro: Chave API GROQ não encontrada nos ambientes compatíveis.');
    return 'Erro de configuração no servidor. Tente novamente em instantes';
  }

  let finalMessages = [...messages];
  
  // Extrai a última mensagem do usuário para buscar
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
  
  if (lastUserMessage) {
    const searchResults = await searchTavily(lastUserMessage.content);
    if (searchResults) {
      // Modifica a última mensagem para incluir o contexto da web
      const modifiedMessages = [...messages];
      const lastIndex = modifiedMessages.lastIndexOf(lastUserMessage);
      
      modifiedMessages[lastIndex] = {
        role: 'user',
        content: `Informações atualizadas da web sobre o assunto (Use isso como contexto se for relevante para a pergunta):\n\n${searchResults}\n\nPergunta do usuário: ${lastUserMessage.content}`
      };
      
      finalMessages = modifiedMessages;
    }
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      return 'O assistente está temporariamente indisponível.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sem resposta.';
  } catch (error) {
    return 'Houve um problema ao processar sua pergunta.';
  }
};

export const getDailyKnowledge = async (): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return JSON.stringify({
      title: "Sabedoria Oculta",
      content: "A sabedoria do dia está guardada. Verifique a chave de acesso.",
      category: "Aviso"
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Você é um historiador e doutrinador de Umbanda e Candomblé. 
            Gere uma pílula de conhecimento (um Itã, um Fundamento ou uma Tradição Histórica).
            O tom deve ser educativo e respeitoso.
            Responda APENAS em JSON no formato:
            {
              "title": "Título Curto",
              "content": "Conteúdo educativo detalhado (até 450 caracteres)",
              "category": "Itã | Fundamento | Tradição"
            }`
          },
          {
            role: 'user',
            content: 'Gere o conhecimento estruturado de hoje.'
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) return JSON.stringify({
      title: "Paciência",
      content: "O conhecimento de hoje será revelado em breve. O tempo de Deus é perfeito.",
      category: "Aviso"
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";
    // Clean potential markdown code blocks
    const jsonStr = content.replace(/```json|```/g, "").trim();
    return jsonStr;
  } catch (error) {
    return JSON.stringify({
      title: "Conexão",
      content: "Conectando com as correntes de conhecimento... Tente novamente em breve.",
      category: "Status"
    });
  }
};
