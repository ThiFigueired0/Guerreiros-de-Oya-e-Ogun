import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/api/mini-chefinho', async (req, res) => {
  const { messages, locationStr, userName, projectStateSummary, currentPage, userMetadata, userId } = req.body;
  
  if (!messages) {
    return res.status(400).json({ error: 'messages is required' });
  }

  // 1. Context Gathering using Supabase RAG
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:3000';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let backendStateSummary = '';
  if (userId) {
    let supabaseData = `Perfil: ${JSON.stringify(userMetadata || {})}\n`;
    const now = new Date().toISOString();
    
    // Simplistic RAG for context: checking recent/all items for context
    const promises = [
      supabase.from('eventos').select('title, data_evento').eq('user_id', userId).order('data_evento', { ascending: true }).limit(50),
      supabase.from('estoques').select('name, in_stock, classification').eq('user_id', userId).limit(100),
      supabase.from('banhos').select('title, category, herbs').eq('user_id', userId).limit(200),
      supabase.from('pontos').select('title, type, isFavorite').eq('user_id', userId).limit(50),
      supabase.from('financeiro').select('type, amount, description').eq('user_id', userId).limit(50),
      supabase.from('oferendas').select('title, entity').eq('user_id', userId).limit(30),
      supabase.from('bichos').select('name, quantity').eq('user_id', userId).limit(30),
      supabase.from('velas').select('color, quantity').eq('user_id', userId).limit(30)
    ];

    try {
      const results = await Promise.all(promises);
      let idx = 0;
      if (results[idx]?.data?.length) supabaseData += `Agenda: ${results[idx++].data?.map((x:any) => `${x.data_evento}: ${x.title}`).join(' | ')}\n`; else idx++;
      if (results[idx]?.data?.length || results[idx+1]?.data?.length) {
        const est = results[idx++].data;
        if (est?.length) supabaseData += `Ervas em Estoque: ${est.map((x:any) => `${x.name} (${x.in_stock ? 'Tem' : 'Falta'})`).join(', ')}\n`;
        const bn = results[idx++].data;
        if (bn?.length) supabaseData += `Banhos: ${bn.map((x:any) => `${x.title} (Cat: ${x.category}) -> Ervas: ${x.herbs?.replace(/\\n/g, ', ')}`).join(' | ')}\n`;
      } else { idx+=2; }
      const pt = results[idx++].data;
      if (pt?.length) supabaseData += `Pontos: ${pt.map((x:any) => `${x.title}`).join(', ')}\n`;
      const fn = results[idx++].data;
      if (fn?.length) supabaseData += `Financeiro: ${JSON.stringify(fn)}\n`;
      const of = results[idx++].data;
      if (of?.length) supabaseData += `Oferendas: ${JSON.stringify(of)}\n`;
      const bi = results[idx++].data;
      if (bi?.length) supabaseData += `Bichos: ${JSON.stringify(bi)}\n`;
      const ve = results[idx++].data;
      if (ve?.length) supabaseData += `Velas: ${JSON.stringify(ve)}\n`;
      
      backendStateSummary = `[Supabase RAG]\n${supabaseData}`;
    } catch (e) {
      console.error("Erro no RAG:", e);
    }
  }

  const fullStateSummary = `${backendStateSummary}\n\n${projectStateSummary || ''}`;

  // 2. Formatting Context and Prompt
  const currentDateTime = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  let systemReport = `Usuário Logado: ${userName || userMetadata?.full_name || userMetadata?.name || 'Não identificado'}\n`;
  systemReport += `Página Atual: ${currentPage || 'Não informada'}\n`;
  systemReport += `Data/Hora Local: ${currentDateTime}\n`;
  systemReport += `Localização do Navegador: ${locationStr}\n\n`;
  systemReport += `Resumo do Banco e Local: \n${fullStateSummary || 'Nenhum dado cadastrado ou carregado.'}\n\n`;

  let chatMessages = messages.filter((m: any) => m.role !== 'system');
  const totalChars = chatMessages.reduce((acc: number, msg: any) => acc + msg.content.length, 0);
  
  if (chatMessages.length > 4 || totalChars > 8000) {
    chatMessages = chatMessages.slice(-4);
  }

  let finalMessages = [...chatMessages];

  finalMessages.unshift({
      role: 'system',
      content: `Você é o "Mini Chefinho", um assistente de inteligência artificial dedicado, especialista e profundo conhecedor de conhecimentos espirituais, com foco em Umbanda, Quimbanda e Candomblé. Você domina os fundamentos dessas religiões, a história, o respeito aos mistérios, e é um verdadeiro mestre no conhecimento de ervas (banhos, defumações, firmezas) e rituais.

Sua missão principal é guiar, ensinar e tirar dúvidas dos usuários sobre esses caminhos espirituais com propriedade e respeito.

DIRETRIZES DE ESCOPO:
1. Seu foco é espiritual.

DIRETRIZES DE TOM DE VOZ E COMUNICAÇÃO:
2. Comunicação Humana, Autêntica e Espontânea.
3. PROIBIÇÃO DE REPETIÇÕES E BORDÕES.
4. Uso Equilibrado de Expressões.
5. Ortografia Perfeita.
6. Uso de Emojis: Adicione emojis sempre que possível de acordo com a temática, utilizando no máximo 2 emojis por balão.

DIRETRIZES DE SUGESTÕES CONTEXTUAIS (FOLLOW-UP):
7. Ao final de cada resposta, gere de 3 a 4 alternativas de perguntas de continuidade dentro da tag <sugestoes>.
8. FORMATO DE SAÍDA: Envie sempre as perguntas no final da mensagem estruturadas dentro de uma tag XML chamada <sugestoes>, com cada pergunta separada por quebra de linha.

DIRETRIZES DE TRATAMENTO E GERAÇÃO DE MÍDIA:
12. Destaque sempre em **negrito** os nomes de Entidades, Orixás e Divindades na sua resposta (ex: **Exu**, **Iemanjá**, **Zé Pelintra**). O sistema aplicará uma cor especial dourada nessas palavras.

DIRETRIZES DE NAVEGAÇÃO:
14. NAVEGAÇÃO AUTÔNOMA: Sempre que o usuário pedir para mudar de página (ex: "abra minha lista de banhos"), você DEVE gerar uma tag especial <navigate path="/caminho"/> no final da sua resposta.
Caminhos: /home, /calendar, /herbs, /trab, /points, /studies, /notes, /finance, /settings.

[RELATÓRIO DO SISTEMA DE DADOS CADASTRADOS PELO USUÁRIO LIGADO DIRETAMENTE AO BANCO SUPABASE (RAG interno)]
${systemReport}`
  });

  // 3. Failover Loop
  const targetModel = 'llama-3.3-70b-versatile';
  const apiKey = process.env.VITE_GROQ_API_KEY;
  const openRouterKey = process.env.VITE_OPENROUTER_API_KEY;

  const providers: any[] = [];
  
  if (apiKey) {
    providers.push({ name: 'Groq (Primário)', endpoint: 'https://api.groq.com/openai/v1/chat/completions', key: apiKey, model: targetModel });
  }
  if (openRouterKey) {
    providers.push({ name: 'OpenRouter (Llama 3.3 70B)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'meta-llama/llama-3.3-70b-instruct' });
    providers.push({ name: 'OpenRouter (Llama 3.1 8B)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'meta-llama/llama-3.1-8b-instruct:free' });
    providers.push({ name: 'OpenRouter (Gemini 2.0 Flash Lite)', endpoint: 'https://openrouter.ai/api/v1/chat/completions', key: openRouterKey, model: 'google/gemini-2.0-flash-lite-preview-02-05:free' });
  }
  if (apiKey) {
    providers.push({ name: 'Groq (Fallback 8B)', endpoint: 'https://api.groq.com/openai/v1/chat/completions', key: apiKey, model: 'llama-3.1-8b-instant' });
  }

  let lastError: Error | null = null;
  const isStreamRequest = req.headers.accept === 'text/event-stream';

  if (isStreamRequest) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  }

  for (const provider of providers) {
    try {
      console.log(`[Failover Loop] Tentando provedor: ${provider.name}...`);
      const resApi = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key}`,
          'HTTP-Referer': 'https://templo.com',
          'X-Title': 'Mini Chefinho'
        },
        body: JSON.stringify({
          model: provider.model,
          messages: finalMessages,
          temperature: 0.7,
          max_tokens: 1024,
          stream: isStreamRequest
        })
      });

      if (!resApi.ok) {
        throw new Error(`[${provider.name} Error] ${resApi.status} - ${await resApi.text()}`);
      }

      if (isStreamRequest && resApi.body) {
        const reader = resApi.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          res.write(chunk);
        }
        res.end();
        return; // done
      } else {
        const responseData = await resApi.json();
        return res.json({ reply: responseData.choices?.[0]?.message?.content || 'Sem resposta.' });
      }
    } catch (err: any) {
      console.warn(`[Failover Loop] Falha no provedor ${provider.name}:`, err.message || err);
      lastError = err;
    }
  }

  if (isStreamRequest) {
    res.write('data: [DONE]\n\n');
    res.end();
  } else {
    res.status(500).json({ error: 'Todos os provedores falharam.', details: lastError?.message });
  }
});

app.post('/api/daily-knowledge', async (req, res) => {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `Você é um historiador e doutrinador de Umbanda e Candomblé. \nGere uma pílula de conhecimento (um Itã, um Fundamento ou uma Tradição Histórica).\nO tom deve ser educativo e respeitoso.\nResponda APENAS em JSON no formato:\n{\n  "title": "Título Curto",\n  "content": "Conteúdo educativo detalhado (até 450 caracteres)",\n  "category": "Itã | Fundamento | Tradição"\n}` },
          { role: 'user', content: 'Gere o conhecimento estruturado de hoje.' }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Falha na API' });
    const data = await response.json();
    return res.json({ reply: data.choices[0]?.message?.content || "" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/analyze-image', async (req, res) => {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  const { prompt, base64Image } = req.body;
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: base64Image } }] }],
        temperature: 0.5,
        max_tokens: 300
      })
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Falha na API' });
    const data = await response.json();
    return res.json({ reply: data.choices[0]?.message?.content || '' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-speech', async (req, res) => {
  const apiKey = process.env.VITE_HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  const { cleanText } = req.body;
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/hexgrad/Kokoro-82M', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ inputs: cleanText, parameters: { voice: 'pm_alex', lang: 'p', speed: 0.92 } }),
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Falha na API HF' });
    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/webm');
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/transcribe-audio', express.raw({ type: ['audio/webm', 'audio/*'], limit: '50mb' }), async (req, res) => {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  
  if (!req.body || !Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'No audio data' });
  }

  const formData = new FormData();
  formData.append('file', new Blob([req.body], { type: 'audio/webm' }), 'audio.webm');
  formData.append('model', 'whisper-large-v3');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: formData,
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Falha na API transcrição' });
    const data = await response.json();
    return res.json({ text: data.text || '' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-toc', async (req, res) => {
  const apiKey = process.env.VITE_GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  const { text } = req.body;
  
  const prompt = `Abaixo está um texto copiado de um sumário (índice), que pode estar muito desformatado. Identifique os títulos/capítulos e suas respectivas páginas (ex: "Introdução....5", "1. Introdução - 5" ou apenas "Introdução 5"). Organize os dados extraídos em um array JSON com os campos "capitulo" (string) e "pagina" (number). Aja inteligentemente e filtre sujeiras. Retorne estritamente o JSON válido e NADA MAIS, sem introduções ou explicações.\n\nTexto do Sumário:\n${text}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1024
      })
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Erro ao processar texto com Groq API.' });
    const data = await response.json();
    return res.json({ reply: data.choices?.[0]?.message?.content || '[]' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
