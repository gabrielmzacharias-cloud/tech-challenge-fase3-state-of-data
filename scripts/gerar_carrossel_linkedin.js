/* Gera o carrossel do LinkedIn (PDF retrato 4:5) a partir das mesmas séries do deck.
 *
 * Mesmo mundo do deck da FIAP (relatório tipográfico suíço: papel branco, tinta quase preta e um único
 * petróleo), em tom mais ousado: uma ideia por página, numerais enormes e páginas inteiras em petróleo.
 *
 * Pré-requisitos: python scripts/exportar_dados_deck.py; fontes Schibsted Grotesk e JetBrains Mono instaladas
 * Uso:            NODE_PATH=<node_modules com pptxgenjs> PPTX_SKILL_DIR=<skill pptx> node scripts/gerar_carrossel_linkedin.js
 * Saída:          entrega/linkedin/carrossel_linkedin.pptx (o PDF é exportado pelo PowerPoint)
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = process.env.DECK_RAIZ || path.resolve(__dirname, "..");
const SAIDA = process.env.CARROSSEL_SAIDA || path.join(RAIZ, "entrega", "linkedin", "carrossel_linkedin.pptx");
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, "entrega", "assets", "dados_deck.json"), "utf8"));

const THEME = {
  name: "State of Data BR · Relatório",
  headFontFace: "Schibsted Grotesk SemiBold",
  bodyFontFace: "Schibsted Grotesk",
  colors: {
    dk1: "1C2B31", lt1: "FFFFFF", dk2: "45555C", lt2: "EEF5F0",
    accent1: "3B6064", accent2: "1C2B31", accent3: "C9E4CA", accent4: "87BBA2",
    accent5: "364958", accent6: "C9E4CA", hlink: "3B6064", folHlink: "364958",
  },
};
const H = {
  tinta: "1C2B31", tinta2: "45555C", meta: "5D6D73", filete: "D4DEDB", apagado: "C9E4CA",
  papel: "FFFFFF", ultra: "3B6064", ultraClaro: "C9E4CA",
};
const FONTE_TITULO = "Schibsted Grotesk SemiBold";
const FONTE_MEDIA = "Schibsted Grotesk Medium";
const FONTE_TEXTO = "Schibsted Grotesk";
const MONO = "JetBrains Mono";
const FONTE = "Fonte: State of Data Brasil 2023–2025 (Data Hackers e Bain & Company)";
const REPO = "github.com/gabrielmzacharias-cloud/tech-challenge-fase3-state-of-data";

// Página 7,5 x 9,375 pol (4:5), margens de 0,6
const M = { x: 0.6, w: 6.3, alto: 9.375 };
const TOTAL = 9;

const pres = new pptxgen();
pres.defineLayout({ name: "LINKEDIN", width: 7.5, height: M.alto });
pres.layout = "LINKEDIN";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Mercado de dados e IA no Brasil (2023-2025)";
pres.subject = "Tech Challenge Fase 3 - FIAP Pós Tech Data Analytics";
pres.author = "Gabriel Zacharias";
pres.company = "FIAP Pós Tech";
const C = pres.SchemeColor;

pres.defineSlideMaster({ title: "LI_ULTRA", background: { color: H.ultra }, objects: [] });
pres.defineSlideMaster({ title: "LI_PAPEL", background: { color: H.papel }, objects: [] });

// ---------------------------------------------------------------------------------------------
// Blocos
// ---------------------------------------------------------------------------------------------
function texto(s, nome, conteudo, opcoes) {
  s.addText(conteudo, { margin: 0, valign: "top", isTextBox: true, objectName: nome, fontFace: FONTE_TEXTO, ...opcoes });
}

function filete(s, nome, x, y, w, cor, pt = 1) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: pt / 72, fill: { color: cor }, line: { type: "none" }, objectName: nome });
}

// Página com contador "n/9" e, nas páginas de dados, a fonte no rodapé
function pagina(n, escura, { fonte = false } = {}) {
  const s = pres.addSlide({ masterName: escura ? "LI_ULTRA" : "LI_PAPEL" });
  const meta = escura ? H.ultraClaro : H.meta;
  texto(s, "rotulo", "State of Data Brasil 2023–2025", { x: M.x, y: 0.5, w: 4.5, h: 0.3, fontSize: 12, color: meta, valign: "middle" });
  texto(s, "contador", `${n}/${TOTAL}`, { x: 5.4, y: 0.5, w: 1.5, h: 0.3, fontSize: 12, color: meta, align: "right", valign: "middle" });
  if (fonte) texto(s, "fonte", FONTE, { x: M.x, y: 8.75, w: M.w, h: 0.3, fontSize: 11, color: meta, valign: "middle" });
  return s;
}

// Numeral enorme alinhado à base da caixa, com legenda logo abaixo
function numeral(s, nome, y, valor, legenda, { cor, corLegenda, tam = 120, hLegenda = 0.75, tamLegenda = 20, w = M.w } = {}) {
  const h = tam / 72 * 1.0;
  texto(s, `${nome}-valor`, valor, { x: M.x - 0.04, y, w, h, fontFace: FONTE_MEDIA, fontSize: tam, color: cor, valign: "bottom", charSpacing: -3 });
  if (legenda) texto(s, `${nome}-legenda`, legenda, { x: M.x, y: y + h + 0.1, w, h: hLegenda, fontSize: tamLegenda, color: corLegenda });
  return y + h + 0.1 + hLegenda;
}

function titulo(s, txt, cor, y = 1.15, h = 1.3, tam = 30) {
  texto(s, "titulo", txt, { x: M.x, y, w: M.w, h, fontFace: FONTE_TITULO, fontSize: tam, color: cor, charSpacing: -0.6, lineSpacingMultiple: 0.95 });
}

const pct = (v) => `${String(v).replace(".", ",")}%`;
const mil = (v) => `R$ ${(v / 1000).toFixed(1).replace(".", ",")} mil`;

// ---------------------------------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------------------------------
const ia = D.ia_adocao;
const usa25 = Math.round(ia.usa[2]);
const res = D.ia_resultados_2025;
const producao = res.pct[0], pilotos = res.pct[1];
const fin = D.financas_2025;
const premio = Math.round((fin.salario_financas / fin.salario_demais - 1) * 100);
const awsMercado = D.cloud_evolucao.series.AWS[2];
const AWS_FINANCAS = 67.7; // consulta Q7b do Athena (sod_silver); não está no JSON da Gold
const mod = D.modelo_trabalho_2025;
const flexivel = Math.round(mod.ideal[0] + mod.ideal[1]);
const presencialIdeal = Math.round(mod.ideal[3]), presencialAtual = Math.round(mod.atual[3]);
const gen = D.genero.total["2025"];

// 1 · Gancho
{
  const s = pagina(1, true);
  let y = numeral(s, "uso", 1.15, `${usa25}%`, "usam IA generativa no trabalho.", { cor: H.papel, corLegenda: H.papel, tam: 130, tamLegenda: 24, hLegenda: 0.5 });
  filete(s, "divisoria", M.x, y + 0.3, M.w, H.ultraClaro, 0.75);
  texto(s, "mas", "Mas só", { x: M.x, y: y + 0.5, w: M.w, h: 0.45, fontSize: 24, color: H.ultraClaro });
  numeral(s, "producao", y + 1.05, `${Math.floor(producao)}%`, "das empresas têm IA em produção.", { cor: H.papel, corLegenda: H.papel, tam: 130, tamLegenda: 24, hLegenda: 0.5 });
  texto(s, "autor", "Gabriel Zacharias", { x: M.x, y: 7.85, w: M.w, h: 0.35, fontFace: FONTE_TITULO, fontSize: 18, color: H.papel });
  texto(s, "contexto", "Tech Challenge Fase 3 · FIAP Pós Tech", { x: M.x, y: 8.25, w: M.w, h: 0.4, fontSize: 16, color: H.ultraClaro });
  s.addNotes("Gancho do carrossel: 98% dos profissionais de dados usam IA generativa (2025), mas só 26,5% das empresas têm IA em produção gerando resultado.");
}

// 2 · O projeto
{
  const s = pagina(2, false, { fonte: true });
  titulo(s, "Uma consultoria simulada para um grande banco", H.tinta, 1.15, 1.0);
  texto(s, "intro", "Três edições do State of Data Brasil viraram recomendações sobre contratação, salários, tecnologia e IA.", { x: M.x, y: 2.3, w: M.w, h: 1.0, fontSize: 18, color: H.tinta2 });
  const linhas = [
    ["3", "edições da pesquisa: 2023, 2024 e 2025", H.tinta],
    ["14.002", "respostas consolidadas num único modelo", H.ultra],
    ["1.190", "colunas harmonizadas entre questionários diferentes", H.tinta],
  ];
  linhas.forEach(([v, l, cor], i) => {
    const y = 3.65 + i * 1.6;
    filete(s, `linha-${i + 1}`, M.x, y, M.w, H.tinta, 1);
    texto(s, `linha-${i + 1}-valor`, v, { x: M.x - 0.03, y: y + 0.12, w: 3.4, h: 1.25, fontFace: FONTE_MEDIA, fontSize: 72, color: cor, valign: "bottom", charSpacing: -2 });
    texto(s, `linha-${i + 1}-legenda`, l, { x: 4.15, y: y + 0.3, w: 2.75, h: 1.05, fontSize: 17, color: H.tinta2, valign: "bottom" });
  });
  s.addNotes("O projeto: consultoria simulada para uma grande instituição financeira, a partir de três edições do State of Data Brasil (14.002 respostas, 1.190 colunas mapeadas no dicionário de dados).");
}

// 3 · A arquitetura
{
  const s = pagina(3, true);
  titulo(s, "Um data lake na AWS, da ingestão à consulta", H.papel, 1.15, 1.0);
  const camadas = [
    ["Raw", "Amazon S3 · CSVs originais das 3 edições"],
    ["Bronze", "Glue PySpark · Parquet e dicionário de colunas"],
    ["Silver", "Glue PySpark · harmonização, deduplicação, faixas salariais em valores"],
    ["Gold", "Glue PySpark · 10 tabelas, uma por pergunta de negócio"],
  ];
  const y0 = 2.45, passo = 1.02;
  camadas.forEach(([nome, desc], i) => {
    const y = y0 + i * passo;
    texto(s, `camada-${i + 1}-nome`, nome, { x: M.x, y, w: 1.75, h: 0.5, fontFace: FONTE_TITULO, fontSize: 26, color: H.papel, valign: "middle" });
    texto(s, `camada-${i + 1}-desc`, desc, { x: 2.45, y: y - 0.05, w: 4.45, h: 0.6, fontSize: 16, color: H.ultraClaro, valign: "middle" });
    if (i < camadas.length - 1) {
      s.addShape(pres.shapes.LINE, { x: M.x + 0.12, y: y + 0.55, w: 0, h: passo - 0.6, line: { color: H.papel, width: 1, endArrowType: "triangle" }, objectName: `seta-${i + 1}` });
    }
  });
  const yb = y0 + 4 * passo + 0.15;
  filete(s, "divisoria", M.x, yb, M.w, H.ultraClaro, 0.75);
  texto(s, "catalogo", "Glue Data Catalog + Amazon Athena", { x: M.x, y: yb + 0.15, w: M.w, h: 0.4, fontSize: 17, color: H.papel });
  [["16", "consultas SQL no Athena, todas com sucesso"], ["0,29", "DPU-hora no pipeline inteiro"]].forEach(([v, l], i) => {
    const x = M.x + i * 3.25;
    texto(s, `stat-${i + 1}-valor`, v, { x: x - 0.03, y: yb + 0.6, w: 3.0, h: 0.95, fontFace: FONTE_MEDIA, fontSize: 60, color: H.papel, valign: "bottom", charSpacing: -2 });
    texto(s, `stat-${i + 1}-legenda`, l, { x, y: yb + 1.6, w: 2.9, h: 0.6, fontSize: 16, color: H.ultraClaro });
  });
  s.addNotes("Arquitetura: S3 nas camadas raw, bronze, silver e gold; quatro jobs PySpark no AWS Glue; Glue Data Catalog; Amazon Athena com 16 consultas. Custo do pipeline: 0,29 DPU-hora.");
}

// 4 · IA: uso x empresa paga
{
  const s = pagina(4, false, { fonte: true });
  titulo(s, "A IA virou rotina. A licença paga pela empresa, ainda não.", H.tinta, 1.15, 1.05);
  s.addChart(pres.charts.LINE, [
    { name: "Usam IA generativa", labels: ia.anos, values: ia.usa },
    { name: "A empresa paga a ferramenta", labels: ia.anos, values: ia.empresa_paga },
  ], {
    x: M.x - 0.1, y: 2.45, w: M.w + 0.2, h: 4.75, objectName: "grafico-ia",
    chartColors: [H.ultra, "55828B"], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 11,
    showValue: true, dataLabelPosition: "t", dataLabelFormatCode: '0"%"', dataLabelFontSize: 18, dataLabelColor: H.tinta,
    dataLabelFontFace: "+mn-lt", catAxisLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
    catAxisLabelFontSize: 16, catAxisLabelColor: H.tinta2, catAxisLineShow: true, catAxisLineColor: H.filete,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 118, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "t", legendFontSize: 16, legendColor: H.tinta2,
  });
  const gap = Math.round(ia.usa[2] - ia.empresa_paga[2]);
  filete(s, "nota-filete", M.x, 7.45, M.w, H.ultra, 2.25);
  texto(s, "nota", `${gap} pontos de distância em 2025: muito uso de IA por conta própria, fora da governança da empresa.`, { x: M.x, y: 7.6, w: M.w, h: 0.95, fontFace: FONTE_MEDIA, fontSize: 18, color: H.ultra });
  s.addNotes("Uso de IA generativa: 80% (2023), 94% (2024), 98% (2025). Empresa paga a ferramenta: 6%, 19%, 42%. A distância indica uso por conta própria.");
}

// 5 · IA em produção x pilotos
{
  const s = pagina(5, true, { fonte: true });
  let y = numeral(s, "producao", 1.0, pct(producao), "das empresas têm IA em produção, gerando resultado.", { cor: H.papel, corLegenda: H.papel, tam: 120, tamLegenda: 22, hLegenda: 0.8 });
  filete(s, "divisoria", M.x, y + 0.25, M.w, H.ultraClaro, 0.75);
  numeral(s, "pilotos", y + 0.45, pct(pilotos), "estão presas em pilotos.", { cor: H.ultraClaro, corLegenda: H.papel, tam: 96, tamLegenda: 22, hLegenda: 0.85 });
  filete(s, "gargalo-filete", M.x, 7.3, M.w, H.papel, 2.25);
  texto(s, "gargalo", "O gargalo não é o modelo: é dado confiável, plataforma e governança.", { x: M.x, y: 7.45, w: M.w, h: 0.9, fontFace: FONTE_TITULO, fontSize: 22, color: H.papel });
  s.addNotes("Resultados com IA em 2025 (visão dos gestores): 26,5% em produção, 38,4% em pilotos com pouco impacto, 15% em investigação, 13,5% ainda não começaram.");
}

// 6 · Finanças
{
  const s = pagina(6, false, { fonte: true });
  titulo(s, "O setor financeiro paga mais e já escolheu a nuvem", H.tinta, 1.15, 1.0);
  let y = numeral(s, "premio", 2.5, `+${premio}%`, `de salário médio em Finanças: ${mil(fin.salario_financas)} contra ${mil(fin.salario_demais)} nos demais setores.`, { cor: H.ultra, corLegenda: H.tinta2, tam: 110, tamLegenda: 18, hLegenda: 0.85 });
  filete(s, "divisoria", M.x, y + 0.2, M.w, H.tinta, 1);
  numeral(s, "aws", y + 0.4, `${Math.round(AWS_FINANCAS)}%`, `dos profissionais de Finanças usam AWS, contra ${pct(awsMercado)} no mercado como um todo.`, { cor: H.tinta, corLegenda: H.tinta2, tam: 96, tamLegenda: 18, hLegenda: 0.85 });
  s.addNotes("Finanças vs. demais setores (2025): salário médio de R$ 14,6 mil contra R$ 12,9 mil (+13%). AWS: 67,7% em Finanças (consulta Q7b) contra 48,3% no mercado.");
}

// 7 · Pessoas
{
  const s = pagina(7, true, { fonte: true });
  let y = numeral(s, "flexivel", 1.0, `${flexivel}%`, "querem trabalho remoto ou híbrido flexível.", { cor: H.papel, corLegenda: H.papel, tam: 110, tamLegenda: 20, hLegenda: 0.5 });
  y = numeral(s, "presencial", y + 0.2, `${presencialIdeal}%`, `querem o 100% presencial, mas ${presencialAtual}% trabalham assim hoje.`, { cor: H.ultraClaro, corLegenda: H.papel, tam: 96, tamLegenda: 20, hLegenda: 0.8 });
  filete(s, "divisoria", M.x, y + 0.15, M.w, H.ultraClaro, 0.75);
  numeral(s, "mulheres", y + 0.3, pct(gen.pct_mulheres), `dos profissionais são mulheres, com gap salarial de ${pct(gen.gap)} e sem melhora em três anos.`, { cor: H.papel, corLegenda: H.papel, tam: 80, tamLegenda: 20, hLegenda: 0.8 });
  s.addNotes("Modelo de trabalho 2025: 85% querem remoto (42%) ou híbrido flexível (43%); 1,9% querem presencial e 20,8% trabalham assim. Mulheres: 22,0% dos profissionais, gap salarial de 19,4%.");
}

// 8 · Recomendação
{
  const s = pagina(8, false);
  titulo(s, "O que recomendo ao banco", H.tinta, 1.15, 0.6);
  const passos = [
    ["Governar a IA já", "Licença corporativa, política de uso e LGPD: 98% usam IA, mas só 42% têm a ferramenta paga pela empresa."],
    ["Levar os pilotos à produção", "MLOps, dados confiáveis e uma plataforma Medallion na AWS: 38% das empresas estão paradas em piloto."],
    ["Reter talento", "Carreira em Y, híbrido flexível (o ponto fraco do setor) e equidade salarial por gênero."],
  ];
  passos.forEach(([t, d], i) => {
    const y = 2.15 + i * 2.15;
    filete(s, `passo-${i + 1}-filete`, M.x, y, M.w, H.tinta, 1);
    texto(s, `passo-${i + 1}-num`, String(i + 1), { x: M.x - 0.03, y: y + 0.12, w: 0.9, h: 1.0, fontFace: FONTE_MEDIA, fontSize: 64, color: H.ultra, valign: "top", charSpacing: -2 });
    texto(s, `passo-${i + 1}-titulo`, t, { x: 1.65, y: y + 0.2, w: 5.25, h: 0.5, fontFace: FONTE_TITULO, fontSize: 24, color: H.tinta });
    texto(s, `passo-${i + 1}-texto`, d, { x: 1.65, y: y + 0.78, w: 5.25, h: 1.2, fontSize: 17, color: H.tinta2 });
  });
  s.addNotes("Recomendação em três passos: governar a IA (licença corporativa e LGPD), levar os pilotos à produção com MLOps e reter talento com carreira em Y e flexibilidade.");
}

// 9 · Chamada para o código
{
  const s = pagina(9, true);
  titulo(s, "Código aberto\nno GitHub", H.papel, 1.15, 1.4, 44);
  texto(s, "conteudo", "Notebooks PySpark, consultas SQL do Athena, arquitetura em Draw.io e o deck completo.", { x: M.x, y: 2.75, w: M.w, h: 1.0, fontSize: 20, color: H.ultraClaro });
  filete(s, "divisoria", M.x, 4.15, M.w, H.papel, 1);
  texto(s, "repo", [
    { text: "github.com/gabrielmzacharias-cloud/", options: { breakLine: true, hyperlink: { url: `https://${REPO}` } } },
    { text: "tech-challenge-fase3-state-of-data", options: { hyperlink: { url: `https://${REPO}` } } },
  ], { x: M.x, y: 4.4, w: M.w, h: 1.0, fontFace: MONO, fontSize: 17, color: H.papel, lineSpacingMultiple: 1.2 });
  texto(s, "autor", "Gabriel Zacharias", { x: M.x, y: 7.75, w: M.w, h: 0.4, fontFace: FONTE_TITULO, fontSize: 20, color: H.papel });
  texto(s, "fiap", "FIAP Pós Tech · Data Analytics · Tech Challenge Fase 3", { x: M.x, y: 8.2, w: M.w, h: 0.6, fontSize: 16, color: H.ultraClaro });
  s.addNotes(`Código aberto: https://${REPO}`);
}

// ---------------------------------------------------------------------------------------------
(async () => {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  await pres.writeFile({ fileName: SAIDA });
  const skill = process.env.PPTX_SKILL_DIR;
  if (skill) {
    const { applyTheme } = require(path.join(skill, "scripts", "apply_theme.js"));
    await applyTheme(SAIDA, THEME);
  } else {
    console.warn("PPTX_SKILL_DIR não definido: cores do tema não aplicadas");
  }
  console.log(`carrossel gravado em ${SAIDA}`);
})().catch((e) => { console.error(e); process.exit(1); });
