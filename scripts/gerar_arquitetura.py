"""Gera o diagrama de arquitetura AWS em dois formatos a partir de uma única especificação:

- arquitetura/arquitetura_aws.drawio  (abre no draw.io / diagrams.net, ícones oficiais AWS - mxgraph.aws4)
- arquitetura/arquitetura_aws.png     (render estático para a apresentação)

Uso:  python scripts/gerar_arquitetura.py
"""
from pathlib import Path
from xml.sax.saxutils import escape

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

RAIZ = Path(__file__).resolve().parents[1]
SAIDA = RAIZ / "arquitetura"

# cores oficiais das categorias AWS
COR = {"s3": "#7AA116", "glue": "#8C4FFF", "catalogo": "#8C4FFF", "athena": "#8C4FFF", "iam": "#DD344C",
       "cloudwatch": "#E7157B"}
ICONE = {"s3": "mxgraph.aws4.s3", "glue": "mxgraph.aws4.glue", "catalogo": "mxgraph.aws4.glue_data_catalog",
         "athena": "mxgraph.aws4.athena", "iam": "mxgraph.aws4.identity_and_access_management",
         "cloudwatch": "mxgraph.aws4.cloudwatch_2"}
SIGLA = {"s3": "S3", "glue": "Glue", "catalogo": "Catalog", "athena": "Athena", "iam": "IAM", "cloudwatch": "CW"}
TAM = 64

# (id, tipo, x, y, rótulo) — coordenadas do draw.io (px), ícones 64x64; caixas externas 170x64 a partir de x-48
NOS = [
    ("kaggle", "externo", 60, 50, "Kaggle · Data Hackers\nState of Data Brasil\n2023 · 2024 · 2025 (CSV)"),
    ("cli", "externo", 60, 190, "Console S3 ou CloudShell\n(scripts/01_ingestao_s3.sh)"),
    ("raw", "s3", 340, 190, "raw/\nCSV original"),
    ("bronze", "s3", 570, 190, "bronze/\nParquet (colunas string)"),
    ("silver", "s3", 800, 190, "silver/ · Parquet harmonizado\n(partição ano_pesquisa=AAAA)"),
    ("gold", "s3", 1030, 190, "gold/ · 10 tabelas\nagregadas (Parquet)"),
    ("job1", "glue", 455, 370, "01 Bronze\ningestão (Spark)"),
    ("job2", "glue", 685, 370, "02 Silver\nlimpeza e harmonização"),
    ("job3", "glue", 915, 370, "03 Gold\nSpark SQL"),
    ("job4", "glue", 1145, 370, "04 Análises\ngráficos (matplotlib)"),
    ("iam", "iam", 340, 580, "IAM · LabRole\npapel das sessões Glue"),
    ("logs", "cloudwatch", 510, 580, "CloudWatch Logs\nlogs das sessões"),
    ("catalogo", "catalogo", 685, 580, "Glue Data Catalog\nsod_bronze · sod_silver · sod_gold"),
    ("athena", "athena", 1030, 580, "Amazon Athena\nSQL analítico, resultados\nem athena-results/"),
    ("deck", "externo", 1390, 370, "Material executivo\nPPT + gráficos"),
    ("cliente", "externo", 1390, 580, "Consultoria →\ninstituição financeira"),
]
LE = "exitX=0.75;exitY=1;entryX=0.5;entryY=0;"     # zona S3 -> job (sai por baixo, entra por cima)
GRAVA = "exitX=1;exitY=0.5;entryX=0.25;entryY=1;"  # job -> zona S3 (sai pela direita, sobe)


def le(zx, jx):  # rota ortogonal zona -> job, pelo corredor y=300
    return [(zx + 48, 254), (zx + 48, 300), (jx + 32, 300), (jx + 32, 370)], ((zx + 48 + jx + 32) / 2, 300)


def grava(jx, zx):  # rota ortogonal job -> próxima zona
    return [(jx + 64, 402), (zx + 16, 402), (zx + 16, 254)], (zx + 16, 345)


# (origem, destino, rótulo, tracejado, pontos no PNG, posição do rótulo no PNG, dica de rota do draw.io)
ARESTAS = [
    ("kaggle", "cli", "download", False, [(97, 114), (97, 190)], (97, 152), ""),
    ("cli", "raw", "upload", False, [(182, 222), (340, 222)], (262, 222), ""),
    ("raw", "job1", "lê", False, *le(340, 455), LE), ("job1", "bronze", "grava", False, *grava(455, 570), GRAVA),
    ("bronze", "job2", "lê", False, *le(570, 685), LE), ("job2", "silver", "grava", False, *grava(685, 800), GRAVA),
    ("silver", "job3", "lê", False, *le(800, 915), LE), ("job3", "gold", "grava", False, *grava(915, 1030), GRAVA),
    ("gold", "job4", "lê", False, *le(1030, 1145), LE),
    ("job4", "deck", "PNG", False, [(1209, 402), (1342, 402)], (1275, 402), ""),
    ("iam", "job1", "assume", True, [(372, 580), (372, 495)], (372, 537), ""),
    ("job1", "logs", "logs", True, [(542, 495), (542, 580)], (542, 537), ""),
    ("job2", "catalogo", "registra tabelas", True, [(717, 495), (717, 580)], (717, 537), ""),
    ("catalogo", "athena", "esquema", True, [(749, 612), (1030, 612)], (890, 612), ""),
    ("athena", "cliente", "consultas SQL", False, [(1094, 612), (1342, 612)], (1218, 612), ""),
    ("deck", "cliente", "storytelling", False, [(1427, 434), (1427, 580)], (1427, 507), ""),
]
GRUPOS = [  # (rótulo, x, y, w, h, cor, tracejado)
    ("AWS Cloud · AWS Academy Learner Lab", 250, 20, 1060, 720, "#232F3E", False),
    ("Região us-east-1", 270, 60, 1020, 670, "#00A4A6", True),
    ("Amazon S3 · data lake  s3://tc-fase3-state-of-data-<rm>/", 300, 100, 960, 175, "#7AA116", True),
    ("AWS Glue 5.0 · Glue Jobs em PySpark (Spark 3.5) · mesmo código roda em Glue Notebook", 300, 325, 960, 170, "#8C4FFF", True),
]


def drawio():
    celulas = []
    for i, (rotulo, x, y, w, h, cor, tracejado) in enumerate(GRUPOS):
        if i < 2:
            icone, fonte = ("group_aws_cloud_alt", "#232F3E") if i == 0 else ("group_region", "#147EBA")
            estilo = ("points=[];outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;fontStyle=1;"
                      "container=1;pointerEvents=0;collapsible=0;recursiveResize=0;shape=mxgraph.aws4.group;"
                      f"grIcon=mxgraph.aws4.{icone};strokeColor={cor};fillColor=none;verticalAlign=top;"
                      f"align=left;spacingLeft=30;fontColor={fonte};dashed={int(tracejado)};")
        else:
            posicao = "verticalAlign=bottom;" if i == 3 else "verticalAlign=top;"
            estilo = (f"rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=none;strokeColor={cor};dashed=1;"
                      f"{posicao}align=left;spacingLeft=10;fontColor={cor};fontStyle=1;fontSize=12;")
        celulas.append(f'<mxCell id="g{i}" value="{escape(rotulo)}" style="{estilo}" vertex="1" parent="1">'
                       f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')
    for nid, tipo, x, y, rotulo in NOS:
        valor = escape(rotulo).replace("\n", "&lt;br&gt;")
        if tipo == "externo":
            estilo = ("rounded=1;whiteSpace=wrap;html=1;fillColor=#F2F3F3;strokeColor=#232F3E;fontColor=#232F3E;"
                      "fontSize=11;arcSize=10;")
            geo = f'x="{x - 48}" y="{y}" width="170" height="64"'
        else:
            rotulo_pos = ("verticalLabelPosition=top;verticalAlign=bottom;" if tipo == "s3"
                          else "verticalLabelPosition=bottom;verticalAlign=top;")
            estilo = (f"sketch=0;outlineConnect=0;fontColor=#232F3E;fillColor={COR[tipo]};strokeColor=#ffffff;dashed=0;"
                      f"{rotulo_pos}align=center;html=1;fontSize=11;fontStyle=0;"
                      f"aspect=fixed;shape=mxgraph.aws4.resourceIcon;resIcon={ICONE[tipo]};")
            geo = f'x="{x}" y="{y}" width="{TAM}" height="{TAM}"'
        celulas.append(f'<mxCell id="{nid}" value="{valor}" style="{estilo}" vertex="1" parent="1">'
                       f'<mxGeometry {geo} as="geometry"/></mxCell>')
    for i, (a, b, rotulo, tracejado, _, _, dica) in enumerate(ARESTAS):
        estilo = ("edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;endArrow=block;endFill=1;strokeColor=#545B64;"
                  f"fontSize=10;fontColor=#545B64;labelBackgroundColor=#ffffff;{'dashed=1;' if tracejado else ''}{dica}")
        celulas.append(f'<mxCell id="e{i}" value="{escape(rotulo)}" style="{estilo}" edge="1" parent="1" '
                       f'source="{a}" target="{b}"><mxGeometry relative="1" as="geometry"/></mxCell>')
    corpo = "\n        ".join(celulas)
    return f"""<mxfile host="app.diagrams.net" type="device">
  <diagram id="arquitetura" name="Arquitetura AWS - Tech Challenge Fase 3">
    <mxGraphModel dx="1600" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1560" pageHeight="770" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        {corpo}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""


def png():
    largura, altura = 1560, 760
    fig = plt.figure(figsize=(15.6, 7.6), dpi=150)
    ax = fig.add_axes((0, 0, 1, 1))
    ax.set_xlim(0, largura)
    ax.set_ylim(altura, 0)
    ax.axis("off")
    fig.patch.set_facecolor("white")
    for i, (rotulo, x, y, w, h, cor, tracejado) in enumerate(GRUPOS):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=6", fill=False,
                                    edgecolor=cor, linewidth=1.4 if i == 0 else 1.1, linestyle="--" if tracejado else "-"))
        ty = y + h - 16 if i == 3 else y + 18  # título do grupo Glue no rodapé, para não cruzar as setas
        ax.text(x + 12, ty, rotulo, fontsize=10.5, color=cor, fontweight="bold", va="center")
    for nid, tipo, x, y, rotulo in NOS:
        if tipo == "externo":
            ax.add_patch(FancyBboxPatch((x - 48, y), 170, 64, boxstyle="round,pad=0,rounding_size=8",
                                        facecolor="#F2F3F3", edgecolor="#232F3E", linewidth=1))
            ax.text(x + 37, y + 32, rotulo, ha="center", va="center", fontsize=8.4, color="#232F3E")
            continue
        ax.add_patch(FancyBboxPatch((x, y), TAM, TAM, boxstyle="round,pad=0,rounding_size=6",
                                    facecolor=COR[tipo], edgecolor="none"))
        ax.text(x + TAM / 2, y + TAM / 2, SIGLA[tipo], ha="center", va="center", fontsize=9.5,
                color="white", fontweight="bold")
        if tipo == "s3":
            ax.text(x + TAM / 2, y - 8, rotulo, ha="center", va="bottom", fontsize=8.6, color="#232F3E")
        else:
            ax.text(x + TAM / 2, y + TAM + 8, rotulo, ha="center", va="top", fontsize=8.6, color="#232F3E")
    for a, b, rotulo, tracejado, pontos, pos, _ in ARESTAS:
        estilo = "--" if tracejado else "-"
        if len(pontos) > 2:
            xs, ys = zip(*pontos[:-1])
            ax.plot(xs, ys, color="#545B64", linewidth=1.1, linestyle=estilo, solid_joinstyle="round")
        ax.add_patch(FancyArrowPatch(pontos[-2], pontos[-1], arrowstyle="-|>", mutation_scale=12, color="#545B64",
                                     linewidth=1.1, linestyle=estilo, shrinkA=0, shrinkB=0))
        if rotulo:
            ax.text(*pos, rotulo, ha="center", va="center", fontsize=7.8, color="#545B64",
                    bbox=dict(boxstyle="round,pad=0.15", facecolor="white", edgecolor="none"))
    fig.savefig(SAIDA / "arquitetura_aws.png", dpi=150, facecolor="white")
    plt.close(fig)


if __name__ == "__main__":
    SAIDA.mkdir(exist_ok=True)
    (SAIDA / "arquitetura_aws.drawio").write_text(drawio(), encoding="utf-8")
    png()
    print("ok:", *(p.name for p in SAIDA.iterdir()))
