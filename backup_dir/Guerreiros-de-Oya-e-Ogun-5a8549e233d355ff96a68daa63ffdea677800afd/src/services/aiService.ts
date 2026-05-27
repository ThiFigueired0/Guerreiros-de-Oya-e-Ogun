// Tenta obter a chave de diferentes fontes, priorizando Vite (import.meta.env)
const getApiKey = () => {
  if (import.meta.env && import.meta.env.VITE_GROQ_API_KEY) {
    return import.meta.env.VITE_GROQ_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  }
  return undefined;
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
    throw new Error(`Falha local total: ${err.message}`, { cause: err });
  }
};

export const askAI = async (
  messages: { role: 'user' | 'assistant' | 'system', content: string }[],
  locationStr: string = '',
  userName: string = 'Guerreiro',
  projectStateSummary: string = '',
  currentPage: string = '',
  userMetadata: any = null,
  userId: string | null = null,
  onChunk?: (chunk: string) => void,
  guestSelectedModel?: string
): Promise<string> => {
  try {
    const isStream = !!onChunk;
    const response = await fetch('/api/mini-chefinho', {
       method: 'POST',
       headers: { 
         'Content-Type': 'application/json',
         ...(isStream ? { 'Accept': 'text/event-stream' } : {}) 
       },
       body: JSON.stringify({
         messages,
         locationStr,
         userName,
         projectStateSummary,
         currentPage,
         userMetadata,
         userId
       })
    });
    
    if (!response.ok) {
       throw new Error(`API error: ${response.status}`);
    }

    if (isStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullContent = '';
      let buffer = '';
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ') && trimmedLine !== 'data: [DONE]') {
              try {
                const data = JSON.parse(trimmedLine.slice(6));
                if (data.choices && data.choices[0]?.delta?.content) {
                  const text = data.choices[0].delta.content;
                  fullContent += text;
                  onChunk(text);
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      }
      return fullContent || 'Sem resposta.';
    }

    const data = await response.json();
    return data.reply;
  } catch (error: any) {
    console.warn(`[API] Falhou. Acionando Fallback Local WebLLM... Erro: ${error.message}`);
    try {
      if (onChunk) {
        onChunk("*(Modo de Segurança Local ativado: Servidores indisponíveis. Processando no seu dispositivo...)*\n\n");
      }
      return await runLocalFallback(messages, onChunk);
    } catch (localErr: any) {
      return `O assistente está temporariamente indisponível. Motivo: Falha na API (${error.message}) e no Fallback Local (${localErr.message})`;
    }
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
