// Desenho da pauta de 3 linhas e das letras (SVG).
import { s } from './core.js';
import { LETRAS, FAMILIAS } from './letras-dados.js';

export const TOPO = 0;
export const MEIO = 50;
export const CHAO = 100;
export const PORAO = 150;
const MARGEM_Y = 16;

// Largura de uma palavra desenhada (com espaço entre letras)
export function larguraPalavra(palavra, espaco = 10) {
  return [...palavra].reduce((t, l) => t + (LETRAS[l]?.w || 30) + espaco, -espaco);
}

// Grupo <g> com a letra; transform opcional (para versões "erradas")
// Muda só a altura de um traço: y' = a·y + b (para as versões "fora da pauta")
export function moverY(d, a = 1, b = 0) {
  return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${x} ${+(a * y + b).toFixed(2)}`);
}

// Grupo <g> com a letra. alturaY = [a, b] estica/desloca na vertical; animar = desenha o traço aos poucos
export function letraG(l, { x = 0, cor = 'var(--ink)', espessura = 9, alturaY, classe, animar = false } = {}) {
  const dados = LETRAS[l];
  const g = s('g', { transform: `translate(${x} 0)`, class: classe });
  dados.tracos.forEach((d, i) => {
    const p = s('path', {
      d: alturaY ? moverY(d, ...alturaY) : d, fill: 'none', stroke: cor, 'stroke-width': espessura,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    });
    if (animar) {
      p.setAttribute('pathLength', '1');
      p.setAttribute('class', 'traco-anima');
      p.style.animationDelay = (typeof animar === 'number' ? animar : 0) + i * 0.45 + 's';
    }
    g.append(p);
  });
  return g;
}

export function palavraG(palavra, { x = 0, cor, espessura, espaco = 10, cores } = {}) {
  const g = s('g', { transform: `translate(${x} 0)` });
  let cx = 0;
  for (const l of palavra) {
    g.append(letraG(l, { x: cx, cor: cores ? cores(l) : cor, espessura }));
    cx += (LETRAS[l]?.w || 30) + espaco;
  }
  return g;
}

// SVG da pauta. largura = largura útil; faixas = pinta as zonas dos bichos.
export function pautaSVG(largura, { faixas = false, bichos = false, classe = '', alturaCss } = {}) {
  const esq = bichos ? 156 : 12;
  const vb = `${-esq} ${TOPO - MARGEM_Y} ${largura + esq + 12} ${PORAO - TOPO + MARGEM_Y * 2}`;
  const svg = s('svg', { viewBox: vb, class: 'pauta ' + classe, preserveAspectRatio: 'xMidYMid meet' });
  if (alturaCss) svg.style.height = alturaCss;
  const x0 = -esq, x1 = largura + 12;
  const zonas = s('g', { class: 'pauta-zonas' });
  if (faixas) {
    zonas.append(
      s('rect', { x: x0, y: TOPO, width: x1 - x0, height: MEIO - TOPO, fill: FAMILIAS.girafa.clara, 'data-zona': 'girafa' }),
      s('rect', { x: x0, y: MEIO, width: x1 - x0, height: CHAO - MEIO, fill: FAMILIAS.tartaruga.clara, 'data-zona': 'tartaruga' }),
      s('rect', { x: x0, y: CHAO, width: x1 - x0, height: PORAO - CHAO, fill: FAMILIAS.macaco.clara, 'data-zona': 'macaco' }),
    );
  }
  svg.append(zonas);
  const linhas = s('g', { class: 'pauta-linhas' },
    s('line', { x1: x0, x2: x1, y1: TOPO, y2: TOPO, stroke: '#8a7563', 'stroke-width': 1.6 }),
    s('line', { x1: x0, x2: x1, y1: MEIO, y2: MEIO, stroke: '#8a7563', 'stroke-width': 1.6, 'stroke-dasharray': '7 6' }),
    s('line', { x1: x0, x2: x1, y1: CHAO, y2: CHAO, stroke: '#4a3b32', 'stroke-width': 2.4 }),
  );
  svg.append(linhas);
  if (bichos) {
    // Os bichos na margem, cada um na sua altura (como na folha da escola)
    svg.append(
      s('text', { x: -152, y: CHAO - 4, 'font-size': 92, class: 'pauta-bicho', 'data-bicho': 'girafa' }, '🦒'),
      s('text', { x: -54, y: CHAO - 3, 'font-size': 44, class: 'pauta-bicho', 'data-bicho': 'tartaruga' }, '🐢'),
      s('text', { x: -54, y: PORAO - 4, 'font-size': 44, class: 'pauta-bicho', 'data-bicho': 'macaco' }, '🐒'),
    );
  }
  svg.append(s('g', { class: 'pauta-conteudo' }));
  return svg;
}
export const conteudo = (svg) => svg.querySelector('.pauta-conteudo');

// Converte a posição do dedo para coordenadas da pauta
export function pontoSVG(svg, ev) {
  const p = svg.createSVGPoint();
  p.x = ev.clientX;
  p.y = ev.clientY;
  const m = svg.getScreenCTM();
  return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
}
