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
  console.log('Chave Tavily:', apiKey ? 'OK' : 'Faltando');
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
    
    if (!response.ok) {
      console.error("Tavily search failed code:", response.status);
      throw new Error("Tavily api error");
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return "";
    
    return data.results.map((r: any) => `Fonte: ${r.url}\nResumo: ${r.content}`).join("\n\n");
  } catch (error) {
    console.error("Tavily search error:", error);
    throw new Error('Erro técnico na busca', { cause: error });
  }
};

export const askAI = async (
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  locationStr: string = '',
  userName: string = 'Guerreiro',
  projectStateSummary: string = '',
  currentPage: string = '',
  userMetadata: any = null
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error('Erro: Chave API GROQ não encontrada nos ambientes compatíveis.');
    return 'Erro de configuração no servidor. Tente novamente em instantes';
  }

  const userContext = {
    name: userName && userName !== 'Fds meu Nome' && userName !== 'Guerreiro' ? userName : null
  };
  
  console.log('Nome enviado ao Assistente:', userContext.name);

  // Extrai a última mensagem do usuário para buscar e para colocar o contexto ANTES dela.
  let searchResults = "";
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
  
  if (lastUserMessage) {
    try {
      // O Tavily precisa deste contexto
      const searchQuery = `${lastUserMessage.content} (Location: ${locationStr})`;
      searchResults = await searchTavily(searchQuery);
    } catch (error) {
      console.warn("Tavily failed", error);
    }
  }

  const currentDateTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  // Concatenação EXATA conforme solicitado
  let systemReport = `Usuário Logado: ${userContext.name || userMetadata?.full_name || userMetadata?.name || 'Não identificado'}\n`;
  systemReport += `Página Atual: ${currentPage || 'Não informada'}\n`;
  systemReport += `Data/Hora Local: ${currentDateTime}\n`;
  systemReport += `Localização do Navegador: ${locationStr}\n\n`;
  systemReport += `Resumo do Banco: \n${projectStateSummary || 'Nenhum dado cadastrado ou carregado.'}\n\n`;
  
  if (searchResults) {
    systemReport += `Pesquisa Web Externa (Tavily): \n${searchResults}\n\n`;
  }

  // Filtrar as mensagens originais
  let finalMessages = messages.filter(m => m.role !== 'system');
  
  // A última mensagem do usuário enviaremos separadamente ou a modificaremos:
  // "Altere a lógica para que a mensagem do usuário seja enviada APÓS esses dados de contexto."
  // Faremos isso modificando o finalMessages

  if (!finalMessages.some(m => m.role === 'system')) {
    finalMessages.unshift({
        role: 'system',
        content: `Você é o Mini Chefinho, o assistente estratégico do projeto. Você acessa todos os dados do sistema para oferecer os melhores insights. Você DEVE incluir ao menos um emoji (como 🌿, ⚔️, ⚡, 💡) em cada resposta para humanizar a conversa. Use esses emojis de forma estratégica, misturando emojis de gestão (📅, 📈) com elementos de natureza/proteção.

[RELATÓRIO DO SISTEMA PARA CONTEXTO DA RESPOSTA]
${systemReport}

Regras:
1. NUNCA diga 'De acordo com os dados' ou 'Você está na página...'. Aja de forma natural como se você já soubesse de tudo.
2. Seja proativo e unifique as pesquisas da web com os dados do próprio do sistema / banco de dados.
3. Se o nome do usuário for sabido, use-o com naturalidade.`
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
