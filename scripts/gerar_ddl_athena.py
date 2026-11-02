"""Gera sql/01_athena_ddl.sql (CREATE EXTERNAL TABLE + MSCK REPAIR) a partir dos Parquet de data/.

Os notebooks Glue já registram as tabelas no Glue Data Catalog via saveAsTable; este DDL é o plano B
(recriar o catálogo pelo Athena sem rodar os jobs de novo) e documenta o schema de cada camada.

Uso:  python scripts/gerar_ddl_athena.py
"""
from pathlib import Path

import duckdb

RAIZ = Path(__file__).resolve().parents[1]
TIPOS = {"VARCHAR": "string", "INTEGER": "int", "BIGINT": "bigint", "DOUBLE": "double", "BOOLEAN": "boolean"}

linhas = [
    "-- =====================================================================================",
    "-- Tech Challenge Fase 3 · DDL do Athena (gerado por scripts/gerar_ddl_athena.py)",
    "-- Plano B: os notebooks Glue já criam estas tabelas no Glue Catalog. Use este arquivo só se",
    "-- precisar recriar o catálogo. Troque <bucket> pelo nome do seu bucket antes de executar.",
    "-- =====================================================================================",
]
for camada in ["bronze", "silver", "gold"]:
    linhas += ["", f"CREATE DATABASE IF NOT EXISTS sod_{camada};"]
    for pasta in sorted(p for p in (RAIZ / "data" / camada).glob("*") if p.is_dir()):
        particoes = sorted({d.name.split("=")[0] for d in pasta.iterdir() if d.is_dir() and "=" in d.name})
        cols = duckdb.sql(f"DESCRIBE SELECT * FROM read_parquet('{(pasta / '**' / '*.parquet').as_posix()}', "
                          f"hive_partitioning = {str(bool(particoes)).lower()})").fetchall()
        defs = [f"  `{nome}` {TIPOS.get(tipo, tipo.lower())}" for nome, tipo, *_ in cols if nome not in particoes]
        linhas += ["", f"CREATE EXTERNAL TABLE IF NOT EXISTS sod_{camada}.{pasta.name} (", ",\n".join(defs), ")"]
        if particoes:
            linhas.append("PARTITIONED BY (" + ", ".join(f"`{p}` int" for p in particoes) + ")")
        linhas += ["STORED AS PARQUET", f"LOCATION 's3://<bucket>/{camada}/{pasta.name}/';"]
        if particoes:
            linhas.append(f"MSCK REPAIR TABLE sod_{camada}.{pasta.name};")

saida = RAIZ / "sql" / "01_athena_ddl.sql"
saida.write_text("\n".join(linhas) + "\n", encoding="utf-8")
print(f"{saida.relative_to(RAIZ)}: {sum(l.startswith('CREATE EXTERNAL') for l in linhas)} tabelas")
