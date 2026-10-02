// Servidor local simples para testar o site: node tools/serve.mjs [porta]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = join(fileURLToPath(import.meta.url), '../..');
const porta = Number(process.argv[2] || 8765);
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.m4a': 'audio/mp4' };
http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = normalize(join(raiz, p));
  if (!f.startsWith(raiz)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(f)).isDirectory()) f = join(f, 'index.html');
    const corpo = await readFile(f);
    res.writeHead(200, { 'content-type': tipos[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(corpo);
  } catch { res.writeHead(404).end('404'); }
}).listen(porta, '127.0.0.1', () => console.log('servindo', raiz, 'em http://127.0.0.1:' + porta));
