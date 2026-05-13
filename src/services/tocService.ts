

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
 * Uses Groq to structure text into a Table of Contents.
 */
export const generateTocFromText = async (text: string): Promise<TocItem[]> => {
  const apiKey = getGroqKey();
  
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY is not defined.');
  }

  const prompt = `Abaixo está um texto copiado de um sumário (índice), que pode estar muito desformatado. Identifique os títulos/capítulos e suas respectivas páginas (ex: "Introdução....5", "1. Introdução - 5" ou apenas "Introdução 5"). Organize os dados extraídos em um array JSON com os campos "capitulo" (string) e "pagina" (number). Aja inteligentemente e filtre sujeiras. Retorne estritamente o JSON válido e NADA MAIS, sem introduções ou explicações.\n\nTexto do Sumário:\n${text}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao processar texto com Groq API.');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  let jsonStr = content.replace(/```json|```/g, '').trim();
  const arrayMatch = jsonStr.match(/\[([\s\S]*?)\]/);
  if (arrayMatch && arrayMatch[0]) {
    jsonStr = arrayMatch[0];
  }
  
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    throw new Error('Formato de texto não compreendido.', { cause: e });
  }
};

export const generateTocFromImage = async (
  base64Image: string, 
  onProgress: (step: 'ai' | 'done') => void
): Promise<TocItem[]> => {
  throw new Error("OCR desabilitado temporariamente para otimização do projeto.");
};
