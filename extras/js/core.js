// Base comum dos módulos extras (Letras na Pauta, Phonics, Música).
// Mesmo visual e mesma voz da Lila do app principal.
import { VOZ } from './voz-index.js';
import { ELOGIOS, DE_NOVO, FALA_TRANCADA } from './falas-core.js';
export { ELOGIOS, DE_NOVO };

// ---------- DOM ----------
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  append(el, kids);
  return el;
}
const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  setAttrs(el, attrs);
  append(el, kids);
  return el;
}
function setAttrs(el, attrs) {
  if (!attrs) return;
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'style' && typeof v === 'object') {
      for (const [prop, val] of Object.entries(v)) {
        if (val == null) continue;
        if (prop.startsWith('--')) el.style.setProperty(prop, val);
        else el.style[prop] = val;
      }
    }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const sample = (arr, n) => shuffle(arr).slice(0, n);

// ---------- Áudio ----------
let ctx = null;
export function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
// O iOS só libera som depois de um toque: destrava no primeiro toque.
let vozPreparada = false;
function unlock() {
  if (!vozPreparada) {
    // o iPad só fala depois que a primeira fala nasce de um toque
    vozPreparada = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch {}
  }
  try {
    const c = audioCtx();
    const b = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = b;
    src.connect(c.destination);
    src.start(0);
  } catch {}
}
for (const ev of ['pointerdown', 'touchend', 'click', 'keydown']) {
  window.addEventListener(ev, unlock, { passive: true });
}

// Mesmo hash do app principal: /audio/voz/<hash>.mp3
export function vozHash(text, lang) {
  const n = lang + '|' + text.normalize('NFC').trim().replace(/\s+/g, ' ');
  let r = 2166136261;
  for (let i = 0; i < n.length; i++) {
    r ^= n.charCodeAt(i);
    r = Math.imul(r, 16777619);
  }
  return (r >>> 0).toString(16).padStart(8, '0');
}
export const temVoz = (text, lang = 'pt') => VOZ.has(vozHash(text, lang));

const buffers = new Map();
async function loadBuffer(url) {
  if (buffers.has(url)) return buffers.get(url);
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error('sem áudio');
      return r.arrayBuffer();
    })
    .then((ab) => new Promise((ok, bad) => audioCtx().decodeAudioData(ab, ok, bad)));
  buffers.set(url, p);
  p.catch(() => buffers.delete(url));
  return p;
}
let falaAtual = null;
let falaToken = 0;
let sequencia = 0;
// Para tudo, inclusive uma sequência de falas em andamento
export function calar() {
  sequencia++;
  pararFala();
}
let ultimoCancelamento = 0;
function pararFala() {
  falaToken++;
  try {
    const ss = window.speechSynthesis;
    if (ss.speaking || ss.pending) {
      ss.cancel();
      ultimoCancelamento = Date.now();
    }
  } catch {}
  if (falaAtual) {
    try { falaAtual.stop(); } catch {}
    falaAtual = null;
  }
}
function tocarBuffer(buf, token) {
  return new Promise((ok) => {
    if (token !== falaToken) return ok();
    const c = audioCtx();
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    let fim = false;
    const terminar = () => { if (!fim) { fim = true; ok(); } };
    src.onended = terminar;
    // se o iPad "dormir" o som, a fala não pode prender a tela
    setTimeout(terminar, buf.duration * 1000 + 600);
    falaAtual = src;
    src.start();
  });
}
const IDIOMA = { pt: 'pt-BR', en: 'en-GB', 'en-us': 'en-US', es: 'es-ES' };
let vozes = [];
function carregarVozes() {
  try { vozes = window.speechSynthesis.getVoices(); } catch {}
}
carregarVozes();
try { window.speechSynthesis.addEventListener('voiceschanged', carregarVozes); } catch {}
function melhorVoz(tag) {
  if (!vozes.length) carregarVozes();
  const norm = (v) => v.lang.replace('_', '-').toLowerCase();
  let lista = vozes.filter((v) => norm(v) === tag.toLowerCase());
  if (!lista.length) lista = vozes.filter((v) => norm(v).startsWith(tag.slice(0, 2).toLowerCase()));
  if (!lista.length) return null;
  const nota = (v) =>
    (/premium|enhanced|aprimorad|melhorad|neural|natural/i.test(v.name) ? 10 : 0) +
    (/luciana|francisca|kate|serena|martha|daniel|arthur|samantha/i.test(v.name) ? 3 : 0) +
    (/eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|albert|bahh|bells|boing|bubbles|cellos|jester|junior|organ|superstar|ralph|fred|kathy|trinoids|whisper|wobble|zarvox|bad news|good news/i.test(v.name) ? -20 : 0) +
    (v.localService ? 1 : 0);
  return lista.sort((a, b) => nota(b) - nota(a))[0];
}
function tts(text, lang, token) {
  return new Promise((ok) => {
    if (token !== falaToken) return ok();
    // no iPad, falar logo depois de cancelar engole a frase: espera um instante
    const espera = Math.max(0, 160 - (Date.now() - ultimoCancelamento));
    setTimeout(() => ttsJa(text, lang, token, ok), espera);
  });
}
function ttsJa(text, lang, token, ok) {
  {
    if (token !== falaToken) return ok();
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = IDIOMA[lang] || lang;
      const v = melhorVoz(u.lang);
      if (v) u.voice = v;
      u.rate = lang === 'pt' ? 0.95 : 0.85;
      u.onend = () => ok();
      u.onerror = () => ok();
      window.speechSynthesis.speak(u);
      setTimeout(ok, 1500 + text.length * 120); // rede de segurança
    } catch {
      ok();
    }
  }
}
// Fala a frase: usa a gravação da Lila quando existe; senão, a voz do aparelho.
export function falar(text, lang = 'pt') {
  if (!text) return Promise.resolve();
  pararFala();
  const token = falaToken;
  const chave = lang === 'en-us' ? 'en' : lang;
  const hash = vozHash(text, chave);
  if (VOZ.has(hash)) {
    return loadBuffer(`/audio/voz/${hash}.mp3`)
      .then((buf) => tocarBuffer(buf, token))
      .catch(() => tts(text, lang, token));
  }
  return tts(text, lang, token);
}
// Toca um arquivo de som (ex.: o som de uma letra) — para no meio se outra fala começar
export function tocarArquivo(url) {
  pararFala();
  const token = falaToken;
  return loadBuffer(url).then((buf) => tocarBuffer(buf, token)).catch(() => {});
}

export async function falarVarias(lista) {
  const minha = ++sequencia;
  for (const [txt, lang] of lista) {
    await falar(txt, lang);
    if (sequencia !== minha) return;
    await wait(250);
    if (sequencia !== minha) return;
  }
}

// Efeitos sonoros curtinhos (sintetizados, sem arquivo)
function tom(freq, t0, dur, vol = 0.18, tipo = 'sine') {
  const c = audioCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}
export const sfx = {
  certo() {
    try {
      const c = audioCtx();
      [1047, 1319, 1568].forEach((f, i) => tom(f, c.currentTime + i * 0.07, 0.25, 0.12));
    } catch {}
  },
  errado() {
    try {
      const c = audioCtx();
      tom(330, c.currentTime, 0.18, 0.1, 'triangle');
      tom(262, c.currentTime + 0.12, 0.25, 0.1, 'triangle');
    } catch {}
  },
  pop() {
    try { tom(880, audioCtx().currentTime, 0.08, 0.08); } catch {}
  },
  festa() {
    try {
      const c = audioCtx();
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tom(f, c.currentTime + i * 0.11, 0.3, 0.12));
    } catch {}
  },
};

let ultimoElogio = '';
export function elogiar() {
  let e = pick(ELOGIOS);
  if (e === ultimoElogio) e = pick(ELOGIOS);
  ultimoElogio = e;
  return falar(e);
}
export const tentarDeNovo = () => falar(pick(DE_NOVO));

// ---------- Progresso (só neste aparelho) ----------
const CHAVE = 'stella-extras-v1';
function lerTudo() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch { return {}; }
}
let dados = lerTudo();
export const progresso = {
  get(caminho, padrao) {
    let o = dados;
    for (const k of caminho.split('.')) {
      if (o == null || typeof o !== 'object') return padrao;
      o = o[k];
    }
    return o === undefined ? padrao : o;
  },
  set(caminho, valor) {
    const ks = caminho.split('.');
    let o = dados;
    for (const k of ks.slice(0, -1)) o = o[k] && typeof o[k] === 'object' ? o[k] : (o[k] = {});
    o[ks.at(-1)] = valor;
    try { localStorage.setItem(CHAVE, JSON.stringify(dados)); } catch {}
  },
  estrelas() { return this.get('estrelas', 0); },
  somarEstrelas(n) { this.set('estrelas', this.estrelas() + n); },
  // guarda o melhor resultado (0–3 estrelas) de uma atividade
  registrar(modulo, atividade, estrelas) {
    const k = `${modulo}.feito.${atividade}`;
    const antes = this.get(k, 0);
    if (estrelas > antes) this.set(k, estrelas);
    this.set(`${modulo}.ultima`, atividade);
    this.somarEstrelas(estrelas);
  },
  feito(modulo, atividade) { return this.get(`${modulo}.feito.${atividade}`, 0); },
  liberarTudo() { return this.get('pais.liberarTudo', false); },
  zerar() {
    dados = {};
    try { localStorage.removeItem(CHAVE); } catch {}
  },
};

// Nome da criança e do mascote vêm do perfil do app (só leitura)
export const perfil = { nome: 'Stella', mascote: 'Lila' };
export function carregarPerfil() {
  return new Promise((ok) => {
    try {
      const req = indexedDB.open('keyval-store');
      req.onupgradeneeded = () => req.transaction.abort(); // não cria banco novo
      req.onerror = () => ok(perfil);
      req.onsuccess = () => {
        const db = req.result;
        try {
          const g = db.transaction('keyval', 'readonly').objectStore('keyval').get('profile');
          g.onsuccess = () => {
            const p = g.result || {};
            const nome = p.nome || p.name || p.crianca || p.childName;
            const mascote = p.mascote || p.pet || p.mascot || p.unicornio;
            if (typeof nome === 'string' && nome.trim()) perfil.nome = nome.trim();
            if (typeof mascote === 'string' && mascote.trim()) perfil.mascote = mascote.trim();
            db.close();
            ok(perfil);
          };
          g.onerror = () => { db.close(); ok(perfil); };
        } catch { db.close(); ok(perfil); }
      };
    } catch { ok(perfil); }
  });
}

// ---------- Telas ----------
export function irPara(hash) {
  calar();
  location.hash = hash;
}
export function voltarAoApp() {
  calar();
  location.href = '/';
}

// Tela com barra no topo: ⬅ voltar · título · ⭐ estrelas
export function tela(raiz, { titulo, cor = 'var(--terracota)', voltar, fundo }) {
  raiz.replaceChildren();
  const estrelas = h('span', { class: 'xt-estrelas' }, '⭐ ', String(progresso.estrelas()));
  const topo = h(
    'header',
    { class: 'xt-topo' },
    h('button', {
      class: 'xt-voltar',
      'aria-label': 'Voltar',
      onclick: () => (voltar ? voltar() : voltarAoApp()),
    }, voltar ? '⬅' : '🏠'),
    h('h1', { style: { color: cor } }, titulo),
    estrelas,
  );
  const corpo = h('main', { class: 'xt-corpo' });
  const el = h('div', { class: 'xt-tela', style: fundo ? { background: fundo } : null }, topo, corpo);
  raiz.append(el);
  return { corpo, atualizarEstrelas: () => (estrelas.lastChild.textContent = String(progresso.estrelas())) };
}

// Cartões grandes de menu
export function cartao({ emoji, img, titulo, sub, cor, onclick, bloqueado, estrelas }) {
  return h(
    'button',
    {
      class: 'xt-cartao' + (bloqueado ? ' bloqueado' : ''),
      style: { '--cor': cor },
      onclick: bloqueado ? () => { sfx.errado(); falar(FALA_TRANCADA); } : onclick,
      'aria-label': titulo,
    },
    img ? h('img', { src: img, alt: '' }) : h('span', { class: 'xt-cartao-emoji' }, bloqueado ? '🔒' : emoji),
    h('span', { class: 'xt-cartao-txt' }, h('b', null, titulo), sub ? h('small', null, sub) : null),
    estrelas != null ? h('span', { class: 'xt-cartao-est' }, '★'.repeat(estrelas) + '☆'.repeat(3 - estrelas)) : null,
  );
}

// A Lila com balão de fala; tocar nela repete a frase
export function lila(texto, { lang = 'pt', fala, pose = 'listen', tamanho = 84 } = {}) {
  const balao = h('div', { class: 'xt-balao' }, texto);
  const img = h('img', {
    src: pose === 'celebra' ? '/assets/unicornia-celebra.webp' : pose === 'idle' ? '/assets/unicornia.webp' : '/assets/unicornia-listen.webp',
    alt: '',
    style: { width: tamanho + 'px', height: tamanho + 'px' },
  });
  const el = h('div', { class: 'xt-lila', onclick: () => falar(fala || texto, lang) }, img, balao);
  el.trocar = (t, f) => { balao.textContent = t; return falar(f || t, lang); };
  return el;
}

// Rodadas de um jogo: barra de bolinhas, contagem de acertos de primeira, festa no final.
// rodada(i, area) deve devolver uma Promise<boolean> (true = acertou de primeira).
export async function jogo(raiz, opts) {
  const { titulo, cor, voltar, rodadas, rodada, modulo, atividade, instrucao, langInstrucao = 'pt', proxima, falarInstrucao = true, fraseFesta, elogiosFesta } = opts;
  const { corpo, atualizarEstrelas } = tela(raiz, { titulo, cor, voltar });
  const bolinhas = h('div', { class: 'xt-bolinhas' }, Array.from({ length: rodadas }, () => h('i')));
  const area = h('div', { class: 'xt-area' });
  corpo.append(bolinhas, area);
  if (instrucao) {
    const l = lila(instrucao.texto, { lang: langInstrucao, fala: instrucao.fala });
    corpo.prepend(l);
    if (falarInstrucao) falar(instrucao.fala || instrucao.texto, langInstrucao);
  }
  let acertos = 0;
  const inicio = location.hash;
  for (let i = 0; i < rodadas; i++) {
    if (location.hash !== inicio || !area.isConnected) return; // saiu da tela
    area.replaceChildren();
    const deu = await rodada(i, area);
    if (location.hash !== inicio || !area.isConnected) return;
    if (deu) acertos++;
    bolinhas.children[i].className = deu ? 'ok' : 'meio';
    await wait(700);
  }
  const pct = acertos / rodadas;
  const est = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
  progresso.registrar(modulo, atividade, est);
  atualizarEstrelas();
  festa(raiz, { estrelas: est, deNovo: () => jogo(raiz, opts), voltar, proxima, frase: fraseFesta, lang: langInstrucao, elogios: elogiosFesta });
}

export function festa(raiz, { estrelas = 3, deNovo, voltar, frase, proxima, lang = 'pt', elogios }) {
  sfx.festa();
  const conf = h('div', { class: 'xt-confete' });
  for (let i = 0; i < 40; i++) {
    conf.append(h('i', { style: {
      left: Math.random() * 100 + '%',
      background: pick(['#E8865A', '#F2B544', '#8FB58A', '#A98FE0', '#E79AB8', '#4DA6E0']),
      animationDelay: Math.random() * 0.8 + 's',
      animationDuration: 1.8 + Math.random() * 1.4 + 's',
    } }));
  }
  const caixa = h(
    'div',
    { class: 'xt-festa' },
    conf,
    h('img', { src: '/assets/unicornia-celebra.webp', alt: '', class: 'xt-festa-uni' }),
    h('div', { class: 'xt-festa-est' }, '⭐'.repeat(estrelas)),
    h('p', null, frase || `Muito bem, ${perfil.nome}!`),
    h('div', { class: 'xt-festa-botoes' },
      deNovo ? h('button', { class: 'xt-btn xt-btn-2', onclick: () => { caixa.remove(); deNovo(); } }, lang === 'en' ? '🔁 Again' : '🔁 De novo') : null,
      proxima
        ? h('button', { class: 'xt-btn', onclick: () => { caixa.remove(); proxima(); } }, lang === 'en' ? 'Next ▶' : 'Próxima etapa ▶')
        : h('button', { class: 'xt-btn', onclick: () => { caixa.remove(); voltar ? voltar() : voltarAoApp(); } }, lang === 'en' ? 'Done ✓' : 'Pronto ✓'),
    ),
  );
  raiz.append(caixa);
  falar(frase || pick(elogios || ['Uau, você arrasou!', 'Você é incrível!', 'Isso, você é uma estrela!', 'Muito bem, Stella!']), lang);
}

// Pergunta de escolha: opcoes = [{el, certo}], devolve Promise<boolean> (acertou de primeira)
export function escolher(opcoes, { aoAcertar, aoErrar, falarElogio = true } = {}) {
  return new Promise((ok) => {
    let primeira = true;
    let fim = false;
    for (const o of opcoes) {
      o.el.classList.add('xt-op');
      o.el.addEventListener('click', async () => {
        if (fim || o.el.classList.contains('xt-op-errada')) return;
        if (o.certo) {
          fim = true;
          o.el.classList.add('xt-op-certa');
          sfx.certo();
          if (aoAcertar) await aoAcertar(o);
          if (falarElogio) elogiar();
          await wait(600);
          ok(primeira);
        } else {
          primeira = false;
          o.el.classList.add('xt-op-errada');
          sfx.errado();
          if (aoErrar) aoErrar(o);
          else tentarDeNovo();
        }
      });
    }
  });
}

// Botão de alto-falante para repetir um som
export function botaoOuvir(fn, rotulo = '🔊') {
  return h('button', { class: 'xt-ouvir', 'aria-label': 'Ouvir de novo', onclick: fn }, rotulo);
}

// Carrega o CSS próprio de um módulo (extras/css/<nome>.css) uma vez só
export function estilo(nome) {
  if (document.querySelector(`link[data-estilo="${nome}"]`)) return;
  document.head.append(h('link', { rel: 'stylesheet', href: new URL(`../css/${nome}.css`, import.meta.url).href, 'data-estilo': nome }));
}
