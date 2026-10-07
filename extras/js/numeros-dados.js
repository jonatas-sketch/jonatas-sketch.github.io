// Números em inglês (como na escola): conhecer, contar e ouvir e achar. Sem DOM (o gerador de vozes lê).
export const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

// níveis: 1–5 → 1–10 → 1–20 (no 3, os números novos 11–20 aparecem mais)
export const NIVEIS = [
  { n: 1, de: 1, ate: 5, nome: '1 – 5', emoji: '🐣' },
  { n: 2, de: 1, ate: 10, nome: '1 – 10', emoji: '🐥' },
  { n: 3, de: 1, ate: 20, foco: [11, 20], nome: '1 – 20', emoji: '🦅' },
];
export const JOGOS = ['contar', 'ouvir'];
export const ESTRELAS_PARA_PASSAR = 2;

// coisas para contar (uma por rodada)
export const OBJETOS = ['🍎', '⭐', '🐞', '🎈', '🐟', '🌸', '🧁', '🚗', '🦆', '🍓', '🐶', '⚽'];

export const FALAS = {
  menu: "Let's count in English!",
  aprender: 'Tap a number to hear it!',
  todos: "Let's count together!",
  contar: 'How many? Count and tap the number!',
  ouvir: 'Listen and find the number!',
  novo: 'Well done! New numbers for you!',
};

export function todasAsFalas() {
  return [...Object.values(FALAS), ...NUM_EN.slice(1)].map((t) => [t, 'en']);
}
