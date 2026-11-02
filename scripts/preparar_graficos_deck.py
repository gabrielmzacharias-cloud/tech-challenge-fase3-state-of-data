"""Prepara os gráficos do notebook 04 para o deck executivo.

No deck, o título de cada slide já é a mensagem do gráfico; por isso cortamos do PNG a linha de título
e a linha de fonte (que vai para o rodapé do slide), mantendo o subtítulo que explica a métrica.
Grava entrega/assets/charts/*.png e tamanhos.json (proporção usada pelo gerar_deck.js).

Uso:  python scripts/preparar_graficos_deck.py
"""
import json
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM, DESTINO = RAIZ / "output" / "charts", RAIZ / "entrega" / "assets" / "charts"
DESTINO.mkdir(parents=True, exist_ok=True)

tamanhos = {}
for arquivo in sorted(ORIGEM.glob("*.png")):
    img = Image.open(arquivo)
    w, h = img.size
    # título: texto a 0.99 da altura, ~50 px a 200 dpi; fonte: texto a 0.01 da altura, ~25 px
    topo, base = int(h * 0.01) + 52, h - (int(h * 0.01) + 28)
    img.crop((0, topo, w, base)).save(DESTINO / arquivo.name)
    tamanhos[arquivo.stem] = round(w / (base - topo), 4)

arq = RAIZ / "arquitetura" / "arquitetura_aws.png"
Image.open(arq).save(DESTINO / arq.name)
tamanhos[arq.stem] = round(Image.open(arq).width / Image.open(arq).height, 4)

(DESTINO / "tamanhos.json").write_text(json.dumps(tamanhos, indent=1), encoding="utf-8")
print(f"{len(tamanhos)} imagens em {DESTINO.relative_to(RAIZ)}")
