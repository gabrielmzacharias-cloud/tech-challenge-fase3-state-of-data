# Roteiro de execução no AWS Academy Learner Lab

Passo a passo para rodar o pipeline completo (S3 → Glue → Athena) na conta do Learner Lab.
Tempo estimado: **40 a 60 minutos**, a maior parte esperando sessões do Glue subirem.

> O Learner Lab encerra a sessão após ~4 horas e apaga credenciais temporárias. Se o lab cair no meio,
> basta iniciar de novo: o bucket e as tabelas continuam lá, e cada notebook pode ser reexecutado sozinho.

---

## 0. Antes de começar

| Item | Onde |
|---|---|
| CSVs das 3 edições | `data/raw/edicao_2023`, `edicao_2024`, `edicao_2025` (~41 MB no total) |
| Notebooks para o Glue | `notebooks/ipynb/01..04_*.ipynb` |
| Scripts para Glue Job (alternativa) | `notebooks/01..04_*.py` |
| SQL do Athena | `sql/02_consultas_analiticas.sql` (e `sql/01_athena_ddl.sql` como plano B) |

Se os CSVs ainda não estiverem baixados (exige token do Kaggle em `~/.kaggle/`):

```bash
kaggle datasets download -d datahackers/state-of-data-brazil-2023 -p data/raw/edicao_2023 --unzip
kaggle datasets download -d datahackers/state-of-data-brazil-20242025 -p data/raw/edicao_2024 --unzip
kaggle datasets download -d datahackers/state-of-data-brazil-2025-2026 -p data/raw/edicao_2025 --unzip
```

Escolha um **nome de bucket único e em minúsculas**, por exemplo `tc-fase3-state-of-data-rm12345` (na execução entregue: `tc-fase3-state-of-data-rm375453`).
Ele aparece como `<bucket>` no restante deste roteiro.

---

## 1. Iniciar o Learner Lab

1. AWS Academy → curso → **Modules → Launch AWS Academy Learner Lab**.
2. Clique em **Start Lab** e espere a bolinha ficar verde.
3. Confirme que a região é **us-east-1 (N. Virginia)**.
4. Para usar a AWS CLI na sua máquina: **AWS Details → AWS CLI → Show** e cole o bloco em
   `~/.aws/credentials` (perfil `[default]`). As credenciais expiram junto com o lab.
   Alternativa sem configurar nada: rode tudo pelo **CloudShell** do console.

---

## 2. Ingestão na zona RAW (S3)

```bash
SOD_BUCKET=<bucket> bash scripts/01_ingestao_s3.sh
```

O script:

- confere as credenciais (`aws sts get-caller-identity`);
- cria o bucket, se ainda não existir;
- cria os prefixos `raw/ bronze/ silver/ gold/ athena-results/ output/ scripts/`;
- copia os CSVs para `raw/edicao_<ano>/` sem alteração;
- copia os scripts `.py` para `scripts/` (usados pelos Glue Jobs).

**Pelo console, sem CLI:** crie o bucket no S3, crie as pastas acima e faça upload de cada CSV em
`raw/edicao_<ano>/`. Na execução entregue, os CSVs subiram compactados (`.csv.gz`, sem perda), ficando com
1 a 1,6 MB cada. O Spark descompacta pela extensão e o notebook 01 lê a pasta inteira, então o nome do arquivo
não importa.

**Glue Jobs pelo CloudShell:** o terminal do Learner Lab não tem permissão no S3, mas o **CloudShell** do console
usa as mesmas credenciais da sessão e funciona. Os 4 jobs foram criados assim:

```bash
B=<bucket>
for i in 01_bronze_ingestao 02_silver_tratamento 03_gold_agregacoes 04_analises_graficos; do
  aws glue create-job --name sod-$i --role LabRole --glue-version 5.0 --worker-type G.1X --number-of-workers 2 \
    --timeout 30 --command Name=glueetl,ScriptLocation=s3://$B/scripts/$i.py,PythonVersion=3 \
    --default-arguments '{"--enable-glue-datacatalog":"true","--job-language":"python","--additional-python-modules":"matplotlib"}'
done
aws glue start-job-run --job-name sod-01_bronze_ingestao   # depois 02, 03 e 04, um após o outro
```

📸 *Evidência:* print do bucket mostrando as zonas e os 3 CSVs em `raw/`.

---

## 3. ETL no AWS Glue (Bronze → Silver → Gold → gráficos)

O enunciado pede *"ETL/ELT e catalogação das tabelas com o Glue Jobs"* e *"consultas analíticas utilizando o Glue
Notebook ou Athena"*. A forma que casa exatamente com isso:

- **01, 02 e 03 como Glue Jobs** (ETL + catalogação): opção B abaixo;
- **04 como Glue Notebook** (análises e gráficos): opção A abaixo;
- consultas no **Athena** (passo 4).

Rodar os quatro como notebook também funciona (é o mesmo código); use se os Jobs derem problema.

> **Execução entregue:** os quatro rodaram como Glue Jobs (`sod-01` a `sod-04`), todos *Succeeded* em ~2 minutos
> cada (0,29 DPU-hora no total). O job 04 gravou os 15 gráficos em `output/charts/`. Capturas em `entrega/evidencias/`.

### Opção A — Glue Notebook

Para cada notebook, na ordem **01 → 02 → 03 → 04** (ou só o 04, se 01–03 rodaram como Jobs):

1. **AWS Glue → ETL jobs → Notebooks → Upload Notebook** e selecione `notebooks/ipynb/0X_*.ipynb`.
2. IAM role: **LabRole** (é a única que o Learner Lab permite). Kernel: **Spark (PySpark)**.
3. Na célula de configuração, troque o nome do bucket:
   ```python
   BUCKET = os.environ.get("SOD_BUCKET", "<bucket>")
   ```
4. Rode a primeira célula (magics `%glue_version 5.0`, `%worker_type G.1X`, `%number_of_workers 2`)
   e depois **Run all**. A sessão leva 1 a 2 minutos para subir.
5. Ao terminar, **pare a sessão** (`%stop_session` ou botão *Stop*) para não consumir o crédito do lab.

| Notebook | Lê | Grava | Tabelas no Glue Catalog |
|---|---|---|---|
| `01_bronze_ingestao` | `raw/` | `bronze/` | `sod_bronze.survey_2023/2024/2025`, `dicionario_colunas` |
| `02_silver_tratamento` | `bronze/` | `silver/` (partição `ano_pesquisa`) | `sod_silver.*` |
| `03_gold_agregacoes` | `silver/` | `gold/` | 10 tabelas `sod_gold.*` |
| `04_analises_graficos` | `gold/` e `silver/` | `output/charts/*.png` | — |

### Opção B — Glue Jobs (mesmo código)

1. **AWS Glue → ETL jobs → Script editor → Spark → Upload script** com `notebooks/0X_*.py`
   (ou aponte para `s3://<bucket>/scripts/0X_*.py`, já copiado no passo 2).
2. Em *Job details*: IAM role **LabRole**, Glue version **5.0**, worker **G.1X**, **2 workers**.
   Em *Advanced properties*, confirme que **Use Glue Data Catalog as the Hive metastore** está marcado
   (é o que faz o `saveAsTable` registrar as tabelas no catálogo).
3. Edite a linha `BUCKET = ...` como na opção A, salve e clique em **Run**. Rode os jobs 01 → 03 em sequência,
   esperando cada um terminar com *Succeeded* (aba *Runs*).
4. Se rodar o 04 como job e ele reclamar de `matplotlib`, adicione o parâmetro `--additional-python-modules` = `matplotlib`.

### Opcional — Crawler na zona RAW (o que foi mostrado em aula)

As camadas Bronze/Silver/Gold já são catalogadas pelos próprios jobs. Para mostrar também o uso de Crawler:
**Glue → Crawlers → Create crawler**, fonte `s3://<bucket>/raw/`, role **LabRole**, database novo `sod_raw`, **Run**.
Ele cria uma tabela por pasta `edicao_<ano>`. É só para evidência: o pipeline não depende dele.

📸 *Evidência:* print dos jobs/notebooks com status *Succeeded* e do Glue Catalog com os 3 databases.

---

## 4. Consultas no Amazon Athena

1. **Athena → Query editor → Settings → Manage** e defina
   *Query result location* = `s3://<bucket>/athena-results/`.
2. Em *Data source* `AwsDataCatalog`, os databases `sod_bronze`, `sod_silver` e `sod_gold` já devem aparecer
   (os notebooks registram as tabelas no Glue Catalog).
3. Abra `sql/02_consultas_analiticas.sql` e rode as consultas **Q0 a Q7b**, uma por vez.
   Cada uma responde a uma pergunta de negócio do deck; a Q0 confere volumes por camada.
   Para rodar todas de uma vez pelo CloudShell (resultados em `athena-results/`):
   ```bash
   python3 run_athena.py <bucket> 02_consultas_analiticas.sql
   ```
   Na execução entregue: **16 de 16 consultas com sucesso**, com os mesmos valores da validação local
   (ex.: Q7, 2025, Finanças n = 598 e salário médio R$ 14.568 contra R$ 12.916 nos demais setores).

**Plano B:** se o catálogo não tiver as tabelas, substitua `<bucket>` em `sql/01_athena_ddl.sql`
e rode o arquivo. Ele recria databases e tabelas externas apontando para os Parquet no S3.
Para as tabelas particionadas da Silver, rode `MSCK REPAIR TABLE sod_silver.<tabela>;` depois do DDL.

📸 *Evidência:* print de 2 ou 3 consultas com resultado (por exemplo Q1, Q5 e Q7).

---

## 5. Encerramento

- Baixe os gráficos de `s3://<bucket>/output/charts/`, se quiser comparar com `output/charts/` local.
- Pare sessões do Glue que ainda estiverem ativas.
- **End Lab** no AWS Academy.

---

## Problemas comuns

| Sintoma | Causa provável | Correção |
|---|---|---|
| `AccessDenied` ao criar notebook/job | role diferente de LabRole | selecione **LabRole** |
| `ExpiredToken` na CLI | lab reiniciado | copie de novo as credenciais de *AWS Details* |
| `NoSuchBucket` no notebook | `BUCKET` não foi trocado | edite a linha `BUCKET = ...` |
| Athena: *No output location provided* | local de resultados não definido | passo 4.1 |
| Athena: tabela da Silver vazia após DDL | partições não carregadas | `MSCK REPAIR TABLE` |
| Sessão do Glue não sobe | limite de sessões simultâneas do lab | pare as sessões anteriores |
