// Som de piano sintetizado (Web Audio, sem arquivo de áudio).
// Soma de parciais senoidais levemente desafinados (como a corda de verdade),
// ataque rápido, queda em duas etapas, filtro que escurece com o tempo,
// um "toque do martelo" de ruído e um pouquinho de sala (reverb).
import { audioCtx } from './core.js';

export const frequencia = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

// Amplitude de cada harmônico (1º = fundamental)
const PARCIAIS = [1, 0.6, 0.36, 0.22, 0.14, 0.09, 0.055, 0.035];
const SOMA = PARCIAIS.reduce((a, b) => a + b, 0);
const INARMONIA = 0.00035; // a corda estica os harmônicos agudos um tiquinho
const MAX_VOZES = 16;

// ---------- saída comum: seco + sala -> compressor -> caixa de som ----------
let mestre = null;
function saida(c) {
  if (mestre && mestre.c === c) return mestre.entrada;
  const entrada = c.createGain();
  const seco = c.createGain();
  seco.gain.value = 0.92;
  const sala = c.createConvolver();
  sala.buffer = respostaDaSala(c);
  const molhado = c.createGain();
  molhado.gain.value = 0.2;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.knee.value = 10;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;
  entrada.connect(seco);
  seco.connect(comp);
  entrada.connect(sala);
  sala.connect(molhado);
  molhado.connect(comp);
  comp.connect(c.destination);
  mestre = { c, entrada, ruido: bufferDeRuido(c) };
  return entrada;
}
// Sala pequena e quente: ruído com queda exponencial, suavizado
function respostaDaSala(c) {
  const dur = 1.3;
  const n = Math.floor(c.sampleRate * dur);
  const b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let ant = 0;
    for (let i = 0; i < n; i++) {
      const t = i / c.sampleRate;
      ant = ant * 0.55 + (Math.random() * 2 - 1) * 0.45;
      d[i] = ant * Math.exp(-t / 0.3) * Math.min(1, t / 0.01);
    }
  }
  return b;
}
function bufferDeRuido(c) {
  const n = Math.floor(c.sampleRate * 0.06);
  const b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// ---------- vozes ativas (para abafar e parar) ----------
const vozes = new Set();
function abafar(voz, c, tempo = 0.05) {
  if (voz.abafada) return;
  voz.abafada = true;
  const t = c.currentTime;
  try {
    voz.mudo.gain.setValueAtTime(1, t);
    voz.mudo.gain.linearRampToValueAtTime(0, t + tempo);
  } catch {}
  for (const o of voz.fontes) {
    try { o.stop(t + tempo + 0.02); } catch {}
  }
  vozes.delete(voz);
}

/**
 * Toca uma nota de piano.
 * @param {number} midi  60 = Dó4 (dó central) … 72 = Dó5
 * @param {object} op    dur = segundos até o abafador (padrão: deixa soar ~2 s) ·
 *                       vol = 0..1 · quando = tempo do AudioContext (para agendar)
 */
export function tocarNota(midi, { dur = 2, vol = 0.8, quando } = {}) {
  let c;
  try { c = audioCtx(); } catch { return; }
  if (c.state !== 'running') {
    try { c.resume(); } catch {} // iOS: 'interrupted' depois de ligação/Siri
  }
  const agora = c.currentTime;
  const t = quando != null ? Math.max(quando, agora) : agora + 0.004;
  const f0 = frequencia(midi);
  const agudez = Math.min(1, Math.max(0, (midi - 48) / 36)); // notas agudas morrem mais rápido
  const pico = 0.42 * vol;
  dur = Math.max(0.12, dur);

  // Re-tocar a mesma tecla abafa a anterior (como o martelo batendo na corda)
  if (quando == null) {
    for (const v of vozes) if (v.midi === midi) abafar(v, c, 0.06);
  }
  // Polifonia limitada: abafa a mais antiga
  if (vozes.size >= MAX_VOZES) abafar(vozes.values().next().value, c, 0.04);

  const destino = saida(c);
  const mudo = c.createGain(); // só para parar de repente sem estalo
  const corpo = c.createGain(); // envelope da nota
  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.Q.value = 0.5;
  corpo.connect(filtro);
  filtro.connect(mudo);
  mudo.connect(destino);

  // Filtro: começa brilhante e vai escurecendo
  const brilho0 = Math.min(f0 * (5 + 5 * vol), 12000);
  const brilho1 = Math.max(f0 * 2.4, 650);
  filtro.frequency.setValueAtTime(brilho0, t);
  filtro.frequency.exponentialRampToValueAtTime(brilho1, t + 0.9 + 0.6 * (1 - agudez));

  // Envelope: ataque de 5 ms, queda rápida (martelo) e queda longa (corda), depois o abafador
  const tau1 = 0.085;
  const tau2 = 0.62 - 0.22 * agudez;
  const meio = Math.min(0.2, dur * 0.7);
  const g = corpo.gain;
  g.setValueAtTime(0, t);
  g.linearRampToValueAtTime(pico, t + 0.005);
  g.setTargetAtTime(pico * 0.34, t + 0.005, tau1);
  g.setTargetAtTime(0, t + meio, tau2);
  g.setTargetAtTime(0, t + dur, 0.06);
  const fim = t + dur + 0.45;

  const fontes = [];
  const nyquist = c.sampleRate / 2 - 400;
  PARCIAIS.forEach((amp, k) => {
    const n = k + 1;
    const fn = f0 * n * Math.sqrt(1 + INARMONIA * n * n);
    if (fn > nyquist) return;
    // as duas primeiras parciais têm uma "corda irmã" desafinada (calor do piano)
    const cordas = n <= 2 ? [[0, 0.62], [n === 1 ? 1.4 : -1.1, 0.38]] : [[0, 1]];
    const gp = c.createGain();
    const a = amp / SOMA;
    gp.gain.setValueAtTime(a, t);
    // harmônicos agudos somem mais depressa (o som fica mais redondo)
    if (n > 1) gp.gain.setTargetAtTime(a * 0.12, t + 0.01, 0.9 / (n * (1 + agudez)));
    gp.connect(corpo);
    for (const [cents, peso] of cordas) {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = fn;
      o.detune.value = cents;
      if (peso === 1) o.connect(gp);
      else {
        const gc = c.createGain();
        gc.gain.value = peso;
        o.connect(gc);
        gc.connect(gp);
      }
      o.start(t);
      o.stop(fim);
      fontes.push(o);
    }
  });

  // Toque do martelo: ruído curtinho e filtrado
  const martelo = c.createBufferSource();
  martelo.buffer = mestre.ruido;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = Math.min(Math.max(f0 * 6, 1400), 4200);
  bp.Q.value = 0.8;
  const gm = c.createGain();
  gm.gain.setValueAtTime(0, t);
  gm.gain.linearRampToValueAtTime(0.09 * vol, t + 0.002);
  gm.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
  martelo.connect(bp);
  bp.connect(gm);
  gm.connect(mudo);
  martelo.start(t);
  martelo.stop(t + 0.05);
  fontes.push(martelo);

  const voz = { midi, mudo, fontes, abafada: false };
  vozes.add(voz);
  fontes[0].onended = () => {
    vozes.delete(voz);
    try { mudo.disconnect(); } catch {}
  };
  return voz;
}

// ---------- sequências (melodias, "ouvir de novo") ----------
let seqToken = 0;

/**
 * Toca uma sequência de notas no ritmo certo.
 * itens: [{ midi, tempos }] (tempos em batidas; midi null = pausa).
 * aoTocar(i, item) é chamado quando cada nota começa a soar (para acender bolinhas e teclas).
 * Devolve Promise<boolean>: true se tocou até o fim, false se foi interrompida.
 */
export function tocarSequencia(itens, { bpm = 100, aoTocar, vol = 0.8, legato = 0.92 } = {}) {
  const id = ++seqToken;
  let c;
  try { c = audioCtx(); } catch { return Promise.resolve(false); }
  const batida = 60 / bpm;
  return new Promise((ok) => {
    let t = null;
    let i = 0;
    let parado = 0; // quanto tempo o relógio do áudio ficou travado (iOS antes do primeiro toque)
    let ultimo = c.currentTime;
    const passo = () => {
      if (id !== seqToken) return ok(false);
      if (c.state !== 'running') {
        try { c.resume(); } catch {}
      }
      const agora = c.currentTime;
      if (agora === ultimo) {
        parado += 40;
        if (parado > 2500) return ok(false); // som bloqueado: desiste sem travar o jogo
      } else {
        parado = 0;
        ultimo = agora;
      }
      if (t == null) {
        if (c.state !== 'running') return void setTimeout(passo, 40);
        t = agora + 0.08;
      }
      while (i < itens.length && t < agora + 0.2) {
        const it = itens[i];
        const d = (it.tempos || 1) * batida;
        if (it.midi != null) tocarNota(it.midi, { quando: t, dur: Math.max(0.25, d * legato), vol: it.vol ?? vol });
        const idx = i;
        setTimeout(() => {
          if (id === seqToken && aoTocar) aoTocar(idx, it);
        }, Math.max(0, (t - agora) * 1000));
        t += d;
        i++;
      }
      if (i >= itens.length) {
        const resto = Math.max(0, (t - c.currentTime) * 1000);
        setTimeout(() => ok(id === seqToken), resto);
        return;
      }
      setTimeout(passo, 40);
    };
    passo();
  });
}

export function pararSequencia() {
  seqToken++;
}

// Para tudo (ao sair da tela)
export function pararTudo() {
  seqToken++;
  if (!vozes.size) return;
  let c;
  try { c = audioCtx(); } catch { return; }
  for (const v of [...vozes]) abafar(v, c, 0.05);
}
