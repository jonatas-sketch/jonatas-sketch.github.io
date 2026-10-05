// Letras minúsculas no formato da escola (Agora Lledó / Floppy's Phonics).
// Pauta de 3 linhas: linha 1 (topo) y=0 · linha 2 (tracejada) y=50 · linha 3 (chão) y=100.
// Letras do macaco descem até y=150. Cada traço segue a ordem e o sentido ensinados.
// Na escola o f é girafa E macaco: sobe até a linha 1 e desce abaixo do chão.

const BOJO = 'M44 58 C40 52 32 50 25 50 C12 50 3 61 3 75 C3 89 12 100 25 100 C34 100 41 95 44 87';

export const LETRAS = {
  a: { w: 56, tracos: [BOJO, 'M44 50 L44 92 C44 97 47 100 53 100'] },
  b: { w: 52, tracos: ['M5 0 L5 100', 'M5 72 C8 59 16 50 27 50 C39 50 47 61 47 75 C47 89 39 100 27 100 C17 100 9 95 5 88'] },
  c: { w: 46, tracos: ['M42 57 C38 52 32 50 25 50 C12 50 3 61 3 75 C3 89 12 100 25 100 C32 100 38 97 43 91'] },
  d: { w: 56, tracos: [BOJO, 'M44 0 L44 92 C44 97 47 100 53 100'] },
  e: { w: 48, tracos: ['M4 76 L45 76 C45 61 37 50 25 50 C12 50 3 61 3 75 C3 89 12 100 25 100 C33 100 39 97 44 91'] },
  f: { w: 44, tracos: ['M40 8 C37 3 32 0 27 0 C20 0 16 5 16 13 L16 136 C16 145 11 150 4 150', 'M4 50 L30 50'] },
  g: { w: 50, tracos: [BOJO, 'M44 50 L44 134 C44 145 36 150 25 150 C16 150 9 147 5 142'] },
  h: { w: 56, tracos: ['M5 0 L5 100', 'M5 72 C9 58 17 50 27 50 C38 50 44 57 44 68 L44 92 C44 97 47 100 53 100'] },
  i: { w: 18, tracos: ['M6 50 L6 92 C6 97 9 100 15 100', 'M6 26 L6 28'] },
  j: { w: 30, tracos: ['M25 50 L25 134 C25 145 18 150 10 150 C6 150 3 148 1 146', 'M25 26 L25 28'] },
  k: { w: 44, tracos: ['M5 0 L5 100', 'M38 50 L6 78 L41 100'] },
  l: { w: 18, tracos: ['M6 0 L6 92 C6 97 9 100 15 100'] },
  m: { w: 74, tracos: [
    'M5 50 L5 100',
    'M5 68 C8 57 14 50 22 50 C30 50 35 56 35 65 L35 100',
    'M35 65 C35 56 41 50 49 50 C58 50 64 57 64 66 L64 92 C64 97 67 100 72 100',
  ] },
  n: { w: 56, tracos: ['M5 50 L5 100', 'M5 68 C9 57 17 50 27 50 C38 50 44 57 44 68 L44 92 C44 97 47 100 53 100'] },
  o: { w: 50, tracos: ['M25 50 C12 50 3 61 3 75 C3 89 12 100 25 100 C38 100 47 89 47 75 C47 61 38 50 25 50'] },
  p: { w: 52, tracos: ['M5 50 L5 150', 'M5 60 C9 54 17 50 27 50 C39 50 47 61 47 75 C47 89 39 100 27 100 C17 100 9 96 5 90'] },
  q: { w: 56, tracos: [BOJO, 'M44 50 L44 140 C44 146 48 150 54 148'] },
  r: { w: 42, tracos: ['M5 50 L5 100', 'M5 70 C9 58 17 50 28 50 C33 50 37 52 40 55'] },
  s: { w: 46, tracos: ['M40 56 C36 51 30 50 24 50 C14 50 8 55 8 62 C8 70 16 73 24 75 C33 77 41 81 41 89 C41 96 34 100 24 100 C16 100 9 98 5 93'] },
  t: { w: 40, tracos: ['M15 14 L15 90 C15 97 19 100 26 100 C31 100 34 98 37 95', 'M3 50 L31 50'] },
  u: { w: 52, tracos: ['M5 50 L5 82 C5 94 13 100 23 100 C34 100 41 93 41 82', 'M41 50 L41 92 C41 97 44 100 49 100'] },
  v: { w: 46, tracos: ['M3 50 L23 100 L43 50'] },
  w: { w: 60, tracos: ['M3 50 L15 100 L30 60 L45 100 L57 50'] },
  x: { w: 46, tracos: ['M5 50 L41 100', 'M41 50 L5 100'] },
  y: { w: 48, tracos: ['M4 50 L24 100', 'M44 50 L24 100 L13 150'] },
  z: { w: 46, tracos: ['M5 50 L41 50 L5 100 L43 100'] },
};

export const FAMILIAS = {
  girafa: {
    nome: 'Girafa', ingles: 'Giraffe letters', emoji: '🦒', cor: '#E0A21F', clara: '#FFF1C9',
    letras: 'bdfhklt',
    fala: 'A girafa é alta! As letras da girafa sobem até a linha lá de cima.',
  },
  tartaruga: {
    nome: 'Tartaruga', ingles: 'Tortoise letters', emoji: '🐢', cor: '#5E9A57', clara: '#E3F1DF',
    letras: 'aceimnorsuvwxz',
    fala: 'A tartaruga é baixinha! As letras da tartaruga ficam no meio, entre a linha tracejada e o chão.',
  },
  macaco: {
    nome: 'Macaco', ingles: 'Monkey letters', emoji: '🐒', cor: '#A5683B', clara: '#F3E3D3',
    letras: 'fgjpqy',
    fala: 'O macaco fica pendurado! As letras do macaco descem para baixo da linha do chão.',
  },
};

export const familiasDe = (l) => Object.keys(FAMILIAS).filter((k) => FAMILIAS[k].letras.includes(l));
export const familiaPrincipal = (l) => familiasDe(l)[0];

// Ordem em que a escola apresenta as letras (Floppy's Phonics), depois as demais
export const ORDEM_ESCOLA = 'satpinmdgockeurhbfljqvwxyz'.split('');

// ---------- Letras em inglês ----------
// Nome da letra como a escola fala (inglês britânico: "zed") + palavra que começa com ela.
// O nome vai escrito do jeito que soa, para a voz não ler "a" como artigo.
export const NOME_EN = {
  a: 'Ay', b: 'Bee', c: 'See', d: 'Dee', e: 'Ee', f: 'Ef', g: 'Jee', h: 'Aitch', i: 'Eye', j: 'Jay',
  k: 'Kay', l: 'El', m: 'Em', n: 'En', o: 'Oh', p: 'Pee', q: 'Cue', r: 'Ar', s: 'Ess', t: 'Tee',
  u: 'You', v: 'Vee', w: 'Double-you', x: 'Ex', y: 'Why', z: 'Zed',
};
// palavras-âncora da escola (Floppy's Phonics) quando têm figura; x vem no fim (fox), como na escola
export const ANCORA_EN = {
  s: ['sun', '☀️'], a: ['apple', '🍎'], t: ['teddy', '🧸'], p: ['pan', '🍳'], i: ['insect', '🐞'], n: ['net', '🥅'],
  m: ['man', '👨'], d: ['dog', '🐶'], g: ['goat', '🐐'], o: ['octopus', '🐙'], c: ['cat', '🐱'], k: ['key', '🔑'],
  e: ['egg', '🥚'], u: ['umbrella', '☂️'], r: ['rabbit', '🐰'], h: ['hat', '🎩'], b: ['bone', '🦴'], f: ['fish', '🐟'],
  l: ['lion', '🦁'], j: ['juice', '🧃'], q: ['queen', '👸'], v: ['van', '🚐'], w: ['web', '🕸️'], x: ['fox', '🦊'],
  y: ['yo-yo', '🪀'], z: ['zebra', '🦓'],
};
export const falaLetraEn = (l) => `${NOME_EN[l]}... ${ANCORA_EN[l][0]}!`;
// a família inteira dita em inglês (só os nomes), quando a Lila apresenta os bichos
export const falaFamiliaEn = (k) => [...FAMILIAS[k].letras].map((l) => NOME_EN[l]).join(', ') + '.';

// ---------- Falas da Lila (português) ----------
// Tudo o que é falado está aqui, para gravar na voz da Lila (tools/gerar-vozes.mjs).
const DA = { girafa: 'da girafa', tartaruga: 'da tartaruga', macaco: 'do macaco' };
export const daFamilia = (k) => DA[k];
export const FALAS = {
  menu: 'Cada letra mora numa casinha da pauta: a girafa lá em cima, a tartaruga no meio e o macaco pendurado embaixo. Vamos descobrir?',
  continuar: 'Vamos continuar a trilha das letras!',
  trilhaFim: 'Você terminou a trilha toda! Agora vamos revisar para ficar craque.',
  conhecer: 'Toque em cada bicho para conhecer a família dele!',
  conhecerLetra: 'Toque nas letras para ouvir o nome delas em inglês!',
  fEspecial: 'E o f é especial: ele sobe como a girafa e desce como o macaco!',
  casinha: 'Em qual casinha mora essa letra? Da girafa, da tartaruga ou do macaco?',
  casinhaF: 'Isso! O f é especial: ele é da girafa e do macaco ao mesmo tempo!',
  sobeDoMeio: 'Olha de novo: essa letra sai do meio da pauta.',
  soNoMeio: 'Olha de novo: essa letra fica só no meio da pauta.',
  certinho: 'Qual letra está escrita certinho na pauta? Toque nela!',
  errado: (msg) => `Hmm, essa ${msg}.`,
  intruso: 'Três letras são da mesma família. Qual letra é de outra família?',
  intrusoCerto: (fb, fa) => `Isso! Essa é da família ${DA[fb]}, e as outras são ${DA[fa]}!`,
  forma: 'Olhe as caixinhas: alta, baixinha ou pendurada. Qual palavra cabe certinho nelas?',
  ouvir: 'Escute o nome da letra em inglês e toque nela!',
  escolherLetra: 'Escolha uma letra para traçar na pauta!',
  tracar: (f) => `Comece na bolinha verde e siga a setinha. Essa letra é da família ${DA[f]}!`,
  bolinha: 'Comece na bolinha verde!',
  continueBolinha: 'Continue de onde parou, na bolinha verde!',
  saiu: 'Opa, saiu do caminho! Volte para a bolinha verde.',
  agoraSozinha: (f) => `Muito bem! Agora tente escrever sozinha, sem a trilha. Lembre: ${FAMILIAS[f].fala}`,
  livre: (f) => `Escreva a letra respeitando as linhas da pauta. ${FAMILIAS[f].fala}`,
  escrevaPrimeiro: 'Escreva a letra na pauta primeiro!',
  respeitou: 'Sua letra respeitou a pauta!',
  faltouSubir: 'Faltou subir! As letras da girafa vão até a linha lá de cima.',
  subiuDemais: (macaco) => `Opa! A letra subiu demais. A ${macaco ? 'letra do macaco' : 'tartaruga'} não passa da linha tracejada.`,
  faltouDescer: 'Faltou descer! As letras do macaco descem para baixo da linha do chão.',
  afundou: 'Opa, a letra afundou! Só as letras do macaco descem do chão.',
  flutuando: 'A letra está flutuando! Ela precisa sentar na linha do chão.',
  proximaLetra: 'Agora a próxima letra!',
  palavras: 'Agora vamos traçar palavras inteiras! Comece na bolinha verde.',
  palavraPronta: 'Palavra pronta!',
  dedinho: 'Entre uma palavra e outra a gente deixa o espaço de um dedinho!',
  escreverPalavra: 'Agora escreva a palavra sozinha, respeitando as linhas da pauta.',
  palavraFaltouSubir: 'Faltou subir! Essa palavra tem letra da girafa, que vai até a linha lá de cima.',
  palavraFaltouDescer: 'Faltou descer! Essa palavra tem letra do macaco, que desce para baixo do chão.',
  palavraSubiu: 'Opa! A palavra subiu demais. Essas letras são todas da tartaruga e ficam no meio.',
  palavraAfundou: 'Opa, a palavra afundou! Só as letras do macaco descem do chão.',
  palavraRespeitou: 'Sua palavra respeitou a pauta!',
};
// erros da atividade "Está certinho?"
export const ERROS = {
  tartaruga: [
    { alt: [2, -100], msg: 'subiu demais: a tartaruga não passa da linha tracejada' },
    { alt: [1, -32], msg: 'está flutuando: a letra precisa sentar no chão' },
    { alt: [1, 34], msg: 'afundou: só o macaco desce do chão' },
  ],
  girafa: [
    { alt: [0.5, 50], msg: 'ficou baixinha: a girafa vai até a linha lá de cima' },
    { alt: [1, 40], msg: 'afundou: só o macaco desce do chão' },
  ],
  macaco: [
    { alt: [1, -50], msg: 'não desceu: o macaco fica pendurado embaixo do chão' },
    { alt: [1, -26], msg: 'não desceu até o fim: o macaco desce bem para baixo do chão' },
  ],
};

// ---------- Trilha das letras: etapas em sequência ----------
// Segue a escola: famílias → letras na ordem do Floppy's → palavras → espaço do dedinho.
const g = (letras) => letras.split('');
export const ETAPAS = [
  { fase: 'As famílias', tipo: 'conhecer', titulo: 'Conheça as famílias', emoji: '🦒' },
  { fase: 'As famílias', tipo: 'casinha', titulo: 'Cada letra na sua casa', emoji: '🏠' },
  { fase: 'As famílias', tipo: 'certinho', titulo: 'Está certinho?', emoji: '✅' },
  { fase: 'Letras da escola', tipo: 'tracar', letras: g('satp'), titulo: 'Traçar s a t p', emoji: '✏️' },
  { fase: 'Letras da escola', tipo: 'ouvir', letras: g('satp'), titulo: 'Ouça e ache: s a t p', emoji: '👂' },
  { fase: 'Letras da escola', tipo: 'tracar', letras: g('inmd'), titulo: 'Traçar i n m d', emoji: '✏️' },
  { fase: 'Letras da escola', tipo: 'ouvir', letras: g('satpinmd'), foco: g('inmd'), titulo: 'Ouça e ache: i n m d', emoji: '👂' },
  { fase: 'Letras da escola', tipo: 'intruso', titulo: 'Ache o intruso', emoji: '🔍' },
  { fase: 'Letras da escola', tipo: 'tracar', letras: g('gock'), titulo: 'Traçar g o c k', emoji: '✏️' },
  { fase: 'Letras da escola', tipo: 'ouvir', letras: g('satpinmdgock'), foco: g('gock'), titulo: 'Ouça e ache: g o c k', emoji: '👂' },
  { fase: 'Letras da escola', tipo: 'tracar', letras: g('eurh'), titulo: 'Traçar e u r h', emoji: '✏️' },
  { fase: 'Letras da escola', tipo: 'forma', titulo: 'A forma da palavra', emoji: '📦' },
  { fase: 'Letras da escola', tipo: 'tracar', letras: g('bfl'), titulo: 'Traçar b f l', emoji: '✏️' },
  { fase: 'Letras da escola', tipo: 'ouvir', letras: g('satpinmdgockeurhbfl'), foco: g('eurhbfl'), titulo: 'Ouça e ache: e u r h b f l', emoji: '👂' },
  { fase: 'Palavras na pauta', tipo: 'palavras', palavras: ['sat', 'pin', 'tap', 'man', 'dad'], titulo: 'Traçar palavras', emoji: '📝' },
  { fase: 'Palavras na pauta', tipo: 'escrever', palavras: ['sat', 'pan', 'tin', 'map'], titulo: 'Escrever palavras sozinha', emoji: '✍️' },
  { fase: 'Palavras na pauta', tipo: 'palavras', palavras: ['dog', 'pig', 'big', 'hat', 'leg'], titulo: 'Palavras da girafa e do macaco', emoji: '📝' },
  { fase: 'Palavras na pauta', tipo: 'tracar', letras: g('jvwy'), titulo: 'Traçar j v w y', emoji: '✏️' },
  { fase: 'Palavras na pauta', tipo: 'tracar', letras: g('qxz'), titulo: 'Traçar q x z', emoji: '✏️' },
  { fase: 'Palavras na pauta', tipo: 'ouvir', letras: g('abcdefghijklmnopqrstuvwxyz'), titulo: 'Ouça e ache: o alfabeto', emoji: '👂' },
  { fase: 'Palavras na pauta', tipo: 'palavras', palavras: ['a cat', 'a dog', 'a big pig'], titulo: 'Espaço do dedinho', emoji: '☝️' },
  { fase: 'Palavras na pauta', tipo: 'escrever', palavras: ['dog', 'hat', 'pig', 'sun', 'leg'], titulo: 'Escrever com girafa e macaco', emoji: '✍️' },
];
// palavras que aparecem nas atividades (ditas em inglês)
export const PALAVRAS_FORMA = ['dog', 'cat', 'pig', 'sun', 'hat', 'bed', 'top', 'map', 'cup', 'net', 'leg', 'bus', 'hen', 'kid',
  'lip', 'mop', 'nut', 'pan', 'red', 'ten', 'tap', 'egg', 'jam', 'yes', 'zip', 'bag', 'log', 'dot', 'hug', 'bell', 'doll',
  'hill', 'duck', 'sock', 'pet', 'dig', 'gum', 'yak', 'sad', 'mud'];

// Todas as falas deste módulo: [texto, idioma]
export function todasAsFalas() {
  const fam = Object.keys(FAMILIAS);
  const pt = [
    ...Object.values(FALAS).filter((v) => typeof v === 'string'),
    ...Object.values(FAMILIAS).map((f) => f.fala),
    ...Object.values(FAMILIAS).map((f) => f.fala + ' ' + FALAS.fEspecial),
    ...Object.values(ERROS).flat().map((e) => FALAS.errado(e.msg)),
    ...fam.flatMap((a) => fam.filter((b) => b !== a).map((b) => FALAS.intrusoCerto(b, a))),
    ...fam.flatMap((f) => [FALAS.tracar(f), FALAS.agoraSozinha(f), FALAS.livre(f)]),
    FALAS.subiuDemais(true), FALAS.subiuDemais(false),
  ];
  const en = [
    ...Object.keys(NOME_EN).map(falaLetraEn),
    ...fam.map(falaFamiliaEn),
    ...PALAVRAS_FORMA,
    ...ETAPAS.flatMap((e) => e.palavras || []),
  ];
  const vistos = new Set();
  return [...pt.map((t) => [t, 'pt']), ...en.map((t) => [t, 'en'])].filter(([t, l]) => !vistos.has(l + t) && vistos.add(l + t));
}
