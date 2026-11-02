# %% [markdown]
# # 03 · Gold — indicadores analíticos para as perguntas de negócio
#
# Agregações em **Spark SQL** sobre a Silver, uma tabela por pergunta do desafio:
#
# | Tabela `sod_gold.*` | Pergunta que responde |
# |---|---|
# | `kpis_ano` | Visão geral por edição (big numbers do material executivo) |
# | `distribuicao_perfil` | Como o mercado de dados está estruturado (cargo, senioridade, setor, porte, região, formação…) |
# | `salario_cargo_senioridade` | Quais perfis são mais valorizados |
# | `diversidade_genero` | Panorama de diversidade de gênero (representatividade e diferença salarial) |
# | `adocao_tecnologias` | Tecnologias com maior adoção (linguagens, bancos, cloud, BI) |
# | `adocao_ia` · `ia_impacto` | Taxa de adoção de IA e seu impacto |
# | `regiao_modelo_trabalho` · `modelo_trabalho` | Diferenças por região, senioridade e modelo de trabalho |
# | `comparativo_financas` | Recorte do cliente: setor financeiro vs. demais setores |
#
# Premissa salarial: `salario_medio` é o ponto médio da faixa declarada (estimativa). Base salarial = quem atua na área
# de dados (tem cargo) e informou faixa salarial.

# %%
# %idle_timeout 60
# %glue_version 5.0
# %worker_type G.1X
# %number_of_workers 2

# %%
import os

try:  # AWS Glue
    from awsglue.context import GlueContext
    from pyspark.context import SparkContext

    sc = SparkContext.getOrCreate()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    IS_GLUE = True
except ImportError:  # execução local (PySpark puro)
    from pyspark.sql import SparkSession

    spark = (SparkSession.builder.appName("sod-03-gold").master("local[*]")
             .config("spark.driver.memory", "4g")
             .config("spark.ui.showConsoleProgress", "false")
             .config("spark.sql.shuffle.partitions", "8")
             .getOrCreate())
    IS_GLUE = False

BUCKET = os.environ.get("SOD_BUCKET", "tc-fase3-state-of-data-rm375453")  # S3 só aceita minúsculas
BASE = f"s3://{BUCKET}" if IS_GLUE else os.environ.get("SOD_LOCAL_BASE", "../data")

spark.read.parquet(f"{BASE}/silver/respondentes").createOrReplaceTempView("respondentes")
spark.read.parquet(f"{BASE}/silver/respondente_itens").createOrReplaceTempView("itens")

# base salarial: atua na área de dados e informou faixa salarial
spark.sql("""
    SELECT * FROM respondentes
    WHERE trabalha_na_area AND salario_medio IS NOT NULL
""").createOrReplaceTempView("base_salarial")


def salvar_tabela(df, tabela):
    caminho = f"{BASE}/gold/{tabela}"
    writer = df.coalesce(1).write.mode("overwrite").format("parquet").option("compression", "snappy")
    if IS_GLUE:
        spark.sql(f"CREATE DATABASE IF NOT EXISTS sod_gold LOCATION '{BASE}/gold/'")
        writer.option("path", caminho).saveAsTable(f"sod_gold.{tabela}")
    else:
        writer.save(caminho)
    print(f"  -> sod_gold.{tabela}: {df.count():,} linhas")


# %% [markdown]
# ## KPIs por edição

# %%
kpis = spark.sql("""
SELECT r.ano_pesquisa,
       COUNT(*)                                                                   AS respondentes,
       SUM(CASE WHEN trabalha_na_area THEN 1 ELSE 0 END)                          AS atuam_em_dados,
       ROUND(100 * AVG(CASE WHEN genero = 'Feminino' THEN 1.0 ELSE 0 END), 1)     AS pct_mulheres,
       ROUND(100 * AVG(CASE WHEN gestor THEN 1.0 WHEN gestor = false THEN 0 END), 1) AS pct_gestores,
       ROUND(100 * AVG(CASE WHEN setor = 'Finanças ou Bancos' THEN 1.0 WHEN setor IS NOT NULL THEN 0 END), 1) AS pct_financas,
       ROUND(100 * AVG(CASE WHEN modelo_trabalho_atual = '100% remoto' THEN 1.0
                            WHEN modelo_trabalho_atual IS NOT NULL THEN 0 END), 1) AS pct_remoto,
       ROUND(100 * AVG(CASE WHEN ia_nao_usa THEN 0 WHEN ia_nao_usa = false THEN 1.0 END), 1) AS pct_usa_ia_generativa,
       ROUND(100 * AVG(CASE WHEN ia_empresa_paga THEN 1.0 WHEN ia_empresa_paga = false THEN 0 END), 1) AS pct_empresa_paga_ia,
       ROUND(100 * AVG(CASE WHEN satisfeito THEN 1.0 WHEN satisfeito = false THEN 0 END), 1) AS pct_satisfeitos,
       s.salario_medio, s.salario_mediano
FROM respondentes r
JOIN (SELECT ano_pesquisa, ROUND(AVG(salario_medio), 0) AS salario_medio,
             percentile_approx(salario_medio, 0.5) AS salario_mediano
      FROM base_salarial GROUP BY ano_pesquisa) s ON s.ano_pesquisa = r.ano_pesquisa
GROUP BY r.ano_pesquisa, s.salario_medio, s.salario_mediano
ORDER BY r.ano_pesquisa
""")
salvar_tabela(kpis, "kpis_ano")
kpis.show(truncate=False)

# %% [markdown]
# ## Estrutura do mercado — distribuição por dimensão (formato longo)

# %%
DIMENSOES = ["cargo", "senioridade", "setor", "porte_empresa", "regiao", "situacao_grupo", "nivel_ensino",
             "faixa_idade", "tempo_experiencia_dados", "genero", "faixa_salarial_curta"]
union_sql = "\nUNION ALL\n".join(
    f"SELECT ano_pesquisa, '{d}' AS dimensao, CAST({d} AS STRING) AS categoria FROM respondentes WHERE {d} IS NOT NULL"
    for d in DIMENSOES)
spark.sql(union_sql).createOrReplaceTempView("dim_long")
distribuicao = spark.sql("""
SELECT ano_pesquisa, dimensao, categoria, COUNT(*) AS n,
       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY ano_pesquisa, dimensao), 2) AS pct
FROM dim_long
GROUP BY ano_pesquisa, dimensao, categoria
""")
salvar_tabela(distribuicao, "distribuicao_perfil")

# %% [markdown]
# ## Perfis mais valorizados — salário por cargo × senioridade

# %%
salarios = spark.sql("""
SELECT ano_pesquisa, cargo,
       CASE WHEN grouping(senioridade) = 1 THEN 'Todos' ELSE COALESCE(senioridade, 'Não informado') END AS senioridade,
       COUNT(*)                                   AS n,
       ROUND(AVG(salario_medio), 0)               AS salario_medio,
       percentile_approx(salario_medio, 0.5)      AS salario_mediano,
       ROUND(100 * AVG(CASE WHEN salario_min >= 20001 THEN 1.0 ELSE 0 END), 1) AS pct_acima_20k
FROM base_salarial
GROUP BY GROUPING SETS ((ano_pesquisa, cargo, senioridade), (ano_pesquisa, cargo))
""")
salvar_tabela(salarios, "salario_cargo_senioridade")
salarios.filter("ano_pesquisa = 2025 AND senioridade = 'Todos'").orderBy("salario_medio", ascending=False).show(truncate=False)

# %% [markdown]
# ## Diversidade de gênero — representatividade e diferença salarial

# %%
diversidade = spark.sql("""
WITH b AS (
  SELECT ano_pesquisa, 'Total' AS dimensao, 'Total' AS categoria, genero, salario_medio, trabalha_na_area FROM respondentes
  UNION ALL SELECT ano_pesquisa, 'senioridade', senioridade, genero, salario_medio, trabalha_na_area FROM respondentes WHERE senioridade IS NOT NULL
  UNION ALL SELECT ano_pesquisa, 'cargo', cargo, genero, salario_medio, trabalha_na_area FROM respondentes WHERE cargo IS NOT NULL
  UNION ALL SELECT ano_pesquisa, 'regiao', regiao, genero, salario_medio, trabalha_na_area FROM respondentes
)
SELECT ano_pesquisa, dimensao, categoria,
       COUNT(*)                                                         AS n_total,
       SUM(CASE WHEN genero = 'Feminino' THEN 1 ELSE 0 END)              AS n_mulheres,
       ROUND(100 * AVG(CASE WHEN genero = 'Feminino' THEN 1.0 ELSE 0 END), 1) AS pct_mulheres,
       ROUND(AVG(CASE WHEN genero = 'Masculino' AND trabalha_na_area THEN salario_medio END), 0) AS salario_medio_homens,
       ROUND(AVG(CASE WHEN genero = 'Feminino'  AND trabalha_na_area THEN salario_medio END), 0) AS salario_medio_mulheres,
       ROUND(100 * (1 - AVG(CASE WHEN genero = 'Feminino' AND trabalha_na_area THEN salario_medio END)
                      / AVG(CASE WHEN genero = 'Masculino' AND trabalha_na_area THEN salario_medio END)), 1) AS gap_salarial_pct
FROM b
GROUP BY ano_pesquisa, dimensao, categoria
""")
salvar_tabela(diversidade, "diversidade_genero")
diversidade.filter("dimensao IN ('Total', 'senioridade')").orderBy("dimensao", "categoria", "ano_pesquisa").show(30, truncate=False)

# %% [markdown]
# ## Adoção de tecnologias (% de quem respondeu o bloco)

# %%
adocao_tec = spark.sql("""
WITH base AS (
  SELECT ano_pesquisa, 'linguagem' AS categoria, SUM(CAST(respondeu_linguagem AS INT)) AS base FROM respondentes GROUP BY ano_pesquisa
  UNION ALL SELECT ano_pesquisa, 'banco_dados', SUM(CAST(respondeu_banco_dados AS INT)) FROM respondentes GROUP BY ano_pesquisa
  UNION ALL SELECT ano_pesquisa, 'cloud', SUM(CAST(respondeu_cloud AS INT)) FROM respondentes GROUP BY ano_pesquisa
  UNION ALL SELECT ano_pesquisa, 'bi', SUM(CAST(respondeu_bi AS INT)) FROM respondentes GROUP BY ano_pesquisa
)
SELECT i.ano_pesquisa, i.categoria, i.item, COUNT(*) AS n_usuarios, b.base AS base_respondentes,
       ROUND(100 * COUNT(*) / b.base, 1) AS pct_adocao,
       RANK() OVER (PARTITION BY i.ano_pesquisa, i.categoria ORDER BY COUNT(*) DESC) AS ranking
FROM itens i JOIN base b ON b.ano_pesquisa = i.ano_pesquisa AND b.categoria = i.categoria
GROUP BY i.ano_pesquisa, i.categoria, i.item, b.base
""")
salvar_tabela(adocao_tec, "adocao_tecnologias")
adocao_tec.filter("ranking <= 5").orderBy("categoria", "ano_pesquisa", "ranking").show(60, truncate=False)

# %% [markdown]
# ## Adoção de IA generativa — uso pessoal, postura das empresas e resultados

# %%
adocao_ia = spark.sql("""
-- uso pessoal (múltipla escolha) e tipos de uso nas empresas (múltipla escolha)
SELECT i.ano_pesquisa, i.categoria AS indicador, i.item AS resposta, COUNT(*) AS n, b.base,
       ROUND(100 * COUNT(*) / b.base, 1) AS pct
FROM itens i
JOIN (SELECT ano_pesquisa, 'ia_uso_pessoal' AS categoria, SUM(CAST(respondeu_ia_uso_pessoal AS INT)) AS base
      FROM respondentes GROUP BY ano_pesquisa
      UNION ALL
      SELECT ano_pesquisa, 'ia_uso_empresa', SUM(CAST(respondeu_ia_uso_empresa AS INT))
      FROM respondentes GROUP BY ano_pesquisa) b ON b.ano_pesquisa = i.ano_pesquisa AND b.categoria = i.categoria
GROUP BY i.ano_pesquisa, i.categoria, i.item, b.base
UNION ALL
-- prioridade de IA na empresa (pergunta para gestores) e resultados (2025)
SELECT ano_pesquisa, indicador, resposta, n, SUM(n) OVER (PARTITION BY ano_pesquisa, indicador) AS base,
       ROUND(100 * n / SUM(n) OVER (PARTITION BY ano_pesquisa, indicador), 1) AS pct
FROM (
  SELECT ano_pesquisa, 'ia_prioridade_empresa' AS indicador, ia_prioridade_empresa AS resposta, COUNT(*) AS n
  FROM respondentes WHERE ia_prioridade_empresa IS NOT NULL GROUP BY ano_pesquisa, ia_prioridade_empresa
  UNION ALL
  SELECT ano_pesquisa, 'ia_resultados_empresa', ia_resultados_empresa, COUNT(*)
  FROM respondentes WHERE ia_resultados_empresa IS NOT NULL GROUP BY ano_pesquisa, ia_resultados_empresa
) t
""")
salvar_tabela(adocao_ia, "adocao_ia")
adocao_ia.filter("indicador = 'ia_uso_pessoal'").orderBy("resposta", "ano_pesquisa").show(truncate=False)

# impacto: perfil de quem usa IA paga pela empresa vs. quem não usa / usa por conta própria
ia_impacto = spark.sql("""
SELECT ano_pesquisa,
       CASE WHEN ia_empresa_paga THEN '1. Empresa fornece IA'
            WHEN ia_nao_usa      THEN '3. Não usa IA'
            ELSE '2. Usa IA por conta própria' END AS perfil_uso_ia,
       COUNT(*) AS n,
       ROUND(AVG(salario_medio), 0) AS salario_medio,
       ROUND(100 * AVG(CASE WHEN satisfeito THEN 1.0 WHEN satisfeito = false THEN 0 END), 1) AS pct_satisfeitos,
       ROUND(100 * AVG(CASE WHEN senioridade IN ('Sênior', 'Especialista/Staff+', 'Gestor(a)') THEN 1.0 ELSE 0 END), 1) AS pct_senior_ou_gestor,
       ROUND(100 * AVG(CASE WHEN planos_mudar_emprego LIKE 'Estou em busca%' THEN 1.0
                            WHEN planos_mudar_emprego IS NOT NULL THEN 0 END), 1) AS pct_buscando_emprego
FROM respondentes
WHERE trabalha_na_area AND respondeu_ia_uso_pessoal
GROUP BY 1, 2
""")
salvar_tabela(ia_impacto, "ia_impacto")
ia_impacto.orderBy("ano_pesquisa", "perfil_uso_ia").show(truncate=False)

# %% [markdown]
# ## Região, senioridade e modelo de trabalho

# %%
regiao = spark.sql("""
SELECT ano_pesquisa, regiao, senioridade, n, salario_medio, pct_remoto, pct_presencial
FROM (
  SELECT ano_pesquisa, regiao, CASE WHEN grouping(senioridade) = 1 THEN 'Todos' ELSE senioridade END AS senioridade, COUNT(*) AS n, ROUND(AVG(salario_medio), 0) AS salario_medio,
         ROUND(100 * AVG(CASE WHEN modelo_trabalho_atual = '100% remoto' THEN 1.0 ELSE 0 END), 1) AS pct_remoto,
         ROUND(100 * AVG(CASE WHEN modelo_trabalho_atual = '100% presencial' THEN 1.0 ELSE 0 END), 1) AS pct_presencial
  FROM base_salarial
  WHERE senioridade IN ('Júnior', 'Pleno', 'Sênior', 'Especialista/Staff+', 'Gestor(a)')
  GROUP BY GROUPING SETS ((ano_pesquisa, regiao, senioridade), (ano_pesquisa, regiao))
)
""")
salvar_tabela(regiao, "regiao_modelo_trabalho")
regiao.filter("ano_pesquisa = 2025 AND senioridade = 'Todos'").orderBy("salario_medio", ascending=False).show(truncate=False)

modelo = spark.sql("""
SELECT ano_pesquisa, tipo, modelo, senioridade, n,
       ROUND(100 * n / SUM(n) OVER (PARTITION BY ano_pesquisa, tipo, senioridade), 1) AS pct, salario_medio
FROM (
  SELECT ano_pesquisa, tipo, modelo,
         CASE WHEN grouping(senioridade) = 1 THEN 'Todos' ELSE COALESCE(senioridade, 'Não informado') END AS senioridade,
         COUNT(*) AS n, ROUND(AVG(salario_medio), 0) AS salario_medio
  FROM (
    SELECT ano_pesquisa, 'atual' AS tipo, modelo_trabalho_atual AS modelo, senioridade, salario_medio FROM respondentes
    WHERE modelo_trabalho_atual IS NOT NULL
    UNION ALL
    SELECT ano_pesquisa, 'ideal', modelo_trabalho_ideal, senioridade, salario_medio FROM respondentes
    WHERE modelo_trabalho_ideal IS NOT NULL
  )
  GROUP BY GROUPING SETS ((ano_pesquisa, tipo, modelo, senioridade), (ano_pesquisa, tipo, modelo))
)
""")
salvar_tabela(modelo, "modelo_trabalho")
modelo.filter("senioridade = 'Todos'").orderBy("ano_pesquisa", "tipo", "modelo").show(30, truncate=False)

# %% [markdown]
# ## Recorte do cliente — setor financeiro vs. demais setores
# O cliente é uma grande instituição financeira: comparamos o profissional de dados de Finanças/Bancos com o restante do mercado.

# %%
financas = spark.sql("""
SELECT ano_pesquisa,
       CASE WHEN setor = 'Finanças ou Bancos' THEN 'Finanças ou Bancos' ELSE 'Demais setores' END AS grupo,
       COUNT(*) AS n,
       ROUND(AVG(salario_medio), 0) AS salario_medio,
       ROUND(100 * AVG(CASE WHEN genero = 'Feminino' THEN 1.0 ELSE 0 END), 1) AS pct_mulheres,
       ROUND(100 * AVG(CASE WHEN senioridade IN ('Sênior', 'Especialista/Staff+', 'Gestor(a)') THEN 1.0 ELSE 0 END), 1) AS pct_senior_ou_gestor,
       ROUND(100 * AVG(CASE WHEN ia_nao_usa THEN 0 WHEN ia_nao_usa = false THEN 1.0 END), 1) AS pct_usa_ia_generativa,
       ROUND(100 * AVG(CASE WHEN ia_empresa_paga THEN 1.0 WHEN ia_empresa_paga = false THEN 0 END), 1) AS pct_empresa_paga_ia,
       ROUND(100 * AVG(CASE WHEN modelo_trabalho_atual = '100% remoto' THEN 1.0
                            WHEN modelo_trabalho_atual IS NOT NULL THEN 0 END), 1) AS pct_remoto,
       ROUND(100 * AVG(CASE WHEN modelo_trabalho_atual = '100% presencial' THEN 1.0
                            WHEN modelo_trabalho_atual IS NOT NULL THEN 0 END), 1) AS pct_presencial,
       ROUND(100 * AVG(CASE WHEN satisfeito THEN 1.0 WHEN satisfeito = false THEN 0 END), 1) AS pct_satisfeitos,
       ROUND(100 * AVG(CASE WHEN planos_mudar_emprego LIKE 'Estou em busca%' THEN 1.0
                            WHEN planos_mudar_emprego IS NOT NULL THEN 0 END), 1) AS pct_buscando_emprego
FROM respondentes
WHERE trabalha_na_area AND setor IS NOT NULL
GROUP BY 1, 2
""")
salvar_tabela(financas, "comparativo_financas")
financas.orderBy("ano_pesquisa", "grupo").show(truncate=False)
