"""Converte os notebooks-fonte (py:percent) em .ipynb para importar no AWS Glue Studio.

- `# %% [markdown]` vira célula markdown (sem o "# " inicial de cada linha);
- `# %%` vira célula de código;
- linhas `# %magic` (ex.: `# %glue_version 5.0`, `# %matplot plt`) são descomentadas, pois no Glue
  Interactive Sessions as magics precisam estar ativas.

Uso:  python scripts/build_notebooks.py   ->  notebooks/ipynb/*.ipynb
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
ORIGEM, DESTINO = RAIZ / "notebooks", RAIZ / "notebooks" / "ipynb"
MAGIC = re.compile(r"^# (%[a-z_]+.*)$")


def celulas(texto):
    blocos = re.split(r"^# %%(.*)$", texto, flags=re.M)
    # blocos = [prefixo, marcador1, corpo1, marcador2, corpo2, ...]
    for marcador, corpo in zip(blocos[1::2], blocos[2::2]):
        linhas = corpo.strip("\n").splitlines()
        if "[markdown]" in marcador:
            fonte = [re.sub(r"^# ?", "", l) for l in linhas]
            yield {"cell_type": "markdown", "metadata": {}, "source": fonte}
        else:
            fonte = [MAGIC.sub(r"\1", l) for l in linhas]
            yield {"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": fonte}


def notebook(cels):
    for c in cels:  # formato nbformat: cada linha termina com \n, exceto a última
        c["source"] = [l + "\n" for l in c["source"][:-1]] + c["source"][-1:]
    return {
        "cells": cels,
        "metadata": {
            "kernelspec": {"name": "glue_pyspark", "display_name": "Glue PySpark", "language": "python"},
            "language_info": {"name": "Python_Glue_Session", "mimetype": "text/x-python",
                              "codemirror_mode": {"name": "python", "version": 3}, "pygments_lexer": "python3",
                              "file_extension": ".py"},
        },
        "nbformat": 4, "nbformat_minor": 4,
    }


if __name__ == "__main__":
    DESTINO.mkdir(exist_ok=True)
    for arquivo in sorted(ORIGEM.glob("0*_*.py")):
        cels = list(celulas(arquivo.read_text(encoding="utf-8")))
        saida = DESTINO / f"{arquivo.stem}.ipynb"
        saida.write_text(json.dumps(notebook(cels), ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{saida.relative_to(RAIZ)}: {len(cels)} células")
