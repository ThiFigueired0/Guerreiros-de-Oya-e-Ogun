

interface TocItem {
  capitulo: string;
  pagina: number;
}

/**
 * Gets the OpenRouter API key from environment variables.
 */
const getOpenRouterKey = () => {
  return import.meta.env.VITE_OPENROUTER_API_KEY || '';
};

/**
 * Uses OpenRouter (Gemini 1.5 Flash 8B) to read an image and structure it into a Table of Contents.
 * @param base64Image Image in base64 format (handles both with and without data prefix).
 */
export const generateTocFromImage = async (
  base64Image: string, 
  onProgress: (step: 'ai' | 'done') => void
): Promise<TocItem[]> => {
  const apiKey = getOpenRouterKey();
  
  if (!apiKey) {
    console.warn('VITE_OPENROUTER_API_KEY is empty or undefined. Attempting call anyway...');
  }

  // Ensure image has correctly formatted data prefix
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const imageUrl = `data:image/jpeg;base64,${cleanBase64}`;

  onProgress('ai');

  const prompt = `
    Leia este sumário e retorne apenas um array JSON com os campos capitulo e pagina.
    
    Regras:
    1. Retorne APENAS um array JSON válido.
    2. Formato: [ { "capitulo": "Nome do Capítulo", "pagina": numero_da_pagina } ].
    3. Não inclua Markdown (como \`\`\`json), nem explicações ou outros textos.
    4. Se houver subcapítulos, inclua-os também.
    5. Se uma página não estiver clara, use 0.
  `;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Templo Oya Ogum'
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5-8b:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Clean up potential markdown blocks from AI response
    const jsonStr = content.replace(/```json|```/g, '').trim();
    
    try {
      const parsed = JSON.parse(jsonStr);
      onProgress('done');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', jsonStr);
      throw new Error('A IA não retornou um JSON válido. Tente outra foto mais nítida.', { cause: e });
    }
  } catch (error) {
    console.error('Error in OpenRouter API:', error);
    throw error;
  }
};
