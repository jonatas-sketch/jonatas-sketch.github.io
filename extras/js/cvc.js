// Palavras CVC: ler e escrever palavrinhas de 3 pedacinhos em inglês, com as letras da escola.
// Trilha por vogal (a → i → o → u → e → finais ck ff ll ss → todas), 4 etapas em cada:
// ouça e monte · leia e ache · qual palavra? · escreva na pauta.
// Tudo falado em inglês, do jeito da professora: "c… a… t… cat!" (sons gravados em /audio/fonemas).
import {
  h, wait, shuffle, sample, pick, falar, falarVarias, sfx, progresso, tocarArquivo, temVoz,
  irPara, missaoAtiva, tela, lila, jogo, festa, escolher, estilo, botaoOuvir,
} from './core.js';
import { UNIDADES, unidade, grafemas, conflitam, parecidas, LETRAS_ESCOLA, FALAS, ETAPAS, FAMILIAS_CVC, VOGAIS, ehVogal, figuraDe, DICIONARIO, ELOGIOS_EN, TENTE_EN, ESCRITA_EN, ALFABETO, NOME_EN } from './cvc-dados.js';
import { FAMILIAS, familiaPrincipal } from './letras-dados.js';
import { pautaSVG, conteudo, palavraG, larguraPalavra } from './pauta.js';
import { montarTracado, montarLivre, avisador } from './escrita.js';
import { temSom, urlSom, SONS_ESCOLA } from './fonemas.js';

const MOD = 'cvc';
const COR = '#2BAE9C';
const MENU = () => irPara('#/cvc');
const feito = (chave) => progresso.feito(MOD, chave);
const corDa = (l) => FAMILIAS[familiaPrincipal(l)].cor;
const dizer = (w) => falar(w, 'en');
const elogiar = () => falar(pick(ELOGIOS_EN), 'en');
const tente = () => falar(pick(TENTE_EN), 'en');
const EN = { langInstrucao: 'en', elogiosFesta: ELOGIOS_EN };

export function abrir(raiz, partes) {
  estilo('letras');
  estilo('cvc');
  const [a, b] = partes;
  if (a === 'etapa') return rodarEtapa(raiz, Number(b));
  if (a === 'sons') return sons(raiz, { titulo: '🔊 Letter sounds', cor: COR, voltar: MENU });
  if (a === 'abc') return alfabeto(raiz, { titulo: '🔤 ABC', cor: COR, voltar: MENU });
  return menu(raiz);
}

// ---------- trilha ----------
// a chave é estável (ex.: "a-montar"), para o progresso não se perder se a trilha mudar de ordem
const chaveEtapa = (n) => ETAPAS[n - 1].chave;
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
    titulo: e.tipo === 'intro' || e.tipo === 'sons' ? `${e.emoji} ${e.titulo}` : `${u.emoji} ${e.titulo}`,
    cor: u.cor,
    palavras: u.palavras,
    comFinais: u.id === 'fim' || u.id === 'mix',
    voltar: MENU,
    proxima: missaoAtiva() ? () => irPara('#/missao') : n < ETAPAS.length ? () => irPara('#/cvc/etapa/' + (n + 1)) : MENU,
  };
  op.unidade = u.id;
  return { sons, intro, aprender, completar, montar, ler, qual, escrever }[e.tipo](raiz, op);
}

function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'CVC Words 🔤', cor: COR });
  corpo.append(lila(FALAS.menu, { lang: 'en' }));
  const atual = etapaAtual();
  const alvo = atual || 1 + Math.floor(Math.random() * ETAPAS.length);
  const e = ETAPAS[alvo - 1];
  const u = unidade(e.unidade);
  corpo.append(h('button', {
    class: 'lt-continuar cv-continuar',
    onclick: () => { dizer(atual ? FALAS.continuar : FALAS.fim); irPara('#/cvc/etapa/' + alvo); },
  },
  h('span', { class: 'lt-continuar-emoji' }, atual ? '▶' : '🔁'),
  h('span', { class: 'lt-continuar-txt' }, h('b', null, atual ? (atual === 1 ? 'Start' : 'Keep going') : 'Review'), h('small', null, e.fase.startsWith('⭐') ? e.titulo : `${u.titulo} · ${e.titulo}`))));
  corpo.append(h('div', { class: 'lt-botoes' },
    h('button', { class: 'xt-btn cv-btn-sons', onclick: () => irPara('#/cvc/sons') }, '🔊 Letter sounds'),
    h('button', { class: 'xt-btn cv-btn-sons cv-btn-abc', onclick: () => irPara('#/cvc/abc') }, '🔤 ABC')));

  let fase = '';
  let grade = null;
  ETAPAS.forEach((et, i) => {
    const n = i + 1;
    if (et.fase !== fase) {
      fase = et.fase;
      const un = unidade(et.unidade);
      const exemplos = et.fase.startsWith('⭐') ? '' : ' · ' + un.palavras.slice(0, 4).map((p) => p.w).join(', ');
      corpo.append(h('p', { class: 'xt-secao' }, fase, h('span', { class: 'cv-exemplos' }, exemplos)));
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
        dizer(FALAS.trancada);
      },
      'aria-label': `Step ${n}`,
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
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, falarInstrucao: false, ...EN,
    instrucao: { texto: FALAS.montar },
    rodada: (i, area) => new Promise((ok) => {
      const p = alvos[i];
      const gs = grafemas(p.w);
      const sobra = sample(LETRAS_ESCOLA.filter((l) => !gs.includes(l)), 2);
      let pos = 0;
      let primeira = true;
      const caixas = caixasCVC(gs, { vazias: gs.map((_, k) => k) });
      const pronta = h('div', { class: 'cv-pronta' });
      const pecas = shuffle([...gs, ...sobra]).map((g) => {
        const b = h('button', { class: 'cv-peca', 'aria-label': g }, pecaSVG(g));
        b.addEventListener('click', () => {
          if (b.disabled || pos >= gs.length) return;
          if (g === gs[pos]) {
            b.disabled = true;
            b.classList.add('usada');
            const casa = caixas.casa(pos);
            casa.replaceChildren(pecaSVG(g));
            casa.classList.add('cheia');
            // ao colocar a letra, ouve o som dela (quando já gravado)
            if (temSom(g)) tocarArquivo(urlSom(g));
            else sfx.pop();
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
        await wait(350);
        await soletrar(p.w, caixas);
        pronta.replaceChildren(palavraNaPauta(p.w));
        elogiar();
        await wait(900);
        ok(primeira);
      }
      area.append(
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-figura' }, h('span', { class: 'xt-emoji-grande' }, p.e)), botaoOuvir(() => dizer(p.w))),
        caixas,
        h('div', { class: 'cv-pecas' }, pecas),
        pronta,
      );
      if (i === 0) falarVarias([[FALAS.montar, 'en'], [p.w, 'en']]);
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

// ---------- caixinhas C V C ----------
// gs = pedacinhos da palavra; vazias = posições sem letra (mostra "?")
function caixasCVC(gs, { vazias = [], animar = false } = {}) {
  const casas = gs.map((g, i) => {
    const casa = h('div', { class: 'cv-casa' + (ehVogal(g[0]) ? ' vogal' : '') + (vazias.includes(i) ? '' : ' cheia') },
      vazias.includes(i) ? h('span', { class: 'cv-interroga' }, '?') : pecaSVG(g));
    if (animar && !vazias.includes(i)) casa.style.animationDelay = i * 0.6 + 's';
    if (animar) casa.classList.add('cv-entra');
    return h('div', { class: 'cv-casa-col' }, casa);
  });
  const el = h('div', { class: 'cv-casas' }, casas);
  el.casa = (i) => casas[i].firstChild;
  return el;
}

// "c… a… t… cat": cada caixinha acende com o som da letra, depois a palavra inteira.
// Sem o arquivo do som (ainda não gravado), a caixinha só acende em silêncio.
let soletrando = 0;
async function soletrar(w, caixas) {
  const minha = ++soletrando;
  const gs = grafemas(w);
  await wait(250);
  for (let i = 0; i < gs.length; i++) {
    if (minha !== soletrando || !caixas.isConnected) return;
    const casa = caixas.casa(i);
    casa.classList.add('cv-soando');
    if (temSom(gs[i])) await tocarArquivo(urlSom(gs[i]));
    else await wait(420);
    await wait(260);
    casa.classList.remove('cv-soando');
  }
  if (minha !== soletrando || !caixas.isConnected) return;
  caixas.classList.add('cv-junta');
  await dizer(w);
  caixas.classList.remove('cv-junta');
}
// botão para ouvir de novo devagar (letra por letra)
const botaoSoletrar = (w, caixas) => h('button', { class: 'xt-ouvir cv-devagar', 'aria-label': 'Sound it out again', onclick: () => soletrar(w, caixas) }, '🐢');

// ---------- 🔊 Letter sounds: o som de cada letra, uma a uma (como "Learn single letter sounds") ----------
function sons(raiz, op) {
  const { corpo } = tela(raiz, { titulo: op.titulo, cor: op.cor, voltar: op.voltar });
  corpo.append(lila(FALAS.sons, { lang: 'en' }));
  const vistos = new Set();
  const fim = h('div', { class: 'lt-botoes' });
  const cartas = SONS_ESCOLA.map(([g, w, e]) => {
    const b = h('button', { class: 'xt-ficha cv-som', 'aria-label': g },
      h('div', { class: 'cv-casa cheia' + (ehVogal(g[0]) ? ' vogal' : '') }, pecaSVG(g)),
      h('span', { class: 'cv-som-fig' }, e), h('small', null, w));
    b.addEventListener('click', () => tocar(g, w, b, true));
    return b;
  });
  async function tocar(g, w, b, comPalavra) {
    for (const c of cartas) c.classList.remove('soando');
    b.classList.add('soando', 'visto');
    vistos.add(g);
    if (temSom(g)) await tocarArquivo(urlSom(g));
    if (comPalavra) {
      await wait(350);
      await dizer(w);
    }
    b.classList.remove('soando');
    if (vistos.size === cartas.length && !fim.childElementCount) concluir();
  }
  let tocandoTodos = 0;
  async function todos() {
    const minha = ++tocandoTodos;
    await dizer(FALAS.sonsTodos);
    for (let i = 0; i < cartas.length; i++) {
      if (minha !== tocandoTodos || !cartas[i].isConnected) return;
      cartas[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await tocar(SONS_ESCOLA[i][0], SONS_ESCOLA[i][1], cartas[i], false);
      await wait(650);
    }
  }
  function concluir() {
    if (op.chave) progresso.registrar(MOD, op.chave, 3);
    dizer(FALAS.sonsFim);
    fim.append(op.proxima
      ? h('button', { class: 'xt-btn', onclick: op.proxima }, 'Next ▶')
      : h('button', { class: 'xt-btn', onclick: op.voltar }, 'Done ✓'));
  }
  corpo.append(
    h('div', { class: 'lt-botoes' }, h('button', { class: 'xt-btn xt-btn-2', onclick: () => todos() }, '▶ Play all')),
    h('div', { class: 'cv-sons' }, cartas),
    fim,
  );
  dizer(FALAS.sons);
}

// ---------- 🔤 ABC: o NOME de cada letra em inglês, de A a Z ----------
function alfabeto(raiz, op) {
  const { corpo } = tela(raiz, { titulo: op.titulo, cor: op.cor, voltar: op.voltar });
  corpo.append(lila(FALAS.abc, { lang: 'en' }));
  const vistos = new Set();
  const fim = h('div', { class: 'lt-botoes' });
  // uma voz só no alfabeto: a da Lila quando as 26 estiverem gravadas, senão a do aparelho em todas
  const todasGravadas = ALFABETO.every((l) => temVoz(NOME_EN[l], 'en'));
  const nome = (l) => falar(NOME_EN[l], 'en', { aparelho: !todasGravadas });
  const cartas = ALFABETO.map((l) => {
    const b = h('button', { class: 'xt-ficha cv-abc' + (ehVogal(l) ? ' vogal' : ''), 'aria-label': l },
      h('span', { class: 'cv-abc-mai' }, l.toUpperCase()), pecaSVG(l));
    b.addEventListener('click', () => dizerLetra(l, b));
    return b;
  });
  async function dizerLetra(l, b) {
    for (const c of cartas) c.classList.remove('soando');
    b.classList.add('soando', 'visto');
    vistos.add(l);
    await nome(l);
    b.classList.remove('soando');
    if (vistos.size === cartas.length && !fim.childElementCount) {
      dizer(FALAS.abcFim);
      fim.append(h('button', { class: 'xt-btn', onclick: op.voltar }, 'Done ✓'));
    }
  }
  let recitando = 0;
  async function todos() {
    const minha = ++recitando;
    await dizer(FALAS.abcTodos);
    for (let i = 0; i < cartas.length; i++) {
      if (minha !== recitando || !cartas[i].isConnected) return;
      cartas[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      await dizerLetra(ALFABETO[i], cartas[i]);
      await wait(250);
    }
  }
  corpo.append(
    h('div', { class: 'lt-botoes' }, h('button', { class: 'xt-btn xt-btn-2', onclick: () => todos() }, '▶ Play all')),
    h('div', { class: 'cv-abcs' }, cartas),
    fim,
  );
  dizer(FALAS.abc);
}

// ---------- ⭐ Sound it out! (ensina antes de pedir, em inglês como na escola) ----------
// som de uma letra (quando já gravado) e depois a palavra: "a… apple!"
async function somEPalavra(g, w) {
  if (temSom(g)) {
    await tocarArquivo(urlSom(g));
    await wait(300);
  }
  await dizer(w);
}
function intro(raiz, op) {
  const passos = [
    (corpo) => {
      corpo.append(
        lila(FALAS.intro1, { lang: 'en' }),
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-figura' }, h('span', { class: 'xt-emoji-grande' }, '🐱'))),
      );
      const caixas = caixasCVC(grafemas('cat'), { animar: true });
      corpo.append(caixas, h('div', { class: 'lt-botoes' }, botaoSoletrar('cat', caixas)));
      dizer(FALAS.intro1).then(() => soletrar('cat', caixas));
    },
    (corpo) => {
      corpo.append(
        lila(FALAS.intro2, { lang: 'en' }),
        h('div', { class: 'cv-vogais' }, VOGAIS.map(([v, w, e]) => h('button', { class: 'xt-ficha cv-vogal', onclick: () => somEPalavra(v, w), 'aria-label': w },
          h('div', { class: 'cv-casa vogal cheia' }, pecaSVG(v)), h('span', { class: 'cv-vogal-fig' }, e), h('b', null, w)))),
      );
      dizer(FALAS.intro2);
    },
    (corpo) => {
      corpo.append(lila(FALAS.intro3, { lang: 'en' }));
      for (const w of ['cat', 'dog', 'sun']) {
        const p = figuraDe(w);
        const caixas = caixasCVC(grafemas(w));
        corpo.append(h('button', { class: 'xt-ficha cv-exemplo', onclick: () => soletrar(w, caixas), 'aria-label': w },
          h('span', { class: 'cv-exemplo-fig' }, p.e), caixas));
      }
      dizer(FALAS.intro3);
    },
  ];
  let i = 0;
  function mostrar() {
    const { corpo } = tela(raiz, { titulo: op.titulo, cor: op.cor, voltar: op.voltar });
    corpo.append(h('div', { class: 'xt-bolinhas' }, passos.map((_, k) => h('i', { class: k < i ? 'ok' : k === i ? 'meio' : '' }))));
    passos[i](corpo);
    corpo.append(h('button', {
      class: 'xt-btn cv-seguir',
      onclick: () => {
        i++;
        if (i < passos.length) return mostrar();
        progresso.registrar(MOD, op.chave, 3);
        festa(raiz, { estrelas: 3, voltar: op.voltar, proxima: op.proxima, lang: 'en', elogios: ELOGIOS_EN });
      },
    }, i < passos.length - 1 ? 'Next ▶' : "Let's go! ▶"));
  }
  mostrar();
}

// ---------- 📖 Famílias de palavras: o final fica, a primeira letrinha muda ----------
function aprender(raiz, op) {
  const familias = FAMILIAS_CVC[op.unidade];
  let f = 0;
  function familia() {
    const [rima, palavras] = familias[f];
    const { corpo } = tela(raiz, { titulo: op.titulo, cor: op.cor, voltar: op.voltar });
    corpo.append(h('div', { class: 'xt-bolinhas' }, familias.map((_, k) => h('i', { class: k < f ? 'ok' : k === f ? 'meio' : '' }))));
    const dica = lila(FALAS.familia, { lang: 'en' });
    const gsRima = grafemas('x' + rima).slice(1);
    const caixas = caixasCVC(['?', ...gsRima], { vazias: [0] });
    const figura = h('div', { class: 'xt-ficha cv-figura cv-fig-familia' }, h('span', { class: 'cv-interroga' }, '?'));
    const vistas = new Set();
    const seguir = h('div', { class: 'lt-botoes' });
    const letras = palavras.map((w) => {
      const g = grafemas(w)[0];
      const b = h('button', { class: 'cv-peca', 'aria-label': g }, pecaSVG(g));
      b.addEventListener('click', () => escolherInicio(w, g, b));
      return b;
    });
    function escolherInicio(w, g, b) {
      sfx.pop();
      for (const x of letras) x.classList.toggle('ativa', x === b);
      const casa = caixas.casa(0);
      casa.replaceChildren(pecaSVG(g));
      casa.classList.add('cheia');
      casa.classList.remove('cv-pula');
      void casa.offsetWidth;
      casa.classList.add('cv-pula');
      figura.replaceChildren(h('span', { class: 'xt-emoji-grande' }, figuraDe(w).e), h('b', { class: 'cv-palavra-txt' }, w));
      b.classList.add('vista');
      vistas.add(w);
      soletrar(w, caixas);
      if (vistas.size === palavras.length && !seguir.childElementCount) {
        setTimeout(() => {
          if (!seguir.isConnected) return;
          dizer(FALAS.familiaFim);
          seguir.append(h('button', { class: 'xt-btn', onclick: () => {
            f++;
            if (f < familias.length) return familia();
            progresso.registrar(MOD, op.chave, 3);
            festa(raiz, { estrelas: 3, voltar: op.voltar, proxima: op.proxima, lang: 'en', elogios: ELOGIOS_EN });
          } }, f < familias.length - 1 ? 'Next family ▶' : 'Finished! ▶'));
        }, 3200);
      }
    }
    corpo.append(dica, h('p', { class: 'cv-familia-tit' }, 'The ', h('b', null, '_' + rima), ' family'), caixas, figura, h('div', { class: 'cv-pecas' }, letras), seguir);
    // a Lila mostra a primeira palavra; depois é a vez dela
    if (f === 0) {
      dizer(FALAS.familia).then(async () => {
        if (!letras[0].isConnected) return;
        escolherInicio(palavras[0], grafemas(palavras[0])[0], letras[0]);
        await wait(3200);
        if (letras[0].isConnected) dica.trocar(FALAS.familiaToque);
      });
    } else {
      dizer(FALAS.familiaToque);
    }
  }
  familia();
}

// ---------- 🧩 Complete a palavra: falta só uma letrinha ----------
function completar(raiz, op) {
  const alvos = sortear(op.palavras, 6);
  // primeiro falta a do começo, depois a do fim, depois a do meio (a vogal)
  const faltando = (i, n) => (i < 2 ? 0 : i < 4 ? n - 1 : 1);
  jogo(raiz, {
    titulo: op.titulo, cor: op.cor, voltar: op.voltar, proxima: op.proxima,
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, falarInstrucao: false, ...EN,
    instrucao: { texto: FALAS.completar },
    rodada: (i, area) => {
      const p = alvos[i];
      const gs = grafemas(p.w);
      const k = faltando(i, gs.length);
      const certo = gs[k];
      // opções erradas que não formam outra palavra de verdade (para não confundir)
      const base = k === 1 ? ['a', 'e', 'i', 'o', 'u'] : LETRAS_ESCOLA.filter((l) => !ehVogal(l));
      const formaPalavra = (g) => DICIONARIO.includes(gs.map((x, j) => (j === k ? g : x)).join(''));
      const erradas = sample(base.filter((g) => g !== certo && !formaPalavra(g)), 2);
      const caixas = caixasCVC(gs, { vazias: [k] });
      const opcoes = shuffle([certo, ...erradas]).map((g) => ({ g, certo: g === certo, el: h('button', { class: 'cv-peca', 'aria-label': g }, pecaSVG(g)) }));
      area.append(
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-figura' }, h('span', { class: 'xt-emoji-grande' }, p.e)), botaoOuvir(() => dizer(p.w))),
        caixas,
        h('div', { class: 'cv-pecas' }, opcoes.map((o) => o.el)),
      );
      if (i === 0) falarVarias([[FALAS.completar, 'en'], [p.w, 'en']]);
      else dizer(p.w);
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: async () => {
          const casa = caixas.casa(k);
          casa.replaceChildren(pecaSVG(certo));
          casa.classList.add('cheia', 'cv-pula');
          await soletrar(p.w, caixas);
          elogiar();
          await wait(600);
        },
        aoErrar: () => dizer(p.w),
      });
    },
  });
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
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, ...EN,
    instrucao: { texto: FALAS.ler },
    rodada: (i, area) => {
      const p = alvos[i];
      const opcoes = shuffle([p, ...outrasFiguras(p, op.palavras, 2)]).map((q) => ({
        certo: q.w === p.w,
        el: h('button', { class: 'xt-ficha cv-op-figura', 'aria-label': q.w }, h('span', { class: 'xt-emoji-grande' }, q.e)),
      }));
      const premio = h('div', { class: 'cv-premio' });
      area.append(
        h('div', { class: 'cv-topo' }, h('div', { class: 'xt-ficha cv-palavra' }, palavraNaPauta(p.w, { cores: false })), botaoOuvir(() => dizer(p.w))),
        h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)),
        premio,
      );
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: async () => {
          const caixas = caixasCVC(grafemas(p.w));
          premio.replaceChildren(caixas);
          await soletrar(p.w, caixas);
          elogiar();
          await wait(500);
        },
        aoErrar: () => tente(),
      });
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
    modulo: MOD, atividade: op.chave, rodadas: alvos.length, falarInstrucao: false, ...EN,
    instrucao: { texto: FALAS.qual },
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
      if (i === 0) falarVarias([[FALAS.qual, 'en'], [p.w, 'en']]);
      else dizer(p.w);
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: async () => {
          const caixas = caixasCVC(grafemas(p.w));
          premio.replaceChildren(h('span', { class: 'lt-premio-emoji' }, p.e), caixas);
          await soletrar(p.w, caixas);
          elogiar();
          await wait(500);
        },
        aoErrar: () => dizer(p.w),
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
    const dica = lila(FALAS.escrever, { lang: 'en' });
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, caixa);
    montarTracado(caixa, corpo, p.w, {
      cor: op.cor,
      aviso: avisador(dica),
      falas: ESCRITA_EN,
      aoFim: async () => {
        sfx.certo();
        await dizer(p.w);
        await dica.trocar(FALAS.escreverSozinha);
        sozinha(i);
      },
    });
    if (i === 0) falarVarias([[FALAS.escrever, 'en'], [p.w, 'en']]);
    else dizer(p.w);
  }
  function sozinha(i) {
    const p = alvos[i];
    const { corpo } = cabecalho(i, p);
    const dica = lila(FALAS.escreverPalavra, { lang: 'en' });
    const modelo = h('div', { class: 'lt-modelo' }, palavraNaPauta(p.w, { classe: 'pauta-modelo' }));
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, modelo, caixa);
    const livre = montarLivre(caixa, corpo, p.w, ESCRITA_EN);
    let tentativas = 0;
    corpo.append(h('div', { class: 'lt-botoes' },
      h('button', { class: 'xt-btn xt-btn-2', onclick: () => livre.apagar() }, '🧽 Clear'),
      h('button', { class: 'xt-btn', onclick: async () => {
        const erro = livre.conferir();
        if (erro === ESCRITA_EN.escrevaPrimeiro) return dica.trocar(erro);
        tentativas++;
        if (erro) { sfx.errado(); return dica.trocar(erro); }
        if (tentativas === 1) acertosDePrimeira++;
        sfx.certo();
        await dica.trocar(FALAS.respeitou);
        if (i + 1 < alvos.length) return comTrilha(i + 1);
        const pct = acertosDePrimeira / alvos.length;
        const est = pct >= 0.9 ? 3 : pct >= 0.5 ? 2 : 1;
        progresso.registrar(MOD, op.chave, est);
        festa(raiz, { estrelas: est, frase: FALAS.respeitou, lang: 'en', deNovo: () => escrever(raiz, op), voltar: op.voltar, proxima: op.proxima });
      } }, 'Done ✓'),
    ));
  }
  comTrilha(0);
}
