

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
  const response = await fetch('/api/generate-toc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text
    })
  });

  if (!response.ok) {
    throw new Error('Erro ao processar texto com API.');
  }

  const data = await response.json();
  const content = data.reply || '[]';
  
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
