

import Tesseract from 'tesseract.js';

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
 * Uses Tesseract.js (OCR) to read an image text and Groq to structure it into a Table of Contents.
 * @param base64Image Image in base64 format (handles both with and without data prefix).
 */
export const generateTocFromImage = async (
  base64Image: string, 
  onProgress: (step: 'ai' | 'done') => void
): Promise<TocItem[]> => {
  const apiKey = getGroqKey();
  
  if (!apiKey) {
    console.warn('VITE_GROQ_API_KEY is empty or undefined. Attempting call anyway...');
  }

  // Ensure image has correctly formatted data prefix for Tesseract
  let imageUrl = base64Image;
  if (!imageUrl.startsWith('data:image')) {
    imageUrl = `data:image/jpeg;base64,${base64Image}`;
  }

  onProgress('ai');

  try {
    // Step 1: Local OCR using Tesseract.js
    console.log('Iniciando OCR local com Tesseract...');
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'por', {
      logger: m => console.log('Tesseract progress:', m)
    });
    
    console.log('Texto extraído:', text);

    if (!text || text.trim().length === 0) {
      throw new Error("Nenhum texto pôde ser lido da imagem. Tente uma foto mais nítida.");
    }

    // Step 2: Structure Text using Groq's text model
    console.log('Enviando texto extraído para a Groq...');
    const prompt = `Abaixo está um texto extraído de um sumário. Organize-o em um array JSON com os campos capitulo (string) e pagina (number). Retorne apenas o JSON.\n\nTexto do Sumário:\n${text}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
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
      throw new Error('A IA não retornou um JSON válido. Verifique se o sumário estava legível.', { cause: e });
    }
  } catch (error) {
    console.error('Error processing ToC:', error);
    throw error;
  }
};
