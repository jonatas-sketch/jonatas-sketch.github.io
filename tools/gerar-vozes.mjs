#!/usr/bin/env node
// Grava na voz da Lila (ElevenLabs) todas as falas das novidades que ainda não têm áudio.
//
//   node tools/gerar-vozes.mjs            → só conta: quantas falas faltam e quantos caracteres
//   node tools/gerar-vozes.mjs --gerar    → gera de verdade (gasta créditos do ElevenLabs)
//
// A chave fica FORA do repositório (que é público): ~/Documents/Claude/Stella/.chaves/elevenlabs.txt
// A voz, o modelo e os ajustes são descobertos no histórico do ElevenLabs, procurando as falas
// que já foram gravadas para o app (ex.: "Muito bem, Stella!"). Dá para forçar com VOZ_ID=...
// Os arquivos saem em audio/voz/<hash>.mp3 — o mesmo nome que o app principal usa.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_VOZ = join(RAIZ, 'audio/voz');
const ARQ_CHAVE = join(homedir(), 'Documents/Claude/Stella/.chaves/elevenlabs.txt');
const API = 'https://api.elevenlabs.io/v1';

// mesmo hash do app (core.js / app principal)
function vozHash(text, lang) {
  const n = lang + '|' + text.normalize('NFC').trim().replace(/\s+/g, ' ');
  let r = 2166136261;
  for (let i = 0; i < n.length; i++) {
    r ^= n.charCodeAt(i);
    r = Math.imul(r, 16777619);
  }
  return (r >>> 0).toString(16).padStart(8, '0');
}

async function juntarFalas() {
  const modulos = ['falas-core', 'letras-dados', 'cvc-dados', 'ingles-dados', 'musica-dados'];
  const todas = [];
  for (const m of modulos) {
    const mod = await import(join(RAIZ, 'extras/js', m + '.js'));
    const lista = mod.todasAsFalas('Stella').map((x) => (Array.isArray(x) ? x : [x, 'pt']));
    for (const [texto, lang] of lista) todas.push({ texto, lang, modulo: m });
  }
  // falas que apareceram nos testes automáticos e não estavam nas listas
  const coletadas = join(RAIZ, 'extras/_teste/falas-coletadas.json');
  if (existsSync(coletadas)) {
    for (const [texto, lang] of JSON.parse(readFileSync(coletadas, 'utf8'))) todas.push({ texto, lang, modulo: 'testes' });
  }
  const vistos = new Set();
  return todas.filter((f) => {
    const k = vozHash(f.texto, f.lang);
    if (vistos.has(k)) return false;
    vistos.add(k);
    f.hash = k;
    return true;
  });
}

async function api(caminho, chave, opcoes = {}) {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const r = await fetch(API + caminho, { ...opcoes, headers: { 'xi-api-key': chave, ...(opcoes.headers || {}) } });
    if (r.status === 429 || r.status >= 500) {
      await new Promise((ok) => setTimeout(ok, 2000 * (tentativa + 1)));
      continue;
    }
    if (!r.ok) throw new Error(`${caminho} → ${r.status} ${(await r.text()).slice(0, 300)}`);
    return r;
  }
  throw new Error(`${caminho} → muitas tentativas`);
}

// procura no histórico a gravação de falas que já existem no app para copiar voz/modelo/ajustes
async function descobrirVoz(chave, conhecidas) {
  if (process.env.VOZ_ID) return { voice_id: process.env.VOZ_ID, model_id: process.env.MODELO || 'eleven_multilingual_v2', settings: null };
  let depois = '';
  for (let pagina = 0; pagina < 40; pagina++) {
    const r = await api(`/history?page_size=1000${depois ? '&start_after_history_item_id=' + depois : ''}`, chave);
    const j = await r.json();
    const achado = j.history.find((it) => conhecidas.has(it.text?.trim()));
    if (achado) return achado;
    if (!j.has_more || !j.history.length) break;
    depois = j.last_history_item_id || j.history.at(-1).history_item_id;
  }
  return null;
}

async function main() {
  const gerar = process.argv.includes('--gerar');
  const existentes = new Set(readdirSync(PASTA_VOZ).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)));
  const falas = await juntarFalas();
  const faltam = falas.filter((f) => !existentes.has(f.hash));
  const porModulo = {};
  for (const f of faltam) {
    porModulo[f.modulo] ??= { falas: 0, caracteres: 0 };
    porModulo[f.modulo].falas++;
    porModulo[f.modulo].caracteres += f.texto.length;
  }
  const total = faltam.reduce((t, f) => t + f.texto.length, 0);
  console.log(`Falas no total: ${falas.length} · já gravadas: ${falas.length - faltam.length} · faltam: ${faltam.length}`);
  for (const [m, v] of Object.entries(porModulo)) console.log(`  ${m}: ${v.falas} falas, ${v.caracteres} caracteres`);
  console.log(`Caracteres a gerar: ${total}`);
  if (!gerar || !faltam.length) return;

  if (!existsSync(ARQ_CHAVE)) {
    console.error(`Falta a chave do ElevenLabs em ${ARQ_CHAVE}`);
    process.exit(1);
  }
  const chave = readFileSync(ARQ_CHAVE, 'utf8').trim();
  // falas já gravadas no app (para achar a voz da Lila no histórico)
  const conhecidas = new Set(falas.filter((f) => existentes.has(f.hash)).map((f) => f.texto));
  conhecidas.add('Muito bem, Stella!');
  const ref = await descobrirVoz(chave, conhecidas);
  if (!ref) {
    const r = await api('/voices', chave);
    const vozes = (await r.json()).voices.map((v) => `${v.voice_id}  ${v.name} (${v.category})`);
    console.error('Não achei a voz da Lila no histórico. Vozes da conta (rode de novo com VOZ_ID=...):\n' + vozes.join('\n'));
    process.exit(2);
  }
  const modelo = ref.model_id || 'eleven_multilingual_v2';
  const ajustes = ref.settings || undefined;
  console.log(`Voz: ${ref.voice_id} · modelo: ${modelo}${ref.text ? ` · achada pela fala "${ref.text}"` : ''}`);
  const aceitaIdioma = /turbo_v2_5|flash_v2_5|eleven_v3/.test(modelo);

  let feitas = 0;
  for (const f of faltam) {
    const corpo = { text: f.texto, model_id: modelo };
    if (ajustes) corpo.voice_settings = ajustes;
    if (aceitaIdioma) corpo.language_code = f.lang === 'en' ? 'en' : f.lang === 'es' ? 'es' : 'pt';
    const r = await api(`/text-to-speech/${ref.voice_id}?output_format=mp3_44100_128`, chave, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify(corpo),
    });
    writeFileSync(join(PASTA_VOZ, f.hash + '.mp3'), Buffer.from(await r.arrayBuffer()));
    feitas++;
    if (feitas % 20 === 0) console.log(`  ${feitas}/${faltam.length}`);
  }
  console.log(`Pronto: ${feitas} falas gravadas na voz da Lila.`);
  execFileSync('python3', [join(RAIZ, 'tools/voz-index.py')], { stdio: 'inherit' });
}

main().catch((e) => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
