// Falas fixas da base (sem DOM: o gerador de vozes também lê este arquivo)
export const ELOGIOS = [
  'Isso mesmo!',
  'Aê! Você acertou!',
  'Mandou muito bem!',
  'Muito bem, Stella!',
  'Uau, você arrasou!',
  'Isso! Você acertou!',
  'Você é incrível!',
  'Isso, você é uma estrela!',
];
export const DE_NOVO = ['Quase! Tenta de novo.', 'Ops! Olha de novo.', 'Quase lá! Tenta outra vez.'];
export const FALA_TRANCADA = 'Essa ainda está trancadinha. Termine as anteriores primeiro!';
export const FALA_INICIO = (nome) => `Oi, ${nome}! O que vamos aprender hoje?`;
export function todasAsFalas(nome = 'Stella') {
  return [...ELOGIOS, ...DE_NOVO, FALA_TRANCADA, FALA_INICIO(nome)].map((t) => [t, 'pt']);
}
