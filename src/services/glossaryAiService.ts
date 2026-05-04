import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateGlossaryTerm(term: string) {
  try {
    const model = getAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Você é um especialista em religiões de matriz africana (Umbanda e Candomblé). 
    Gere uma definição concisa e respeitosa para o termo: "${term}".
    Também classifique-o em uma das seguintes categorias:
    - Orixás e Divindades
    - Entidades e Linhas
    - Fundamentos e Ritos
    - Ervas e Elementos
    - Tradição e História
    - Geral e Espiritualidade

    Responda APENAS em formato JSON:
    {
      "definition": "...",
      "category": "..."
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as { definition: string, category: string };
  } catch (error) {
    console.error("Erro ao gerar termo:", error);
    throw error;
  }
}

export async function refineGlossaryDefinition(term: string, currentDefinition: string) {
  try {
    const model = getAI().getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Você é um especialista em religiões de matriz africana. 
    O usuário forneceu uma definição para o termo "${term}": "${currentDefinition}".
    
    Sua tarefa é sugerir uma melhoria ou um texto mais completo, mantendo a essência do que o usuário escreveu. 
    Lembre-se que definições podem variar entre casas de axé, então sua sugestão deve ser educada e complementar.
    
    Responda APENAS com a nova definição sugerida, sem comentários adicionais.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao refinar definição:", error);
    throw error;
  }
}
