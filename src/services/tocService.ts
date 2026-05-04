
interface TocItem {
  capitulo: string;
  pagina: number;
}

const GOOGLE_VISION_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * Gets the API keys from environment variables.
 */
const getKeys = () => {
  return {
    google: import.meta.env.VITE_GOOGLE_SERVICES_KEY || '',
    groq: import.meta.env.VITE_GROQ_API_KEY || ''
  };
};

/**
 * Extracts text from an image using Google Cloud Vision API.
 * @param base64Image Image in base64 format (with or without data prefix).
 */
export const extractTextFromImage = async (base64Image: string): Promise<string> => {
  const { google } = getKeys();
  if (!google) {
    throw new Error('Google Services Key not configured.');
  }

  // Remove data:image/...;base64, prefix if present
  const content = base64Image.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await fetch(`${GOOGLE_VISION_URL}?key=${google}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content },
            features: [{ type: 'TEXT_DETECTION' }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.error?.message || errorBody.message || response.statusText || "Erro desconhecido";
      throw new Error(`Vision API error: ${message}`);
    }

    const data = await response.json();
    const fullTextAnnotation = data.responses?.[0]?.fullTextAnnotation?.text;
    
    if (!fullTextAnnotation) {
      throw new Error('Nenhum texto detectado na imagem.');
    }

    return fullTextAnnotation;
  } catch (error) {
    console.error('Error in Vision API:', error);
    throw error;
  }
};

/**
 * Uses Groq to structure raw text into a Table of Contents JSON array.
 */
export const structureTocWithAi = async (rawText: string): Promise<TocItem[]> => {
  const { groq } = getKeys();
  if (!groq) {
    throw new Error('Groq API Key not configured.');
  }

  const prompt = `
    Abaixo está um texto extraído via OCR de uma imagem de um sumário/índice de um livro.
    Sua tarefa é extrair os capítulos e seus respectivos números de página.
    Retorne APENAS um array JSON válido no formato: [ { "capitulo": "Nome do Capitulo", "pagina": numero_da_pagina } ].
    Não inclua explicações, markdown ou qualquer outro texto fora do JSON.
    Se não encontrar páginas, atribua null ou 0 conforme fizer mais sentido, mas prefira números reais se disponíveis.
    
    TEXTO EXTRAÍDO:
    ${rawText}
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groq}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em extração de dados estruturados. Você deve responder APENAS com o JSON solicitado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent JSON output
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Clean up potential markdown blocks from AI response
    const jsonStr = content.replace(/```json|```/g, '').trim();
    
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse Groq response as JSON:', jsonStr);
      throw new Error('Resposta da IA não está em formato JSON válido.', { cause: e });
    }
  } catch (error) {
    console.error('Error in Groq API:', error);
    throw error;
  }
};

/**
 * Complete flow: Image -> OCR -> Structured JSON.
 */
export const generateTocFromImage = async (
  base64Image: string, 
  onProgress: (step: 'ocr' | 'ai' | 'done') => void
): Promise<TocItem[]> => {
  onProgress('ocr');
  const rawText = await extractTextFromImage(base64Image);
  
  onProgress('ai');
  const result = await structureTocWithAi(rawText);
  
  onProgress('done');
  return result;
};
