# %% [markdown]
# # 02 · Silver — limpeza e harmonização das 3 edições
#
# A cada edição a Data Hackers renumera parte das perguntas (ex.: *modelo de trabalho atual* é `2.r`
# em 2023/2024 e `2.q` em 2025; *cloud preferida* é `4.i` e depois `4.f`) e muda rótulos de cargo.
# Esta etapa transforma as três tabelas Bronze em **um esquema único**:
#
# | Saída | Grão | Conteúdo |
# |---|---|---|
# | `sod_silver.respondentes` | 1 linha por respondente × edição | Perfil, carreira, salário (faixa e valor médio estimado), modelo de trabalho, IA. Particionada por `ano_pesquisa`. |
# | `sod_silver.respondente_itens` | 1 linha por respondente × item marcado | Perguntas de múltipla escolha "explodidas": linguagens, bancos, clouds, BI e uso de IA. |
#
# Principais regras:
# * **De-para de códigos por edição** (`CAMPOS` e `GRUPOS`), itens de múltipla escolha casados pelo **rótulo**, não pela posição.
# * Cargo harmonizado (Engenheiro e Arquiteto de Dados foram separados em 2024 → agrupados de novo); gestores viram `Gestor(a)`.
# * Faixa salarial → `salario_medio` = ponto médio da faixa (acima de R$ 40 mil = R$ 45 mil, premissa documentada).
# * Tempo de experiência: 2023 tinha "4 a 6" e "5 a 6 anos" → agrupados em "5 a 6 anos".
# * Deduplicação por token do respondente (2 duplicados em 2024 e 1 em 2025).

# %%
# %idle_timeout 60
# %glue_version 5.0
# %worker_type G.1X
# %number_of_workers 2

# %%
import os
import re
from functools import reduce
from itertools import chain

from pyspark.sql import Window
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

    spark = (SparkSession.builder.appName("sod-02-silver").master("local[*]")
             .config("spark.driver.memory", "4g")
             .config("spark.ui.showConsoleProgress", "false")
             .config("spark.sql.shuffle.partitions", "8")
             .getOrCreate())
    IS_GLUE = False

BUCKET = os.environ.get("SOD_BUCKET", "tc-fase3-state-of-data-rm375453")  # S3 só aceita minúsculas
BASE = f"s3://{BUCKET}" if IS_GLUE else os.environ.get("SOD_LOCAL_BASE", "../data")
ANOS = [2023, 2024, 2025]

# %% [markdown]
# ## De-para de perguntas por edição

# %%
# campo harmonizado -> código da pergunta (str = igual nas 3 edições; dict = muda por edição)
CAMPOS = {
    "id_origem": {2023: "0", 2024: "0_a", 2025: "0_a"},
    "idade": "1_a", "faixa_idade": "1_a_1", "genero": "1_b", "cor_raca": "1_c", "pcd": "1_d",
    "uf": "1_i_1", "regiao": "1_i_2", "nivel_ensino": "1_l", "area_formacao": "1_m",
    "situacao_trabalho": "2_a", "setor": "2_b", "porte_empresa": "2_c", "gestor": "2_d",
    "cargo_gestor": "2_e", "cargo_original": "2_f", "nivel": "2_g", "faixa_salarial": "2_h",
    "tempo_experiencia_dados": "2_i", "satisfeito": "2_k", "planos_mudar_emprego": "2_n",
    "layoff": {2023: "2_q", 2024: "2_q", 2025: "2_p"},
    "modelo_trabalho_atual": {2023: "2_r", 2024: "2_r", 2025: "2_q"},
    "modelo_trabalho_ideal": {2023: "2_s", 2024: "2_s", 2025: "2_r"},
    "ia_prioridade_empresa": "3_e",
    "ia_resultados_empresa": {2025: "3_g"},  # pergunta nova em 2025
    "linguagem_preferida": {2023: "4_f", 2024: "4_f"},  # removida em 2025
    "cloud_preferida": {2023: "4_i", 2024: "4_i", 2025: "4_f"},
    "bi_preferida": {2023: "4_k", 2024: "4_k", 2025: "4_h"},
}

# perguntas de múltipla escolha: categoria -> prefixo dos itens (<prefixo>_1, <prefixo>_2, ...)
GRUPOS = {
    "linguagem": {2023: "4_d", 2024: "4_d", 2025: "4_c"},
    "banco_dados": {2023: "4_g", 2024: "4_g", 2025: "4_d"},
    "cloud": {2023: "4_h", 2024: "4_h", 2025: "4_e"},
    "bi": {2023: "4_j", 2024: "4_j", 2025: "4_g"},
    "ia_uso_pessoal": {2023: "4_m", 2024: "4_m", 2025: "4_j"},
    "ia_uso_empresa": {2023: "3_f", 2024: "3_f", 2025: "3_f"},
}


def codigo(campo, ano):
    c = CAMPOS[campo]
    return c if isinstance(c, str) else c.get(ano)


# %% [markdown]
# ## Dicionários de padronização

# %%
CARGOS = {
    "Analista de Dados/Data Analyst": "Analista de Dados",
    "Cientista de Dados/Data Scientist": "Cientista de Dados",
    "Engenheiro de Dados/Arquiteto de Dados/Data Engineer/Data Architect": "Engenheiro(a)/Arquiteto(a) de Dados",
    "Engenheiro de Dados/Data Engineer/Data Architect": "Engenheiro(a)/Arquiteto(a) de Dados",
    "Arquiteto de Dados/Data Architect": "Engenheiro(a)/Arquiteto(a) de Dados",
    "Analista de BI/BI Analyst": "Analista de BI",
    "Analista de Negócios/Business Analyst": "Analista de Negócios",
    "Analytics Engineer": "Analytics Engineer",
    "Engenheiro de Machine Learning/ML Engineer/AI Engineer": "Engenheiro(a) de ML/IA",
    "Desenvolvedor/ Engenheiro de Software/ Analista de Sistemas": "Dev/Eng. de Software",
    "Data Product Manager/ Product Manager (PM/APM/DPM/GPM/PO)": "Product Manager de Dados",
}

# faixa salarial -> (ordem, rótulo curto, mínimo, máximo, médio estimado)
FAIXAS = [
    ("Menos de R$ 1.000/mês", "Até 1k", 0, 1000),
    ("de R$ 1.001/mês a R$ 2.000/mês", "1–2k", 1001, 2000),
    ("de R$ 2.001/mês a R$ 3.000/mês", "2–3k", 2001, 3000),
    ("de R$ 3.001/mês a R$ 4.000/mês", "3–4k", 3001, 4000),
    ("de R$ 4.001/mês a R$ 6.000/mês", "4–6k", 4001, 6000),
    ("de R$ 6.001/mês a R$ 8.000/mês", "6–8k", 6001, 8000),
    ("de R$ 8.001/mês a R$ 12.000/mês", "8–12k", 8001, 12000),
    ("de R$ 12.001/mês a R$ 16.000/mês", "12–16k", 12001, 16000),
    ("de R$ 16.001/mês a R$ 20.000/mês", "16–20k", 16001, 20000),
    ("de R$ 20.001/mês a R$ 25.000/mês", "20–25k", 20001, 25000),
    ("de R$ 25.001/mês a R$ 30.000/mês", "25–30k", 25001, 30000),
    ("de R$ 30.001/mês a R$ 40.000/mês", "30–40k", 30001, 40000),
    ("Acima de R$ 40.001/mês", "Acima de 40k", 40001, 50000),  # teto premissa: médio = 45k
]

EXPERIENCIA = {
    "Não tenho experiência na área de dados": (0, "Sem experiência em dados"),
    "Menos de 1 ano": (1, "Menos de 1 ano"),
    "de 1 a 2 anos": (2, "1 a 2 anos"),
    "de 3 a 4 anos": (3, "3 a 4 anos"),
    "de 4 a 6 anos": (4, "5 a 6 anos"),  # só 2023
    "de 5 a 6 anos": (4, "5 a 6 anos"),
    "de 7 a 10 anos": (5, "7 a 10 anos"),
    "Mais de 10 anos": (6, "Mais de 10 anos"),
}

MODELO_TRABALHO = {
    "Modelo 100% remoto": "100% remoto",
    "Modelo híbrido flexível (o funcionário tem liberdade para escolher quando estar no escritório presencialmente)": "Híbrido flexível",
    "Modelo híbrido com dias fixos de trabalho presencial": "Híbrido com dias fixos",
    "Modelo 100% presencial": "100% presencial",
}

SITUACAO = {
    "Empregado (CLT)": "CLT", "Empreendedor ou Empregado (CNPJ)": "PJ/Empreendedor",
    "Servidor Público": "Servidor público", "Estagiário": "Estágio",
    "Vivo no Brasil e trabalho remoto para empresa de fora do Brasil": "Remoto p/ empresa estrangeira",
    "Vivo fora do Brasil e trabalho para empresa de fora do Brasil": "Mora no exterior",
    "Freelancer": "Freelancer", "Trabalho na área Acadêmica/Pesquisador": "Academia/Pesquisa",
    "Desempregado, buscando recolocação": "Desempregado", "Desempregado e não estou buscando recolocação": "Desempregado",
    "Somente Estudante (graduação)": "Estudante", "Somente Estudante (pós-graduação)": "Estudante",
}

LAYOFF = {
    "Não ocorreram layoffs/demissões em massa na empresa em que trabalho": "Não houve layoff",
    "Sim, ocorreram layoffs/demissões em massa na empresa em que trabalho mas não fui afetado": "Houve layoff, não fui afetado",
    "Sim, ocorreram layoffs/demissões em massa na empresa em que trabalhava e eu fui afetado": "Fui afetado por layoff",
}


def ia_prioridade(texto):
    if texto is None: return None
    if texto.startswith("Sim, é nossa principal"): return "1. Principal prioridade"
    if texto.startswith("Sim, está entre"): return "2. Entre as prioridades"
    if texto.startswith("Mais ou menos"): return "3. Iniciativas isoladas"
    if texto.startswith("Não é uma iniciativa"): return "4. Não é prioridade"
    return "5. Não sei opinar"


def ia_resultados(texto):
    if texto is None: return None
    if texto.startswith("Sim."): return "1. Em produção, gerando resultado"
    if texto.startswith("Em partes"): return "2. Pilotos com pouco impacto"
    if texto.startswith("Não. Os projetos"): return "3. Em investigação/planejamento"
    if texto.startswith("Não, ainda não"): return "4. Ainda não começou"
    return "5. Não sei opinar"


def cloud_pref(texto):
    if texto is None: return None
    t = texto.lower()
    for chave, nome in [("aws", "AWS"), ("google", "GCP"), ("azure", "Azure"), ("databri", "Databricks")]:
        if chave in t: return nome
    if "não sei" in t or "preferência" in t or "preferencia" in t: return "Sem preferência/Não sei"
    return "Outras"


def bi_pref(texto):
    if texto is None: return None
    t = texto.lower()
    for chave, nome in [("powerbi", "Power BI"), ("power bi", "Power BI"), ("tableau", "Tableau"),
                        ("looker", "Looker"), ("metabase", "Metabase"), ("quicksight", "QuickSight"),
                        ("qlik", "Qlik"), ("superset", "Superset")]:
        if chave in t: return nome
    if "não sei" in t or "preferência" in t: return "Sem preferência/Não sei"
    return "Outras"


def item_canonico(categoria, rotulo):
    """Nome padronizado de um item de múltipla escolha (casamento por rótulo entre edições)."""
    r = rotulo.strip()
    if categoria == "ia_uso_pessoal":
        for ini, nome in [("Não uso", "Não usa IA generativa"), ("Uso soluções gratuitas", "Usa ferramentas gratuitas"),
                          ("Uso e pago", "Paga do próprio bolso"), ("A empresa", "Empresa paga a ferramenta"),
                          ("Uso soluções do tipo Copilot", "Usa copilots de código")]:
            if r.startswith(ini): return nome
    if categoria == "ia_uso_empresa":
        for ini, nome in [("Colaboradores usando", "Uso individual descentralizado"),
                          ("Direcionamento centralizado", "Uso com direcionamento central"),
                          ("Desenvolvedores utilizando", "Devs usando copilots"),
                          ("AI Generativa e LLMs para melhorar produtos externos", "IA em produtos para clientes"),
                          ("AI Generativa e LLMs para melhorar produtos internos", "IA em produtos internos"),
                          ("IA Generativa e LLMs como principal", "IA como principal frente do negócio"),
                          ("IA Generativa e LLMs não é", "IA não é prioridade"),
                          ("Não sei opinar", "Não sei opinar")]:
            if r.startswith(ini): return nome
    if r.startswith("Não utilizo"): return "Nenhuma"
    renomes = {"Amazon Web Services (AWS)": "AWS", "Google Cloud (GCP)": "GCP", "Azure (Microsoft)": "Azure",
               "Microsoft PowerBI": "Power BI", "Qlik View/Qlik Sense": "Qlik", "Amazon Quicksight": "QuickSight",
               "SQL SERVER": "SQL Server", "Looker Studio(Google Data Studio)": "Looker Studio"}
    if r in renomes: return renomes[r]
    if r.startswith("Servidores On Premise"): return "On-premise (sem cloud)"
    if r.startswith("Looker Studio"): return "Looker Studio"
    if r.startswith("Fazemos todas as análises"): return "Somente Excel/Planilhas"
    return r


def mapa(coluna, de_para):
    """Aplica um dicionário Python como mapa Spark (create_map)."""
    m = F.create_map([F.lit(x) for x in chain(*de_para.items())])
    return m[F.col(coluna)]


VERDADEIRO = ["1", "1.0", "true", "True", "TRUE"]
udf_ia_prioridade = F.udf(ia_prioridade)
udf_ia_resultados = F.udf(ia_resultados)
udf_cloud_pref = F.udf(cloud_pref)
udf_bi_pref = F.udf(bi_pref)

# %% [markdown]
# ## Leitura da Bronze e do dicionário de colunas

# %%
dicionario = spark.read.parquet(f"{BASE}/bronze/dicionario_colunas").collect()
COLUNA = {}  # (ano, codigo) -> nome da coluna na Bronze
ROTULO = {}
for r in dicionario:
    COLUNA.setdefault((r.ano_pesquisa, r.codigo), r.coluna)
    ROTULO[(r.ano_pesquisa, r.coluna)] = r.rotulo

bronze = {ano: spark.read.parquet(f"{BASE}/bronze/survey_{ano}") for ano in ANOS}


def itens_do_grupo(ano, categoria):
    prefixo = GRUPOS[categoria].get(ano)
    if not prefixo:
        return []
    padrao = re.compile(rf"^{prefixo}_\d+$")
    return [(r.coluna, item_canonico(categoria, r.rotulo)) for r in dicionario
            if r.ano_pesquisa == ano and padrao.match(r.codigo)]


# %% [markdown]
# ## Harmonização → `respondentes` e `respondente_itens`

# %%
def harmonizar(ano):
    df = bronze[ano]
    sel = [F.lit(ano).alias("ano_pesquisa")]
    for campo in CAMPOS:
        c = COLUNA.get((ano, codigo(campo, ano))) if codigo(campo, ano) else None
        sel.append((F.trim(F.col(c)) if c else F.lit(None).cast("string")).alias(campo))
    # flags: respondeu o bloco de múltipla escolha (denominador dos percentuais) + uso pessoal de IA
    for categoria in GRUPOS:
        itens = itens_do_grupo(ano, categoria)
        sel.append(reduce(lambda a, b: a | b, [F.col(c).isNotNull() for c, _ in itens]).alias(f"respondeu_{categoria}"))
    itens_arr = F.array(*[
        F.when(F.col(c).isin(VERDADEIRO), F.struct(F.lit(categoria).alias("categoria"), F.lit(nome).alias("item")))
        for categoria in GRUPOS for c, nome in itens_do_grupo(ano, categoria)])
    sel.append(F.filter(itens_arr, lambda x: x.isNotNull()).alias("_itens"))
    return df.select(*sel)


base = reduce(lambda a, b: a.unionByName(b), [harmonizar(a) for a in ANOS])

# deduplicação por (edição, token)
w = Window.partitionBy("ano_pesquisa", "id_origem").orderBy(F.lit(1))
base = (base.filter(F.col("id_origem").isNotNull())
        .withColumn("_rn", F.row_number().over(w)).filter("_rn = 1").drop("_rn")
        .withColumn("id_respondente", F.concat_ws("-", F.col("ano_pesquisa").cast("string"), "id_origem")))

faixa_df = spark.createDataFrame(
    [(orig, i + 1, curta, mn, mx, float(45000 if mn == 40001 else (mn + mx) / 2)) for i, (orig, curta, mn, mx) in enumerate(FAIXAS)],
    "faixa_salarial string, faixa_salarial_ordem int, faixa_salarial_curta string, salario_min int, salario_max int, salario_medio double")

is_gestor = F.col("gestor").isin(VERDADEIRO)
silver = (base.join(F.broadcast(faixa_df), "faixa_salarial", "left")
          .withColumn("idade", F.col("idade").cast("double").cast("int"))
          .withColumn("gestor", F.when(F.col("gestor").isNull(), None).otherwise(is_gestor))
          .withColumn("satisfeito", F.when(F.col("satisfeito").isNull(), None).otherwise(F.col("satisfeito").isin(VERDADEIRO)))
          .withColumn("cargo", F.when(F.col("gestor"), "Gestor(a)")
                      .when(F.col("cargo_original").isNotNull(), F.coalesce(mapa("cargo_original", CARGOS), F.lit("Outros"))))
          .withColumn("senioridade", F.when(F.col("gestor"), "Gestor(a)").otherwise(F.col("nivel")))
          .withColumn("tempo_experiencia_ordem", mapa("tempo_experiencia_dados", {k: v[0] for k, v in EXPERIENCIA.items()}).cast("int"))
          .withColumn("tempo_experiencia_dados", mapa("tempo_experiencia_dados", {k: v[1] for k, v in EXPERIENCIA.items()}))
          .withColumn("modelo_trabalho_atual", mapa("modelo_trabalho_atual", MODELO_TRABALHO))
          .withColumn("modelo_trabalho_ideal", mapa("modelo_trabalho_ideal", MODELO_TRABALHO))
          .withColumn("situacao_grupo", F.coalesce(mapa("situacao_trabalho", SITUACAO), F.lit("Outros/Não informado")))
          .withColumn("layoff", mapa("layoff", LAYOFF))
          .withColumn("porte_empresa", F.regexp_replace("porte_empresa", r"^de 501 a 100$", "de 501 a 1.000"))
          .withColumn("regiao", F.coalesce("regiao", F.lit("Exterior/Não informado")))
          .withColumn("ia_prioridade_empresa", udf_ia_prioridade("ia_prioridade_empresa"))
          .withColumn("ia_resultados_empresa", udf_ia_resultados("ia_resultados_empresa"))
          .withColumn("cloud_preferida", udf_cloud_pref("cloud_preferida"))
          .withColumn("bi_preferida", udf_bi_pref("bi_preferida"))
          .withColumn("linguagem_preferida", F.when(F.upper("linguagem_preferida") == "SQL", "SQL").otherwise(F.col("linguagem_preferida")))
          .withColumn("trabalha_na_area", F.col("cargo").isNotNull()))

for nome, chave in [("ia_nao_usa", "Não usa IA generativa"), ("ia_ferramenta_gratuita", "Usa ferramentas gratuitas"),
                    ("ia_paga_propria", "Paga do próprio bolso"), ("ia_empresa_paga", "Empresa paga a ferramenta"),
                    ("ia_copilot", "Usa copilots de código")]:
    silver = silver.withColumn(nome, F.when(F.col("respondeu_ia_uso_pessoal"),
                                            F.exists("_itens", lambda x: (x["categoria"] == "ia_uso_pessoal") & (x["item"] == chave))))

COLUNAS_SILVER = [
    "id_respondente", "id_origem", "idade", "faixa_idade", "genero", "cor_raca", "pcd", "uf", "regiao",
    "nivel_ensino", "area_formacao", "situacao_trabalho", "situacao_grupo", "trabalha_na_area", "setor", "porte_empresa",
    "gestor", "cargo_gestor", "cargo_original", "cargo", "nivel", "senioridade",
    "faixa_salarial", "faixa_salarial_curta", "faixa_salarial_ordem", "salario_min", "salario_max", "salario_medio",
    "tempo_experiencia_dados", "tempo_experiencia_ordem", "satisfeito", "planos_mudar_emprego", "layoff",
    "modelo_trabalho_atual", "modelo_trabalho_ideal",
    "ia_prioridade_empresa", "ia_resultados_empresa", "ia_nao_usa", "ia_ferramenta_gratuita", "ia_paga_propria",
    "ia_empresa_paga", "ia_copilot",
    "linguagem_preferida", "cloud_preferida", "bi_preferida",
] + [f"respondeu_{c}" for c in GRUPOS] + ["ano_pesquisa"]

silver = silver.cache()
respondentes = silver.select(*COLUNAS_SILVER)
itens = (silver.select("id_respondente", F.explode("_itens").alias("i"), "ano_pesquisa")
         .select("id_respondente", "i.categoria", "i.item", "ano_pesquisa"))


# %% [markdown]
# ## Gravação + catálogo

# %%
def salvar_tabela(df, camada, tabela, particoes=None):
    caminho = f"{BASE}/{camada}/{tabela}"
    if particoes:  # 1 arquivo por partição: evita milhares de arquivos pequenos no S3
        df = df.repartition(*particoes)
    writer = df.write.mode("overwrite").format("parquet").option("compression", "snappy")
    if particoes:
        writer = writer.partitionBy(*particoes)
    if IS_GLUE:
        spark.sql(f"CREATE DATABASE IF NOT EXISTS sod_{camada} LOCATION '{BASE}/{camada}/'")
        writer.option("path", caminho).saveAsTable(f"sod_{camada}.{tabela}")
    else:
        writer.save(caminho)
    print(f"  -> sod_{camada}.{tabela}: {df.count():,} linhas | {caminho}")


salvar_tabela(respondentes, "silver", "respondentes", ["ano_pesquisa"])
salvar_tabela(itens, "silver", "respondente_itens", ["ano_pesquisa"])

# %% [markdown]
# ## Checagens de qualidade da Silver

# %%
r = spark.read.parquet(f"{BASE}/silver/respondentes")
r.groupBy("ano_pesquisa").agg(
    F.count("*").alias("respondentes"),
    F.sum(F.col("trabalha_na_area").cast("int")).alias("atuam_em_dados"),
    F.round(F.avg(F.col("faixa_salarial").isNull().cast("int")) * 100, 1).alias("pct_sem_salario"),
    F.round(F.avg("salario_medio"), 0).alias("salario_medio"),
).orderBy("ano_pesquisa").show()

print("Faixas salariais não mapeadas (devem ser só valores inválidos/raros):")
(r.filter(F.col("faixa_salarial").isNotNull() & F.col("salario_medio").isNull())
 .groupBy("ano_pesquisa", "faixa_salarial").count().show(truncate=False))

r.groupBy("cargo").pivot("ano_pesquisa").count().orderBy(F.desc("2024")).show(truncate=False)
spark.read.parquet(f"{BASE}/silver/respondente_itens").groupBy("categoria").pivot("ano_pesquisa").count().show()
