// Falas da Missão do dia (sem DOM: o gerador de vozes lê este arquivo)
export const FALAS = {
  comeco: (nome) => `Oi, ${nome}! A missão de hoje tem cinco partes. Vamos lá?`,
  continua: 'Muito bem! Vamos para a próxima parte da missão!',
  fim: 'Você terminou a missão de hoje! Amanhã tem mais!',
  concluida: 'Missão do dia concluída! Que orgulho de você!',
};
export function todasAsFalas(nome = 'Stella') {
  return [FALAS.comeco(nome), FALAS.continua, FALAS.fim, FALAS.concluida].map((t) => [t, 'pt']);
}
