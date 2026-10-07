// Palavras CVC: ler e escrever palavrinhas de 3 pedacinhos em inglês, com as letras da escola.
// Trilha por vogal (a → i → o → u → e → finais ck ff ll ss → todas), 4 etapas em cada:
// ouça e monte · leia e ache · qual palavra? · escreva na pauta.
// Só palavras inteiras são faladas: o som puro de cada letra fica com o app da professora.
import {
  h, wait, shuffle, sample, falar, falarVarias, sfx, elogiar, progresso,
  irPara, tela, lila, jogo, festa, escolher, estilo, botaoOuvir,
} from './core.js';
import { FALA_TRANCADA } from './falas-core.js';
import { UNIDADES, unidade, grafemas, conflitam, parecidas, LETRAS_ESCOLA, FALAS, ETAPAS } from './cvc-dados.js';
import { FAMILIAS, familiaPrincipal, FALAS as FALAS_LETRAS } from './letras-dados.js';
import { pautaSVG, conteudo, palavraG, larguraPalavra } from './pauta.js';
import { montarTracado, montarLivre, avisador } from './escrita.js';

const MOD = 'cvc';
const COR = '#2BAE9C';
const MENU = () => irPara('#/cvc');
const feito = (chave) => progresso.feito(MOD, chave);
const corDa = (l) => FAMILIAS[familiaPrincipal(l)].cor;
const dizer = (w) => falar(w, 'en');

export function abrir(raiz, partes) {
  estilo('letras');
  estilo('cvc');
  const [a, b] = partes;
  if (a === 'etapa') return rodarEtapa(raiz, Number(b));
  return menu(raiz);
}

// ---------- trilha ----------
const chaveEtapa = (n) => 'etapa-' + n;
const liberada = (n) => n === 1 || progresso.liberarTudo() || feito(chaveEtapa(n - 1)) > 0;
const etapaAtual = () => {
  const i = ETAPAS.findIndex((_, k) => !feito(chaveEtapa(k + 1)));
  return i === -1 ? null : i + 1;
};

function rodarEtapa(raiz, n) {
  const e = ETAPAS[n - 1];
  if (!e || !liberada(n)) return MENU();
  const u = unidade(e.unidade);
  const op = {
    chave: chaveEtapa(n),
    titulo: `${u.emoji} ${e.titulo}`,
    cor: u.cor,
    palavras: u.palavras,
    comFinais: u.id === 'fim' || u.id === 'mix',
    voltar: MENU,
    proxima: n < ETAPAS.length ? () => irPara('#/cvc/etapa/' + (n + 1)) : MENU,
  };
  return { montar, ler, qual, escrever }[e.tipo](raiz, op);
}

function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Palavras CVC 🔤', cor: COR });
  corpo.append(lila('Vamos ler e escrever palavrinhas em inglês!', { fala: FALAS.menu }));
  const atual = etapaAtual();
  const alvo = atual || 1 + Math.floor(Math.random() * ETAPAS.length);
  const e = ETAPAS[alvo - 1];
  const u = unidade(e.unidade);
  corpo.append(h('button', {
    class: 'lt-continuar cv-continuar',
    onclick: () => { falar(atual ? FALAS.continuar : FALAS.fim); irPara('#/cvc/etapa/' + alvo); },
  },
  h('span', { class: 'lt-continuar-emoji' }, atual ? '▶' : '🔁'),
  h('span', { class: 'lt-continuar-txt' }, h('b', null, atual ? 'Continuar' : 'Revisão'), h('small', null, `${u.titulo} · ${e.titulo}`))));

  let fase = '';
  let grade = null;
  ETAPAS.forEach((et, i) => {
    const n = i + 1;
    if (et.fase !== fase) {
      fase = et.fase;
      const un = unidade(et.unidade);
      corpo.append(h('p', { class: 'xt-secao' }, fase, h('span', { class: 'cv-exemplos' }, ' · ' + un.palavras.slice(0, 4).map((p) => p.w).join(', '))));
      grade = h('div', { class: 'lt-trilha-grade' });
      corpo.append(grade);
    }
    const livre = liberada(n);
    const est = feito(chaveEtapa(n));
    grade.append(h('button', {
      class: 'lt-etapa' + (livre ? '' : ' bloqueada') + (n === atual ? ' atual' : '') + (est ? ' feita' : ''),
      onclick: () => {
        if (livre) return irPara('#/cvc/etapa/' + n);
        sfx.errado();
        falar(FALA_TRANCADA);
      },
      'aria-label': `Etapa ${n}`,
    },
    h('span', { class: 'lt-etapa-n' }, livre ? String(n) : '🔒'),
    h('span', { class: 'lt-etapa-emoji' }, et.emoji),
    h('span', { class: 'lt-etapa-tit' }, et.titulo),
    h('span', { class: 'lt-etapa-est' }, est ? '★'.repeat(est) + '☆'.repeat(3 - est) : '')));
  });
}

// palavra desenhada na pauta, com cada letra na cor da família (girafa/tartaruga/macaco)
function palavraNaPauta(w, { cores = true, classe = 'cv-pauta' } = {}) {
  const larg = larguraPalavra(w) + 20;
  const svg = pautaSVG(larg, { classe });
  conteudo(svg).append(palavraG(w, { x: 10, cores: cores ? corDa : null }));
  return svg;
}

// palavras da rodada: sorteadas da unidade, sem repetir
const sortear = (palavras, n) => sample(palavras, Math.min(n, palavras.length));

// ---------- 1. Ouça e monte ----------
function montar(raiz, op) {
  const alvos = sortear(op.palavras, 6);
  jogo(raiz, {
    titulo: op.titulo, cor: op.cor, voltar: op.voltar, proxima: op.proxima,
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, falarInstrucao: false,
    instrucao: { texto: 'Escute a palavra e monte com as letrinhas!', fala: FALAS.montar },
    rodada: (i, area) => new Promise((ok) => {
      const p = alvos[i];
      const gs = grafemas(p.w);
      const sobra = sample(LETRAS_ESCOLA.filter((l) => !gs.includes(l)), 2);
      let pos = 0;
      let primeira = true;
      const casas = gs.map(() => h('div', { class: 'cv-casa' }));
      const pronta = h('div', { class: 'cv-pronta' });
      const pecas = shuffle([...gs, ...sobra]).map((g) => {
        const b = h('button', { class: 'cv-peca', 'aria-label': g }, pecaSVG(g));
        b.addEventListener('click', () => {
          if (b.disabled || pos >= gs.length) return;
          if (g === gs[pos]) {
            sfx.pop();
            b.disabled = true;
            b.classList.add('usada');
            casas[pos].replaceChildren(pecaSVG(g));
            casas[pos].classList.add('cheia');
            pos++;
            if (pos === gs.length) terminar();
          } else {
            primeira = false;
            sfx.errado();
            b.classList.remove('xt-op-errada');
            void b.offsetWidth;
            b.classList.add('xt-op-errada');
            setTimeout(() => b.classList.remove('xt-op-errada'), 500);
            dizer(p.w);
          }
        });
        return b;
      });
      async function terminar() {
        sfx.certo();
        pronta.replaceChildren(palavraNaPauta(p.w));
        await dizer(p.w);
        elogiar();
        await wait(900);
        ok(primeira);
      }
      area.append(
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-figura' }, h('span', { class: 'xt-emoji-grande' }, p.e)), botaoOuvir(() => dizer(p.w))),
        h('div', { class: 'cv-casas' }, casas),
        h('div', { class: 'cv-pecas' }, pecas),
        pronta,
      );
      if (i === 0) falarVarias([[FALAS.montar, 'pt'], [p.w, 'en']]);
      else dizer(p.w);
    }),
  });
}

// peça com a letra no formato da escola (mesmo desenho da pauta, sem as linhas)
function pecaSVG(g) {
  const w = larguraPalavra(g, 4);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `-12 -8 ${w + 24} 166`);
  svg.setAttribute('class', 'cv-peca-svg');
  svg.append(palavraG(g, { espaco: 4, cores: corDa }));
  return svg;
}

// figuras para as opções: diferentes da certa e sem confundir com ela
function outrasFiguras(certa, palavras, n) {
  const todas = UNIDADES.find((u) => u.id === 'mix').palavras;
  const base = [...shuffle(palavras), ...shuffle(todas)];
  const escolhidas = [];
  for (const p of base) {
    if (escolhidas.length === n) break;
    if (p.w === certa.w || p.e === certa.e || conflitam(p.w, certa.w)) continue;
    if (escolhidas.some((q) => q.w === p.w || q.e === p.e || conflitam(q.w, p.w))) continue;
    escolhidas.push(p);
  }
  return escolhidas;
}

// ---------- 2. Leia e ache ----------
function ler(raiz, op) {
  const alvos = sortear(op.palavras, 6);
  jogo(raiz, {
    titulo: op.titulo, cor: op.cor, voltar: op.voltar, proxima: op.proxima,
    modulo: MOD, atividade: op.chave, rodadas: alvos.length,
    instrucao: { texto: 'Leia a palavra e toque na figura certa!', fala: FALAS.ler },
    rodada: (i, area) => {
      const p = alvos[i];
      const opcoes = shuffle([p, ...outrasFiguras(p, op.palavras, 2)]).map((q) => ({
        certo: q.w === p.w,
        el: h('button', { class: 'xt-ficha cv-op-figura', 'aria-label': q.w }, h('span', { class: 'xt-emoji-grande' }, q.e)),
      }));
      area.append(
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-palavra' }, palavraNaPauta(p.w, { cores: false })), botaoOuvir(() => dizer(p.w))),
        h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)),
      );
      return escolher(opcoes, { aoAcertar: () => dizer(p.w), falarElogio: false });
    },
  });
}

// ---------- 3. Qual palavra? (palavras que mudam numa letra só) ----------
function opcoesParecidas(w, comFinais) {
  const g = grafemas(w);
  // nas unidades de vogal, nada de ck/ff/ll/ss (eles têm a unidade deles)
  const lista = shuffle(parecidas(w).filter((d) => comFinais || !/(ck|ff|ll|ss)$/.test(d)));
  // de preferência uma mudando no começo/meio e outra no fim, para olhar cada letra
  const lugar = (d) => grafemas(d).findIndex((x, k) => x !== g[k]);
  const escolhidas = [];
  for (const d of lista) {
    if (escolhidas.length === 2) break;
    if (escolhidas.length && lugar(escolhidas[0]) === lugar(d) && lista.some((x) => lugar(x) !== lugar(escolhidas[0]) && !escolhidas.includes(x))) continue;
    escolhidas.push(d);
  }
  return escolhidas;
}
function qual(raiz, op) {
  const alvos = sortear(op.palavras, 6);
  jogo(raiz, {
    titulo: op.titulo, cor: op.cor, voltar: op.voltar, proxima: op.proxima,
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, falarInstrucao: false,
    instrucao: { texto: 'Escute e toque na palavra certa!', fala: FALAS.qual },
    rodada: (i, area) => {
      const p = alvos[i];
      const opcoes = shuffle([p.w, ...opcoesParecidas(p.w, op.comFinais)]).map((w) => ({
        certo: w === p.w,
        el: h('button', { class: 'xt-ficha cv-palavra', 'aria-label': w }, palavraNaPauta(w, { cores: false })),
      }));
      const premio = h('div', { class: 'lt-premio' });
      area.append(
        h('div', { class: 'cv-topo' }, botaoOuvir(() => dizer(p.w))),
        h('div', { class: 'xt-opcoes cv-coluna' }, opcoes.map((o) => o.el)),
        premio,
      );
      if (i === 0) falarVarias([[FALAS.qual, 'pt'], [p.w, 'en']]);
      else dizer(p.w);
      return escolher(opcoes, {
        aoAcertar: () => premio.replaceChildren(h('span', { class: 'lt-premio-emoji' }, p.e)),
      });
    },
  });
}

// ---------- 4. Escreva na pauta: com a trilha e depois sozinha ----------
function escrever(raiz, op) {
  const alvos = sortear(op.palavras, 3);
  let acertosDePrimeira = 0;
  function cabecalho(i, p) {
    const t = tela(raiz, { titulo: op.titulo, cor: op.cor, voltar: op.voltar });
    t.corpo.append(h('div', { class: 'xt-bolinhas' }, alvos.map((_, k) => h('i', { class: k < i ? 'ok' : k === i ? 'meio' : '' }))));
    t.corpo.append(h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-figura cv-figura-peq' }, h('span', { class: 'xt-emoji-grande' }, p.e)), botaoOuvir(() => dizer(p.w))));
    return t;
  }
  function comTrilha(i) {
    const p = alvos[i];
    const { corpo } = cabecalho(i, p);
    const dica = lila('Escreva a palavra seguindo a trilha!', { fala: FALAS.escrever });
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, caixa);
    montarTracado(caixa, corpo, p.w, {
      cor: op.cor,
      aviso: avisador(dica),
      aoFim: async () => {
        sfx.certo();
        await dizer(p.w);
        await dica.trocar('Agora escreva sozinha, sem a trilha!', FALAS.escreverSozinha);
        sozinha(i);
      },
    });
    if (i === 0) falarVarias([[FALAS.escrever, 'pt'], [p.w, 'en']]);
    else dizer(p.w);
  }
  function sozinha(i) {
    const p = alvos[i];
    const { corpo } = cabecalho(i, p);
    const dica = lila('Escreva sozinha, respeitando as linhas.', { fala: FALAS_LETRAS.escreverPalavra });
    const modelo = h('div', { class: 'lt-modelo' }, palavraNaPauta(p.w, { classe: 'pauta-modelo' }));
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, modelo, caixa);
    const livre = montarLivre(caixa, corpo, p.w);
    let tentativas = 0;
    corpo.append(h('div', { class: 'lt-botoes' },
      h('button', { class: 'xt-btn xt-btn-2', onclick: () => livre.apagar() }, '🧽 Apagar'),
      h('button', { class: 'xt-btn', onclick: async () => {
        const erro = livre.conferir();
        if (erro === FALAS_LETRAS.escrevaPrimeiro) return dica.trocar(erro);
        tentativas++;
        if (erro) { sfx.errado(); return dica.trocar(erro); }
        if (tentativas === 1) acertosDePrimeira++;
        sfx.certo();
        await dica.trocar('Sua palavra respeitou a pauta!', FALAS_LETRAS.palavraRespeitou);
        if (i + 1 < alvos.length) return comTrilha(i + 1);
        const pct = acertosDePrimeira / alvos.length;
        const est = pct >= 0.9 ? 3 : pct >= 0.5 ? 2 : 1;
        progresso.registrar(MOD, op.chave, est);
        festa(raiz, { estrelas: est, frase: 'Sua palavra respeitou a pauta!', deNovo: () => escrever(raiz, op), voltar: op.voltar, proxima: op.proxima });
      } }, 'Pronto ✓'),
    ));
  }
  comTrilha(0);
}
