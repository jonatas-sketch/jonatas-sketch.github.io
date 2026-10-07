#!/usr/bin/env node
// Grava o SOM de cada letra (phonics, inglês britânico) na voz da Lila, para o "c… a… t… cat".
//
//   node tools/gerar-fonemas.mjs --teste                 → 6 sons (s a t p i n) em 2 jeitos, em Stella/sons-teste/
//   node tools/gerar-fonemas.mjs --gerar --jeito ipa     → os 18 sons no jeito aprovado, em audio/fonemas/
//
// Os modelos de inglês do ElevenLabs aceitam a escrita fonética (<phoneme>), que diz o som exato.
import { writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { lerChave, descobrirVoz, falarArquivo } from './elevenlabs.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PASTA = join(RAIZ, 'audio/fonemas');
const PASTA_TESTE = join(homedir(), 'Documents/Claude/Stella/sons-teste');

// som → [IPA (britânico), CMU arpabet]; os sons que dá para esticar vão com ː (sss, mmm…)
const SONS = {
  s: ['sː', 'S'], a: ['æ', 'AE1'], t: ['t', 'T'], p: ['p', 'P'], i: ['ɪ', 'IH1'], n: ['nː', 'N'],
  m: ['mː', 'M'], d: ['d', 'D'], g: ['ɡ', 'G'], o: ['ɒ', 'AA1'], k: ['k', 'K'], e: ['ɛ', 'EH1'],
  u: ['ʌ', 'AH1'], r: ['ɹː', 'R'], h: ['h', 'HH'], b: ['b', 'B'], f: ['fː', 'F'], l: ['lː', 'L'],
};
const JEITOS = {
  ipa: (id) => ({ text: `<phoneme alphabet="ipa" ph="${SONS[id][0]}">${id}</phoneme>`, model_id: 'eleven_flash_v2' }),
  cmu: (id) => ({ text: `<phoneme alphabet="cmu-arpabet" ph="${SONS[id][1]}">${id}</phoneme>`, model_id: 'eleven_turbo_v2' }),
};

async function main() {
  const teste = process.argv.includes('--teste');
  const gerar = process.argv.includes('--gerar');
  if (!teste && !gerar) {
    console.log('Use --teste (6 sons em 2 jeitos) ou --gerar --jeito ipa|cmu (os 18 sons).');
    return;
  }
  const chave = lerChave();
  const ref = await descobrirVoz(chave, new Set(['Muito bem, Stella!', 'Isso mesmo!', 'cat', 'dog']));
  const ajustes = ref.settings || undefined;
  console.log(`Voz da Lila: ${ref.voice_id}`);
  if (teste) {
    mkdirSync(PASTA_TESTE, { recursive: true });
    for (const id of ['s', 'a', 't', 'p', 'i', 'n']) {
      for (const [nome, jeito] of Object.entries(JEITOS)) {
        const corpo = { ...jeito(id), ...(ajustes ? { voice_settings: ajustes } : {}) };
        writeFileSync(join(PASTA_TESTE, `${id}-${nome}.mp3`), await falarArquivo(chave, ref.voice_id, corpo));
        console.log(`  ${id}-${nome}.mp3`);
      }
    }
    console.log(`Pronto: ouça em ${PASTA_TESTE}`);
    return;
  }
  const nome = process.argv[process.argv.indexOf('--jeito') + 1];
  if (!JEITOS[nome]) throw new Error('Escolha --jeito ipa ou --jeito cmu');
  mkdirSync(PASTA, { recursive: true });
  for (const id of Object.keys(SONS)) {
    const corpo = { ...JEITOS[nome](id), ...(ajustes ? { voice_settings: ajustes } : {}) };
    writeFileSync(join(PASTA, `${id}.mp3`), await falarArquivo(chave, ref.voice_id, corpo));
    console.log(`  ${id}.mp3`);
  }
  const prontos = readdirSync(PASTA).filter((f) => f.endsWith('.mp3')).map((f) => f.slice(0, -4)).sort();
  writeFileSync(join(RAIZ, 'extras/js/fonemas-index.js'),
    '// Sons de letra já gravados em /audio/fonemas — gerado por tools/gerar-fonemas.mjs\n' +
    `export const FONEMAS_PRONTOS = new Set(${JSON.stringify(prontos)});\n`);
  console.log(`Pronto: ${prontos.length} sons em audio/fonemas.`);
}

main().catch((e) => {
  console.error('ERRO:', e.message);
  process.exit(1);
});
