// Letras na Pauta: famílias da girafa, da tartaruga e do macaco e os limites da escrita
// (pauta de 3 linhas, como a folha da escola).
import {
  h, s, wait, shuffle, pick, sample, falar, calar, sfx, elogiar, tentarDeNovo, progresso, perfil,
  irPara, tela, cartao, lila, jogo, festa, escolher, estilo,
} from './core.js';
import { LETRAS, FAMILIAS, familiasDe, familiaPrincipal, ORDEM_ESCOLA } from './letras-dados.js';
import { pautaSVG, conteudo, letraG, palavraG, larguraPalavra, pontoSVG, TOPO, MEIO, CHAO, PORAO } from './pauta.js';

const MOD = 'letras';
const COR = '#E0A21F';
const MENU = () => irPara('#/letras');
const daFamilia = (k) => (k === 'macaco' ? 'do ' : 'da ') + FAMILIAS[k].nome.toLowerCase();

export function abrir(raiz, partes) {
  estilo('letras');
  const [tela1, arg] = partes;
  if (tela1 === 'conhecer') return conhecer(raiz);
  if (tela1 === 'casinha') return casinha(raiz);
  if (tela1 === 'certinho') return certinho(raiz);
  if (tela1 === 'tracar') return arg && LETRAS[arg] ? tracar(raiz, arg) : escolherLetra(raiz);
  if (tela1 === 'intruso') return intruso(raiz);
  if (tela1 === 'forma') return forma(raiz);
  return menu(raiz);
}

// ---------- menu ----------
function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Letras na Pauta 🦒🐢🐒', cor: COR });
  const est = (a) => progresso.feito(MOD, a);
  const tracadas = ORDEM_ESCOLA.filter((l) => progresso.feito(MOD, 'tracar-' + l) > 0).length;
  corpo.append(
    lila('Cada letra mora numa casinha da pauta. Vamos descobrir?', {
      fala: 'Cada letra mora numa casinha da pauta: a girafa lá em cima, a tartaruga no meio e o macaco pendurado embaixo. Vamos descobrir?',
    }),
    h('div', { class: 'xt-grade' },
      cartao({ emoji: '🦒', titulo: 'Conheça as famílias', sub: 'Girafa, tartaruga e macaco', cor: '#E0A21F', estrelas: est('conhecer'), onclick: () => irPara('#/letras/conhecer') }),
      cartao({ emoji: '🏠', titulo: 'Cada letra na sua casa', sub: 'De que família é?', cor: '#8FB58A', estrelas: est('casinha'), onclick: () => irPara('#/letras/casinha') }),
      cartao({ emoji: '✅', titulo: 'Está certinho?', sub: 'A letra respeitou a pauta?', cor: '#E8865A', estrelas: est('certinho'), onclick: () => irPara('#/letras/certinho') }),
      cartao({ emoji: '✏️', titulo: 'Traçar na pauta', sub: `${tracadas} de ${ORDEM_ESCOLA.length} letras`, cor: '#DD7AA0', onclick: () => irPara('#/letras/tracar') }),
      cartao({ emoji: '🔍', titulo: 'Ache o intruso', sub: 'Qual é de outra família?', cor: '#A98FE0', estrelas: est('intruso'), onclick: () => irPara('#/letras/intruso') }),
      cartao({ emoji: '📦', titulo: 'A forma da palavra', sub: 'Qual palavra cabe nas caixas?', cor: '#4DA6E0', estrelas: est('forma'), onclick: () => irPara('#/letras/forma') }),
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

// ---------- 1. Conheça as famílias ----------
function conhecer(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Conheça as famílias', cor: COR, voltar: MENU });
  const vistas = new Set();
  const fala = lila('Toque em cada bicho para conhecer a família dele!');
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
  falar('Toque em cada bicho para conhecer a família dele!');

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
        c.append(letraG(l, { x, cor: f.cor, animar: (n * linha.length + i) * 0.3 }));
        x += LETRAS[l].w + espaco;
      });
    });
    let texto = f.fala;
    if (k !== 'tartaruga') texto += ' E o f é especial: ele sobe como a girafa e desce como o macaco!';
    fala.trocar(f.fala, texto);
    if (vistas.size === 3 && !fim.childElementCount) {
      progresso.registrar(MOD, 'conhecer', 3);
      fim.append(h('button', { class: 'xt-btn', onclick: () => irPara('#/letras/casinha') }, 'Vamos brincar! ▶'));
    }
  }
}

// ---------- 2. Cada letra na sua casa ----------
function casinha(raiz) {
  const letras = shuffle([
    ...sample([...'bdhklt'], 4), 'f',
    ...sample([...FAMILIAS.tartaruga.letras], 4),
    ...sample([...'gjpqy'], 3),
  ]);
  jogo(raiz, {
    titulo: 'Cada letra na sua casa', cor: '#5E9A57', voltar: MENU, modulo: MOD, atividade: 'casinha',
    rodadas: letras.length,
    instrucao: { texto: 'Em qual casinha mora essa letra?', fala: 'Em qual casinha mora essa letra? Da girafa, da tartaruga ou do macaco?' },
    rodada: (i, area) => {
      const l = letras[i];
      const svg = miniPauta(l, { faixas: true, largura: 120 });
      const opcoes = Object.entries(FAMILIAS).map(([k, f]) => ({
        k,
        certo: familiasDe(l).includes(k),
        el: h('button', { class: 'lt-bicho', style: { '--cor': f.cor, '--clara': f.clara } },
          h('span', { class: 'lt-bicho-emoji' }, f.emoji), h('b', null, f.nome)),
      }));
      area.append(h('div', { class: 'xt-ficha lt-ficha-pauta lt-ficha-grande' }, svg), h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      return escolher(opcoes, {
        falarElogio: l !== 'f',
        aoAcertar: async (o) => {
          const c = conteudo(svg);
          c.replaceChildren(letraG(l, { x: (120 - LETRAS[l].w) / 2, cor: FAMILIAS[o.k].cor }));
          if (l === 'f') {
            await falar('Isso! O f é especial: ele é da girafa e do macaco ao mesmo tempo!');
          }
        },
        aoErrar: (o) => {
          const f = familiaPrincipal(l);
          if (o.k === 'tartaruga') falar(`Olha de novo: essa letra sai do meio da pauta.`);
          else if (f === 'tartaruga') falar('Olha de novo: essa letra fica só no meio da pauta.');
          else tentarDeNovo();
        },
      });
    },
  });
}

// ---------- 3. Está certinho? ----------
// Versões erradas: [a, b] para y' = a·y + b, com a explicação do erro
const ERROS = {
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
function certinho(raiz) {
  const letras = shuffle([...sample([...'bdhklt'], 3), ...sample([...FAMILIAS.tartaruga.letras], 4), ...sample([...'gjpqy'], 3)]);
  jogo(raiz, {
    titulo: 'Está certinho?', cor: '#E8865A', voltar: MENU, modulo: MOD, atividade: 'certinho',
    rodadas: letras.length,
    instrucao: { texto: 'Qual letra está escrita certinho na pauta?', fala: 'Qual letra está escrita certinho na pauta? Toque nela!' },
    rodada: (i, area) => {
      const l = letras[i];
      const f = familiaPrincipal(l);
      const erro = pick(ERROS[f]);
      const largura = Math.max(LETRAS[l].w + 30, 96);
      const certa = { certo: true, el: h('button', { class: 'xt-ficha lt-ficha-pauta' }, miniPauta(l, { largura })) };
      const errada = { certo: false, el: h('button', { class: 'xt-ficha lt-ficha-pauta' }, miniPauta(l, { largura, alturaY: erro.alt })) };
      area.append(h('div', { class: 'xt-opcoes' }, shuffle([certa, errada]).map((o) => o.el)));
      return escolher([certa, errada], {
        aoErrar: () => falar(`Hmm, essa ${erro.msg}.`),
      });
    },
  });
}

// ---------- 5. Ache o intruso ----------
function intruso(raiz) {
  const sem = (str) => [...str].filter((l) => l !== 'f');
  const grupos = { girafa: sem('bdhklt'), tartaruga: sem(FAMILIAS.tartaruga.letras), macaco: sem('gjpqy') };
  jogo(raiz, {
    titulo: 'Ache o intruso', cor: '#A98FE0', voltar: MENU, modulo: MOD, atividade: 'intruso', rodadas: 10,
    instrucao: { texto: 'Três letras são da mesma família. Qual é de outra família?', fala: 'Três letras são da mesma família. Qual letra é de outra família?' },
    rodada: (i, area) => {
      const [fa, fb] = sample(Object.keys(grupos), 2);
      const iguais = sample(grupos[fa], 3);
      const diferente = pick(grupos[fb]);
      const opcoes = shuffle([...iguais.map((l) => ({ l, certo: false })), { l: diferente, certo: true }]);
      for (const o of opcoes) o.el = h('button', { class: 'xt-ficha lt-ficha-pauta lt-ficha-peq' }, miniPauta(o.l, { largura: 80 }));
      area.append(h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: async () => {
          await falar(`Isso! Essa é da família ${daFamilia(fb)}, e as outras são ${daFamilia(fa)}!`);
        },
      });
    },
  });
}

// ---------- 6. A forma da palavra ----------
const PALAVRAS = ['dog', 'cat', 'pig', 'sun', 'hat', 'bed', 'top', 'map', 'cup', 'net', 'leg', 'bus', 'hen', 'kid',
  'lip', 'mop', 'nut', 'pan', 'red', 'ten', 'tap', 'egg', 'jam', 'yes', 'zip', 'bag', 'log', 'dot', 'hug', 'bell', 'doll',
  'hill', 'duck', 'sock', 'pet', 'dig', 'gum', 'yak', 'sad', 'mud'];
const formaDe = (p) => [...p].map((l) => familiaPrincipal(l)[0]).join('');
function caixas(palavra) {
  const w = larguraPalavra(palavra);
  const svg = pautaSVG(w, { classe: 'pauta-forma' });
  const c = conteudo(svg);
  let x = 0;
  for (const l of palavra) {
    const f = familiaPrincipal(l);
    const [y0, y1] = f === 'girafa' ? [l === 't' ? 14 : TOPO, CHAO] : f === 'macaco' ? [MEIO, PORAO] : [MEIO, CHAO];
    c.append(s('rect', { x: x - 3, y: y0, width: LETRAS[l].w + 6, height: y1 - y0, rx: 6, fill: FAMILIAS[f].clara, stroke: FAMILIAS[f].cor, 'stroke-width': 3 }));
    x += LETRAS[l].w + 10;
  }
  return { svg, c, w };
}
function forma(raiz) {
  const alvos = sample(PALAVRAS, 8);
  jogo(raiz, {
    titulo: 'A forma da palavra', cor: '#4DA6E0', voltar: MENU, modulo: MOD, atividade: 'forma', rodadas: alvos.length,
    instrucao: { texto: 'Qual palavra cabe certinho nessas caixas?', fala: 'Olhe as caixinhas: alta, baixinha ou pendurada. Qual palavra cabe certinho nelas?' },
    rodada: (i, area) => {
      const alvo = alvos[i];
      const outras = sample(PALAVRAS.filter((p) => formaDe(p) !== formaDe(alvo)), 30);
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

// ---------- 4. Traçar na pauta ----------
function escolherLetra(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Traçar na pauta ✏️', cor: '#DD7AA0', voltar: MENU });
  corpo.append(lila('Escolha uma letra para traçar!', { fala: 'Escolha uma letra para traçar na pauta!' }));
  const secoes = [
    ['Dever de casa: p a s t', [...'pastp'].filter((l, i, a) => a.indexOf(l) === i)],
    ['Na ordem da escola', ORDEM_ESCOLA],
  ];
  for (const [titulo, lista] of secoes) {
    corpo.append(h('p', { class: 'xt-secao' }, titulo));
    corpo.append(h('div', { class: 'lt-letras' }, lista.map((l) => {
      const f = familiaPrincipal(l);
      const est = progresso.feito(MOD, 'tracar-' + l);
      return h('button', {
        class: 'lt-letra-btn', style: { '--clara': FAMILIAS[f].clara, '--cor': FAMILIAS[f].cor },
        onclick: () => irPara('#/letras/tracar/' + l), 'aria-label': 'Letra ' + l,
      }, miniPauta(l, { largura: 80 }), h('span', { class: 'lt-letra-est' }, est ? '★'.repeat(est) : '·'));
    })));
  }
}

const TOL = 17; // distância para "estar no caminho" (unidades da pauta)
const TOL_INICIO = 26;

function tracar(raiz, l) {
  const f = familiaPrincipal(l);
  const cor = FAMILIAS[f].cor;
  const { corpo, atualizarEstrelas } = tela(raiz, { titulo: `Traçar a letra ${l}`, cor: '#DD7AA0', voltar: () => irPara('#/letras/tracar') });
  const dica = lila('Comece na bolinha verde e siga a setinha!');
  const caixa = h('div', { class: 'lt-tracar' });
  const botoes = h('div', { class: 'lt-botoes' });
  corpo.append(dica, caixa, botoes);

  // largura da pauta conforme o espaço da tela (letra grande, linhas na largura toda)
  const altPx = Math.min(window.innerHeight * 0.5, 470);
  const largPx = Math.min(corpo.clientWidth || 360, 760);
  const unidades = 182 / altPx;
  const larg = Math.max(LETRAS[l].w + 40, largPx * unidades - 24);
  const svg = pautaSVG(larg, { classe: 'pauta-tracar' });
  svg.style.height = altPx + 'px';
  caixa.append(svg);
  const x0 = (larg - LETRAS[l].w) / 2;
  const c = conteudo(svg);
  const g = s('g', { transform: `translate(${x0} 0)` });
  c.append(g);

  // trilha (guia), linha tracejada do meio, bolinha de início e setinha
  const tracos = LETRAS[l].tracos.map((d) => {
    const trilha = s('path', { d, class: 'lt-trilha' });
    const centro = s('path', { d, class: 'lt-centro' });
    g.append(trilha, centro);
    const L = trilha.getTotalLength();
    const passo = 2.5;
    const n = Math.max(1, Math.round(L / passo));
    const pts = Array.from({ length: n + 1 }, (_, k) => {
      const p = trilha.getPointAtLength((k / n) * L);
      return { x: p.x, y: p.y };
    });
    return { d, L, pts, ponto: L < 6 };
  });
  const tinta = s('g');
  const marcas = s('g');
  g.append(tinta, marcas);

  let atual = 0; // traço atual
  let idx = 0; // amostra alcançada no traço atual
  let desenhando = false;
  let progressoLinha = null;
  let ultimaDica = 0;

  function marcarInicio() {
    marcas.replaceChildren();
    const t = tracos[atual];
    if (!t) return;
    const p0 = t.pts[idx];
    if (!t.ponto && t.pts.length > 6) {
      const a = t.pts[Math.min(idx + 11, t.pts.length - 1)];
      const b = t.pts[Math.min(idx + 7, t.pts.length - 1)];
      const ang = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
      marcas.append(s('path', { d: 'M-5 -6 L6 0 L-5 6 Z', class: 'lt-seta', transform: `translate(${a.x} ${a.y}) rotate(${ang})` }));
    }
    marcas.append(
      s('circle', { cx: p0.x, cy: p0.y, r: 10, class: 'lt-inicio' }),
      s('text', { x: p0.x, y: p0.y + 4.5, class: 'lt-inicio-num' }, String(atual + 1)),
    );
  }
  function novaLinha() {
    progressoLinha = s('polyline', { class: 'lt-progresso', style: `stroke:${cor}` });
    tinta.append(progressoLinha);
    atualizarLinha();
  }
  function atualizarLinha() {
    const t = tracos[atual];
    progressoLinha.setAttribute('points', t.pts.slice(0, idx + 1).map((p) => `${p.x},${p.y}`).join(' '));
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function local(ev) {
    const p = pontoSVG(svg, ev);
    return { x: p.x - x0, y: p.y };
  }
  function avisar(texto) {
    const agora = Date.now();
    if (agora - ultimaDica < 3500) return;
    ultimaDica = agora;
    dica.trocar(texto);
  }

  function terminarTraco() {
    desenhando = false;
    const t = tracos[atual];
    idx = t.pts.length - 1;
    atualizarLinha();
    sfx.pop();
    atual++;
    idx = 0;
    if (atual >= tracos.length) return terminarLetra();
    novaLinha();
    marcarInicio();
  }

  svg.addEventListener('pointerdown', (ev) => {
    if (atual >= tracos.length) return;
    ev.preventDefault();
    const p = local(ev);
    const t = tracos[atual];
    if (dist(p, t.pts[idx]) <= TOL_INICIO) {
      try { svg.setPointerCapture(ev.pointerId); } catch {}
      desenhando = true;
      if (t.ponto) terminarTraco();
    } else {
      sfx.errado();
      marcas.querySelector('.lt-inicio')?.classList.add('pisca');
      setTimeout(() => marcas.querySelector('.lt-inicio')?.classList.remove('pisca'), 900);
      avisar(idx === 0 ? 'Comece na bolinha verde!' : 'Continue de onde parou, na bolinha verde!');
    }
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!desenhando) return;
    ev.preventDefault();
    const p = local(ev);
    const t = tracos[atual];
    let avancou = true;
    while (avancou) {
      avancou = false;
      for (let j = idx + 1; j <= Math.min(idx + 6, t.pts.length - 1); j++) {
        if (dist(p, t.pts[j]) <= TOL) {
          idx = j;
          avancou = true;
          break;
        }
      }
    }
    atualizarLinha();
    if (idx >= t.pts.length - 2) return terminarTraco();
    const perto = t.pts.slice(Math.max(0, idx - 4), idx + 12).some((q) => dist(p, q) <= TOL * 2.2);
    if (!perto) {
      desenhando = false;
      avisar('Opa, saiu do caminho! Volte para a bolinha verde.');
      marcarInicio();
    }
  });
  const soltar = () => {
    if (!desenhando) return;
    desenhando = false;
    marcarInicio();
  };
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);

  novaLinha();
  marcarInicio();
  falar(`Comece na bolinha verde e siga a setinha. Essa letra é da família ${daFamilia(f)}!`);

  async function terminarLetra() {
    marcas.replaceChildren();
    sfx.certo();
    progresso.registrar(MOD, 'tracar-' + l, 1);
    atualizarEstrelas();
    await elogiar();
    dica.trocar('Agora tente escrever sozinha, sem a trilha!', `Muito bem! Agora tente escrever sozinha, sem a trilha. Lembre: ${FAMILIAS[f].fala}`);
    botoes.replaceChildren(
      h('button', { class: 'xt-btn', onclick: () => livre(raiz, l) }, 'Agora sem ajuda ✍️'),
      h('button', { class: 'xt-btn xt-btn-2', onclick: () => irPara('#/letras/tracar') }, 'Outra letra'),
    );
  }
}

// Escrever sem trilha: confere só os limites da pauta (altura certa para a família)
function livre(raiz, l) {
  const f = familiaPrincipal(l);
  const fams = familiasDe(l);
  const { corpo } = tela(raiz, { titulo: `Escreva o ${l} sozinha`, cor: '#DD7AA0', voltar: () => irPara('#/letras/tracar') });
  const dica = lila('Escreva a letra respeitando as linhas da pauta.');
  const modelo = h('div', { class: 'lt-modelo' }, miniPauta(l, { largura: 80, cor: FAMILIAS[f].cor }));
  const altPx = Math.min(window.innerHeight * 0.48, 450);
  const largPx = Math.min(corpo.clientWidth || 360, 760);
  const larg = Math.max(120, largPx * (182 / altPx) - 24);
  const svg = pautaSVG(larg, { classe: 'pauta-tracar' });
  svg.style.height = altPx + 'px';
  const tinta = s('g');
  conteudo(svg).append(tinta);
  let tracos = [];
  let atual = null;
  let tentativas = 0;
  svg.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    try { svg.setPointerCapture(ev.pointerId); } catch {}
    const p = pontoSVG(svg, ev);
    atual = { pts: [p], el: s('polyline', { class: 'lt-livre' }) };
    tinta.append(atual.el);
    tracos.push(atual);
    desenhar();
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!atual) return;
    ev.preventDefault();
    const p = pontoSVG(svg, ev);
    const u = atual.pts.at(-1);
    if (Math.hypot(p.x - u.x, p.y - u.y) > 1.2) {
      atual.pts.push({ x: p.x, y: p.y });
      desenhar();
    }
  });
  const soltar = () => (atual = null);
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
  function desenhar() {
    atual.el.setAttribute('points', atual.pts.map((q) => `${q.x},${q.y}`).join(' '));
  }
  function apagar() {
    tracos = [];
    tinta.replaceChildren();
  }

  async function conferir() {
    const usados = tracos.filter((t) => {
      const xs = t.pts.map((q) => q.x), ys = t.pts.map((q) => q.y);
      return Math.max(...xs) - Math.min(...xs) > 14 || Math.max(...ys) - Math.min(...ys) > 14; // ignora pingos (i, j)
    });
    if (!usados.length) return dica.trocar('Escreva a letra na pauta primeiro!');
    const ys = usados.flatMap((t) => t.pts.map((q) => q.y));
    const cima = Math.min(...ys), baixo = Math.max(...ys);
    let erro = null;
    const girafa = fams.includes('girafa'), macaco = fams.includes('macaco');
    const alvoCima = l === 't' ? 30 : 14;
    if (girafa && cima > alvoCima) erro = 'Faltou subir! As letras da girafa vão até a linha lá de cima.';
    else if (!girafa && cima < MEIO - 14) erro = `Opa! A letra subiu demais. A ${macaco ? 'letra do macaco' : 'tartaruga'} não passa da linha tracejada.`;
    else if (macaco && baixo < CHAO + 24) erro = 'Faltou descer! As letras do macaco descem para baixo da linha do chão.';
    else if (!macaco && baixo > CHAO + 14) erro = 'Opa, a letra afundou! Só as letras do macaco descem do chão.';
    else if (!macaco && baixo < CHAO - 14) erro = 'A letra está flutuando! Ela precisa sentar na linha do chão.';
    tentativas++;
    if (erro) {
      sfx.errado();
      dica.trocar(erro);
      return;
    }
    progresso.registrar(MOD, 'tracar-' + l, tentativas === 1 ? 3 : 2);
    festa(raiz, {
      estrelas: tentativas === 1 ? 3 : 2,
      frase: 'Sua letra respeitou a pauta!',
      deNovo: () => livre(raiz, l),
      voltar: () => irPara('#/letras/tracar'),
    });
  }

  corpo.append(dica, modelo, svg, h('div', { class: 'lt-botoes' },
    h('button', { class: 'xt-btn xt-btn-2', onclick: apagar }, '🧽 Apagar'),
    h('button', { class: 'xt-btn', onclick: conferir }, 'Pronto ✓'),
  ));
  falar(`Escreva a letra respeitando as linhas da pauta. ${FAMILIAS[f].fala}`);
}
