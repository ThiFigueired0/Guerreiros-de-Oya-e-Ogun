// Logs de inspeção no topo do arquivo
console.log('Ambiente detectado:', typeof process !== 'undefined' ? process.env.NODE_ENV : 'Browser/Vite');
console.log('Chave Groq presente (EXPO)?:', typeof process !== 'undefined' && !!process.env.EXPO_PUBLIC_GROQ_API_KEY);
console.log('Chave Groq presente (VITE)?:', !!import.meta.env.VITE_GROQ_API_KEY);

// Mapeamento Direto com fallbacks universais
const FINAL_KEY = (typeof process !== 'undefined' ? (process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '') : '') 
  || import.meta.env.VITE_GROQ_API_KEY 
  || '';

export async function askAI(prompt: string): Promise<string> {
  // Validação de Segurança
  if (!FINAL_KEY) {
    console.error('Erro Crítico: Chave API não injetada no Build do Vercel.');
    throw new Error('Erro Crítico: Chave API não injetada no Build do Vercel.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FINAL_KEY}`
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
      throw new Error(`Erro na API Groq: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sem resposta do assistente.';
  } catch (error) {
    console.error('Erro ao chamar Groq AI:', error);
    throw error;
  }
}
