"""Exporta as séries dos gráficos do deck a partir das tabelas Gold (data/gold/*).

O deck usa gráficos nativos do PowerPoint (pptxgenjs), por isso precisa dos números em JSON.
As seleções reproduzem exatamente as do notebook 04 (notebooks/04_analises_graficos.py), que gera as
mesmas figuras em PNG no AWS Glue.

Uso:   python scripts/exportar_dados_deck.py
Saída: entrega/assets/dados_deck.json
"""
import json
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[1]
GOLD = RAIZ / "data" / "gold"
SAIDA = RAIZ / "entrega" / "assets" / "dados_deck.json"

SENIORIDADE = ["Júnior", "Pleno", "Sênior", "Especialista/Staff+", "Gestor(a)"]
MODELOS = ["100% remoto", "Híbrido flexível", "Híbrido com dias fixos", "100% presencial"]
ANOS = [2023, 2024, 2025]


def ler(tabela):
    return pd.read_parquet(GOLD / tabela)


def lista(valores):
    return [None if pd.isna(v) else round(float(v), 1) for v in valores]


gold = {t: ler(t) for t in ["kpis_ano", "distribuicao_perfil", "salario_cargo_senioridade", "diversidade_genero",
                            "adocao_tecnologias", "adocao_ia", "ia_impacto", "regiao_modelo_trabalho",
                            "modelo_trabalho", "comparativo_financas"]}
dados = {}

# KPIs por edição
kpis = gold["kpis_ano"].sort_values("ano_pesquisa").set_index("ano_pesquisa")
dados["kpis"] = {str(a): {c: (round(float(v), 1) if isinstance(v, float) else int(v)) for c, v in kpis.loc[a].items()} for a in ANOS}

# 1 · Estrutura do mercado
dist = gold["distribuicao_perfil"]
cargos = dist.query("ano_pesquisa == 2025 and dimensao == 'cargo' and categoria != 'Outros'").sort_values("pct", ascending=False)
dados["cargos_2025"] = {"categorias": cargos["categoria"].tolist(), "pct": lista(cargos["pct"])}

sen = dist.query("dimensao == 'senioridade'").pivot_table(index="categoria", columns="ano_pesquisa", values="pct").reindex(SENIORIDADE)
dados["senioridade_ano"] = {"categorias": SENIORIDADE, "series": {str(a): lista(sen[a].fillna(0)) for a in ANOS}}

setores = dist.query("ano_pesquisa == 2025 and dimensao == 'setor'").sort_values("pct", ascending=False).head(10)
dados["setores_2025"] = {"categorias": setores["categoria"].tolist(), "pct": lista(setores["pct"])}

# 2 · Perfis valorizados
sal = gold["salario_cargo_senioridade"]
por_cargo = sal.query("ano_pesquisa == 2025 and senioridade == 'Todos' and n >= 30 and cargo != 'Outros'").sort_values("salario_medio", ascending=False)
dados["salario_cargo_2025"] = {"categorias": por_cargo["cargo"].tolist(), "mil": lista(por_cargo["salario_medio"] / 1000)}

r = gold["regiao_modelo_trabalho"].query("senioridade != 'Todos'").assign(peso=lambda d: d["salario_medio"] * d["n"])
soma = r.groupby(["senioridade", "ano_pesquisa"])[["peso", "n"]].sum()
base_sen = (soma["peso"] / soma["n"]).unstack().reindex(SENIORIDADE)
dados["salario_senioridade_ano"] = {"categorias": SENIORIDADE, "series": {str(a): lista(base_sen[a].fillna(0) / 1000) for a in ANOS}}

# 3 · Diversidade
div = gold["diversidade_genero"]
total = div.query("dimensao == 'Total'").sort_values("ano_pesquisa")
div_sen = div.query("ano_pesquisa == 2025 and dimensao == 'senioridade'").set_index("categoria").reindex(SENIORIDADE)
dados["genero"] = {
    "total": {str(a): {"pct_mulheres": round(float(p), 1), "gap": round(float(g), 1)}
              for a, p, g in zip(total["ano_pesquisa"], total["pct_mulheres"], total["gap_salarial_pct"])},
    "categorias": SENIORIDADE,
    "pct_mulheres": lista(div_sen["pct_mulheres"]),
    "gap": lista(div_sen["gap_salarial_pct"].clip(lower=0)),
    "gap_original": lista(div_sen["gap_salarial_pct"]),
}

# 4 · Tecnologias
tec = gold["adocao_tecnologias"]
dados["tecnologias_2025"] = {}
for cat, titulo in {"linguagem": "Linguagens", "banco_dados": "Bancos de dados", "cloud": "Cloud", "bi": "Ferramentas de BI"}.items():
    top = tec.query("ano_pesquisa == 2025 and categoria == @cat").sort_values("pct_adocao", ascending=False).head(6)
    dados["tecnologias_2025"][titulo] = {"categorias": top["item"].tolist(), "pct": lista(top["pct_adocao"])}

clouds = ["AWS", "Azure", "GCP"]
evol = tec.query("categoria == 'cloud' and item in @clouds").pivot(index="ano_pesquisa", columns="item", values="pct_adocao")
dados["cloud_evolucao"] = {"anos": [str(a) for a in evol.index], "series": {c: lista(evol[c]) for c in clouds}}

# 5 · IA
dados["ia_adocao"] = {"anos": [str(a) for a in ANOS],
                      "usa": lista(kpis.loc[ANOS, "pct_usa_ia_generativa"]),
                      "empresa_paga": lista(kpis.loc[ANOS, "pct_empresa_paga_ia"])}

ia = gold["adocao_ia"]
prior = ia.query("indicador == 'ia_prioridade_empresa'").pivot(index="ano_pesquisa", columns="resposta", values="pct").fillna(0)
prior = prior[sorted(prior.columns)]
dados["ia_prioridade"] = {"anos": [str(a) for a in prior.index],
                          "series": {c.split(". ", 1)[1]: lista(prior[c]) for c in prior.columns}}

res = ia.query("ano_pesquisa == 2025 and indicador == 'ia_resultados_empresa'").sort_values("resposta")
dados["ia_resultados_2025"] = {"categorias": [c.split(". ", 1)[1] for c in res["resposta"]], "pct": lista(res["pct"])}

imp = gold["ia_impacto"].query("ano_pesquisa == 2025").sort_values("perfil_uso_ia")
dados["ia_impacto_2025"] = {
    "perfis": [p.split(". ", 1)[1] for p in imp["perfil_uso_ia"]],
    "n": [int(v) for v in imp["n"]],
    "salario_mil": lista(imp["salario_medio"] / 1000),
    "pct_senior_ou_gestor": lista(imp["pct_senior_ou_gestor"]),
    "pct_satisfeitos": lista(imp["pct_satisfeitos"]),
    "pct_buscando_emprego": lista(imp["pct_buscando_emprego"]),
}

# 6 · Região e modelo de trabalho
reg = (gold["regiao_modelo_trabalho"]
       .query("ano_pesquisa == 2025 and senioridade == 'Todos' and n >= 30 and regiao != 'Exterior/Não informado'")
       .sort_values("salario_medio", ascending=False))
dados["regiao_2025"] = {"categorias": reg["regiao"].tolist(), "salario_mil": lista(reg["salario_medio"] / 1000), "pct_remoto": lista(reg["pct_remoto"])}

mod = gold["modelo_trabalho"].query("ano_pesquisa == 2025 and senioridade == 'Todos'").pivot(index="modelo", columns="tipo", values="pct").reindex(MODELOS)
dados["modelo_trabalho_2025"] = {"categorias": MODELOS, "atual": lista(mod["atual"]), "ideal": lista(mod["ideal"])}

# 7 · Finanças vs. mercado
fin = gold["comparativo_financas"].query("ano_pesquisa == 2025").set_index("grupo")
metricas = {"pct_usa_ia_generativa": "Usa IA generativa", "pct_empresa_paga_ia": "Empresa paga a IA",
            "pct_senior_ou_gestor": "Sênior, especialista ou gestor", "pct_remoto": "100% remoto",
            "pct_presencial": "100% presencial", "pct_mulheres": "Mulheres", "pct_buscando_emprego": "Buscando outro emprego"}
dados["financas_2025"] = {
    "categorias": list(metricas.values()),
    "financas": lista(fin.loc["Finanças ou Bancos", list(metricas)]),
    "demais": lista(fin.loc["Demais setores", list(metricas)]),
    "salario_financas": round(float(fin.loc["Finanças ou Bancos", "salario_medio"])),
    "salario_demais": round(float(fin.loc["Demais setores", "salario_medio"])),
    "satisfeitos_financas": round(float(fin.loc["Finanças ou Bancos", "pct_satisfeitos"]), 1),
    "satisfeitos_demais": round(float(fin.loc["Demais setores", "pct_satisfeitos"]), 1),
}

SAIDA.parent.mkdir(parents=True, exist_ok=True)
SAIDA.write_text(json.dumps(dados, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"{len(dados)} blocos gravados em {SAIDA.relative_to(RAIZ)}")
