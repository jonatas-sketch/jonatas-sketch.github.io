// Entrada dos módulos extras. Rotas: #/letras · #/ingles · #/musica · #/pais
import { h, tela, cartao, lila, carregarPerfil, perfil, progresso, irPara, calar, sfx } from './core.js';

const raiz = document.getElementById('app');
const MODULOS = {
  letras: () => import('./letras.js'),
  ingles: () => import('./ingles.js'),
  musica: () => import('./musica.js'),
};

async function rota() {
  calar();
  window.scrollTo(0, 0);
  const [mod, ...resto] = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (mod === 'pais') return pais();
  if (MODULOS[mod]) {
    try {
      const m = await MODULOS[mod]();
      await m.abrir(raiz, resto);
      // no menu de cada módulo, o acesso dos pais (liberar níveis, ver progresso)
      if (!resto.length) raiz.querySelector('.xt-corpo')?.append(botaoPais());
      return;
    } catch (e) {
      console.error(e);
      raiz.replaceChildren(h('p', { style: { padding: '24px', fontSize: '1.2rem' } }, 'Ops! Essa parte não abriu. Volte e tente de novo.'));
      return;
    }
  }
  inicio();
}

function inicio() {
  const { corpo } = tela(raiz, { titulo: 'Novidades da Lila ✨' });
  corpo.append(
    lila(`Oi, ${perfil.nome}! O que vamos aprender hoje?`),
    h('div', { class: 'xt-grade' },
      cartao({ emoji: '🦒', titulo: 'Letras na Pauta', sub: 'Girafa, tartaruga e macaco', cor: '#E0A21F', onclick: () => irPara('#/letras') }),
      cartao({ emoji: '🇬🇧', titulo: 'Phonics da escola', sub: 'Ler em inglês', cor: '#4DA6E0', onclick: () => irPara('#/ingles') }),
      cartao({ emoji: '🎹', titulo: 'Música com a Lila', sub: 'Notas do piano', cor: '#A98FE0', onclick: () => irPara('#/musica') }),
    ),
    botaoPais(),
  );
}

// Botão dos pais: segurar 2 segundos (criança não abre sem querer)
function botaoPais() {
  let t = null;
  const b = h('button', { class: 'xt-btn xt-btn-2 xt-btn-pais' }, '👨‍👩‍👧 Pais (segure)');
  const soltar = () => { clearTimeout(t); b.style.opacity = ''; };
  b.addEventListener('pointerdown', () => {
    b.style.opacity = '0.6';
    t = setTimeout(() => { soltar(); irPara('#/pais'); }, 1800);
  });
  b.addEventListener('pointerup', soltar);
  b.addEventListener('pointerleave', soltar);
  b.addEventListener('pointercancel', soltar);
  return b;
}

const NOMES = {
  letras: 'Letras na Pauta',
  ingles: 'Phonics da escola',
  musica: 'Música com a Lila',
};

function pais() {
  const { corpo } = tela(raiz, { titulo: 'Área dos pais', voltar: () => irPara('#/') });
  const liberar = progresso.liberarTudo();
  const chave = h('button', { class: 'xt-chave' + (liberar ? ' on' : ''), 'aria-label': 'Liberar todos os níveis' });
  chave.onclick = () => {
    progresso.set('pais.liberarTudo', !progresso.liberarTudo());
    chave.classList.toggle('on', progresso.liberarTudo());
    sfx.pop();
  };
  const resumo = h('div', null);
  for (const [mod, nome] of Object.entries(NOMES)) {
    const feito = progresso.get(`${mod}.feito`, {});
    const itens = Object.entries(feito);
    resumo.append(
      h('h2', { style: { marginTop: '10px' } }, nome),
      itens.length
        ? h('ul', null, itens.map(([k, v]) => h('li', null, `${k}: ${'★'.repeat(v)}${'☆'.repeat(3 - v)}`)))
        : h('p', null, 'Ainda não começou.'),
    );
  }
  corpo.append(
    h('div', { class: 'xt-pais' },
      h('h2', null, 'Como funciona'),
      h('p', null, 'Estas atividades seguem o que a Stella vê na escola: as famílias de letras na pauta de 3 linhas (girafa, tartaruga e macaco), o fônico em inglês na ordem do Floppy\'s Phonics e as notas do piano com cores. O progresso fica guardado neste aparelho.'),
      h('div', { class: 'xt-linha-pais' }, h('span', null, 'Liberar todos os níveis'), chave),
      h('div', { class: 'xt-linha-pais' },
        h('span', null, 'Zerar o progresso das novidades'),
        h('button', { class: 'xt-btn', style: { fontSize: '1rem', padding: '8px 16px' }, onclick: () => {
          if (confirm('Apagar as estrelas e o progresso das novidades neste aparelho?')) {
            progresso.zerar();
            pais();
          }
        } }, 'Zerar'),
      ),
    ),
    h('div', { class: 'xt-pais' }, h('h2', null, `Estrelas: ⭐ ${progresso.estrelas()}`), resumo),
  );
}

window.addEventListener('hashchange', rota);
carregarPerfil().then(rota);
