// Phonics da escola (inglês): os sons na ordem do Floppy's Phonics da escola da Stella,
// leitura de verdade (palavras e frases decodificáveis), palavras novas e frases da sala de aula.
// Regra de áudio: NUNCA falar letra ou dígrafo solto (a voz do aparelho fica horrível).
// O som de cada letra é ensinado só por palavras inteiras.
import {
  h, s, wait, shuffle, pick, sample, falar, sfx, elogiar, tentarDeNovo, progresso, perfil,
  irPara, tela, cartao, lila, jogo, festa, escolher, botaoOuvir, estilo,
} from './core.js';
import {
  GRUPOS, LEITURA, CONFLITOS, TRICKY, PARECIDAS, FRASES, TEMAS, FRASES_ESCOLA, LILA,
  segmentar, grafemasAte,
} from './ingles-dados.js';

const MOD = 'ingles';
const BASE = '#/ingles';
const COR = '#3E92CC';
const COR_LER = '#8E72D0';
const COR_ESCOLA = '#D27BA0';
const ir = (...partes) => irPara([BASE, ...partes].join('/'));
const feito = (id) => progresso.feito(MOD, id);
const comNome = (t) => String(t).replace('{nome}', perfil.nome);

// ---------- rotas ----------
// #/ingles · #/ingles/grupo/<n>[/<atividade>] · #/ingles/tricky[/jogo] · #/ingles/frases
// #/ingles/temas · #/ingles/tema/<id>[/aprender|/jogo] · #/ingles/escola[/jogo]
export function abrir(raiz, partes = []) {
  estilo('ingles');
  pararNarracao();
  ligarToque(raiz);
  const [a, b, c] = partes;
  switch (a) {
    case 'grupo': return rotaGrupo(raiz, Number(b), c);
    case 'tricky':
      if (!lerLiberado()) return ir();
      return b === 'jogo' ? trickyJogo(raiz) : trickyLista(raiz);
    case 'frases': return lerLiberado() ? frasesJogo(raiz) : ir();
    case 'temas': return temas(raiz);
    case 'tema': return rotaTema(raiz, b, c);
    case 'escola': return b === 'jogo' ? escolaJogo(raiz) : escolaLista(raiz);
    default: return menu(raiz);
  }
}

// ---------- fala ----------
const SOLTOS = new Set(['ck', 'ff', 'll', 'le', 'ss']);
function falavel(txt) {
  const t = String(txt || '').trim();
  if (!t) return false;
  if (t.length === 1) return t === 'I'; // "I" é palavra; letra solta nunca
  return !SOLTOS.has(t.toLowerCase());
}
function dizer(txt, lang = 'en') {
  if (lang !== 'pt' && !falavel(txt)) return Promise.resolve();
  return falar(String(txt).trim(), lang);
}

// Narração em sequência ({txt, lang, el} ou {fn}). Para sozinha quando a criança toca
// em qualquer coisa ou muda de tela; o item que está falando ganha destaque.
let narracao = 0;
const pararNarracao = () => { narracao++; };
async function narrar(itens) {
  const minha = ++narracao;
  for (const it of itens) {
    if (!it) continue;
    if (minha !== narracao) return false;
    it.el?.classList.add('ig-falando');
    try {
      if (it.fn) await it.fn();
      else await dizer(it.txt, it.lang || 'en');
    } finally {
      it.el?.classList.remove('ig-falando');
    }
    if (minha !== narracao) return false;
    await wait(it.pausa ?? 220);
  }
  return minha === narracao;
}
const ligadas = new WeakSet();
function ligarToque(raiz) {
  if (ligadas.has(raiz)) return;
  ligadas.add(raiz);
  raiz.addEventListener('pointerdown', pararNarracao, true);
}

// Lila com balão; fala ao abrir (com chave: só na primeira vez nesta visita ao app)
const jaFalou = new Set();
function lilaDiz(t, chave) {
  const texto = comNome(typeof t === 'object' ? t.texto : t);
  const fala = comNome(typeof t === 'object' ? t.fala || t.texto : t);
  const el = lila(texto, { fala });
  if (!chave || !jaFalou.has(chave)) {
    if (chave) jaFalou.add(chave);
    narrar([{ txt: fala, lang: 'pt' }]);
  }
  return el;
}
const instrucao = (t) => ({ txt: comNome(t.fala || t.texto), lang: 'pt', pausa: 350 });

// jogo() do core com a instrução da Lila falada ANTES da primeira pergunta
// (sem uma fala cortar a outra). rodada(i, area, antes): antes = item de narração ou null.
function jogar(raiz, { instrucao: inst, rodada, ...resto }) {
  return jogo(raiz, {
    ...resto,
    modulo: MOD,
    rodada: (i, area) => {
      let antes = null;
      if (i === 0 && inst) {
        const corpo = area.parentElement;
        if (corpo && !corpo.querySelector('.xt-lila')) {
          corpo.prepend(lila(comNome(inst.texto), { fala: comNome(inst.fala || inst.texto) }));
        }
        antes = instrucao(inst);
      }
      return rodada(i, area, antes);
    },
  });
}

// Destaca a grafia dentro da palavra: começo (letra) ou fim (ck, ff, ll, le, ss)
function marcar(palavra, g) {
  const baixa = palavra.toLowerCase();
  const i = g.length > 1 ? baixa.lastIndexOf(g) : baixa.indexOf(g);
  if (i < 0) return palavra;
  return [palavra.slice(0, i), h('span', { class: 'ig-marca' }, palavra.slice(i, i + g.length)), palavra.slice(i + g.length)];
}
// Destaca uma palavra inteira dentro da frase
function marcarPalavra(frase, w) {
  const m = new RegExp(`\\b${w}\\b`, 'i').exec(frase);
  if (!m) return frase;
  return [frase.slice(0, m.index), h('span', { class: 'ig-marca' }, m[0]), frase.slice(m.index + m[0].length)];
}

const secao = (t) => h('h2', { class: 'xt-secao' }, t);
const emoji = (e) => h('span', { class: 'ig-emoji' }, e);
const figura = (p) => (p.cena ? cenaOnde(p.cena) : emoji(p.e));
const falaDe = (p) => p.fala || p.w;

// ---------- progresso dos grupos ----------
const grupo = (n) => GRUPOS[n - 1];
const letrasDo = (g) => g.sons.map((x) => x.g);
const idAtiv = (n, a) => `${n}-${a}`;
const leituraAte = (n) => Object.entries(LEITURA).filter(([k]) => Number(k) <= n).flatMap(([, l]) => l);
const temLeitura = (n) => leituraAte(n).length >= 5;
// Grupo 1 (s a t p) quase não tem palavra com figura: no lugar de ler e montar, "Letra e figura"
const atividadesDo = (n) => (temLeitura(n) ? ['sons', 'inicio', 'ler', 'montar'] : ['sons', 'inicio', 'figura']);
const grupoCompleto = (n) => atividadesDo(n).every((a) => feito(idAtiv(n, a)) >= 1);
const grupoLiberado = (n) => n === 1 || progresso.liberarTudo() || grupoCompleto(n - 1);
const lerLiberado = () => progresso.liberarTudo() || grupoCompleto(3);
const estrelasGrupo = (n) => Math.min(...atividadesDo(n).map((a) => feito(idAtiv(n, a))));

const ATIVIDADES = {
  sons: { emoji: '👂', titulo: 'Sons e figuras', sub: 'Toque e escute' },
  inicio: { emoji: '🔤', titulo: 'Primeiro som', sub: 'Com qual letra começa?' },
  figura: { emoji: '🖼️', titulo: 'Letra e figura', sub: 'Qual figura começa assim?' },
  ler: { emoji: '📖', titulo: 'Leia e ache', sub: 'Leia e toque na figura' },
  montar: { emoji: '🧩', titulo: 'Monte a palavra', sub: 'As letras na ordem certa' },
};

// ---------- menu ----------
function menu(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Phonics da escola 🇬🇧', cor: COR });
  const livre = lerLiberado();
  const trancado = 'Abre depois do grupo 3';
  corpo.append(
    lilaDiz(LILA.menu, 'menu'),
    secao('Sons da escola'),
    h('div', { class: 'xt-grade' }, GRUPOS.map(cartaoGrupo)),
    secao('Ler de verdade'),
    h('div', { class: 'xt-grade' },
      cartao({
        emoji: '👀', titulo: 'Tricky words', sub: livre ? 'Palavras de ler de olho' : trancado, cor: COR_LER,
        bloqueado: !livre, estrelas: feito('tricky'), onclick: () => ir('tricky'),
      }),
      cartao({
        emoji: '📜', titulo: 'Frases', sub: livre ? 'Leia e ache a figura' : trancado, cor: '#5E9A57',
        bloqueado: !livre, estrelas: feito('frases'), onclick: () => ir('frases'),
      }),
    ),
    secao('Palavras novas'),
    h('div', { class: 'xt-grade' },
      cartao({
        emoji: '🌍', titulo: 'Temas novos', sub: `${TEMAS.length} temas: ações, roupas, tempo, bichos…`, cor: '#E07A4C',
        onclick: () => ir('temas'),
      }),
    ),
    secao('Frases da escola'),
    h('div', { class: 'xt-grade' },
      cartao({
        emoji: '🏫', titulo: 'Frases da escola', sub: 'Para falar com a teacher', cor: COR_ESCOLA,
        estrelas: feito('escola'), onclick: () => ir('escola'),
      }),
    ),
  );
}

function cartaoGrupo(g) {
  const ativs = atividadesDo(g.n);
  const feitas = ativs.filter((a) => feito(idAtiv(g.n, a)) > 0).length;
  const c = cartao({
    emoji: g.sons[0].ancora.e,
    titulo: letrasDo(g).join(' '),
    sub: `Grupo ${g.n} · ${feitas} de ${ativs.length} ✓`,
    cor: g.cor,
    bloqueado: !grupoLiberado(g.n),
    estrelas: estrelasGrupo(g.n),
    onclick: () => ir('grupo', g.n),
  });
  c.querySelector('.xt-cartao-txt b')?.classList.add('ig-andika', 'ig-letras');
  c.setAttribute('aria-label', `Grupo ${g.n}`);
  return c;
}

// ---------- grupo ----------
function rotaGrupo(raiz, n, ativ) {
  const g = grupo(n);
  if (!g || !grupoLiberado(n)) return ir();
  if (ativ && !atividadesDo(n).includes(ativ)) return ir('grupo', n);
  switch (ativ) {
    case 'sons': return sonsEFiguras(raiz, g);
    case 'inicio': return primeiroSom(raiz, g);
    case 'figura': return letraEFigura(raiz, g);
    case 'ler': return leiaEAche(raiz, g);
    case 'montar': return monteAPalavra(raiz, g);
    default: return telaGrupo(raiz, g);
  }
}

function telaGrupo(raiz, g) {
  const { corpo } = tela(raiz, { titulo: `Grupo ${g.n}`, cor: g.cor, voltar: () => ir() });
  // Faixa com as letras do grupo: tocar fala a palavra-âncora (nunca a letra)
  const faixa = h('div', { class: 'ig-faixa', style: { '--cor': g.cor } }, g.sons.map((som) => {
    const b = h('button', { class: 'ig-faixa-item', 'aria-label': som.ancora.w },
      h('span', { class: 'ig-andika' }, som.g), h('small', null, som.ancora.e));
    b.addEventListener('click', () => narrar([{ txt: som.ancora.w, el: b }]));
    return b;
  }));
  corpo.append(
    lilaDiz(LILA.grupo, 'grupo-' + g.n),
    faixa,
    h('div', { class: 'xt-grade' }, atividadesDo(g.n).map((a) => cartao({
      ...ATIVIDADES[a], cor: g.cor, estrelas: feito(idAtiv(g.n, a)), onclick: () => ir('grupo', g.n, a),
    }))),
  );
}

// ---------- 1. Sons e figuras ----------
function sonsEFiguras(raiz, g) {
  const voltar = () => ir('grupo', g.n);
  const { corpo, atualizarEstrelas } = tela(raiz, { titulo: 'Sons e figuras', cor: g.cor, voltar });
  const abertos = new Set();
  let festejou = false;
  const grade = h('div', { class: 'ig-sons', style: { '--cor': g.cor } });
  for (const som of g.sons) {
    const ancora = h('div', { class: 'ig-ancora' },
      h('span', { class: 'ig-ancora-emoji' }, som.ancora.e),
      h('span', { class: 'ig-andika' }, marcar(som.ancora.w, som.g)));
    const exemplos = som.exemplos.map((ex) => h('div', { class: 'ig-ex' },
      h('span', { class: 'ig-ex-emoji' }, ex.e),
      h('span', { class: 'ig-andika' }, marcar(ex.w, som.g))));
    const card = h('button', { class: 'ig-som', 'aria-label': som.ancora.w },
      h('span', { class: 'ig-visto' }, '✓'),
      h('span', { class: 'ig-grafema ig-andika' }, som.g),
      som.fim ? h('small', { class: 'ig-fim' }, 'no fim da palavra') : null,
      ancora,
      h('div', { class: 'ig-exemplos' }, exemplos));
    card.addEventListener('click', async () => {
      sfx.pop();
      card.classList.add('aberto');
      abertos.add(som.g);
      const ouviuTudo = await narrar([
        { txt: som.ancora.w, el: ancora, pausa: 400 },
        ...som.exemplos.map((ex, k) => ({ txt: ex.w, el: exemplos[k], pausa: 300 })),
      ]);
      if (ouviuTudo && !festejou && abertos.size === g.sons.length && card.isConnected) {
        festejou = true;
        progresso.registrar(MOD, idAtiv(g.n, 'sons'), 3);
        atualizarEstrelas();
        festa(raiz, { estrelas: 3, frase: LILA.sonsFim, voltar, deNovo: () => sonsEFiguras(raiz, g) });
      }
    });
    grade.append(card);
  }
  corpo.append(lilaDiz(LILA.sons), grade);
}

// ---------- 2. Primeiro som (como a lição de casa: separar figuras pelo som do começo) ----------
const MESMO_SOM = { c: 'k', k: 'c' }; // cat/key começam com o mesmo som: nunca os dois como opção
const comInicio = (g) => g.sons.filter((x) => x.inicio.length);

function sortearRodadas(itens, total, chave) {
  // embaralha evitando a mesma letra duas vezes seguidas
  let melhor = shuffle(itens);
  for (let t = 0; t < 30; t++) {
    if (melhor.every((x, i) => i === 0 || chave(x) !== chave(melhor[i - 1]))) break;
    melhor = shuffle(itens);
  }
  return melhor.slice(0, total);
}

function rodadasInicio(n, total = 10) {
  const atuais = comInicio(grupo(n));
  const antigos = GRUPOS.slice(0, n - 1).flatMap(comInicio);
  // grupos 2+ misturam revisão; o grupo 6 só tem o "l" de começo, então revisa mais
  const nAtuais = antigos.length ? Math.min(7, Math.max(4, atuais.length * 2)) : total;
  const usadas = new Set();
  const tirar = (som) => {
    const livres = som.inicio.filter((p) => !usadas.has(p.w));
    const p = pick(livres.length ? livres : som.inicio);
    usadas.add(p.w);
    return { som, p };
  };
  const lista = [];
  let fila = [];
  for (let i = 0; i < nAtuais; i++) {
    if (!fila.length) fila = shuffle(atuais);
    lista.push(tirar(fila.pop()));
  }
  for (let i = nAtuais; i < total; i++) lista.push(tirar(pick(antigos)));
  return sortearRodadas(lista, total, (x) => x.som.g);
}

function opcoesLetras(n, alvo) {
  const ok = (l) => l !== alvo && l !== MESMO_SOM[alvo];
  const atuais = comInicio(grupo(n)).map((x) => x.g);
  const antigas = GRUPOS.slice(0, n - 1).flatMap(comInicio).map((x) => x.g);
  const base = [alvo, ...atuais.filter(ok)];
  // pelo menos 4 opções e pelo menos 1 letra de grupo anterior (se o alvo já é revisão, ele conta)
  const temAntiga = base.some((l) => antigas.includes(l));
  const extras = antigas.length ? Math.max(4 - base.length, temAntiga ? 0 : 1) : 0;
  return shuffle([...base, ...sample(antigas.filter((l) => ok(l) && !base.includes(l)), extras)]);
}

function primeiroSom(raiz, g) {
  let lista = [];
  jogar(raiz, {
    titulo: 'Primeiro som', cor: g.cor, voltar: () => ir('grupo', g.n),
    rodadas: 10, atividade: idAtiv(g.n, 'inicio'), instrucao: LILA.inicio,
    rodada: (i, area, antes) => {
      if (i === 0) lista = rodadasInicio(g.n);
      const { som, p } = lista[i];
      const fig = h('div', { class: 'xt-ficha ig-figura' }, emoji(p.e));
      const revela = h('div', { class: 'ig-revela ig-andika' });
      const ops = opcoesLetras(g.n, som.g).map((l) => ({
        certo: l === som.g, el: h('button', { class: 'xt-ficha ig-letra ig-andika' }, l),
      }));
      area.append(
        h('div', { class: 'ig-linha' }, fig, botaoOuvir(() => narrar([{ txt: p.w, el: fig }]))),
        revela,
        h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)),
      );
      narrar([antes, { txt: p.w, el: fig }]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: async () => {
          revela.replaceChildren(...[marcar(p.w, som.g)].flat());
          await narrar([{ txt: p.w }, { fn: elogiar }]);
        },
        aoErrar: () => narrar([{ fn: tentarDeNovo }, { txt: p.w, el: fig }]),
      });
    },
  });
}

// ---------- 3a. Letra e figura (grupo 1): qual figura começa com a letra mostrada? ----------
function letraEFigura(raiz, g) {
  let lista = [];
  jogar(raiz, {
    titulo: 'Letra e figura', cor: g.cor, voltar: () => ir('grupo', g.n),
    rodadas: 10, atividade: idAtiv(g.n, 'figura'), instrucao: LILA.figura,
    rodada: (i, area, antes) => {
      if (i === 0) {
        const sons = comInicio(grupo(g.n));
        const outros = GRUPOS.slice(0, g.n).flatMap(comInicio);
        const usadas = new Set();
        let fila = [];
        lista = Array.from({ length: 10 }, () => {
          if (!fila.length) fila = shuffle(sons);
          const som = fila.pop();
          const livres = som.inicio.filter((p) => !usadas.has(p.w));
          const certa = pick(livres.length ? livres : som.inicio);
          usadas.add(certa.w);
          const erradas = sample(outros.filter((x) => x.g !== som.g && x.g !== MESMO_SOM[som.g]), 2).map((x) => pick(x.inicio));
          return { som, certa, erradas };
        });
        lista = sortearRodadas(lista, 10, (x) => x.som.g);
      }
      const { som, certa, erradas } = lista[i];
      const ops = shuffle([{ p: certa, certo: true }, ...erradas.map((p) => ({ p, certo: false }))])
        .map((o) => ({ ...o, el: h('button', { class: 'xt-ficha ig-fig' }, emoji(o.p.e)) }));
      const lerFiguras = () => ops.map((o) => ({ txt: o.p.w, el: o.el, pausa: 350 }));
      area.append(
        h('div', { class: 'ig-linha' },
          h('div', { class: 'xt-ficha ig-letra-grande ig-andika' }, som.g),
          botaoOuvir(() => narrar(lerFiguras()))),
        h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)),
      );
      narrar([antes, ...lerFiguras()]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: (o) => narrar([{ txt: o.p.w }, { fn: elogiar }]),
        aoErrar: (o) => narrar([{ txt: o.p.w }, { fn: tentarDeNovo }]),
      });
    },
  });
}

// ---------- palavras para ler e montar ----------
const conflitosDe = (w) => new Set(CONFLITOS.filter((par) => par.includes(w)).flat());

// total palavras: ~60% novas do grupo + revisão dos grupos anteriores
function escolherPalavras(n, total, filtro = () => true) {
  const novas = shuffle((LEITURA[n] || []).filter(filtro));
  const velhas = shuffle(leituraAte(n - 1).filter(filtro));
  const qNovas = Math.min(novas.length, Math.ceil(total * 0.6));
  const lista = [...novas.slice(0, qNovas), ...velhas.slice(0, total - qNovas)];
  for (const p of novas.slice(qNovas)) if (lista.length < total) lista.push(p);
  const todas = [...novas, ...velhas];
  while (lista.length < total && todas.length) lista.push(pick(todas));
  return shuffle(lista);
}

function distratores(alvo, pool, k) {
  const ruins = conflitosDe(alvo.w);
  return sample(pool.filter((p) => p.w !== alvo.w && p.e !== alvo.e && !ruins.has(p.w)), k);
}

// ---------- 3. Leia e ache ----------
function leiaEAche(raiz, g) {
  let lista = [];
  const pool = leituraAte(g.n);
  jogar(raiz, {
    titulo: 'Leia e ache', cor: g.cor, voltar: () => ir('grupo', g.n),
    rodadas: 8, atividade: idAtiv(g.n, 'ler'), instrucao: LILA.ler,
    rodada: (i, area, antes) => {
      if (i === 0) lista = escolherPalavras(g.n, 8);
      const alvo = lista[i];
      const palavra = h('div', { class: 'ig-ler ig-andika' }, alvo.w);
      const ops = shuffle([alvo, ...distratores(alvo, pool, 2)]).map((p) => ({
        certo: p.w === alvo.w, el: h('button', { class: 'xt-ficha ig-fig' }, emoji(p.e)),
      }));
      area.append(
        h('div', { class: 'ig-linha' }, palavra, botaoOuvir(() => narrar([{ txt: alvo.w, el: palavra }]))),
        h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)),
      );
      narrar([antes]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: () => narrar([{ txt: alvo.w, el: palavra }, { fn: elogiar }]),
        aoErrar: () => narrar([{ fn: tentarDeNovo }]),
      });
    },
  });
}

// ---------- 4. Monte a palavra ----------
// ck, ff, ll e ss são UMA peça só. Peças com o mesmo som (c/k/ck, s/ss…) nunca são distratoras.
const SOM_DA_PECA = { c: 'k', k: 'k', ck: 'k', s: 's', ss: 's', f: 'f', ff: 'f', l: 'l', ll: 'l' };
const somDe = (g) => SOM_DA_PECA[g] || g;
function soletravel(p) {
  if (!/^[a-z]+$/.test(p.w) || p.w.length > 5) return false;
  const pecas = segmentar(p.w);
  return pecas.length >= 3 && pecas.length <= 4 && !pecas.includes('le');
}

function monteAPalavra(raiz, g) {
  let lista = [];
  const conhecidas = grafemasAte(g.n).filter((x) => x !== 'le');
  jogar(raiz, {
    titulo: 'Monte a palavra', cor: g.cor, voltar: () => ir('grupo', g.n),
    rodadas: 8, atividade: idAtiv(g.n, 'montar'), instrucao: LILA.montar,
    rodada: (i, area, antes) => {
      if (i === 0) lista = escolherPalavras(g.n, 8, soletravel);
      return rodadaMontar(area, antes, lista[i], conhecidas);
    },
  });
}

function rodadaMontar(area, antes, alvo, conhecidas) {
  return new Promise((ok) => {
    const partes = segmentar(alvo.w);
    const sons = new Set(partes.map(somDe));
    const extras = sample(conhecidas.filter((x) => !partes.includes(x) && !sons.has(somDe(x))), 2);
    const fig = h('div', { class: 'xt-ficha ig-figura' }, emoji(alvo.e));
    const casas = partes.map(() => h('div', { class: 'ig-casa ig-andika' }));
    const linhaCasas = h('div', { class: 'ig-casas' }, casas);
    let k = 0;
    let erros = 0;
    let errosAqui = 0;
    let fim = false;
    casas[0].classList.add('atual');
    const pecas = shuffle([...partes, ...extras]).map((gr) => {
      const b = h('button', { class: 'ig-peca ig-andika' }, gr);
      b.addEventListener('click', async () => {
        if (fim || b.classList.contains('usada')) return;
        if (gr === partes[k]) {
          sfx.pop();
          b.classList.add('usada');
          for (const p of pecas) p.classList.remove('ig-dica');
          casas[k].textContent = gr;
          casas[k].classList.replace('atual', 'cheia');
          k++;
          errosAqui = 0;
          if (k < partes.length) {
            casas[k].classList.add('atual');
            return;
          }
          fim = true;
          linhaCasas.classList.add('ig-completa');
          sfx.certo();
          await narrar([{ txt: alvo.w, el: fig, pausa: 300 }, { fn: elogiar }]);
          await wait(500);
          ok(erros <= 1); // um errinho ainda conta como acerto
        } else {
          sfx.errado();
          erros++;
          errosAqui++;
          b.classList.remove('ig-treme');
          void b.offsetWidth; // reinicia a animação
          b.classList.add('ig-treme');
          narrar([{ fn: tentarDeNovo }]);
          if (errosAqui >= 2) {
            // dica: a peça certa pisca
            pecas.find((p) => !p.classList.contains('usada') && p.textContent === partes[k])?.classList.add('ig-dica');
          }
        }
      });
      return b;
    });
    area.append(
      h('div', { class: 'ig-linha' }, fig, botaoOuvir(() => narrar([{ txt: alvo.w, el: fig }]))),
      linhaCasas,
      h('div', { class: 'ig-pecas' }, pecas),
    );
    narrar([antes, { txt: alvo.w, el: fig }]);
  });
}

// ---------- Tricky words ----------
function trickyLista(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Tricky words', cor: COR_LER, voltar: () => ir() });
  corpo.append(
    lilaDiz(LILA.tricky),
    h('div', { class: 'xt-grade' }, cartao({
      emoji: '🎮', titulo: 'Jogar', sub: 'Escute e ache a palavra', cor: COR_LER,
      estrelas: feito('tricky'), onclick: () => ir('tricky', 'jogo'),
    })),
    h('div', { class: 'ig-grade-cartoes' }, TRICKY.map((t) => {
      const b = h('button', { class: 'ig-cartao-pal ig-tricky' },
        h('b', { class: 'ig-andika' }, t.w),
        h('small', { class: 'ig-andika' }, marcarPalavra(t.ex, t.w)));
      b.addEventListener('click', () => narrar([{ txt: t.w, el: b, pausa: 400 }, { txt: t.ex }]));
      return b;
    })),
  );
}

function trickyJogo(raiz) {
  let lista = [];
  jogar(raiz, {
    titulo: 'Tricky words', cor: COR_LER, voltar: () => ir('tricky'),
    rodadas: 10, atividade: 'tricky', instrucao: LILA.trickyJogo,
    rodada: (i, area, antes) => {
      if (i === 0) lista = sample(TRICKY, 10);
      const alvo = lista[i];
      // duas palavras parecidas (para ler com atenção) + uma qualquer
      const familia = PARECIDAS.find((f) => f.includes(alvo.w)) || [];
      const parecidas = sample(familia.filter((w) => w !== alvo.w), 2);
      const resto = sample(TRICKY.map((t) => t.w).filter((w) => w !== alvo.w && !parecidas.includes(w)), 3 - parecidas.length);
      const ops = shuffle([alvo.w, ...parecidas, ...resto]).map((w) => ({
        certo: w === alvo.w, el: h('button', { class: 'xt-ficha ig-palavra-op ig-andika' }, w),
      }));
      area.append(botaoOuvir(() => narrar([{ txt: alvo.w }])), h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)));
      narrar([antes, { txt: alvo.w }]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: () => narrar([{ txt: alvo.w }, { fn: elogiar }]),
        aoErrar: () => narrar([{ fn: tentarDeNovo }, { txt: alvo.w }]),
      });
    },
  });
}

// ---------- Frases (ler a frase e achar a figura) ----------
function frasesJogo(raiz) {
  let lista = [];
  jogar(raiz, {
    titulo: 'Frases', cor: '#5E9A57', voltar: () => ir(),
    rodadas: 8, atividade: 'frases', instrucao: LILA.frases,
    rodada: (i, area, antes) => {
      if (i === 0) lista = sample(FRASES, 8);
      const alvo = lista[i];
      const frase = h('div', { class: 'ig-frase ig-andika' }, alvo.t);
      const ops = shuffle([alvo, ...sample(FRASES.filter((f) => f !== alvo), 2)]).map((f) => ({
        certo: f === alvo, el: h('button', { class: 'xt-ficha ig-fig ig-fig-larga' }, emoji(f.e)),
      }));
      area.append(frase, botaoOuvir(() => narrar([{ txt: alvo.t, el: frase }])), h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)));
      narrar([antes]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: () => narrar([{ txt: alvo.t, el: frase }, { fn: elogiar }]),
        aoErrar: () => narrar([{ fn: tentarDeNovo }]),
      });
    },
  });
}

// ---------- Palavras novas (temas) ----------
function temas(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Palavras novas', cor: COR, voltar: () => ir() });
  corpo.append(
    lilaDiz(LILA.temas, 'temas'),
    h('div', { class: 'xt-grade' }, TEMAS.map((t) => cartao({
      emoji: t.emoji, titulo: t.en, sub: t.nome, cor: t.cor,
      estrelas: feito('tema-' + t.id), onclick: () => ir('tema', t.id),
    }))),
  );
}

function rotaTema(raiz, id, modo) {
  const t = TEMAS.find((x) => x.id === id);
  if (!t) return ir('temas');
  if (modo === 'aprender') return temaAprender(raiz, t);
  if (modo === 'jogo') return temaJogo(raiz, t);
  const { corpo } = tela(raiz, { titulo: `${t.en} ${t.emoji}`, cor: t.cor, voltar: () => ir('temas') });
  corpo.append(
    lilaDiz(LILA.modos, 'modos'),
    h('div', { class: 'xt-grade' },
      cartao({ emoji: '👂', titulo: 'Aprender', sub: 'Toque e escute', cor: t.cor, onclick: () => ir('tema', t.id, 'aprender') }),
      cartao({
        emoji: '🎮', titulo: 'Listen & Tap', sub: 'Escute e toque na figura', cor: t.cor,
        estrelas: feito('tema-' + t.id), onclick: () => ir('tema', t.id, 'jogo'),
      }),
    ),
  );
}

function cartaoPalavra(p) {
  const b = h('button', { class: 'ig-cartao-pal' + (p.cena ? ' ig-com-cena' : '') },
    figura(p), h('b', { class: 'ig-andika' }, p.w), h('small', null, p.pt));
  b.addEventListener('click', () => narrar([{ txt: falaDe(p), el: b }]));
  return b;
}

function temaAprender(raiz, t) {
  const { corpo } = tela(raiz, { titulo: `${t.en} ${t.emoji}`, cor: t.cor, voltar: () => ir('tema', t.id) });
  const conteudo = t.pares
    ? h('div', { class: 'ig-pares' }, t.pares.map(([a, b]) => h('div', { class: 'ig-par' },
      cartaoPalavra(a), h('span', { class: 'ig-par-meio' }, '↔'), cartaoPalavra(b))))
    : h('div', { class: 'ig-grade-cartoes' }, t.palavras.map(cartaoPalavra));
  corpo.append(lilaDiz(LILA.aprender), conteudo);
}

// alvos sem repetir a mesma palavra em seguida
function filaDeAlvos(palavras, total) {
  const lista = [];
  while (lista.length < total) {
    let rodada = shuffle(palavras);
    if (lista.length && rodada[0] === lista.at(-1)) rodada = [...rodada.slice(1), rodada[0]];
    lista.push(...rodada);
  }
  return lista.slice(0, total);
}

function temaJogo(raiz, t) {
  let lista = [];
  jogar(raiz, {
    titulo: `${t.en} ${t.emoji}`, cor: t.cor, voltar: () => ir('tema', t.id),
    rodadas: 10, atividade: 'tema-' + t.id, instrucao: LILA.temaJogo,
    rodada: (i, area, antes) => {
      if (i === 0) lista = filaDeAlvos(t.palavras, 10);
      const alvo = lista[i];
      // nos opostos, o par sempre aparece como uma das opções
      const outras = alvo.oposto
        ? [alvo.oposto, ...sample(t.palavras.filter((p) => p !== alvo && p !== alvo.oposto), 2)]
        : sample(t.palavras.filter((p) => p !== alvo), 3);
      const ops = shuffle([alvo, ...outras]).map((p) => ({
        certo: p === alvo, el: h('button', { class: 'xt-ficha ig-fig' + (p.cena ? ' ig-fig-cena' : '') }, figura(p)),
      }));
      const revela = h('div', { class: 'ig-revela ig-andika' });
      area.append(
        h('div', { class: 'ig-linha' }, botaoOuvir(() => narrar([{ txt: falaDe(alvo) }])), revela),
        h('div', { class: 'xt-opcoes ig-opcoes-4' }, ops.map((o) => o.el)),
      );
      narrar([antes, { txt: falaDe(alvo) }]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: async () => {
          revela.textContent = alvo.w;
          await narrar([{ txt: falaDe(alvo) }, { fn: elogiar }]);
        },
        aoErrar: () => narrar([{ fn: tentarDeNovo }, { txt: falaDe(alvo) }]),
      });
    },
  });
}

// Cena desenhada para "Where is it?": uma caixa com perninhas e uma bola
function cenaOnde(pos) {
  const madeira = '#A5683B';
  const caixa = '#E3B57A';
  const svg = s('svg', { viewBox: '0 0 180 140', class: 'ig-cena', 'aria-hidden': 'true' });
  const bola = (cx, cy) => s('g', null,
    s('circle', { cx, cy, r: 14, fill: '#4DA6E0', stroke: '#2F7FB5', 'stroke-width': 2.5 }),
    s('path', {
      d: `M${cx - 12} ${cy - 4} Q${cx} ${cy + 6} ${cx + 12} ${cy - 4}`,
      fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round',
    }));
  svg.append(
    s('line', { x1: 8, x2: 172, y1: 130, y2: 130, stroke: '#C98A5E', 'stroke-width': 4, 'stroke-linecap': 'round' }),
    s('rect', { x: 46, y: 92, width: 8, height: 38, rx: 2, fill: madeira }),
    s('rect', { x: 106, y: 92, width: 8, height: 38, rx: 2, fill: madeira }),
  );
  const borda = { stroke: madeira, 'stroke-width': 3, 'stroke-linejoin': 'round' };
  const frente = s('rect', { x: 40, y: 54, width: 80, height: 42, rx: 3, fill: caixa, ...borda });
  const lado = s('polygon', { points: '120,54 130,44 130,86 120,96', fill: '#C99555', ...borda });
  if (pos === 'in') {
    // caixa aberta: aba de trás em pé, o fundo escuro, a bola lá dentro e a frente tapando a metade
    svg.append(
      s('polygon', { points: '50,44 130,44 124,24 56,24', fill: caixa, ...borda }),
      s('polygon', { points: '40,54 50,44 130,44 120,54', fill: '#8A5A2E', ...borda }),
      bola(85, 44),
      frente,
      lado,
      s('polygon', { points: '40,54 50,44 34,28 24,38', fill: caixa, ...borda }),
      s('polygon', { points: '120,54 130,44 148,32 140,46', fill: caixa, ...borda }),
    );
  } else {
    svg.append(
      frente,
      lado,
      s('polygon', { points: '40,54 50,44 130,44 120,54', fill: '#D9A464', ...borda }),
      s('line', { x1: 85, x2: 80, y1: 44, y2: 54, stroke: '#C98A5E', 'stroke-width': 4 }),
      s('line', { x1: 80, x2: 80, y1: 56, y2: 70, stroke: '#C98A5E', 'stroke-width': 4 }),
    );
    if (pos === 'on') svg.append(bola(85, 35));
    if (pos === 'under') svg.append(bola(80, 115));
    if (pos === 'next') svg.append(bola(156, 115));
  }
  return svg;
}

// ---------- Frases da escola ----------
const fraseEn = (f) => comNome(f.en);
const frasePt = (f) => comNome(f.pt);

function escolaLista(raiz) {
  const { corpo } = tela(raiz, { titulo: 'Frases da escola 🏫', cor: COR_ESCOLA, voltar: () => ir() });
  corpo.append(
    lilaDiz(LILA.escola),
    h('div', { class: 'xt-grade' }, cartao({
      emoji: '🎮', titulo: 'Listen & Tap', sub: 'Escute e ache o que quer dizer', cor: COR_ESCOLA,
      estrelas: feito('escola'), onclick: () => ir('escola', 'jogo'),
    })),
    h('div', { class: 'ig-frases-escola' }, FRASES_ESCOLA.map((f) => {
      const b = h('button', { class: 'ig-fe' },
        emoji(f.e),
        h('span', { class: 'ig-fe-txt' }, h('b', { class: 'ig-andika' }, fraseEn(f)), h('small', null, frasePt(f))),
        h('span', { class: 'ig-fe-som', 'aria-hidden': 'true' }, '🔊'));
      b.addEventListener('click', () => narrar([{ txt: fraseEn(f), el: b }]));
      return b;
    })),
  );
}

function escolaJogo(raiz) {
  let lista = [];
  jogar(raiz, {
    titulo: 'Frases da escola', cor: COR_ESCOLA, voltar: () => ir('escola'),
    rodadas: 10, atividade: 'escola', instrucao: LILA.escolaJogo,
    rodada: (i, area, antes) => {
      if (i === 0) lista = sample(FRASES_ESCOLA, 10);
      const alvo = lista[i];
      const ops = shuffle([alvo, ...sample(FRASES_ESCOLA.filter((f) => f !== alvo), 2)]).map((f) => ({
        certo: f === alvo,
        el: h('button', { class: 'xt-ficha ig-significado' }, emoji(f.e), h('span', null, frasePt(f))),
      }));
      area.append(botaoOuvir(() => narrar([{ txt: fraseEn(alvo) }])), h('div', { class: 'xt-opcoes' }, ops.map((o) => o.el)));
      narrar([antes, { txt: fraseEn(alvo) }]);
      return escolher(ops, {
        falarElogio: false,
        aoAcertar: () => narrar([{ fn: elogiar }]),
        aoErrar: () => narrar([{ fn: tentarDeNovo }, { txt: fraseEn(alvo) }]),
      });
    },
  });
}
