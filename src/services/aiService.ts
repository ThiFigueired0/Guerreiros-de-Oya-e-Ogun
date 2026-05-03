export async function askAI(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || (typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GROQ_API_KEY : undefined);

  console.log('Assistente Oya Ogum - Chave carregada:', !!apiKey);

  if (!apiKey) {
    // Instrução detalhada para debug em caso de erro
    const availableKeys = Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).join(', ');
    console.warn('DEBUG: Variáveis VITE_ disponíveis:', availableKeys || 'Nenhuma');
    throw new Error('Chave API não encontrada. Certifique-se de definir VITE_GROQ_API_KEY nas configurações.');
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
      throw new Error(`Erro na API Groq: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sem resposta do assistente.';
  } catch (error) {
    console.error('Erro ao chamar Groq AI:', error);
    throw error;
  }
}
