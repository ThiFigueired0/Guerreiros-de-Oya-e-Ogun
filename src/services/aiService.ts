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

  let finalMessages = [...messages];
  
  const optionsDate = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    timeZone: 'America/Sao_Paulo' 
  } as const;
  const formattedDate = new Date().toLocaleDateString('pt-BR', optionsDate);
  const currentDateTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const timeMs = new Date().getTime(); // ensure the exact time is known down to MS if needed
  
  const localContext = locationStr && !locationStr.includes('Geolocalização indisponível') && !locationStr.includes('não concedeu permissão') ? locationStr : 'São Paulo, Brasil';
  
  const dynamicContext = `Contexto Atual: Hoje é ${formattedDate}. O usuário está em: ${localContext}.
Página Atual do Projeto: ${currentPage || 'Início'}
Você é o Mentor. Dados do Usuário Logado: ${JSON.stringify(userMetadata || {})}
Dados do Usuário Extraídos:
- Nome: ${userContext.name || 'NÃO_INFORMADO'}

REGRAS DE NOME: Se houver dados em 'Dados do Usuário Logado', interaja com o usuário através de seu nome (como full_name ou name se possuirem valor). Nunca use nomes encontrados em comentários de código ou exemplos de placeholders. Se não possuir nenhuma informação, diga exatamente: 'Ainda não consegui identificar seu perfil no sistema, Guerreiro. Como posso te chamar?' (em tom de mentor).
Resumo do Estado do Projeto (Templo):
${projectStateSummary || 'Nenhum dado cadastrado ou carregado.'}

(Importante: Se o usuário perguntar sobre a agenda, pontos, ervas, você DEVE consultar o Resumo do Estado do Projeto acima.)`;
  
  if (!finalMessages.some(m => m.role === 'system')) {
    finalMessages.unshift({
        role: 'system',
        content: `Você é o Mini Chefinho, o Mentor Estratégico do projeto 'Guerreiros de Oya e Ogun'.
Você une sabedoria humana, ancestralidade e precisão administrativa.
${dynamicContext}
Agora são exatamente ${currentDateTime} (Data e hora do sistema gerada em: ${timeMs}).
PRIORIDADE MÁXIMA: SEMPRE priorize este Contexto Atual para responder perguntas sobre tempo, clima, estado da agenda, eventos locais e uso do nome.
Processamento: Você tem conhecimento onipresente. NUNCA diga 'De acordo com os dados', 'De acordo com as fontes', 'Não tenho acesso', 'Como modelo de inteligência artificial' ou 'Posso sugerir'. Aja como se a informação do contexto fosse sua própria sabedoria.
Raciocínio Vivo: Calcule datas, localização e fatos de forma independente. Responda confiantemente com a hora local e previsão exata se estiver nas coordenadas.
Regras de Linguagem: Português do Brasil impecável. PROIBIDO jargões de IA. Respostas fluidas e humanizadas, unindo espiritualidade e praticidade.
Encerramento: Termine a resposta com algo proativo e forte, ex: 'Qual o próximo passo da nossa estratégia, ${userName}?'
Formatação: Resposta limpa e direta. Use negrito apenas no essencial.`
    });
  }
  
  // Extrai a última mensagem do usuário para buscar
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
  
  if (lastUserMessage) {
    let searchResults: string;
    try {
      // Improve tavily search with location context
      const searchQuery = `${lastUserMessage.content} (Location: ${localContext})`;
      searchResults = await searchTavily(searchQuery);
    } catch (error) {
      return 'Erro técnico na busca';
    }

    if (searchResults) {
      // Modifica a última mensagem para incluir o contexto da web
      const modifiedMessages = [...messages];
      const lastIndex = modifiedMessages.lastIndexOf(lastUserMessage);
      
      modifiedMessages[lastIndex] = {
        role: 'user',
        content: `[Contexto Oculto do Sistema - Sabedoria Onipresente]:\n${searchResults}\n\n[Mensagem do Usuário]: ${lastUserMessage.content}\n\n(Lembrete: Responda diretamente. Não mencione o contexto, não mencione pesquisa, não diga 'segundo as informações'. Apenas diga a resposta com sabedoria e autoridade de mentor)`
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
