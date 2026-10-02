// Música com a Lila 🎹: as notas do piano pelo nome (Dó, Ré, Mi…), pela cor,
// pelo som e pelo lugar na pauta. Feito para acompanhar as primeiras aulas de piano.
// Rotas: #/musica · /livre · /jogo/onde · /jogo/ouvir · /jogo/subiu · /pauta · /jogo/pauta
//        /musicas · /musica/<id>
import {
  h, s, wait, pick, sample, falar, sfx, elogiar, tentarDeNovo, progresso, perfil,
  irPara, tela, cartao, lila, jogo, festa, escolher, estilo,
} from './core.js';
import { tocarNota, tocarSequencia, pararSequencia, pararTudo } from './musica-som.js';
import {
  NOTAS, NOTA, NOTA_POR_MIDI, PRETAS, TINTA, NIVEIS, NUCLEO, ESTRELAS_PARA_PASSAR, FALA_NOVO_NIVEL,
  RODADAS, pistasOnde, PAUTA_RODADAS_SEM_COR, etapaOuvir, SUBIU_ETAPAS, SUBIU_IGUAIS, saco,
  MUSICAS, frasesDa, notasDa, nomeCompleto, FALAS,
} from './musica-dados.js';

const MOD = 'musica';
const COR = '#7E57C2';
const voltarMenu = () => irPara('#/musica');

const INFO = {
  livre: { emoji: '🎹', titulo: 'Teclado livre', sub: 'Toque à vontade', cor: '#e0744a' },
  onde: { emoji: '📍', titulo: 'Onde mora a nota?', sub: 'Ache a tecla certa', cor: '#3d8fc8' },
  ouvir: { emoji: '👂', titulo: 'Ouvir e achar', sub: 'Escute e encontre', cor: '#4f9a5a' },
  subiu: { emoji: '🐦', titulo: 'Subiu ou desceu?', sub: 'Agudo ou grave', cor: '#d9822b' },
  pauta: { emoji: '🎼', titulo: 'A forma da nota', sub: 'A nota na pauta', cor: '#8a6fd1' },
  musicas: { emoji: '🎶', titulo: 'Toque a musiquinha', sub: 'Siga as cores', cor: '#d0688f' },
};

// ---------- utilidades ----------
// Variáveis CSS (--x) só pegam via setProperty
function vars(el, obj) {
  for (const [k, v] of Object.entries(obj)) el.style.setProperty(k, v);
  return el;
}
const varsNota = (el, n) => vars(el, { '--c': n.cor, '--ct': n.corTexto, '--cl': n.clara });
// Reinicia uma animação de classe (funciona em HTML e SVG)
function animar(el, classe) {
  if (!el) return;
  el.classList.remove(classe);
  void el.getBoundingClientRect();
  el.classList.add(classe);
}

// ---------- níveis ----------
function nivelAberto(n) {
  if (n <= 1 || progresso.liberarTudo()) return true;
  return nivelAberto(n - 1) && NUCLEO.every((j) => progresso.feito(MOD, `n${n - 1}-${j}`) >= ESTRELAS_PARA_PASSAR);
}
function maiorAberto() {
  let m = 1;
  while (m < NIVEIS.length && nivelAberto(m + 1)) m++;
  return m;
}
function nivelAtual() {
  const n = Math.min(Math.max(1, Number(progresso.get('musica.nivel', 1)) || 1), maiorAberto());
  return NIVEIS[n - 1];
}
const midisDoNivel = (nv) => nv.notas.map((id) => NOTA[id].midi);

// ---------- teclado (Dó4 a Dó5) ----------
const LARG_PRETA = 7.6; // % da largura do teclado
function teclado({ ativas = null, pretas = false, modo = 'cheio', som = true, deslizar = false } = {}) {
  const teclas = h('div', { class: 'mu-teclas' });
  const el = h('div', { class: 'mu-teclado', role: 'group', 'aria-label': 'Teclado de piano' }, teclas);
  const porMidi = new Map();
  for (const n of NOTAS) {
    const t = h('div', { class: 'mu-tecla mu-branca', role: 'button', 'aria-label': nomeCompleto(n), 'data-midi': n.midi },
      h('span', { class: 'mu-faixa' }, h('b', null, n.nome)));
    varsNota(t, n);
    porMidi.set(n.midi, t);
    teclas.append(t);
  }
  for (const p of PRETAS) {
    const t = h('div', {
      class: 'mu-tecla mu-preta',
      role: 'button',
      'aria-label': 'Tecla preta',
      'data-midi': p.midi,
      style: { left: (p.centro * 12.5 - LARG_PRETA / 2).toFixed(2) + '%', width: LARG_PRETA + '%' },
    });
    porMidi.set(p.midi, t);
    teclas.append(t);
  }

  let bloqueado = false;
  let pretasAtivas = pretas;
  const apertadas = new Map(); // pointerId -> tecla
  const pode = (t) => t && !bloqueado && !t.classList.contains('mu-off') && (pretasAtivas || t.classList.contains('mu-branca'));
  function apertar(t, pid) {
    t.classList.add('mu-on');
    apertadas.set(pid, t);
    const midi = Number(t.dataset.midi);
    if (som) tocarNota(midi);
    if (api.aoTocar) api.aoTocar(midi, t);
  }
  function soltar(pid) {
    const t = apertadas.get(pid);
    if (t) t.classList.remove('mu-on');
    apertadas.delete(pid);
  }
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const t = e.target.closest('.mu-tecla');
    if (!pode(t)) return;
    try { el.setPointerCapture(e.pointerId); } catch {}
    apertar(t, e.pointerId);
  });
  if (deslizar) {
    // passar o dedo pelas teclas (glissando)
    el.addEventListener('pointermove', (e) => {
      const atual = apertadas.get(e.pointerId);
      if (!atual) return;
      const sob = document.elementFromPoint(e.clientX, e.clientY);
      const t = sob && sob.closest ? sob.closest('.mu-tecla') : null;
      if (!t || t === atual || !el.contains(t) || !pode(t)) return;
      atual.classList.remove('mu-on');
      apertar(t, e.pointerId);
    });
  }
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(ev, (e) => soltar(e.pointerId));
  el.addEventListener('contextmenu', (e) => e.preventDefault());

  const TEMPORARIAS = ['mu-brilha', 'mu-proxima', 'mu-certa', 'mu-treme', 'mu-chama', 'mu-on'];
  const api = {
    el,
    aoTocar: null,
    tecla: (m) => porMidi.get(m),
    // teclas brancas que funcionam (null = todas); as outras ficam apagadinhas
    ativar(lista) {
      for (const n of NOTAS) porMidi.get(n.midi).classList.toggle('mu-off', !!lista && !lista.includes(n.midi));
    },
    pretas(on) {
      pretasAtivas = on;
      el.classList.toggle('mu-pretas-off', !on);
    },
    // cheio = cor + nome · cor = só cor · branco = como o piano de verdade
    modo(m) { el.dataset.modo = m; },
    brilhar(m) {
      el.querySelectorAll('.mu-brilha').forEach((t) => t.classList.remove('mu-brilha'));
      if (m != null) porMidi.get(m)?.classList.add('mu-brilha');
    },
    proxima(m) {
      el.querySelectorAll('.mu-proxima').forEach((t) => t.classList.remove('mu-proxima'));
      if (m != null) porMidi.get(m)?.classList.add('mu-proxima');
    },
    chamar: (m) => animar(porMidi.get(m), 'mu-chama'),
    tremer: (m) => animar(porMidi.get(m), 'mu-treme'),
    festejar: (m) => animar(porMidi.get(m), 'mu-certa'),
    piscar(m, ms = 300) {
      const t = porMidi.get(m);
      if (!t) return;
      t.classList.add('mu-on');
      setTimeout(() => t.classList.remove('mu-on'), ms);
    },
    bloquear(b) {
      bloqueado = b;
      el.classList.toggle('mu-bloqueado', b);
    },
    // as duas teclas pretas que mostram onde mora o Dó
    grupoPretas(on) { el.classList.toggle('mu-dica-do', on); },
    reiniciar({ ativas: a = null, modo: m = 'cheio' } = {}) {
      for (const t of porMidi.values()) t.classList.remove(...TEMPORARIAS);
      apertadas.clear();
      api.aoTocar = null;
      api.ativar(a);
      api.modo(m);
      api.bloquear(false);
      api.grupoPretas(false);
    },
  };
  api.pretas(pretas);
  api.ativar(ativas);
  api.modo(modo);
  return api;
}

// Espera a criança tocar a tecla certa. Devolve Promise<boolean> (acertou de primeira).
function esperarTecla(tec, { certa, aoAcertar, aoErrar }) {
  return new Promise((ok) => {
    let erros = 0;
    let fim = false;
    tec.aoTocar = async (m) => {
      if (fim) return;
      if (certa(m)) {
        fim = true;
        tocarNota(m);
        tec.bloquear(true);
        tec.brilhar(null);
        tec.festejar(m);
        setTimeout(() => sfx.certo(), 220);
        if (aoAcertar) aoAcertar(m);
        await Promise.race([elogiar(), wait(2600)]);
        ok(erros === 0);
      } else {
        erros++;
        tocarNota(m, { vol: 0.22, dur: 0.6 });
        tec.tremer(m);
        if (aoErrar) aoErrar(m, erros);
        else tentarDeNovo();
      }
    };
  });
}

// ---------- pauta (clave de sol) ----------
// Linhas em y = 40, 60, 80, 100, 120 (1ª linha = Mi4). Cada degrau sobe meia linha (10).
const Y_MI = 120;
const yNota = (n) => Y_MI - n.degrau * 10;
const CLAVE = 'M46 103C38 106 33 97 38 90C44 82 61 85 61 100C61 116 47 126 34 122C20 118 16 102 22 90'
  + 'C30 74 53 60 55 38C56 24 49 13 44 20C38 30 40 50 42 70L47 140C49 152 40 158 32 152';

function pautaSVG(largura, { nomes = false } = {}) {
  const alto = nomes ? 172 : 160;
  const svg = s('svg', {
    viewBox: `0 8 ${largura} ${alto}`,
    class: 'mu-pauta',
    role: 'img',
    'aria-label': 'Pauta com clave de sol',
  });
  const linhas = s('g', { class: 'mu-pauta-linhas' });
  for (let k = 0; k < 5; k++) linhas.append(s('line', { x1: 6, x2: largura - 6, y1: 40 + k * 20, y2: 40 + k * 20 }));
  const clave = s('g', { class: 'mu-clave', transform: 'translate(4 0)' },
    s('path', { d: CLAVE, fill: 'none', stroke: TINTA, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    s('circle', { cx: 33, cy: 146, r: 5.5, fill: TINTA }));
  const notas = s('g');
  svg.append(linhas, clave, notas);
  return { svg, notas };
}

// Uma nota (semínima) na pauta. cor = cor da cabeça da nota; nome = etiqueta embaixo.
function notaSVG(n, x, { cor = n.cor, nome = false } = {}) {
  const y = yNota(n);
  const g = s('g', { class: 'mu-nota-svg', 'data-midi': n.midi });
  g.append(s('rect', { x: x - 24, y: 14, width: 48, height: nome ? 162 : 150, fill: 'transparent' })); // área de toque
  // linhas suplementares (Dó4 tem uma, embaixo da pauta)
  for (let d = -2; d >= n.degrau; d -= 2) {
    g.append(s('line', { x1: x - 17, x2: x + 17, y1: Y_MI - d * 10, y2: Y_MI - d * 10, class: 'mu-suplementar' }));
  }
  for (let d = 10; d <= n.degrau; d += 2) {
    g.append(s('line', { x1: x - 17, x2: x + 17, y1: Y_MI - d * 10, y2: Y_MI - d * 10, class: 'mu-suplementar' }));
  }
  // haste: para cima até o Lá, para baixo a partir do Si (como na partitura)
  const sobe = n.degrau < 4;
  g.append(s('line', {
    x1: sobe ? x + 10.3 : x - 10.3, x2: sobe ? x + 10.3 : x - 10.3,
    y1: sobe ? y - 2 : y + 2, y2: sobe ? y - 35 : y + 35,
    stroke: TINTA, 'stroke-width': 2.2, 'stroke-linecap': 'round',
  }));
  g.append(s('ellipse', {
    cx: x, cy: y, rx: 11, ry: 8, transform: `rotate(-20 ${x} ${y})`,
    fill: cor, stroke: TINTA, 'stroke-width': 1.6, class: 'mu-cabeca',
  }));
  if (nome) {
    g.append(
      s('rect', { x: x - 21, y: 152, width: 42, height: 22, rx: 11, fill: n.cor }),
      s('text', { x, y: 168, 'text-anchor': 'middle', fill: n.corTexto, class: 'mu-pauta-nome' }, n.nome),
    );
  }
  return g;
}

function cartaoPauta(svg, larguraMax) {
  svg.style.maxWidth = larguraMax + 'px';
  return h('div', { class: 'mu-cartao-pauta' }, svg);
}

// ---------- pedacinhos de tela ----------
function cartaNota(n, onclick) {
  const el = h('button', { class: 'mu-carta', onclick, 'aria-label': nomeCompleto(n) },
    h('span', null, n.nome), n.agudo ? h('small', null, 'agudo') : null);
  return varsNota(el, n);
}
function bolinhaNota(n) {
  return vars(h('i', { title: nomeCompleto(n) }), { '--c': n.cor });
}

// Liga a Lila e a instrução ao jogo() do core e cuida do estado entre as rodadas.
// A rodada já monta a tela enquanto a Lila explica; antes de tocar ou perguntar,
// ela espera a explicação terminar com `await st.instrucao`.
function rodarJogo(raiz, { id, instrucao, rodada }) {
  const info = INFO[id];
  const nv = nivelAtual();
  const atividade = `n${nv.n}-${id}`;
  let st = {};
  jogo(raiz, {
    titulo: info.titulo,
    cor: info.cor,
    voltar: voltarMenu,
    rodadas: RODADAS,
    modulo: MOD,
    atividade,
    rodada: async (i, area) => {
      if (i === 0) {
        st = { nivel: nv, desafio: progresso.feito(MOD, atividade) >= ESTRELAS_PARA_PASSAR };
        const { texto, fala } = instrucao(st);
        const corpo = area.parentElement;
        corpo.querySelector('.xt-lila')?.remove();
        st.lila = lila(texto, { fala });
        st.balao = (t) => (st.lila.querySelector('.xt-balao').textContent = t);
        corpo.prepend(st.lila);
        st.instrucao = falar(fala);
      } else {
        st.instrucao = null;
      }
      if (!area.isConnected) return false;
      return rodada(i, area, st);
    },
  });
}

// ---------- abrir ----------
let saudou = false;
let saudouMusicas = false;

export function abrir(raiz, partes = []) {
  estilo('musica');
  pararTudo();
  const [a, b] = partes;
  if (a === 'livre') return telaLivre(raiz);
  if (a === 'pauta') return telaAprenderPauta(raiz);
  if (a === 'musicas') return telaMusicas(raiz);
  if (a === 'musica' && b) return telaMusica(raiz, b);
  if (a === 'jogo') {
    if (b === 'onde') return jogoOnde(raiz);
    if (b === 'ouvir') return jogoOuvir(raiz);
    if (b === 'subiu') return jogoSubiu(raiz);
    if (b === 'pauta') return jogoPauta(raiz);
  }
  return menu(raiz);
}

// ---------- menu ----------
function menu(raiz) {
  // abriu nível novo desde a última visita?
  const maior = maiorAberto();
  const antes = Number(progresso.get('musica.maiorAberto', 1)) || 1;
  let novo = null;
  if (maior > antes) {
    progresso.set('musica.maiorAberto', maior);
    if (!progresso.liberarTudo()) {
      novo = maior;
      progresso.set('musica.nivel', maior);
    }
  }
  const nv = nivelAtual();
  const { corpo } = tela(raiz, { titulo: 'Música com a Lila 🎹', cor: COR });

  const texto = novo ? `Nível ${novo} aberto! 🎉` : `Oi, ${perfil.nome}! Vamos tocar piano?`;
  const fala = novo ? FALA_NOVO_NIVEL[novo] : FALAS.menu(perfil.nome);
  corpo.append(lila(texto, { fala }));
  if (novo) {
    sfx.festa();
    falar(fala);
  } else if (!saudou) {
    falar(fala);
  }
  saudou = true;

  const niveis = h('div', { class: 'mu-niveis' }, NIVEIS.map((n) => {
    const aberto = nivelAberto(n.n);
    return h('button', {
      class: 'mu-nivel' + (n.n === nv.n ? ' mu-sel' : '') + (aberto ? '' : ' mu-trancado'),
      'aria-label': `Nível ${n.n}`,
      onclick: () => {
        if (!aberto) {
          sfx.errado();
          falar(FALAS.trancado);
          return;
        }
        sfx.pop();
        progresso.set('musica.nivel', n.n);
        const pais = raiz.querySelector('.xt-btn-pais'); // botão dos pais que o main.js põe no menu
        menu(raiz);
        if (pais) raiz.querySelector('.xt-corpo')?.append(pais);
      },
    },
    h('b', null, aberto ? `${n.emoji} Nível ${n.n}` : `🔒 Nível ${n.n}`),
    h('span', { class: 'mu-pontos' }, n.notas.map((id) => bolinhaNota(NOTA[id]))),
    h('small', null, n.resumo));
  }));

  const est = (j) => progresso.feito(MOD, `n${nv.n}-${j}`);
  const card = (id, rota, comEstrelas = true) => cartao({
    emoji: INFO[id].emoji,
    titulo: INFO[id].titulo,
    sub: INFO[id].sub + (NUCLEO.includes(id) && nv.n < NIVEIS.length ? ' · 🔑' : ''),
    cor: INFO[id].cor,
    estrelas: comEstrelas ? est(id) : null,
    onclick: () => irPara(rota),
  });
  corpo.append(
    niveis,
    trilha(nv),
    h('div', { class: 'xt-grade' },
      card('livre', '#/musica/livre', false),
      card('onde', '#/musica/jogo/onde'),
      card('ouvir', '#/musica/jogo/ouvir'),
      card('subiu', '#/musica/jogo/subiu'),
      card('pauta', '#/musica/pauta'),
      card('musicas', '#/musica/musicas', false)),
  );
}

// Quanto falta para abrir o próximo nível
function trilha(nv) {
  if (nv.n >= NIVEIS.length) return h('p', { class: 'mu-trilha' }, '🌟 Último nível! Agora é tocar as músicas.');
  if (nivelAberto(nv.n + 1)) return h('p', { class: 'mu-trilha' }, `✅ O nível ${nv.n + 1} já está aberto!`);
  return h('p', { class: 'mu-trilha' },
    `🔑 Para abrir o nível ${nv.n + 1}: `,
    NUCLEO.map((j) => {
      const e = progresso.feito(MOD, `n${nv.n}-${j}`);
      return h('span', { class: 'mu-trilha-item' + (e >= ESTRELAS_PARA_PASSAR ? ' ok' : '') },
        `${INFO[j].emoji} ${'★'.repeat(e)}${'☆'.repeat(3 - e)}`);
    }));
}

// ---------- a. teclado livre ----------
function telaLivre(raiz) {
  const { corpo } = tela(raiz, { titulo: INFO.livre.titulo, cor: INFO.livre.cor, voltar: voltarMenu });
  const visor = h('div', { class: 'mu-visor' }, h('span', { class: 'mu-visor-texto' }, 'Toque uma tecla! 🎹'));
  const tec = teclado({ pretas: true, deslizar: true });

  function mostrar(m) {
    const n = NOTA_POR_MIDI.get(m);
    if (!n) {
      visor.replaceChildren(h('span', { class: 'mu-visor-nome mu-visor-preta' }, '♪'));
      return;
    }
    const nome = varsNota(h('span', { class: 'mu-visor-nome' }, n.nome, n.agudo ? h('small', null, 'agudo') : null), n);
    visor.replaceChildren(nome);
  }
  tec.aoTocar = (m) => mostrar(m);

  let dica = false;
  const bDica = h('button', {
    class: 'mu-btn-peq',
    onclick: () => {
      dica = !dica;
      tec.grupoPretas(dica);
      tec.brilhar(dica ? 60 : null);
      bDica.classList.toggle('on', dica);
      if (dica) {
        visor.replaceChildren(h('span', { class: 'mu-visor-texto' }, 'O Dó mora à esquerda das duas teclas pretas'));
        falar(FALAS.dicaDo);
      }
    },
  }, '💡 Onde mora o Dó?');

  const MODOS = [['cheio', '🎨 Cores e nomes'], ['cor', '🎨 Só cores'], ['branco', '⬜ Sem cores']];
  let modo = 0;
  const bModo = h('button', {
    class: 'mu-btn-peq',
    onclick: () => {
      modo = (modo + 1) % MODOS.length;
      tec.modo(MODOS[modo][0]);
      bModo.textContent = MODOS[modo][1];
    },
  }, MODOS[0][1]);

  const ESCALA = [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60].map((midi, k, a) => ({ midi, tempos: k === a.length - 1 ? 2 : 1 }));
  let tocandoEscala = false;
  const bEscala = h('button', {
    class: 'mu-btn-peq',
    onclick: async () => {
      if (tocandoEscala) {
        pararTudo();
        return;
      }
      tocandoEscala = true;
      bEscala.textContent = '⏹ Parar';
      await tocarSequencia(ESCALA, { bpm: 150, aoTocar: (k, it) => { tec.piscar(it.midi, 260); mostrar(it.midi); } });
      tocandoEscala = false;
      bEscala.textContent = '🎵 Escada de notas';
    },
  }, '🎵 Escada de notas');

  corpo.append(
    lila('Toque à vontade!', { fala: FALAS.livre }),
    visor,
    tec.el,
    h('div', { class: 'mu-botoes' }, bDica, bModo, bEscala),
  );
  falar(FALAS.livre);
}

// ---------- b. onde mora a nota? ----------
function jogoOnde(raiz) {
  rodarJogo(raiz, {
    id: 'onde',
    instrucao: () => ({ texto: 'Toque na tecla da nota!', fala: FALAS.onde }),
    async rodada(i, area, st) {
      if (i === 0) {
        st.sortear = saco(st.nivel.notas);
        st.tec = teclado({ som: false });
      }
      const nota = NOTA[st.sortear()];
      const pistas = pistasOnde(i, st.desafio);
      const tec = st.tec;
      tec.reiniciar({ ativas: midisDoNivel(st.nivel), modo: pistas });
      const falaRodada = FALAS.ondeRodada(nota);
      area.append(cartaNota(nota, () => falar(falaRodada)), tec.el);

      if (st.instrucao) {
        tec.bloquear(true);
        await st.instrucao;
        if (!area.isConnected) return false;
        tec.bloquear(false);
      } else if (pistas !== st.pistas) {
        tec.bloquear(true);
        if (pistas === 'cor') await st.lila.trocar('Teclas sem nome!', FALAS.ondeCor);
        else await st.lila.trocar('Como no piano de verdade!', FALAS.ondeBranco);
        if (!area.isConnected) return false;
        tec.bloquear(false);
      }
      st.pistas = pistas;
      st.lila.trocar(nota.agudo ? 'Toque no Dó agudo!' : `Toque no ${nota.nome}!`, falaRodada);

      return esperarTecla(tec, {
        // "Dó" vale nos dois Dós; "Dó agudo" só no da direita
        certa: (m) => m === nota.midi || (nota.id === 'do' && m === NOTA.do2.midi),
        aoErrar: (m) => {
          if (nota.agudo && m === NOTA.do.midi) falar(FALAS.outroDo);
          else tentarDeNovo();
          tec.brilhar(nota.midi);
        },
      });
    },
  });
}

// ---------- c. ouvir e achar ----------
function fichaSom(n, onclick) {
  const el = h('button', { class: 'mu-ficha-som' + (n ? '' : ' mu-surpresa'), onclick, 'aria-label': n ? nomeCompleto(n) : 'Nota surpresa' },
    n ? n.nome : '?');
  return n ? varsNota(el, n) : el;
}

function jogoOuvir(raiz) {
  rodarJogo(raiz, {
    id: 'ouvir',
    instrucao: () => ({ texto: 'Escute o Dó e depois a nota surpresa!', fala: FALAS.ouvir }),
    async rodada(i, area, st) {
      if (i === 0) st.tec = teclado({ som: false });
      const etapa = etapaOuvir(st.nivel.n, i);
      const ids = etapa.notas || st.nivel.notas;
      const tec = st.tec;
      tec.reiniciar({ ativas: ids.map((id) => NOTA[id].midi) });
      tec.bloquear(true);

      let alvo = null;
      let tocando = false;
      const fDo = fichaSom(NOTA.do, () => {
        if (tocando) return;
        tocarNota(NOTA.do.midi);
        tec.piscar(NOTA.do.midi, 400);
      });
      const fAlvo = fichaSom(null, () => {
        if (!tocando && alvo) tocarNota(alvo.midi);
      });
      const bOuvir = h('button', { class: 'xt-btn mu-btn-ouvir', onclick: () => tocarPar() }, '🔊 Ouvir de novo');
      area.append(h('div', { class: 'mu-par' }, fDo, h('span', { class: 'mu-seta' }, '➜'), fAlvo), bOuvir, tec.el);

      if (st.instrucao) await st.instrucao;
      if (st.etapa !== etapa) {
        const mudou = st.etapa != null;
        st.etapa = etapa;
        st.sortear = saco(ids);
        if (mudou) await st.lila.trocar('Agora com mais notas!', FALAS.ouvirMais);
      } else {
        st.balao('Escute… qual nota foi essa?');
      }
      if (!area.isConnected) return false;
      alvo = NOTA[st.sortear()];
      let acertou = false;

      async function tocarPar() {
        if (tocando || !alvo || !area.isConnected) return;
        tocando = true;
        tec.bloquear(true);
        bOuvir.disabled = true;
        await tocarSequencia([{ midi: NOTA.do.midi, tempos: 1 }, { midi: alvo.midi, tempos: 1.5 }], {
          bpm: 70,
          legato: 0.72, // um respiro entre o Dó e a nota surpresa
          aoTocar: (k) => {
            animar(k ? fAlvo : fDo, 'mu-soando');
            if (k === 0) tec.piscar(NOTA.do.midi, 500);
          },
        });
        tocando = false;
        tec.bloquear(false);
        bOuvir.disabled = false;
      }

      await wait(250);
      await tocarPar();
      return esperarTecla(tec, {
        certa: (m) => m === alvo.midi,
        aoAcertar: () => {
          acertou = true;
          fAlvo.classList.remove('mu-surpresa');
          fAlvo.textContent = alvo.nome;
          varsNota(fAlvo, alvo);
          animar(fAlvo, 'mu-soando');
        },
        aoErrar: async (m, erros) => {
          if (erros >= 2) tec.brilhar(alvo.midi);
          await tentarDeNovo();
          if (area.isConnected && !acertou) tocarPar();
        },
      });
    },
  });
}

// ---------- d. subiu ou desceu? ----------
function parSubiu(i, igual) {
  const brancas = NOTAS.map((n) => n.midi);
  if (igual) {
    const m = pick(brancas);
    return [m, m];
  }
  const e = SUBIU_ETAPAS.find((x) => i < x.ate) || SUBIU_ETAPAS[SUBIU_ETAPAS.length - 1];
  const pares = [];
  for (const a of brancas) {
    for (const b of brancas) {
      const d = Math.abs(b - a);
      if (d >= e.min && d <= e.max) pares.push([a, b]);
    }
  }
  return pick(pares);
}
function botaoResposta(emoji, titulo, sub) {
  return h('button', { class: 'mu-resp', 'aria-label': titulo },
    h('span', { class: 'mu-resp-emoji' }, emoji), h('b', null, titulo), h('small', null, sub));
}

function jogoSubiu(raiz) {
  rodarJogo(raiz, {
    id: 'subiu',
    instrucao: (st) => ({
      texto: st.nivel.n >= 2 ? 'Subiu, desceu ou igual?' : 'Subiu ou desceu?',
      fala: st.nivel.n >= 2 ? FALAS.subiu2 : FALAS.subiu1,
    }),
    async rodada(i, area, st) {
      const comIgual = st.nivel.n >= 2;
      if (i === 0) {
        const possiveis = Array.from({ length: RODADAS - 2 }, (_, k) => k + 2);
        st.iguais = new Set(comIgual ? sample(possiveis, SUBIU_IGUAIS) : []);
      }
      const [a, b] = parSubiu(i, st.iguais.has(i));
      const certo = b > a ? 'subiu' : b < a ? 'desceu' : 'igual';

      const c1 = h('div', { class: 'mu-chip' }, '🎵');
      const c2 = h('div', { class: 'mu-chip' }, '🎵');
      const opcoes = [
        { id: 'subiu', el: botaoResposta('🐦', 'Subiu', 'mais agudo') },
        { id: 'desceu', el: botaoResposta('🐢', 'Desceu', 'mais grave') },
      ];
      if (comIgual) opcoes.push({ id: 'igual', el: botaoResposta('🟰', 'Igual', 'a mesma nota') });
      let tocando = false;
      const bOuvir = h('button', { class: 'xt-btn mu-btn-ouvir', onclick: () => tocar() }, '🔊 Ouvir de novo');
      area.append(
        h('div', { class: 'mu-par' }, c1, h('span', { class: 'mu-seta' }, '➜'), c2),
        bOuvir,
        h('div', { class: 'mu-respostas' }, opcoes.map((o) => o.el)),
      );
      if (i > 0) st.balao(comIgual ? 'Subiu, desceu ou igual?' : 'Subiu ou desceu?');

      async function tocar() {
        if (tocando || !area.isConnected) return;
        tocando = true;
        await tocarSequencia([{ midi: a, tempos: 1 }, { midi: b, tempos: 1.4 }], {
          bpm: 76,
          legato: 0.72,
          aoTocar: (k) => animar(k ? c2 : c1, 'mu-soando'),
        });
        tocando = false;
      }
      if (st.instrucao) await st.instrucao;
      await wait(250);
      await tocar();
      return escolher(opcoes.map((o) => ({ el: o.el, id: o.id, certo: o.id === certo })), {
        aoAcertar: async (o) => {
          animar(o.el, o.id === 'subiu' ? 'mu-voa' : o.id === 'desceu' ? 'mu-desce' : 'mu-igual');
          await tocar();
        },
      });
    },
  });
}

// ---------- e. a forma da nota (pauta) ----------
function telaAprenderPauta(raiz) {
  const nv = nivelAtual();
  const { corpo } = tela(raiz, { titulo: INFO.pauta.titulo, cor: INFO.pauta.cor, voltar: voltarMenu });
  const notas = nv.notas.map((id) => NOTA[id]);
  const X0 = 92;
  const PASSO = 50;
  const largura = X0 + (notas.length - 1) * PASSO + 34;
  const p = pautaSVG(largura, { nomes: true });
  const grupos = new Map();
  notas.forEach((n, k) => {
    const g = notaSVG(n, X0 + k * PASSO, { nome: true });
    grupos.set(n.midi, g);
    p.notas.append(g);
  });
  const tec = teclado({ ativas: notas.map((n) => n.midi) });
  const acender = (m) => animar(grupos.get(m), 'mu-pula');
  tec.aoTocar = (m) => acender(m);
  p.svg.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('.mu-nota-svg');
    if (!g) return;
    e.preventDefault();
    const m = Number(g.dataset.midi);
    tocarNota(m);
    acender(m);
    tec.piscar(m, 350);
  });

  let tocando = false;
  const bTodas = h('button', {
    class: 'mu-btn-peq',
    onclick: async () => {
      if (tocando) return;
      tocando = true;
      await tocarSequencia(notas.map((n) => ({ midi: n.midi })), {
        bpm: 110,
        aoTocar: (k, it) => {
          acender(it.midi);
          tec.piscar(it.midi, 300);
        },
      });
      tocando = false;
    },
  }, '🎵 Ouvir todas');

  corpo.append(
    lila('Toque nas notas para ouvir!', { fala: FALAS.aprenderPauta }),
    cartaoPauta(p.svg, Math.round(largura * 1.6)),
    tec.el,
    h('div', { class: 'mu-botoes' },
      bTodas,
      h('button', { class: 'xt-btn', onclick: () => irPara('#/musica/jogo/pauta') }, '▶ Vamos jogar!')),
  );
  falar(FALAS.aprenderPauta);
}

function jogoPauta(raiz) {
  rodarJogo(raiz, {
    id: 'pauta',
    instrucao: () => ({ texto: 'Que nota é essa? Toque a tecla!', fala: FALAS.pauta }),
    async rodada(i, area, st) {
      if (i === 0) {
        st.sortear = saco(st.nivel.notas);
        st.tec = teclado({ som: false });
      }
      const nota = NOTA[st.sortear()];
      const preta = st.desafio && i >= RODADAS - PAUTA_RODADAS_SEM_COR;
      const tec = st.tec;
      tec.reiniciar({ ativas: midisDoNivel(st.nivel) });
      const p = pautaSVG(220);
      const g = notaSVG(nota, 150, { cor: preta ? TINTA : nota.cor });
      p.notas.append(g);
      area.append(cartaoPauta(p.svg, 440), tec.el);

      if (preta && !st.avisouPreta) {
        st.avisouPreta = true;
        tec.bloquear(true);
        await st.lila.trocar('Agora a nota é pretinha!', FALAS.pautaPreta);
        if (!area.isConnected) return false;
        tec.bloquear(false);
      } else if (i > 0 && !preta) {
        st.balao('Que nota é essa? Toque a tecla!');
      }

      return esperarTecla(tec, {
        certa: (m) => m === nota.midi,
        aoAcertar: () => {
          g.querySelector('.mu-cabeca').setAttribute('fill', nota.cor);
          animar(g, 'mu-pula');
        },
        aoErrar: (m) => {
          const n = NOTA_POR_MIDI.get(m);
          if (n && n.id.startsWith('do') && nota.id.startsWith('do')) falar(FALAS.outroDo);
          else tentarDeNovo();
          tec.brilhar(nota.midi);
        },
      });
    },
  });
}

// ---------- f. toque a musiquinha ----------
const COR_NIVEL = { 1: '#d0688f', 2: '#e0744a', 3: '#7E57C2' };
const atividadeMusica = (m) => `n${m.nivel}-musica-${m.id}`;

function telaMusicas(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Toque a musiquinha 🎶', cor: INFO.musicas.cor, voltar: voltarMenu });
  corpo.append(lila('Escolha uma música!', { fala: FALAS.musicas }));
  if (!saudouMusicas) falar(FALAS.musicas);
  saudouMusicas = true;
  for (const nv of NIVEIS) {
    const lista = MUSICAS.filter((m) => m.nivel === nv.n);
    if (!lista.length) continue;
    const aberto = nivelAberto(nv.n);
    corpo.append(
      h('h2', { class: 'xt-secao' }, `${nv.emoji} Nível ${nv.n}`),
      h('div', { class: 'xt-grade' }, lista.map((m) => {
        const usadas = [...new Set(notasDa(m).map((x) => x.id))].map((id) => NOTA[id]).sort((x, y) => x.midi - y.midi);
        return cartao({
          emoji: m.emoji,
          titulo: m.titulo,
          sub: usadas.map(nomeCompleto).join(' · '),
          cor: COR_NIVEL[m.nivel] || COR,
          bloqueado: !aberto,
          estrelas: aberto ? progresso.feito(MOD, atividadeMusica(m)) : null,
          onclick: () => irPara(`#/musica/musica/${m.id}`),
        });
      })),
    );
  }
}

function telaMusica(raiz, id) {
  const musica = MUSICAS.find((m) => m.id === id);
  if (!musica || !nivelAberto(musica.nivel)) return telaMusicas(raiz);
  const voltar = () => irPara('#/musica/musicas');
  const { corpo, atualizarEstrelas } = tela(raiz, { titulo: `${musica.titulo} ${musica.emoji}`, cor: INFO.musicas.cor, voltar });
  const notas = notasDa(musica);
  const bolas = [];
  const partitura = h('div', { class: 'mu-partitura' }, frasesDa(musica).map((frase) =>
    h('div', { class: 'mu-frase' }, frase.map((nt) => {
      const n = NOTA[nt.id];
      const b = varsNota(h('div', { class: 'mu-bola' + (nt.tempos >= 2 ? ' mu-longa' : '') }, n.nome), n);
      bolas.push(b);
      return b;
    }))));
  const tec = teclado({ som: false, ativas: [...new Set(notas.map((n) => n.midi))] });
  const bOuvir = h('button', { class: 'xt-btn mu-btn-ouvir', onclick: () => ouvirTudo() }, '▶ Ouvir a música toda');
  const bRecomecar = h('button', { class: 'xt-btn xt-btn-2', onclick: () => recomecar() }, '🔁 Recomeçar');
  corpo.append(
    lila('Toque a tecla que brilha!', { fala: FALAS.musica, tamanho: 64 }),
    partitura,
    h('div', { class: 'mu-botoes' }, bOuvir, bRecomecar),
    h('div', { class: 'mu-rodape' }, tec.el),
  );

  let pos = 0;
  let erros = 0;
  let tocando = false;
  let acabou = false;

  function marcar(rolar) {
    bolas.forEach((b, k) => {
      b.classList.toggle('mu-feita', k < pos);
      b.classList.toggle('mu-atual', k === pos && !acabou);
    });
    tec.proxima(acabou ? null : notas[pos].midi);
    if (rolar && bolas[pos]) {
      try { bolas[pos].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch {}
    }
  }

  tec.aoTocar = (m) => {
    if (tocando || acabou) return;
    const alvo = notas[pos].midi;
    if (m === alvo) {
      tocarNota(m, { dur: 1.4 });
      pos++;
      if (pos >= notas.length) fim();
      else marcar(true);
    } else {
      erros++;
      tocarNota(m, { vol: 0.16, dur: 0.5 });
      tec.chamar(alvo);
      animar(bolas[pos], 'mu-chama');
    }
  };

  async function fim() {
    acabou = true;
    marcar(false);
    const est = erros <= 2 ? 3 : erros <= Math.ceil(notas.length / 4) ? 2 : 1;
    progresso.registrar(MOD, atividadeMusica(musica), est);
    atualizarEstrelas();
    bOuvir.classList.add('mu-destaque');
    await wait(900);
    if (!corpo.isConnected) return;
    festa(raiz, { estrelas: est, frase: FALAS.musicaFim, deNovo: recomecar, voltar: () => {} });
  }

  function recomecar() {
    if (tocando) pararTudo();
    pos = 0;
    erros = 0;
    acabou = false;
    bOuvir.classList.remove('mu-destaque');
    marcar(false);
    try { partitura.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch {}
  }

  async function ouvirTudo() {
    if (tocando) {
      pararSequencia();
      pararTudo();
      return;
    }
    tocando = true;
    tec.bloquear(true);
    tec.proxima(null);
    bolas.forEach((b) => b.classList.remove('mu-atual'));
    bOuvir.textContent = '⏹ Parar';
    const batida = 60 / musica.bpm;
    await tocarSequencia(notas, {
      bpm: musica.bpm,
      aoTocar: (k, it) => {
        bolas.forEach((b) => b.classList.remove('mu-soando'));
        bolas[k].classList.add('mu-soando');
        tec.piscar(it.midi, Math.min(600, it.tempos * batida * 900));
      },
    });
    bolas.forEach((b) => b.classList.remove('mu-soando'));
    tocando = false;
    tec.bloquear(false);
    bOuvir.textContent = '▶ Ouvir a música toda';
    marcar(false);
  }

  marcar(false);
  falar(FALAS.musica);
}
