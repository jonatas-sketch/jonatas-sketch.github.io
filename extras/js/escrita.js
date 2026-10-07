// Motor de escrita na pauta (usado por Letras na Pauta e Palavras CVC):
// traçar com trilha (bolinha verde, traços numerados, setinha) e escrever sozinha
// conferindo os limites da girafa, da tartaruga e do macaco.
import { s, sfx } from './core.js';
import { LETRAS, familiasDe, FALAS } from './letras-dados.js';
import { pautaSVG, conteudo, larguraPalavra, posicoes, pontoSVG, MEIO, CHAO } from './pauta.js';

const TOL = 17; // distância para "estar no caminho" (unidades da pauta)
const TOL_INICIO = 26;

// Pauta grande para traçar/escrever: altura conforme a tela, linhas na largura toda
export function pautaGrande(corpo, larguraConteudo) {
  const altPx = Math.min(window.innerHeight * 0.46, 450);
  const largPx = Math.min(corpo.clientWidth || 360, 760);
  const larg = Math.max(larguraConteudo + 70, largPx * (182 / altPx) - 24);
  const svg = pautaSVG(larg, { classe: 'pauta-tracar' });
  svg.style.height = altPx + 'px';
  return { svg, x0: (larg - larguraConteudo) / 2 };
}

// dica falada no balão da Lila, sem repetir a cada segundo
export function avisador(dica) {
  let ultima = 0;
  return (fala) => {
    if (Date.now() - ultima < 3500) return;
    ultima = Date.now();
    dica.trocar(fala);
  };
}

// Motor do traçado: segue os traços (de uma letra ou de uma palavra inteira) em ordem.
// aoFim(saidas) quando termina; aviso(fala) para as dicas.
export function montarTracado(caixa, corpo, texto, { cor, aoFim, aviso, falas = FALAS }) {
  const { svg, x0 } = pautaGrande(corpo, larguraPalavra(texto));
  caixa.replaceChildren(svg);
  const g = s('g', { transform: `translate(${x0} 0)` });
  conteudo(svg).append(g);
  const tracos = [];
  for (const p of posicoes(texto)) {
    if (p.l === ' ') {
      // espaço do dedinho
      g.append(s('rect', { x: p.x + 4, y: MEIO + 4, width: p.w - 8, height: CHAO - MEIO - 8, rx: 8, class: 'lt-dedinho' }),
        s('text', { x: p.x + p.w / 2, y: CHAO - 16, class: 'lt-dedinho-txt' }, '☝️'));
      continue;
    }
    for (const d of LETRAS[p.l].tracos) {
      const trilha = s('path', { d, class: 'lt-trilha', transform: `translate(${p.x} 0)` });
      const centro = s('path', { d, class: 'lt-centro', transform: `translate(${p.x} 0)` });
      g.append(trilha, centro);
      tracos.push({ trilha, x: p.x });
    }
  }
  const tinta = s('g');
  const marcas = s('g');
  g.append(tinta, marcas);
  for (const t of tracos) {
    const L = t.trilha.getTotalLength();
    const n = Math.max(1, Math.round(L / 2.5));
    t.pts = Array.from({ length: n + 1 }, (_, k) => {
      const q = t.trilha.getPointAtLength((k / n) * L);
      return { x: q.x + t.x, y: q.y };
    });
    t.ponto = L < 6;
  }

  let atual = 0, idx = 0, desenhando = false, linha = null, saidas = 0;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function marcarInicio() {
    marcas.replaceChildren();
    const t = tracos[atual];
    if (!t) return;
    const p0 = t.pts[idx];
    if (!t.ponto && t.pts.length > 12) {
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
    linha = s('polyline', { class: 'lt-progresso', style: `stroke:${cor}` });
    tinta.append(linha);
    atualizarLinha();
  }
  function atualizarLinha() {
    linha.setAttribute('points', tracos[atual].pts.slice(0, idx + 1).map((p) => `${p.x},${p.y}`).join(' '));
  }
  function local(ev) {
    const p = pontoSVG(svg, ev);
    return { x: p.x - x0, y: p.y };
  }
  function terminarTraco() {
    desenhando = false;
    idx = tracos[atual].pts.length - 1;
    atualizarLinha();
    sfx.pop();
    atual++;
    idx = 0;
    if (atual >= tracos.length) {
      marcas.replaceChildren();
      return aoFim(saidas);
    }
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
      aviso(idx === 0 ? falas.bolinha : falas.continueBolinha);
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
      saidas++;
      aviso(falas.saiu);
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
  return svg;
}

// Escrever sem trilha: confere só os limites da pauta (altura certa para a família)
export function montarLivre(caixa, corpo, texto, falas = FALAS) {
  const { svg } = pautaGrande(corpo, Math.max(120, larguraPalavra(texto) * 1.3));
  caixa.replaceChildren(svg);
  const tinta = s('g');
  conteudo(svg).append(tinta);
  let tracos = [];
  let atual = null;
  svg.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    try { svg.setPointerCapture(ev.pointerId); } catch {}
    atual = { pts: [pontoSVG(svg, ev)], el: s('polyline', { class: 'lt-livre' }) };
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
  return {
    apagar() { tracos = []; tinta.replaceChildren(); },
    // devolve null se respeitou a pauta, ou a fala do erro
    conferir() {
      const usados = tracos.filter((t) => {
        const xs = t.pts.map((q) => q.x), ys = t.pts.map((q) => q.y);
        return Math.max(...xs) - Math.min(...xs) > 14 || Math.max(...ys) - Math.min(...ys) > 14; // ignora pingos (i, j)
      });
      if (!usados.length) return falas.escrevaPrimeiro;
      const ys = usados.flatMap((t) => t.pts.map((q) => q.y));
      const cima = Math.min(...ys), baixo = Math.max(...ys);
      const letras = [...texto].filter((l) => l !== ' ');
      const girafa = letras.some((l) => familiasDe(l).includes('girafa'));
      const macaco = letras.some((l) => familiasDe(l).includes('macaco'));
      const soT = girafa && letras.every((l) => l === 't' || !familiasDe(l).includes('girafa'));
      const palavra = letras.length > 1;
      if (girafa && cima > (soT ? 30 : 16)) return palavra ? falas.palavraFaltouSubir : falas.faltouSubir;
      if (!girafa && cima < MEIO - 14) return palavra ? falas.palavraSubiu : falas.subiuDemais(macaco);
      if (macaco && baixo < CHAO + 24) return palavra ? falas.palavraFaltouDescer : falas.faltouDescer;
      if (!macaco && baixo > CHAO + 14) return palavra ? falas.palavraAfundou : falas.afundou;
      if (!macaco && baixo < CHAO - 14) return falas.flutuando;
      return null;
    },
  };
}
