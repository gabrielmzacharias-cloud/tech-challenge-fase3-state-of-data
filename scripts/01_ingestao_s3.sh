#!/usr/bin/env bash
# Ingestão na zona RAW do S3 (AWS Academy Learner Lab · us-east-1).
#
# Pré-requisitos:
#   1. Lab iniciado (bolinha verde) e credenciais de "AWS Details > AWS CLI" coladas em ~/.aws/credentials
#      (ou rode este script no CloudShell do console, que já vem autenticado).
#   2. CSVs baixados do Kaggle em data/raw/edicao_2023, edicao_2024, edicao_2025
#      (kaggle datasets download -d datahackers/<slug> --unzip; slugs: state-of-data-brazil-2023,
#       state-of-data-brazil-20242025 e state-of-data-brazil-2025-2026).
#
# Uso:  SOD_BUCKET=tc-fase3-state-of-data-rm12345 bash scripts/01_ingestao_s3.sh
set -euo pipefail

BUCKET="${SOD_BUCKET:?defina SOD_BUCKET com um nome de bucket único, ex.: tc-fase3-state-of-data-<seu-rm>}"
REGIAO="${AWS_DEFAULT_REGION:-us-east-1}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"

aws sts get-caller-identity --query Arn --output text   # confirma que as credenciais do Lab estão válidas

if ! aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  aws s3 mb "s3://$BUCKET" --region "$REGIAO"
fi

# zonas do data lake (prefixos vazios só para deixar a estrutura visível no console)
for zona in raw bronze silver gold athena-results output scripts; do
  aws s3api put-object --bucket "$BUCKET" --key "$zona/" >/dev/null
done

# RAW: arquivo original, sem alteração, uma pasta por edição
for ano in 2023 2024 2025; do
  aws s3 cp "$RAIZ/data/raw/edicao_$ano/" "s3://$BUCKET/raw/edicao_$ano/" --recursive --exclude "*" --include "*.csv"
done

# notebooks/SQL ficam versionados junto do dado, para o Glue Job apontar o script
aws s3 cp "$RAIZ/notebooks/" "s3://$BUCKET/scripts/" --recursive --exclude "*" --include "*.py"

aws s3 ls "s3://$BUCKET/raw/" --recursive --human-readable --summarize
