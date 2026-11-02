/* Gera o deck executivo do Tech Challenge Fase 3 (pptxgenjs, deck estruturado: tema, layouts, seções).
 *
 * Pré-requisitos: python scripts/exportar_dados_deck.py   (séries dos gráficos nativos, a partir da Gold)
 *                 python scripts/preparar_graficos_deck.py (diagrama de arquitetura em entrega/assets/charts)
 * Uso:            NODE_PATH=<node_modules com pptxgenjs, react, react-dom, react-icons, sharp>
 *                 PPTX_SKILL_DIR=<skill pptx> node scripts/gerar_deck.js
 * Saída:          entrega/TechChallenge_Fase3_DTAT.pptx
 *
 * Os gráficos são nativos do PowerPoint e leem entrega/assets/dados_deck.json; os números citados nos textos
 * vêm das mesmas tabelas Gold (sql/02_consultas_analiticas.sql reproduz cada um).
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const LU = require("react-icons/lu");

const RAIZ = process.env.DECK_RAIZ || path.resolve(__dirname, "..");
const ASSETS = path.join(RAIZ, "entrega", "assets", "charts");
const EVIDENCIAS = path.join(RAIZ, "entrega", "evidencias");
const SAIDA = process.env.DECK_SAIDA || path.join(RAIZ, "entrega", "TechChallenge_Fase3_DTAT.pptx");
const PROPORCAO = JSON.parse(fs.readFileSync(path.join(ASSETS, "tamanhos.json"), "utf8"));
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, "entrega", "assets", "dados_deck.json"), "utf8"));

// ---------------------------------------------------------------------------------------------
// Tema: navy institucional, azul de apoio e laranja reservado ao ponto de cada slide
// ---------------------------------------------------------------------------------------------
const THEME = {
  name: "State of Data BR",
  headFontFace: "Segoe UI Semibold",
  bodyFontFace: "Segoe UI",
  colors: {
    dk1: "1B1F24", lt1: "FFFFFF", dk2: "0B2545", lt2: "EFF3F8",
    accent1: "2A6FDB", accent2: "E0592A", accent3: "0F9B76", accent4: "E8A317",
    accent5: "163E73", accent6: "9CC0F5", hlink: "2A6FDB", folHlink: "163E73",
  },
};
// Cores em hex para opções que não aceitam cor de esquema (gráficos, tabelas, ícones)
const H = {
  navy: "0B2545", azul: "2A6FDB", laranja: "E0592A", verde: "0F9B76", tinta: "1B1F24", tinta2: "5B6573",
  cinza: "B8C4D3", eixo: "C9D2DD", linha: "DDE3EA", lt2: "EFF3F8", branco: "FFFFFF", ac5: "163E73", ac6: "9CC0F5",
  a23: "A9C6F2", a24: "5B93E0", a25: "1D4E9E", codigo: "10213A", comentario: "8FA3BF", codigoTexto: "E6EDF3",
};
const TITULO = "+mj-lt"; // fonte de título do tema (Segoe UI Semibold), para números e ênfases
const MONO = "Consolas";
const FONTE = "Fonte: State of Data Brasil 2023, 2024 e 2025 (Data Hackers e Bain & Company)";
const fonteTabela = (t) => `${FONTE} · tabela sod_gold.${t}`;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13,33 x 7,5 pol
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "State of Data Brasil 2023-2025: o mercado de dados e IA";
pres.subject = "Tech Challenge Fase 3 - Big Data to Analytics";
pres.author = "FIAP Pós Tech DTAT";
pres.company = "FIAP Pós Tech";
const C = pres.SchemeColor;

// ---------------------------------------------------------------------------------------------
// Ícones (lucide via react-icons), pré-renderizados em PNG nas cores usadas no deck.
// Cada bloco de slides acrescenta os seus com NOMES_ICONES.push(...).
// ---------------------------------------------------------------------------------------------
const NOMES_ICONES = ["LuLandmark"];
const CORES_ICONES = [H.branco, H.azul, H.laranja, H.verde, H.navy, H.tinta2, H.ac6, H.cinza];
const ICONES = {};
async function prepararIcones() {
  for (const nome of new Set(NOMES_ICONES)) {
    const Icone = LU[nome];
    if (typeof Icone !== "function") throw new Error(`ícone inexistente em react-icons/lu: ${nome}`);
    ICONES[nome] = {};
    for (const cor of CORES_ICONES) {
      const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icone, { color: `#${cor}`, size: 256 }));
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      ICONES[nome][cor] = "image/png;base64," + png.toString("base64");
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Layouts
// ---------------------------------------------------------------------------------------------
function definirLayouts() {
  pres.defineSlideMaster({
    title: "CAPA",
    background: { color: C.text2 },
    objects: [
      { text: { text: "FIAP PÓS TECH  ·  DATA ANALYTICS  ·  TECH CHALLENGE FASE 3", options: { x: 0.8, y: 0.65, w: 9.0, h: 0.35, fontSize: 12, color: C.accent6, charSpacing: 2, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 1.55, w: 7.7, h: 2.75, fontSize: 40, color: C.background1, valign: "bottom", margin: 0, lineSpacingMultiple: 0.95 }, text: "" } },
      { placeholder: { options: { name: "subtitulo", type: "body", x: 0.8, y: 4.55, w: 7.4, h: 1.0, fontSize: 18, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "DIVISOR",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "numero", type: "body", x: 0.8, y: 1.45, w: 4.0, h: 1.4, fontSize: 66, color: C.accent2, fontFace: THEME.headFontFace, valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 3.0, w: 8.2, h: 1.2, fontSize: 38, color: C.background1, valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "corpo", type: "body", x: 0.8, y: 4.3, w: 7.6, h: 1.4, fontSize: 18, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "CONTEUDO",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "kicker", type: "body", x: 0.6, y: 0.36, w: 9.3, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 1.5, valign: "middle", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.6, y: 0.74, w: 12.13, h: 1.0, fontSize: 24, color: C.text2, valign: "top", margin: 0, lineSpacingMultiple: 0.95 }, text: "" } },
      { rect: { x: 0.6, y: 6.93, w: 12.13, h: 0.012, fill: { color: H.linha } } },
      { placeholder: { options: { name: "fonte", type: "body", x: 0.6, y: 7.0, w: 11.2, h: 0.3, fontSize: 9, color: H.tinta2, valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.23, y: 7.0, w: 0.5, h: 0.3, fontSize: 9, color: H.tinta2, align: "right" },
  });

  pres.defineSlideMaster({
    title: "ENCERRAMENTO",
    background: { color: C.text2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.8, y: 0.8, w: 11.7, h: 1.45, fontSize: 36, color: C.background1, valign: "bottom", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "corpo", type: "body", x: 0.8, y: 2.45, w: 10.6, h: 1.25, fontSize: 18, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
    ],
  });
}

// ---------------------------------------------------------------------------------------------
// Blocos de composição
// ---------------------------------------------------------------------------------------------
const BLOCOS = []; // cada arquivo de slides registra sua função com BLOCOS.push(...)
let SECAO;
function secao(titulo) {
  pres.addSection({ title: titulo });
  SECAO = titulo;
}

function caixa(s, nome, x, y, w, h, cor, borda) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: cor }, rectRadius: 0.08, objectName: nome,
    line: borda ? { color: borda, width: 0.75 } : { type: "none" },
  });
}

function texto(s, nome, conteudo, opcoes) {
  s.addText(conteudo, { margin: 0, valign: "top", isTextBox: true, objectName: nome, ...opcoes });
}

function rotulo(s, nome, txt, x, y, w, cor = C.accent1) {
  texto(s, nome, txt.toUpperCase(), { x, y, w, h: 0.28, fontSize: 11, bold: true, color: cor, charSpacing: 1.5, valign: "middle" });
}

function marcadores(itens, tamanho = 12.5, cor = C.text1, espaco = 6) {
  return itens.map((t, i) => ({
    text: t,
    options: { bullet: { indent: 13 }, fontSize: tamanho, color: cor, paraSpaceAfter: espaco, breakLine: i < itens.length - 1 },
  }));
}

function icone(s, nome, icn, cor, x, y, d) {
  const dados = ICONES[icn] && ICONES[icn][cor];
  if (!dados) throw new Error(`ícone ${icn} não pré-renderizado na cor ${cor}`);
  s.addImage({ data: dados, x, y, w: d, h: d, objectName: nome, altText: "" });
}

// Ícone dentro de um círculo: o motivo visual do deck
function circuloIcone(s, nome, icn, x, y, d, fundo = C.background2, cor = H.azul) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fundo }, line: { type: "none" }, objectName: nome });
  const p = d * 0.24;
  icone(s, `${nome}-icone`, icn, cor, x + p, y + p, d - 2 * p);
}

function circuloNumero(s, nome, x, y, d, txt, fundo = C.text2, cor = C.background1, tam = 14) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fundo }, line: { type: "none" }, objectName: nome });
  texto(s, `${nome}-num`, txt, { x, y, w: d, h: d, fontFace: TITULO, fontSize: tam, color: cor, align: "center", valign: "middle" });
}

// Indicador das sete perguntas no canto superior direito dos slides de análise
function progresso(s, atual) {
  for (let i = 1; i <= 7; i++) {
    const ativo = i === atual;
    circuloNumero(s, `progresso-${i}`, 10.21 + (i - 1) * 0.37, 0.36, 0.3, String(i), ativo ? C.accent2 : C.background2, ativo ? C.background1 : H.tinta2, 9);
  }
}

function slideConteudo(kicker, titulo, fonte = FONTE, pergunta) {
  const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: SECAO });
  s.addText(kicker.toUpperCase(), { placeholder: "kicker" });
  s.addText(titulo, { placeholder: "title" });
  s.addText(fonte, { placeholder: "fonte" });
  if (pergunta) progresso(s, pergunta);
  return s;
}

function slideDivisor(numero, titulo, corpo, icn, notas) {
  const s = pres.addSlide({ masterName: "DIVISOR", sectionTitle: SECAO });
  s.addText(numero, { placeholder: "numero" });
  s.addText(titulo, { placeholder: "title" });
  s.addText(corpo, { placeholder: "corpo" });
  s.addShape(pres.shapes.OVAL, { x: 9.35, y: 1.75, w: 3.4, h: 3.4, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "divisor-circulo" });
  icone(s, "divisor-icone", icn, H.ac6, 10.2, 2.6, 1.7);
  s.addNotes(notas);
  return s;
}

// Número grande + legenda
function numeroDestaque(s, nome, x, y, w, valor, legenda, { cor = C.text2, tam = 40, hValor = 0.75, hLegenda = 0.72, tamLegenda = 12.5 } = {}) {
  texto(s, `${nome}-valor`, valor, { x, y, w, h: hValor, fontFace: TITULO, fontSize: tam, color: cor, valign: "bottom" });
  texto(s, `${nome}-legenda`, legenda, { x, y: y + hValor + 0.06, w, h: hLegenda, fontSize: tamLegenda, color: H.tinta2 });
}

// Cartão com número grande e legenda
function cartaoNumero(s, nome, x, y, w, h, valor, legenda, { cor = C.text2, tam = 24, tamLegenda = 11.5, fundo = C.background2 } = {}) {
  caixa(s, nome, x, y, w, h, fundo);
  texto(s, `${nome}-valor`, valor, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.55, fontFace: TITULO, fontSize: tam, color: cor, valign: "bottom" });
  texto(s, `${nome}-legenda`, legenda, { x: x + 0.2, y: y + 0.78, w: w - 0.4, h: h - 0.9, fontSize: tamLegenda, color: H.tinta2 });
}

// Caixa navy "Para o banco": a implicação de negócio de cada slide de análise
function paraBanco(s, x, y, w, h, txt, tam = 12.5) {
  caixa(s, "para-banco", x, y, w, h, C.text2);
  icone(s, "para-banco-icone", "LuLandmark", H.ac6, x + 0.22, y + 0.2, 0.28);
  rotulo(s, "para-banco-rotulo", "Para o banco", x + 0.6, y + 0.2, w - 0.8, C.accent6);
  texto(s, "para-banco-texto", txt, { x: x + 0.22, y: y + 0.6, w: w - 0.44, h: h - 0.7, fontSize: tam, color: C.background1 });
}

// Coluna lateral padrão: número de destaque, evidências e caixa "Para o banco" (y 1,85 a 6,8)
function painelLateral(s, x, { hero, dados, banco, w = 3.83, tamDados = 12 }) {
  numeroDestaque(s, "destaque", x, 1.85, w, hero[0], hero[1], { cor: hero[2] || C.accent2 });
  s.addShape(pres.shapes.RECTANGLE, { x, y: 3.5, w, h: 0.012, fill: { color: H.linha }, line: { type: "none" }, objectName: "painel-divisoria" });
  texto(s, "painel-dados", marcadores(dados, tamDados), { x, y: 3.64, w, h: 1.56 });
  paraBanco(s, x, 5.3, w, 1.5, banco);
}

// Linha de unidade acima de cada gráfico
function legendaGrafico(s, nome, txt, x, y, w) {
  texto(s, nome, txt, { x, y, w, h: 0.3, fontSize: 11, color: H.tinta2, valign: "middle" });
}

// Opções base dos gráficos nativos (objeto novo a cada chamada: o pptxgenjs altera as opções)
function grafico(extra) {
  return Object.assign({
    catAxisLabelColor: H.tinta2, valAxisLabelColor: H.tinta2,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
    catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, dataLabelFontSize: 10.5, legendFontSize: 11, legendColor: H.tinta2,
    catAxisLineShow: true, catAxisLineColor: H.eixo,
    valAxisHidden: true, valAxisLineShow: false, valAxisMinVal: 0,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showValue: true, dataLabelColor: H.tinta, dataLabelPosition: "outEnd",
    showLegend: false, barGapWidthPct: 55,
  }, extra);
}
const PCT1 = '0.0"%"';
const PCT0 = '0"%"';
const PCT0_SEM_ZERO = '0"%";-0"%";""';
const MIL = '"R$ "0.0" mil"';

const CURTO = {
  "Engenheiro(a)/Arquiteto(a) de Dados": "Eng./Arq. de Dados", "Engenheiro(a) de ML/IA": "Eng. de ML/IA",
  "Product Manager de Dados": "PM de Dados", "Tecnologia/Fábrica de Software": "Tecnologia/Software",
  "Área de Consultoria": "Consultoria", "Área da Saúde": "Saúde", "Internet/Ecommerce": "Internet/E-commerce",
  "Somente Excel/Planilhas": "Só Excel/Planilhas", "On-premise (sem cloud)": "On-premise", "Google BigQuery": "BigQuery",
  "Especialista/Staff+": "Especialista", "Norte": "Norte*",
  "Em produção, gerando resultado": "Em produção", "Pilotos com pouco impacto": "Pilotos",
  "Em investigação/planejamento": "Investigação", "Ainda não começou": "Não começou",
};
const curto = (t) => CURTO[t] || t;
// Uma cor por categoria: destaque pela regra, cinza para o resto
const coresPor = (categorias, regra) => categorias.map((c) => regra(c) || H.cinza);

// Barras horizontais de uma série, maior no topo (cores: uma por categoria)
function barrasH(s, nome, categorias, valores, cores, x, y, w, h, extra = {}) {
  s.addChart(pres.charts.BAR, [{ name: nome, labels: categorias.map(curto), values: valores }], grafico({
    x, y, w, h, barDir: "bar", catAxisOrientation: "maxMin", chartColors: cores, dataLabelFormatCode: PCT1,
    objectName: nome, ...extra,
  }));
}

// =============================================================================================
// ABERTURA E ARQUITETURA (slides 1 a 7)
// =============================================================================================
NOMES_ICONES.push(
  "LuBrainCircuit", "LuRocket", "LuBadgeDollarSign", "LuUsers", "LuShieldCheck", "LuGraduationCap", "LuHouse",
  "LuTarget", "LuWorkflow", "LuFilter", "LuLayers", "LuArchive", "LuDatabase", "LuChartBar", "LuChevronRight",
);

BLOCOS.push(function slidesAbertura() {
  secao("Abertura");

  // 1 · Capa
  {
    const s = pres.addSlide({ masterName: "CAPA", sectionTitle: SECAO });
    s.addText("O mercado de dados e IA no Brasil: o que o banco precisa saber", { placeholder: "title" });
    s.addText("State of Data Brasil 2023, 2024 e 2025 · Análise para uma grande instituição financeira", { placeholder: "subtitulo", bullet: false });
    texto(s, "integrantes", "Grupo 28 · Gabriel Zacharias · RM 375453 · Novembro de 2026", { x: 0.8, y: 6.2, w: 7.6, h: 0.4, fontSize: 14, color: C.background1 });

    // Colunas: uso de IA generativa por edição
    const { anos, usa } = D.ia_adocao;
    const cores = [H.a25, H.azul, H.laranja];
    const base = 5.55, hMax = 3.4, w = 0.9;
    usa.forEach((v, i) => {
      const x = 9.3 + i * 1.25, h = (v / 100) * hMax;
      s.addShape(pres.shapes.RECTANGLE, { x, y: base - h, w, h, fill: { color: cores[i] }, line: { type: "none" }, objectName: `capa-coluna-${anos[i]}` });
      texto(s, `capa-coluna-${anos[i]}-valor`, `${Math.round(v)}%`, { x: x - 0.2, y: base - h - 0.5, w: w + 0.4, h: 0.45, fontFace: TITULO, fontSize: 20, color: C.background1, align: "center", valign: "bottom" });
      texto(s, `capa-coluna-${anos[i]}-ano`, anos[i], { x: x - 0.2, y: base + 0.1, w: w + 0.4, h: 0.3, fontSize: 12, color: C.accent6, align: "center", valign: "middle" });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.15, y: base, w: 3.65, h: 0.015, fill: { color: H.a24 }, line: { type: "none" }, objectName: "capa-base" });
    texto(s, "capa-legenda", "profissionais que usam IA generativa no trabalho", { x: 9.15, y: 6.05, w: 3.65, h: 0.5, fontSize: 11, color: C.accent6, align: "center" });

    s.addNotes(
      "Abertura. Somos a consultoria contratada para traduzir três anos de pesquisa State of Data Brasil em decisões para o banco: " +
      "quem contratar, quanto pagar, que tecnologia adotar e como transformar IA em resultado. " +
      "Toda a análise foi construída num data lake na AWS (S3, Glue e Athena), com código entregue junto deste material."
    );
  }

  // 2 · Sumário executivo
  {
    const s = slideConteudo("Sumário executivo", "O mercado de dados adotou a IA em massa; o desafio agora é escalar e reter talento");
    rotulo(s, "mensagem-rotulo", "Mensagem principal", 0.6, 1.95, 5.6, C.accent2);
    texto(s, "mensagem-texto",
      "O mercado de dados brasileiro está mais sênior, mais caro e já usa IA no dia a dia, mas poucas empresas transformaram IA em resultado. " +
      "O banco parte em vantagem (paga mais e retém melhor que o mercado) e pode liderar se escalar IA com governança, " +
      "formar talentos de ML/IA e oferecer a flexibilidade que 85% dos profissionais desejam.",
      { x: 0.6, y: 2.35, w: 5.7, h: 3.6, fontSize: 20, color: C.text2, lineSpacingMultiple: 1.1 });

    const cards = [
      ["98%", "usam IA generativa no trabalho (eram 80% em 2023)", "LuBrainCircuit"],
      ["26%", "das empresas têm IA em produção; 38% ainda em piloto", "LuRocket", true],
      ["+13%", "de salário médio em Finanças frente aos demais setores", "LuBadgeDollarSign"],
      ["22%", "dos profissionais são mulheres, com gap salarial de 19%", "LuUsers"],
    ];
    const cw = 2.95, ch = 1.95, gap = 0.18;
    cards.forEach(([v, l, icn, destaque], i) => {
      const x = 6.65 + (i % 2) * (cw + gap), y = 1.85 + Math.floor(i / 2) * (ch + gap);
      caixa(s, `kpi-${i + 1}`, x, y, cw, ch, C.background2);
      texto(s, `kpi-${i + 1}-valor`, v, { x: x + 0.22, y: y + 0.18, w: cw - 1.0, h: 0.7, fontFace: TITULO, fontSize: 34, color: destaque ? C.accent2 : C.text2, valign: "middle" });
      circuloIcone(s, `kpi-${i + 1}-icone`, icn, x + cw - 0.72, y + 0.22, 0.5, C.background1, destaque ? H.laranja : H.azul);
      texto(s, `kpi-${i + 1}-legenda`, l, { x: x + 0.22, y: y + 0.98, w: cw - 0.44, h: 0.85, fontSize: 12, color: H.tinta2 });
    });

    rotulo(s, "alavancas-rotulo", "Três alavancas", 0.6, 6.3, 1.9, C.accent1);
    const chips = [["Governar e escalar a IA", "LuShieldCheck"], ["Formar talento de ML/IA", "LuGraduationCap"], ["Flexibilidade como alavanca", "LuHouse"]];
    const kw = (12.73 - 2.6 - 0.3) / 3;
    chips.forEach(([t, icn], i) => {
      const x = 2.6 + i * (kw + 0.15);
      caixa(s, `alavanca-${i + 1}`, x, 6.15, kw, 0.6, C.background1, H.linha);
      icone(s, `alavanca-${i + 1}-icone`, icn, H.azul, x + 0.2, 6.3, 0.3);
      texto(s, `alavanca-${i + 1}-texto`, t, { x: x + 0.62, y: 6.15, w: kw - 0.75, h: 0.6, fontFace: TITULO, fontSize: 13, color: C.text2, valign: "middle" });
    });
    s.addNotes(
      "Se o comitê só puder levar uma mensagem: IA já é rotina para quase todos os profissionais de dados, mas só um quarto das empresas a colocou em produção. " +
      "O setor financeiro paga 13% acima do mercado e tem profissionais mais satisfeitos, o que é uma base forte. " +
      "Os pontos de atenção são diversidade (22% de mulheres e gap de 19%, sem melhora em três anos) e flexibilidade de trabalho, onde Finanças fica atrás do mercado."
    );
  }

  // 3 · Contexto e escopo
  {
    const s = slideConteudo("Contexto e escopo", "Três edições e 14 mil respostas: uma radiografia do mercado de dados");
    const blocos = [
      ["O desafio", "Uma grande instituição financeira quer entender o mercado de dados e IA no Brasil para orientar contratação, retenção, investimento em tecnologia e adoção de IA.", "LuTarget"],
      ["A abordagem", "Consolidamos as três edições mais recentes do State of Data Brasil num data lake na AWS (S3, Glue e Athena), com camadas Bronze, Silver e Gold e análises em PySpark.", "LuWorkflow"],
      ["O recorte", "As análises de mercado usam os 12.841 profissionais que atuam com dados. Salário é o ponto médio da faixa declarada.", "LuFilter"],
    ];
    blocos.forEach(([t, d, icn], i) => {
      const y = 1.9 + i * 1.65;
      circuloIcone(s, `bloco-${i + 1}-icone`, icn, 0.6, y, 0.62);
      rotulo(s, `bloco-${i + 1}-rotulo`, t, 1.45, y + 0.02, 5.6, C.accent2);
      texto(s, `bloco-${i + 1}-texto`, d, { x: 1.45, y: y + 0.38, w: 5.75, h: 1.15, fontSize: 15, color: C.text1 });
    });

    // Painel navy com os números da base
    const px = 7.6, pw = 5.13;
    caixa(s, "escopo-painel", px, 1.85, pw, 4.95, C.text2);
    rotulo(s, "escopo-rotulo", "Base da análise", px + 0.35, 2.1, pw - 0.7, C.accent6);
    texto(s, "escopo-total", "14.002", { x: px + 0.35, y: 2.4, w: pw - 0.7, h: 0.75, fontFace: TITULO, fontSize: 40, color: C.background1, valign: "bottom" });
    texto(s, "escopo-total-legenda", "respostas nas edições 2023, 2024 e 2025", { x: px + 0.35, y: 3.2, w: pw - 0.7, h: 0.35, fontSize: 12.5, color: C.accent6 });
    const edicoes = ["2023", "2024", "2025"].map((a) => [a, D.kpis[a].respondentes]);
    const maxN = Math.max(...edicoes.map((e) => e[1]));
    edicoes.forEach(([ano, n], i) => {
      const y = 3.72 + i * 0.36, bw = (n / maxN) * 3.0;
      texto(s, `edicao-${ano}-ano`, ano, { x: px + 0.35, y, w: 0.55, h: 0.24, fontSize: 11, color: C.background1, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: px + 0.95, y: y + 0.02, w: bw, h: 0.2, fill: { color: H.ac6 }, line: { type: "none" }, objectName: `edicao-${ano}-barra` });
      texto(s, `edicao-${ano}-n`, n.toLocaleString("pt-BR"), { x: px + 1.05 + bw, y, w: 0.8, h: 0.24, fontSize: 11, color: C.background1, valign: "middle" });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: px + 0.35, y: 4.95, w: pw - 0.7, h: 0.012, fill: { color: H.ac5 }, line: { type: "none" }, objectName: "escopo-divisoria" });
    [["12.841", "atuam com dados: a base das análises"], ["1.190", "colunas mapeadas no dicionário de dados"]].forEach(([v, l], i) => {
      const x = px + 0.35 + i * 2.3;
      texto(s, `escopo-${i + 1}-valor`, v, { x, y: 5.1, w: 2.1, h: 0.55, fontFace: TITULO, fontSize: 26, color: C.background1, valign: "bottom" });
      texto(s, `escopo-${i + 1}-legenda`, l, { x, y: 5.7, w: 2.1, h: 0.8, fontSize: 11.5, color: C.accent6 });
    });
    s.addNotes(
      "O State of Data Brasil é a maior pesquisa sobre o mercado de dados no país, feita pela Data Hackers com a Bain & Company. " +
      "Usamos as três edições mais recentes: 5.293 respostas em 2023, 5.215 em 2024 e 3.494 em 2025. " +
      "Como as perguntas mudam entre edições, harmonizamos cargos, senioridade e faixas salariais na camada Silver para comparar os anos."
    );
  }

  // 4 · Agenda
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
    const gap = 0.25, w = (12.13 - 3 * gap) / 4, h = 2.35;
    const pos = (i) => [0.6 + (i % 4) * (w + gap), 1.9 + Math.floor(i / 4) * (h + 0.2)];

    // Cartão 0: a parte de construção
    {
      const [x, y] = pos(0);
      caixa(s, "agenda-parte1", x, y, w, h, C.text2);
      circuloIcone(s, "agenda-parte1-icone", "LuLayers", x + 0.22, y + 0.22, 0.5, C.accent5, H.ac6);
      rotulo(s, "agenda-parte1-rotulo", "Parte 1", x + 0.22, y + 0.88, w - 0.44, C.accent6);
      texto(s, "agenda-parte1-titulo", "Como construímos", { x: x + 0.22, y: y + 1.18, w: w - 0.44, h: 0.4, fontFace: TITULO, fontSize: 16, color: C.background1, valign: "middle" });
      texto(s, "agenda-parte1-texto", "Arquitetura AWS, camadas Medallion, código e evidências", { x: x + 0.22, y: y + 1.6, w: w - 0.44, h: 0.65, fontSize: 12, color: C.accent6 });
    }
    itens.forEach(([p, r], k) => {
      const [x, y] = pos(k + 1);
      caixa(s, `agenda-${k + 1}`, x, y, w, h, C.background2);
      circuloNumero(s, `agenda-${k + 1}-num`, x + 0.22, y + 0.22, 0.5, String(k + 1));
      texto(s, `agenda-${k + 1}-pergunta`, p, { x: x + 0.22, y: y + 0.85, w: w - 0.44, h: 0.62, fontFace: TITULO, fontSize: 15, color: C.text2, valign: "top" });
      texto(s, `agenda-${k + 1}-resposta`, r, { x: x + 0.22, y: y + 1.5, w: w - 0.44, h: 0.75, fontSize: 12, color: H.tinta2 });
    });
    s.addNotes("Estruturamos a apresentação nas sete perguntas do desafio. Ao lado de cada uma está a resposta curta; os próximos slides mostram a evidência de cada resposta.");
  }

  // =============================================================================================
  // ARQUITETURA
  // =============================================================================================
  secao("Arquitetura");

  // 5 · Divisor
  slideDivisor("01", "Como construímos", "Arquitetura na AWS, camadas Medallion, regras de qualidade e evidências da execução", "LuLayers",
    "Primeira parte: como o pipeline foi construído na AWS, da ingestão às consultas no Athena.");

  // 6 · Arquitetura AWS
  {
    const s = slideConteudo("Arquitetura AWS", "Pipeline serverless na AWS: S3 + Glue + Athena, dentro do AWS Academy", "Diagrama: arquitetura/arquitetura_aws.drawio");
    const r = PROPORCAO.arquitetura_aws;
    let h = 4.9, w = h * r;
    if (w > 12.13) { w = 12.13; h = w / r; }
    s.addImage({ path: path.join(ASSETS, "arquitetura_aws.png"), x: (13.333 - w) / 2, y: 1.85 + (4.9 - h) / 2, w, h, objectName: "diagrama-arquitetura",
      altText: "Arquitetura: Kaggle para S3 raw, AWS Glue Jobs gerando Bronze, Silver e Gold no S3, Glue Data Catalog, Amazon Athena e etapa de análise e gráficos em PySpark" });
    s.addNotes(
      "Os CSVs do Kaggle são enviados ao S3 na zona raw pelo console (ou pela AWS CLI no CloudShell). Três jobs do AWS Glue em PySpark produzem as camadas Bronze, Silver e Gold, " +
      "sempre em Parquet e registradas no Glue Data Catalog. O Athena consulta a Gold com SQL e um quarto job do Glue (o mesmo código do notebook 04) gera os gráficos. " +
      "Tudo é serverless e roda com a LabRole do AWS Academy: não há servidor para manter e o custo é por uso."
    );
  }

  // 7 · Medallion
  {
    const s = slideConteudo("Arquitetura AWS", "Arquitetura Medallion: do CSV bruto a 10 tabelas Gold prontas para o negócio", "Código: notebooks/01_bronze_ingestao, 02_silver_tratamento, 03_gold_agregacoes");
    const camadas = [
      ["RAW", "s3://…/raw/", "CSVs originais do Kaggle, uma pasta por edição.", "Console S3 / CLI · 01_ingestao_s3.sh", "3 edições", "LuArchive"],
      ["BRONZE", "sod_bronze", "Parquet com colunas normalizadas, ano da pesquisa e dicionário de perguntas.", "Glue · 01_bronze_ingestao", "402 / 406 / 391 colunas", "LuDatabase"],
      ["SILVER", "sod_silver", "Modelo harmonizado entre anos; faixas viram valores; respostas múltiplas em formato longo.", "Glue · 02_silver_tratamento", "14.002 respondentes", "LuFilter"],
      ["GOLD", "sod_gold", "Tabelas agregadas, uma por pergunta de negócio, prontas para o Athena.", "Glue · 03_gold_agregacoes", "10 tabelas", "LuChartBar"],
    ];
    const topo = [H.a23, H.a24, H.a25, H.navy];
    const gap = 0.36, w = (12.13 - 3 * gap) / 4, y = 1.85, h = 4.25;
    camadas.forEach(([nome, local, desc, job, stat, icn], i) => {
      const x = 0.6 + i * (w + gap), id = nome.toLowerCase();
      const claro = i === 0, corTexto = claro ? C.text2 : C.background1;
      caixa(s, `camada-${id}`, x, y, w, h, C.background2);
      caixa(s, `camada-${id}-topo`, x, y, w, 0.95, topo[i]);
      icone(s, `camada-${id}-icone`, icn, claro ? H.navy : H.branco, x + 0.22, y + 0.25, 0.45);
      texto(s, `camada-${id}-nome`, [
        { text: nome, options: { fontFace: TITULO, fontSize: 19, charSpacing: 1, breakLine: true } },
        { text: local, options: { fontFace: MONO, fontSize: 11.5 } },
      ], { x: x + 0.85, y: y + 0.1, w: w - 1.0, h: 0.75, color: corTexto, valign: "middle" });
      texto(s, `camada-${id}-desc`, desc, { x: x + 0.22, y: y + 1.18, w: w - 0.44, h: 1.5, fontSize: 14, color: C.text1 });
      texto(s, `camada-${id}-job`, job, { x: x + 0.22, y: y + 2.72, w: w - 0.44, h: 0.55, fontSize: 11.5, color: H.tinta2 });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.22, y: y + 3.38, w: w - 0.44, h: 0.012, fill: { color: H.linha }, line: { type: "none" }, objectName: `camada-${id}-linha` });
      texto(s, `camada-${id}-stat`, stat, { x: x + 0.22, y: y + 3.48, w: w - 0.44, h: 0.6, fontFace: TITULO, fontSize: 15.5, color: C.text2, valign: "middle" });
      if (i < 3) icone(s, `seta-${i + 1}`, "LuChevronRight", H.cinza, x + w + 0.04, y + h / 2 - 0.14, 0.28);
    });
    texto(s, "catalogo", [
      { text: "Glue Data Catalog ", options: { fontFace: TITULO, color: C.text2 } },
      { text: "registra sod_bronze, sod_silver e sod_gold  ·  " },
      { text: "Athena ", options: { fontFace: TITULO, color: C.text2 } },
      { text: "consulta a Gold com SQL  ·  " },
      { text: "Glue Job 04 ", options: { fontFace: TITULO, color: C.text2 } },
      { text: "gera os gráficos em PySpark" },
    ], { x: 0.6, y: 6.3, w: 12.13, h: 0.45, fontSize: 13.5, color: C.text1, valign: "middle", align: "center" });
    s.addNotes(
      "Cada camada tem um papel. Raw guarda o arquivo original, para auditoria. Bronze converte para Parquet sem mudar o conteúdo e cria o dicionário de perguntas. " +
      "Silver é onde está o trabalho pesado: as três edições têm perguntas e categorias diferentes, então harmonizamos cargos, senioridade e setores, " +
      "convertemos faixas salariais em valores numéricos e particionamos por ano. Gold entrega dez tabelas agregadas, cada uma respondendo a uma pergunta de negócio."
    );
  }
});

// =============================================================================================
// ARQUITETURA (continuação): tratamento, modelo Gold, decisões, código e evidências
// =============================================================================================
NOMES_ICONES.push(
  "LuColumns3", "LuShuffle", "LuListTree", "LuCoins", "LuCopy", "LuHash", "LuSplit", "LuHardDrive",
  "LuLayers", "LuSigma", "LuUsers", "LuZap", "LuCpu", "LuCloud", "LuShieldCheck", "LuLightbulb",
  "LuCode", "LuBraces", "LuTable",
);

const FONTE_AWS = "Fonte: console AWS, conta do AWS Academy Learner Lab (us-east-1) · capturas em entrega/evidencias/";

// Linhas de código com comentários em cor própria (painel escuro)
function p2Codigo(linhas) {
  return linhas.map((l, i) => ({
    text: l === "" ? " " : l,
    options: { color: /^\s*(#|--)/.test(l) ? H.comentario : H.codigoTexto, breakLine: i < linhas.length - 1 },
  }));
}

// Duas capturas do console lado a lado, em molduras de mesma altura, + quatro cartões de resultado
function p2SlideEvidencias({ titulo, imagens, stats, notas }) {
  const s = slideConteudo("Execução na AWS", titulo, FONTE_AWS);
  const gap = 0.2, w = (12.13 - gap) / 2, wi = w - 0.2;
  const hMax = Math.max(...imagens.map(([, prop]) => wi / prop));
  const hMoldura = hMax + 0.2;
  imagens.forEach(([arquivo, proporcao, legenda, alt], i) => {
    const x = 0.6 + i * (w + gap), h = wi / proporcao;
    rotulo(s, `evidencia-${i + 1}-rotulo`, legenda, x, 1.85, w, C.accent2);
    caixa(s, `evidencia-${i + 1}-moldura`, x, 2.2, w, hMoldura, C.background2);
    s.addImage({ path: path.join(EVIDENCIAS, arquivo), x: x + 0.1, y: 2.2 + (hMoldura - h) / 2, w: wi, h, altText: alt, objectName: `evidencia-${i + 1}` });
  });
  const cw = (12.13 - 3 * gap) / 4;
  stats.forEach(([valor, legenda], i) =>
    cartaoNumero(s, `resultado-${i + 1}`, 0.6 + i * (cw + gap), 5.4, cw, 1.4, valor, legenda, { tam: 24 }));
  s.addNotes(notas);
}

BLOCOS.push(function slidesEngenharia() {
  // --- Silver: oito regras de qualidade -----------------------------------------------------
  {
    const s = slideConteudo("Tratamento de dados", "Camada Silver: oito regras de qualidade transformam três questionários diferentes em um esquema único", "Código: notebooks/02_silver_tratamento.py · tabelas sod_silver.respondentes e sod_silver.respondente_itens");
    const regras = [
      ["LuColumns3", "Cabeçalhos heterogêneos", "2023 usa tuplas ('P2_h', 'Faixa salarial'); 2024/25 usam 2.h_faixa_salarial. A Bronze gera nomes técnicos e um dicionário de 1.190 colunas."],
      ["LuShuffle", "De-para entre edições", "29 campos e 6 grupos de múltipla escolha mapeados pelo código da pergunta em cada ano (ex.: modelo de trabalho é 2.r em 2023/24 e 2.q em 2025)."],
      ["LuListTree", "Padronização de categorias", "11 rótulos de cargo viram 9 famílias e gestores viram Gestor(a); senioridade, setor e modelo de trabalho ganham rótulos únicos."],
      ["LuCoins", "Faixa salarial em valor", "Ponto médio da faixa (salario_min, _max, _medio) via join broadcast com a tabela de faixas; faixa aberta = R$ 45 mil."],
      ["LuCopy", "Deduplicação", "Window por (edição, token) com row_number: remove 3 respostas duplicadas e cria id_respondente único entre edições."],
      ["LuHash", "Tipagem e nulos", "idade em inteiro, gestor e satisfeito em booleano; vazios viram NULL e flags respondeu_* são o denominador dos percentuais."],
      ["LuSplit", "Múltipla escolha em formato longo", "Linguagens, bancos, clouds, BI e uso de IA viram 1 linha por item marcado (explode) em respondente_itens."],
      ["LuHardDrive", "Gravação otimizada", "Parquet Snappy, partição ano_pesquisa=AAAA, 1 arquivo por partição e registro no Glue Data Catalog (saveAsTable)."],
    ];
    const gap = 0.2, w = (12.13 - 3 * gap) / 4, h = (4.95 - gap) / 2;
    regras.forEach(([icn, t, d], i) => {
      const x = 0.6 + (i % 4) * (w + gap), y = 1.85 + Math.floor(i / 4) * (h + gap), id = `regra-${i + 1}`;
      caixa(s, id, x, y, w, h, C.background2);
      circuloIcone(s, `${id}-icone`, icn, x + 0.2, y + 0.22, 0.55, C.background1);
      texto(s, `${id}-titulo`, t, { x: x + 0.9, y: y + 0.18, w: w - 1.08, h: 0.63, fontFace: TITULO, fontSize: 13.5, color: C.text2, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: x + 0.2, y: y + 1.0, w: w - 0.4, h: h - 1.12, fontSize: 11.5, color: C.text1 });
    });
    s.addNotes(
      "Este é o trabalho de engenharia de dados do projeto, o que a aula chama de camada limpa (cleansed layer): corrigir erros, remover duplicatas e aplicar regras de qualidade. " +
      "As três edições têm cabeçalhos, códigos de pergunta e rótulos diferentes; sem essa harmonização não daria para comparar os anos. " +
      "Cada regra está documentada no notebook 02, e a checagem de qualidade no fim do notebook confere volumes, faixas não mapeadas e a distribuição de cargos por edição."
    );
  }

  // --- Gold: tabela de modelos + quatro fatos ------------------------------------------------
  {
    const s = slideConteudo("Modelo de dados", "Camada Gold: dez tabelas agregadas no Glue Data Catalog, uma por pergunta de negócio", "Código: notebooks/03_gold_agregacoes.py (Spark SQL) · consultas: sql/02_consultas_analiticas.sql");
    const cab = { color: H.branco, fill: { color: H.navy }, fontSize: 11.5, fontFace: TITULO };
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
      ["Pergunta de negócio", "Tabela sod_gold", "Grão (uma linha por)", "Athena"].map((t) => ({ text: t, options: cab })),
      ...linhas.map((l, i) => l.map((t, j) => ({
        text: t,
        options: {
          fontSize: j === 1 ? 10.5 : 11, color: j === 0 ? H.navy : H.tinta, fontFace: j === 1 ? MONO : (j === 0 ? TITULO : undefined),
          fill: { color: i % 2 ? H.branco : H.lt2 },
        },
      }))),
    ], {
      x: 0.6, y: 1.85, w: 8.0, colW: [2.45, 2.75, 1.95, 0.85], rowH: 0.52, valign: "middle", margin: [0.04, 0.1, 0.04, 0.1],
      border: { type: "solid", pt: 0.5, color: H.linha }, objectName: "tabela-gold",
    });

    const fatos = [
      ["LuLayers", "Camada curada", "Agregações OLAP prontas para consumo, sem joins pesados na hora da consulta."],
      ["LuSigma", "Métricas padronizadas", "n, pct e salario_medio, com o denominador explícito de cada percentual."],
      ["LuUsers", "Base salarial única", "Quem atua em dados e informou faixa: 12.841 profissionais."],
      ["LuZap", "Parquet colunar", "A Q7 lê 0,84 KB em 0,4 s no Athena; a Silver segue disponível para perguntas novas (Q2b e Q7b usam JOIN)."],
    ];
    fatos.forEach(([icn, t, d], i) => {
      const x = 8.9, y = 1.85 + i * 1.24, id = `gold-fato-${i + 1}`;
      circuloIcone(s, id, icn, x, y + 0.02, 0.55);
      texto(s, `${id}-titulo`, t, { x: x + 0.72, y, w: 3.11, h: 0.32, fontFace: TITULO, fontSize: 13.5, color: C.text2, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: x + 0.72, y: y + 0.36, w: 3.11, h: 0.8, fontSize: 11, color: C.text1 });
    });
    s.addNotes(
      "A Gold segue a lógica de um data warehouse analítico: tabelas agregadas, cada uma com um grão claro, respondendo a uma pergunta do desafio. " +
      "Isso é o que a aula chama de camada curada ou transformada. As consultas do Athena ficam simples e baratas porque o trabalho pesado foi feito pelo Spark no Glue. " +
      "A Silver permanece catalogada para perguntas ad hoc, como o cruzamento de itens de cloud com setor na Q7b."
    );
  }

  // --- Decisões de arquitetura ----------------------------------------------------------------
  {
    const s = slideConteudo("Decisões de arquitetura", "Seis decisões técnicas e o conceito do curso por trás de cada uma", "Referências: AWS Glue, Amazon Athena, Amazon S3 · disciplinas Big Data para Ciência de Dados e Fundamentos de Bancos de Dados");
    const decisoes = [
      ["LuLayers", "Data lake em camadas no S3", "Raw → Bronze → Silver → Gold (camadas bruta, limpa e curada). Bucket + prefixos por camada; o catálogo evita o data swamp."],
      ["LuColumns3", "Parquet colunar com Snappy", "Formato colunar lê só as colunas pedidas e comprime por tipo: menos I/O e menor custo no Athena, que cobra por dado lido."],
      ["LuSplit", "Particionamento Hive-style", "Silver particionada em ano_pesquisa=AAAA: filtros por edição leem só a partição necessária (partition pruning)."],
      ["LuCpu", "Spark distribuído no Glue", "Glue Jobs PySpark (Spark 3.5): processamento em memória, driver + executors em 2 workers G.1X, escala horizontal sem servidor."],
      ["LuCloud", "Serverless e pagamento por uso", "Sem cluster para manter: Glue cobra por DPU-hora (0,29 no pipeline todo) e o Athena por dado lido. Alta disponibilidade nativa."],
      ["LuShieldCheck", "Catálogo, ETL e segurança", "Glue Data Catalog como metastore (ETL: transforma no job e carrega na Gold); IAM LabRole, CloudWatch Logs e criptografia padrão do S3."],
    ];
    const gap = 0.25, w = (12.13 - 2 * gap) / 3, h = 2.0;
    decisoes.forEach(([icn, t, d], i) => {
      const x = 0.6 + (i % 3) * (w + gap), y = 1.85 + Math.floor(i / 3) * (h + 0.2), id = `decisao-${i + 1}`;
      caixa(s, id, x, y, w, h, C.background2);
      circuloIcone(s, `${id}-icone`, icn, x + 0.2, y + 0.2, 0.55, C.background1);
      texto(s, `${id}-titulo`, t, { x: x + 0.9, y: y + 0.2, w: w - 1.1, h: 0.55, fontFace: TITULO, fontSize: 14.5, color: C.text2, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: x + 0.2, y: y + 0.9, w: w - 0.4, h: h - 1.0, fontSize: 12, color: C.text1 });
    });
    caixa(s, "evolucao", 0.6, 6.25, 12.13, 0.55, C.background1, H.linha);
    icone(s, "evolucao-icone", "LuLightbulb", H.laranja, 0.8, 6.38, 0.29);
    texto(s, "evolucao-texto", [
      { text: "Evolução natural: ", options: { fontFace: TITULO, color: C.text2 } },
      { text: "formato de tabela aberto (Apache Iceberg) para transações ACID e versionamento (lakehouse), Glue Workflows/Triggers para orquestração e QuickSight sobre o Athena para dashboards." },
    ], { x: 1.22, y: 6.25, w: 11.35, h: 0.55, fontSize: 11.5, color: C.text1, valign: "middle" });
    s.addNotes(
      "Cada escolha técnica tem um motivo ligado ao que foi estudado. O S3 é o padrão para data lakes e organiza tudo por bucket e prefixo; " +
      "as camadas correspondem às camadas bruta, limpa e curada; Parquet é um formato colunar comprimido, o que reduz o I/O e o custo do Athena, que cobra pelos bytes lidos; " +
      "a partição por ano permite que o Athena leia só a edição filtrada. O Glue executa Spark de forma serverless, com o Data Catalog como metastore central entre o S3 e o Athena. " +
      "A segurança veio do IAM (LabRole), dos logs no CloudWatch e da criptografia padrão do S3. Como evolução, um formato de tabela aberto como o Iceberg traria ACID e time travel, " +
      "e o Glue Workflows orquestraria os quatro jobs em sequência."
    );
  }

  // --- Código ---------------------------------------------------------------------------------
  {
    const s = slideConteudo("Código", "O mesmo PySpark roda no Glue e localmente; o Athena responde em SQL sobre o catálogo", "Código completo: notebooks/*.py (fontes) e notebooks/ipynb/*.ipynb · sql/02_consultas_analiticas.sql");
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
    ];
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
    ];
    const gap = 0.3, w = (12.13 - gap) / 2;
    [["PySpark no AWS Glue (notebook 02)", pyspark, "codigo-pyspark"], ["SQL no Amazon Athena (Q7b)", sql, "codigo-sql"]].forEach(([t, cod, nome], i) => {
      const x = 0.6 + i * (w + gap);
      caixa(s, `${nome}-fundo`, x, 1.85, w, 3.9, H.codigo);
      rotulo(s, `${nome}-rotulo`, t, x + 0.25, 2.0, w - 0.5, C.accent6);
      texto(s, nome, p2Codigo(cod), { x: x + 0.25, y: 2.4, w: w - 0.5, h: 3.2, fontFace: MONO, fontSize: 10, lineSpacingMultiple: 1.0 });
    });
    const cw = (12.13 - 2 * 0.2) / 3;
    [["LuCode", "select · filter · groupBy · agg · join", "Operações de DataFrame do curso, usadas nos 4 notebooks"],
     ["LuBraces", "Window · explode · broadcast", "Funções Spark para deduplicação, formato longo e join pequeno"],
     ["LuTable", "JOIN · GROUP BY · HAVING · CASE", "Repertório SQL das 16 consultas do Athena (Q0 a Q7b)"]]
      .forEach(([icn, v, l], i) => {
        const x = 0.6 + i * (cw + 0.2), id = `codigo-destaque-${i + 1}`;
        caixa(s, id, x, 5.95, cw, 0.85, C.background2);
        circuloIcone(s, `${id}-icone`, icn, x + 0.18, 6.13, 0.5, C.background1);
        texto(s, `${id}-valor`, v, { x: x + 0.82, y: 6.05, w: cw - 1.0, h: 0.3, fontFace: TITULO, fontSize: 12, color: C.text2, valign: "middle" });
        texto(s, `${id}-legenda`, l, { x: x + 0.82, y: 6.36, w: cw - 1.0, h: 0.36, fontSize: 10.5, color: H.tinta2 });
      });
    s.addNotes(
      "Dois trechos reais do código entregue. À esquerda, PySpark do notebook 02: deduplicação com Window, conversão da faixa salarial com join broadcast, " +
      "explode das respostas múltiplas e a gravação em Parquet particionado com saveAsTable, que é o que registra a tabela no Glue Data Catalog. " +
      "À direita, a consulta Q7b do Athena, que cruza a tabela de itens com a de respondentes. O mesmo arquivo .py roda como Glue Job, como Glue Notebook (via .ipynb) e localmente, " +
      "porque detecta o ambiente na primeira célula."
    );
  }

  // --- Evidências -----------------------------------------------------------------------------
  p2SlideEvidencias({
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

  p2SlideEvidencias({
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
});

// =============================================================================================
// 02 · O QUE OS DADOS MOSTRAM: perguntas 1 a 4 (mercado, salários, gênero, tecnologias)
// =============================================================================================
NOMES_ICONES.push("LuChartColumn");
// "R$" e o valor na mesma linha (espaço não separável)
const p3nb = (t) => t.replace(/R\$ /g, "R$\u00A0");
const p3painel = (s, x, o) => painelLateral(s, x, { ...o, hero: [o.hero[0], p3nb(o.hero[1])], dados: o.dados.map(p3nb), banco: p3nb(o.banco) });

BLOCOS.push(function slidesMercado() {
  const SEN = D.senioridade_ano.categorias.map(curto);

  secao("1 · Estrutura do mercado");
  slideDivisor("02", "O que os dados mostram",
    "Sete perguntas de negócio respondidas com as tabelas Gold: mercado, salários, diversidade, tecnologia, IA, região e Finanças",
    "LuChartColumn",
    "Segunda parte: o que os dados mostram, organizado nas sete perguntas de negócio do desafio.");

  // 15 · Cargos ------------------------------------------------------------------------------
  {
    const s = slideConteudo("1 · Estrutura do mercado", "Gestão e análise somam 42% do mercado; ML/IA ainda é nicho, com 3%", fonteTabela("distribuicao_perfil"), 1);
    const g = D.cargos_2025;
    legendaGrafico(s, "grafico-legenda", "% dos profissionais que atuam com dados, por cargo (2025)", 0.6, 1.85, 7.9);
    barrasH(s, "grafico-cargos", g.categorias, g.pct,
      coresPor(g.categorias, (c) => (c.includes("ML/IA") ? H.laranja : ["Gestor(a)", "Analista de Dados"].includes(c) ? H.azul : null)),
      0.6, 2.2, 7.9, 4.6, { valAxisMaxVal: 26, altText: "Barras horizontais com a distribuição de cargos em 2025" });
    p3painel(s, 8.9, {
      hero: ["3,3%", "dos profissionais são de ML/IA, o perfil que a agenda de IA mais demanda"],
      dados: [
        "Gestores (23%) e Analistas de Dados (19%) lideram em 2025",
        "Engenharia e Ciência de Dados empatam, com 13% cada",
        "Perfis de ML/IA são apenas 3,3% dos profissionais",
      ],
      banco: "Talento de ML/IA é escasso: formar internamente pesa tanto quanto contratar.",
    });
    s.addNotes(
      "Em 2025, quase um em cada quatro respondentes é gestor, e analistas de dados são o segundo grupo. " +
      "Engenharia e Ciência de Dados têm o mesmo peso. O dado que importa para o banco é o de ML/IA: apenas 3,3% do mercado, " +
      "exatamente o perfil que a agenda de IA mais demanda. Isso aponta para disputa acirrada e para a necessidade de formar talento dentro de casa."
    );
  }

  // 16 · Senioridade -------------------------------------------------------------------------
  {
    const s = slideConteudo("1 · Estrutura do mercado", "O mercado amadureceu: a fatia de júniores caiu de 22% para 16% em três anos", fonteTabela("distribuicao_perfil"), 1);
    const g = D.senioridade_ano;
    legendaGrafico(s, "grafico-legenda", "% dos profissionais por senioridade, 2023 a 2025", 0.6, 1.85, 8.0);
    s.addChart(pres.charts.BAR, ["2023", "2024", "2025"].map((a) => ({ name: a, labels: SEN, values: g.series[a] })), grafico({
      x: 0.6, y: 2.15, w: 12.13, h: 2.8, barDir: "col", chartColors: [H.a23, H.a24, H.a25],
      dataLabelFormatCode: PCT0_SEM_ZERO, dataLabelFontSize: 10, valAxisMaxVal: 38, barGapWidthPct: 70,
      showLegend: true, legendPos: "t", objectName: "grafico-senioridade",
      altText: "Barras agrupadas da distribuição de senioridade por ano, 2023 a 2025",
    }));
    const y = 5.15, h = 1.65, w = 2.6;
    cartaoNumero(s, "cartao-junior", 0.6, y, w, h, "22% → 16%", "de júniores entre 2023 e 2025 (18% em 2024)", { cor: C.accent2 });
    cartaoNumero(s, "cartao-gestor", 3.4, y, w, h, "19% → 23%", "de gestores no mesmo período");
    cartaoNumero(s, "cartao-senior", 6.2, y, w, h, "27%", "são Sênior, o maior grupo; Especialista (11%) passou a ser medido em 2025");
    paraBanco(s, 9.0, y, 3.73, h, "Com a porta de entrada mais estreita, programas de trainee em dados viram diferencial de atração.");
    s.addNotes(
      "A pirâmide do mercado está mudando de forma: menos júniores e mais gestores a cada edição. " +
      "Isso indica um mercado mais maduro, mas também uma porta de entrada estreita. " +
      "Atenção: a categoria Especialista só existe em 2025, por isso parte do movimento entre Sênior e Especialista é efeito do questionário."
    );
  }

  // 17 · Setores -----------------------------------------------------------------------------
  {
    const s = slideConteudo("1 · Estrutura do mercado", "Finanças é o setor com mais profissionais de dados nas três edições", fonteTabela("distribuicao_perfil"), 1);
    const g = D.setores_2025;
    p3painel(s, 0.6, {
      hero: ["18,5%", "dos profissionais de dados estão em Finanças ou Bancos, o maior setor em 2025"],
      dados: [
        "Finanças reúne 19% dos respondentes em 2025, à frente de Tecnologia (17%)",
        "Liderança constante: 19,5% → 21,3% → 18,5%",
        "Consultoria aparece em terceiro, com 8,8%",
      ],
      banco: "O banco disputa talento com outros bancos e com empresas de tecnologia ao mesmo tempo.",
    });
    legendaGrafico(s, "grafico-legenda", "% dos profissionais por setor, 10 maiores (2025)", 4.9, 1.85, 7.83);
    barrasH(s, "grafico-setores", g.categorias, g.pct,
      coresPor(g.categorias, (c) => (c === "Finanças ou Bancos" ? H.laranja : c.startsWith("Tecnologia") ? H.azul : null)),
      4.9, 2.2, 7.83, 4.6, { valAxisMaxVal: 21.5, altText: "Barras horizontais com a distribuição por setor em 2025" });
    s.addNotes(
      "Finanças é o setor que mais emprega profissionais de dados na pesquisa, em todas as edições. " +
      "Isso confirma que o setor é referência em dados, e também que a concorrência por talento é direta: " +
      "o profissional que o banco quer contratar está, muitas vezes, em outro banco ou em uma empresa de tecnologia."
    );
  }

  // 18 · Salário por cargo -------------------------------------------------------------------
  secao("2 · Perfis valorizados");
  {
    const s = slideConteudo("2 · Perfis mais valorizados", "Gestão e ML/IA pagam mais que o dobro de BI e Análise de Dados", fonteTabela("salario_cargo_senioridade"), 2);
    const g = D.salario_cargo_2025;
    legendaGrafico(s, "grafico-legenda", "Salário médio mensal por cargo, 2025 (cargos com 30 ou mais respostas)", 0.6, 1.85, 7.9);
    barrasH(s, "grafico-salario-cargo", g.categorias, g.mil,
      coresPor(g.categorias, (c) => (c === "Gestor(a)" || c.includes("ML/IA") ? H.laranja : null)),
      0.6, 2.2, 7.9, 4.6, { dataLabelFormatCode: MIL, valAxisMaxVal: 24.5, altText: "Barras horizontais com o salário médio por cargo em 2025" });
    p3painel(s, 8.9, {
      hero: ["R$ 19,1 mil", "salário médio de Eng. de ML/IA, perto do de gestores (R$ 20,2 mil)"],
      dados: [
        "Gestor (R$ 20,2 mil) e ML/IA (R$ 19,1 mil) lideram em 2025",
        "Engenharia de Dados (R$ 14,5 mil) paga acima de Ciência (R$ 12,9 mil)",
        "BI (R$ 7,6 mil) na base; topo é Especialista em ML/IA (R$ 28,8 mil)",
      ],
      banco: "Engenharia de dados e ML/IA são os perfis críticos a reter: caros, escassos e a base da IA.",
    });
    s.addNotes(
      "O ranking salarial mostra o que o mercado valoriza. Gestão e ML/IA estão no topo; Engenharia de Dados já paga mais que Ciência de Dados, " +
      "refletindo a demanda por quem constrói a plataforma. O maior salário médio entre combinações de cargo e senioridade é o de Especialista em ML/IA, R$ 28,8 mil. " +
      "Salários são pontos médios das faixas declaradas, então leia como ordem de grandeza."
    );
  }

  // 19 · Salário por senioridade -------------------------------------------------------------
  {
    const s = slideConteudo("2 · Perfis mais valorizados", "Senioridade multiplica o salário: um sênior ganha 3,5 vezes o júnior", fonteTabela("salario_cargo_senioridade"), 2);
    legendaGrafico(s, "grafico-legenda", "Salário médio mensal por senioridade, 2025", 0.6, 1.85, 7.9);
    s.addChart(pres.charts.BAR, [{ name: "2025", labels: SEN, values: D.salario_senioridade_ano.series["2025"] }], grafico({
      x: 0.6, y: 2.2, w: 7.9, h: 4.6, barDir: "col", chartColors: [H.a23, H.a24, H.azul, H.a25, H.navy],
      dataLabelFormatCode: MIL, dataLabelFontSize: 11.5, catAxisLabelFontSize: 12, valAxisMaxVal: 23, barGapWidthPct: 45,
      objectName: "grafico-salario-senioridade", altText: "Colunas com o salário médio por senioridade em 2025",
    }));
    p3painel(s, 8.9, {
      hero: ["3,5x", "é quanto um sênior ganha frente a um júnior: R$ 14,5 mil contra R$ 4,2 mil"],
      dados: [
        "2025: Júnior R$ 4,2 mil · Pleno R$ 8,3 mil · Sênior R$ 14,5 mil",
        "Especialista (R$ 20,0 mil) já se iguala a Gestor (R$ 20,2 mil)",
        "Média geral subiu 26% em dois anos: R$ 10,5 mil → R$ 13,2 mil",
      ],
      banco: "Carreira em Y: uma trilha de especialista retém bons técnicos sem forçá-los à gestão.",
    });
    s.addNotes(
      "Cada degrau de senioridade praticamente dobra o salário até o sênior. O dado novo de 2025 é o Especialista: " +
      "ele ganha o mesmo que um gestor, o que mostra que o mercado já remunera a carreira técnica no topo. " +
      "Para o banco, isso reforça uma carreira em Y. A média geral subiu 26% em dois anos, bem acima da inflação do período."
    );
  }

  // 20 · Gênero ------------------------------------------------------------------------------
  secao("3 · Diversidade de gênero");
  {
    const s = slideConteudo("3 · Diversidade de gênero", "Mulheres são 22% e ganham 19% menos; a presença cai a cada degrau da carreira", fonteTabela("diversidade_genero"), 3);
    const g = D.genero, t = g.total;
    const br = (v) => v.toFixed(1).replace(".", ",");
    cartaoNumero(s, "cartao-mulheres", 0.6, 1.85, 2.6, 1.45, `${br(t["2025"].pct_mulheres)}%`,
      `são mulheres em 2025 (eram ${br(t["2023"].pct_mulheres)}% em 2023)`, { tam: 28 });
    cartaoNumero(s, "cartao-gap", 0.6, 3.45, 2.6, 1.45, `${br(t["2025"].gap)}%`,
      `é o gap salarial geral (${br(t["2023"].gap)}% em 2023)`, { tam: 28, cor: C.accent2 });
    const cats = g.categorias.map(curto);
    legendaGrafico(s, "grafico-mulheres-legenda", "% de mulheres por senioridade (2025)", 3.45, 1.85, 4.54);
    s.addChart(pres.charts.BAR, [{ name: "Mulheres", labels: cats, values: g.pct_mulheres }], grafico({
      x: 3.45, y: 2.15, w: 4.54, h: 2.75, barDir: "col", chartColors: [H.azul], dataLabelFormatCode: PCT1,
      catAxisLabelFontSize: 10, dataLabelFontSize: 10, valAxisMaxVal: 34, barGapWidthPct: 45,
      objectName: "grafico-mulheres", altText: "Participação de mulheres por senioridade em 2025",
    }));
    legendaGrafico(s, "grafico-gap-legenda", "Quanto as mulheres ganham a menos (2025)", 8.19, 1.85, 4.54);
    s.addChart(pres.charts.BAR, [{ name: "Gap salarial", labels: cats, values: g.gap }], grafico({
      x: 8.19, y: 2.15, w: 4.54, h: 2.75, barDir: "col",
      chartColors: coresPor(g.categorias, (c) => (c === "Sênior" ? H.laranja : null)),
      dataLabelFormatCode: '0.0"%";-0.0"%";"paridade"', catAxisLabelFontSize: 10, dataLabelFontSize: 10, valAxisMaxVal: 23, barGapWidthPct: 45,
      objectName: "grafico-gap", altText: "Diferença salarial entre homens e mulheres por senioridade em 2025",
    }));
    caixa(s, "genero-dados-fundo", 0.6, 5.1, 8.2, 1.7, C.background2);
    texto(s, "genero-dados", marcadores([
      "Participação feminina caiu de 24,4% para 22,0% (2023-2025)",
      "Gap salarial geral subiu de 18,0% para 19,4%",
      "Mulheres são 28% dos júniores e 18% dos gestores; no pleno há paridade salarial, no sênior o gap chega a 19%",
    ], 12.5), { x: 0.85, y: 5.28, w: 7.7, h: 1.4, valign: "middle" });
    paraBanco(s, 9.0, 5.1, 3.73, 1.7, "Metas de promoção e revisão salarial por gênero na passagem de pleno para sênior.");
    s.addNotes(
      "Diversidade não avançou: a participação feminina caiu e o gap salarial cresceu levemente nas três edições. " +
      "O ponto crítico é a transição de pleno para sênior: no pleno os salários são equivalentes, no sênior a diferença chega a 19%. " +
      "Lembrando que o gap aqui compara médias por grupo e não controla todos os fatores, como cargo e setor."
    );
  }

  // 21 · Tecnologias -------------------------------------------------------------------------
  secao("4 · Tecnologias");
  {
    const s = slideConteudo("4 · Adoção de tecnologias", "Python e SQL são universais; Power BI domina a visualização", fonteTabela("adocao_tecnologias"), 4);
    legendaGrafico(s, "grafico-legenda", "% dos profissionais que usam cada tecnologia, 6 mais citadas por categoria (2025)", 0.6, 1.8, 12.13);
    const w = (12.13 - 3 * 0.25) / 4;
    Object.entries(D.tecnologias_2025).forEach(([cat, g], i) => {
      const x = 0.6 + i * (w + 0.25), id = `tec-${i + 1}`;
      rotulo(s, `${id}-rotulo`, cat, x, 2.2, w, C.text2);
      barrasH(s, `grafico-${id}`, g.categorias, g.pct, g.pct.map((_, j) => (j === 0 ? H.azul : H.cinza)),
        x, 2.5, w, 2.45, {
          dataLabelFormatCode: PCT0, catAxisLabelFontSize: 10, dataLabelFontSize: 10, barGapWidthPct: 40,
          valAxisMaxVal: Math.max(...g.pct) * 1.32, altText: `Tecnologias mais usadas em 2025: ${cat}`,
        });
    });
    caixa(s, "tec-dados-fundo", 0.6, 5.15, 8.2, 1.65, C.background2);
    texto(s, "tec-dados", marcadores([
      "Python (92%) e SQL (84%) são a base obrigatória",
      "Bancos de dados: PostgreSQL 37%, SQL Server 34%, Databricks 33%",
      "BI: Power BI com 59%, contra 23% do Looker",
    ], 12.5), { x: 0.85, y: 5.3, w: 7.7, h: 1.35, valign: "middle" });
    paraBanco(s, 9.0, 5.15, 3.73, 1.65, "Padronizar a stack em Python, SQL e Power BI encurta a curva de aprendizado de quem chega.");
    s.addNotes(
      "Python e SQL deixaram de ser diferencial: são pré-requisito. Em bancos de dados, PostgreSQL e SQL Server dividem espaço com o Databricks, " +
      "que já chega a um terço dos profissionais. Em visualização, o Power BI é dominante. " +
      "Para o banco, escolher tecnologias que o mercado já domina reduz custo de contratação e treinamento."
    );
  }

  // 22 · Cloud -------------------------------------------------------------------------------
  {
    const s = slideConteudo("4 · Adoção de tecnologias", "A AWS virou a nuvem nº 1 do mercado, e em Finanças chega a 68%",
      `${fonteTabela("adocao_tecnologias")} · Finanças: consulta Q7b (sod_silver)`, 4);
    const g = D.cloud_evolucao;
    legendaGrafico(s, "grafico-legenda", "% dos profissionais que usam cada nuvem, 2023 a 2025", 0.6, 1.85, 7.6);
    s.addChart(pres.charts.BAR, ["AWS", "Azure", "GCP"].map((n) => ({ name: n, labels: g.anos, values: g.series[n] })), grafico({
      x: 0.6, y: 2.2, w: 7.6, h: 4.6, barDir: "col", chartColors: [H.laranja, H.azul, H.verde],
      dataLabelFormatCode: PCT1, dataLabelFontSize: 10.5, catAxisLabelFontSize: 12, valAxisMaxVal: 56, barGapWidthPct: 60,
      showLegend: true, legendPos: "t", objectName: "grafico-cloud", altText: "Evolução do uso de AWS, Azure e GCP de 2023 a 2025",
    }));
    const x = 8.6, w = 4.13;
    rotulo(s, "financas-rotulo", "Em Finanças, 2025", x, 1.85, w, C.text2);
    // Recorte de Finanças vem da consulta Q7b (Silver), não de uma tabela Gold exportada para o JSON
    barrasH(s, "grafico-cloud-financas", ["AWS", "Azure", "GCP"], [67.7, 28.1, 16.4], [H.laranja, H.azul, H.verde],
      x, 2.15, w, 1.45, { catAxisLabelFontSize: 11, dataLabelFontSize: 11, valAxisMaxVal: 85, barGapWidthPct: 35,
        altText: "Uso de AWS, Azure e GCP entre profissionais de Finanças em 2025" });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.72, w, h: 0.012, fill: { color: H.linha }, line: { type: "none" }, objectName: "painel-divisoria" });
    texto(s, "painel-dados", marcadores([
      "AWS: 30,6% → 44,1% → 48,3%",
      "Azure caiu de 42,3% para 34,8%; GCP estável, perto de 31%",
      "Em Finanças (2025): AWS 67,7%, Azure 28,1%, GCP 16,4%",
    ], 12), { x, y: 3.85, w, h: 1.35 });
    paraBanco(s, x, 5.3, w, 1.5, "Uma plataforma de dados em AWS (S3, Glue, Athena) alinha o banco ao talento disponível.");
    s.addNotes(
      "A virada de liderança em nuvem é clara: a AWS passou de terceira para primeira em dois anos, enquanto a Azure perdeu espaço. " +
      "No setor financeiro a concentração é ainda maior, com dois terços dos profissionais usando AWS. " +
      "A arquitetura que propomos neste trabalho usa exatamente esses serviços."
    );
  }
});

// =============================================================================================
// 5 · IA · 6 · REGIÃO E MODELO DE TRABALHO · 7 · RECORTE FINANÇAS
// =============================================================================================
NOMES_ICONES.push("LuUser");

const p4Soma = (a, b) => a.map((v, i) => Math.round((v + b[i]) * 10) / 10);

// Linha de cartões no rodapé (y 5,15 a 6,8): três cartões de número + caixa "Para o banco"
function p4RodapeCartoes(s, cartoes, banco) {
  const y = 5.15, h = 1.65, w = 2.6, gap = 0.2;
  cartoes.forEach(([valor, legenda, cor], i) =>
    cartaoNumero(s, `resultado-${i + 1}`, 0.6 + i * (w + gap), y, w, h, valor, legenda, { cor: cor || C.text2 }));
  paraBanco(s, 0.6 + 3 * (w + gap), y, 12.73 - (0.6 + 3 * (w + gap)), h, banco);
}

BLOCOS.push(function slidesIaRegiao() {
  secao("5 · Inteligência artificial");

  // ---- IA generativa: uso x empresa paga -----------------------------------------------------
  {
    const s = slideConteudo("5 · Adoção de IA e impacto", "IA generativa virou rotina: 98% usam, mas só 42% têm a ferramenta paga pela empresa", fonteTabela("adocao_ia"), 5);
    const ia = D.ia_adocao;
    legendaGrafico(s, "grafico-ia-adocao-legenda", "% dos profissionais de dados, 2023 a 2025", 0.6, 1.85, 8.0);
    s.addChart(pres.charts.LINE, [
      { name: "Usam IA generativa no trabalho", labels: ia.anos, values: ia.usa },
      { name: "Empresa paga a ferramenta", labels: ia.anos, values: ia.empresa_paga },
    ], grafico({
      x: 0.6, y: 2.15, w: 12.13, h: 2.8, chartColors: [H.azul, H.laranja], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 9,
      dataLabelPosition: "t", dataLabelFormatCode: PCT0, dataLabelFontSize: 12, valAxisMaxVal: 115, catAxisLabelFontSize: 12,
      showLegend: true, legendPos: "t", objectName: "grafico-ia-adocao",
      altText: "Linhas: uso de IA generativa de 80% a 98% e IA paga pela empresa de 6% a 42%, 2023 a 2025",
    }));
    p4RodapeCartoes(s, [
      ["80% → 98%", "usam IA generativa no trabalho (2023 a 2025)"],
      ["6% → 42%", "têm a ferramenta paga pela empresa", C.accent2],
      ["56 p.p.", "de distância em 2025: muito uso por conta própria"],
    ], "Licenciar IA corporativa com governança reduz o risco de dados sensíveis em ferramentas pessoais.");
    s.addNotes(
      "O uso de IA generativa é praticamente universal. A empresa pagar a ferramenta cresceu rápido, mas ainda é menos da metade. " +
      "Essa diferença é o que chamamos de IA paralela: profissionais usando contas pessoais no trabalho. " +
      "Em um banco, com dados de clientes e sigilo bancário, esse é um risco de governança e de LGPD."
    );
  }

  // ---- Prioridade da IA nas empresas ---------------------------------------------------------
  {
    const s = slideConteudo("5 · Adoção de IA e impacto", "IA é prioridade para 61% das empresas; em 2023 eram 36%", fonteTabela("adocao_ia"), 5);
    const p = D.ia_prioridade, se = p.series;
    const prioridade = p4Soma(se["Principal prioridade"], se["Entre as prioridades"]);
    legendaGrafico(s, "grafico-prioridade-legenda", "% das empresas, na visão dos gestores", 0.6, 1.85, 7.9);
    s.addChart(pres.charts.BAR, [
      { name: "Principal ou entre as prioridades", labels: p.anos, values: prioridade },
      { name: "Não é prioridade", labels: p.anos, values: se["Não é prioridade"] },
    ], grafico({
      x: 0.6, y: 2.15, w: 7.9, h: 4.2, barDir: "col", chartColors: [H.laranja, H.cinza], dataLabelFormatCode: PCT1,
      catAxisLabelFontSize: 12, dataLabelFontSize: 11, valAxisMaxVal: 70, barGapWidthPct: 70, showLegend: true, legendPos: "t",
      objectName: "grafico-prioridade",
      altText: "Colunas: IA como principal ou entre as prioridades sobe de 36,2% para 60,6%; não é prioridade cai de 28,8% para 11,3%",
    }));
    const ult = p.anos.length - 1;
    texto(s, "prioridade-nota",
      `Demais respostas em ${p.anos[ult]}: iniciativas isoladas ${String(se["Iniciativas isoladas"][ult]).replace(".", ",")}% e não sei opinar ${String(se["Não sei opinar"][ult]).replace(".", ",")}%.`,
      { x: 0.6, y: 6.45, w: 7.9, h: 0.35, fontSize: 11, color: H.tinta2, valign: "middle" });
    painelLateral(s, 8.9, {
      hero: ["61%", "das empresas têm a IA como principal prioridade ou entre as prioridades (36% em 2023)"],
      dados: [
        "IA como principal prioridade: 12% → 22% → 24%",
        "Principal ou entre as prioridades: 36% → 54% → 61%",
        "\"Não é prioridade\" caiu de 29% para 11% (visão dos gestores)",
      ],
      banco: "Não priorizar IA já coloca o banco no grupo minoritário do mercado.",
    });
    s.addNotes(
      "Esta pergunta é respondida pelos gestores, que falam pela empresa. Em três anos, IA passou de tema secundário a prioridade para a maioria. " +
      "Hoje apenas 11% dizem que não é prioridade."
    );
  }

  // ---- Resultados: produção x piloto ---------------------------------------------------------
  {
    const s = slideConteudo("5 · Adoção de IA e impacto", "Mas só uma em cada quatro empresas tem IA em produção; a maioria está em piloto", fonteTabela("adocao_ia"), 5);
    numeroDestaque(s, "destaque", 0.6, 1.85, 4.3, "1 em 4", "empresas tem IA em produção, gerando resultado (26,5% em 2025)", { cor: C.accent2, tam: 44 });
    [H.laranja, H.cinza, H.cinza, H.cinza].forEach((cor, i) => icone(s, `pessoa-${i + 1}`, "LuUser", cor, 0.55 + i * 0.78, 3.55, 0.72));
    paraBanco(s, 0.6, 5.3, 4.3, 1.5, "O diferencial está em sair do piloto para a produção: MLOps, governança e dados confiáveis.");

    const r = D.ia_resultados_2025;
    legendaGrafico(s, "grafico-resultados-legenda", "Estágio da IA nas empresas, 2025 (% das respostas de gestores)", 5.4, 1.85, 7.33);
    barrasH(s, "grafico-resultados", r.categorias, r.pct,
      coresPor(r.categorias, (c) => c.startsWith("Em produção") ? H.laranja : c.startsWith("Pilotos") ? H.azul : null),
      5.4, 2.15, 7.33, 3.0, { catAxisLabelFontSize: 12, dataLabelFontSize: 11.5, valAxisMaxVal: 45,
        altText: "Barras: em produção 26,5%, pilotos 38,4%, investigação 15%, não começou 13,5%, não sei 6,7%" });
    texto(s, "resultados-dados", marcadores([
      "Em produção: 26,5%",
      "Pilotos: 38,4%; em investigação: 15%",
      "Ainda não começaram: 13,5%",
    ], 12.5), { x: 5.4, y: 5.4, w: 7.33, h: 1.4 });
    s.addNotes(
      "Aqui está a tensão central do deck: a IA é prioridade, mas poucos chegaram à produção. " +
      "Quase 40% das empresas estão presas em pilotos. O gargalo costuma ser dado de qualidade, plataforma e governança, " +
      "e não o modelo em si. Quem resolver isso primeiro captura o valor."
    );
  }

  // ---- Impacto de receber IA da empresa ------------------------------------------------------
  {
    const s = slideConteudo("5 · Adoção de IA e impacto", "Quem recebe IA da empresa ganha 33% mais e busca menos outro emprego", fonteTabela("ia_impacto"), 5);
    const stats = [["+33%", "salário médio de quem tem IA da empresa"], ["-12 p.p.", "na intenção de trocar de emprego"], ["+7 p.p.", "de profissionais satisfeitos"]];
    const cw = (7.9 - 0.4) / 3;
    stats.forEach(([v, l], i) => cartaoNumero(s, `impacto-${i + 1}`, 0.6 + i * (cw + 0.2), 1.85, cw, 1.3, v, l,
      { cor: i === 0 ? C.accent2 : C.text2, tam: 24, tamLegenda: 11 }));

    const imp = D.ia_impacto_2025;
    const ie = imp.perfis.indexOf("Empresa fornece IA"), ip = imp.perfis.indexOf("Usa IA por conta própria");
    const metricas = [["Sênior, especialista ou gestor", "pct_senior_ou_gestor"], ["Satisfeitos", "pct_satisfeitos"], ["Buscando outro emprego", "pct_buscando_emprego"]];
    legendaGrafico(s, "grafico-impacto-legenda", "% dos profissionais em cada grupo, 2025", 0.6, 3.35, 7.9);
    s.addChart(pres.charts.BAR, [
      { name: `Empresa fornece IA (${imp.n[ie]})`, labels: metricas.map((m) => m[0]), values: metricas.map((m) => imp[m[1]][ie]) },
      { name: `Usa por conta própria (${imp.n[ip].toLocaleString("pt-BR")})`, labels: metricas.map((m) => m[0]), values: metricas.map((m) => imp[m[1]][ip]) },
    ], grafico({
      x: 0.6, y: 3.65, w: 7.9, h: 3.15, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.azul, H.cinza],
      dataLabelFormatCode: PCT1, valAxisMaxVal: 95, barGapWidthPct: 45, showLegend: true, legendPos: "t", catAxisLabelFontSize: 11.5,
      objectName: "grafico-impacto",
      altText: "Barras agrupadas: quem tem IA da empresa é mais sênior (56% contra 45%), mais satisfeito (74% contra 67%) e busca menos emprego (29% contra 41%)",
    }));

    rotulo(s, "impacto-rotulo", "O que os dados mostram", 8.9, 1.85, 3.83, C.text2);
    texto(s, "painel-dados", marcadores([
      "Salário: R$ 13,4 mil (IA da empresa) contra R$ 10,1 mil (por conta própria)",
      "Satisfeitos: 74% contra 67%; buscando emprego: 29% contra 41%",
      "Correlação, não causa: o grupo também é mais sênior (56% contra 45%)",
    ], 13, C.text1, 10), { x: 8.9, y: 2.25, w: 3.83, h: 2.85 });
    paraBanco(s, 8.9, 5.3, 3.83, 1.5, "Fornecer IA também é ferramenta de retenção: 12 pontos a menos de intenção de saída.");
    s.addNotes(
      "Comparamos 891 profissionais com IA fornecida pela empresa e 1.170 que usam por conta própria. " +
      "Os primeiros ganham mais, estão mais satisfeitos e buscam menos outro emprego. " +
      "Não dá para afirmar causa, porque o grupo também é mais sênior, mas a associação com retenção é forte e consistente. " +
      "Só 44 respondentes não usam IA, um grupo pequeno demais para comparação."
    );
  }

  secao("6 · Região e modelo de trabalho");

  // ---- Região --------------------------------------------------------------------------------
  {
    const s = slideConteudo("6 · Região, senioridade e modelo de trabalho", "O Sudeste paga mais; o Nordeste ganha 24% menos na média, mas trabalha mais remoto", fonteTabela("regiao_modelo_trabalho"), 6);
    const r = D.regiao_2025;
    const cores = coresPor(r.categorias, (c) => c === "Nordeste" ? H.laranja : c === "Sudeste" ? H.azul : null);
    const w = (12.13 - 0.3) / 2;
    [["salario", "Salário médio mensal, 2025 (R$ mil)", r.salario_mil, MIL, 16.5, "Colunas: salário médio por região, Sudeste R$ 13,5 mil e Nordeste R$ 10,3 mil"],
     ["remoto", "% em trabalho 100% remoto, 2025", r.pct_remoto, PCT1, 70, "Colunas: percentual em trabalho remoto por região, Nordeste 52,6% e Sudeste 36,7%"]]
      .forEach(([id, leg, valores, fmt, max, alt], i) => {
        const x = 0.6 + i * (w + 0.3);
        legendaGrafico(s, `grafico-${id}-legenda`, leg, x, 1.85, w);
        s.addChart(pres.charts.BAR, [{ name: leg, labels: r.categorias.map(curto), values: valores }], grafico({
          x, y: 2.15, w, h: 2.45, barDir: "col", chartColors: cores, dataLabelFormatCode: fmt, valAxisMaxVal: max,
          catAxisLabelFontSize: 11.5, objectName: `grafico-${id}`, altText: alt,
        }));
      });
    texto(s, "regiao-insight", [
      { text: "No nível sênior a diferença some: ", options: { fontFace: TITULO, color: C.text2 } },
      { text: "R$ 14,0 mil no Nordeste e R$ 13,8 mil no Sudeste.", options: { color: C.text1 } },
      { text: "   *Norte: 36 respostas, apenas indicativo.", options: { color: H.tinta2, fontSize: 11 } },
    ], { x: 0.6, y: 4.68, w: 12.13, h: 0.36, fontSize: 13, valign: "middle" });
    p4RodapeCartoes(s, [
      ["R$ 13,5 mil", "salário médio no Sudeste"],
      ["R$ 10,3 mil", "salário médio no Nordeste", C.accent2],
      ["73%", "dos seniores do Nordeste em remoto"],
    ], "Contratar remoto fora do Sudeste amplia o funil de talentos e a diversidade regional.");
    s.addNotes(
      "A diferença média entre regiões é grande, mas boa parte é composição: o Nordeste tem proporcionalmente mais júniores e plenos. " +
      "Comparando só seniores, os salários se igualam, o que sugere que o profissional sênior do Nordeste já compete no mercado nacional via trabalho remoto. " +
      "O Norte tem apenas 36 respondentes, então seus números são indicativos."
    );
  }

  // ---- Modelo de trabalho: atual x ideal -----------------------------------------------------
  {
    const s = slideConteudo("6 · Região, senioridade e modelo de trabalho", "21% trabalham 100% presencial, mas só 2% querem esse modelo", fonteTabela("modelo_trabalho"), 6);
    const m = D.modelo_trabalho_2025;
    legendaGrafico(s, "grafico-modelo-legenda", "% dos profissionais de dados, 2025", 0.6, 1.85, 7.9);
    s.addChart(pres.charts.BAR, [
      { name: "Modelo atual", labels: m.categorias, values: m.atual },
      { name: "Modelo ideal", labels: m.categorias, values: m.ideal },
    ], grafico({
      x: 0.6, y: 2.15, w: 7.9, h: 4.65, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.cinza, H.azul],
      dataLabelFormatCode: PCT1, valAxisMaxVal: 52, barGapWidthPct: 45, showLegend: true, legendPos: "t", catAxisLabelFontSize: 12,
      objectName: "grafico-modelo",
      altText: "Barras agrupadas: modelo atual e ideal; 100% presencial é 20,8% hoje e 1,9% desejado; híbrido flexível 19,6% hoje e 43% desejado",
    }));
    painelLateral(s, 8.9, {
      hero: ["2%", "querem trabalhar 100% presencial, mas 21% estão nesse modelo hoje"],
      dados: [
        "Ideal: remoto (42%) + híbrido flexível (43%) = 85%",
        "Maior desalinhamento: híbrido flexível, de 20% hoje para 43% desejado",
        "Remoto cresce com a senioridade: 26% dos júniores, 50% dos seniores e 52% dos especialistas",
      ],
      banco: "Flexibilidade é uma alavanca de atração mais barata que salário, sobretudo para seniores.",
      tamDados: 11.5,
    });
    s.addNotes(
      "O desalinhamento entre o modelo atual e o desejado é o maior de toda a pesquisa: quase ninguém quer o presencial integral. " +
      "O remoto cresce com a senioridade, ou seja, os perfis mais caros e escassos são justamente os que mais trabalham remoto. " +
      "Entre os júniores, 37% estão em modelo 100% presencial."
    );
  }

  secao("7 · Recorte Finanças");

  // ---- Finanças x demais setores -------------------------------------------------------------
  {
    const s = slideConteudo("7 · Recorte do cliente", "Finanças paga 13% mais e tem profissionais mais satisfeitos, mas é menos remoto", fonteTabela("comparativo_financas"), 7);
    const f = D.financas_2025;
    legendaGrafico(s, "grafico-financas-legenda", "Finanças vs. demais setores, 2025 (% dos profissionais)", 0.6, 1.85, 7.9);
    s.addChart(pres.charts.BAR, [
      { name: "Finanças ou Bancos", labels: f.categorias, values: f.financas },
      { name: "Demais setores", labels: f.categorias, values: f.demais },
    ], grafico({
      x: 0.6, y: 2.15, w: 7.9, h: 4.65, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.laranja, H.cinza],
      dataLabelFormatCode: PCT1, dataLabelFontSize: 10, valAxisMaxVal: 115, barGapWidthPct: 40, showLegend: true, legendPos: "t",
      catAxisLabelFontSize: 11, objectName: "grafico-financas",
      altText: "Barras agrupadas comparando Finanças e demais setores em uso de IA, IA paga pela empresa, senioridade, remoto, presencial, mulheres e busca de emprego",
    }));
    const fmt = (v) => (v / 1000).toFixed(1).replace(".", ",");
    const premio = Math.round((f.salario_financas / f.salario_demais - 1) * 100);
    cartaoNumero(s, "financas-salario", 8.9, 1.85, 3.83, 1.6, `+${premio}%`,
      `salário médio: R$ ${fmt(f.salario_financas)} mil em Finanças contra R$ ${fmt(f.salario_demais)} mil nos demais setores`,
      { cor: C.accent2, tam: 30 });
    cartaoNumero(s, "financas-satisfeitos", 8.9, 3.6, 3.83, 1.55,
      `${Math.round(f.satisfeitos_financas)}% vs ${Math.round(f.satisfeitos_demais)}%`,
      "profissionais satisfeitos: Finanças contra demais setores", { tam: 26 });
    paraBanco(s, 8.9, 5.3, 3.83, 1.5, "A flexibilidade é o ponto fraco do setor e a alavanca de atração mais acessível.");
    s.addNotes(
      "Este é o recorte do cliente. Finanças paga mais, investe mais em IA corporativa, tem mais mulheres e profissionais mais satisfeitos; " +
      "a satisfação é maior em todas as edições. O único indicador em que o setor perde para o mercado é a flexibilidade: menos remoto, mais presencial. " +
      "É aí que o banco pode se diferenciar dos concorrentes diretos."
    );
  }
});

// =============================================================================================
// RECOMENDAÇÕES E ENCERRAMENTO
// =============================================================================================
NOMES_ICONES.push("LuCompass", "LuTrendingUp", "LuTriangleAlert", "LuCheck", "LuCircleAlert", "LuBadgeDollarSign",
  "LuUsers", "LuFileText", "LuSearch", "LuShuffle", "LuDatabase", "LuRocket");

BLOCOS.push(function slidesRecomendacoes() {
  secao("Recomendações");

  slideDivisor("03", "O que o banco deve fazer", "Oportunidades, desafios e um roadmap em três fases para os próximos 24 meses", "LuCompass",
    "Terceira parte: o que o banco deve fazer, com oportunidades, desafios e um roadmap em três fases.");

  {
    const s = slideConteudo("7 · Oportunidades e desafios", "Oportunidades e desafios para o banco", FONTE, 7);
    const colunas = [
      ["Oportunidades", C.accent3, "LuTrendingUp", "LuCheck", H.verde, [
        ["Liderar a IA em produção:", "74% das empresas ainda não chegaram lá."],
        ["Marca empregadora forte:", "Finanças já paga mais e satisfaz mais."],
        ["Talento fora do Sudeste:", "seniores remotos com salário equivalente."],
        ["Base de diversidade:", "mulheres são 28% dos júniores."],
      ]],
      ["Desafios", C.accent2, "LuTriangleAlert", "LuCircleAlert", H.laranja, [
        ["Escassez de ML/IA:", "só 3% do mercado, com salários de até R$ 28,8 mil."],
        ["IA paralela:", "uso pessoal de IA sem governança sobre dados sensíveis."],
        ["Funil feminino:", "a presença cai de 28% para 18% até a gestão."],
        ["Flexibilidade:", "o setor é menos remoto que o mercado."],
      ]],
    ];
    const w = (12.13 - 0.33) / 2;
    colunas.forEach(([titulo, cor, icnTitulo, icnItem, corItem, itens], c) => {
      const x = 0.6 + c * (w + 0.33), id = `coluna-${c + 1}`;
      caixa(s, id, x, 1.85, w, 4.95, C.background2);
      circuloIcone(s, `${id}-icone`, icnTitulo, x + 0.35, 2.15, 0.62, cor, H.branco);
      texto(s, `${id}-titulo`, titulo, { x: x + 1.15, y: 2.15, w: w - 1.5, h: 0.62, fontFace: TITULO, fontSize: 21, color: C.text2, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.35, y: 3.03, w: w - 0.7, h: 0.012, fill: { color: H.linha }, line: { type: "none" }, objectName: `${id}-divisoria` });
      itens.forEach(([lead, txt], i) => {
        const y = 3.25 + i * 0.86;
        icone(s, `${id}-item-${i + 1}-icone`, icnItem, corItem, x + 0.38, y + 0.04, 0.3);
        texto(s, `${id}-item-${i + 1}`, [
          { text: `${lead} `, options: { fontFace: TITULO, color: C.text2 } },
          { text: txt },
        ], { x: x + 0.88, y, w: w - 1.2, h: 0.75, fontSize: 15, color: C.text1 });
      });
    });
    s.addNotes(
      "Resumo das evidências em duas colunas. As oportunidades vêm da posição já favorável do setor: salário, satisfação e investimento em IA acima do mercado, " +
      "num mercado em que três de cada quatro empresas ainda não colocaram IA em produção. Os desafios são escassez de talento de ML/IA, " +
      "uso de IA sem governança, o funil feminino que se estreita e a menor flexibilidade de trabalho."
    );
  }

  {
    const s = slideConteudo("7 · Recomendações", "Roadmap recomendado: governar a IA já, escalar em 12 a 24 meses", FONTE, 7);
    const fases = [
      ["0 a 6 meses", "Fundamentos", H.a24, [
        "Licenciar IA generativa corporativa com política de uso e LGPD",
        "Adotar híbrido flexível como padrão para times de dados",
        "Diagnóstico de equidade salarial por gênero e senioridade",
      ]],
      ["6 a 12 meses", "Plataforma e pessoas", H.azul, [
        "Plataforma de dados em AWS no padrão Medallion",
        "Carreira em Y com trilha de especialista",
        "Academia interna de ML/IA a partir dos analistas",
      ]],
      ["12 a 24 meses", "Escala", H.a25, [
        "Levar 3 a 5 casos de IA do piloto à produção com MLOps",
        "Metas de mulheres em cargos sênior e de gestão",
        "Recrutamento remoto nacional para perfis escassos",
      ]],
    ];
    const gap = 0.25, w = (12.13 - 2 * gap) / 3;
    fases.forEach(([prazo, nome, cor, itens], i) => {
      const xc = 0.6 + i * 4.0, x = 0.6 + i * (w + gap), id = `fase-${i + 1}`;
      s.addShape(pres.shapes.CHEVRON, { x: xc, y: 1.85, w: 4.13, h: 0.85, fill: { color: cor }, line: { type: "none" }, objectName: `${id}-seta` });
      texto(s, `${id}-titulo`, [
        { text: prazo.toUpperCase(), options: { fontSize: 11, bold: true, charSpacing: 1, breakLine: true } },
        { text: nome, options: { fontFace: TITULO, fontSize: 17 } },
      ], { x: xc + 0.55, y: 1.85, w: 4.13 - 1.1, h: 0.85, color: C.background1, valign: "middle" });
      caixa(s, `${id}-cartao`, x, 2.95, w, 3.85, C.background2);
      itens.forEach((t, j) => {
        const y = 3.25 + j * 1.15;
        icone(s, `${id}-acao-${j + 1}-icone`, "LuCheck", H.azul, x + 0.28, y + 0.04, 0.28);
        texto(s, `${id}-acao-${j + 1}`, t, { x: x + 0.72, y, w: w - 1.0, h: 1.0, fontSize: 14.5, color: C.text1 });
      });
    });
    s.addNotes(
      "As recomendações seguem a ordem de dependência. Primeiro, governança e quick wins: licenciar IA corporativa fecha o risco de IA paralela e, " +
      "pelos dados, se associa a maior retenção; flexibilizar o modelo de trabalho tem custo baixo. Depois, plataforma e carreira. " +
      "Por fim, escala: tirar casos de IA do piloto, que é onde 38% do mercado está parado."
    );
  }

  secao("Encerramento");

  {
    const s = slideConteudo("Metodologia", "Limitações: leia os números como tendência, não como censo");
    const itens = [
      ["LuBadgeDollarSign", "Salário estimado", "Usamos o ponto médio da faixa salarial declarada; a faixa mais alta é aberta."],
      ["LuUsers", "Amostra voluntária", "Quem responde é a comunidade engajada da Data Hackers, não uma amostra aleatória do mercado."],
      ["LuFileText", "Questionário muda", "Especialista só existe em 2025; perguntas sobre IA na empresa são respondidas apenas por gestores."],
      ["LuSearch", "Grupos pequenos", "Norte (36 respostas) e quem não usa IA (44) são apenas indicativos."],
      ["LuShuffle", "Correlação", "Diferenças entre grupos não provam causa: senioridade e setor se misturam aos efeitos."],
    ];
    itens.forEach(([icn, t, d], i) => {
      const y = 1.85 + i * 0.99, id = `limite-${i + 1}`;
      caixa(s, id, 0.6, y, 12.13, 0.86, C.background2);
      circuloIcone(s, `${id}-icone`, icn, 0.82, y + 0.17, 0.52, C.background1, H.azul);
      texto(s, `${id}-titulo`, t, { x: 1.6, y, w: 3.1, h: 0.86, fontFace: TITULO, fontSize: 15.5, color: C.text2, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: 4.8, y, w: 7.7, h: 0.86, fontSize: 14, color: C.text1, valign: "middle" });
    });
    s.addNotes(
      "Transparência sobre o que os dados permitem afirmar. As tendências entre edições e as diferenças grandes são robustas; " +
      "diferenças de poucos pontos percentuais e grupos pequenos devem ser lidos com cautela."
    );
  }

  {
    const s = slideConteudo("Reprodutibilidade", "Tudo reproduzível: código, notebooks e SQL entregues com o deck", "Execução passo a passo: docs/ROTEIRO_AWS_ACADEMY.md");
    const cab = { color: H.branco, fill: { color: H.navy }, fontFace: TITULO, fontSize: 14 };
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
      ...linhas.map((l, i) => l.map((t, j) => ({
        text: t,
        options: {
          fontSize: j === 1 ? 13 : 14, color: j === 0 ? H.navy : H.tinta, fontFace: j === 1 ? MONO : (j === 0 ? TITULO : undefined),
          fill: { color: i % 2 ? H.branco : H.lt2 },
        },
      }))),
    ], { x: 0.6, y: 1.9, w: 12.13, colW: [3.2, 4.63, 4.3], rowH: 0.58, valign: "middle", border: { type: "none" }, margin: [0, 0.15, 0, 0.15], objectName: "tabela-entregaveis" });
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
    const pilares = [
      ["LuDatabase", "Dados confiáveis", "Plataforma Medallion em AWS e governança"],
      ["LuRocket", "IA em produção", "Do piloto à produção com MLOps"],
      ["LuUsers", "Talento retido", "Carreira em Y, flexibilidade e equidade"],
    ];
    const gap = 0.25, w = (11.73 - 2 * gap) / 3;
    pilares.forEach(([icn, t, d], i) => {
      const x = 0.8 + i * (w + gap), y = 4.0, id = `pilar-${i + 1}`;
      caixa(s, id, x, y, w, 1.85, C.accent5);
      circuloIcone(s, `${id}-icone`, icn, x + 0.3, y + 0.3, 0.62, C.accent2, H.branco);
      texto(s, `${id}-titulo`, t, { x: x + 1.1, y: y + 0.3, w: w - 1.3, h: 0.62, fontFace: TITULO, fontSize: 18, color: C.background1, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: x + 0.3, y: y + 1.1, w: w - 0.6, h: 0.6, fontSize: 13.5, color: C.accent6 });
    });
    texto(s, "perguntas", "Obrigado · Perguntas e discussão", { x: 0.8, y: 6.35, w: 9.0, h: 0.45, fontFace: TITULO, fontSize: 18, color: C.accent6, valign: "middle" });
    s.addNotes("Fechamento: retomar a mensagem principal e abrir para perguntas.");
  }
});

// ---------------------------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------------------------
(async () => {
  await prepararIcones();
  definirLayouts();
  for (const bloco of BLOCOS) bloco();
  await pres.writeFile({ fileName: SAIDA });
  const skill = process.env.PPTX_SKILL_DIR;
  if (skill) {
    const { applyTheme } = require(path.join(skill, "scripts", "apply_theme.js"));
    await applyTheme(SAIDA, THEME);
  } else {
    console.warn("PPTX_SKILL_DIR não definido: cores do tema não aplicadas");
  }
  console.log(`deck gravado em ${SAIDA}`);
})().catch((e) => { console.error(e); process.exit(1); });
