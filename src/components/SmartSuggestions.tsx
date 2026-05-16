import React, { useMemo, useState } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { StudyBook, GlossaryTerm, Ponto, Event } from '../types';
import { RefreshCw } from 'lucide-react';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

// Fisher-Yates array shuffle function
const shuffleArray = <T,>(array: T[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ onSuggestionClick }) => {
  const [books] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [glossary] = useStorage<GlossaryTerm[]>('templo_glossary', []);
  const [pontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [events] = useStorage<Event[]>('templo_events', []);
  
  const [refreshCount, setRefreshCount] = useState(0);

  // Lógica para dia da semana
  const dayOfWeek = new Date().getDay(); // 0 = Dom, 1 = Seg...
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const orixasByDay = [
    ['Nanã', 'Pretos Velhos'], // Domingo
    ['Exu', 'Omolu', 'Obaluaê'], // Segunda
    ['Ogum', 'Ogun'], // Terça
    ['Xangô', 'Iansã', 'Obá'], // Quarta
    ['Oxóssi', 'Logun Edé'], // Quinta
    ['Oxalá'], // Sexta
    ['Iemanjá', 'Oxum'], // Sábado
  ];

  const suggestions = useMemo(() => {
    let list: string[] = [];

    // 1. Liturgia do Dia (somente na primeira renderização, sem o refresh agressivo ou pode misturar com o resto)
    if (dayOfWeek === 3) {
      list.push("🌿 Composição do Banho de Descarrego 💧");
    } else if (dayOfWeek === 4) {
      list.push("🌿 Composição do Banho de Desenvolvimento ✨");
    } else if (dayOfWeek === 5) {
      list.push("🕊️ Curiosidades: Regência de Oxalá na Sexta 🤍");
    }

    // 4. Ação Dinâmica - Eventos para amanhã
    const eventTomorrow = events.find(e => e.date === tomorrowStr);
    if (eventTomorrow) {
      list.push(`📝 Checklist de fundamentos para amanhã 📅`);
    }

    // 2. Novidade no Acervo
    if (books && books.length > 0) {
      const sortedBooks = [...books].sort((a, b) => b.uploadDate - a.uploadDate);
      const latestBook = sortedBooks[0];
      // Verifica se é recente (últimos 7 dias)
      if (latestBook.uploadDate > Date.now() - 7 * 24 * 60 * 60 * 1000) {
        list.push(`📚 Resumo de: ${latestBook.name} ✨`);
      }
    }

    if (glossary && glossary.length > 0) {
      const randomTerm = glossary[Math.floor(Math.random() * glossary.length)];
      list.push(`📖 Fundamento de: ${randomTerm.term} 🕯️`);
    }

    // 3. Engajamento com Mídia - Pontos
    if (pontos && pontos.length > 0) {
      const orixasDoDia = orixasByDay[dayOfWeek];
      const pontosDia = pontos.filter(p => {
        const ent = p.entity.toLowerCase();
        return orixasDoDia.some(o => ent.includes(o.toLowerCase()));
      });

      if (pontosDia.length > 0) {
         const randomPonto = pontosDia[Math.floor(Math.random() * pontosDia.length)];
         list.push(`🎵 Ouvir ponto de: ${randomPonto.entity} 🥁`);
      } else {
         const randomPonto = pontos[Math.floor(Math.random() * pontos.length)];
         list.push(`🎵 Ouvir ponto de: ${randomPonto.entity} 🥁`);
      }
    }

    // Ao invés de dependermos 100% de coisas fixas por dia, adicionamos um pool vasto de perguntas curadas
    const fallbacks = [
      "⚔️ Quais as ervas para o pai Ogum? 🌿",
      "🥁 O que significa Macumba? 📿",
      "🎶 Me ensine um ponto antigo 👴🏿",
      "👼 Como firmar meu anjo da guarda? 🕯️",
      "🕊️ Quais linhas trabalham na umbanda? 🌟",
      "💎 Qual a diferença entre pedras quentes e frias? 🪨",
      "🌊 Que banho posso tomar na sexta-feira? 🛀",
      "🌟 Me conte uma curiosidade sobre Exu 🔱",
      "🪴 Como montar um altar em casa? 🕊️",
      "🕰️ Quando a Umbanda foi fundada? 📜",
      "🌹 O que simboliza a coroa da Pombagira? 💃",
      "⚖️ O que é a lei de causa e efeito? 🌀",
      "🌿 Qual a diferença de banho de ori e descarrego? 💦",
    ];

    // Adiciona items do fallback garantindo randomização forte a cada refresh
    list = [...list, ...shuffleArray(fallbacks)];

    // Precisamos embaralhar toda a lista para que a cada refresh os itens mudem de ordem
    const shuffledList = shuffleArray(Array.from(new Set(list)));

    // Garante que retorne exatamente até 5 sugestões
    return shuffledList.slice(0, 5);
  }, [books, glossary, pontos, events, dayOfWeek, tomorrowStr, refreshCount]);

  return (
    <div className="flex flex-col w-full relative group/suggestions">
      <div className="flex justify-between items-center w-full px-1 mb-2">
        <span className="text-[12px] font-medium text-white/50 tracking-wide font-sans">
          Sugestões rápidas
        </span>
        <button
          onClick={() => setRefreshCount(prev => prev + 1)}
          className="text-white/40 hover:text-[#D4AF37] p-1 rounded-full transition-all flex items-center justify-center opacity-0 group-hover/suggestions:opacity-100 focus:opacity-100"
          title="Gerar novas sugestões"
        >
          <RefreshCw className="w-[14px] h-[14px]" />
        </button>
      </div>

      <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-hide px-1 snap-x">
        {suggestions.map((action, index) => (
           <button 
             key={`${action}-${index}`}
             onClick={() => onSuggestionClick(action)}
             className="shrink-0 w-[200px] sm:w-[180px] p-2.5 bg-[#0f172a]/50 hover:bg-[#0f172a] text-[13px] font-sans text-white/90 font-medium rounded-[14px] border-[0.5px] border-[#D4AF37]/30 hover:border-[#D4AF37]/80 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all duration-300 focus:outline-none whitespace-normal text-left leading-normal snap-start"
           >
             {action}
           </button>
        ))}
      </div>
    </div>
  );
};
