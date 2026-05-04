export interface DidYouKnowItem {
  id: string;
  title: string;
  content: string;
  category: 'Fundamento' | 'Itã' | 'Tradição' | 'Curiosidade' | 'Ervas e Elementos' | 'Mensagem';
}

export const DID_YOU_KNOW_DATA: DidYouKnowItem[] = [
  {
    id: '1',
    title: 'O Opaxoró de Oxalá',
    content: 'O Opaxoró é o cajado de Oxalá que representa a criação do mundo. Cada um de seus anéis simboliza um nível da criação e a interligação entre o Orun (mundo espiritual) e o Aiyé (mundo físico).',
    category: 'Fundamento'
  },
  {
    id: '2',
    title: 'A Divisão do Dia',
    content: 'Para a espiritualidade, o dia começa ao pôr do sol. É por isso que muitos rituais e preceitos começam na véspera da data festiva.',
    category: 'Tradição'
  },
  {
    id: '3',
    title: 'Itã de Ogum e as Ferramentas',
    content: 'Diz o itã que Ogum foi quem ensinou aos homens a forjar o ferro. Antes disso, as colheitas eram difíceis e as defesas fracas. Ao compartilhar esse segredo, Ogum se tornou o senhor da tecnologia e do progresso.',
    category: 'Itã'
  },
  {
    id: '4',
    title: 'O Significado do Branco',
    content: 'O branco na Umbanda não é apenas uma cor, mas uma vibração de pureza e neutralidade. Ele serve como um anteparo que reflete energias negativas e permite que a luz dos guias brilhe com mais intensidade.',
    category: 'Fundamento'
  },
  {
    id: '5',
    title: 'A Saudação "Saravá"',
    content: 'A palavra "Saravá" vem do banto e significa "saudar a força que movimenta a natureza". É um desejo de axé e luz para quem recebe a saudação.',
    category: 'Curiosidade'
  },
  {
    id: '6',
    title: 'A Árvore Iroko',
    content: 'Iroko é o Orixá que habita a árvore Gameleira Branca. Ele é o senhor do tempo e da ancestralidade. Dizem que quem planta uma Gameleira planta uma conexão eterna com os antepassados.',
    category: 'Itã'
  },
  {
    id: '7',
    title: 'Os Búzios e o Destino',
    content: 'O jogo de búzios (Merindilogun) é uma forma de comunicação direta com as divindades. Através da queda das conchas, os Orixás revelam os caminhos e as soluções para os problemas da vida.',
    category: 'Fundamento'
  },
  {
    id: '8',
    title: 'O Azeite de Dendê',
    content: 'O dendê é um elemento de fogo e movimento. Ele é usado para "aquecer" o axé e dar dinamismo aos rituais, sendo indispensável para Orixás como Ogum e Iansã.',
    category: 'Ervas e Elementos'
  },
  {
    id: '9',
    title: 'O Caboclo das Sete Encruzilhadas',
    content: 'Em 15 de novembro de 1908, através do médium Zélio Fernandino de Moraes, manifestou-se o Caboclo das Sete Encruzilhadas, anunciando a fundação da Umbanda como uma religião de caridade.',
    category: 'Tradição'
  },
  {
    id: '10',
    title: 'As Sete Linhas',
    content: 'As Sete Linhas da Umbanda representam as sete vibrações universais de Deus. Embora as nomenclaturas variem entre casas, elas geralmente englobam: Fé, Amor, Conhecimento, Justiça, Lei, Evolução e Geração.',
    category: 'Fundamento'
  }
];
