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
  { id: 'a', titulo: 'Palavras com a', emoji: '🐱', cor: '#E07A4C',
    palavras: ps('cat 🐱', 'hat 🎩', 'bat 🦇', 'rat 🐀', 'map 🗺️', 'cap 🧢', 'pan 🍳', 'can 🥫', 'fan 🪭', 'bag 👜', 'ram 🐏', 'tap 🚰', 'sad 😢', 'nap 😴', 'dad 👨') },
  { id: 'i', titulo: 'Palavras com i', emoji: '🐷', cor: '#D69A2D',
    palavras: ps('pig 🐷', 'pin 📌', 'bin 🗑️', 'lip 👄', 'kid 🧒', 'dig ⛏️', 'sit 🪑') },
  { id: 'o', titulo: 'Palavras com o', emoji: '🐶', cor: '#5E9A57',
    palavras: ps('dog 🐶', 'pot 🍲', 'mop 🧹', 'log 🪵', 'dot ⚫', 'rod 🎣', 'hot 🥵', 'fog 🌫️', 'hog 🐗') },
  { id: 'u', titulo: 'Palavras com u', emoji: '☀️', cor: '#3E92CC',
    palavras: ps('sun ☀️', 'cup ☕', 'bug 🐛', 'bus 🚌', 'nut 🥜', 'hut 🛖', 'tub 🛁', 'run 🏃', 'hug 🫂') },
  { id: 'e', titulo: 'Palavras com e', emoji: '🛏️', cor: '#8E72D0',
    palavras: ps('bed 🛏️', 'pen 🖊️', 'hen 🐔', 'net 🥅', 'red 🔴', 'ten 🔟', 'leg 🦵') },
  { id: 'fim', titulo: 'Finais ck ff ll ss', emoji: '🦆', cor: '#D27BA0',
    palavras: ps('duck 🦆', 'sock 🧦', 'rock 🪨', 'lock 🔒', 'puff 💨', 'hill ⛰️', 'bell 🔔', 'doll 🪆', 'kiss 💋') },
];
// unidade final: todas misturadas
UNIDADES.push({ id: 'mix', titulo: 'Todas misturadas', emoji: '🌈', cor: '#2BAE9C', palavras: UNIDADES.flatMap((u) => u.palavras) });
export const unidade = (id) => UNIDADES.find((u) => u.id === id);

// Figuras que podem confundir entre si: nunca aparecem juntas como opção
export const CONFLITOS = [['hat', 'cap'], ['dad', 'kid'], ['pot', 'pan'], ['bed', 'nap'], ['rock', 'hill'], ['can', 'bin'], ['hug', 'kiss']];
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

export const FALAS = {
  menu: 'Vamos ler e escrever palavrinhas em inglês! Cada palavra tem três pedacinhos.',
  continuar: 'Vamos continuar as palavrinhas!',
  fim: 'Você terminou todas as palavrinhas! Agora vamos revisar para ficar craque.',
  montar: 'Escute a palavra e monte com as letrinhas!',
  montarErro: 'Essa letrinha não vai aí. Escute a palavra de novo!',
  ler: 'Leia a palavra e toque na figura certa!',
  qual: 'Escute e toque na palavra certa! Olhe bem cada letrinha.',
  escrever: 'Agora escreva a palavra na pauta, respeitando a girafa, a tartaruga e o macaco!',
  escreverSozinha: 'Agora escreva sozinha, sem a trilha!',
  palavraPronta: 'Palavra pronta!',
};

// Trilha: em cada unidade, montar → ler → qual palavra → escrever na pauta
export const TIPOS = [
  { tipo: 'montar', titulo: 'Ouça e monte', emoji: '🧩' },
  { tipo: 'ler', titulo: 'Leia e ache', emoji: '👀' },
  { tipo: 'qual', titulo: 'Qual palavra?', emoji: '👂' },
  { tipo: 'escrever', titulo: 'Escreva na pauta', emoji: '✏️' },
];
export const ETAPAS = UNIDADES.flatMap((u) => TIPOS.map((t) => ({ ...t, unidade: u.id, fase: `${u.emoji} ${u.titulo}` })));

// Todas as falas deste módulo: [texto, idioma]
export function todasAsFalas() {
  const pt = Object.values(FALAS).map((t) => [t, 'pt']);
  const en = [...new Set([...UNIDADES.flatMap((u) => u.palavras.map((p) => p.w)), ...DICIONARIO])].map((w) => [w, 'en']);
  return [...pt, ...en];
}
