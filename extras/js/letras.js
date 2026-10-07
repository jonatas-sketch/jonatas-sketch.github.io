// Letras na Pauta: famílias da girafa, da tartaruga e do macaco e os limites da escrita
// (pauta de 3 linhas, como a folha da escola). Trilha de etapas em sequência + brincar livre.
// Tudo o que a Lila fala está em letras-dados.js (FALAS), para gravar na voz dela.
import {
  h, s, wait, shuffle, pick, sample, falar, falarVarias, sfx, elogiar, tentarDeNovo, progresso,
  irPara, tela, cartao, lila, jogo, festa, escolher, estilo, botaoOuvir,
} from './core.js';
import { FALA_TRANCADA } from './falas-core.js';
import {
  LETRAS, FAMILIAS, familiasDe, familiaPrincipal, ORDEM_ESCOLA, ANCORA_EN, falaLetraEn, falaFamiliaEn,
  FALAS, ERROS, ETAPAS, PALAVRAS_FORMA,
} from './letras-dados.js';
import { pautaSVG, conteudo, letraG, palavraG, larguraPalavra, posicoes, TOPO, MEIO, CHAO, PORAO } from './pauta.js';
import { montarTracado, montarLivre, avisador } from './escrita.js';

const MOD = 'letras';
const COR = '#E0A21F';
const MENU = () => irPara('#/letras');
const feito = (chave) => progresso.feito(MOD, chave);
const letraEn = (l) => falar(falaLetraEn(l), 'en');

export function abrir(raiz, partes) {
  estilo('letras');
  const [tela1, arg] = partes;
  if (tela1 === 'etapa') return rodarEtapa(raiz, Number(arg));
  if (tela1 === 'conhecer') return conhecer(raiz);
  if (tela1 === 'casinha') return casinha(raiz);
  if (tela1 === 'certinho') return certinho(raiz);
  if (tela1 === 'ouvir') return ouvir(raiz);
  if (tela1 === 'tracar') {
    if (arg && LETRAS[arg]) return tracarLetras(raiz, { letras: [arg], voltar: () => irPara('#/letras/tracar') });
    return escolherLetra(raiz);
  }
  if (tela1 === 'intruso') return intruso(raiz);
  if (tela1 === 'forma') return forma(raiz);
  return menu(raiz);
}

// ---------- trilha ----------
const chaveEtapa = (n) => 'etapa-' + n;
const etapaLiberada = (n) => n === 1 || progresso.liberarTudo() || feito(chaveEtapa(n - 1)) > 0;
const etapaAtual = () => {
  const n = ETAPAS.findIndex((_, i) => !feito(chaveEtapa(i + 1)));
  return n === -1 ? null : n + 1;
};

function rodarEtapa(raiz, n) {
  const e = ETAPAS[n - 1];
  if (!e || !etapaLiberada(n)) return MENU();
  const op = {
    chave: chaveEtapa(n),
    titulo: `Etapa ${n} · ${e.titulo}`,
    voltar: MENU,
    proxima: n < ETAPAS.length ? () => irPara('#/letras/etapa/' + (n + 1)) : MENU,
    letras: e.letras,
    foco: e.foco,
    palavras: e.palavras,
  };
  const tipos = { conhecer, casinha, certinho, intruso, forma, ouvir, tracar: tracarLetras, palavras: tracarPalavras, escrever: escreverPalavras };
  return tipos[e.tipo](raiz, op);
}

function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Letras na Pauta 🦒🐢🐒', cor: COR });
  corpo.append(lila('Cada letra mora numa casinha da pauta. Vamos descobrir?', { fala: FALAS.menu }));

  const atual = etapaAtual();
  const alvo = atual || 1 + Math.floor(Math.random() * ETAPAS.length);
  const e = ETAPAS[alvo - 1];
  corpo.append(h('button', {
    class: 'lt-continuar',
    onclick: () => { falar(atual ? FALAS.continuar : FALAS.trilhaFim); irPara('#/letras/etapa/' + alvo); },
  },
  h('span', { class: 'lt-continuar-emoji' }, atual ? '▶' : '🔁'),
  h('span', { class: 'lt-continuar-txt' }, h('b', null, atual ? 'Continuar a trilha' : 'Revisão'), h('small', null, `Etapa ${alvo} · ${e.titulo}`))));

  // a trilha inteira, por fase
  let fase = '';
  let grade = null;
  ETAPAS.forEach((et, i) => {
    const n = i + 1;
    if (et.fase !== fase) {
      fase = et.fase;
      corpo.append(h('p', { class: 'xt-secao' }, fase));
      grade = h('div', { class: 'lt-trilha-grade' });
      corpo.append(grade);
    }
    const livre = etapaLiberada(n);
    const est = feito(chaveEtapa(n));
    grade.append(h('button', {
      class: 'lt-etapa' + (livre ? '' : ' bloqueada') + (n === atual ? ' atual' : '') + (est ? ' feita' : ''),
      onclick: () => {
        if (livre) return irPara('#/letras/etapa/' + n);
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

  const est = (a) => feito(a);
  const tracadas = ORDEM_ESCOLA.filter((l) => feito('tracar-' + l) > 0).length;
  corpo.append(
    h('p', { class: 'xt-secao' }, 'Brincar livre'),
    h('div', { class: 'xt-grade' },
      cartao({ emoji: '🦒', titulo: 'Conheça as famílias', sub: 'Girafa, tartaruga e macaco', cor: '#E0A21F', estrelas: est('conhecer'), onclick: () => irPara('#/letras/conhecer') }),
      cartao({ emoji: '🏠', titulo: 'Cada letra na sua casa', sub: 'De que família é?', cor: '#8FB58A', estrelas: est('casinha'), onclick: () => irPara('#/letras/casinha') }),
      cartao({ emoji: '✅', titulo: 'Está certinho?', sub: 'A letra respeitou a pauta?', cor: '#E8865A', estrelas: est('certinho'), onclick: () => irPara('#/letras/certinho') }),
      cartao({ emoji: '✏️', titulo: 'Traçar na pauta', sub: `${tracadas} de ${ORDEM_ESCOLA.length} letras`, cor: '#DD7AA0', onclick: () => irPara('#/letras/tracar') }),
      cartao({ emoji: '👂', titulo: 'Ouça e ache', sub: 'As letras em inglês', cor: '#4DA6E0', estrelas: est('ouvir'), onclick: () => irPara('#/letras/ouvir') }),
      cartao({ emoji: '🔍', titulo: 'Ache o intruso', sub: 'Qual é de outra família?', cor: '#A98FE0', estrelas: est('intruso'), onclick: () => irPara('#/letras/intruso') }),
      cartao({ emoji: '📦', titulo: 'A forma da palavra', sub: 'Qual palavra cabe nas caixas?', cor: '#5E9A57', estrelas: est('forma'), onclick: () => irPara('#/letras/forma') }),
    ),
  );
}

// Pauta pequena com uma letra no meio (para cartões de escolha)
function miniPauta(l, { alturaY, cor, faixas = false, largura } = {}) {
  const w = largura || Math.max(LETRAS[l].w + 30, 90);
  const svg = pautaSVG(w, { faixas, classe: 'pauta-mini' });
  conteudo(svg).append(letraG(l, { x: (w - LETRAS[l].w) / 2, alturaY, cor }));
  return svg;
}

// primeira rodada: a instrução e depois a letra em inglês, sem uma fala cortar a outra
function falarRodada(i, instrucao, l) {
  if (i === 0) return falarVarias([[instrucao, 'pt'], [falaLetraEn(l), 'en']]);
  return letraEn(l);
}

// ---------- Conheça as famílias ----------
function conhecer(raiz, op = {}) {
  const chave = op.chave || 'conhecer';
  const { corpo } = tela(raiz, { titulo: op.titulo || 'Conheça as famílias', cor: COR, voltar: op.voltar || MENU });
  const vistas = new Set();
  const fala = lila('Toque em cada bicho para conhecer a família dele!', { fala: FALAS.conhecer });
  const larg = 470;
  const svg = pautaSVG(larg, { faixas: true, bichos: true, classe: 'pauta-grande' });
  const zonas = [...svg.querySelectorAll('[data-zona]')];
  const mais = h('div', { class: 'lt-mais' });
  const botoes = h('div', { class: 'lt-bichos' });
  const fim = h('div', { class: 'lt-fim' });
  for (const [k, f] of Object.entries(FAMILIAS)) {
    botoes.append(h('button', {
      class: 'lt-bicho', style: { '--cor': f.cor, '--clara': f.clara }, 'data-f': k,
      onclick: () => mostrar(k),
    }, h('span', { class: 'lt-bicho-emoji' }, f.emoji), h('b', null, f.nome), h('small', null, f.ingles)));
  }
  corpo.append(fala, svg, mais, botoes, fim);
  falar(FALAS.conhecer);

  // cada letra desenhada vira um botão: toca e ouve o nome em inglês
  function letraTocavel(l, x, cor, atraso) {
    const g = s('g', { class: 'lt-letra-toque' });
    g.append(s('rect', { x: x - 6, y: TOPO - 6, width: LETRAS[l].w + 12, height: PORAO - TOPO + 12, fill: 'transparent' }));
    g.append(letraG(l, { x, cor, animar: atraso }));
    g.addEventListener('click', () => {
      g.classList.remove('pulo');
      void g.getBoundingClientRect();
      g.classList.add('pulo');
      letraEn(l);
    });
    return g;
  }

  function mostrar(k) {
    const f = FAMILIAS[k];
    vistas.add(k);
    sfx.pop();
    for (const b of botoes.children) b.classList.toggle('ativo', b.dataset.f === k);
    for (const z of zonas) z.style.opacity = z.dataset.zona === k ? '1' : '0.25';
    for (const b of svg.querySelectorAll('[data-bicho]')) b.style.opacity = b.dataset.bicho === k ? '1' : '0.3';
    const espaco = 14;
    const linhas = [[]];
    for (const l of f.letras) {
      const linha = linhas.at(-1);
      const w = linha.reduce((t, q) => t + LETRAS[q].w + espaco, 0) + LETRAS[l].w;
      if (w > larg && linha.length) linhas.push([l]);
      else linha.push(l);
    }
    const pautas = [svg];
    mais.replaceChildren();
    for (let i = 1; i < linhas.length; i++) {
      const extra = pautaSVG(larg, { faixas: true, bichos: true, classe: 'pauta-grande' });
      for (const z of extra.querySelectorAll('[data-zona]')) z.style.opacity = z.dataset.zona === k ? '1' : '0.25';
      for (const b of extra.querySelectorAll('[data-bicho]')) b.style.opacity = b.dataset.bicho === k ? '1' : '0.3';
      mais.append(extra);
      pautas.push(extra);
    }
    linhas.forEach((linha, n) => {
      const c = conteudo(pautas[n]);
      c.replaceChildren();
      const total = linha.reduce((t, l) => t + LETRAS[l].w + espaco, -espaco);
      let x = (larg - total) / 2;
      linha.forEach((l, i) => {
        c.append(letraTocavel(l, x, f.cor, (n * linha.length + i) * 0.3));
        x += LETRAS[l].w + espaco;
      });
    });
    const explica = k === 'tartaruga' ? f.fala : f.fala + ' ' + FALAS.fEspecial;
    fala.querySelector('.xt-balao').textContent = f.fala;
    falarVarias([[explica, 'pt'], [falaFamiliaEn(k), 'en']]);
    if (vistas.size === 3 && !fim.childElementCount) {
      progresso.registrar(MOD, chave, 3);
      fim.append(h('p', { class: 'lt-dica-peq' }, '👆 Toque nas letras para ouvir o nome em inglês'),
        op.proxima
          ? h('button', { class: 'xt-btn', onclick: op.proxima }, 'Próxima etapa ▶')
          : h('button', { class: 'xt-btn', onclick: () => irPara('#/letras/casinha') }, 'Vamos brincar! ▶'));
    }
  }
}

// ---------- Cada letra na sua casa ----------
function casinha(raiz, op = {}) {
  const letras = shuffle([
    ...sample([...'bdhklt'], 4), 'f',
    ...sample([...FAMILIAS.tartaruga.letras], 4),
    ...sample([...'gjpqy'], 3),
  ]);
  jogo(raiz, {
    titulo: op.titulo || 'Cada letra na sua casa', cor: '#5E9A57', voltar: op.voltar || MENU, proxima: op.proxima,
    modulo: MOD, atividade: op.chave || 'casinha', rodadas: letras.length, falarInstrucao: false,
    instrucao: { texto: 'Em qual casinha mora essa letra?', fala: FALAS.casinha },
    rodada: (i, area) => {
      const l = letras[i];
      const svg = miniPauta(l, { faixas: true, largura: 120 });
      const opcoes = Object.entries(FAMILIAS).map(([k, f]) => ({
        k,
        certo: familiasDe(l).includes(k),
        el: h('button', { class: 'lt-bicho', style: { '--cor': f.cor, '--clara': f.clara } },
          h('span', { class: 'lt-bicho-emoji' }, f.emoji), h('b', null, f.nome)),
      }));
      area.append(
        h('div', { class: 'lt-com-ouvir' },
          h('div', { class: 'xt-ficha lt-ficha-pauta lt-ficha-grande' }, svg),
          botaoOuvir(() => letraEn(l))),
        h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      falarRodada(i, FALAS.casinha, l);
      return escolher(opcoes, {
        falarElogio: l !== 'f',
        aoAcertar: async (o) => {
          conteudo(svg).replaceChildren(letraG(l, { x: (120 - LETRAS[l].w) / 2, cor: FAMILIAS[o.k].cor }));
          if (l === 'f') await falar(FALAS.casinhaF);
        },
        aoErrar: (o) => {
          const f = familiaPrincipal(l);
          if (o.k === 'tartaruga') falar(FALAS.sobeDoMeio);
          else if (f === 'tartaruga') falar(FALAS.soNoMeio);
          else tentarDeNovo();
        },
      });
    },
  });
}

// ---------- Está certinho? ----------
function certinho(raiz, op = {}) {
  const letras = shuffle([...sample([...'bdhklt'], 3), ...sample([...FAMILIAS.tartaruga.letras], 4), ...sample([...'gjpqy'], 3)]);
  jogo(raiz, {
    titulo: op.titulo || 'Está certinho?', cor: '#E8865A', voltar: op.voltar || MENU, proxima: op.proxima,
    modulo: MOD, atividade: op.chave || 'certinho', rodadas: letras.length, falarInstrucao: false,
    instrucao: { texto: 'Qual letra está escrita certinho na pauta?', fala: FALAS.certinho },
    rodada: (i, area) => {
      const l = letras[i];
      const erro = pick(ERROS[familiaPrincipal(l)]);
      const largura = Math.max(LETRAS[l].w + 30, 96);
      const certa = { certo: true, el: h('button', { class: 'xt-ficha lt-ficha-pauta' }, miniPauta(l, { largura })) };
      const errada = { certo: false, el: h('button', { class: 'xt-ficha lt-ficha-pauta' }, miniPauta(l, { largura, alturaY: erro.alt })) };
      area.append(h('div', { class: 'xt-opcoes' }, shuffle([certa, errada]).map((o) => o.el)));
      falarRodada(i, FALAS.certinho, l);
      return escolher([certa, errada], { aoErrar: () => falar(FALAS.errado(erro.msg)) });
    },
  });
}

// ---------- Ache o intruso ----------
function intruso(raiz, op = {}) {
  const sem = (str) => [...str].filter((l) => l !== 'f');
  const grupos = { girafa: sem('bdhklt'), tartaruga: sem(FAMILIAS.tartaruga.letras), macaco: sem('gjpqy') };
  jogo(raiz, {
    titulo: op.titulo || 'Ache o intruso', cor: '#A98FE0', voltar: op.voltar || MENU, proxima: op.proxima,
    modulo: MOD, atividade: op.chave || 'intruso', rodadas: 10,
    instrucao: { texto: 'Três letras são da mesma família. Qual é de outra família?', fala: FALAS.intruso },
    rodada: (i, area) => {
      const [fa, fb] = sample(Object.keys(grupos), 2);
      const iguais = sample(grupos[fa], 3);
      const diferente = pick(grupos[fb]);
      const opcoes = shuffle([...iguais.map((l) => ({ l, certo: false })), { l: diferente, certo: true }]);
      for (const o of opcoes) o.el = h('button', { class: 'xt-ficha lt-ficha-pauta lt-ficha-peq' }, miniPauta(o.l, { largura: 80 }));
      area.append(h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: () => falarVarias([[FALAS.intrusoCerto(fb, fa), 'pt'], [falaLetraEn(diferente), 'en']]),
      });
    },
  });
}

// ---------- A forma da palavra ----------
const formaDe = (p) => [...p].map((l) => familiaPrincipal(l)[0]).join('');
function caixas(palavra) {
  const w = larguraPalavra(palavra);
  const svg = pautaSVG(w, { classe: 'pauta-forma' });
  const c = conteudo(svg);
  for (const { l, x } of posicoes(palavra)) {
    const f = familiaPrincipal(l);
    const [y0, y1] = f === 'girafa' ? [l === 't' ? 14 : TOPO, CHAO] : f === 'macaco' ? [MEIO, PORAO] : [MEIO, CHAO];
    c.append(s('rect', { x: x - 3, y: y0, width: LETRAS[l].w + 6, height: y1 - y0, rx: 6, fill: FAMILIAS[f].clara, stroke: FAMILIAS[f].cor, 'stroke-width': 3 }));
  }
  return { svg, c };
}
function forma(raiz, op = {}) {
  const alvos = sample(PALAVRAS_FORMA, 8);
  jogo(raiz, {
    titulo: op.titulo || 'A forma da palavra', cor: '#4DA6E0', voltar: op.voltar || MENU, proxima: op.proxima,
    modulo: MOD, atividade: op.chave || 'forma', rodadas: alvos.length,
    instrucao: { texto: 'Qual palavra cabe certinho nessas caixas?', fala: FALAS.forma },
    rodada: (i, area) => {
      const alvo = alvos[i];
      const outras = sample(PALAVRAS_FORMA.filter((p) => formaDe(p) !== formaDe(alvo)), 30);
      const escolhidas = [];
      for (const p of outras) {
        if (escolhidas.length === 2) break;
        if (!escolhidas.some((q) => formaDe(q) === formaDe(p))) escolhidas.push(p);
      }
      const { svg, c } = caixas(alvo);
      const opcoes = shuffle([alvo, ...escolhidas]).map((p) => {
        const w = larguraPalavra(p);
        const mini = s('svg', { viewBox: `-8 -10 ${w + 16} 170`, class: 'lt-palavra-svg' }, palavraG(p));
        return { p, certo: p === alvo, el: h('button', { class: 'xt-ficha lt-ficha-palavra' }, mini) };
      });
      area.append(h('div', { class: 'xt-ficha lt-ficha-pauta' }, svg), h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      return escolher(opcoes, {
        aoAcertar: async () => {
          c.append(palavraG(alvo, { cores: (l) => FAMILIAS[familiaPrincipal(l)].cor }));
          falar(alvo, 'en');
          await wait(900);
        },
      });
    },
  });
}

// ---------- Ouça e ache (o nome da letra em inglês) ----------
function ouvir(raiz, op = {}) {
  const todas = op.letras || ORDEM_ESCOLA;
  const foco = op.foco || todas;
  // alvos: cada letra do foco aparece, depois sorteio
  const alvos = [];
  while (alvos.length < 10) alvos.push(...shuffle(foco));
  alvos.length = 10;
  jogo(raiz, {
    titulo: op.titulo || 'Ouça e ache', cor: '#4DA6E0', voltar: op.voltar || MENU, proxima: op.proxima,
    modulo: MOD, atividade: op.chave || 'ouvir', rodadas: alvos.length, falarInstrucao: false,
    instrucao: { texto: 'Escute o nome da letra em inglês e toque nela!', fala: FALAS.ouvir },
    rodada: (i, area) => {
      const l = alvos[i];
      const outras = sample(todas.filter((q) => q !== l), Math.min(todas.length - 1, 3));
      const opcoes = shuffle([l, ...outras]).map((q) => ({
        l: q, certo: q === l,
        el: h('button', { class: 'xt-ficha lt-ficha-pauta lt-ficha-peq' }, miniPauta(q, { largura: 80 })),
      }));
      const premio = h('div', { class: 'lt-premio' });
      area.append(
        h('div', { class: 'lt-com-ouvir' }, botaoOuvir(() => letraEn(l), '🔊')),
        h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)),
        premio);
      falarRodada(i, FALAS.ouvir, l);
      return escolher(opcoes, {
        aoAcertar: () => {
          const [w, e] = ANCORA_EN[l];
          premio.replaceChildren(h('span', { class: 'lt-premio-emoji' }, e), h('b', null, w));
        },
      });
    },
  });
}

// ---------- Traçar na pauta ----------
function escolherLetra(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Traçar na pauta ✏️', cor: '#DD7AA0', voltar: MENU });
  corpo.append(lila('Escolha uma letra para traçar!', { fala: FALAS.escolherLetra }));
  const secoes = [
    ['Dever de casa: p a s t', [...'past']],
    ['Na ordem da escola', ORDEM_ESCOLA],
  ];
  for (const [titulo, lista] of secoes) {
    corpo.append(h('p', { class: 'xt-secao' }, titulo));
    corpo.append(h('div', { class: 'lt-letras' }, lista.map((l) => {
      const f = familiaPrincipal(l);
      const est = feito('tracar-' + l);
      return h('button', {
        class: 'lt-letra-btn', style: { '--clara': FAMILIAS[f].clara, '--cor': FAMILIAS[f].cor },
        onclick: () => irPara('#/letras/tracar/' + l), 'aria-label': 'Letra ' + l,
      }, miniPauta(l, { largura: 80 }), h('span', { class: 'lt-letra-est' }, est ? '★'.repeat(est) : '·'));
    })));
  }
}

// Traçar uma ou várias letras em sequência: cada letra com a trilha e depois sozinha
function tracarLetras(raiz, op) {
  const letras = op.letras;
  const notas = [];
  const voltar = op.voltar || MENU;
  const multi = letras.length > 1;

  function comTela(titulo) {
    const t = tela(raiz, { titulo, cor: '#DD7AA0', voltar });
    if (multi) {
      t.corpo.append(h('div', { class: 'xt-bolinhas' }, letras.map((_, i) => h('i', { class: i < notas.length ? 'ok' : i === notas.length ? 'meio' : '' }))));
    }
    return t;
  }

  function guiada(i) {
    const l = letras[i];
    const f = familiaPrincipal(l);
    const { corpo, atualizarEstrelas } = comTela(op.titulo || `Traçar a letra ${l}`);
    const dica = lila('Comece na bolinha verde e siga a setinha!', { fala: FALAS.tracar(f) });
    const caixa = h('div', { class: 'lt-tracar' });
    const botoes = h('div', { class: 'lt-botoes' }, botaoOuvir(() => letraEn(l)));
    corpo.append(dica, caixa, botoes);
    montarTracado(caixa, corpo, l, {
      cor: FAMILIAS[f].cor,
      aviso: avisador(dica),
      aoFim: async () => {
        sfx.certo();
        progresso.registrar(MOD, 'tracar-' + l, 1);
        atualizarEstrelas();
        await elogiar();
        dica.trocar('Agora tente escrever sozinha, sem a trilha!', FALAS.agoraSozinha(f));
        botoes.replaceChildren(h('button', { class: 'xt-btn', onclick: () => sozinha(i) }, 'Agora sem ajuda ✍️'));
      },
    });
    falarVarias([[i === 0 ? FALAS.tracar(f) : FALAS.proximaLetra, 'pt'], [falaLetraEn(l), 'en']]);
  }

  function sozinha(i) {
    const l = letras[i];
    const f = familiaPrincipal(l);
    const { corpo } = comTela(op.titulo || `Escreva o ${l} sozinha`);
    const dica = lila('Escreva a letra respeitando as linhas da pauta.', { fala: FALAS.livre(f) });
    const modelo = h('div', { class: 'lt-modelo' }, miniPauta(l, { largura: 80, cor: FAMILIAS[f].cor }), botaoOuvir(() => letraEn(l)));
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, modelo, caixa);
    const livre = montarLivre(caixa, corpo, l);
    let tentativas = 0;
    corpo.append(h('div', { class: 'lt-botoes' },
      h('button', { class: 'xt-btn xt-btn-2', onclick: () => livre.apagar() }, '🧽 Apagar'),
      h('button', { class: 'xt-btn', onclick: async () => {
        const erro = livre.conferir();
        if (erro === FALAS.escrevaPrimeiro) return dica.trocar(erro);
        tentativas++;
        if (erro) { sfx.errado(); return dica.trocar(erro); }
        const est = tentativas === 1 ? 3 : 2;
        progresso.registrar(MOD, 'tracar-' + l, est);
        notas.push(est);
        sfx.certo();
        if (i + 1 < letras.length) {
          await dica.trocar('Sua letra respeitou a pauta!', FALAS.respeitou);
          return guiada(i + 1);
        }
        terminar();
      } }, 'Pronto ✓'),
    ));
    falar(FALAS.livre(f));
  }

  function terminar() {
    const media = Math.round(notas.reduce((a, b) => a + b, 0) / notas.length);
    if (op.chave) progresso.registrar(MOD, op.chave, media);
    festa(raiz, {
      estrelas: media,
      frase: 'Sua letra respeitou a pauta!',
      deNovo: () => tracarLetras(raiz, op),
      voltar,
      proxima: op.proxima,
    });
  }

  guiada(0);
}

// Traçar palavras inteiras (com o espaço do dedinho quando tem duas palavras)
function tracarPalavras(raiz, op) {
  const palavras = op.palavras;
  const voltar = op.voltar || MENU;
  let saidasTotal = 0;
  function passo(i) {
    const p = palavras[i];
    const { corpo } = tela(raiz, { titulo: op.titulo || 'Traçar palavras', cor: '#DD7AA0', voltar });
    corpo.append(h('div', { class: 'xt-bolinhas' }, palavras.map((_, k) => h('i', { class: k < i ? 'ok' : k === i ? 'meio' : '' }))));
    const temEspaco = p.includes(' ');
    const dica = lila(temEspaco ? 'Entre as palavras, o espaço de um dedinho!' : 'Comece na bolinha verde!', { fala: temEspaco ? FALAS.dedinho : FALAS.palavras });
    const caixa = h('div', { class: 'lt-tracar' });
    const botoes = h('div', { class: 'lt-botoes' }, botaoOuvir(() => falar(p, 'en')));
    corpo.append(dica, caixa, botoes);
    montarTracado(caixa, corpo, p, {
      cor: '#C8578A',
      aviso: avisador(dica),
      aoFim: async (saidas) => {
        saidasTotal += saidas;
        sfx.certo();
        await falar(p, 'en');
        await wait(500);
        if (i + 1 < palavras.length) return passo(i + 1);
        const est = saidasTotal <= palavras.length ? 3 : saidasTotal <= palavras.length * 3 ? 2 : 1;
        progresso.registrar(MOD, op.chave || 'palavras', est);
        festa(raiz, { estrelas: est, deNovo: () => tracarPalavras(raiz, op), voltar, proxima: op.proxima });
      },
    });
    if (i === 0 || temEspaco) falarVarias([[temEspaco ? FALAS.dedinho : FALAS.palavras, 'pt'], [p, 'en']]);
    else falar(p, 'en');
  }
  passo(0);
}

// Escrever palavras sozinha: vê o modelo e escreve respeitando a pauta
function escreverPalavras(raiz, op) {
  const palavras = op.palavras;
  const voltar = op.voltar || MENU;
  let acertosDePrimeira = 0;
  function passo(i) {
    const p = palavras[i];
    const { corpo } = tela(raiz, { titulo: op.titulo || 'Escrever palavras', cor: '#DD7AA0', voltar });
    corpo.append(h('div', { class: 'xt-bolinhas' }, palavras.map((_, k) => h('i', { class: k < i ? 'ok' : k === i ? 'meio' : '' }))));
    const dica = lila('Escreva a palavra sozinha, respeitando as linhas.', { fala: FALAS.escreverPalavra });
    const w = larguraPalavra(p);
    const modeloSvg = pautaSVG(w + 20, { classe: 'pauta-modelo' });
    conteudo(modeloSvg).append(palavraG(p, { x: 10, cores: (l) => FAMILIAS[familiaPrincipal(l)].cor }));
    const modelo = h('div', { class: 'lt-modelo' }, modeloSvg, botaoOuvir(() => falar(p, 'en')));
    const caixa = h('div', { class: 'lt-tracar' });
    corpo.append(dica, modelo, caixa);
    const livre = montarLivre(caixa, corpo, p);
    let tentativas = 0;
    corpo.append(h('div', { class: 'lt-botoes' },
      h('button', { class: 'xt-btn xt-btn-2', onclick: () => livre.apagar() }, '🧽 Apagar'),
      h('button', { class: 'xt-btn', onclick: async () => {
        const erro = livre.conferir();
        if (erro === FALAS.escrevaPrimeiro) return dica.trocar(erro);
        tentativas++;
        if (erro) { sfx.errado(); return dica.trocar(erro); }
        if (tentativas === 1) acertosDePrimeira++;
        sfx.certo();
        await dica.trocar('Sua palavra respeitou a pauta!', FALAS.palavraRespeitou);
        if (i + 1 < palavras.length) return passo(i + 1);
        const pct = acertosDePrimeira / palavras.length;
        const est = pct >= 0.9 ? 3 : pct >= 0.5 ? 2 : 1;
        progresso.registrar(MOD, op.chave || 'escrever', est);
        festa(raiz, { estrelas: est, frase: 'Sua palavra respeitou a pauta!', deNovo: () => escreverPalavras(raiz, op), voltar, proxima: op.proxima });
      } }, 'Pronto ✓'),
    ));
    if (i === 0) falarVarias([[FALAS.escreverPalavra, 'pt'], [p, 'en']]);
    else falar(p, 'en');
  }
  passo(0);
}
