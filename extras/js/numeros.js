// Números em inglês: conhecer (tocar e ouvir), contar ("How many?") e ouvir e achar.
// Os objetos ficam em fileiras de 5, como a escola usa para contar.
import {
  h, wait, shuffle, sample, pick, falar, sfx, progresso, temVoz,
  irPara, tela, lila, jogo, escolher, estilo,
} from './core.js';
import { NUM_EN, NIVEIS, JOGOS, ESTRELAS_PARA_PASSAR, OBJETOS, FALAS } from './numeros-dados.js';
import { ELOGIOS_EN, TENTE_EN } from './cvc-dados.js';

const MOD = 'numeros';
const COR = '#E8865A';
const MENU = () => irPara('#/numeros');
const dizer = (t) => falar(t, 'en');
const elogiar = () => dizer(pick(ELOGIOS_EN));

// uma voz só para os números de um nível: a gravada da Lila só se todos tiverem gravação
function vozDosNumeros(nv) {
  const todos = NUM_EN.slice(nv.de, nv.ate + 1).every((w) => temVoz(w, 'en'));
  return (n) => falar(NUM_EN[n], 'en', { aparelho: !todos });
}

export function nivelAberto(n) {
  if (n <= 1 || progresso.liberarTudo()) return true;
  return nivelAberto(n - 1) && JOGOS.every((j) => progresso.feito(MOD, `n${n - 1}-${j}`) >= ESTRELAS_PARA_PASSAR);
}
export function nivelAtual() {
  let maior = 1;
  while (maior < NIVEIS.length && nivelAberto(maior + 1)) maior++;
  const escolhido = Number(progresso.get('numeros.nivel', maior)) || maior;
  return NIVEIS[Math.min(escolhido, maior) - 1];
}

export function abrir(raiz, partes) {
  estilo('numeros');
  const [a, b] = partes;
  if (a === 'aprender') return aprender(raiz);
  if (a === 'jogo' && b === 'contar') return contar(raiz);
  if (a === 'jogo' && b === 'ouvir') return ouvir(raiz);
  return menu(raiz);
}

function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Numbers 🔢', cor: COR });
  corpo.append(lila(FALAS.menu, { lang: 'en' }));
  const nv = nivelAtual();
  corpo.append(h('div', { class: 'nu-niveis' }, NIVEIS.map((x) => {
    const aberto = nivelAberto(x.n);
    return h('button', {
      class: 'nu-nivel' + (x.n === nv.n ? ' atual' : '') + (aberto ? '' : ' fechado'),
      onclick: () => { if (!aberto) return sfx.errado(); progresso.set('numeros.nivel', x.n); menu(raiz); },
    }, h('span', null, aberto ? x.emoji : '🔒'), h('b', null, x.nome));
  })));
  const est = (j) => progresso.feito(MOD, `n${nv.n}-${j}`);
  const card = (emoji, titulo, sub, rota, estrelas) => h('button', { class: 'xt-cartao', style: { '--cor': COR }, onclick: () => irPara(rota) },
    h('span', { class: 'xt-cartao-emoji' }, emoji),
    h('span', { class: 'xt-cartao-txt' }, h('b', null, titulo), h('small', null, sub)),
    estrelas != null ? h('span', { class: 'xt-cartao-est' }, '★'.repeat(estrelas) + '☆'.repeat(3 - estrelas)) : null);
  corpo.append(h('div', { class: 'xt-grade' },
    card('🔢', 'Numbers', `Tap and listen · ${nv.nome}`, '#/numeros/aprender'),
    card('🍎', 'Count', 'How many?', '#/numeros/jogo/contar', est('contar')),
    card('👂', 'Listen and find', 'Find the number', '#/numeros/jogo/ouvir', est('ouvir')),
  ));
}

// ---------- conhecer: tocar no número e ouvir; "Play all" conta junto ----------
function aprender(raiz) {
  const nv = nivelAtual();
  const nome = vozDosNumeros(nv);
  const { corpo } = tela(raiz, { titulo: `🔢 Numbers ${nv.nome}`, cor: COR, voltar: MENU });
  corpo.append(lila(FALAS.aprender, { lang: 'en' }));
  const nums = [];
  for (let n = nv.de; n <= nv.ate; n++) nums.push(n);
  const cartas = nums.map((n) => {
    const b = h('button', { class: 'xt-ficha nu-carta', 'aria-label': NUM_EN[n] }, h('b', null, String(n)), h('small', null, NUM_EN[n]));
    b.addEventListener('click', () => tocar(n, b));
    return b;
  });
  async function tocar(n, b) {
    for (const c of cartas) c.classList.remove('soando');
    b.classList.add('soando');
    await nome(n);
    b.classList.remove('soando');
  }
  let contando = 0;
  async function todos() {
    const minha = ++contando;
    await dizer(FALAS.todos);
    for (let i = 0; i < cartas.length; i++) {
      if (minha !== contando || !cartas[i].isConnected) return;
      await tocar(nums[i], cartas[i]);
      await wait(200);
    }
  }
  corpo.append(
    h('div', { class: 'lt-botoes' }, h('button', { class: 'xt-btn xt-btn-2', onclick: todos }, '▶ Count together')),
    h('div', { class: 'nu-cartas' }, cartas),
  );
  dizer(FALAS.aprender);
}

// números da rodada: no nível 3 os novos (11–20) aparecem mais
function sortearNumeros(nv, quantos) {
  const lista = [];
  for (let i = 0; i < quantos; i++) {
    if (nv.foco && Math.random() < 0.7) lista.push(nv.foco[0] + Math.floor(Math.random() * (nv.foco[1] - nv.foco[0] + 1)));
    else lista.push(nv.de + Math.floor(Math.random() * (nv.ate - nv.de + 1)));
  }
  return lista;
}
// opções perto do certo (±1, ±2), dentro do nível
function opcoesPerto(n, nv, total) {
  const perto = shuffle([n - 1, n + 1, n - 2, n + 2, n + 3, n - 3].filter((x) => x >= nv.de && x <= nv.ate));
  return shuffle([n, ...perto.slice(0, total - 1)]);
}

// ---------- contar: quantos tem? ----------
function contar(raiz) {
  const nv = nivelAtual();
  const nome = vozDosNumeros(nv);
  const alvos = sortearNumeros(nv, 8);
  jogo(raiz, {
    titulo: `🍎 Count ${nv.nome}`, cor: COR, voltar: MENU, langInstrucao: 'en', elogiosFesta: ELOGIOS_EN,
    modulo: MOD, atividade: `n${nv.n}-contar`, rodadas: alvos.length, falarInstrucao: false,
    instrucao: { texto: FALAS.contar },
    rodada: (i, area) => {
      const n = alvos[i];
      const obj = pick(OBJETOS);
      const coisas = Array.from({ length: n }, () => h('span', { class: 'nu-coisa' }, obj));
      const opcoes = opcoesPerto(n, nv, 3).map((x) => ({ certo: x === n, el: h('button', { class: 'xt-ficha nu-op' }, h('b', null, String(x))) }));
      area.append(h('div', { class: 'xt-ficha nu-quadro' }, h('div', { class: 'nu-coisas', style: { gridTemplateColumns: `repeat(${Math.min(n, 5)}, auto)` } }, coisas)), h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)));
      if (i === 0) dizer(FALAS.contar);
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: async () => {
          // conta junto, uma por uma (até 10 falando cada número; acima, só acende)
          for (let k = 0; k < n; k++) {
            if (!coisas[k].isConnected) return;
            coisas[k].classList.add('contada');
            if (n <= 10) await nome(k + 1);
            else await wait(90);
          }
          await nome(n);
          elogiar();
          await wait(500);
        },
        aoErrar: () => dizer(pick(TENTE_EN)),
      });
    },
  });
}

// ---------- ouvir e achar ----------
function ouvir(raiz) {
  const nv = nivelAtual();
  const nome = vozDosNumeros(nv);
  const alvos = sortearNumeros(nv, 10);
  jogo(raiz, {
    titulo: `👂 Listen ${nv.nome}`, cor: COR, voltar: MENU, langInstrucao: 'en', elogiosFesta: ELOGIOS_EN,
    modulo: MOD, atividade: `n${nv.n}-ouvir`, rodadas: alvos.length, falarInstrucao: false,
    instrucao: { texto: FALAS.ouvir },
    rodada: (i, area) => {
      const n = alvos[i];
      const opcoes = opcoesPerto(n, nv, 4).map((x) => ({ certo: x === n, el: h('button', { class: 'xt-ficha nu-op' }, h('b', null, String(x))) }));
      area.append(
        h('div', { class: 'lt-com-ouvir' }, h('button', { class: 'xt-ouvir', 'aria-label': 'Listen again', onclick: () => nome(n) }, '🔊')),
        h('div', { class: 'xt-opcoes' }, opcoes.map((o) => o.el)),
      );
      if (i === 0) dizer(FALAS.ouvir).then(() => nome(n));
      else nome(n);
      return escolher(opcoes, {
        falarElogio: false,
        aoAcertar: () => elogiar(),
        aoErrar: () => nome(n),
      });
    },
  });
}
