#!/usr/bin/env python3
"""Prepara o site para publicar as novidades (pasta extras/) e, com --push, publica.

1. Coloca os botões das novidades no app principal (tela inicial e tela do Inglês).
   O app principal é um build pronto (o código-fonte não está neste Mac), então o
   botão é inserido direto no bundle. É idempotente: se já tiver, não mexe.
2. Atualiza o service worker (sw.js): deixa /extras/ fora da rota que devolve o app
   principal e guarda os arquivos das novidades para funcionar sem internet.
3. Com --push: commit + push (o GitHub Pages publica em ~1 minuto).

Uso:  python3 tools/publicar.py            (só prepara e confere)
      python3 tools/publicar.py --push     (prepara e publica)
"""
import hashlib, os, re, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)


def md5(caminho):
    return hashlib.md5(open(caminho, 'rb').read()).hexdigest()


def bundle_atual():
    html = open('index.html', encoding='utf-8').read()
    m = re.search(r'/assets/(index-[\w-]+\.js)', html)
    return m.group(1)


def botao(estilo_hello, destino, rotulo, cor, emoji):
    # mesmo visual do botão "Hello! Inglês"; só muda destino, cor e texto
    estilo = estilo_hello.replace('background:`#4DA6E0`', f'background:`{cor}`')
    return (f',(0,k.jsx)(`button`,{{onClick:()=>{{location.href=`{destino}`}},"aria-label":`{rotulo}`,'
            f'style:{estilo},children:`{emoji} {rotulo}`}})')


# botões da tela inicial do app (destino, rótulo, cor, emoji), na ordem em que aparecem
BOTOES_INICIO = [
    ('/extras/#/letras', 'Letras na Pauta', '#E0A21F', '🦒'),
    ('/extras/#/cvc', 'Palavras CVC', '#2BAE9C', '🔤'),
    ('/extras/#/musica', 'Música com a Lila', '#7F77DD', '🎹'),
]


def colocar_botoes():
    nome = bundle_atual()
    js = open('assets/' + nome, encoding='utf-8').read()
    original = js
    # tela inicial: os botões das novidades vêm depois do "Hello! Inglês", na ordem de BOTOES_INICIO
    m = re.search(r'\(0,k\.jsx\)\(`button`,\{onClick:\w+,"aria-label":`Hello Inglês`,style:(\{.*?\}),children:`Hello! Inglês 🇬🇧`\}\)', js)
    if not m:
        sys.exit('ERRO: não achei o botão Hello! Inglês no bundle — o app mudou, conferir à mão.')
    estilo = m.group(1)
    fim_anterior = m.end()
    for destino, rotulo, cor, emoji in BOTOES_INICIO:
        ja = re.search(r',\(0,k\.jsx\)\(`button`,\{onClick:\(\)=>\{location\.href=`' + re.escape(destino) + r'`\}.*?children:`[^`]*`\}\)', js[fim_anterior:])
        if ja:
            fim_anterior += ja.end()
            continue
        novo_botao = botao(estilo, destino, rotulo, cor, emoji)
        js = js[:fim_anterior] + novo_botao + js[fim_anterior:]
        fim_anterior += len(novo_botao)
    # tela do Inglês: cartão "Phonics da escola" antes da lista de temas
    if '/extras/#/ingles' not in js:
        alvo = 'children:`Minha voz em inglês`}),(0,k.jsx)(`span`,{style:{fontWeight:800,color:`#C98A5E`},children:`▶`})]})'
        if alvo not in js:
            sys.exit('ERRO: não achei o botão "Minha voz em inglês" no bundle — conferir à mão.')
        phonics = (',(0,k.jsxs)(`button`,{onClick:()=>{location.href=`/extras/#/ingles`},"aria-label":`Phonics da escola`,'
                   'style:{display:`flex`,alignItems:`center`,gap:10,width:`100%`,maxWidth:420,padding:`14px 16px`,borderRadius:18,'
                   'border:`none`,background:`#4DA6E0`,color:`#fff`,boxShadow:`0 5px 0 rgba(0,0,0,.16)`,cursor:`pointer`,marginBottom:12},'
                   'children:[(0,k.jsx)(`span`,{style:{fontSize:`1.6rem`},children:`🚀`}),'
                   '(0,k.jsx)(`span`,{style:{flex:1,textAlign:`left`,fontWeight:800,fontSize:`1.1rem`},children:`Phonics da escola — próximo nível`}),'
                   '(0,k.jsx)(`span`,{style:{fontWeight:800},children:`▶`})]})')
        js = js.replace(alvo, alvo + phonics, 1)
    if js == original:
        print('botões: já estão no app (', nome, ')')
        return nome
    novo = 'index-' + hashlib.md5(js.encode('utf-8')).hexdigest()[:8] + '.js'
    open('assets/' + novo, 'w', encoding='utf-8').write(js)
    os.remove('assets/' + nome)
    html = open('index.html', encoding='utf-8').read().replace(nome, novo)
    open('index.html', 'w', encoding='utf-8').write(html)
    sw = open('sw.js', encoding='utf-8').read().replace(f'assets/{nome}', f'assets/{novo}')
    open('sw.js', 'w', encoding='utf-8').write(sw)
    print('botões: atualizados →', novo)
    return novo


def arquivos_extras():
    lista = []
    # sons das letras (pequenos): vão para o cache offline junto com as novidades
    if os.path.isdir('audio/fonemas'):
        lista += ['audio/fonemas/' + f for f in sorted(os.listdir('audio/fonemas')) if f.endswith(('.mp3', '.m4a'))]
    for pasta, subpastas, arquivos in os.walk('extras'):
        subpastas[:] = [d for d in subpastas if not d.startswith('_')]
        for a in sorted(arquivos):
            if a.startswith('.'):
                continue
            lista.append(os.path.join(pasta, a).replace(os.sep, '/'))
    return sorted(lista)


def atualizar_sw():
    sw = open('sw.js', encoding='utf-8').read()
    # /extras/ não deve receber o index.html do app principal
    rota_antiga = 's.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html")))'
    rota_nova = 's.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html"),{denylist:[/^\\/extras\\//]}))'
    if rota_antiga in sw:
        sw = sw.replace(rota_antiga, rota_nova)
    elif rota_nova not in sw:
        sys.exit('ERRO: não achei a rota de navegação no sw.js — conferir à mão.')
    # tira entradas antigas de extras/ e regrava as revisões
    sw = re.sub(r',\{url:"(?:extras|audio/fonemas)/[^"]*",revision:"[0-9a-f]+"\}', '', sw)
    # regrava a revisão de todo arquivo com revisão (index.html, registerSW.js, imagens...) conforme o conteúdo atual
    def revisao(m):
        url = m.group(1)
        return '{url:"%s",revision:"%s"}' % (url, md5(url)) if os.path.exists(url) else m.group(0)
    sw = re.sub(r'\{url:"([^"]+)",revision:"[0-9a-f]+"\}', revisao, sw)
    entradas = ''.join(',{url:"%s",revision:"%s"}' % (f, md5(f)) for f in arquivos_extras())
    marcador = '{url:"index.html",revision:"%s"}' % md5('index.html')
    sw = sw.replace(marcador, marcador + entradas, 1)
    open('sw.js', 'w', encoding='utf-8').write(sw)
    print('sw.js: %d arquivos das novidades no cache offline' % len(arquivos_extras()))


def conferir():
    nome = bundle_atual()
    assert os.path.exists('assets/' + nome), 'bundle sumiu'
    sw = open('sw.js', encoding='utf-8').read()
    assert f'assets/{nome}' in sw, 'sw.js não aponta para o bundle novo'
    assert 'denylist:[/^\\/extras\\//]' in sw, 'sw.js sem a exceção de /extras/'
    for f in arquivos_extras():
        assert f'"{f}"' in sw, f'{f} fora do cache'
    r = subprocess.run(['node', '--check', 'sw.js'], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    r = subprocess.run(['node', '--check', 'assets/' + nome], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    for f in arquivos_extras():
        if f.endswith('.js'):
            r = subprocess.run(['node', '--check', f], capture_output=True, text=True)
            assert r.returncode == 0, f + ': ' + r.stderr
    print('conferência: ok')


if __name__ == '__main__':
    subprocess.run([sys.executable, 'tools/voz-index.py'], check=True)
    colocar_botoes()
    atualizar_sw()
    conferir()
    if '--push' in sys.argv:
        subprocess.run(['git', 'add', '-A', '.'], check=True)
        msg = sys.argv[sys.argv.index('-m') + 1] if '-m' in sys.argv else 'novidades: letras na pauta, phonics da escola e música'
        msg += '\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
        subprocess.run(['git', 'commit', '-m', msg], check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        print('publicado — o GitHub Pages atualiza em ~1 minuto')
