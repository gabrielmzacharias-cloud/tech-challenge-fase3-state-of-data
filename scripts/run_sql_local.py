"""Valida localmente o SQL do Athena com DuckDB, lendo as camadas Parquet geradas em data/.

Cada pasta data/<camada>/<tabela> vira uma view sod_<camada>.<tabela> (partições Hive incluídas),
então as consultas de sql/02_consultas_analiticas.sql rodam sem alteração.

Uso:  python scripts/run_sql_local.py [arquivo.sql]
"""
import re
import sys
from pathlib import Path

import duckdb

RAIZ = Path(__file__).resolve().parents[1]
arquivo = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "sql" / "02_consultas_analiticas.sql"

con = duckdb.connect()
for camada in ["bronze", "silver", "gold"]:
    con.execute(f"CREATE SCHEMA IF NOT EXISTS sod_{camada}")
    for pasta in sorted(p for p in (RAIZ / "data" / camada).glob("*") if p.is_dir()):
        caminho = (pasta / "**" / "*.parquet").as_posix()
        con.execute(f"CREATE VIEW sod_{camada}.{pasta.name} AS "
                    f"SELECT * FROM read_parquet('{caminho}', hive_partitioning = true)")

sql = arquivo.read_text(encoding="utf-8")
for bloco in [b for b in sql.split(";") if re.sub(r"--.*", "", b).strip()]:
    titulo = next((l.strip("- ").strip() for l in bloco.strip().splitlines() if l.startswith("-- Q")), "consulta")
    print(f"\n### {titulo}")
    print(con.sql(bloco).df().to_string(index=False, max_colwidth=45))
