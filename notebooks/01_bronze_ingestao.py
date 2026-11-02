# %% [markdown]
# # 01 · Bronze — ingestão das pesquisas State of Data Brasil
#
# **Tech Challenge Fase 3 · FIAP Pós Tech DTAT**
#
# Lê os CSVs brutos das 3 edições mais recentes da pesquisa *State of Data Brasil* (Data Hackers),
# que já foram enviados para a zona `raw/` do S3, e grava a **camada Bronze**:
#
# | Saída | Conteúdo |
# |---|---|
# | `sod_bronze.survey_2023`, `survey_2024`, `survey_2025` | Dado bruto em Parquet, uma tabela por edição (os esquemas mudam entre edições). Todas as colunas como `string`. |
# | `sod_bronze.dicionario_colunas` | Cabeçalho original → nome técnico, código da pergunta e rótulo. Base da harmonização na Silver. |
#
# Regras da Bronze: **nenhuma regra de negócio**. Só padronizamos os nomes das colunas
# (o CSV de 2023 usa tuplas como `('P2_h ', 'Faixa salarial')`, os de 2024/2025 usam `2.h_faixa_salarial`)
# e adicionamos colunas de auditoria (`_ingestion_ts`, `_source_file`).
#
# > O mesmo arquivo roda como **AWS Glue Job**, no **Glue Notebook** (Glue 5.0 · Spark 3.5) e localmente com PySpark.
# > As linhas `%...` abaixo são *magics* do Glue Interactive Sessions.

# %%
# %idle_timeout 60
# %glue_version 5.0
# %worker_type G.1X
# %number_of_workers 2

# %%
import os
import re
import unicodedata

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

    spark = (SparkSession.builder.appName("sod-01-bronze").master("local[*]")
             .config("spark.driver.memory", "4g")
             .config("spark.sql.session.timeZone", "America/Sao_Paulo")
             .config("spark.ui.showConsoleProgress", "false")
             .config("spark.sql.shuffle.partitions", "8")
             .getOrCreate())
    IS_GLUE = False

# >>> No AWS Academy, troque pelo nome do SEU bucket (o mesmo usado em scripts/01_ingestao_s3.sh)
BUCKET = os.environ.get("SOD_BUCKET", "tc-fase3-state-of-data-rm375453")  # S3 só aceita minúsculas
BASE = f"s3://{BUCKET}" if IS_GLUE else os.environ.get("SOD_LOCAL_BASE", "../data")

EDICOES = {  # ano_pesquisa -> pasta da zona raw
    2023: f"{BASE}/raw/edicao_2023/",
    2024: f"{BASE}/raw/edicao_2024/",
    2025: f"{BASE}/raw/edicao_2025/",
}
print("Glue:", IS_GLUE, "| base:", BASE, "| Spark", spark.version)


# %% [markdown]
# ## Funções de padronização de cabeçalho

# %%
def parse_cabecalho(cabecalho):
    """Separa o cabeçalho original em (codigo, rotulo). Ex.: ('P2_h ', 'Faixa salarial') -> ('2_h', 'Faixa salarial')."""
    h = cabecalho.strip()
    if h.startswith("("):  # formato 2023: tupla serializada
        m = (re.match(r"\('([^']+)',\s*['\"](.*)['\"]\)\s*$", h)
             or re.match(r"\('([^']+)',\s*['\"]?(.*?)\)?\s*$", h))  # 1 cabeçalho de 2023 vem sem a aspa final
        codigo, rotulo = m.group(1).strip().lstrip("P"), m.group(2)
    else:  # formato 2024/2025: 2.h_faixa_salarial | 4.m.1 Não uso ...
        m = re.match(r"([\d\.a-z]+)[ _](.*)", h)
        codigo, rotulo = (m.group(1), m.group(2)) if m else (h, "")
    codigo = codigo.replace(".", "_").strip("_").lower()
    return codigo, rotulo.strip()


def slug(texto, tamanho=40):
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "_", t).strip("_")[:tamanho].strip("_")


def nomes_tecnicos(cabecalhos):
    """Gera nomes únicos, minúsculos e compatíveis com Glue/Athena: p<codigo>__<rotulo>."""
    usados, linhas = set(), []
    for original in cabecalhos:
        codigo, rotulo = parse_cabecalho(original)
        base = f"p{codigo}__{slug(rotulo)}" if slug(rotulo) else f"p{codigo}"
        nome, i = base, 2
        while nome in usados:
            nome, i = f"{base}_{i}", i + 1
        usados.add(nome)
        linhas.append((nome, original, codigo, rotulo))
    return linhas


print(nomes_tecnicos(["('P2_h ', 'Faixa salarial')", "4.m.1 Não uso soluções de AI Generativa", "1.i.2_regiao_onde_mora"]))


# %% [markdown]
# ## Leitura dos CSVs e gravação da Bronze

# %%
def salvar_tabela(df, camada, tabela, particoes=None):
    """Grava Parquet no S3 e registra/atualiza a tabela no Glue Data Catalog (database sod_<camada>)."""
    caminho = f"{BASE}/{camada}/{tabela}"
    writer = df.write.mode("overwrite").format("parquet").option("compression", "snappy")
    if particoes:
        writer = writer.partitionBy(*particoes)
    if IS_GLUE:
        spark.sql(f"CREATE DATABASE IF NOT EXISTS sod_{camada} LOCATION '{BASE}/{camada}/'")
        writer.option("path", caminho).saveAsTable(f"sod_{camada}.{tabela}")
    else:
        writer.save(caminho)
    print(f"  -> sod_{camada}.{tabela}: {df.count():,} linhas | {caminho}")


dicionario = []
for ano, pasta in EDICOES.items():
    bruto = (spark.read
             .option("header", True)
             .option("multiLine", True)      # há respostas abertas com quebra de linha
             .option("quote", '"').option("escape", '"')
             .option("inferSchema", False)  # Bronze guarda tudo como string
             .option("encoding", "UTF-8")
             .csv(pasta))
    mapa = nomes_tecnicos(bruto.columns)
    df = (bruto.toDF(*[m[0] for m in mapa])
          .withColumn("ano_pesquisa", F.lit(ano))
          .withColumn("_source_file", F.input_file_name())
          .withColumn("_ingestion_ts", F.current_timestamp()))
    print(f"Edição {ano}: {len(mapa)} colunas")
    salvar_tabela(df, "bronze", f"survey_{ano}")
    dicionario += [(ano, nome, original, codigo, rotulo) for nome, original, codigo, rotulo in mapa]

dic_df = spark.createDataFrame(dicionario, "ano_pesquisa int, coluna string, cabecalho_original string, codigo string, rotulo string")
salvar_tabela(dic_df, "bronze", "dicionario_colunas")

# %% [markdown]
# ## Qualidade da ingestão
# Contagem de linhas por edição (esperado: 5.293 · 5.217 · 3.495) e duplicidade do identificador do respondente.

# %%
ID_COL = {2023: "p0__id", 2024: "p0_a__token", 2025: "p0_a__token"}
for ano in EDICOES:
    df = spark.read.parquet(f"{BASE}/bronze/survey_{ano}")
    total, distintos = df.count(), df.select(ID_COL[ano]).distinct().count()
    print(f"{ano}: linhas={total:,} ids_distintos={distintos:,} colunas={len(df.columns)}")

dic_df.groupBy("ano_pesquisa").count().orderBy("ano_pesquisa").show()
