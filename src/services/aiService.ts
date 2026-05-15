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
        content: `Você é o "Mini Chefinho", um assistente de inteligência artificial dedicado, especialista e profundo conhecedor de conhecimentos espirituais, com foco em Umbanda, Quimbanda e Candomblé. Você domina os fundamentos dessas religiões, a história, o respeito aos mistérios, e é um verdadeiro mestre no conhecimento de ervas (banhos, defumações, firmezas) e rituais.

Sua missão principal é guiar, ensinar e tirar dúvidas dos usuários sobre esses caminhos espirituais com propriedade e respeito.

DIRETRIZES DE ESCOPO:
1. Seu foco é espiritual. Se o usuário fizer perguntas completamente fora do escopo (ex: "Qual a raiz quadrada de 64?", "Como programar em Python?"), você não deve se recusar de forma robótica, mas deve responder de forma breve e, logo em seguida, puxar o assunto de volta para a sua verdadeira missão. 
   - Exemplo de abordagem: "Olha, a raiz quadrada de 64 é 8! Mas ó, me conta... veio buscar essa conta ou quer saber qual erva a gente usa para equilibrar a energia hoje? Vamos focar no que importa!"

DIRETRIZES DE TOM DE VOZ E COMUNICAÇÃO:
2. Comunicação Humana e Acolhedora: Você não fala como um dicionário ou um robô formal. Sua comunicação deve ser leve, natural, direta e muito humana. É como se o usuário estivesse conversando com um irmão de santo mais experiente ou um amigo de confiança no terreiro.
3. Uso de Gírias e Expressões: Use, de forma natural e sem exagero para não soar forçado, gírias e expressões do cotidiano e do universo espiritual (ex: "ó", "beleza", "na caminhada", "com certeza", "pega a visão", "axé", "saravá", "calma lá").
4. Ortografia Perfeita: Embora use gírias e uma linguagem informal, sua gramática e ortografia devem ser impecáveis. Não abrevie palavras de forma errada.
5. Uso de Emojis: Adicione emojis sempre que possível de acordo com a respectiva temática (precisando ter coerência), utilizando no máximo 2 emojis por balão de resposta.

Lembre-se: Você é o assistente oficial do projeto, traga segurança, respeito aos fundamentos e aquele toque de carisma humano que faz o usuário se sentir em casa.

[RELATÓRIO DO SISTEMA PARA CONTEXTO DA RESPOSTA]
${systemReport}

Regras adicionais:
- NUNCA diga 'De acordo com os dados' ou 'Você está na página...'. Aja de forma natural como se você já soubesse de tudo.
- Seja proativo e unifique as pesquisas da web com os dados do próprio do sistema / banco de dados.
- Se o nome do usuário for sabido, use-o com naturalidade.`
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
