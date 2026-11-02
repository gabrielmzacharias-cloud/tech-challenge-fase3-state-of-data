# %% [markdown]
# # 04 · Análises e gráficos — camada Gold → material executivo
#
# Lê as tabelas `sod_gold.*` e gera os gráficos usados na apresentação.
# Cada seção responde a uma pergunta de negócio do desafio:
#
# 1. Estrutura do mercado de dados · 2. Perfis mais valorizados · 3. Diversidade de gênero
# 4. Adoção de tecnologias · 5. Adoção e impacto de IA · 6. Região, senioridade e modelo de trabalho
#
# Padrão visual: paleta categórica validada para daltonismo (azul, laranja, verde-água, amarelo),
# rampa ordinal azul para as edições (2023 claro → 2025 escuro), um único eixo por gráfico,
# rótulos diretos só onde ajudam a leitura.
#
# No Glue, os PNGs são enviados para `s3://<bucket>/output/charts/` e exibidos com `%matplot plt`.

# %%
# %idle_timeout 60
# %glue_version 5.0
# %worker_type G.1X
# %number_of_workers 2

# %%
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from pyspark.sql import functions as F

try:  # AWS Glue
    from awsglue.context import GlueContext
    from pyspark.context import SparkContext

    sc = SparkContext.getOrCreate()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    IS_GLUE = True
except ImportError:  # execução local (PySpark puro)
    from pyspark.sql import SparkSession

    spark = (SparkSession.builder.appName("sod-04-graficos").master("local[*]")
             .config("spark.driver.memory", "4g")
             .config("spark.ui.showConsoleProgress", "false")
             .config("spark.sql.shuffle.partitions", "8")
             .getOrCreate())
    IS_GLUE = False

BUCKET = os.environ.get("SOD_BUCKET", "tc-fase3-state-of-data-rm375453")  # S3 só aceita minúsculas
BASE = f"s3://{BUCKET}" if IS_GLUE else os.environ.get("SOD_LOCAL_BASE", "../data")
SAIDA = "/tmp/charts" if IS_GLUE else os.path.join(os.environ.get("SOD_OUTPUT", "../output"), "charts")
os.makedirs(SAIDA, exist_ok=True)


def ler(tabela):
    """Tabelas Gold são pequenas (agregadas): trazemos para pandas para plotar."""
    df = spark.read.parquet(f"{BASE}/gold/{tabela}")
    # ROUND() do Spark gera DecimalType, que vira decimal.Decimal no pandas: convertemos para double
    df = df.select([F.col(c).cast("double").alias(c) if t.startswith("decimal") else F.col(c) for c, t in df.dtypes])
    return df.toPandas()


gold = {t: ler(t) for t in ["kpis_ano", "distribuicao_perfil", "salario_cargo_senioridade", "diversidade_genero",
                            "adocao_tecnologias", "adocao_ia", "ia_impacto", "regiao_modelo_trabalho", "modelo_trabalho", "comparativo_financas"]}
print({t: len(df) for t, df in gold.items()})

# %% [markdown]
# ## Padrão visual

# %%
SUPERFICIE, TINTA, TINTA_2, APAGADO, GRADE, EIXO = "#fcfcfb", "#0b0b0b", "#52514e", "#898781", "#e1e0d9", "#c3c2b7"
CATEGORICA = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]           # validada: scripts/validate_palette.js (light)
ANOS = {2023: "#86b6ef", 2024: "#2a78d6", 2025: "#104281"}          # rampa ordinal azul (validada --ordinal)
ORDINAL_4 = ["#0d366b", "#1c5cab", "#3987e5", "#86b6ef"]            # 1 = mais forte
NEUTRO = EIXO                                                         # "não sei" / categorias de contexto
SENIORIDADE = ["Júnior", "Pleno", "Sênior", "Especialista/Staff+", "Gestor(a)"]

plt.rcParams.update({
    "figure.facecolor": SUPERFICIE, "axes.facecolor": SUPERFICIE, "savefig.facecolor": SUPERFICIE,
    "font.family": "DejaVu Sans", "font.size": 10, "text.color": TINTA,
    "axes.edgecolor": EIXO, "axes.labelcolor": TINTA_2, "axes.titlecolor": TINTA,
    "axes.titlesize": 13, "axes.titleweight": "bold", "axes.titlelocation": "left", "axes.titlepad": 8,
    "axes.spines.top": False, "axes.spines.right": False, "axes.spines.left": False,
    "axes.grid": True, "grid.color": GRADE, "grid.linewidth": 0.6, "axes.axisbelow": True,
    "xtick.color": APAGADO, "ytick.color": TINTA_2, "xtick.labelcolor": APAGADO, "ytick.labelcolor": TINTA_2,
    "legend.frameon": False, "legend.labelcolor": TINTA_2,
    "text.parse_math": False,  # "R$" não deve virar fórmula
})


def reais(v):
    return f"R$ {v / 1000:,.1f} mil".replace(".", ",")


def pct(v):
    return f"{v:.0f}%" if v >= 10 else f"{v:.1f}%".replace(".", ",")


def decimal_br(ax, eixo="x"):
    """Ticks numéricos com vírgula decimal, como os rótulos."""
    getattr(ax, f"{eixo}axis").set_major_formatter(lambda v, _: f"{v:g}".replace(".", ","))


def legenda_topo(ax, ncols=3, **kw):
    """Legenda acima da área de plotagem: nunca cobre barras, linhas ou rótulos."""
    leg = ax.legend(loc="lower left", bbox_to_anchor=(0, 1.01), ncols=ncols, borderaxespad=0, **kw)
    leg.set_in_layout(False)       # o tight_layout superestima a legenda; reservamos a faixa em salvar()
    ax.figure.legenda_topo = True


def figura(titulo, subtitulo, largura=10, altura=5.6, ncols=1, nrows=1, **kw):
    fig, axes = plt.subplots(nrows, ncols, figsize=(largura, altura), **kw)
    # fig.text (e não suptitle): o tight_layout desconta o suptitle de novo e abre um vão sob o subtítulo
    fig.text(0.01, 0.99, titulo, ha="left", va="top", fontsize=15, fontweight="bold", color=TINTA)
    fig.text(0.01, 0.925, subtitulo, ha="left", va="top", fontsize=10.5, color=TINTA_2)
    return fig, axes


def salvar(fig, nome, fonte="Fonte: State of Data Brasil 2023, 2024 e 2025 (Data Hackers) · camada Gold"):
    fig.text(0.01, 0.01, fonte, ha="left", va="bottom", fontsize=8, color=APAGADO)
    topo = 0.83 if getattr(fig, "legenda_topo", False) else 0.88
    fig.tight_layout(rect=(0, 0.04, 1, topo))
    caminho = os.path.join(SAIDA, f"{nome}.png")
    fig.savefig(caminho, dpi=200)
    plt.close(fig)
    if IS_GLUE:
        import boto3
        boto3.client("s3").upload_file(caminho, BUCKET, f"output/charts/{nome}.png")
    print("  ->", caminho)


def barras_h(ax, rotulos, valores, cores, fmt=pct, ordem_inversa=True, eixo_x=True, textos=None):
    """Barras horizontais finas, maior no topo, rótulo de valor ao fim de cada barra (em cor de texto)."""
    y = range(len(rotulos))
    cores = cores if isinstance(cores, list) else [cores] * len(rotulos)
    ax.barh(list(y), valores, color=cores, height=0.62)
    ax.set_yticks(list(y), rotulos)
    if ordem_inversa:
        ax.invert_yaxis()
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", length=0)
    limite = max(valores) * 1.18
    ax.set_xlim(0, limite)
    textos = textos or [fmt(v) for v in valores]
    for yi, v, t in zip(y, valores, textos):
        ax.text(v + limite * 0.01, yi, t, va="center", fontsize=9, color=TINTA_2)
    decimal_br(ax)
    if not eixo_x:
        ax.set_xticks([])
        ax.grid(False)


def barras_agrupadas_h(ax, rotulos, series, cores, fmt=pct, rotular=None):
    """series: {nome: [valores alinhados a rotulos]}. Rótulo de valor só na série `rotular` (seletivo)."""
    n = len(series)
    altura = 0.8 / n
    for i, (nome, valores) in enumerate(series.items()):
        pos = [k + (i - (n - 1) / 2) * altura for k in range(len(rotulos))]
        ax.barh(pos, valores, height=altura - 0.04, color=cores[i], label=str(nome))
        if rotular is not None and nome == rotular:
            for p, v in zip(pos, valores):
                ax.text(v + 0.6, p, fmt(v), va="center", fontsize=8.5, color=TINTA_2)
    ax.set_yticks(range(len(rotulos)), rotulos)
    ax.invert_yaxis()
    ax.grid(axis="y", visible=False)
    ax.tick_params(axis="y", length=0)
    decimal_br(ax)


# %% [markdown]
# ## 1 · Estrutura do mercado

# %%
dist = gold["distribuicao_perfil"]
kpis = gold["kpis_ano"].sort_values("ano_pesquisa")
print(kpis.to_string(index=False))

# cargos (2025), entre quem atua na área de dados
cargos = (dist.query("ano_pesquisa == 2025 and dimensao == 'cargo' and categoria != 'Outros'")
          .sort_values("pct", ascending=False))
fig, ax = figura("Quem é o profissional de dados em 2025", "Distribuição por cargo, % de quem atua na área de dados (sem a categoria 'Outros')")
barras_h(ax, cargos["categoria"].tolist(), cargos["pct"].tolist(), CATEGORICA[0])
ax.set_xlabel("% dos profissionais")
salvar(fig, "01_cargos_2025")

# senioridade por edição
sen = dist.query("dimensao == 'senioridade'").pivot_table(index="categoria", columns="ano_pesquisa", values="pct").reindex(SENIORIDADE)
fig, ax = figura("Mercado amadurecendo: menos júniores, mais gestores",
                 "Distribuição por senioridade, % de quem atua na área de dados (a opção 'Especialista/Staff+' só existe em 2025)")
barras_agrupadas_h(ax, SENIORIDADE, {a: sen[a].fillna(0).tolist() for a in sorted(ANOS)}, list(ANOS.values()), rotular=2025)
legenda_topo(ax)
ax.set_xlabel("% dos profissionais")
salvar(fig, "02_senioridade_ano")

# setor (2025) com destaque para Finanças
setores = dist.query("ano_pesquisa == 2025 and dimensao == 'setor'").sort_values("pct", ascending=False).head(10)
cores = [CATEGORICA[0] if s == "Finanças ou Bancos" else NEUTRO for s in setores["categoria"]]
fig, ax = figura("Finanças é o setor que mais emprega profissionais de dados",
                 "Top 10 setores em 2025, % dos respondentes que informaram o setor")
barras_h(ax, setores["categoria"].tolist(), setores["pct"].tolist(), cores)
ax.set_xlabel("% dos respondentes")
salvar(fig, "03_setores_2025")

# %% [markdown]
# ## 2 · Perfis mais valorizados

# %%
sal = gold["salario_cargo_senioridade"]
por_cargo = (sal.query("ano_pesquisa == 2025 and senioridade == 'Todos' and n >= 30 and cargo != 'Outros'")
             .sort_values("salario_medio", ascending=False))
fig, ax = figura("Gestão, ML/IA e engenharia de dados lideram a remuneração",
                 "Salário médio estimado por cargo em 2025 (ponto médio da faixa declarada; cargos com 30+ respostas)")
barras_h(ax, por_cargo["cargo"].tolist(), por_cargo["salario_medio"].tolist(), CATEGORICA[0], fmt=reais)
ax.set_xlabel("Salário médio mensal estimado (R$)")
ax.xaxis.set_major_formatter(lambda v, _: f"{v / 1000:.0f} mil")
salvar(fig, "04_salario_cargo_2025")

# média ponderada pelas regiões (regiao_modelo_trabalho já vem agregada por região × senioridade)
r = gold["regiao_modelo_trabalho"].query("senioridade != 'Todos'").assign(peso=lambda d: d["salario_medio"] * d["n"])
soma = r.groupby(["senioridade", "ano_pesquisa"])[["peso", "n"]].sum()
base_sen = (soma["peso"] / soma["n"]).unstack().reindex(SENIORIDADE)
fig, ax = figura("Senioridade é o principal motor de salário",
                 "Salário médio estimado por senioridade, R$ mil por mês ('Especialista/Staff+' só existe em 2025)")
barras_agrupadas_h(ax, SENIORIDADE, {a: (base_sen[a].fillna(0) / 1000).tolist() for a in sorted(ANOS)},
                   list(ANOS.values()), fmt=lambda v: f"R$ {v:.1f} mil".replace(".", ","), rotular=2025)
ax.set_xlabel("R$ mil por mês")
legenda_topo(ax)
salvar(fig, "05_salario_senioridade_ano")

# %% [markdown]
# ## 3 · Diversidade de gênero

# %%
div = gold["diversidade_genero"]
total = div.query("dimensao == 'Total'").sort_values("ano_pesquisa")
div_sen = div.query("ano_pesquisa == 2025 and dimensao == 'senioridade'").set_index("categoria").reindex(SENIORIDADE)
fig, (ax1, ax2) = figura("Mulheres são 1 em cada 5 profissionais e ganham menos em quase todos os níveis",
                         "2025. Esquerda: % de mulheres por senioridade. Direita: quanto o salário médio delas é menor que o deles",
                         ncols=2, largura=11)
barras_h(ax1, SENIORIDADE, div_sen["pct_mulheres"].tolist(), CATEGORICA[0])
ax1.set_title("% de mulheres", fontsize=11, pad=8)
gap = div_sen["gap_salarial_pct"]
barras_h(ax2, SENIORIDADE, gap.clip(lower=0).tolist(), CATEGORICA[1],
         textos=[pct(v) if v > 1 else "paridade (" + f"{v:+.1f}%".replace(".", ",") + ")" for v in gap])
ax2.set_title("Diferença salarial (mulheres vs. homens)", fontsize=11, pad=8)
ax2.set_yticklabels([])
salvar(fig, "06_genero_senioridade_2025")
print(total[["ano_pesquisa", "pct_mulheres", "salario_medio_homens", "salario_medio_mulheres", "gap_salarial_pct"]].to_string(index=False))

# %% [markdown]
# ## 4 · Adoção de tecnologias

# %%
tec = gold["adocao_tecnologias"]
TITULOS = {"linguagem": "Linguagens", "banco_dados": "Bancos de dados", "cloud": "Cloud", "bi": "Ferramentas de BI"}
fig, axes = figura("Stack dominante: SQL + Python, bancos relacionais, AWS/Azure e Power BI",
                   "Top 6 itens por categoria em 2025, % de quem respondeu o bloco (múltipla escolha)",
                   ncols=2, nrows=2, largura=11, altura=7.2)
for ax, (cat, titulo) in zip(axes.flat, TITULOS.items()):
    top = tec.query("ano_pesquisa == 2025 and categoria == @cat").sort_values("pct_adocao", ascending=False).head(6)
    barras_h(ax, top["item"].tolist(), top["pct_adocao"].tolist(), CATEGORICA[0], eixo_x=False)
    ax.set_title(titulo, fontsize=11, pad=6)
salvar(fig, "07_tecnologias_2025")

clouds = ["AWS", "Azure", "GCP"]
evol = tec.query("categoria == 'cloud' and item in @clouds").pivot(index="ano_pesquisa", columns="item", values="pct_adocao")
fig, ax = figura("Cloud: AWS assume a liderança e abre vantagem sobre Azure e GCP", "% de quem respondeu o bloco de cloud que usa cada provedor, por edição")
for cor, nuvem in zip(CATEGORICA, clouds):
    ax.plot(evol.index, evol[nuvem], color=cor, linewidth=2, marker="o", markersize=8,
            markeredgecolor=SUPERFICIE, markeredgewidth=2, label=nuvem)
    ax.text(evol.index[-1] + 0.06, evol[nuvem].iloc[-1], f"{nuvem} {pct(evol[nuvem].iloc[-1])}", va="center", fontsize=9.5, color=TINTA_2)
ax.set_xticks(list(evol.index), [str(a) for a in evol.index])
ax.set_xlim(evol.index.min() - 0.2, evol.index.max() + 0.5)
ax.set_ylim(0, max(evol.max()) * 1.2)
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0f}%")
ax.grid(axis="x", visible=False)
legenda_topo(ax)
salvar(fig, "08_cloud_evolucao")

# %% [markdown]
# ## 5 · Adoção e impacto da IA generativa

# %%
ia = gold["adocao_ia"]
kp = kpis.set_index("ano_pesquisa")
fig, ax = figura("IA generativa virou ferramenta de trabalho do profissional de dados",
                 "% dos profissionais que usam IA generativa e % cujas empresas pagam a ferramenta, por edição")
x = list(kp.index)
for cor, col, nome in [(CATEGORICA[0], "pct_usa_ia_generativa", "Usa IA generativa"), (CATEGORICA[1], "pct_empresa_paga_ia", "Empresa paga a ferramenta")]:
    ax.plot(x, kp[col], color=cor, linewidth=2, marker="o", markersize=8, markeredgecolor=SUPERFICIE, markeredgewidth=2, label=nome)
    for xi, v in zip(x, kp[col]):
        ax.text(xi, v + 3, pct(v), ha="center", fontsize=9.5, color=TINTA_2)
ax.set_xticks(x, [str(a) for a in x])
ax.set_xlim(min(x) - 0.3, max(x) + 0.3)
ax.set_ylim(0, 105)
ax.yaxis.set_major_formatter(lambda v, _: f"{v:.0f}%")
ax.grid(axis="x", visible=False)
legenda_topo(ax, ncols=2)
salvar(fig, "09_ia_adocao_evolucao")

prior = ia.query("indicador == 'ia_prioridade_empresa'").pivot(index="ano_pesquisa", columns="resposta", values="pct").fillna(0)
prior = prior[sorted(prior.columns)]
cores_prior = ORDINAL_4 + [NEUTRO]
fig, ax = figura("Para as empresas, IA já é prioridade — mas poucas a tratam como a principal",
                 "Visão dos gestores: a empresa trata IA generativa como prioridade? % por edição")
esquerda = [0.0] * len(prior)
for cor, col in zip(cores_prior, prior.columns):
    ax.barh([str(a) for a in prior.index], prior[col], left=esquerda, color=cor, height=0.55,
            edgecolor=SUPERFICIE, linewidth=2, label=col.split(". ", 1)[1])
    for i, (e, v) in enumerate(zip(esquerda, prior[col])):
        if v >= 7:
            ax.text(e + v / 2, i, pct(v), ha="center", va="center", fontsize=9,
                    color="white" if cor in ORDINAL_4[:3] else TINTA)
    esquerda = [e + v for e, v in zip(esquerda, prior[col])]
ax.invert_yaxis()
ax.set_xlim(0, 100)
ax.xaxis.set_major_formatter(lambda v, _: f"{v:.0f}%")
ax.grid(axis="y", visible=False)
ax.tick_params(axis="y", length=0)
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.12), ncols=5, fontsize=9)
salvar(fig, "10_ia_prioridade_empresas")

res = ia.query("ano_pesquisa == 2025 and indicador == 'ia_resultados_empresa'").sort_values("resposta")
fig, ax = figura("Em 2025, a maioria das iniciativas de IA ainda não gera resultado em produção",
                 "Visão dos gestores: as iniciativas de IA generativa da empresa já trazem resultados? (2025)")
barras_h(ax, [r.split(". ", 1)[1] for r in res["resposta"]], res["pct"].tolist(), ORDINAL_4 + [NEUTRO])
ax.set_xlabel("% dos gestores")
salvar(fig, "11_ia_resultados_2025")

imp = gold["ia_impacto"].query("ano_pesquisa == 2025").sort_values("perfil_uso_ia")
rotulos = [p.split(". ", 1)[1] + (f" (n={n})" if n < 100 else "") for p, n in zip(imp["perfil_uso_ia"], imp["n"])]
fig, axes = figura("Quem tem IA fornecida pela empresa é mais sênior e mais bem pago",
                   "Profissionais de dados em 2025, por perfil de uso de IA generativa", ncols=3, largura=12, altura=4.6)
barras_h(axes[0], rotulos, imp["salario_medio"].tolist(), CATEGORICA[0], fmt=reais, eixo_x=False)
axes[0].set_title("Salário médio estimado", fontsize=11, pad=6)
barras_h(axes[1], rotulos, imp["pct_senior_ou_gestor"].tolist(), CATEGORICA[0], eixo_x=False)
axes[1].set_title("% sênior, especialista ou gestor", fontsize=11, pad=6)
barras_h(axes[2], rotulos, imp["pct_satisfeitos"].tolist(), CATEGORICA[0], eixo_x=False)
axes[2].set_title("% satisfeitos na empresa", fontsize=11, pad=6)
for ax in axes[1:]:
    ax.set_yticklabels([])
salvar(fig, "12_ia_impacto_2025")
print(imp.to_string(index=False))

# %% [markdown]
# ## 6 · Região, senioridade e modelo de trabalho

# %%
reg = (gold["regiao_modelo_trabalho"]
       .query("ano_pesquisa == 2025 and senioridade == 'Todos' and n >= 30 and regiao != 'Exterior/Não informado'")
       .sort_values("salario_medio", ascending=False))
fig, (ax1, ax2) = figura("Sudeste paga mais; Norte, Nordeste e Sul são os mais remotos",
                         "Profissionais de dados em 2025 por região do Brasil (sem exterior/não informado)", ncols=2, largura=11, altura=4.8)
barras_h(ax1, reg["regiao"].tolist(), reg["salario_medio"].tolist(), CATEGORICA[0], fmt=reais, eixo_x=False)
ax1.set_title("Salário médio estimado", fontsize=11, pad=6)
barras_h(ax2, reg["regiao"].tolist(), reg["pct_remoto"].tolist(), CATEGORICA[0], eixo_x=False)
ax2.set_title("% em modelo 100% remoto", fontsize=11, pad=6)
ax2.set_yticklabels([])
salvar(fig, "13_regiao_2025")

MODELOS = ["100% remoto", "Híbrido flexível", "Híbrido com dias fixos", "100% presencial"]
mod = gold["modelo_trabalho"].query("ano_pesquisa == 2025 and senioridade == 'Todos'").pivot(index="modelo", columns="tipo", values="pct").reindex(MODELOS)
fig, ax = figura("O ideal é remoto ou híbrido flexível; presencial quase não tem demanda",
                 "Modelo de trabalho atual vs. modelo ideal, % dos respondentes (2025)")
barras_agrupadas_h(ax, MODELOS, {"Atual": mod["atual"].tolist(), "Ideal": mod["ideal"].tolist()},
                   CATEGORICA[:2], rotular="Atual")
for k, v in enumerate(mod["ideal"]):
    ax.text(v + 0.6, k + 0.2, pct(v), va="center", fontsize=8.5, color=TINTA_2)
legenda_topo(ax, ncols=2)
ax.set_xlabel("% dos respondentes")
salvar(fig, "14_modelo_trabalho_2025")

# %% [markdown]
# ## 7 · Recorte do cliente — setor financeiro

# %%
fin = gold["comparativo_financas"].query("ano_pesquisa == 2025").set_index("grupo")
METRICAS = {"pct_usa_ia_generativa": "Usa IA generativa", "pct_empresa_paga_ia": "Empresa paga a IA",
            "pct_senior_ou_gestor": "Sênior, especialista ou gestor", "pct_remoto": "100% remoto",
            "pct_presencial": "100% presencial", "pct_mulheres": "Mulheres", "pct_buscando_emprego": "Buscando outro emprego"}
fig, ax = figura("Finanças vs. mercado: o perfil do profissional de dados nos bancos",
                 f"% dos profissionais de dados em 2025 · salário médio estimado: Finanças {reais(fin.loc['Finanças ou Bancos', 'salario_medio'])}"
                 f" vs. demais setores {reais(fin.loc['Demais setores', 'salario_medio'])}")
barras_agrupadas_h(ax, list(METRICAS.values()),
                   {"Finanças ou Bancos": fin.loc["Finanças ou Bancos", list(METRICAS)].tolist(),
                    "Demais setores": fin.loc["Demais setores", list(METRICAS)].tolist()},
                   [CATEGORICA[0], NEUTRO], rotular="Finanças ou Bancos")
legenda_topo(ax, ncols=2)
ax.set_xlabel("% dos profissionais")
salvar(fig, "15_financas_vs_mercado_2025")
print(gold["comparativo_financas"].sort_values(["ano_pesquisa", "grupo"]).to_string(index=False))

# %% [markdown]
# ## Exibição no Glue Notebook
# No Glue Interactive Sessions, a magic abaixo renderiza a última figura do matplotlib na célula.
# Localmente os PNGs ficam em `output/charts/`.

# %%
# %matplot plt
print("Gráficos gerados em:", SAIDA if not IS_GLUE else f"s3://{BUCKET}/output/charts/")
