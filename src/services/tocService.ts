
interface TocItem {
  capitulo: string;
  pagina: number;
}

/**
 * Gets the Groq API key from environment variables.
 */
const getGroqKey = () => {
  return import.meta.env.VITE_GROQ_API_KEY || '';
};

/**
 * Uses Groq's Vision model to read an image and structure it into a Table of Contents.
 * @param base64Image Image in base64 format (handles both with and without data prefix).
 */
export const generateTocFromImage = async (
  base64Image: string, 
  onProgress: (step: 'ai' | 'done') => void
): Promise<TocItem[]> => {
  const groq = getGroqKey();
  
  if (!groq) {
    console.warn('VITE_GROQ_API_KEY is empty or undefined. Attempting call anyway...');
  }

  // Remove data:image/...;base64, prefix for the API call
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
  // Re-add prefix in the format Groq expects if needed, or send as pure data
  const imageUrl = `data:image/jpeg;base64,${cleanBase64}`;

  onProgress('ai');

  const prompt = `
    Analise a imagem enviada, que é o sumário/índice de um livro.
    Extraia todos os capítulos e seus respectivos números de página.
    
    Regras:
    1. Retorne APENAS um array JSON válido.
    2. Formato: [ { "capitulo": "Nome do Capítulo", "pagina": numero_da_pagina } ].
    3. Não inclua Markdown (como \`\`\`json), nem explicações ou outros textos.
    4. Se houver subcapítulos, inclua-os também.
    5. Se uma página não estiver clara, use 0.
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groq}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
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
        ],
        temperature: 0.1,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq Vision Error: ${errorData.error?.message || response.statusText}`);
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
      console.error('Failed to parse Groq response as JSON:', jsonStr);
      throw new Error('A IA não retornou um JSON válido. Tente outra foto mais nítida.');
    }
  } catch (error) {
    console.error('Error in Groq Vision API:', error);
    throw error;
  }
};
