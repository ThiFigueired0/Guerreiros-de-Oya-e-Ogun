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
    
    if (!response.ok) {
      return "";
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) return "";
    
    return data.results.map((r: any) => `Fonte: ${r.url}\nResumo: ${r.content}`).join("\n\n");
  } catch (error) {
    return "";
  }
};

// Local fallback using WebLLM
const runLocalFallback = async (
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    console.warn("⚠️ Ativando Modo de Segurança Local (WebLLM)... O primeiro carregamento pode demorar.");
    
    // Dynamically import WebLLM so it doesn't block initial page load
    const webllm = await import('@mlc-ai/web-llm');
    
    // Use a lightweight model for fallback
    const selectedModel = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';
    
    const engine = await webllm.CreateMLCEngine(selectedModel, {
      initProgressCallback: (progress) => {
        console.log(`[WebLLM Progress] ${progress.text}`);
      }
    });
    
    // We map messages to ChatCompletionMessageParam format used by WebLLM
    const chatMessages = messages.map(m => ({ 
      role: m.role as "system" | "user" | "assistant", 
      content: m.content 
    }));
    
    if (onChunk) {
       let fullReply = "";
       const asyncChunkGenerator = await engine.chat.completions.create({
         messages: chatMessages,
         temperature: 0.7,
         stream: true,
       });
       
       for await (const chunk of asyncChunkGenerator) {
         if (chunk.choices[0]?.delta?.content) {
            const text = chunk.choices[0].delta.content;
            fullReply += text;
            onChunk(text);
         }
       }
       return fullReply;
    } else {
       const reply = await engine.chat.completions.create({
         messages: chatMessages,
         temperature: 0.7,
       });
       return reply.choices[0]?.message?.content || "Sem resposta no modo local.";
    }
  } catch (err: any) {
    console.error("Falha no Modo de Segurança Local:", err);
    throw new Error(`Falha local total: ${err.message}`);
  }
};

export const askAI = async (
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  locationStr: string = '',
  userName: string = 'Guerreiro',
  projectStateSummary: string = '',
  currentPage: string = '',
  userMetadata: any = null,
  onChunk?: (chunk: string) => void,
  guestSelectedModel?: string
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

  // Poda de Contexto Local (Context Truncation)
  // Limita o histórico de mensagens para evitar estouro de tokens e lentidão
  let chatMessages = messages.filter(m => m.role !== 'system');
  const totalChars = chatMessages.reduce((acc, msg) => acc + msg.content.length, 0);
  
  // Poda as mensagens mais antigas mantendo apenas as 4 últimas se exceder os gatilhos
  if (chatMessages.length > 4 || totalChars > 8000) {
    chatMessages = chatMessages.slice(-4);
  }
  
  let finalMessages = [...chatMessages];

  // Adiciona a diretriz do Sistema (System Prompt) fixamente
  if (!finalMessages.some(m => m.role === 'system')) {
    finalMessages.unshift({
        role: 'system',
        content: `Você é o "Mini Chefinho", um assistente de inteligência artificial dedicado, especialista e profundo conhecedor de conhecimentos espirituais, com foco em Umbanda, Quimbanda e Candomblé. Você domina os fundamentos dessas religiões, a história, o respeito aos mistérios, e é um verdadeiro mestre no conhecimento de ervas (banhos, defumações, firmezas) e rituais.

Sua missão principal é guiar, ensinar e tirar dúvidas dos usuários sobre esses caminhos espirituais com propriedade e respeito.

DIRETRIZES DE ESCOPO:
1. Seu foco é espiritual. Se o usuário fizer perguntas completamente fora do escopo (ex: "Qual a raiz quadrada de 64?", "Como programar em Python?"), você não deve se recusar de forma robótica, mas deve responder de forma breve e, logo em seguida, puxar o assunto de volta para a sua verdadeira missão. 
   - Exemplo de abordagem: "Olha, a raiz quadrada de 64 é 8! Mas ó, me conta... veio buscar essa conta ou quer saber qual erva a gente usa para equilibrar a energia hoje? Vamos focar no que importa!"

DIRETRIZES DE TOM DE VOZ E COMUNICAÇÃO:
2. Comunicação Humana, Autêntica e Espontânea: Você fala como um irmão de santo ou um amigo de confiança no terreiro. Sua fala deve ser natural e acolhedora, mas sem parecer um robô tentando forçar gírias a todo momento.
3. PROIBIÇÃO DE REPETIÇÕES E BORDÕES: Você está TERMINANTEMENTE PROIBIDO de iniciar suas respostas sempre com a mesma expressão (como "Ó, beleza!", "Pega a visão" ou "Axé"). Varie totalmente a abertura das suas frases. Muitas vezes, comece direto respondendo o usuário, sem nenhuma saudação prévia.
4. Uso Equilibrado de Expressões: Use gírias e termos do universo espiritual (ex: "ó", "caminhada", "com certeza", "saravá", "axé") apenas quando fizer sentido no contexto da conversa. A gíria deve entrar de forma sutil no meio do texto, e não como um carimbo no início de cada mensagem.
5. Ortografia Perfeita: Mantenha a gramática impecável. Use "você" em vez de "vc", "está" em vez de "tá" (a menos que seja uma expressão falada muito específica).
6. Uso de Emojis: Adicione emojis sempre que possível de acordo com a respectiva temática (precisando ter coerência), utilizando no máximo 2 emojis por balão de resposta.

EXEMPLOS DE ABERTURAS VARIADAS PARA SE INSPIRAR:
- "Para te ensinar um ponto antigo que faça sentido, preciso entender..." (Entrando direto no assunto)
- "Com certeza! Vamos falar de fundamentos. Mas antes, me conta..." (Uso sutil de expressão)
- "Olha, cada caminho tem sua força. Você caminha mais na Umbanda, Candomblé ou Quimbanda? Me conta para eu te passar o ponto certo." (Linguagem natural)

DIRETRIZES DE SUGESTÕES CONTEXTUAIS (FOLLOW-UP):
7. Ao final de cada resposta, gere de 3 a 4 alternativas de perguntas de continuidade dentro da tag <sugestoes>.
8. ATENÇÃO CRÍTICA À PERSPECTIVA: Essas perguntas representam a voz DO USUÁRIO direcionada a você. Você NUNCA deve fazer perguntas para o usuário responder (como "Você já fez banho antes?" ou "Qual seu Orixá?"). Em vez disso, coloque dúvidas que o usuário teria sobre o que você acabou de explicar.
9. FORMATO DE SAÍDA: Para que o sistema do aplicativo consiga separar o seu texto das sugestões, envie sempre as perguntas no final da mensagem estruturadas dentro de uma tag XML chamada <sugestoes>, com cada pergunta separada por quebra de linha.
   - Exemplo ERRADO (Não faça): <sugestoes>Você quer um banho de descarga?</sugestoes>
   - Exemplo CERTO (Faça):
     <sugestoes>
     Como eu faço esse banho de descarga que você citou?
     Quais ervas dessa lista são mais fáceis de encontrar?
     Existe alguma contraindicação?
     </sugestoes>

Lembre-se: Você é o assistente oficial do projeto, traga segurança, respeito aos fundamentos e aquele toque de carisma humano que faz o usuário se sentir em casa.

DIRETRIZES DE TRATAMENTO E GERAÇÃO DE MÍDIA:
10. Você agora recebe o contexto de imagens e documentos traduzidos em texto pelo sistema através de tags como [O usuário anexou uma imagem que contém: ...] ou [Conteúdo do PDF anexado: ...]. Interprete essas descrições com o seu profundo conhecimento espiritual. Se descreverem uma folha, ferramenta ou guia, identifique o fundamento e explique ao usuário com propriedade e carisma.
11. Sempre que o usuário te pedir EXPLICITAMENTE para "gerar", "criar" ou "montar" um documento, arquivo ou PDF (ex: "consolide em um documento", "gere um pdf", "crie um arquivo"), estruture sua resposta em texto de forma organizada. MUITO IMPORTANTE: Você **DEVE** incluir a tag especial <pdf_ready/> no final da sua resposta para sinalizar ao sistema que um botão de download deve ser exibido. Não inclua essa tag se o usuário não pediu um documento.
12. Destaque sempre em **negrito** os nomes de Entidades, Orixás e Divindades na sua resposta (ex: **Exu**, **Iemanjá**, **Zé Pelintra**). O sistema aplicará uma cor especial dourada nessas palavras.

DIRETRIZES DE RESUMO E NAVEGAÇÃO:
13. MODO RESUMO: Sempre que o usuário pedir para "resumir", "resume aí", "condensar" ou pedir uma versão mais curta de um texto longo ou explicação anterior, você DEVE condensar o conteúdo em poucos tópicos curtos (bullet points), de forma direta e objetiva, mantendo apenas a essência dos fundamentos ou da mensagem.
14. NAVEGAÇÃO AUTÔNOMA: Sempre que o usuário pedir para você abrir uma tela, acessar uma página, mostrar alguma lista do projeto ou mudar de página (ex: "abra minha lista de banhos", "vá para a agenda", "me mostre as finanças"), você DEVE gerar uma tag especial de navegação no formato <navigate path="/caminho"/> no final da sua resposta, além de uma mensagem amigável de confirmação.
Os caminhos disponíveis no sistema são:
- Início / Visão geral: /home
- Agenda / Eventos: /calendar
- Banhos / Ervas: /herbs
- Trabalhos / Rituais: /trab
- Pontos cantados: /points
- Estudos / Fundamentos: /studies
- Notas / Anotações: /notes
- Financeiro / Caixa: /finance
- Ajustes / Perfil: /settings

DIRETRIZES DE CRONOGRAMA E DATAS:
14. A data atual do sistema é ${new Date().toISOString()}.
15. Sempre que o usuário perguntar sobre "próximos eventos", "agenda" ou "o que vai acontecer", utilize a data atual como ponto de corte absoluto.
16. REGRA DE FILTRAGEM RÍGIDA: Compare o mês e o ano da data atual com os eventos disponíveis. Se um evento tiver uma data ANTERIOR à data de hoje, você deve IGNORÁ-LO completamente. Ele não existe mais para a agenda de próximos eventos.
17. Caso o próximo evento da lista já tenha passado e não haja eventos futuros cadastrados, seja honesto de forma natural. (Ex: "Olha, na nossa agenda local o último evento foi a Festa de Marias em janeiro, então para os próximos dias não tenho nada marcado por aqui. Quer que eu verifique alguma outra coisa sobre os fundamentos?")
18. REGRA DE ANÁLISE DE AGENDA: Sempre que o usuário perguntar pelo "primeiro", "último" ou fizer perguntas sobre os limites da agenda do ano, você deve fazer uma varredura COMPLETA em todas as linhas do contexto de eventos fornecido. Não assuma que o primeiro mês que você encontrou no meio do texto é o fim da lista. Olhe até a última linha do contexto para identificar o evento com a maior data do ano (ex: dezembro) antes de responder qual é o último. Seja extremamente preciso com os nomes e datas. Se houver eventos em dezembro, o último é o de dezembro, e não o de julho.
19. DIRETRIZ DE SEGURANÇA DA AGENDA: Você só deve informar eventos baseando-se ESTREITAMENTE no histórico/contexto interno da agenda que foi fornecido a você pelo sistema. Proibição de busca externa: Se o usuário perguntar sobre a agenda do ano e você notar que faltam meses (como o segundo semestre), você NUNCA deve buscar eventos na internet ou inventar feiras, shows ou feriados externos de São Paulo para preencher a resposta.

DIRETRIZES DE CONSULTA AOS DADOS DO USUÁRIO E CONHECIMENTO PRÓPRIO (CRÍTICO):
19. Sempre que o usuário perguntar sobre "o que eu tenho", "o que está cadastrado", "meu estoque", "minhas ervas", "quais banhos possuo", LER O [RELATÓRIO DO SISTEMA].
20. Para listar O QUE O USUÁRIO TEM SALVO, baseie-se APENAS na lista de itens anexada no relatório abaixo. Liste cuidadosamente o que o usuário tem lá. Se o relatório não tiver os dados dele, diga que ele não tem nada salvo sobre isso.
21. PORÉM, para responder a perguntas TÉCNICAS (MISTÉRIOS), ensinar as "ervas de um banho" se elas não estiverem no relatório, ensinar "simpatias", "pontos", ou esclarecer DÚVIDAS ESPIRITUAIS, você é um sábio e **DEVE** usar o SEU VASTO CONHECIMENTO (seja da net ou de seus dados internos) para ensinar, somando à realidade dele. MISTURE as ervas que ele tem com o que falta, etc. Não recuse ensinar só porque não está no relatório!

[RELATÓRIO DO SISTEMA DE DADOS CADASTRADOS PELO USUÁRIO (LEIA COM ATENÇÃO)]
${systemReport}

Regras adicionais:
- NUNCA diga 'De acordo com os dados' ou 'Você está na página...'. Aja de forma natural como se você já soubesse de tudo.
- Seja proativo e unifique as pesquisas da web com os dados do próprio do sistema / banco de dados.
- Se o nome do usuário for sabido, use-o com naturalidade.`
    });
  }

  try {
    let isStream = !!onChunk;
    let response: Response | undefined;
    
    const targetModel = guestSelectedModel || 'llama-3.3-70b-versatile';
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    // Failover Loop (Pool de Provedores)
    const providers = [];
    
    // Provedor 1: Groq (Primário)
    if (apiKey && !targetModel.includes('/')) {
      providers.push({ name: 'Groq (Primário)', endpoint: 'https://api.groq.com/openai/v1/chat/completions', key: apiKey, model: targetModel });
    }
    
    if (openRouterKey) {
      if (targetModel.includes('/')) {
        providers.push({ name: 'OpenRouter (Selecionado)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: targetModel });
      }
      // Provedor 2: OpenRouter (Llama 3.3 70B equivalente)
      providers.push({ name: 'OpenRouter (Llama 3.3 70B)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'meta-llama/llama-3.3-70b-instruct' });
      // Provedor 3: Fallback OpenRouter Menor (Llama 3.1 8B Free/SambaNova/Together)
      providers.push({ name: 'OpenRouter / Fallback Server (Llama 3.1 8B)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'meta-llama/llama-3.1-8b-instruct:free' });
      // Provedor 4: Fallback final para Gemini 2.0 Flash Lite via OpenRouter
      providers.push({ name: 'OpenRouter (Gemini 2.0 Flash Lite)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'google/gemini-2.0-flash-lite-preview-02-05:free' });
    }
    
    if (apiKey) {
      // Provedor 5: Groq Fallback 8B (último recurso rápido)
      providers.push({ name: 'Groq (Fallback 8B)', endpoint: 'https://api.groq.com/openai/v1/chat/completions', key: apiKey, model: 'llama-3.1-8b-instant' });
    }
    
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`[Failover Loop] Tentando provedor: ${provider.name} com modelo ${provider.model}...`);
        
        const res = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Mini Chefinho'
          },
          body: JSON.stringify({
            model: provider.model,
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 1024,
            stream: isStream
          })
        });

        if (!res.ok) {
          throw new Error(`[${provider.name} Error] ${res.status} - ${await res.text()}`);
        }

        response = res;
        break; // Sucesso, aborta o loop e continua o processamento
      } catch (err: any) {
        console.warn(`[Failover Loop] Falha no provedor ${provider.name}:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      console.warn(`[Failover Loop] Todos os provedores falharam. Acionando Fallback Local WebLLM...`);
      try {
        if (onChunk) {
          onChunk("*(Modo de Segurança Local ativado: Servidores indisponíveis. Processando no seu dispositivo...)*\n\n");
        }
        return await runLocalFallback(finalMessages, onChunk);
      } catch (localErr: any) {
        return `O assistente está temporariamente indisponível. Motivo: ${lastError?.message || 'Todos os provedores falharam.'} (Fallback Local: ${localErr.message})`;
      }
    }

    if (isStream && response && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullContent = "";
      let buffer = "";
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ") && trimmedLine !== "data: [DONE]") {
              try {
                const data = JSON.parse(trimmedLine.slice(6));
                if (data.choices && data.choices[0]?.delta?.content) {
                  const text = data.choices[0].delta.content;
                  fullContent += text;
                  onChunk!(text);
                }
              } catch (e) {
                // Parse errors can happen with partial streams, ignore
              }
            }
          }
        }
      }
      return fullContent || 'Sem resposta.';
    }

    if (response) {
      const data = await response.json();
      return data.choices[0]?.message?.content || 'Sem resposta.';
    }
    
    return 'Sem resposta.';
  } catch (error) {
    return 'Houve um problema ao processar sua pergunta.';
  }
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Chave API GROQ não encontrada.');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Erro na transcrição:', error);
    throw error;
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

const getHuggingFaceApiKey = () => {
  if (import.meta.env && import.meta.env.VITE_HUGGINGFACE_API_KEY) {
    return import.meta.env.VITE_HUGGINGFACE_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
  }
  return undefined;
};

export const analyzeImage = async (imageBlob: Blob): Promise<string> => {
  const apiKey = getApiKey(); // uses Groq key
  if (!apiKey) {
    throw new Error('Chave API GROQ não encontrada para Visão.');
  }

  try {
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    const base64Image = `data:${imageBlob.type || 'image/jpeg'};base64,${base64Data}`;

    const prompt = "Describe this image in detail, focusing on identifying objects, colors, plants, or symbols, in a way that can be used for a chat assistant context.";

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error('Groq Vision Error:', errTxt);
      throw new Error(`A API de Visão falhou com status: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || 'Análise de imagem concluída, mas sem detalhes fornecidos.';
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(error.message, { cause: error });
    }
    throw new Error('Falha de conexão com a API de Visão.', { cause: error });
  }
};

export const extractTextFromPdf = async (pdfBlob: Blob): Promise<string> => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerPort) {
      // Use module worker to avoid Vite dynamically injecting ?import on a text string
      const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerPort = new Worker(workerUrl, { type: 'module' });
    }

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    // Limite de páginas para evitar travamentos
    const maxPages = Math.min(pdf.numPages, 10);
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    throw new Error("Não foi possível extrair o texto do PDF.", { cause: error });
  }
};

export const generateSpeech = async (text: string): Promise<Blob> => {
  const apiKey = getHuggingFaceApiKey();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else {
    console.warn("Aviso: Chave API Hugging Face não encontrada. Fallback local será ativado.");
    throw new Error("Chave API Hugging Face não encontrada. Configure VITE_HUGGINGFACE_API_KEY no .env.");
  }

  // Remove XML tags from text and normalize punctuation for better voice processing (pauses)
  const cleanText = text
    .replace(/<[^>]*>?/gm, '')
    .replace(/([*#_~|]+|--+)/g, '.') // Replace special chars and long dashes with dots
    .replace(/\s+/g, ' ') // Collapse spaces
    .trim();

  // Try inference API
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: cleanText,
        parameters: {
          voice: 'pm_alex', // Voz masculina firme em PT-BR (alternativa: 'pf_bella')
          lang: 'p', // Língua portuguesa
          speed: 0.92, // Velocidade levemente reduzida para soar mais natural
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Hugging Face: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    throw new Error("API indisponível ou falha de rede", { cause: error }); // Triggers fallback
  }
};
