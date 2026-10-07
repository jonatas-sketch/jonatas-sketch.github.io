// Sons das letras em inglês (phonics), como a escola ensina: o som, não o nome da letra.
// Os arquivos ficam em /audio/fonemas/<id>.mp3, gravados na voz da Lila (tools/gerar-fonemas.mjs).
// Enquanto um som não tem arquivo, o app não fala nada para ele (voz do aparelho fala letra solta mal).
// Hoje os sons foram recortados das palavras que a Lila já gravou (tools/fonemas-das-palavras.py).
import { FONEMAS_PRONTOS } from './fonemas-index.js';

// grafema → som (c, k e ck têm o mesmo som; ff = f; ll = l; ss = s)
export const FONEMA_DE = {
  s: 's', a: 'a', t: 't', p: 'p', i: 'i', n: 'n', m: 'm', d: 'd', g: 'g', o: 'o', c: 'k', k: 'k', ck: 'k',
  e: 'e', u: 'u', r: 'r', h: 'h', b: 'b', f: 'f', ff: 'f', l: 'l', ll: 'l', ss: 's',
};
export const temSom = (g) => FONEMAS_PRONTOS.has(FONEMA_DE[g]);
export const urlSom = (g) => `/audio/fonemas/${FONEMAS_PRONTOS.get(FONEMA_DE[g])}`;
// as letras na ordem da folha da escola (Floppy's Phonics, Level 1+), com a figura de cada uma
export const SONS_ESCOLA = [
  ['s', 'sun', '☀️'], ['a', 'apple', '🍎'], ['t', 'teddy', '🧸'], ['p', 'pan', '🍳'],
  ['i', 'insect', '🐞'], ['n', 'net', '🥅'], ['m', 'man', '👨'], ['d', 'dog', '🐶'],
  ['g', 'goat', '🐐'], ['o', 'octopus', '🐙'], ['c', 'cat', '🐱'], ['k', 'key', '🔑'],
  ['ck', 'duck', '🦆'], ['e', 'egg', '🥚'], ['u', 'umbrella', '☂️'], ['r', 'rabbit', '🐰'],
  ['h', 'hat', '🎩'], ['b', 'bone', '🦴'], ['f', 'fish', '🐟'], ['ff', 'puff', '💨'],
  ['l', 'lion', '🦁'], ['ll', 'hill', '⛰️'], ['ss', 'dress', '👗'],
];
