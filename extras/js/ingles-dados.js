// Conteúdo do módulo "Phonics da escola" (inglês).
// Os sons seguem a ordem da escola da Stella (Floppy's Phonics, nível 1+):
//   s a t p | i n m d | g o c k | ck e u r | h b f ff | l ll le ss
// Figuras = emojis do iOS. Palavras e frases escritas por nós (nada copiado do material da escola).
// REGRA DE ÁUDIO: nada aqui é falado letra por letra. O som de cada letra é ensinado
// só por palavras inteiras ("sun… sock… snake").

// 'sun ☀️' → { w: 'sun', e: '☀️' } (o emoji fica depois do último espaço)
const ps = (...itens) => itens.map((t) => {
  const i = t.lastIndexOf(' ');
  return { w: t.slice(0, i), e: t.slice(i + 1) };
});
const p1 = (t) => ps(t)[0];

// ---------- Os 6 grupos de sons ----------
// g = como se escreve · ancora = palavra-âncora · exemplos = aparecem ao tocar no cartão
// inicio = palavras que COMEÇAM com esse som (jogo "Primeiro som"); dígrafos de fim não têm.
// fim = o som aparece no fim da palavra (ck, ll, le, ss)
function som(g, ancora, exemplos, inicio = [], fim = false) {
  return { g, ancora: p1(ancora), exemplos: ps(...exemplos), inicio: ps(...inicio), fim };
}

export const GRUPOS = [
  {
    n: 1, cor: '#E07A4C', sons: [
      som('s', 'sun ☀️', ['sock 🧦', 'snake 🐍'],
        ['sun ☀️', 'sock 🧦', 'snake 🐍', 'star ⭐', 'spider 🕷️', 'snail 🐌', 'sandwich 🥪', 'strawberry 🍓']),
      som('a', 'apple 🍎', ['ant 🐜', 'ambulance 🚑'],
        ['apple 🍎', 'ant 🐜', 'ambulance 🚑', 'anchor ⚓', 'axe 🪓', 'astronaut 🧑‍🚀']),
      som('t', 'teddy 🧸', ['tooth 🦷', 'tree 🌳'],
        ['teddy 🧸', 'tooth 🦷', 'tree 🌳', 'tiger 🐯', 'tomato 🍅', 'tent ⛺', 'turtle 🐢', 'taxi 🚕', 'tractor 🚜']),
      som('p', 'pan 🍳', ['pig 🐷', 'pizza 🍕'],
        ['pan 🍳', 'pig 🐷', 'pizza 🍕', 'pot 🍲', 'penguin 🐧', 'panda 🐼', 'parrot 🦜', 'pear 🍐', 'popcorn 🍿', 'pumpkin 🎃']),
    ],
  },
  {
    n: 2, cor: '#D69A2D', sons: [
      som('i', 'insect 🐞', ['ill 🤒', 'Italy 🇮🇹'],
        ['insect 🐞', 'ill 🤒', 'Italy 🇮🇹', 'injection 💉']),
      som('n', 'net 🥅', ['nose 👃', 'nut 🥜'],
        ['net 🥅', 'nose 👃', 'nut 🥜', 'noodles 🍜', 'nine 9️⃣', 'newspaper 📰']),
      som('m', 'man 👨', ['moon 🌙', 'mouse 🐭'],
        ['man 👨', 'moon 🌙', 'mouse 🐭', 'monkey 🐒', 'milk 🥛', 'mushroom 🍄', 'map 🗺️', 'magnet 🧲', 'mango 🥭', 'mermaid 🧜‍♀️']),
      som('d', 'dog 🐶', ['duck 🦆', 'door 🚪'],
        ['dog 🐶', 'duck 🦆', 'door 🚪', 'dinosaur 🦕', 'drum 🥁', 'dolphin 🐬', 'dice 🎲', 'deer 🦌', 'dragon 🐉']),
    ],
  },
  {
    // a âncora da escola para o g é "gate", mas não existe figura de portão: usamos goat
    n: 3, cor: '#5E9A57', sons: [
      som('g', 'goat 🐐', ['gift 🎁', 'guitar 🎸'],
        ['goat 🐐', 'gift 🎁', 'guitar 🎸', 'grapes 🍇', 'gorilla 🦍', 'glasses 👓', 'globe 🌍', 'girl 👧']),
      som('o', 'octopus 🐙', ['orange 🍊', 'otter 🦦'],
        ['octopus 🐙', 'orange 🍊', 'otter 🦦', 'ox 🐂', 'olive 🫒']),
      som('c', 'cat 🐱', ['car 🚗', 'cake 🎂'],
        ['cat 🐱', 'car 🚗', 'cake 🎂', 'cow 🐮', 'carrot 🥕', 'castle 🏰', 'camel 🐫', 'cup ☕', 'corn 🌽', 'crab 🦀', 'crown 👑', 'cloud ☁️']),
      som('k', 'key 🔑', ['kite 🪁', 'kangaroo 🦘'],
        ['key 🔑', 'kite 🪁', 'kangaroo 🦘', 'koala 🐨', 'king 🤴', 'kiwi 🥝']),
    ],
  },
  {
    n: 4, cor: '#8E72D0', sons: [
      som('ck', 'duck 🦆', ['sock 🧦', 'lock 🔒'], [], true),
      som('e', 'egg 🥚', ['elephant 🐘', 'elf 🧝'],
        ['egg 🥚', 'elephant 🐘', 'elf 🧝', 'envelope ✉️']),
      som('u', 'umbrella ☂️', ['up ⬆️', 'upside down 🙃'],
        ['umbrella ☂️', 'up ⬆️', 'upside down 🙃']),
      som('r', 'rabbit 🐰', ['rainbow 🌈', 'robot 🤖'],
        ['rabbit 🐰', 'rainbow 🌈', 'robot 🤖', 'rocket 🚀', 'ring 💍', 'rose 🌹', 'radio 📻', 'ruler 📏']),
    ],
  },
  {
    // ff: a âncora da escola é "cuff", que não tem figura; usamos puff 💨
    n: 5, cor: '#3E92CC', sons: [
      som('h', 'hat 🎩', ['horse 🐴', 'house 🏠'],
        ['hat 🎩', 'horse 🐴', 'house 🏠', 'heart ❤️', 'hippo 🦛', 'helicopter 🚁', 'hedgehog 🦔', 'hammer 🔨', 'honey 🍯']),
      som('b', 'bone 🦴', ['ball ⚽', 'banana 🍌'],
        ['bone 🦴', 'ball ⚽', 'banana 🍌', 'bee 🐝', 'boat ⛵', 'bus 🚌', 'butterfly 🦋', 'balloon 🎈', 'bike 🚲', 'bread 🍞']),
      som('f', 'fish 🐟', ['frog 🐸', 'fox 🦊'],
        ['fish 🐟', 'frog 🐸', 'fox 🦊', 'flower 🌸', 'fire 🔥', 'foot 🦶', 'fork 🍴', 'fairy 🧚', 'flag 🚩']),
      som('ff', 'puff 💨', ['giraffe 🦒', 'muffin 🧁']),
    ],
  },
  {
    n: 6, cor: '#D27BA0', sons: [
      som('l', 'lion 🦁', ['lemon 🍋', 'leaf 🍁'],
        ['lion 🦁', 'lemon 🍋', 'leaf 🍁', 'lollipop 🍭', 'lizard 🦎', 'ladder 🪜', 'lobster 🦞', 'laptop 💻']),
      som('ll', 'hill ⛰️', ['bell 🔔', 'doll 🪆'], [], true),
      som('le', 'bottle 🍼', ['candle 🕯️', 'turtle 🐢'], [], true),
      som('ss', 'dress 👗', ['kiss 💋', 'princess 👸'], [], true),
    ],
  },
];

// ---------- Leitura: palavras decodificáveis com figura ----------
// LEITURA[n] = palavras novas que dá para ler com os sons até o grupo n (vale o acumulado).
// Conferido: cada palavra usa só sons já aprendidos e o emoji quer dizer mesmo aquela palavra.
export const LEITURA = {
  1: ps('tap 🚰'),
  2: ps('pin 📌', 'tin 🥫', 'pan 🍳', 'man 👨', 'map 🗺️', 'ant 🐜', 'dad 👨‍👧', 'nap 😴', 'sad 😢', 'mad 😠'),
  3: ps('dog 🐶', 'cat 🐱', 'pig 🐷', 'cap 🧢', 'pot 🍲', 'kid 🧒', 'stop 🛑', 'mask 😷'),
  4: ps('duck 🦆', 'sock 🧦', 'rock 🪨', 'truck 🚚', 'red 🔴', 'pen 🖊️', 'ten 🔟', 'egg 🥚', 'sun ☀️', 'nut 🥜',
    'cup ☕', 'run 🏃', 'rat 🐀', 'net 🥅', 'drum 🥁', 'tent ⛺', 'mum 👩‍👧', 'rocket 🚀'),
  5: ps('hat 🎩', 'hen 🐔', 'hut 🛖', 'bed 🛏️', 'bus 🚌', 'bat 🦇', 'bag 👜', 'fog 🌫️', 'bug 🐛', 'frog 🐸',
    'puff 💨', 'hand ✋', 'crab 🦀', 'hug 🫂', 'bucket 🪣', 'gift 🎁'),
  6: ps('log 🪵', 'leg 🦵', 'lock 🔒', 'clock ⏰', 'flag 🚩', 'lemon 🍋', 'bell 🔔', 'doll 🪆', 'hill ⛰️', 'kiss 💋',
    'dress 👗', 'cross ✝️', 'bottle 🍼', 'apple 🍎', 'candle 🕯️', 'clap 👏', 'plug 🔌', 'camel 🐫', 'melon 🍈'),
};

// Figuras que podem confundir entre si: nunca aparecem juntas como opção
export const CONFLITOS = [
  ['man', 'dad'], ['kid', 'dad'], ['kid', 'mum'], ['cap', 'hat'], ['bug', 'ant'],
  ['hand', 'clap'], ['puff', 'fog'], ['hut', 'tent'], ['hill', 'rock'],
];

// ---------- Tricky words (lidas "de olho") ----------
// ex = exemplo curtinho (só falado e mostrado pequeno no modo Aprender)
export const TRICKY = [
  { w: 'the', ex: 'the red bus' },
  { w: 'I', ex: 'I can hop' },
  { w: 'to', ex: 'go to bed' },
  { w: 'no', ex: 'no, no, no!' },
  { w: 'go', ex: 'go, go, go!' },
  { w: 'into', ex: 'hop into bed' },
  { w: 'he', ex: 'he can run' },
  { w: 'she', ex: 'she has a hat' },
  { w: 'we', ex: 'we can clap' },
  { w: 'me', ex: 'hug me' },
  { w: 'be', ex: 'be good' },
  { w: 'my', ex: 'my dog' },
  { w: 'you', ex: 'I love you' },
  { w: 'was', ex: 'it was fun' },
  { w: 'they', ex: 'they are big' },
  { w: 'all', ex: 'all of us' },
  { w: 'are', ex: 'we are happy' },
  { w: 'said', ex: 'Mum said yes' },
];
// Palavras parecidas: viram opções juntas no jogo (para ler com atenção)
export const PARECIDAS = [
  ['he', 'she', 'we', 'me', 'be'],
  ['to', 'no', 'go', 'into'],
  ['the', 'they'],
  ['was', 'said', 'are', 'all', 'you', 'my', 'I'],
];

// ---------- Frases decodificáveis ----------
// Só palavras dos 6 grupos + tricky words.
export const FRASES = [
  { t: 'The cat is on the mat.', e: '🐱' },
  { t: 'The dog is on a log.', e: '🐶🪵' },
  { t: 'The pig is in the mud.', e: '🐷' },
  { t: 'A hen is in a pen.', e: '🐔' },
  { t: 'The bug is on a rug.', e: '🐛' },
  { t: 'The sun is hot.', e: '☀️🥵' },
  { t: 'I can run.', e: '🏃‍♀️' },
  { t: 'Mum has a big hat.', e: '👩👒' },
  { t: 'A frog can hop.', e: '🐸' },
  { t: 'A crab is on a rock.', e: '🦀🪨' },
  { t: 'The bus is big and red.', e: '🚌' },
  { t: 'I can clap.', e: '👏' },
];

// ---------- Palavras novas (temas) ----------
// Nenhuma repete as 66 palavras que ela já sabe no app principal.
const pt = (t, ...trad) => ps(...t).map((p, i) => ({ ...p, pt: trad[i] }));

export const TEMAS = [
  {
    id: 'acoes', nome: 'Ações', en: 'Actions', emoji: '🏃‍♀️', cor: '#E07A4C',
    palavras: pt(['run 🏃‍♀️', 'jump 🤸‍♀️', 'swim 🏊‍♀️', 'sleep 😴', 'eat 🍽️', 'drink 🥤', 'read 📖', 'sing 🎤',
      'dance 💃', 'climb 🧗‍♀️', 'draw 🖍️', 'write ✍️'],
    'correr', 'pular', 'nadar', 'dormir', 'comer', 'beber', 'ler', 'cantar', 'dançar', 'escalar', 'desenhar', 'escrever'),
  },
  {
    id: 'opostos', nome: 'Opostos', en: 'Opposites', emoji: '↔️', cor: '#8E72D0',
    pares: [
      pt(['big 🐘', 'small 🐭'], 'grande', 'pequeno'),
      pt(['hot 🔥', 'cold 🧊'], 'quente', 'frio'),
      pt(['happy 😀', 'sad 😢'], 'feliz', 'triste'),
      pt(['up ⬆️', 'down ⬇️'], 'para cima', 'para baixo'),
      pt(['open 🔓', 'closed 🔒'], 'aberto', 'fechado'),
      pt(['fast 🏎️', 'slow 🐌'], 'rápido', 'devagar'),
      pt(['wet 💦', 'dry 🏜️'], 'molhado', 'seco'),
      pt(['full 🍛', 'empty 🍽️'], 'cheio', 'vazio'),
    ],
  },
  {
    id: 'roupas', nome: 'Roupas', en: 'Clothes', emoji: '👗', cor: '#D27BA0',
    palavras: pt(['T-shirt 👕', 'dress 👗', 'trainers 👟', 'shoes 🥿', 'socks 🧦', 'hat 👒', 'coat 🧥', 'trousers 👖',
      'gloves 🧤', 'scarf 🧣', 'boots 👢', 'swimsuit 🩱'],
    'camiseta', 'vestido', 'tênis', 'sapatos', 'meias', 'chapéu', 'casaco', 'calça', 'luvas', 'cachecol', 'botas', 'maiô'),
  },
  {
    // sem cola, borracha e mesa: não existe emoji claro para elas
    id: 'sala', nome: 'Na escola', en: 'School', emoji: '🎒', cor: '#D69A2D',
    palavras: pt(['book 📕', 'pencil ✏️', 'bag 🎒', 'teacher 🧑‍🏫', 'chair 🪑', 'crayon 🖍️', 'scissors ✂️', 'ruler 📏',
      'paper 📄', 'paint 🎨', 'school 🏫', 'lunchbox 🍱'],
    'livro', 'lápis', 'mochila', 'professora', 'cadeira', 'giz de cera', 'tesoura', 'régua', 'papel', 'tinta', 'escola', 'lancheira'),
  },
  {
    // "sleepy" virou "silly": com "tired" ao lado, as duas figuras confundiam
    id: 'sentimentos', nome: 'Sentimentos', en: 'Feelings', emoji: '😊', cor: '#E0A21F',
    palavras: pt(['happy 😀', 'sad 😢', 'angry 😠', 'scared 😨', 'tired 🥱', 'surprised 😲', 'excited 🤩', 'silly 🤪'],
      'feliz', 'triste', 'com raiva', 'com medo', 'cansada', 'surpresa', 'animada', 'boba'),
  },
  {
    id: 'tempo', nome: 'O tempo', en: 'Weather', emoji: '🌦️', cor: '#3E92CC',
    palavras: pt(['sunny ☀️', 'rainy 🌧️', 'cloudy ☁️', 'windy 🌬️', 'snowy 🌨️', 'stormy ⛈️', 'foggy 🌫️', 'hot 🥵',
      'cold 🥶', 'rainbow 🌈'],
    'ensolarado', 'chuvoso', 'nublado', 'ventando', 'nevando', 'tempestade', 'neblina', 'calor', 'frio', 'arco-íris'),
  },
  {
    // cenas desenhadas (bola e caixa); fala = frase inteira, mais clara que a palavra solta
    id: 'onde', nome: 'Onde está?', en: 'Where is it?', emoji: '📦', cor: '#C98A5E',
    palavras: [
      { w: 'in', cena: 'in', fala: 'The ball is in the box.', pt: 'dentro' },
      { w: 'on', cena: 'on', fala: 'The ball is on the box.', pt: 'em cima' },
      { w: 'under', cena: 'under', fala: 'The ball is under the box.', pt: 'embaixo' },
      { w: 'next to', cena: 'next', fala: 'The ball is next to the box.', pt: 'do lado' },
    ],
  },
  {
    id: 'animais', nome: 'Animais 2', en: 'Animals 2', emoji: '🦒', cor: '#5E9A57',
    palavras: pt(['tiger 🐯', 'elephant 🐘', 'giraffe 🦒', 'zebra 🦓', 'snake 🐍', 'frog 🐸', 'owl 🦉', 'penguin 🐧',
      'whale 🐋', 'shark 🦈', 'turtle 🐢', 'butterfly 🦋'],
    'tigre', 'elefante', 'girafa', 'zebra', 'cobra', 'sapo', 'coruja', 'pinguim', 'baleia', 'tubarão', 'tartaruga', 'borboleta'),
  },
];
// Opostos: cada palavra sabe qual é o seu par
for (const t of TEMAS) {
  if (!t.pares) continue;
  t.palavras = [];
  for (const [a, b] of t.pares) {
    a.oposto = b;
    b.oposto = a;
    t.palavras.push(a, b);
  }
}

// ---------- Frases da escola ----------
// {nome} vira o nome da criança na hora de mostrar e de falar
export const FRASES_ESCOLA = [
  { en: 'Good morning!', e: '🌅', pt: 'Bom dia!' },
  { en: 'My name is {nome}.', e: '👧', pt: 'Meu nome é {nome}.' },
  { en: 'Can I go to the toilet, please?', e: '🚽', pt: 'Posso ir ao banheiro, por favor?' },
  { en: 'Can I have some water, please?', e: '💧', pt: 'Posso beber água, por favor?' },
  { en: "I don't understand.", e: '🤷‍♀️', pt: 'Eu não entendi.' },
  { en: 'Can you help me, please?', e: '🤝', pt: 'Você pode me ajudar, por favor?' },
  { en: "I'm finished!", e: '✅', pt: 'Terminei!' },
  { en: 'Can I play?', e: '🧸', pt: 'Posso brincar?' },
  { en: 'Thank you, teacher!', e: '🧑‍🏫', pt: 'Obrigada, professora!' },
  { en: 'Excuse me.', e: '🙋‍♀️', pt: 'Com licença.' },
  { en: "I'm sorry.", e: '😔', pt: 'Desculpa.' },
  { en: "Let's play together!", e: '👭', pt: 'Vamos brincar juntas!' },
  { en: 'Where is my bag?', e: '🎒', pt: 'Cadê a minha mochila?' },
  { en: "I'm hungry.", e: '🍽️', pt: 'Estou com fome.' },
  { en: 'See you tomorrow!', e: '👋', pt: 'Até amanhã!' },
];

// ---------- O que a Lila fala (português) ----------
// Nenhuma fala tem letra solta. {nome} = nome da criança.
export const LILA = {
  menu: 'Oi, {nome}! Vamos ler em inglês, igual na escola?',
  grupo: 'Escolha uma atividade!',
  sons: { texto: 'Toque em cada cartão e escute as palavras!', fala: 'Toque e escute!' },
  sonsFim: 'Você ouviu todos os sons!',
  inicio: { texto: 'Com qual letra começa?', fala: 'Escute a palavra. Com qual letra começa?' },
  figura: { texto: 'Qual figura começa com esta letra?', fala: 'Olhe a letra e escute as figuras. Qual figura começa com esta letra?' },
  ler: { texto: 'Leia a palavra e toque na figura certa!' },
  montar: { texto: 'Escute e monte a palavra!', fala: 'Escute a palavra e toque nas letras na ordem certa!' },
  tricky: { texto: 'Essas palavras a gente lê de olho! Toque e escute.' },
  trickyJogo: { texto: 'Escute e toque na palavra certa!' },
  frases: { texto: 'Leia a frase e toque na figura certa!' },
  temas: 'Escolha um tema!',
  modos: 'Quer aprender ou jogar?',
  aprender: 'Toque e escute!',
  temaJogo: { texto: 'Escute e toque na figura certa!' },
  escola: { texto: 'Frases para usar na escola! Toque e escute.' },
  escolaJogo: { texto: 'Escute a frase e toque no que ela quer dizer!' },
};

// ---------- Ajudantes (sem DOM) ----------
export const DIGRAFOS = ['ck', 'ff', 'll', 'ss'];

// Quebra a palavra nos pedacinhos que a escola ensina: 'duck' → d·u·ck, 'bottle' → b·o·t·t·le
export function segmentar(palavra) {
  const p = palavra.toLowerCase();
  const out = [];
  for (let i = 0; i < p.length;) {
    const dois = p.slice(i, i + 2);
    if (DIGRAFOS.includes(dois)) { out.push(dois); i += 2; }
    else if (dois === 'le' && i + 2 === p.length && i > 0 && !'aeiou'.includes(p[i - 1])) { out.push('le'); i += 2; }
    else { out.push(p[i]); i++; }
  }
  return out;
}

// Em qual grupo cada grafia é ensinada
const GRUPO_DO = new Map(GRUPOS.flatMap((g) => g.sons.map((s) => [s.g, g.n])));
export const grupoDoGrafema = (g) => GRUPO_DO.get(g) ?? Infinity;
export const grafemasAte = (n) => GRUPOS.filter((g) => g.n <= n).flatMap((g) => g.sons.map((s) => s.g));

// Menor grupo em que dá para ler a palavra (Infinity = tem som que a escola ainda não ensinou)
export function grupoMinimo(palavra) {
  const limpa = palavra.toLowerCase().replace(/[^a-z]/g, '');
  if (!limpa) return 0;
  return Math.max(...segmentar(limpa).map(grupoDoGrafema));
}

// Todas as falas do módulo, para gravar com a voz da Lila: [texto, idioma]
export function todasAsFalas(nome = 'Stella') {
  const com = (t) => t.replace('{nome}', nome);
  const lista = [];
  for (const v of Object.values(LILA)) {
    if (typeof v === 'string') lista.push([com(v), 'pt']);
    else lista.push([com(v.fala || v.texto), 'pt']);
  }
  for (const g of GRUPOS) {
    for (const s of g.sons) for (const p of [s.ancora, ...s.exemplos, ...s.inicio]) lista.push([p.w, 'en']);
  }
  for (const l of Object.values(LEITURA)) for (const p of l) lista.push([p.w, 'en']);
  for (const t of TRICKY) lista.push([t.w, 'en'], [t.ex, 'en']);
  for (const f of FRASES) lista.push([f.t, 'en']);
  for (const t of TEMAS) for (const p of t.palavras) lista.push([p.fala || p.w, 'en']);
  for (const f of FRASES_ESCOLA) lista.push([com(f.en), 'en']);
  const vistos = new Set();
  return lista.filter(([t, l]) => !vistos.has(l + t) && vistos.add(l + t));
}
