#!/usr/bin/env bash
# Executa o pipeline localmente (PySpark 3.5 + Python 3.11, mesma combinação do Glue 5.0).
# Uso (WSL/Linux):  bash scripts/run_local.sh [01 02 03 04]
# Pré-requisitos: JAVA_HOME com JDK 17 e um Python com pyspark==3.5.*, pandas, pyarrow, matplotlib.
#
# No WSL, gravar em /mnt/c é muito lento; por isso o pipeline roda numa cópia em disco nativo
# (SOD_WORK, padrão ~/tc3) e as camadas/gráficos são copiados de volta para data/ e output/.
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PY="${SOD_PYTHON:-$HOME/sparkenv/.venv/bin/python}"
TRABALHO="${SOD_WORK:-$HOME/tc3}"
export JAVA_HOME="${JAVA_HOME:-$HOME/sparkenv/jdk-17.0.21+9}"
export PYSPARK_PYTHON="$PY" PYSPARK_DRIVER_PYTHON="$PY" PYTHONUNBUFFERED=1
export SOD_LOCAL_BASE="$TRABALHO/data"
export SOD_OUTPUT="$TRABALHO/output"

mkdir -p "$SOD_LOCAL_BASE" "$SOD_OUTPUT"
cp -ru "$RAIZ/data/raw" "$SOD_LOCAL_BASE/"
for camada in bronze silver gold; do  # reaproveita camadas já geradas ao rodar etapas isoladas
  [ -d "$RAIZ/data/$camada" ] && [ ! -d "$SOD_LOCAL_BASE/$camada" ] && cp -r "$RAIZ/data/$camada" "$SOD_LOCAL_BASE/"
done

ETAPAS=("${@:-01 02 03 04}")
cd "$RAIZ/notebooks"
for etapa in ${ETAPAS[@]}; do
  arquivo=$(ls ${etapa}_*.py)
  echo "=================== $arquivo"
  "$PY" "$arquivo" 2>&1 | grep -v -E "WARN|^Setting default log level|^To adjust logging|NativeCodeLoader"
done

for camada in bronze silver gold; do
  [ -d "$SOD_LOCAL_BASE/$camada" ] && rm -rf "$RAIZ/data/$camada" && cp -r "$SOD_LOCAL_BASE/$camada" "$RAIZ/data/"
done
mkdir -p "$RAIZ/output" && cp -r "$SOD_OUTPUT/." "$RAIZ/output/"
echo "camadas copiadas para $RAIZ/data e gráficos para $RAIZ/output"
