#!/usr/bin/env python3
"""Regera extras/js/voz-index.js com a lista de falas gravadas em audio/voz."""
import os, json
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hs = sorted(f[:-4] for f in os.listdir(os.path.join(raiz, "audio/voz")) if f.endswith(".mp3"))
with open(os.path.join(raiz, "extras/js/voz-index.js"), "w") as f:
    f.write("// Hashes das falas já gravadas em /audio/voz — gerado por tools/voz-index.py\n")
    f.write("export const VOZ = new Set(" + json.dumps(hs, separators=(",", ":")) + ");\n")
print(len(hs), "falas")
