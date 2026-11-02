-- =====================================================================================
-- Tech Challenge Fase 3 · Consultas analíticas no Amazon Athena (engine v3)
-- Databases criados pelos notebooks Glue: sod_bronze, sod_silver, sod_gold
-- Antes de rodar: Athena > Settings > Query result location = s3://<bucket>/athena-results/
-- (o mesmo SQL é validado localmente com DuckDB: python scripts/run_sql_local.py)
-- =====================================================================================

-- Q0 · Qualidade: volume por edição e por camada
SELECT ano_pesquisa, COUNT(*) AS respondentes,
       SUM(CASE WHEN trabalha_na_area THEN 1 ELSE 0 END) AS atuam_em_dados,
       SUM(CASE WHEN salario_medio IS NOT NULL THEN 1 ELSE 0 END) AS informaram_salario
FROM sod_silver.respondentes
GROUP BY ano_pesquisa
ORDER BY ano_pesquisa;

-- Q1 · Estrutura do mercado: big numbers por edição
SELECT * FROM sod_gold.kpis_ano ORDER BY ano_pesquisa;

-- Q1b · Estrutura do mercado: cargos e senioridade em 2025
SELECT dimensao, categoria, n, pct
FROM sod_gold.distribuicao_perfil
WHERE ano_pesquisa = 2025 AND dimensao IN ('cargo', 'senioridade', 'setor')
ORDER BY dimensao, pct DESC;

-- Q2 · Perfis mais valorizados: ranking de salário por cargo (2025, 30+ respostas)
SELECT cargo, n, salario_medio, salario_mediano, pct_acima_20k,
       RANK() OVER (ORDER BY salario_medio DESC) AS ranking
FROM sod_gold.salario_cargo_senioridade
WHERE ano_pesquisa = 2025 AND senioridade = 'Todos' AND n >= 30
ORDER BY ranking;

-- Q2b · Perfis mais valorizados: cargo x senioridade (direto da Silver, sem depender da Gold)
SELECT cargo, senioridade, COUNT(*) AS n, ROUND(AVG(salario_medio), 0) AS salario_medio
FROM sod_silver.respondentes
WHERE ano_pesquisa = 2025 AND trabalha_na_area AND salario_medio IS NOT NULL
  AND senioridade IN ('Júnior', 'Pleno', 'Sênior', 'Especialista/Staff+')
GROUP BY cargo, senioridade
HAVING COUNT(*) >= 20
ORDER BY salario_medio DESC
LIMIT 15;

-- Q3 · Diversidade de gênero: evolução e diferença salarial
SELECT ano_pesquisa, n_total, n_mulheres, pct_mulheres,
       salario_medio_homens, salario_medio_mulheres, gap_salarial_pct
FROM sod_gold.diversidade_genero
WHERE dimensao = 'Total'
ORDER BY ano_pesquisa;

-- Q3b · Diversidade por senioridade (2025)
SELECT categoria AS senioridade, n_total, pct_mulheres, gap_salarial_pct
FROM sod_gold.diversidade_genero
WHERE ano_pesquisa = 2025 AND dimensao = 'senioridade'
ORDER BY pct_mulheres DESC;

-- Q4 · Tecnologias: top 5 por categoria em 2025
SELECT categoria, ranking, item, pct_adocao
FROM sod_gold.adocao_tecnologias
WHERE ano_pesquisa = 2025 AND ranking <= 5
ORDER BY categoria, ranking;

-- Q4b · Tecnologias: evolução dos provedores de cloud
SELECT item AS provedor,
       MAX(CASE WHEN ano_pesquisa = 2023 THEN pct_adocao END) AS pct_2023,
       MAX(CASE WHEN ano_pesquisa = 2024 THEN pct_adocao END) AS pct_2024,
       MAX(CASE WHEN ano_pesquisa = 2025 THEN pct_adocao END) AS pct_2025
FROM sod_gold.adocao_tecnologias
WHERE categoria = 'cloud' AND item IN ('AWS', 'Azure', 'GCP')
GROUP BY item
ORDER BY pct_2025 DESC;

-- Q5 · IA: postura das empresas (visão dos gestores) por edição
SELECT ano_pesquisa, resposta, pct
FROM sod_gold.adocao_ia
WHERE indicador = 'ia_prioridade_empresa'
ORDER BY ano_pesquisa, resposta;

-- Q5b · IA: maturidade dos resultados em 2025
SELECT resposta, n, pct
FROM sod_gold.adocao_ia
WHERE ano_pesquisa = 2025 AND indicador = 'ia_resultados_empresa'
ORDER BY resposta;

-- Q5c · IA: impacto — perfil de quem tem IA fornecida pela empresa
SELECT ano_pesquisa, perfil_uso_ia, n, salario_medio, pct_senior_ou_gestor, pct_satisfeitos, pct_buscando_emprego
FROM sod_gold.ia_impacto
ORDER BY ano_pesquisa, perfil_uso_ia;

-- Q6 · Região: salário e trabalho remoto (2025)
SELECT regiao, n, salario_medio, pct_remoto, pct_presencial
FROM sod_gold.regiao_modelo_trabalho
WHERE ano_pesquisa = 2025 AND senioridade = 'Todos'
ORDER BY salario_medio DESC;

-- Q6b · Modelo de trabalho: atual vs. ideal (2025)
SELECT modelo,
       MAX(CASE WHEN tipo = 'atual' THEN pct END) AS pct_atual,
       MAX(CASE WHEN tipo = 'ideal' THEN pct END) AS pct_ideal
FROM sod_gold.modelo_trabalho
WHERE ano_pesquisa = 2025 AND senioridade = 'Todos'
GROUP BY modelo
ORDER BY pct_ideal DESC;

-- Q7 · Recorte do cliente: Finanças/Bancos vs. demais setores
SELECT *
FROM sod_gold.comparativo_financas
ORDER BY ano_pesquisa, grupo;

-- Q7b · Recorte do cliente: stack de cloud dos profissionais de Finanças em 2025 (Silver itens x respondentes)
SELECT i.item AS provedor, COUNT(*) AS n,
       ROUND(100.0 * COUNT(*) / MAX(b.base), 1) AS pct
FROM sod_silver.respondente_itens i
JOIN sod_silver.respondentes r ON r.id_respondente = i.id_respondente AND r.ano_pesquisa = i.ano_pesquisa
CROSS JOIN (SELECT COUNT(*) AS base FROM sod_silver.respondentes
            WHERE ano_pesquisa = 2025 AND setor = 'Finanças ou Bancos' AND respondeu_cloud) b
WHERE i.ano_pesquisa = 2025 AND i.categoria = 'cloud' AND r.setor = 'Finanças ou Bancos'
GROUP BY i.item
ORDER BY n DESC
LIMIT 8;
