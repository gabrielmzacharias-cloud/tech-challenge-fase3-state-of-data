/* Gera o deck executivo do Tech Challenge Fase 3 (pptxgenjs, deck estruturado: tema, layouts, seções).
 *
 * Pré-requisito: python scripts/preparar_graficos_deck.py  (recorta os gráficos para entrega/assets/charts)
 * Uso:           NODE_PATH=<node_modules com pptxgenjs> PPTX_SKILL_DIR=<skill pptx> node scripts/gerar_deck.js
 * Saída:         entrega/TechChallenge_Fase3_DTAT.pptx
 *
 * Os números citados nos textos vêm das tabelas Gold (sql/02_consultas_analiticas.sql reproduz cada um).
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = path.resolve(__dirname, "..");
const ASSETS = path.join(RAIZ, "entrega", "assets", "charts");
const SAIDA = path.join(RAIZ, "entrega", "TechChallenge_Fase3_DTAT.pptx");
const PROPORCAO = JSON.parse(fs.readFileSync(path.join(ASSETS, "tamanhos.json"), "utf8"));

// ---------------------------------------------------------------------------------------------
// Tema: mesma paleta dos gráficos (azul institucional + laranja de destaque)
// ---------------------------------------------------------------------------------------------
const THEME = {
  name: "State of Data BR",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "0B0B0B", lt1: "FCFCFB", dk2: "0D366B", lt2: "EEF3FA",
    accent1: "2A78D6", accent2: "EB6834", accent3: "1BAF7A", accent4: "EDA100",
    accent5: "104281", accent6: "86B6EF", hlink: "2A78D6", folHlink: "104281",
  },
};
const CINZA = "52514E"; // tinta secundária dos gráficos
const AZUL_MEDIO = ["86B6EF", "3987E5", "1C5CAB", "0D366B"]; // rampa ordinal RAW → GOLD
const TITULO = "+mj-lt"; // fonte de título do tema, para números de destaque
const FONTE = "Fonte: State of Data Brasil 2023, 2024 e 2025 (Data Hackers e Bain & Company)";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13,33 x 7,5 pol
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "State of Data Brasil 2023-2025: o mercado de dados e IA";
pres.subject = "Tech Challenge Fase 3 - Big Data to Analytics";
pres.author = "FIAP Pós Tech DTAT";
pres.company = "FIAP Pós Tech";
const C = pres.SchemeColor;

// ---------------------------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------------------------
pres.defineSlideMaster({
  title: "CAPA",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 1.7, w: 11.7, h: 2.2, fontSize: 40, bold: true, color: C.background1, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "subtitulo", type: "body", x: 0.8, y: 4.15, w: 11.2, h: 1.3, fontSize: 20, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
    { text: { text: "FIAP Pós Tech · Data Analytics (DTAT) · Tech Challenge Fase 3", options: { x: 0.8, y: 6.55, w: 9.0, h: 0.4, fontSize: 14, color: C.accent6, margin: 0 } } },
  ],
});

pres.defineSlideMaster({
  title: "CONTEUDO",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "secao", type: "body", x: 0.6, y: 0.32, w: 12.1, h: 0.34, fontSize: 12, bold: true, color: C.accent2, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.6, y: 0.7, w: 12.1, h: 0.95, fontSize: 24, bold: true, color: C.text2, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "fonte", type: "body", x: 0.6, y: 7.0, w: 11.0, h: 0.3, fontSize: 10, color: CINZA, valign: "middle", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.25, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: CINZA, align: "right" },
});

pres.defineSlideMaster({
  title: "ENCERRAMENTO",
  background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 1.6, w: 11.7, h: 1.8, fontSize: 36, bold: true, color: C.background1, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "corpo", type: "body", x: 0.8, y: 3.7, w: 11.2, h: 2.4, fontSize: 18, color: C.background1, valign: "top", margin: 0 }, text: "" } },
  ],
});

// ---------------------------------------------------------------------------------------------
// Blocos de composição
// ---------------------------------------------------------------------------------------------
let SECAO;
function secao(titulo) {
  pres.addSection({ title: titulo });
  SECAO = titulo;
}

function slideConteudo(kicker, titulo, fonte = FONTE) {
  const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: SECAO });
  s.addText(kicker.toUpperCase(), { placeholder: "secao", bullet: false, charSpacing: 1.5 });
  s.addText(titulo, { placeholder: "title" });
  s.addText(fonte, { placeholder: "fonte", bullet: false });
  return s;
}

function caixa(s, nome, x, y, w, h, cor) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: cor }, line: { type: "none" }, rectRadius: 0.08, objectName: nome });
}

function texto(s, nome, conteudo, opcoes) {
  s.addText(conteudo, { margin: 0, valign: "top", isTextBox: true, objectName: nome, ...opcoes });
}

function rotulo(s, nome, txt, x, y, w, cor) {
  texto(s, nome, txt.toUpperCase(), { x, y, w, h: 0.3, fontSize: 12, bold: true, color: cor, charSpacing: 1 });
}

function marcadores(itens, tamanho = 14, cor = C.text1) {
  return itens.map((t, i) => ({
    text: t,
    options: { bullet: true, fontSize: tamanho, color: cor, paraSpaceAfter: 7, breakLine: i < itens.length - 1 },
  }));
}

// Número grande + legenda (cartões de destaque)
function destaque(s, nome, x, y, w, h, valor, legenda, { fundo = C.background2, corValor = C.text2, corLegenda = CINZA, tamanho = 36 } = {}) {
  caixa(s, nome, x, y, w, h, fundo);
  texto(s, `${nome}-valor`, valor, { x: x + 0.22, y: y + 0.15, w: w - 0.44, h: h * 0.48, fontFace: TITULO, fontSize: tamanho, bold: true, color: corValor, valign: "bottom" });
  texto(s, `${nome}-legenda`, legenda, { x: x + 0.22, y: y + 0.2 + h * 0.48, w: w - 0.44, h: h * 0.52 - 0.3, fontSize: 14, color: corLegenda });
}

function circulo(s, nome, x, y, d, txt, cor = C.text2) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: cor }, line: { type: "none" }, objectName: nome });
  texto(s, `${nome}-num`, txt, { x, y, w: d, h: d, fontFace: TITULO, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
}

// Slide padrão de gráfico: imagem à esquerda, painel "o que os dados mostram" + "para o banco" à direita
function slideGrafico({ kicker, titulo, img, tabela, dados, banco, alt, notas, stats }) {
  const s = slideConteudo(kicker, titulo, `${FONTE} · tabela sod_gold.${tabela}`);
  const r = PROPORCAO[img];
  const w = Math.min(8.0, 5.0 * r), h = w / r;
  s.addImage({ path: path.join(ASSETS, `${img}.png`), x: 0.6, y: 1.8, w, h, altText: alt, objectName: "grafico" });

  caixa(s, "painel-dados", 8.85, 1.8, 3.9, 3.05, C.background2);
  rotulo(s, "painel-dados-rotulo", "O que os dados mostram", 9.05, 1.97, 3.5, C.text2);
  texto(s, "painel-dados-texto", marcadores(dados), { x: 9.05, y: 2.37, w: 3.5, h: 2.38 });

  caixa(s, "painel-banco", 8.85, 5.0, 3.9, 1.8, C.text2);
  rotulo(s, "painel-banco-rotulo", "Para o banco", 9.05, 5.17, 3.5, C.accent6);
  texto(s, "painel-banco-texto", banco, { x: 9.05, y: 5.52, w: 3.5, h: 1.18, fontSize: 14, color: C.background1 });

  if (stats) {
    const y0 = 1.8 + h + 0.3, alt0 = 6.8 - y0, gap = 0.2, ww = (8.0 - gap * (stats.length - 1)) / stats.length;
    stats.forEach(([valor, legenda], i) =>
      destaque(s, `destaque-${i + 1}`, 0.6 + i * (ww + gap), y0, ww, alt0, valor, legenda, { tamanho: 24 }));
  }
  s.addNotes(notas);
  return s;
}

// =============================================================================================
// ABERTURA
// =============================================================================================
secao("Abertura");

{
  const s = pres.addSlide({ masterName: "CAPA", sectionTitle: SECAO });
  s.addText("O mercado de dados e IA no Brasil: o que o banco precisa saber", { placeholder: "title" });
  s.addText("State of Data Brasil 2023, 2024 e 2025 · Análise para uma grande instituição financeira", { placeholder: "subtitulo", bullet: false });
  texto(s, "integrantes", "Grupo 28 · Gabriel Zacharias · RM 375453 · Novembro de 2026", { x: 0.8, y: 6.05, w: 9.0, h: 0.4, fontSize: 14, color: C.background1 });
  s.addNotes(
    "Abertura. Somos a consultoria contratada para traduzir três anos de pesquisa State of Data Brasil em decisões para o banco: " +
    "quem contratar, quanto pagar, que tecnologia adotar e como transformar IA em resultado. " +
    "Toda a análise foi construída num data lake na AWS (S3, Glue e Athena), com código entregue junto deste material."
  );
}

{
  const s = slideConteudo("Sumário executivo", "O mercado de dados adotou a IA em massa; o desafio agora é escalar e reter talento");
  const cards = [
    ["98%", "usam IA generativa no trabalho (eram 80% em 2023)"],
    ["26%", "das empresas têm IA em produção; 38% ainda em piloto"],
    ["+13%", "de salário médio em Finanças frente aos demais setores"],
    ["22%", "dos profissionais são mulheres, com gap salarial de 19%"],
  ];
  const w = (12.1 - 3 * 0.25) / 4;
  cards.forEach(([v, l], i) => destaque(s, `kpi-${i + 1}`, 0.6 + i * (w + 0.25), 1.85, w, 2.15, v, l, { tamanho: 44 }));

  caixa(s, "mensagem-principal", 0.6, 4.3, 12.1, 2.5, C.text2);
  rotulo(s, "mensagem-rotulo", "Mensagem principal", 0.95, 4.55, 11.4, C.accent6);
  texto(s, "mensagem-texto",
    "O mercado de dados brasileiro está mais sênior, mais caro e já usa IA no dia a dia, mas poucas empresas transformaram IA em resultado. " +
    "O banco parte em vantagem (paga mais e retém melhor que o mercado) e pode liderar se escalar IA com governança, " +
    "formar talentos de ML/IA e oferecer a flexibilidade que 85% dos profissionais desejam.",
    { x: 0.95, y: 4.95, w: 11.4, h: 1.7, fontSize: 18, color: C.background1, lineSpacingMultiple: 1.1 });
  s.addNotes(
    "Se o comitê só puder levar uma mensagem: IA já é rotina para quase todos os profissionais de dados, mas só um quarto das empresas a colocou em produção. " +
    "O setor financeiro paga 13% acima do mercado e tem profissionais mais satisfeitos, o que é uma base forte. " +
    "Os pontos de atenção são diversidade (22% de mulheres e gap de 19%, sem melhora em três anos) e flexibilidade de trabalho, onde Finanças fica atrás do mercado."
  );
}

{
  const s = slideConteudo("Contexto e escopo", "Três edições e 14 mil respostas: uma radiografia do mercado de dados");
  const blocos = [
    ["O desafio", "Uma grande instituição financeira quer entender o mercado de dados e IA no Brasil para orientar contratação, retenção, investimento em tecnologia e adoção de IA."],
    ["A abordagem", "Consolidamos as três edições mais recentes do State of Data Brasil num data lake na AWS (S3, Glue e Athena), com camadas Bronze, Silver e Gold e análises em PySpark."],
    ["O recorte", "As análises de mercado usam os 12.841 profissionais que atuam com dados. Salário é o ponto médio da faixa declarada."],
  ];
  blocos.forEach(([t, d], i) => {
    const y = 1.85 + i * 1.65;
    rotulo(s, `bloco-${i + 1}-rotulo`, t, 0.6, y, 6.6, C.accent2);
    texto(s, `bloco-${i + 1}-texto`, d, { x: 0.6, y: y + 0.38, w: 6.6, h: 1.15, fontSize: 16, color: C.text1 });
  });
  [["14.002", "respostas nas edições 2023, 2024 e 2025"], ["12.841", "atuam com dados: a base das análises"], ["1.190", "colunas mapeadas no dicionário de dados"]]
    .forEach(([v, l], i) => destaque(s, `escopo-${i + 1}`, 7.75, 1.85 + i * 1.67, 5.0, 1.5, v, l, { tamanho: 32 }));
  s.addNotes(
    "O State of Data Brasil é a maior pesquisa sobre o mercado de dados no país, feita pela Data Hackers com a Bain & Company. " +
    "Usamos as três edições mais recentes: 5.293 respostas em 2023, 5.215 em 2024 e 3.494 em 2025. " +
    "Como as perguntas mudam entre edições, harmonizamos cargos, senioridade e faixas salariais na camada Silver para comparar os anos."
  );
}

{
  const s = slideConteudo("Agenda", "Sete perguntas de negócio, uma resposta curta para cada");
  const itens = [
    ["Estrutura do mercado", "Mais sênior, com Finanças como maior empregador"],
    ["Perfis mais valorizados", "Gestão e ML/IA pagam o dobro de BI e Análise"],
    ["Diversidade de gênero", "22% de mulheres e gap de 19%, sem melhora"],
    ["Adoção de tecnologias", "Python e SQL universais; AWS lidera a nuvem"],
    ["Adoção de IA e impacto", "98% usam, mas só 26% das empresas estão em produção"],
    ["Região, senioridade e modelo de trabalho", "Flexibilidade é o desejo de 85% dos profissionais"],
    ["Oportunidades e desafios", "Escalar IA e reter talento com carreira e flexibilidade"],
  ];
  itens.forEach(([p, r], i) => {
    const y = 1.85 + i * 0.69;
    circulo(s, `agenda-${i + 1}`, 0.6, y, 0.5, String(i + 1));
    texto(s, `agenda-${i + 1}-pergunta`, p, { x: 1.35, y, w: 4.9, h: 0.5, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
    texto(s, `agenda-${i + 1}-resposta`, r, { x: 6.35, y, w: 6.4, h: 0.5, fontSize: 15, color: C.text1, valign: "middle" });
  });
  s.addNotes("Estruturamos a apresentação nas sete perguntas do desafio. Ao lado de cada uma está a resposta curta; os próximos slides mostram a evidência de cada resposta.");
}

// =============================================================================================
// ARQUITETURA
// =============================================================================================
secao("Arquitetura");

{
  const s = slideConteudo("Arquitetura AWS", "Pipeline serverless na AWS: S3 + Glue + Athena, dentro do AWS Academy", "Diagrama: arquitetura/arquitetura_aws.drawio");
  const r = PROPORCAO.arquitetura_aws, h = 5.0, w = h * r;
  s.addImage({ path: path.join(ASSETS, "arquitetura_aws.png"), x: (13.333 - w) / 2, y: 1.8, w, h, objectName: "diagrama-arquitetura",
    altText: "Arquitetura: Kaggle para S3 raw, AWS Glue Jobs gerando Bronze, Silver e Gold no S3, Glue Data Catalog, Amazon Athena e etapa de análise e gráficos em PySpark" });
  s.addNotes(
    "Os CSVs do Kaggle são enviados ao S3 na zona raw pelo console (ou pela AWS CLI no CloudShell). Três jobs do AWS Glue em PySpark produzem as camadas Bronze, Silver e Gold, " +
    "sempre em Parquet e registradas no Glue Data Catalog. O Athena consulta a Gold com SQL e um quarto job do Glue (o mesmo código do notebook 04) gera os gráficos. " +
    "Tudo é serverless e roda com a LabRole do AWS Academy: não há servidor para manter e o custo é por uso."
  );
}

{
  const s = slideConteudo("Arquitetura AWS", "Arquitetura Medallion: do CSV bruto a 10 tabelas Gold prontas para o negócio", "Código: notebooks/01_bronze_ingestao, 02_silver_tratamento, 03_gold_agregacoes");
  const camadas = [
    ["RAW", "s3://…/raw/", "CSVs originais do Kaggle, uma pasta por edição.", "Console S3 / CLI · 01_ingestao_s3.sh", "3 edições"],
    ["BRONZE", "sod_bronze", "Parquet com colunas normalizadas, ano da pesquisa e dicionário de perguntas.", "Glue · 01_bronze_ingestao", "402 / 406 / 391 colunas"],
    ["SILVER", "sod_silver", "Modelo harmonizado entre anos; faixas viram valores; respostas múltiplas em formato longo.", "Glue · 02_silver_tratamento", "14.002 respondentes"],
    ["GOLD", "sod_gold", "Tabelas agregadas, uma por pergunta de negócio, prontas para o Athena.", "Glue · 03_gold_agregacoes", "10 tabelas"],
  ];
  const gap = 0.36, w = (12.1 - 3 * gap) / 4, y = 1.85, h = 4.25;
  camadas.forEach(([nome, local, desc, job, stat], i) => {
    const x = 0.6 + i * (w + gap), id = nome.toLowerCase();
    caixa(s, `camada-${id}`, x, y, w, h, C.background2);
    caixa(s, `camada-${id}-topo`, x, y, w, 0.85, AZUL_MEDIO[i]);
    texto(s, `camada-${id}-nome`, [
      { text: nome, options: { fontFace: TITULO, fontSize: 20, bold: true, breakLine: true } },
      { text: local, options: { fontSize: 12 } },
    ], { x: x + 0.2, y: y + 0.1, w: w - 0.4, h: 0.68, color: i === 0 ? C.text2 : C.background1, valign: "middle" });
    texto(s, `camada-${id}-desc`, desc, { x: x + 0.2, y: y + 1.05, w: w - 0.4, h: 1.6, fontSize: 14, color: C.text1 });
    texto(s, `camada-${id}-job`, job, { x: x + 0.2, y: y + 2.7, w: w - 0.4, h: 0.6, fontSize: 12, color: CINZA });
    texto(s, `camada-${id}-stat`, stat, { x: x + 0.2, y: y + 3.4, w: w - 0.4, h: 0.65, fontFace: TITULO, fontSize: 18, bold: true, color: C.text2, valign: "bottom" });
    if (i < 3) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + w + 0.07, y: y + h / 2 - 0.15, w: 0.22, h: 0.3, fill: { color: "C3C2B7" }, line: { type: "none" }, objectName: `seta-${i + 1}` });
  });
  texto(s, "catalogo", [
    { text: "Glue Data Catalog ", options: { bold: true, color: C.text2 } },
    { text: "registra sod_bronze, sod_silver e sod_gold · " },
    { text: "Athena ", options: { bold: true, color: C.text2 } },
    { text: "consulta a Gold com SQL · " },
    { text: "Glue Job 04 ", options: { bold: true, color: C.text2 } },
    { text: "gera os gráficos em PySpark" },
  ], { x: 0.6, y: 6.3, w: 12.1, h: 0.45, fontSize: 14, color: C.text1, valign: "middle" });
  s.addNotes(
    "Cada camada tem um papel. Raw guarda o arquivo original, para auditoria. Bronze converte para Parquet sem mudar o conteúdo e cria o dicionário de perguntas. " +
    "Silver é onde está o trabalho pesado: as três edições têm perguntas e categorias diferentes, então harmonizamos cargos, senioridade e setores, " +
    "convertemos faixas salariais em valores numéricos e particionamos por ano. Gold entrega dez tabelas agregadas, cada uma respondendo a uma pergunta de negócio."
  );
}

// Linhas "número no círculo + título + descrição", usadas nos slides de tratamento e limitações
function linhasNumeradas(s, prefixo, itens, { y0 = 1.85, passo = 0.8, wTitulo = 3.2, wTexto = 8.0, cor = AZUL_MEDIO[2], tamTitulo = 15, tamTexto = 14 } = {}) {
  itens.forEach(([t, d], i) => {
    const y = y0 + i * passo;
    circulo(s, `${prefixo}-${i + 1}`, 0.6, y + 0.06, 0.46, String(i + 1), cor);
    texto(s, `${prefixo}-${i + 1}-titulo`, t, { x: 1.3, y, w: wTitulo, h: 0.6, fontSize: tamTitulo, bold: true, color: C.text2, valign: "middle" });
    texto(s, `${prefixo}-${i + 1}-texto`, d, { x: 1.3 + wTitulo + 0.2, y, w: wTexto, h: 0.6, fontSize: tamTexto, color: C.text1, valign: "middle" });
  });
}

{
  const s = slideConteudo("Tratamento de dados", "Camada Silver: oito regras de qualidade transformam três questionários diferentes em um esquema único", "Código: notebooks/02_silver_tratamento.py · tabelas sod_silver.respondentes e sod_silver.respondente_itens");
  linhasNumeradas(s, "regra", [
    ["Cabeçalhos heterogêneos", "2023 usa tuplas ('P2_h', 'Faixa salarial'); 2024/25 usam 2.h_faixa_salarial. Bronze gera nomes técnicos e um dicionário de 1.190 colunas."],
    ["De-para entre edições", "29 campos e 6 grupos de múltipla escolha mapeados pelo código da pergunta em cada ano (ex.: modelo de trabalho é 2.r em 2023/24 e 2.q em 2025)."],
    ["Padronização de categorias", "11 rótulos de cargo viram 9 famílias; gestores viram Gestor(a); senioridade, setor, modelo de trabalho e situação com rótulos únicos."],
    ["Faixa salarial em valor", "Ponto médio da faixa (salario_min, salario_max, salario_medio) via join broadcast com a tabela de faixas; faixa aberta = R$ 45 mil."],
    ["Deduplicação", "Window por (edição, token) com row_number: remove 3 respostas duplicadas e cria id_respondente único entre edições."],
    ["Tipagem e nulos", "idade em inteiro, gestor e satisfeito em booleano; respostas vazias viram NULL e flags respondeu_* servem de denominador dos percentuais."],
    ["Múltipla escolha em formato longo", "Linguagens, bancos, clouds, BI e uso de IA viram 1 linha por item marcado (explode) na tabela respondente_itens."],
    ["Gravação otimizada", "Parquet com Snappy, partição Hive-style ano_pesquisa=AAAA, 1 arquivo por partição e registro no Glue Data Catalog (saveAsTable)."],
  ], { y0: 1.85, passo: 0.63, wTitulo: 3.0, wTexto: 8.2, tamTitulo: 14, tamTexto: 12.5 });
  s.addNotes(
    "Este é o trabalho de engenharia de dados do projeto, o que a aula chama de camada limpa (cleansed layer): corrigir erros, remover duplicatas e aplicar regras de qualidade. " +
    "As três edições têm cabeçalhos, códigos de pergunta e rótulos diferentes; sem essa harmonização não daria para comparar os anos. " +
    "Cada regra está documentada no notebook 02, e a checagem de qualidade no fim do notebook confere volumes, faixas não mapeadas e a distribuição de cargos por edição."
  );
}

{
  const s = slideConteudo("Modelo de dados", "Camada Gold: dez tabelas agregadas no Glue Data Catalog, uma por pergunta de negócio", "Código: notebooks/03_gold_agregacoes.py (Spark SQL) · consultas: sql/02_consultas_analiticas.sql");
  const cab = { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 12 };
  const linhas = [
    ["Visão geral", "kpis_ano", "edição", "Q0, Q1"],
    ["1 · Estrutura do mercado", "distribuicao_perfil", "edição × dimensão × categoria", "Q1b"],
    ["2 · Perfis mais valorizados", "salario_cargo_senioridade", "edição × cargo × senioridade", "Q2, Q2b"],
    ["3 · Diversidade de gênero", "diversidade_genero", "edição × recorte × gênero", "Q3, Q3b"],
    ["4 · Adoção de tecnologias", "adocao_tecnologias", "edição × categoria × item", "Q4, Q4b"],
    ["5 · Adoção de IA e impacto", "adocao_ia · ia_impacto", "edição × indicador × resposta", "Q5, Q5b, Q5c"],
    ["6 · Região e modelo de trabalho", "regiao_modelo_trabalho · modelo_trabalho", "edição × região / modelo", "Q6, Q6b"],
    ["7 · Recorte Finanças", "comparativo_financas", "edição × grupo (Finanças vs. demais)", "Q7, Q7b"],
  ];
  s.addTable([
    [{ text: "Pergunta de negócio", options: cab }, { text: "Tabela sod_gold", options: cab }, { text: "Grão (uma linha por)", options: cab }, { text: "Athena", options: cab }],
    ...linhas.map((l, i) => l.map((t, j) => ({ text: t, options: { fontSize: 12, color: C.text1, bold: j === 0, fontFace: j === 1 ? "Courier New" : undefined, fill: { color: i % 2 ? "FCFCFB" : "EEF3FA" } } }))),
  ], { x: 0.6, y: 1.85, w: 8.2, colW: [2.5, 2.9, 1.9, 0.9], rowH: 0.45, valign: "middle", border: { type: "none" }, margin: 0.08, objectName: "tabela-gold" });

  caixa(s, "gold-painel", 9.05, 1.85, 3.7, 4.95, C.background2);
  rotulo(s, "gold-painel-rotulo", "Como a Gold foi modelada", 9.25, 2.02, 3.3, C.text2);
  texto(s, "gold-painel-texto", marcadores([
    "Camada curada: agregações OLAP prontas para consumo, sem joins pesados na hora da consulta.",
    "Métricas padronizadas: n, pct, salario_medio, com o denominador explícito de cada percentual.",
    "Base salarial única: quem atua em dados e informou faixa (12.841 profissionais).",
    "Parquet colunar: a Q7 lê 0,84 KB em 0,4 s no Athena.",
    "Silver continua disponível para perguntas novas (ex.: Q2b e Q7b usam a Silver com JOIN).",
  ], 12.5), { x: 9.25, y: 2.4, w: 3.3, h: 4.3 });
  s.addNotes(
    "A Gold segue a lógica de um data warehouse analítico: tabelas agregadas, cada uma com um grão claro, respondendo a uma pergunta do desafio. " +
    "Isso é o que a aula chama de camada curada ou transformada. As consultas do Athena ficam simples e baratas porque o trabalho pesado foi feito pelo Spark no Glue. " +
    "A Silver permanece catalogada para perguntas ad hoc, como o cruzamento de itens de cloud com setor na Q7b."
  );
}

{
  const s = slideConteudo("Decisões de arquitetura", "Seis decisões técnicas e o conceito do curso por trás de cada uma", "Referências: AWS Glue, Amazon Athena, Amazon S3 · disciplinas Big Data para Ciência de Dados e Fundamentos de Bancos de Dados");
  const decisoes = [
    ["Data lake em camadas no S3", "Raw → Bronze → Silver → Gold (camadas bruta, limpa e curada). Bucket + prefixos por camada; o catálogo evita o data swamp."],
    ["Parquet colunar com Snappy", "Formato colunar lê só as colunas pedidas e comprime por tipo: menos I/O e menor custo no Athena, que cobra por dado lido."],
    ["Particionamento Hive-style", "Silver particionada em ano_pesquisa=AAAA: filtros por edição leem só a partição necessária (partition pruning)."],
    ["Spark distribuído no Glue", "Glue Jobs PySpark (Spark 3.5): processamento em memória, driver + executors em 2 workers G.1X, escala horizontal sem servidor."],
    ["Serverless e pagamento por uso", "Sem cluster para manter: Glue cobra por DPU-hora (0,29 no pipeline todo) e o Athena por dado lido. Alta disponibilidade nativa."],
    ["Catálogo, ETL e segurança", "Glue Data Catalog como metastore (ETL: transforma no job e carrega na Gold); IAM LabRole, CloudWatch Logs e criptografia padrão do S3."],
  ];
  const gap = 0.25, w = (12.1 - 2 * gap) / 3, h = 2.15;
  decisoes.forEach(([t, d], i) => {
    const x = 0.6 + (i % 3) * (w + gap), y = 1.85 + Math.floor(i / 3) * (h + gap);
    caixa(s, `decisao-${i + 1}`, x, y, w, h, C.background2);
    circulo(s, `decisao-${i + 1}-num`, x + 0.2, y + 0.2, 0.46, String(i + 1), AZUL_MEDIO[1 + Math.floor(i / 3)]);
    texto(s, `decisao-${i + 1}-titulo`, t, { x: x + 0.8, y: y + 0.18, w: w - 1.0, h: 0.5, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
    texto(s, `decisao-${i + 1}-texto`, d, { x: x + 0.2, y: y + 0.85, w: w - 0.4, h: h - 1.0, fontSize: 12.5, color: C.text1 });
  });
  texto(s, "evolucao", [
    { text: "Evolução natural: ", options: { bold: true, color: C.text2 } },
    { text: "formato de tabela aberto (Apache Iceberg) para transações ACID e versionamento (lakehouse), Glue Workflows/Triggers para orquestração e QuickSight sobre o Athena para dashboards." },
  ], { x: 0.6, y: 6.5, w: 12.1, h: 0.42, fontSize: 12, color: C.text1, valign: "middle" });
  s.addNotes(
    "Cada escolha técnica tem um motivo ligado ao que foi estudado. O S3 é o padrão para data lakes e organiza tudo por bucket e prefixo; " +
    "as camadas correspondem às camadas bruta, limpa e curada; Parquet é um formato colunar comprimido, o que reduz o I/O e o custo do Athena, que cobra pelos bytes lidos; " +
    "a partição por ano permite que o Athena leia só a edição filtrada. O Glue executa Spark de forma serverless, com o Data Catalog como metastore central entre o S3 e o Athena. " +
    "A segurança veio do IAM (LabRole), dos logs no CloudWatch e da criptografia padrão do S3. Como evolução, um formato de tabela aberto como o Iceberg traria ACID e time travel, " +
    "e o Glue Workflows orquestraria os quatro jobs em sequência."
  );
}

{
  const s = slideConteudo("Código", "O mesmo PySpark roda no Glue e localmente; o Athena responde em SQL sobre o catálogo", "Código completo: notebooks/*.py (fontes) e notebooks/ipynb/*.ipynb · sql/02_consultas_analiticas.sql");
  const mono = { fontFace: "Courier New", fontSize: 10, color: C.text1, valign: "top", margin: 0 };
  const pyspark = [
    "# 02_silver_tratamento.py · dedup por (edição, token)",
    "w = Window.partitionBy(\"ano_pesquisa\", \"id_origem\") \\",
    "          .orderBy(F.lit(1))",
    "base = (base.filter(F.col(\"id_origem\").isNotNull())",
    "        .withColumn(\"_rn\", F.row_number().over(w))",
    "        .filter(\"_rn = 1\").drop(\"_rn\"))",
    "",
    "# faixa salarial → valor (join broadcast) e formato longo",
    "silver = base.join(F.broadcast(faixa_df),",
    "                   \"faixa_salarial\", \"left\")",
    "itens = silver.select(\"id_respondente\", \"ano_pesquisa\",",
    "                      F.explode(\"_itens\").alias(\"i\"))",
    "",
    "# Parquet particionado + registro no Glue Data Catalog",
    "(df.repartition(\"ano_pesquisa\").write.mode(\"overwrite\")",
    "   .format(\"parquet\").option(\"compression\", \"snappy\")",
    "   .partitionBy(\"ano_pesquisa\").option(\"path\", caminho)",
    "   .saveAsTable(\"sod_silver.respondentes\"))",
  ].join("\n");
  const sql = [
    "-- Q7b · Athena: stack de cloud em Finanças (2025)",
    "SELECT i.item AS provedor, COUNT(*) AS n,",
    "       ROUND(100.0 * COUNT(*) / MAX(b.base), 1) AS pct",
    "FROM sod_silver.respondente_itens i",
    "JOIN sod_silver.respondentes r",
    "  ON r.id_respondente = i.id_respondente",
    " AND r.ano_pesquisa = i.ano_pesquisa",
    "CROSS JOIN (SELECT COUNT(*) AS base",
    "            FROM sod_silver.respondentes",
    "            WHERE ano_pesquisa = 2025",
    "              AND setor = 'Finanças ou Bancos'",
    "              AND respondeu_cloud) b",
    "WHERE i.ano_pesquisa = 2025 AND i.categoria = 'cloud'",
    "  AND r.setor = 'Finanças ou Bancos'",
    "GROUP BY i.item ORDER BY n DESC LIMIT 8;",
  ].join("\n");
  const w = (12.1 - 0.3) / 2;
  [["PySpark no AWS Glue (notebook 02)", pyspark, "codigo-pyspark"], ["SQL no Amazon Athena (Q7b)", sql, "codigo-sql"]].forEach(([t, cod, nome], i) => {
    const x = 0.6 + i * (w + 0.3);
    rotulo(s, `${nome}-rotulo`, t, x, 1.8, w, C.accent2);
    caixa(s, `${nome}-fundo`, x, 2.15, w, 3.5, "F6F7F3");
    texto(s, nome, cod, { ...mono, x: x + 0.2, y: 2.3, w: w - 0.4, h: 3.25 });
  });
  const cw = (12.1 - 0.4) / 3;
  [["select · filter · groupBy · agg · join", "Operações de DataFrame do curso, usadas nos 4 notebooks"],
   ["Window · explode · broadcast", "Funções Spark para deduplicação, formato longo e join pequeno"],
   ["JOIN · GROUP BY · HAVING · CASE", "Repertório SQL das 16 consultas do Athena (Q0 a Q7b)"]]
    .forEach(([v, l], i) => {
      const x = 0.6 + i * (cw + 0.2);
      caixa(s, `codigo-destaque-${i + 1}`, x, 5.85, cw, 0.95, C.background2);
      texto(s, `codigo-destaque-${i + 1}-valor`, v, { x: x + 0.2, y: 5.95, w: cw - 0.4, h: 0.32, fontFace: TITULO, fontSize: 12, bold: true, color: C.text2 });
      texto(s, `codigo-destaque-${i + 1}-legenda`, l, { x: x + 0.2, y: 6.28, w: cw - 0.4, h: 0.45, fontSize: 11, color: CINZA });
    });
  s.addNotes(
    "Dois trechos reais do código entregue. À esquerda, PySpark do notebook 02: deduplicação com Window, conversão da faixa salarial com join broadcast, " +
    "explode das respostas múltiplas e a gravação em Parquet particionado com saveAsTable, que é o que registra a tabela no Glue Data Catalog. " +
    "À direita, a consulta Q7b do Athena, que cruza a tabela de itens com a de respondentes. O mesmo arquivo .py roda como Glue Job, como Glue Notebook (via .ipynb) e localmente, " +
    "porque detecta o ambiente na primeira célula."
  );
}

// Evidências da execução no AWS Academy: duas capturas do console lado a lado + cartões de resultado
const EVIDENCIAS = path.join(RAIZ, "entrega", "evidencias");
const FONTE_AWS = "Fonte: console AWS, conta do AWS Academy Learner Lab (us-east-1) · capturas em entrega/evidencias/";

function slideEvidencias({ titulo, imagens, stats, notas }) {
  const s = slideConteudo("Execução na AWS", titulo, FONTE_AWS);
  const gap = 0.2, w = (12.1 - gap) / 2;
  imagens.forEach(([arquivo, proporcao, legenda, alt], i) => {
    const x = 0.6 + i * (w + gap), h = (w - 0.16) / proporcao;
    rotulo(s, `evidencia-${i + 1}-rotulo`, legenda, x, 1.8, w, C.accent2);
    caixa(s, `evidencia-${i + 1}-moldura`, x, 2.15, w, h + 0.16, C.background2);
    s.addImage({ path: path.join(EVIDENCIAS, arquivo), x: x + 0.08, y: 2.23, w: w - 0.16, h, altText: alt, objectName: `evidencia-${i + 1}` });
  });
  const y0 = 5.35, cw = (12.1 - 3 * gap) / 4;
  stats.forEach(([valor, legenda], i) =>
    destaque(s, `resultado-${i + 1}`, 0.6 + i * (cw + gap), y0, cw, 1.45, valor, legenda, { tamanho: 24 }));
  s.addNotes(notas);
}

slideEvidencias({
  titulo: "Pipeline executado no AWS Academy: dados no S3 e 4 Glue Jobs concluídos sem falhas",
  imagens: [
    ["01_s3_bucket_zonas.png", 1326 / 636, "S3 · zonas do data lake", "Console do S3 com o bucket tc-fase3-state-of-data-rm375453 e as pastas raw, bronze, silver, gold, output, scripts e athena-results"],
    ["02_glue_jobs_succeeded.png", 1328 / 486, "Glue · 4 jobs com status Succeeded", "Monitoramento do AWS Glue com os jobs sod-01 a sod-04 concluídos com status Succeeded, cerca de 2 minutos cada"],
  ],
  stats: [
    ["4 de 4", "Glue Jobs com status Succeeded"],
    ["~2 min", "por job, Glue 5.0 com 2 workers G.1X"],
    ["0,29", "DPU-hora no total dos 4 jobs"],
    ["15", "gráficos gravados em output/charts/"],
  ],
  notas:
    "Evidência de execução. Os CSVs das três edições foram enviados à zona raw do bucket e os quatro jobs do Glue rodaram em sequência: " +
    "Bronze, Silver, Gold e o job de análises, que grava os 15 gráficos no S3. Cada job levou cerca de dois minutos e o pipeline inteiro consumiu 0,29 DPU-hora, " +
    "um custo irrisório que mostra que a arquitetura serverless é adequada ao volume da pesquisa.",
});

slideEvidencias({
  titulo: "Gold catalogada e consultada no Athena: 16 consultas sem falha, com os mesmos números do deck",
  imagens: [
    ["03_glue_catalog_sod_gold.png", 1328 / 611, "Glue Data Catalog · database sod_gold", "Glue Data Catalog com as tabelas do database sod_gold"],
    ["04_athena_q7_financas.png", 1248 / 611, "Athena · Q7, Finanças vs. demais setores", "Editor do Athena com a consulta Q7 sobre a tabela comparativo_financas e o resultado por ano e setor"],
  ],
  stats: [
    ["10", "tabelas Gold registradas no Glue Data Catalog"],
    ["16 de 16", "consultas do Athena (Q0 a Q7b) com sucesso"],
    ["0,4 s", "e 0,84 KB lidos na Q7, graças ao Parquet"],
    ["R$ 14,6 mil", "salário médio em Finanças 2025 na Q7, igual ao deck"],
  ],
  notas:
    "Os próprios jobs registram as tabelas no Glue Data Catalog, então o Athena enxerga sod_bronze, sod_silver e sod_gold sem crawler. " +
    "Rodamos as 16 consultas de sql/02_consultas_analiticas.sql: todas concluíram com sucesso. A Q7, que compara Finanças com os demais setores, " +
    "devolve em 2025 598 profissionais de Finanças com salário médio de R$ 14,6 mil contra R$ 12,9 mil nos demais, os mesmos valores citados no deck.",
});

// =============================================================================================
// 1 · ESTRUTURA DO MERCADO
// =============================================================================================
secao("1 · Estrutura do mercado");

slideGrafico({
  kicker: "1 · Estrutura do mercado",
  titulo: "Gestão e análise somam 42% do mercado; ML/IA ainda é nicho, com 3%",
  img: "01_cargos_2025", tabela: "distribuicao_perfil",
  alt: "Barras horizontais com a distribuição de cargos em 2025",
  dados: [
    "Gestores (23%) e Analistas de Dados (19%) lideram em 2025",
    "Engenharia e Ciência de Dados empatam, com 13% cada",
    "Perfis de ML/IA são apenas 3,3% dos profissionais",
  ],
  banco: "Talento de ML/IA é escasso: formar internamente pesa tanto quanto contratar.",
  notas:
    "Em 2025, quase um em cada quatro respondentes é gestor, e analistas de dados são o segundo grupo. " +
    "Engenharia e Ciência de Dados têm o mesmo peso. O dado que importa para o banco é o de ML/IA: apenas 3,3% do mercado, " +
    "exatamente o perfil que a agenda de IA mais demanda. Isso aponta para disputa acirrada e para a necessidade de formar talento dentro de casa.",
});

slideGrafico({
  kicker: "1 · Estrutura do mercado",
  titulo: "O mercado amadureceu: a fatia de júniores caiu de 22% para 16% em três anos",
  img: "02_senioridade_ano", tabela: "distribuicao_perfil",
  alt: "Barras agrupadas da distribuição de senioridade por ano, 2023 a 2025",
  dados: [
    "Júnior: 22% → 18% → 16% entre 2023 e 2025",
    "Gestores sobem de 19% para 23%",
    "Sênior é o maior grupo em 2025 (27%); Especialista (11%) passou a ser medido em 2025",
  ],
  banco: "Com a porta de entrada mais estreita, programas de trainee em dados viram diferencial de atração.",
  notas:
    "A pirâmide do mercado está mudando de forma: menos júniores e mais gestores a cada edição. " +
    "Isso indica um mercado mais maduro, mas também uma porta de entrada estreita. " +
    "Atenção: a categoria Especialista só existe em 2025, por isso parte do movimento entre Sênior e Especialista é efeito do questionário.",
});

slideGrafico({
  kicker: "1 · Estrutura do mercado",
  titulo: "Finanças é o setor com mais profissionais de dados nas três edições",
  img: "03_setores_2025", tabela: "distribuicao_perfil",
  alt: "Barras horizontais com a distribuição por setor em 2025",
  dados: [
    "Finanças reúne 19% dos respondentes em 2025, à frente de Tecnologia (17%)",
    "Liderança constante: 19,5% → 21,3% → 18,5%",
    "Consultoria aparece em terceiro, com 8,8%",
  ],
  banco: "O banco disputa talento com outros bancos e com empresas de tecnologia ao mesmo tempo.",
  notas:
    "Finanças é o setor que mais emprega profissionais de dados na pesquisa, em todas as edições. " +
    "Isso confirma que o setor é referência em dados, e também que a concorrência por talento é direta: " +
    "o profissional que o banco quer contratar está, muitas vezes, em outro banco ou em uma empresa de tecnologia.",
});

// =============================================================================================
// 2 · PERFIS VALORIZADOS
// =============================================================================================
secao("2 · Perfis valorizados");

slideGrafico({
  kicker: "2 · Perfis mais valorizados",
  titulo: "Gestão e ML/IA pagam mais que o dobro de BI e Análise de Dados",
  img: "04_salario_cargo_2025", tabela: "salario_cargo_senioridade",
  alt: "Barras horizontais com o salário médio por cargo em 2025",
  dados: [
    "Gestor (R$ 20,2 mil) e ML/IA (R$ 19,1 mil) lideram em 2025",
    "Engenharia de Dados (R$ 14,5 mil) paga acima de Ciência (R$ 12,9 mil)",
    "BI (R$ 7,6 mil) na base; topo é Especialista em ML/IA (R$ 28,8 mil)",
  ],
  banco: "Engenharia de dados e ML/IA são os perfis críticos a reter: caros, escassos e a base da IA.",
  notas:
    "O ranking salarial mostra o que o mercado valoriza. Gestão e ML/IA estão no topo; Engenharia de Dados já paga mais que Ciência de Dados, " +
    "refletindo a demanda por quem constrói a plataforma. O maior salário médio entre combinações de cargo e senioridade é o de Especialista em ML/IA, R$ 28,8 mil. " +
    "Salários são pontos médios das faixas declaradas, então leia como ordem de grandeza.",
});

slideGrafico({
  kicker: "2 · Perfis mais valorizados",
  titulo: "Senioridade multiplica o salário: um sênior ganha 3,5 vezes o júnior",
  img: "05_salario_senioridade_ano", tabela: "salario_cargo_senioridade",
  alt: "Barras agrupadas de salário médio por senioridade e ano",
  dados: [
    "2025: Júnior R$ 4,2 mil · Pleno R$ 8,3 mil · Sênior R$ 14,5 mil",
    "Especialista (R$ 20,0 mil) já se iguala a Gestor (R$ 20,2 mil)",
    "Média geral subiu 26% em dois anos: R$ 10,5 mil → R$ 13,2 mil",
  ],
  banco: "Carreira em Y: uma trilha de especialista retém bons técnicos sem forçá-los à gestão.",
  notas:
    "Cada degrau de senioridade praticamente dobra o salário até o sênior. O dado novo de 2025 é o Especialista: " +
    "ele ganha o mesmo que um gestor, o que mostra que o mercado já remunera a carreira técnica no topo. " +
    "Para o banco, isso reforça uma carreira em Y. A média geral subiu 26% em dois anos, bem acima da inflação do período.",
});

// =============================================================================================
// 3 · DIVERSIDADE
// =============================================================================================
secao("3 · Diversidade de gênero");

slideGrafico({
  kicker: "3 · Diversidade de gênero",
  titulo: "Mulheres são 22% e ganham 19% menos; a presença cai a cada degrau da carreira",
  img: "06_genero_senioridade_2025", tabela: "diversidade_genero",
  alt: "Participação de mulheres e diferença salarial por senioridade em 2025",
  dados: [
    "Participação feminina caiu de 24,4% para 22,0% (2023-2025)",
    "Gap salarial geral subiu de 18,0% para 19,4%",
    "Mulheres são 28% dos júniores e 18% dos gestores; no pleno há paridade salarial, no sênior o gap chega a 19%",
  ],
  banco: "Metas de promoção e revisão salarial por gênero na passagem de pleno para sênior.",
  notas:
    "Diversidade não avançou: a participação feminina caiu e o gap salarial cresceu levemente nas três edições. " +
    "O ponto crítico é a transição de pleno para sênior: no pleno os salários são equivalentes, no sênior a diferença chega a 19%. " +
    "Lembrando que o gap aqui compara médias por grupo e não controla todos os fatores, como cargo e setor.",
});

// =============================================================================================
// 4 · TECNOLOGIAS
// =============================================================================================
secao("4 · Tecnologias");

slideGrafico({
  kicker: "4 · Adoção de tecnologias",
  titulo: "Python e SQL são universais; Power BI domina a visualização",
  img: "07_tecnologias_2025", tabela: "adocao_tecnologias",
  alt: "Painéis com as tecnologias mais usadas em 2025 por categoria",
  dados: [
    "Python (92%) e SQL (84%) são a base obrigatória",
    "Bancos de dados: PostgreSQL 37%, SQL Server 34%, Databricks 33%",
    "BI: Power BI com 59%, contra 23% do Looker",
  ],
  banco: "Padronizar a stack em Python, SQL e Power BI encurta a curva de aprendizado de quem chega.",
  notas:
    "Python e SQL deixaram de ser diferencial: são pré-requisito. Em bancos de dados, PostgreSQL e SQL Server dividem espaço com o Databricks, " +
    "que já chega a um terço dos profissionais. Em visualização, o Power BI é dominante. " +
    "Para o banco, escolher tecnologias que o mercado já domina reduz custo de contratação e treinamento.",
});

slideGrafico({
  kicker: "4 · Adoção de tecnologias",
  titulo: "A AWS virou a nuvem nº 1 do mercado, e em Finanças chega a 68%",
  img: "08_cloud_evolucao", tabela: "adocao_tecnologias",
  alt: "Evolução do uso de AWS, Azure e GCP de 2023 a 2025",
  dados: [
    "AWS: 30,6% → 44,1% → 48,3%",
    "Azure caiu de 42,3% para 34,8%; GCP estável, perto de 31%",
    "Em Finanças (2025): AWS 67,7%, Azure 28,1%, GCP 16,4%",
  ],
  banco: "Uma plataforma de dados em AWS (S3, Glue, Athena) alinha o banco ao talento disponível.",
  notas:
    "A virada de liderança em nuvem é clara: a AWS passou de terceira para primeira em dois anos, enquanto a Azure perdeu espaço. " +
    "No setor financeiro a concentração é ainda maior, com dois terços dos profissionais usando AWS. " +
    "A arquitetura que propomos neste trabalho usa exatamente esses serviços.",
});

// =============================================================================================
// 5 · INTELIGÊNCIA ARTIFICIAL
// =============================================================================================
secao("5 · Inteligência artificial");

slideGrafico({
  kicker: "5 · Adoção de IA e impacto",
  titulo: "IA generativa virou rotina: 98% usam, mas só 42% têm a ferramenta paga pela empresa",
  img: "09_ia_adocao_evolucao", tabela: "adocao_ia",
  alt: "Evolução do uso de IA generativa e da IA paga pela empresa, 2023 a 2025",
  dados: [
    "Uso de IA generativa: 80% → 94% → 98%",
    "Empresa paga a ferramenta: 6,4% → 19% → 42%",
    "A distância entre as duas curvas indica muito uso por conta própria",
  ],
  banco: "Licenciar IA corporativa com governança reduz o risco de dados sensíveis em ferramentas pessoais.",
  notas:
    "O uso de IA generativa é praticamente universal. A empresa pagar a ferramenta cresceu rápido, mas ainda é menos da metade. " +
    "Essa diferença é o que chamamos de IA paralela: profissionais usando contas pessoais no trabalho. " +
    "Em um banco, com dados de clientes e sigilo bancário, esse é um risco de governança e de LGPD.",
});

slideGrafico({
  kicker: "5 · Adoção de IA e impacto",
  titulo: "IA é prioridade para 61% das empresas; em 2023 eram 36%",
  img: "10_ia_prioridade_empresas", tabela: "adocao_ia",
  alt: "Evolução do grau de prioridade da IA nas empresas, segundo gestores",
  dados: [
    "IA como principal prioridade: 12% → 22% → 24%",
    "Principal ou entre as prioridades: 36% → 54% → 61%",
    "\"Não é prioridade\" caiu de 29% para 11% (visão dos gestores)",
  ],
  banco: "Não priorizar IA já coloca o banco no grupo minoritário do mercado.",
  notas:
    "Esta pergunta é respondida pelos gestores, que falam pela empresa. Em três anos, IA passou de tema secundário a prioridade para a maioria. " +
    "Hoje apenas 11% dizem que não é prioridade.",
});

slideGrafico({
  kicker: "5 · Adoção de IA e impacto",
  titulo: "Mas só uma em cada quatro empresas tem IA em produção; a maioria está em piloto",
  img: "11_ia_resultados_2025", tabela: "adocao_ia",
  alt: "Estágio dos resultados com IA nas empresas em 2025",
  dados: [
    "Em produção: 26,5%",
    "Pilotos: 38,4%; em investigação: 15%",
    "Ainda não começaram: 13,5%",
  ],
  banco: "O diferencial está em sair do piloto para a produção: MLOps, governança e dados confiáveis.",
  notas:
    "Aqui está a tensão central do deck: a IA é prioridade, mas poucos chegaram à produção. " +
    "Quase 40% das empresas estão presas em pilotos. O gargalo costuma ser dado de qualidade, plataforma e governança, " +
    "e não o modelo em si. Quem resolver isso primeiro captura o valor.",
});

slideGrafico({
  kicker: "5 · Adoção de IA e impacto",
  titulo: "Quem recebe IA da empresa ganha 33% mais e busca menos outro emprego",
  img: "12_ia_impacto_2025", tabela: "ia_impacto",
  alt: "Comparação entre quem tem IA fornecida pela empresa e quem usa por conta própria",
  dados: [
    "Salário: R$ 13,4 mil (IA da empresa) contra R$ 10,1 mil (por conta própria)",
    "Satisfeitos: 74% contra 67%; buscando emprego: 29% contra 41%",
    "Correlação, não causa: o grupo também é mais sênior (56% contra 45%)",
  ],
  banco: "Fornecer IA também é ferramenta de retenção: 12 pontos a menos de intenção de saída.",
  stats: [["+33%", "salário médio de quem tem IA da empresa"], ["-12 p.p.", "na intenção de trocar de emprego"], ["+7 p.p.", "de profissionais satisfeitos"]],
  notas:
    "Comparamos 891 profissionais com IA fornecida pela empresa e 1.170 que usam por conta própria. " +
    "Os primeiros ganham mais, estão mais satisfeitos e buscam menos outro emprego. " +
    "Não dá para afirmar causa, porque o grupo também é mais sênior, mas a associação com retenção é forte e consistente. " +
    "Só 44 respondentes não usam IA, um grupo pequeno demais para comparação.",
});

// =============================================================================================
// 6 · REGIÃO, SENIORIDADE E MODELO DE TRABALHO
// =============================================================================================
secao("6 · Região e modelo de trabalho");

slideGrafico({
  kicker: "6 · Região, senioridade e modelo de trabalho",
  titulo: "O Sudeste paga mais; o Nordeste ganha 24% menos na média, mas trabalha mais remoto",
  img: "13_regiao_2025", tabela: "regiao_modelo_trabalho",
  alt: "Salário médio e percentual de trabalho remoto por região em 2025",
  dados: [
    "Média: Sudeste R$ 13,5 mil, Nordeste R$ 10,3 mil",
    "No nível sênior a diferença some: R$ 14,0 mil no Nordeste e R$ 13,8 mil no Sudeste",
    "Remoto: 53% no Nordeste contra 37% no Sudeste",
  ],
  banco: "Contratar remoto fora do Sudeste amplia o funil de talentos e a diversidade regional.",
  stats: [["R$ 13,5 mil", "salário médio no Sudeste"], ["R$ 10,3 mil", "salário médio no Nordeste"], ["73%", "dos seniores do Nordeste em remoto"]],
  notas:
    "A diferença média entre regiões é grande, mas boa parte é composição: o Nordeste tem proporcionalmente mais júniores e plenos. " +
    "Comparando só seniores, os salários se igualam, o que sugere que o profissional sênior do Nordeste já compete no mercado nacional via trabalho remoto. " +
    "O Norte tem apenas 36 respondentes, então seus números são indicativos.",
});

slideGrafico({
  kicker: "6 · Região, senioridade e modelo de trabalho",
  titulo: "21% trabalham 100% presencial, mas só 2% querem esse modelo",
  img: "14_modelo_trabalho_2025", tabela: "modelo_trabalho",
  alt: "Modelo de trabalho atual e ideal em 2025",
  dados: [
    "Ideal: remoto (42%) + híbrido flexível (43%) = 85%",
    "Maior desalinhamento: híbrido flexível, de 20% hoje para 43% desejado",
    "Remoto cresce com a senioridade: 26% dos júniores, 50% dos seniores e 52% dos especialistas",
  ],
  banco: "Flexibilidade é uma alavanca de atração mais barata que salário, sobretudo para seniores.",
  notas:
    "O desalinhamento entre o modelo atual e o desejado é o maior de toda a pesquisa: quase ninguém quer o presencial integral. " +
    "O remoto cresce com a senioridade, ou seja, os perfis mais caros e escassos são justamente os que mais trabalham remoto. " +
    "Entre os júniores, 37% estão em modelo 100% presencial.",
});

// =============================================================================================
// 7 · OPORTUNIDADES E DESAFIOS
// =============================================================================================
secao("7 · Oportunidades e desafios");

slideGrafico({
  kicker: "7 · Recorte do cliente",
  titulo: "Finanças paga 13% mais e tem profissionais mais satisfeitos, mas é menos remoto",
  img: "15_financas_vs_mercado_2025", tabela: "comparativo_financas",
  alt: "Comparação entre Finanças e demais setores em 2025",
  dados: [
    "Salário médio: R$ 14,6 mil contra R$ 12,9 mil",
    "Empresa paga IA: 56% contra 39%; mulheres: 25,6% contra 20,8%",
    "Satisfeitos: 76% contra 67%; remoto: 32% contra 41%",
  ],
  banco: "A flexibilidade é o ponto fraco do setor e a alavanca de atração mais acessível.",
  notas:
    "Este é o recorte do cliente. Finanças paga mais, investe mais em IA corporativa, tem mais mulheres e profissionais mais satisfeitos; " +
    "a satisfação é maior em todas as edições. O único indicador em que o setor perde para o mercado é a flexibilidade: menos remoto, mais presencial. " +
    "É aí que o banco pode se diferenciar dos concorrentes diretos.",
});

{
  const s = slideConteudo("7 · Oportunidades e desafios", "Oportunidades e desafios para o banco");
  const colunas = [
    ["Oportunidades", C.accent3, [
      ["Liderar a IA em produção:", "74% das empresas ainda não chegaram lá."],
      ["Marca empregadora forte:", "Finanças já paga mais e satisfaz mais."],
      ["Talento fora do Sudeste:", "seniores remotos com salário equivalente."],
      ["Base de diversidade:", "mulheres são 28% dos júniores."],
    ]],
    ["Desafios", C.accent2, [
      ["Escassez de ML/IA:", "só 3% do mercado, com salários de até R$ 28,8 mil."],
      ["IA paralela:", "uso pessoal de IA sem governança sobre dados sensíveis."],
      ["Funil feminino:", "a presença cai de 28% para 18% até a gestão."],
      ["Flexibilidade:", "o setor é menos remoto que o mercado."],
    ]],
  ];
  colunas.forEach(([titulo, cor, itens], c) => {
    const x = 0.6 + c * 6.2;
    caixa(s, `coluna-${c + 1}`, x, 1.85, 5.9, 4.95, C.background2);
    caixa(s, `coluna-${c + 1}-topo`, x, 1.85, 5.9, 0.65, cor);
    texto(s, `coluna-${c + 1}-titulo`, titulo, { x: x + 0.3, y: 1.85, w: 5.3, h: 0.65, fontFace: TITULO, fontSize: 20, bold: true, color: C.background1, valign: "middle" });
    const runs = itens.flatMap(([lead, txt], i) => [
      { text: `${lead} `, options: { bold: true, color: C.text2, bullet: { indent: 22 }, paraSpaceAfter: 24 } },
      { text: txt, options: { breakLine: i < itens.length - 1 } },
    ]);
    texto(s, `coluna-${c + 1}-itens`, runs, { x: x + 0.3, y: 2.75, w: 5.3, h: 3.85, fontSize: 18, color: C.text1 });
  });
  s.addNotes(
    "Resumo das evidências em duas colunas. As oportunidades vêm da posição já favorável do setor: salário, satisfação e investimento em IA acima do mercado, " +
    "num mercado em que três de cada quatro empresas ainda não colocaram IA em produção. Os desafios são escassez de talento de ML/IA, " +
    "uso de IA sem governança, o funil feminino que se estreita e a menor flexibilidade de trabalho."
  );
}

{
  const s = slideConteudo("7 · Recomendações", "Roadmap recomendado: governar a IA já, escalar em 12 a 24 meses");
  const fases = [
    ["0 a 6 meses", "Fundamentos", [
      "Licenciar IA generativa corporativa com política de uso e LGPD",
      "Adotar híbrido flexível como padrão para times de dados",
      "Diagnóstico de equidade salarial por gênero e senioridade",
    ]],
    ["6 a 12 meses", "Plataforma e pessoas", [
      "Plataforma de dados em AWS no padrão Medallion",
      "Carreira em Y com trilha de especialista",
      "Academia interna de ML/IA a partir dos analistas",
    ]],
    ["12 a 24 meses", "Escala", [
      "Levar 3 a 5 casos de IA do piloto à produção com MLOps",
      "Metas de mulheres em cargos sênior e de gestão",
      "Recrutamento remoto nacional para perfis escassos",
    ]],
  ];
  const gap = 0.3, w = (12.1 - 2 * gap) / 3;
  fases.forEach(([prazo, nome, itens], i) => {
    const x = 0.6 + i * (w + gap);
    circulo(s, `fase-${i + 1}`, x, 1.9, 0.55, String(i + 1), AZUL_MEDIO[i + 1]);
    texto(s, `fase-${i + 1}-prazo`, [
      { text: prazo.toUpperCase(), options: { fontSize: 12, bold: true, color: C.accent2, charSpacing: 1, breakLine: true } },
      { text: nome, options: { fontFace: TITULO, fontSize: 20, bold: true, color: C.text2 } },
    ], { x: x + 0.7, y: 1.83, w: w - 0.7, h: 0.75, valign: "middle" });
    caixa(s, `fase-${i + 1}-cartao`, x, 2.85, w, 3.95, C.background2);
    texto(s, `fase-${i + 1}-acoes`, marcadores(itens, 16), { x: x + 0.25, y: 3.1, w: w - 0.5, h: 3.5 });
  });
  s.addNotes(
    "As recomendações seguem a ordem de dependência. Primeiro, governança e quick wins: licenciar IA corporativa fecha o risco de IA paralela e, " +
    "pelos dados, se associa a maior retenção; flexibilizar o modelo de trabalho tem custo baixo. Depois, plataforma e carreira. " +
    "Por fim, escala: tirar casos de IA do piloto, que é onde 38% do mercado está parado."
  );
}

// =============================================================================================
// ENCERRAMENTO
// =============================================================================================
secao("Encerramento");

{
  const s = slideConteudo("Metodologia", "Limitações: leia os números como tendência, não como censo");
  const itens = [
    ["Salário estimado", "Usamos o ponto médio da faixa salarial declarada; a faixa mais alta é aberta."],
    ["Amostra voluntária", "Quem responde é a comunidade engajada da Data Hackers, não uma amostra aleatória do mercado."],
    ["Questionário muda", "Especialista só existe em 2025; perguntas sobre IA na empresa são respondidas apenas por gestores."],
    ["Grupos pequenos", "Norte (36 respostas) e quem não usa IA (44) são apenas indicativos."],
    ["Correlação", "Diferenças entre grupos não provam causa: senioridade e setor se misturam aos efeitos."],
  ];
  itens.forEach(([t, d], i) => {
    const y = 1.85 + i * 0.97;
    circulo(s, `limite-${i + 1}`, 0.6, y + 0.08, 0.5, String(i + 1), AZUL_MEDIO[2]);
    texto(s, `limite-${i + 1}-titulo`, t, { x: 1.35, y, w: 3.4, h: 0.66, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
    texto(s, `limite-${i + 1}-texto`, d, { x: 4.85, y, w: 7.9, h: 0.66, fontSize: 15, color: C.text1, valign: "middle" });
  });
  s.addNotes(
    "Transparência sobre o que os dados permitem afirmar. As tendências entre edições e as diferenças grandes são robustas; " +
    "diferenças de poucos pontos percentuais e grupos pequenos devem ser lidos com cautela."
  );
}

{
  const s = slideConteudo("Reprodutibilidade", "Tudo reproduzível: código, notebooks e SQL entregues com o deck", "Execução passo a passo: docs/ROTEIRO_AWS_ACADEMY.md");
  const cab = { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 14 };
  const linhas = [
    ["Ingestão no S3 (raw)", "scripts/01_ingestao_s3.sh", "Console S3 ou CloudShell"],
    ["Bronze, Silver e Gold", "notebooks/ipynb/01, 02 e 03", "AWS Glue Jobs (Spark), LabRole"],
    ["Análises e gráficos", "notebooks/ipynb/04_analises_graficos", "AWS Glue Job ou Notebook"],
    ["Consultas de negócio", "sql/02_consultas_analiticas.sql", "Amazon Athena (scripts/run_athena.py)"],
    ["Catálogo alternativo", "sql/01_athena_ddl.sql", "Amazon Athena"],
    ["Arquitetura", "arquitetura/arquitetura_aws.drawio", "Draw.io"],
    ["Evidências da execução", "entrega/evidencias/*.png", "Console AWS (S3, Glue, Athena)"],
  ];
  s.addTable([
    [{ text: "Entregável", options: cab }, { text: "Arquivo", options: cab }, { text: "Onde roda", options: cab }],
    ...linhas.map((l, i) => l.map((t) => ({ text: t, options: { fontSize: 14, color: C.text1, fill: { color: i % 2 ? "FCFCFB" : "EEF3FA" } } }))),
  ], { x: 0.6, y: 1.9, w: 12.1, colW: [3.2, 4.6, 4.3], rowH: 0.58, valign: "middle", border: { type: "none" }, margin: 0.12, objectName: "tabela-entregaveis" });
  s.addNotes(
    "Todo o pipeline é código versionado. Os notebooks rodam no AWS Glue com a LabRole do Learner Lab; as mesmas transformações foram validadas localmente com Spark. " +
    "As consultas do Athena reproduzem cada número citado neste deck."
  );
}

{
  const s = pres.addSlide({ masterName: "ENCERRAMENTO", sectionTitle: SECAO });
  s.addText("Dados confiáveis, IA em produção e talento retido", { placeholder: "title" });
  s.addText(
    "O banco já paga mais e retém melhor que o mercado. O próximo passo é governar a IA, escalar os pilotos e oferecer a carreira e a flexibilidade que os melhores profissionais procuram.",
    { placeholder: "corpo", bullet: false });
  texto(s, "perguntas", "Obrigado · Perguntas e discussão", { x: 0.8, y: 6.4, w: 9.0, h: 0.45, fontSize: 18, bold: true, color: C.accent6 });
  s.addNotes("Fechamento: retomar a mensagem principal e abrir para perguntas.");
}

// ---------------------------------------------------------------------------------------------
pres.writeFile({ fileName: SAIDA }).then(async () => {
  const skill = process.env.PPTX_SKILL_DIR;
  if (skill) {
    const { applyTheme } = require(path.join(skill, "scripts", "apply_theme.js"));
    await applyTheme(SAIDA, THEME);
  } else {
    console.warn("PPTX_SKILL_DIR não definido: cores do tema não aplicadas");
  }
  console.log(`deck gravado em ${path.relative(RAIZ, SAIDA)}`);
});
