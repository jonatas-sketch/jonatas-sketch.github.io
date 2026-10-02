// Dados do módulo Música: notas, cores, níveis, jogos e musiquinhas.
// Sem DOM e sem áudio (dá para testar no node).

// Cores das notas, as mesmas da aula de piano. Trocou aqui, muda o módulo todo.
export const CORES_NOTAS = {
  do: '#E53935', // vermelho
  re: '#FB8C00', // laranja
  mi: '#FDD835', // amarelo
  fa: '#43A047', // verde
  sol: '#29B6F6', // azul-claro
  la: '#1E3A8A', // azul
  si: '#8E24AA', // roxo
};

export const TINTA = '#3b2f28'; // cor escura dos textos e da pauta

// ---------- cores: texto legível e tom clarinho ----------
function rgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminancia(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contraste = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
// Texto branco ou escuro: o que tiver mais contraste com o fundo (amarelo e azul-claro ficam com texto escuro)
export const corTexto = (fundo) => (contraste(fundo, '#ffffff') >= contraste(fundo, TINTA) ? '#ffffff' : TINTA);
// Mistura a cor com branco (t = quanto de cor fica)
export function clarear(hex, t) {
  const [r, g, b] = rgb(hex).map((v) => Math.round(255 + (v - 255) * t));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ---------- notas (uma oitava: Dó4 a Dó5) ----------
// degrau = lugar na pauta de clave de sol, contando a partir do Mi da 1ª linha (Mi4 = 0).
const BASE = [
  { id: 'do', nome: 'Dó', midi: 60, degrau: -2 },
  { id: 're', nome: 'Ré', midi: 62, degrau: -1 },
  { id: 'mi', nome: 'Mi', midi: 64, degrau: 0 },
  { id: 'fa', nome: 'Fá', midi: 65, degrau: 1 },
  { id: 'sol', nome: 'Sol', midi: 67, degrau: 2 },
  { id: 'la', nome: 'Lá', midi: 69, degrau: 3 },
  { id: 'si', nome: 'Si', midi: 71, degrau: 4 },
  { id: 'do2', nome: 'Dó', midi: 72, degrau: 5, agudo: true, corDe: 'do' },
];
export const NOTAS = BASE.map((n) => {
  const cor = CORES_NOTAS[n.corDe || n.id];
  return { ...n, cor, corTexto: corTexto(cor), clara: clarear(cor, 0.28) };
});
export const NOTA = Object.fromEntries(NOTAS.map((n) => [n.id, n]));
export const NOTA_POR_MIDI = new Map(NOTAS.map((n) => [n.midi, n]));
export const nomeCompleto = (n) => (n.agudo ? 'Dó agudo' : n.nome);

// Teclas pretas: centro medido em larguras de tecla branca, a partir da esquerda
// (como no piano de verdade: Dó# puxa para a esquerda, Ré# para a direita…)
export const PRETAS = [
  { midi: 61, centro: 0.92 },
  { midi: 63, centro: 2.08 },
  { midi: 66, centro: 3.9 },
  { midi: 68, centro: 5 },
  { midi: 70, centro: 6.1 },
];

// ---------- níveis ----------
export const NIVEIS = [
  { n: 1, notas: ['do', 're', 'mi'], emoji: '🐣', resumo: 'Dó · Ré · Mi' },
  { n: 2, notas: ['do', 're', 'mi', 'fa', 'sol'], emoji: '🖐️', resumo: 'até o Sol' },
  { n: 3, notas: ['do', 're', 'mi', 'fa', 'sol', 'la', 'si', 'do2'], emoji: '🌟', resumo: 'até o Dó agudo' },
];
// Os 3 jogos que abrem o próximo nível (estrelas mínimas em cada um, no nível atual)
export const NUCLEO = ['onde', 'ouvir', 'pauta'];
export const ESTRELAS_PARA_PASSAR = 2;
export const FALA_NOVO_NIVEL = {
  2: 'Uau! Você abriu o nível 2! Agora tem o Fá e o Sol!',
  3: 'Uau! Você abriu o nível 3! Agora tem o Lá, o Si e o Dó agudo!',
};

// ---------- regras dos jogos ----------
export const RODADAS = 10;

// "Onde mora a nota?": as pistas das teclas vão sumindo aos poucos.
// cheio = cor + nome · cor = só a cor · branco = teclas brancas, como no piano de verdade.
// "desafio" = a criança já ganhou 2 estrelas nesse jogo e nesse nível antes.
export function pistasOnde(i, desafio) {
  if (!desafio) return i < 5 ? 'cheio' : 'cor';
  return i < 3 ? 'cheio' : i < 6 ? 'cor' : 'branco';
}
// "A forma da nota": no desafio, as últimas rodadas mostram a nota preta, como nos livros.
export const PAUTA_RODADAS_SEM_COR = 4;

// "Ouvir e achar": primeiro poucas notas bem distantes, depois todas do nível (null = todas).
export const OUVIR_ETAPAS = {
  1: [{ ate: 3, notas: ['do', 'mi'] }, { ate: 10, notas: null }],
  2: [{ ate: 3, notas: ['do', 'sol'] }, { ate: 6, notas: ['do', 'mi', 'sol'] }, { ate: 10, notas: null }],
  3: [{ ate: 3, notas: ['do', 'la'] }, { ate: 6, notas: ['do', 'mi', 'sol', 'do2'] }, { ate: 10, notas: null }],
};
export const etapaOuvir = (nivel, i) => OUVIR_ETAPAS[nivel].find((e) => i < e.ate);

// "Subiu ou desceu?": usa as 8 teclas brancas; o pulo entre as notas vai diminuindo (em semitons).
export const SUBIU_ETAPAS = [
  { ate: 4, min: 7, max: 12 },
  { ate: 7, min: 4, max: 7 },
  { ate: 10, min: 2, max: 5 },
];
export const SUBIU_IGUAIS = 2; // rodadas de "igual" a partir do nível 2

// Sorteia as notas sem repetir até usar todas (e sem a mesma duas vezes seguidas)
export function saco(lista, sortear = (a) => [...a].sort(() => Math.random() - 0.5)) {
  let monte = [];
  let ultima = null;
  return () => {
    if (!monte.length) {
      monte = sortear(lista);
      if (monte.length > 1 && monte[0] === ultima) monte.push(monte.shift());
    }
    ultima = monte.shift();
    return ultima;
  };
}

// ---------- musiquinhas ----------
// Cada frase vira uma linha de bolinhas coloridas. "nota:tempos" (1 = uma batida; sem número = 1).
// Melodias de domínio público, só o título na tela (sem letra).
export const MUSICAS = [
  {
    id: 'escadinha', nivel: 1, titulo: 'Escadinha', emoji: '🪜', bpm: 92,
    frases: ['do re mi re do:4'],
  },
  {
    id: 'sininho', nivel: 1, titulo: 'Sininho', emoji: '🔔', bpm: 96,
    frases: ['mi re do:2 mi re do:2', 'do do re re mi re do:2'],
  },
  {
    id: 'alegria', nivel: 2, titulo: 'Ode à Alegria', emoji: '🎻', bpm: 100,
    frases: [
      'mi mi fa sol sol fa mi re', 'do do re mi mi:1.5 re:.5 re:2',
      'mi mi fa sol sol fa mi re', 'do do re mi re:1.5 do:.5 do:2',
    ],
  },
  {
    id: 'carneirinho', nivel: 2, titulo: 'Maria tinha um carneirinho', emoji: '🐑', bpm: 104,
    frases: ['mi re do re mi mi mi:2', 're re re:2 mi sol sol:2', 'mi re do re mi mi mi mi', 're re mi re do:4'],
  },
  {
    id: 'sino', nivel: 2, titulo: 'Bate o sino', emoji: '🎄', bpm: 112,
    frases: ['mi mi mi:2 mi mi mi:2', 'mi sol do:1.5 re:.5 mi:4'],
  },
  {
    id: 'estrelinha', nivel: 3, titulo: 'Brilha, brilha, estrelinha', emoji: '⭐', bpm: 92,
    frases: [
      'do do sol sol la la sol:2', 'fa fa mi mi re re do:2',
      'sol sol fa fa mi mi re:2', 'sol sol fa fa mi mi re:2',
      'do do sol sol la la sol:2', 'fa fa mi mi re re do:2',
    ],
  },
  {
    id: 'jesus', nivel: 3, titulo: 'Jesus me ama', emoji: '❤️', bpm: 88,
    frases: ['sol mi mi re mi sol sol:2', 'la la do2 la la sol sol:2', 'sol mi mi re mi sol sol:2', 'la la sol do mi re do:2'],
  },
];

// 'mi:1.5' -> { id: 'mi', midi: 64, tempos: 1.5 }
export function lerFrase(frase) {
  return frase.trim().split(/\s+/).map((tok) => {
    const [id, t] = tok.split(':');
    const n = NOTA[id];
    if (!n) throw new Error('nota desconhecida: ' + tok);
    return { id, midi: n.midi, tempos: t ? Number(t) : 1 };
  });
}
export const frasesDa = (musica) => musica.frases.map(lerFrase);
export const notasDa = (musica) => frasesDa(musica).flat();

// ---------- falas ----------
export const FALAS = {
  menu: (nome) => `Oi, ${nome}! Vamos aprender as notas no piano?`,
  trancado: 'Esse nível ainda está trancadinho. Ganhe duas estrelas nos jogos da chave para abrir!',
  livre: 'Toque à vontade! Eu mostro o nome de cada nota.',
  dicaDo: 'O Dó mora à esquerda das duas teclas pretas!',
  onde: 'Vamos achar onde mora cada nota. Olhe o nome e toque na tecla certa!',
  ondeRodada: (n) => (n.agudo ? 'Toque no Dó agudo, o Dó lá da direita!' : `Toque na tecla do ${n.nome}!`),
  ondeCor: 'Agora as teclas estão sem nome. Olhe as cores!',
  ondeBranco: 'Agora é como no piano de verdade, sem cores! Lembre das teclas pretas.',
  ouvir: 'Primeiro eu toco o Dó. Depois, uma nota surpresa. Escute e toque a tecla dela!',
  ouvirMais: 'Agora com mais notas! Escute bem.',
  ouvirDeNovo: 'Escute de novo.',
  subiu1: 'Vou tocar duas notas. Se a segunda for mais aguda, fininha, o passarinho subiu! Se for mais grave, grossa, a tartaruga desceu!',
  subiu2: 'Vou tocar duas notas. Mais aguda, subiu! Mais grave, desceu! Se for a mesma nota, é igual!',
  aprenderPauta: 'Cada nota mora num lugar da pauta. Quanto mais alto na pauta, mais agudo o som! Toque nas notas para ouvir.',
  pauta: 'Olhe onde a nota mora na pauta e toque a tecla certa!',
  pautaPreta: 'Agora a nota está pretinha, como nos livros de música. Olhe o lugar dela!',
  outroDo: 'É um Dó, sim! Mas é o outro Dó. Olhe de novo!',
  musicas: 'Escolha uma música para tocar!',
  musica: 'Siga as cores! Toque a tecla que está brilhando.',
  musicaFim: 'Você tocou a música toda!',
};

// Todas as frases fixas (para gravar com a voz da Lila e pôr em /audio/voz)
export function todasAsFalas(nome = 'Stella') {
  const lista = [];
  for (const v of Object.values(FALAS)) {
    if (typeof v === 'string') lista.push(v);
  }
  lista.push(FALAS.menu(nome));
  for (const n of NOTAS) lista.push(FALAS.ondeRodada(n));
  lista.push(...Object.values(FALA_NOVO_NIVEL));
  return [...new Set(lista)];
}
