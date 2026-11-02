"""Roda as consultas de sql/02_consultas_analiticas.sql no Amazon Athena, uma por vez.

Uso (CloudShell ou máquina com credenciais do Learner Lab):
    python3 run_athena.py <bucket> [arquivo.sql]

Cada consulta começa num comentário "-- Qx · ...". O resultado de cada uma fica em
s3://<bucket>/athena-results/ (CSV gerado pelo próprio Athena), e as primeiras linhas são impressas na tela.
"""
import re
import sys
import time

import boto3

bucket = sys.argv[1]
arquivo = sys.argv[2] if len(sys.argv) > 2 else "02_consultas_analiticas.sql"
athena = boto3.client("athena", region_name="us-east-1")
saida = f"s3://{bucket}/athena-results/"

sql = open(arquivo, encoding="utf-8").read()
blocos = re.split(r"^(?=-- Q\w+ ·)", sql, flags=re.M)[1:]

falhas = 0
for bloco in blocos:
    titulo = bloco.splitlines()[0].lstrip("- ").strip()
    consulta = "\n".join(l for l in bloco.splitlines() if not l.startswith("--")).strip().rstrip(";")
    qid = athena.start_query_execution(QueryString=consulta,
                                       ResultConfiguration={"OutputLocation": saida})["QueryExecutionId"]
    while True:
        st = athena.get_query_execution(QueryExecutionId=qid)["QueryExecution"]["Status"]
        if st["State"] in ("SUCCEEDED", "FAILED", "CANCELLED"):
            break
        time.sleep(1)
    print(f"\n=== {titulo} [{st['State']}] {qid}")
    if st["State"] != "SUCCEEDED":
        falhas += 1
        print("   ", st.get("StateChangeReason", ""))
        continue
    linhas = athena.get_query_results(QueryExecutionId=qid, MaxResults=8)["ResultSet"]["Rows"]
    for r in linhas:
        print("   ", " | ".join(c.get("VarCharValue", "") for c in r["Data"]))

print(f"\n{len(blocos)} consultas, {falhas} falha(s)")
