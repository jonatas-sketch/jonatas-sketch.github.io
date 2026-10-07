// Funções comuns para falar com o ElevenLabs (chave fora do repositório, que é público)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const ARQ_CHAVE = join(homedir(), 'Documents/Claude/Stella/.chaves/elevenlabs.txt');
const API = 'https://api.elevenlabs.io/v1';

export function lerChave() {
  if (!existsSync(ARQ_CHAVE)) {
    console.error(`Falta a chave do ElevenLabs em ${ARQ_CHAVE}`);
    process.exit(1);
  }
  return readFileSync(ARQ_CHAVE, 'utf8').trim();
}

export async function api(caminho, chave, opcoes = {}) {
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

// procura no histórico uma fala que já está no app, para usar a mesma voz/modelo/ajustes da Lila
export async function descobrirVoz(chave, conhecidas) {
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
  const r = await api('/voices', chave);
  const vozes = (await r.json()).voices.map((v) => `${v.voice_id}  ${v.name} (${v.category})`);
  console.error('Não achei a voz da Lila no histórico. Vozes da conta (rode de novo com VOZ_ID=...):\n' + vozes.join('\n'));
  process.exit(2);
}

export async function falarArquivo(chave, voz, corpo) {
  const r = await api(`/text-to-speech/${voz}?output_format=mp3_44100_128`, chave, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(corpo),
  });
  return Buffer.from(await r.arrayBuffer());
}
