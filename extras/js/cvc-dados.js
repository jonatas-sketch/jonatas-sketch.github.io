// Palavras CVC (consoante, vogal, consoante) para ler e escrever em inglês.
// Só com as letras da folha da escola (Floppy's Phonics, Level 1+):
//   s a t p · i n m d · g o c k · ck e u r · h b f ff · l ll le ss   (sem j, v, w, x, y, z, q)
// O som puro de cada letra fica com o app que a professora indicou: aqui a Lila só fala
// palavras inteiras (nada de letra solta).

// 'cat 🐱' → { w: 'cat', e: '🐱' }
const ps = (...itens) => itens.map((t) => {
  const i = t.lastIndexOf(' ');
  return { w: t.slice(0, i), e: t.slice(i + 1) };
});

// Separa a palavra em grafemas: "duck" → d · u · ck (ck, ff, ll, ss valem uma peça só)
export function grafemas(w) {
  const fim = w.match(/(ck|ff|ll|ss)$/);
  const corpo = fim ? w.slice(0, -2) : w;
  return [...corpo, ...(fim ? [fim[1]] : [])];
}

export const UNIDADES = [
  { id: 'a', titulo: 'Words with a', emoji: '🐱', cor: '#E07A4C',
    palavras: ps('cat 🐱', 'hat 🎩', 'bat 🦇', 'rat 🐀', 'map 🗺️', 'cap 🧢', 'pan 🍳', 'can 🥫', 'fan 🪭', 'bag 👜', 'ram 🐏', 'tap 🚰', 'sad 😢', 'nap 😴', 'dad 👨', 'ham 🍖') },
  { id: 'i', titulo: 'Words with i', emoji: '🐷', cor: '#D69A2D',
    palavras: ps('pig 🐷', 'pin 📌', 'bin 🗑️', 'lip 👄', 'kid 🧒', 'dig ⛏️', 'sit 🪑', 'sip 🥤') },
  { id: 'o', titulo: 'Words with o', emoji: '🐶', cor: '#5E9A57',
    palavras: ps('dog 🐶', 'pot 🍲', 'mop 🧹', 'log 🪵', 'dot ⚫', 'rod 🎣', 'hot 🥵', 'fog 🌫️', 'hog 🐗') },
  { id: 'u', titulo: 'Words with u', emoji: '☀️', cor: '#3E92CC',
    palavras: ps('sun ☀️', 'cup ☕', 'bug 🐛', 'bus 🚌', 'nut 🥜', 'hut 🛖', 'tub 🛁', 'run 🏃', 'hug 🫂', 'cut ✂️') },
  { id: 'e', titulo: 'Words with e', emoji: '🛏️', cor: '#8E72D0',
    palavras: ps('bed 🛏️', 'pen 🖊️', 'hen 🐔', 'net 🥅', 'red 🔴', 'ten 🔟', 'leg 🦵') },
  { id: 'fim', titulo: 'Words with ck ff ll ss', emoji: '🦆', cor: '#D27BA0',
    palavras: ps('duck 🦆', 'sock 🧦', 'rock 🪨', 'lock 🔒', 'puff 💨', 'hill ⛰️', 'bell 🔔', 'doll 🪆', 'kiss 💋', 'pill 💊') },
];
// unidade final: todas misturadas
UNIDADES.push({ id: 'mix', titulo: 'All the words', emoji: '🌈', cor: '#2BAE9C', palavras: UNIDADES.flatMap((u) => u.palavras) });
export const unidade = (id) => UNIDADES.find((u) => u.id === id);

// Figuras que podem confundir entre si: nunca aparecem juntas como opção
export const CONFLITOS = [['hat', 'cap'], ['dad', 'kid'], ['pot', 'pan'], ['bed', 'nap'], ['rock', 'hill'], ['can', 'bin'], ['hug', 'kiss'], ['sip', 'cup'], ['ham', 'pig'], ['hog', 'pig']];
export const conflitam = (a, b) => CONFLITOS.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

// Palavras reais e comuns (sem figura) para as opções parecidas do "Qual palavra?"
export const DICIONARIO = `
bad bag ban bat cab can cap cat dad dam fan fat gap had ham hat lap mad man map mat nap pad pan pat rag ram ran rap rat sad sat tag tan tap
bib bid big bin bit dig dip fig fin fit hid him hip hit kid kit lid lip lit mid nip pig pin pit rib rip sip sit tin tip
cod cog cot dog dot fog got hog hop hot log lot mop nod not pod pop pot rod rot sob top
bud bug bun bus but cub cup cut dug fun gum hug hut mud mug nut pup rub rug run sub sum sun tub tug
bed beg bet den fed get hen led leg let men met net peg pen pet red set ten
back deck duck kick lick lock luck neck pack pick rock sack sick sock tuck puff cuff huff
bell doll fell fill hill mill pill sell tell till kiss less mess miss moss pass toss boss fuss
`.trim().split(/\s+/);

// palavras que diferem da alvo em uma peça só (mesmo tamanho)
export function parecidas(w) {
  const g = grafemas(w);
  return DICIONARIO.filter((d) => {
    if (d === w) return false;
    const h = grafemas(d);
    if (h.length !== g.length) return false;
    return h.filter((x, i) => x !== g[i]).length === 1;
  });
}

// Letras da escola usadas nas peças de montar (para as peças "a mais")
export const LETRAS_ESCOLA = 'satpinmdgockeurhbfl'.split('');

import { NOME_EN as NOMES_EN } from './letras-dados.js';

// Famílias de palavras (o final fica igual, só a primeira letrinha muda): o jeito de ensinar
// o padrão CVC só com palavras inteiras
export const FAMILIAS_CVC = {
  a: [['at', ['cat', 'hat', 'bat', 'rat']], ['ap', ['map', 'cap', 'tap', 'nap']], ['an', ['pan', 'can', 'fan']], ['ad', ['dad', 'sad']]],
  i: [['in', ['pin', 'bin']], ['ig', ['pig', 'dig']], ['ip', ['lip', 'sip']]],
  o: [['og', ['dog', 'log', 'fog', 'hog']], ['ot', ['pot', 'dot', 'hot']]],
  u: [['ut', ['nut', 'hut', 'cut']], ['ug', ['bug', 'hug']], ['un', ['sun', 'run']]],
  e: [['en', ['pen', 'hen', 'ten']], ['ed', ['bed', 'red']]],
  fim: [['ock', ['sock', 'rock', 'lock']], ['ill', ['hill', 'pill']]],
};
export const VOGAIS = [['a', 'apple', '🍎'], ['e', 'egg', '🥚'], ['i', 'insect', '🐞'], ['o', 'octopus', '🐙'], ['u', 'umbrella', '☂️']];
export const ehVogal = (g) => 'aeiou'.includes(g);
export const figuraDe = (w) => UNIDADES.find((u) => u.id === 'mix').palavras.find((p) => p.w === w);

// Tudo em inglês, do jeito da professora (frases curtas, sem "consoante/vogal")
export const FALAS = {
  menu: "Let's read words!",
  sons: 'Listen to each letter sound. Tap a letter!',
  sonsTodos: "Let's listen to all the sounds!",
  sonsFim: 'Well done! You heard all the sounds!',
  abc: 'This is the alphabet. Tap a letter to hear its name!',
  abcTodos: "Let's say the alphabet!",
  abcFim: 'Well done! You know the alphabet!',
  continuar: "Let's keep going!",
  fim: "You finished all the words! Let's practise again.",
  intro1: "This is a cat. Let's sound it out!",
  intro2: 'These are the vowels. Tap them!',
  intro3: "Let's sound out more words. Tap them!",
  familia: 'Listen! We change the first letter, and we get a new word!',
  familiaToque: 'Your turn! Tap a letter.',
  familiaFim: 'Well done! You found all the words!',
  completar: 'Listen. Which letter is missing?',
  montar: 'Listen and build the word!',
  ler: 'Read the word. Find the picture!',
  qual: 'Listen. Which word is it?',
  escrever: "Let's write the word! Start at the green dot.",
  escreverSozinha: 'Now write it on your own!',
  escreverPalavra: 'Write the word on the lines.',
  respeitou: 'Great writing!',
  trancada: 'Finish the one before first!',
};
export const ELOGIOS_EN = ['Well done!', 'Great job!', 'Brilliant!', 'Fantastic!', 'Super reading!', 'Well done, Stella!'];
export const TENTE_EN = ['Try again!', 'Listen again!', 'Oops! Have another go.'];
// avisos da escrita na pauta, com os nomes que a escola usa (Giraffe, Tortoise, Monkey letters)
export const ESCRITA_EN = {
  bolinha: 'Start at the green dot!',
  continueBolinha: 'Carry on from the green dot!',
  saiu: 'Oops! Stay on the path. Back to the green dot.',
  escrevaPrimeiro: 'Write the word first!',
  faltouSubir: 'Make it taller! Giraffe letters touch the top line.',
  palavraFaltouSubir: 'Make it taller! Giraffe letters touch the top line.',
  subiuDemais: () => 'Too tall! Tortoise letters stay in the middle.',
  palavraSubiu: 'Too tall! Tortoise letters stay in the middle.',
  faltouDescer: 'Go down more! Monkey letters hang below the line.',
  palavraFaltouDescer: 'Go down more! Monkey letters hang below the line.',
  afundou: 'Oops, too low! Only monkey letters go below the line.',
  palavraAfundou: 'Oops, too low! Only monkey letters go below the line.',
  flutuando: 'Sit it on the line!',
};

// Trilha: primeiro aprender (famílias, completar), depois praticar (montar, ler, qual, escrever)
export const TIPOS = [
  { tipo: 'aprender', titulo: 'Word families', emoji: '📖' },
  { tipo: 'completar', titulo: 'Missing letter', emoji: '🧩' },
  { tipo: 'montar', titulo: 'Listen and build', emoji: '🔤' },
  { tipo: 'ler', titulo: 'Read and find', emoji: '👀' },
  { tipo: 'qual', titulo: 'Which word?', emoji: '👂' },
  { tipo: 'escrever', titulo: 'Write it', emoji: '✏️' },
];
export const ETAPAS = [
  { tipo: 'sons', titulo: 'Letter sounds', emoji: '🔊', unidade: 'a', fase: '⭐ Start here', chave: 'sons' },
  { tipo: 'intro', titulo: 'Sound it out!', emoji: '⭐', unidade: 'a', fase: '⭐ Start here', chave: 'intro' },
  ...UNIDADES.flatMap((u) => TIPOS
    .filter((t) => u.id !== 'mix' || !['aprender', 'completar'].includes(t.tipo))
    .map((t) => ({ ...t, unidade: u.id, fase: `${u.emoji} ${u.titulo}`, chave: `${u.id}-${t.tipo}` }))),
];

// Todas as falas deste módulo: [texto, idioma]
// o alfabeto: o NOME de cada letra (a escola é britânica: "zed")
export { NOME_EN } from './letras-dados.js';
export const ALFABETO = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function todasAsFalas() {
  const frases = [
    ...Object.values(NOMES_EN),
    ...Object.values(FALAS), ...ELOGIOS_EN, ...TENTE_EN,
    ...Object.values(ESCRITA_EN).map((v) => (typeof v === 'function' ? v() : v)),
  ];
  const palavras = [...UNIDADES.flatMap((u) => u.palavras.map((p) => p.w)), ...DICIONARIO, ...VOGAIS.map((v) => v[1])];
  return [...new Set([...frases, ...palavras])].map((t) => [t, 'en']);
}
