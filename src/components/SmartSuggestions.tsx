import React, { useMemo } from 'react';
import { useStorage } from '../hooks/useStorage';
import { useIdbStorage } from '../hooks/useIdbStorage';
import { StudyBook, GlossaryTerm, Ponto, Event } from '../types';

interface SmartSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ onSuggestionClick }) => {
  const [books] = useIdbStorage<StudyBook[]>('templo_books', []);
  const [glossary] = useStorage<GlossaryTerm[]>('templo_glossary', []);
  const [pontos] = useStorage<Ponto[]>('templo_pontos', []);
  const [events] = useStorage<Event[]>('templo_events', []);

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
    const list: string[] = [];

    // 1. Liturgia do Dia
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
      // Como não há data no GlossaryTerm, pegamos o último (simulando "adicionado recentemente")
      const latestTerm = glossary[glossary.length - 1];
      list.push(`📖 Fundamento de: ${latestTerm.term} 🕯️`);
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

    // 5. Preenchimento de até 5
    const fallbacks = [
      "⚔️ Quais as ervas para o pai Ogum? 🌿",
      "🥁 O que significa Macumba? 📿",
      "🎶 Me ensine um ponto antigo 👴🏿",
      "👼 Como firmar meu anjo da guarda? 🕯️",
      "🕊️ Quais linhas trabalham na umbanda? 🌟",
    ];

    let i = 0;
    while (list.length < 5 && i < fallbacks.length) {
      if (!list.includes(fallbacks[i])) {
        list.push(fallbacks[i]);
      }
      i++;
    }

    // Garante que retorne exatamente até 5 sugestões
    return list.slice(0, 5);
  }, [books, glossary, pontos, events, dayOfWeek, tomorrowStr]);

  return (
    <>
      {suggestions.map((action, index) => (
         <button 
           key={`${action}-${index}`}
           onClick={() => onSuggestionClick(action)}
           className="shrink-0 px-3 py-2 bg-[#0f172a]/50 hover:bg-[#D4AF37]/10 text-xs font-sans text-white font-medium rounded-full border-[0.5px] border-[#D4AF37]/60 transition-all duration-300 focus:outline-none whitespace-nowrap"
         >
           {action}
         </button>
      ))}
    </>
  );
};
