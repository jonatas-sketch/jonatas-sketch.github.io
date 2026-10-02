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
