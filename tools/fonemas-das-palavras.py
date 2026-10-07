#!/usr/bin/env python3
"""Tira o SOM de cada letra (phonics) das palavras em inglês que a Lila já gravou.

Enquanto não há chave do ElevenLabs para gravar os sons direto, recorta cada som de uma
palavra que já existe na voz da Lila (ex.: o "s" do começo de "six", o "a" de "apple").
Saída: audio/fonemas/<id>.m4a + extras/js/fonemas-index.js.

Uso: python3 tools/fonemas-das-palavras.py
"""
import json, os, re, subprocess, tempfile, unicodedata, wave
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA_VOZ = os.path.join(RAIZ, 'audio/voz')
SAIDA = os.path.join(RAIZ, 'audio/fonemas')
SR = 44100
HOP = int(0.005 * SR)   # 5 ms
JAN = int(0.020 * SR)   # 20 ms


def voz_hash(texto, lang):
    n = lang + '|' + re.sub(r'\s+', ' ', unicodedata.normalize('NFC', texto).strip())
    r = 2166136261
    for ch in n:
        r ^= ord(ch)
        r = (r * 16777619) & 0xFFFFFFFF
    return '%08x' % r


def ler_palavra(w):
    mp3 = os.path.join(PASTA_VOZ, voz_hash(w, 'en') + '.mp3')
    if not os.path.exists(mp3):
        raise FileNotFoundError(w)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'x.wav')
        subprocess.run(['afconvert', '-f', 'WAVE', '-d', 'LEI16@44100', '-c', '1', mp3, wav], check=True)
        with wave.open(wav) as f:
            x = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x


def medidas(x):
    """Por quadro de 5 ms: energia, cruzamentos de zero, vozeamento (0–1) e brilho."""
    n = max(1, (len(x) - JAN) // HOP)
    rms = np.zeros(n); zcr = np.zeros(n); voz = np.zeros(n)
    for i in range(n):
        q = x[i * HOP:i * HOP + JAN]
        rms[i] = np.sqrt(np.mean(q * q) + 1e-12)
        zcr[i] = np.mean(np.abs(np.diff(np.sign(q)))) / 2
        q = q - q.mean()
        ac = np.correlate(q, q, 'full')[len(q) - 1:]
        if ac[0] > 1e-9:
            lo, hi = int(SR / 400), int(SR / 70)
            voz[i] = ac[lo:hi].max() / ac[0]
    return rms, zcr, voz


def centroide(q):
    sp = np.abs(np.fft.rfft(q * np.hanning(len(q))))
    fr = np.fft.rfftfreq(len(q), 1 / SR)
    return float((sp * fr).sum() / (sp.sum() + 1e-9))


def corridas(mask, minimo=3):
    """Trechos contínuos de True com pelo menos `minimo` quadros: [(ini, fim)]"""
    res, ini = [], None
    for i, v in enumerate(list(mask) + [False]):
        if v and ini is None:
            ini = i
        elif not v and ini is not None:
            if i - ini >= minimo:
                res.append((ini, i))
            ini = None
    return res


def recorte(x, a, b):
    return x[max(0, a * HOP):max(0, b * HOP) + JAN]


def esticar(seg, alvo_s, pedaco_s=0.06):
    """Estica um som contínuo (sss, mmm) repetindo pedacinhos do meio com fusão suave."""
    alvo = int(alvo_s * SR)
    if len(seg) >= alvo:
        return seg
    p = int(pedaco_s * SR)
    meio = seg[len(seg) // 4: len(seg) * 3 // 4]
    if len(meio) < p * 2:
        meio = seg
        p = max(int(0.02 * SR), len(meio) // 3)
    fus = p // 3
    saida = seg[:len(seg) // 2].copy()
    rng = np.random.default_rng(7)
    while len(saida) < alvo - len(seg) // 2:
        i = rng.integers(0, max(1, len(meio) - p))
        bloco = meio[i:i + p].copy()
        janela = np.linspace(0, 1, fus)
        saida[-fus:] = saida[-fus:] * (1 - janela) + bloco[:fus] * janela
        saida = np.concatenate([saida, bloco[fus:]])
    fim = seg[len(seg) // 2:]
    janela = np.linspace(0, 1, min(fus, len(fim)))
    saida[-len(janela):] = saida[-len(janela):] * (1 - janela) + fim[:len(janela)] * janela
    return np.concatenate([saida, fim[len(janela):]])


def acabamento(seg, alvo_rms=0.08, pico_max=0.9):
    seg = seg - seg.mean()
    ent, sai = int(0.006 * SR), int(0.035 * SR)
    if len(seg) > ent + sai:
        seg[:ent] *= np.linspace(0, 1, ent)
        seg[-sai:] *= np.linspace(1, 0, sai)
    r = np.sqrt(np.mean(seg ** 2)) + 1e-9
    seg = seg * (alvo_rms / r)
    pico = np.abs(seg).max()
    if pico > pico_max:
        seg *= pico_max / pico
    sil = np.zeros(int(0.03 * SR), dtype=np.float32)
    return np.concatenate([sil, seg, sil]).astype(np.float32)


def inicio_som(rms):
    lim = 0.03 * rms.max()
    return int(np.argmax(rms > lim))


def inicio_voz(rms, voz, depois=0):
    vozeado = (voz > 0.55) & (rms > 0.06 * rms.max())
    for a, b in corridas(vozeado, 4):
        if a >= depois:
            return a
    return None


def cortar(w, metodo):
    x = ler_palavra(w)
    rms, zcr, voz = medidas(x)
    on = inicio_som(rms)
    vozeado = (voz > 0.55) & (rms > 0.06 * rms.max())
    if metodo in ('chiado', 'surda'):
        v = inicio_voz(rms, voz, on)
        if v is None or (v - on) * HOP / SR < 0.03:
            raise ValueError(f'{w}: sem trecho antes da voz')
        seg = recorte(x, on, v - 1)
        return seg
    if metodo == 'sonora':
        # b/d/g: a Lila faz um zumbido grave antes do estouro; o som da letra é o estouro
        # + o comecinho da vogal. A vogal começa quando a energia passa de 60% do máximo.
        vogal = on + int(np.argmax(rms[on:] > 0.6 * rms.max()))
        return recorte(x, vogal - 6, vogal + 11)
    if metodo == 'nasal_grave':
        # m/n: o trecho grave (brilho < 700 Hz) e forte o bastante — no começo ou no fim da palavra
        brilho = np.array([centroide(x[i * HOP:i * HOP + JAN]) for i in range(len(rms))])
        grave = (brilho < 700) & (rms > 0.15 * rms.max())
        partes = [p for p in corridas(grave, 8)]
        if not partes:
            raise ValueError(f'{w}: sem trecho grave')
        a, b = max(partes, key=lambda p: p[1] - p[0])
        return recorte(x, a, b - 1)
    if metodo in ('vogal_inicio', 'vogal_meio'):
        # a vogal = trecho vozeado e forte; termina quando a energia cai (o fechamento da consoante)
        partes = corridas(vozeado & (rms > 0.3 * rms.max()), 6)
        if not partes:
            raise ValueError(f'{w}: sem vogal')
        a, b = partes[0] if metodo == 'vogal_inicio' else max(partes, key=lambda p: p[1] - p[0])
        a += 3 if metodo == 'vogal_meio' else 0     # pula a transição da consoante
        b = min(b, a + int(0.26 * SR / HOP))
        return recorte(x, a, b - 2)
    if metodo == 'nasal':
        # m/n do começo: vozeado mais fraco antes da vogal (a energia sobe quando a boca abre)
        v = inicio_voz(rms, voz, on)
        base = rms[v:v + 6].mean()
        fim = v + 6
        while fim < len(rms) and rms[fim] < base * 1.8 and fim - v < int(0.18 * SR / HOP):
            fim += 1
        return recorte(x, v, fim - 2)
    if metodo == 'liquida':
        v = inicio_voz(rms, voz, on)
        janela = rms[v:v + int(0.2 * SR / HOP)]
        d = np.diff(janela)
        fim = v + int(np.argmax(d[4:]) + 4) if len(d) > 6 else v + 16
        fim = max(fim, v + int(0.06 * SR / HOP))
        return recorte(x, v, fim - 2)
    if metodo == 'l_final':
        # "apple": depois do fechamento do p, o trecho vozeado final é o l
        partes = corridas(vozeado, 4)
        a, b = partes[-1]
        return recorte(x, a + 2, b)
    raise ValueError(metodo)


# som → (palavras para tentar, jeito de cortar, esticar para quantos segundos)
RECEITAS = {
    's': (['six', 'sister', 'seven'], 'chiado', 0.38),
    'f': (['fish', 'five', 'foot', 'four'], 'chiado', 0.34),
    'h': (['hand', 'head', 'hello', 'hair'], 'chiado', None),
    't': (['ten', 'two', 'TV'], 'surda', None),
    'p': (['pig', 'pink', 'purple'], 'surda', None),
    'k': (['cat', 'cake', 'cow', 'cookie'], 'surda', None),
    'b': (['bird', 'bear', 'baby', 'bye'], 'sonora', None),
    'd': (['dog', 'dad', 'duck'], 'sonora', None),
    'g': (['green', 'grandma'], 'sonora', None),
    'a': (['apple'], 'vogal_inicio', None),
    'e': (['egg'], 'vogal_inicio', None),
    'i': (['fish', 'six', 'pig'], 'vogal_meio', None),
    'o': (['dog'], 'vogal_meio', None),
    'u': (['duck', 'brother'], 'vogal_meio', None),
    'm': (['milk', 'mouth', 'mom'], 'nasal', 0.36),
    'n': (['ten', 'nine', 'green'], 'nasal_grave', 0.36),
    'l': (['apple', 'lion', 'leg'], 'l_final', 0.3),
    'r': (['red', 'rabbit'], 'liquida', 0.28),
}


def salvar(id_, seg):
    os.makedirs(SAIDA, exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, id_ + '.wav')
        with wave.open(wav, 'wb') as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
            f.writeframes((np.clip(seg, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '96000', wav, os.path.join(SAIDA, id_ + '.m4a')], check=True)


def main():
    feitos = {}
    for id_, (palavras, metodo, esticar_s) in RECEITAS.items():
        erro = None
        for w in palavras:
            if metodo == 'l_final' and w != 'apple':
                metodo_w = 'liquida'
            else:
                metodo_w = metodo
            try:
                seg = cortar(w, metodo_w)
                dur = len(seg) / SR
                if dur < 0.02 or dur > 0.45:
                    raise ValueError(f'{w}: duração estranha {dur:.3f}s')
                if esticar_s:
                    seg = esticar(seg, esticar_s)
                alvo = 0.05 if metodo in ('chiado', 'surda') else 0.09
                salvar(id_, acabamento(seg, alvo_rms=alvo))
                feitos[id_] = (w, dur, len(seg) / SR)
                break
            except (ValueError, FileNotFoundError, IndexError) as e:
                erro = e
        else:
            print(f'  {id_}: NÃO saiu ({erro})')
    for id_, (w, dur, final) in feitos.items():
        print(f'  {id_}: de "{w}" — recorte {dur * 1000:.0f} ms, som final {final * 1000:.0f} ms')
    ids = sorted(feitos)
    with open(os.path.join(RAIZ, 'extras/js/fonemas-index.js'), 'w') as f:
        f.write('// Sons de letra prontos em /audio/fonemas (id → arquivo) — gerado por tools/fonemas-das-palavras.py\n')
        f.write('// ou tools/gerar-fonemas.mjs (ElevenLabs). Feitos a partir de palavras gravadas pela Lila.\n')
        f.write('export const FONEMAS_PRONTOS = new Map(' + json.dumps([[i, i + '.m4a'] for i in ids]) + ');\n')
    print(f'{len(ids)} sons prontos em audio/fonemas')


if __name__ == '__main__':
    main()
