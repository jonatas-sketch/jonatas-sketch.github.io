// Missão do dia da Lila: 5 partes por dia, cada uma continuando de onde a Stella parou.
// Letras na Pauta → Palavras CVC → Números → Palavras novas em inglês → Notas musicais.
// O plano do dia fica guardado (progresso "missao.<data>") para não mudar no meio do dia.
import {
  h, falar, sfx, progresso, perfil, irPara, tela, lila, festa, estilo,
  hoje, iniciarPasso, sairDaMissao,
} from './core.js';
import { ETAPAS as ETAPAS_LETRAS } from './letras-dados.js';
import { ETAPAS as ETAPAS_CVC } from './cvc-dados.js';
import { TEMAS } from './ingles-dados.js';
import { NIVEIS as NIVEIS_NUM } from './numeros-dados.js';
import { nivelAtual as nivelNumeros } from './numeros.js';
import { FALAS } from './missao-dados.js';

// número do dia (para alternar temas e jogos de um dia para o outro)
const diaN = () => Math.floor(new Date(hoje() + 'T12:00:00').getTime() / 86400000);

// próxima etapa ainda não feita de uma trilha (ou uma de revisão, se já fez tudo)
function proximaEtapa(etapas, modulo, chave) {
  const i = etapas.findIndex((e, k) => !progresso.feito(modulo, chave(e, k + 1)));
  return i === -1 ? 1 + (diaN() % etapas.length) : i + 1;
}

function montarPlano() {
  const d = diaN();
  const nL = proximaEtapa(ETAPAS_LETRAS, 'letras', (e, n) => 'etapa-' + n);
  const eL = ETAPAS_LETRAS[nL - 1];
  const nC = proximaEtapa(ETAPAS_CVC, 'cvc', (e) => e.chave);
  const eC = ETAPAS_CVC[nC - 1];
  const jogoNum = ['contar', 'ouvir'][d % 2];
  const nvNum = nivelNumeros();
  const tema = TEMAS[d % TEMAS.length];
  const jogoMus = ['onde', 'ouvir', 'pauta', 'subiu'][d % 4];
  const nomesMus = { onde: 'Onde mora a nota?', ouvir: 'Ouvir e achar', pauta: 'A forma da nota', subiu: 'Subiu ou desceu?' };
  return [
    { id: 'letras', modulo: 'letras', emoji: '✏️', titulo: 'Letras na Pauta', sub: `Etapa ${nL} · ${eL.titulo}`, rota: '#/letras/etapa/' + nL, padrao: `^etapa-${nL}$`, cor: '#E0A21F' },
    { id: 'cvc', modulo: 'cvc', emoji: '🔤', titulo: 'Palavras CVC', sub: `${eC.titulo}`, rota: '#/cvc/etapa/' + nC, padrao: `^${eC.chave}$`, cor: '#2BAE9C' },
    { id: 'numeros', modulo: 'numeros', emoji: '🔢', titulo: 'Números em inglês', sub: `${jogoNum === 'contar' ? 'Count' : 'Listen and find'} · ${nvNum.nome}`, rota: '#/numeros/jogo/' + jogoNum, padrao: `^n\\d-${jogoNum}$`, cor: '#E8865A' },
    { id: 'ingles', modulo: 'ingles', emoji: '🇬🇧', titulo: 'Palavras novas em inglês', sub: `${tema.en} · ${tema.nome}`, rota: `#/ingles/tema/${tema.id}/jogo`, padrao: `^tema-${tema.id}$`, cor: '#4DA6E0' },
    { id: 'musica', modulo: 'musica', emoji: '🎹', titulo: 'Notas musicais', sub: nomesMus[jogoMus], rota: '#/musica/jogo/' + jogoMus, padrao: `^n\\d+-${jogoMus}$`, cor: '#7F77DD' },
  ];
}

function missaoDeHoje() {
  const chave = `missao.${hoje()}`;
  let m = progresso.get(chave, null);
  if (!m || !Array.isArray(m.passos)) {
    m = { passos: montarPlano(), feitos: [] };
    progresso.set(chave, m);
  }
  return m;
}

export function abrir(raiz) {
  estilo('missao');
  sairDaMissao(); // de volta à missão: nenhuma parte ativa até escolher a próxima
  const m = missaoDeHoje();
  const { corpo } = tela(raiz, { titulo: '⭐ Missão do dia', cor: '#E0A21F' });
  const feitos = m.passos.filter((p) => m.feitos.includes(p.id)).length;
  const proximo = m.passos.find((p) => !m.feitos.includes(p.id));
  const fala = feitos === 0 ? FALAS.comeco(perfil.nome) : proximo ? FALAS.continua : FALAS.fim;
  corpo.append(
    lila(fala),
    h('div', { class: 'ms-barra' }, h('i', { style: { width: (feitos / m.passos.length) * 100 + '%' } }), h('span', null, `${feitos} de ${m.passos.length}`)),
  );
  m.passos.forEach((p, i) => {
    const feito = m.feitos.includes(p.id);
    const vez = p === proximo;
    corpo.append(h('button', {
      class: 'ms-passo' + (feito ? ' feito' : '') + (vez ? ' vez' : ''),
      style: { '--cor': p.cor },
      onclick: () => {
        sfx.pop();
        iniciarPasso(p.id);
        irPara(p.rota);
      },
    },
    h('span', { class: 'ms-num' }, feito ? '✓' : String(i + 1)),
    h('span', { class: 'ms-emoji' }, p.emoji),
    h('span', { class: 'ms-txt' }, h('b', null, p.titulo), h('small', null, p.sub)),
    h('span', { class: 'ms-acao' }, feito ? '⭐' : vez ? '▶' : '')));
  });
  const total = progresso.get('missao.total', 0);
  if (!proximo) {
    // todas feitas: festa uma vez por dia
    if (!m.comemorada) {
      m.comemorada = true;
      progresso.set(`missao.${hoje()}`, m);
      progresso.set('missao.total', total + 1);
      festa(raiz, { estrelas: 3, frase: FALAS.concluida, voltar: () => irPara('#/missao') });
    }
    corpo.append(h('p', { class: 'ms-total' }, `🏅 Missões completas: ${progresso.get('missao.total', 0)}`));
  } else {
    falar(fala);
    if (total) corpo.append(h('p', { class: 'ms-total' }, `🏅 Missões completas: ${total}`));
  }
}
