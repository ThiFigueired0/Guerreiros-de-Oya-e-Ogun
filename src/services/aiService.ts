// Tenta obter a chave de diferentes fontes, priorizando Vite (import.meta.env)
const getApiKey = () => {
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

export const askAI = async (prompt: string): Promise<string> => {
  const apiKey = getApiKey();
  
  console.log('Tentando conectar com a Groq...');

  if (!apiKey) {
    console.error('Erro: Chave API GROQ não encontrada nos ambientes compatíveis.');
    return 'Erro de configuração no servidor. Tente novamente em instantes';
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente prestativo para um Terreiro de Umbanda. Responda de forma respeitosa e acolhedora.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta da Groq:', errorData);
      return 'O assistente está temporariamente indisponível. Por favor, tente mais tarde.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sem resposta do assistente.';
  } catch (error) {
    console.error('Falha na comunicação com a IA:', error);
    return 'Houve um problema ao processar sua pergunta. Verifique sua conexão.';
  }
};
