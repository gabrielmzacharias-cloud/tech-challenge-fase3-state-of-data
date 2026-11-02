/* Gera o deck executivo do Tech Challenge Fase 3 (pptxgenjs, deck estruturado: tema, layouts, seções).
 *
 * Direção visual: relatório de pesquisa no estilo tipográfico suíço. Papel branco, tinta quase preta,
 * paleta petróleo/ardósia/sálvia/menta, com o petróleo reservado ao ponto de cada slide, grid de 12 colunas, filetes no lugar de caixas,
 * números grandes no grid e gráficos anotados direto no dado.
 *
 * Pré-requisitos: python scripts/exportar_dados_deck.py   (séries dos gráficos nativos, a partir da Gold)
 *                 python scripts/preparar_graficos_deck.py (diagrama de arquitetura em entrega/assets/charts)
 *                 fontes Schibsted Grotesk e JetBrains Mono instaladas (Google Fonts, OFL)
 * Uso:            NODE_PATH=<node_modules com pptxgenjs> PPTX_SKILL_DIR=<skill pptx> node scripts/gerar_deck.js
 * Saída:          entrega/TechChallenge_Fase3_DTAT.pptx
 */
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const RAIZ = process.env.DECK_RAIZ || path.resolve(__dirname, "..");
const ASSETS = path.join(RAIZ, "entrega", "assets", "charts");
const EVIDENCIAS = path.join(RAIZ, "entrega", "evidencias");
const SAIDA = process.env.DECK_SAIDA || path.join(RAIZ, "entrega", "TechChallenge_Fase3_DTAT.pptx");
const PROPORCAO = JSON.parse(fs.readFileSync(path.join(ASSETS, "tamanhos.json"), "utf8"));
const D = JSON.parse(fs.readFileSync(path.join(RAIZ, "entrega", "assets", "dados_deck.json"), "utf8"));

// ---------------------------------------------------------------------------------------------
// Tema
// ---------------------------------------------------------------------------------------------
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
// Hex para opções que não aceitam cor de esquema (gráficos, tabelas, linhas)
const H = {
  tinta: "1C2B31",     // texto principal e série secundária (14,6:1 sobre branco)
  tinta2: "45555C",    // texto de apoio (7,8:1)
  meta: "5D6D73",      // fonte, numeração e eixos (5,4:1)
  filete: "D4DEDB",    // filetes finos
  apagado: "C9E4CA",   // dado sem destaque nos gráficos (menta da paleta)
  medio: "87BBA2",     // passo intermediário das escalas (sálvia)
  teal: "55828B",      // terceira série quando necessária
  papel: "FFFFFF",
  ultra: "3B6064",     // o ponto de cada slide (petróleo, 6,9:1 sobre branco)
  ultraEscuro: "364958", // fundo das páginas de abertura (ardósia)
  ultraClaro: "C9E4CA",  // texto claro sobre fundo escuro (6,9:1 sobre ardósia)
  codigo: "1C2B31",
};
const FONTE_TITULO = "Schibsted Grotesk SemiBold";
const FONTE_MEDIA = "Schibsted Grotesk Medium";
const FONTE_TEXTO = "Schibsted Grotesk";
const MONO = "JetBrains Mono";
const FONTE = "Fonte: State of Data Brasil 2023, 2024 e 2025 (Data Hackers e Bain & Company)";
const fonteTabela = (t) => `${FONTE} · tabela sod_gold.${t}`;

// Grid: 12 colunas entre as margens de 0,75 pol
const G = { x0: 0.75, w: 11.833, col: 0.757, gut: 0.25, topo: 2.0, base: 6.7 };
const gx = (c) => G.x0 + c * (G.col + G.gut);              // x da coluna c (0 a 11)
const gw = (n) => n * G.col + (n - 1) * G.gut;              // largura de n colunas

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
function definirLayouts() {
  // Capa, divisores e encerramento: o verde-petróleo ocupa a página inteira
  pres.defineSlideMaster({
    title: "CAPA",
    background: { color: H.ultra },
    objects: [
      { text: { text: "FIAP Pós Tech · Data Analytics · Tech Challenge Fase 3", options: { x: 0.75, y: 0.5, w: 8, h: 0.3, fontFace: FONTE_TEXTO, fontSize: 11, color: H.papel, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.75, y: 1.5, w: 8.6, h: 3.2, fontSize: 50, color: C.background1, valign: "bottom", margin: 0, lineSpacingMultiple: 0.92, charSpacing: -1 }, text: "" } },
      { placeholder: { options: { name: "subtitulo", type: "body", x: 0.75, y: 4.95, w: 7.5, h: 0.9, fontSize: 17, color: C.background1, valign: "top", margin: 0 }, text: "" } },
    ],
  });

  pres.defineSlideMaster({
    title: "DIVISOR",
    background: { color: H.ultra },
    objects: [
      { placeholder: { options: { name: "parte", type: "body", x: 0.75, y: 0.5, w: 6, h: 0.3, fontSize: 11, color: C.background1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.75, y: 1.8, w: 10.5, h: 2.6, fontSize: 60, color: C.background1, valign: "bottom", margin: 0, lineSpacingMultiple: 0.9, charSpacing: -1.5 }, text: "" } },
      { placeholder: { options: { name: "corpo", type: "body", x: 0.75, y: 4.75, w: 6.7, h: 1.5, fontSize: 17, color: C.background1, valign: "top", margin: 0 }, text: "" } },
    ],
  });

  // Conteúdo: cabeça corrida (onde o leitor está), título-mensagem, área útil y 2,0 a 6,7, rodapé com fonte
  pres.defineSlideMaster({
    title: "CONTEUDO",
    background: { color: H.papel },
    objects: [
      { placeholder: { options: { name: "cabeca", type: "body", x: 0.75, y: 0.38, w: 6, h: 0.25, fontSize: 9.5, color: H.meta, valign: "middle", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "secao", type: "body", x: 6.75, y: 0.38, w: 5.833, h: 0.25, fontSize: 9.5, color: H.meta, align: "right", valign: "middle", margin: 0 }, text: "" } },
      { rect: { x: 0.75, y: 0.7, w: 11.833, h: 0.01, fill: { color: H.tinta } } },
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.75, y: 0.88, w: 11.833, h: 0.95, fontSize: 26, color: C.text1, valign: "top", margin: 0, lineSpacingMultiple: 0.95, charSpacing: -0.4 }, text: "" } },
      { rect: { x: 0.75, y: 6.93, w: 11.833, h: 0.008, fill: { color: H.filete } } },
      { placeholder: { options: { name: "fonte", type: "body", x: 0.75, y: 7.0, w: 11.0, h: 0.28, fontSize: 8.5, color: H.meta, valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.083, y: 7.0, w: 0.5, h: 0.28, fontFace: FONTE_TEXTO, fontSize: 8.5, color: H.meta, align: "right" },
  });

  pres.defineSlideMaster({
    title: "ENCERRAMENTO",
    background: { color: H.ultra },
    objects: [
      { placeholder: { options: { name: "title", type: "title", align: "left", x: 0.75, y: 0.9, w: 11.0, h: 2.2, fontSize: 44, color: C.background1, valign: "bottom", margin: 0, lineSpacingMultiple: 0.92, charSpacing: -1 }, text: "" } },
      { placeholder: { options: { name: "corpo", type: "body", x: 0.75, y: 3.35, w: 8.0, h: 1.2, fontSize: 17, color: C.background1, valign: "top", margin: 0 }, text: "" } },
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

function texto(s, nome, conteudo, opcoes) {
  s.addText(conteudo, { margin: 0, valign: "top", isTextBox: true, objectName: nome, fontFace: FONTE_TEXTO, ...opcoes });
}

// Filete horizontal (espessura em pt)
function filete(s, nome, x, y, w, cor = H.tinta, pt = 0.75) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: pt / 72, fill: { color: cor }, line: { type: "none" }, objectName: nome });
}

// Linha de chamada: liga uma anotação ao dado (ponto no dado, traço fino até o texto)
function chamada(s, nome, x1, y1, x2, y2, cor = H.ultra) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
    flipH: (x2 < x1) !== (y2 < y1) ? true : false, line: { color: cor, width: 0.75 }, objectName: nome });
  s.addShape(pres.shapes.OVAL, { x: x1 - 0.035, y: y1 - 0.035, w: 0.07, h: 0.07, fill: { color: cor }, line: { type: "none" }, objectName: `${nome}-ponto` });
}

// Lista com travessão
function marcadores(itens, tamanho = 12, cor = H.tinta2, espaco = 7) {
  return itens.map((t, i) => ({
    text: t,
    options: { bullet: { code: "2013", indent: 14 }, fontSize: tamanho, color: cor, paraSpaceAfter: espaco, breakLine: i < itens.length - 1 },
  }));
}

// Número grande no grid, com legenda abaixo (sem caixa)
function numero(s, nome, x, y, w, valor, legenda, { cor = H.tinta, tam = 54, hValor = 0.85, hLegenda = 0.75, tamLegenda = 12 } = {}) {
  texto(s, `${nome}-valor`, valor, { x, y, w, h: hValor, fontFace: FONTE_MEDIA, fontSize: tam, color: cor, valign: "bottom", charSpacing: -1 });
  texto(s, `${nome}-legenda`, legenda, { x, y: y + hValor + 0.08, w, h: hLegenda, fontSize: tamLegenda, color: H.tinta2 });
}

// Coluna suíça: filete de 1 pt no topo, título e texto
function bloco(s, nome, x, y, w, titulo, corpo, { h = 1.4, tamTitulo = 13, tamCorpo = 11.5, cor = H.tinta } = {}) {
  filete(s, `${nome}-filete`, x, y, w, cor, 1);
  texto(s, `${nome}-titulo`, titulo, { x, y: y + 0.12, w, h: 0.32, fontFace: FONTE_TITULO, fontSize: tamTitulo, color: H.tinta });
  if (corpo) texto(s, `${nome}-corpo`, corpo, { x, y: y + 0.5, w, h: h - 0.5, fontSize: tamCorpo, color: H.tinta2 });
}

// "Para o banco": a implicação de negócio, marcada pelo filete petróleo
function paraBanco(s, x, y, w, txt, { h = 1.35, tam = 13.5 } = {}) {
  filete(s, "para-banco-filete", x, y, w, H.ultra, 2.25);
  texto(s, "para-banco-rotulo", "Para o banco", { x, y: y + 0.14, w, h: 0.28, fontFace: FONTE_TITULO, fontSize: 11, color: H.ultra });
  texto(s, "para-banco-texto", txt, { x, y: y + 0.48, w, h: h - 0.48, fontFace: FONTE_MEDIA, fontSize: tam, color: H.tinta });
}

function slideConteudo(secaoTxt, titulo, fonte = FONTE, cabeca = "State of Data Brasil 2023–2025 · Análise para o banco") {
  const s = pres.addSlide({ masterName: "CONTEUDO", sectionTitle: SECAO });
  s.addText(cabeca, { placeholder: "cabeca" });
  s.addText(secaoTxt, { placeholder: "secao" });
  s.addText(titulo, { placeholder: "title" });
  s.addText(fonte, { placeholder: "fonte" });
  return s;
}

function slideDivisor(parte, titulo, corpo, notas) {
  const s = pres.addSlide({ masterName: "DIVISOR", sectionTitle: SECAO });
  s.addText(parte, { placeholder: "parte" });
  s.addText(titulo, { placeholder: "title" });
  s.addText(corpo, { placeholder: "corpo" });
  s.addNotes(notas);
  return s;
}

// Linha de unidade acima de cada gráfico
function rotuloGrafico(s, nome, txt, x, y, w) {
  texto(s, nome, txt, { x, y, w, h: 0.28, fontSize: 10.5, color: H.tinta2, valign: "middle" });
}

// Opções base dos gráficos nativos (objeto novo a cada chamada: o pptxgenjs altera as opções)
function grafico(extra) {
  return Object.assign({
    catAxisLabelColor: H.tinta2, valAxisLabelColor: H.meta,
    catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt",
    catAxisLabelFontSize: 10.5, valAxisLabelFontSize: 9.5, dataLabelFontSize: 10, legendFontSize: 10.5, legendColor: H.tinta2,
    catAxisLineShow: true, catAxisLineColor: H.filete, catAxisMajorTickMark: "none",
    valAxisHidden: true, valAxisLineShow: false, valAxisMinVal: 0,
    valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showValue: true, dataLabelColor: H.tinta2, dataLabelPosition: "outEnd",
    showLegend: false, barGapWidthPct: 45,
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
// Uma cor por categoria: destaque pela regra, apagado para o resto
const coresPor = (categorias, regra) => categorias.map((c) => regra(c) || H.apagado);
// Espaço não separável entre "R$" e o valor
const rs = (v) => `R$ ${v}`;

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
BLOCOS.push(function slidesAbertura() {
  secao("Abertura");

  // 1 · Capa: a série de uso de IA empilhada em numerais à direita
  {
    const s = pres.addSlide({ masterName: "CAPA", sectionTitle: SECAO });
    s.addText("O mercado de dados e IA no Brasil: o que o banco precisa saber", { placeholder: "title" });
    s.addText("State of Data Brasil 2023, 2024 e 2025 · Análise para uma grande instituição financeira", { placeholder: "subtitulo" });
    texto(s, "integrantes", "Grupo 28 · Gabriel Zacharias · RM 375453 · Novembro de 2026", { x: 0.75, y: 6.75, w: 8, h: 0.3, fontSize: 11, color: H.papel });
    const { anos, usa } = D.ia_adocao;
    const x = gx(9), w = gw(3);
    filete(s, "capa-filete", x, 1.55, w, H.papel, 0.75);
    texto(s, "capa-rotulo", "Usam IA generativa no trabalho", { x, y: 1.65, w, h: 0.3, fontSize: 10.5, color: H.papel });
    anos.forEach((a, i) => {
      const y = 2.15 + i * 0.95, tam = i === 2 ? 48 : 34;
      // caixas ancoradas na base: sobe o ano pela diferença de descendente (0,277 em) para dividir a linha de base
      const ajuste = ((tam - 10.5) * 0.277) / 72;
      texto(s, `capa-ano-${a}`, a, { x, y: y - ajuste, w: 0.7, h: 0.8, fontSize: 10.5, color: H.ultraClaro, valign: "bottom" });
      texto(s, `capa-valor-${a}`, `${Math.round(usa[i])}%`, { x: x + 0.7, y, w: w - 0.7, h: 0.8, fontFace: FONTE_MEDIA, fontSize: tam, color: H.papel, align: "right", valign: "bottom", charSpacing: -1 });
    });
    s.addNotes(
      "Abertura. Somos a consultoria contratada para traduzir três anos de pesquisa State of Data Brasil em decisões para o banco: " +
      "quem contratar, quanto pagar, que tecnologia adotar e como transformar IA em resultado. " +
      "Toda a análise foi construída num data lake na AWS (S3, Glue e Athena), com código entregue junto deste material."
    );
  }

  // 2 · Sumário executivo
  {
    const s = slideConteudo("Sumário executivo", "O mercado de dados adotou a IA em massa;\no desafio agora é escalar e reter talento");
    texto(s, "mensagem-texto",
      "O mercado de dados brasileiro está mais sênior, mais caro e já usa IA no dia a dia, mas poucas empresas transformaram IA em resultado. " +
      "O banco parte em vantagem (paga mais e retém melhor que o mercado) e pode liderar se escalar IA com governança, " +
      "formar talentos de ML/IA e oferecer a flexibilidade que 85% dos profissionais desejam.",
      { x: gx(0), y: 2.0, w: gw(5) + 0.5, h: 3.0, fontFace: FONTE_MEDIA, fontSize: 16.5, color: H.tinta, lineSpacingMultiple: 1.12 });

    const kpis = [
      ["98%", "usam IA generativa no trabalho (eram 80% em 2023)"],
      ["26%", "das empresas têm IA em produção; 38% ainda em piloto", true],
      ["+13%", "de salário médio em Finanças frente aos demais setores"],
      ["22%", "dos profissionais são mulheres, com gap salarial de 19%"],
    ];
    kpis.forEach(([v, l, destaque], i) => {
      const x = gx(6 + (i % 2) * 3), y = 2.0 + Math.floor(i / 2) * 1.62, w = gw(3);
      filete(s, `kpi-${i + 1}-filete`, x, y, w, H.tinta, 0.75);
      numero(s, `kpi-${i + 1}`, x, y + 0.06, w, v, l, { cor: destaque ? H.ultra : H.tinta, tam: 40, hValor: 0.7, hLegenda: 0.62, tamLegenda: 11 });
    });

    const alavancas = [
      ["Governar e escalar a IA", "Licença corporativa com governança e LGPD; levar os pilotos à produção com MLOps."],
      ["Formar talento de ML/IA", "Academia interna e carreira em Y para um perfil que é só 3% do mercado."],
      ["Flexibilidade como alavanca", "Híbrido flexível como padrão: 85% querem trabalho remoto ou híbrido flexível."],
    ];
    alavancas.forEach(([t, d], i) => bloco(s, `alavanca-${i + 1}`, gx(i * 4), 5.4, gw(4), t, d, { h: 1.3, cor: i === 0 ? H.ultra : H.tinta }));
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
      ["O desafio", "Uma grande instituição financeira quer entender o mercado de dados e IA no Brasil para orientar contratação, retenção, investimento em tecnologia e adoção de IA."],
      ["A abordagem", "Consolidamos as três edições mais recentes do State of Data Brasil num data lake na AWS (S3, Glue e Athena), com camadas Bronze, Silver e Gold e análises em PySpark."],
      ["O recorte", "As análises de mercado usam os 12.841 profissionais que atuam com dados. Salário é o ponto médio da faixa declarada."],
    ];
    blocos.forEach(([t, d], i) => bloco(s, `bloco-${i + 1}`, gx(0), 2.0 + i * 1.6, gw(6), t, d, { h: 1.45, tamCorpo: 12.5 }));

    const x = gx(7), w = gw(5);
    filete(s, "escopo-filete", x, 2.0, w, H.tinta, 0.75);
    numero(s, "escopo-total", x, 2.06, w, "14.002", "respostas nas edições 2023, 2024 e 2025", { cor: H.ultra, tam: 54, hValor: 0.85, hLegenda: 0.35 });
    const edicoes = ["2023", "2024", "2025"].map((a) => [a, D.kpis[a].respondentes]);
    const maxN = Math.max(...edicoes.map((e) => e[1]));
    edicoes.forEach(([ano, n], i) => {
      const y = 3.55 + i * 0.36, bw = (n / maxN) * 3.0;
      texto(s, `edicao-${ano}-ano`, ano, { x, y, w: 0.55, h: 0.26, fontSize: 10.5, color: H.meta, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: x + 0.62, y: y + 0.08, w: bw, h: 0.1, fill: { color: H.tinta }, line: { type: "none" }, objectName: `edicao-${ano}-barra` });
      texto(s, `edicao-${ano}-n`, n.toLocaleString("pt-BR"), { x: x + 0.72 + bw, y, w: 0.8, h: 0.26, fontSize: 10.5, color: H.tinta2, valign: "middle" });
    });
    filete(s, "escopo-divisoria", x, 4.85, w, H.filete, 0.75);
    [["12.841", "atuam com dados: a base das análises"], ["1.190", "colunas mapeadas no dicionário de dados"]].forEach(([v, l], i) => {
      numero(s, `escopo-${i + 1}`, x + i * (gw(2) + G.gut + 0.4), 4.95, gw(2) + 0.25, v, l, { tam: 30, hValor: 0.55, hLegenda: 0.6, tamLegenda: 11 });
    });
    s.addNotes(
      "O State of Data Brasil é a maior pesquisa sobre o mercado de dados no país, feita pela Data Hackers com a Bain & Company. " +
      "Usamos as três edições mais recentes: 5.293 respostas em 2023, 5.215 em 2024 e 3.494 em 2025. " +
      "Como as perguntas mudam entre edições, harmonizamos cargos, senioridade e faixas salariais na camada Silver para comparar os anos."
    );
  }

  // 4 · Agenda: as sete perguntas como lista tipográfica
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
    filete(s, "agenda-topo", gx(0), 2.0, G.w, H.tinta, 1);
    const passo = 0.5;
    itens.forEach(([p, r], i) => {
      const y = 2.0 + i * passo;
      texto(s, `agenda-${i + 1}-num`, `Q${i + 1}`, { x: gx(0), y, w: gw(1), h: passo, fontFace: FONTE_TITULO, fontSize: 13, color: H.ultra, valign: "middle" });
      texto(s, `agenda-${i + 1}-pergunta`, p, { x: gx(1), y, w: gw(4), h: passo, fontFace: FONTE_TITULO, fontSize: 13, color: H.tinta, valign: "middle" });
      texto(s, `agenda-${i + 1}-resposta`, r, { x: gx(5), y, w: gw(7), h: passo, fontSize: 13, color: H.tinta2, valign: "middle" });
      filete(s, `agenda-${i + 1}-filete`, gx(0), y + passo, G.w, H.filete, 0.75);
    });
    const partes = [
      ["Parte 1 · Como construímos", "Arquitetura AWS, camadas Medallion, código e evidências"],
      ["Parte 2 · O que os dados mostram", "As sete perguntas, Q1 a Q7, com a implicação para o banco"],
      ["Parte 3 · O que o banco deve fazer", "Oportunidades, desafios, roadmap e limitações"],
    ];
    partes.forEach(([t, d], i) => bloco(s, `parte-${i + 1}`, gx(i * 4), 5.85, gw(4), t, d, { h: 0.85, tamTitulo: 12, tamCorpo: 11 }));
    s.addNotes("Estruturamos a apresentação nas sete perguntas do desafio. Ao lado de cada uma está a resposta curta; os próximos slides mostram a evidência de cada resposta.");
  }

  // =============================================================================================
  // ARQUITETURA
  // =============================================================================================
  secao("Arquitetura");

  // 5 · Divisor
  {
    const s = slideDivisor("Parte 1 de 3", "Como construímos", "Arquitetura na AWS, camadas Medallion, regras de qualidade e evidências da execução",
      "Primeira parte: como o pipeline foi construído na AWS, da ingestão às consultas no Athena.");
    texto(s, "divisor-numero", "14.002", { x: 6.6, y: 0.55, w: 5.983, h: 1.9, fontFace: FONTE_MEDIA, fontSize: 120, color: H.papel, align: "right", valign: "bottom", charSpacing: -3 });
    texto(s, "divisor-numero-legenda", "respostas harmonizadas em um data lake na AWS", { x: 6.6, y: 2.6, w: 5.983, h: 0.35, fontSize: 15, color: H.ultraClaro, align: "right" });
  }

  // 6 · Arquitetura AWS
  {
    const s = slideConteudo("Arquitetura", "Pipeline serverless na AWS: S3 + Glue + Athena,\ndentro do AWS Academy", "Diagrama: arquitetura/arquitetura_aws.drawio");
    // Fluxo principal em uma linha: armazenamento (moldura) e processamento (filete no topo) alternados
    const nos = [
      ["fonte", "Origem", "Kaggle", "3 CSVs anuais"],
      ["s3", "Amazon S3", "raw", "CSV original"],
      ["glue", "AWS Glue", "Job 01", "PySpark"],
      ["s3", "Amazon S3", "bronze", "Parquet"],
      ["glue", "AWS Glue", "Job 02", "PySpark"],
      ["s3", "Amazon S3", "silver", "Parquet"],
      ["glue", "AWS Glue", "Job 03", "PySpark"],
      ["gold", "Amazon S3", "gold", "10 tabelas"],
      ["athena", "Amazon", "Athena", "16 consultas SQL"],
    ];
    const vao = 0.3, wn = (G.w - vao * (nos.length - 1)) / nos.length, y1 = 2.2, hn = 1.3;
    const xn = (i) => G.x0 + i * (wn + vao);
    nos.forEach(([tipo, servico, nome, detalhe], i) => {
      const x = xn(i), id = `no-${i + 1}`, gold = tipo === "gold";
      if (tipo === "s3" || tipo === "gold" || tipo === "athena") {
        s.addShape(pres.shapes.RECTANGLE, { x, y: y1, w: wn, h: hn, fill: gold ? { color: H.ultra } : { type: "none" },
          line: { color: gold ? H.ultra : H.tinta, width: 1 }, objectName: `${id}-moldura` });
        if (tipo === "s3") filete(s, `${id}-topo`, x, y1, wn, H.ultra, 2.25);
      } else {
        filete(s, `${id}-topo`, x, y1, wn, tipo === "glue" ? H.medio : H.filete, 2.25);
      }
      const corT = gold ? H.papel : H.tinta, corS = gold ? H.ultraClaro : H.meta, px = tipo === "glue" || tipo === "fonte" ? 0 : 0.1;
      texto(s, `${id}-servico`, servico, { x: x + px, y: y1 + 0.14, w: wn - 2 * px, h: 0.25, fontSize: 10, color: corS });
      texto(s, `${id}-nome`, nome, { x: x + px, y: y1 + 0.42, w: wn - 2 * px, h: 0.36, fontFace: FONTE_TITULO, fontSize: 15, color: corT });
      texto(s, `${id}-detalhe`, detalhe, { x: x + px, y: y1 + 0.82, w: wn - 2 * px, h: 0.42, fontSize: 10, color: gold ? H.papel : H.tinta2 });
      if (i < nos.length - 1) {
        s.addShape(pres.shapes.LINE, { x: x + wn + 0.04, y: y1 + hn / 2, w: vao - 0.08, h: 0,
          line: { color: H.tinta, width: 1, endArrowType: "triangle" }, objectName: `${id}-seta` });
      }
    });

    // Ingestão: como os CSVs chegam à zona raw
    texto(s, "ingestao", "Upload pelo console do S3 ou pela AWS CLI no CloudShell (scripts/01_ingestao_s3.sh)",
      { x: xn(0), y: y1 + hn + 0.15, w: 2 * wn + vao, h: 0.55, fontSize: 10, color: H.tinta2 });

    // Job 04: lê a Gold e grava os gráficos
    const xg = xn(7), yj = 4.0;
    s.addShape(pres.shapes.LINE, { x: xg + wn / 2, y: y1 + hn + 0.04, w: 0, h: yj - (y1 + hn) - 0.08,
      line: { color: H.tinta, width: 1, endArrowType: "triangle" }, objectName: "job04-seta" });
    filete(s, "job04-topo", xg, yj, wn, H.medio, 2.25);
    texto(s, "job04-servico", "AWS Glue", { x: xg, y: yj + 0.14, w: wn, h: 0.25, fontSize: 10, color: H.meta });
    texto(s, "job04-nome", "Job 04", { x: xg, y: yj + 0.42, w: wn, h: 0.36, fontFace: FONTE_TITULO, fontSize: 15, color: H.tinta });
    texto(s, "job04-detalhe", "15 gráficos em output/charts/", { x: xg, y: yj + 0.82, w: wn, h: 0.42, fontSize: 10, color: H.tinta2 });

    // Catálogo: metastore entre os jobs e o Athena
    const yc = 5.45, xc = xn(2), wc = xn(8) + wn - xc;
    [[2, y1 + hn], [4, y1 + hn], [6, y1 + hn], [7, yj + 1.28], [8, y1 + hn]].forEach(([i, yi]) => {
      s.addShape(pres.shapes.LINE, { x: xn(i) + wn / 2, y: yi + 0.04, w: 0, h: yc - yi - 0.04,
        line: { color: H.meta, width: 0.75, dashType: "dash" }, objectName: `catalogo-ligacao-${i}` });
    });
    filete(s, "catalogo-topo", xc, yc, wc, H.tinta, 1);
    texto(s, "catalogo-nome", "Glue Data Catalog", { x: xc, y: yc + 0.12, w: wc, h: 0.32, fontFace: FONTE_TITULO, fontSize: 13, color: H.tinta });
    texto(s, "catalogo-detalhe", "sod_bronze · sod_silver · sod_gold, registrados pelos próprios jobs (saveAsTable); o Athena consulta por aqui",
      { x: xc, y: yc + 0.48, w: wc, h: 0.3, fontSize: 10.5, color: H.tinta2 });

    // Base: ambiente
    filete(s, "ambiente-filete", gx(0), 6.38, G.w, H.filete, 0.75);
    texto(s, "ambiente", "IAM LabRole · CloudWatch Logs · região us-east-1 · AWS Academy Learner Lab · tudo serverless, pago por uso",
      { x: gx(0), y: 6.44, w: G.w, h: 0.26, fontSize: 10, color: H.meta, valign: "middle" });
    s.addNotes(
      "Os CSVs do Kaggle são enviados ao S3 na zona raw pelo console (ou pela AWS CLI no CloudShell). Três jobs do AWS Glue em PySpark produzem as camadas Bronze, Silver e Gold, " +
      "sempre em Parquet e registradas no Glue Data Catalog. O Athena consulta a Gold com SQL e um quarto job do Glue (o mesmo código do notebook 04) gera os gráficos. " +
      "Tudo é serverless e roda com a LabRole do AWS Academy: não há servidor para manter e o custo é por uso."
    );
  }

  // 7 · Medallion: quatro colunas ligadas por filetes-seta
  {
    const s = slideConteudo("Arquitetura", "Arquitetura Medallion: do CSV bruto a 10 tabelas Gold\nprontas para o negócio", "Código: notebooks/01_bronze_ingestao, 02_silver_tratamento, 03_gold_agregacoes");
    const camadas = [
      ["Raw", "s3://…/raw/", "CSVs originais do Kaggle, uma pasta por edição.", "Console S3 / CLI · 01_ingestao_s3.sh", ["3", "edições"]],
      ["Bronze", "sod_bronze", "Parquet com colunas normalizadas, ano da pesquisa e dicionário de perguntas.", "Glue · 01_bronze_ingestao", ["402 / 406 / 391", "colunas por edição"]],
      ["Silver", "sod_silver", "Modelo harmonizado entre anos; faixas viram valores; respostas múltiplas em formato longo.", "Glue · 02_silver_tratamento", ["14.002", "respondentes"]],
      ["Gold", "sod_gold", "Tabelas agregadas, uma por pergunta de negócio, prontas para o Athena.", "Glue · 03_gold_agregacoes", ["10", "tabelas"]],
    ];
    camadas.forEach(([nome, local, desc, job, [v, l]], i) => {
      const x = gx(i * 3), w = gw(3), id = nome.toLowerCase(), ultima = i === 3;
      // filete-seta no topo: o fluxo atravessa a calha até a próxima camada
      s.addShape(pres.shapes.LINE, { x, y: 2.0, w: ultima ? w : w + G.gut - 0.04, h: 0,
        line: { color: ultima ? H.ultra : H.tinta, width: ultima ? 2.25 : 1, endArrowType: ultima ? undefined : "triangle" }, objectName: `camada-${id}-fluxo` });
      texto(s, `camada-${id}-nome`, nome, { x, y: 2.15, w, h: 0.5, fontFace: FONTE_TITULO, fontSize: 24, color: ultima ? H.ultra : H.tinta, charSpacing: -0.5, valign: "bottom" });
      texto(s, `camada-${id}-local`, local, { x, y: 2.7, w, h: 0.28, fontFace: MONO, fontSize: 10.5, color: H.meta });
      texto(s, `camada-${id}-desc`, desc, { x, y: 3.15, w, h: 1.05, fontSize: 12.5, color: H.tinta });
      texto(s, `camada-${id}-job`, job, { x, y: 4.25, w, h: 0.5, fontFace: MONO, fontSize: 9.5, color: H.tinta2 });
      filete(s, `camada-${id}-linha`, x, 4.85, w, H.filete, 0.75);
      numero(s, `camada-${id}-stat`, x, 4.9, w, v, l, { tam: 24, hValor: 0.5, hLegenda: 0.3, tamLegenda: 11, cor: ultima ? H.ultra : H.tinta });
    });
    filete(s, "catalogo-filete", gx(0), 6.05, G.w, H.filete, 0.75);
    texto(s, "catalogo", [
      { text: "Glue Data Catalog ", options: { fontFace: FONTE_TITULO, color: H.tinta } },
      { text: "registra sod_bronze, sod_silver e sod_gold  ·  " },
      { text: "Athena ", options: { fontFace: FONTE_TITULO, color: H.tinta } },
      { text: "consulta a Gold com SQL  ·  " },
      { text: "Glue Job 04 ", options: { fontFace: FONTE_TITULO, color: H.tinta } },
      { text: "gera os gráficos em PySpark" },
    ], { x: gx(0), y: 6.15, w: G.w, h: 0.38, fontSize: 12, color: H.tinta2, valign: "middle" });
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
const FONTE_AWS = "Fonte: console AWS, conta do AWS Academy Learner Lab (us-east-1) · capturas em entrega/evidencias/";

// Coluna numerada: filete de 1 pt, número petróleo + título, texto de apoio
function p2Coluna(s, nome, x, y, w, num, titulo, corpo, { hTitulo = 0.5, tamTitulo = 12.5, tamCorpo = 11, hCorpo = 1.2 } = {}) {
  filete(s, `${nome}-filete`, x, y, w, H.tinta, 1);
  texto(s, `${nome}-titulo`, [
    { text: `${num}  `, options: { color: H.ultra } },
    { text: titulo, options: { color: H.tinta } },
  ], { x, y: y + 0.12, w, h: hTitulo, fontFace: FONTE_TITULO, fontSize: tamTitulo });
  texto(s, `${nome}-corpo`, corpo, { x, y: y + 0.14 + hTitulo, w, h: hCorpo, fontSize: tamCorpo, color: H.tinta2 });
}

// Linhas de código com comentários em petróleo claro (painel de tinta)
function p2Codigo(linhas) {
  return linhas.map((l, i) => ({
    text: l === "" ? " " : l,
    options: { color: /^\s*(#|--)/.test(l) ? H.ultraClaro : H.papel, breakLine: i < linhas.length - 1 },
  }));
}

// Duas capturas do console lado a lado, em molduras de mesma altura, + quatro numerais de resultado
function p2SlideEvidencias({ titulo, imagens, stats, notas }) {
  const s = slideConteudo("Execução na AWS", titulo, FONTE_AWS);
  const w = gw(6), pad = 0.06, wi = w - 2 * pad;
  const hMoldura = Math.max(...imagens.map(([, prop]) => wi / prop)) + 2 * pad;
  imagens.forEach(([arquivo, proporcao, legenda, alt], i) => {
    const x = gx(i * 6), h = wi / proporcao, id = `evidencia-${i + 1}`;
    texto(s, `${id}-rotulo`, legenda, { x, y: 2.0, w, h: 0.28, fontFace: FONTE_MEDIA, fontSize: 11, color: H.tinta, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.36, w, h: hMoldura, fill: { type: "none" }, line: { color: H.filete, width: 0.75 }, objectName: `${id}-moldura` });
    s.addImage({ path: path.join(EVIDENCIAS, arquivo), x: x + pad, y: 2.36 + (hMoldura - h) / 2, w: wi, h, altText: alt, objectName: id });
  });
  stats.forEach(([valor, legenda], i) => {
    const x = gx(i * 3), id = `resultado-${i + 1}`;
    filete(s, `${id}-filete`, x, 5.55, gw(3), H.tinta, 1);
    numero(s, id, x, 5.62, gw(3), valor, legenda, { tam: 28, hValor: 0.52, hLegenda: 0.62, tamLegenda: 10, cor: i === 0 ? H.ultra : H.tinta });
  });
  s.addNotes(notas);
}

BLOCOS.push(function slidesEngenharia() {
  // --- Silver: oito regras de qualidade -----------------------------------------------------
  {
    const s = slideConteudo("Tratamento de dados", "Camada Silver: oito regras de qualidade transformam\ntrês questionários diferentes em um esquema único", "Código: notebooks/02_silver_tratamento.py · tabelas sod_silver.respondentes e sod_silver.respondente_itens");
    const regras = [
      ["Cabeçalhos heterogêneos", "2023 usa tuplas ('P2_h', 'Faixa salarial'); 2024/25 usam 2.h_faixa_salarial. A Bronze gera nomes técnicos e um dicionário de 1.190 colunas."],
      ["De-para entre edições", "29 campos e 6 grupos de múltipla escolha mapeados pelo código da pergunta em cada ano (ex.: modelo de trabalho é 2.r em 2023/24 e 2.q em 2025)."],
      ["Padronização de categorias", "11 rótulos de cargo viram 9 famílias e gestores viram Gestor(a); senioridade, setor e modelo de trabalho ganham rótulos únicos."],
      ["Faixa salarial em valor", "Ponto médio da faixa (salario_min, _max, _medio) via join broadcast com a tabela de faixas; faixa aberta = R$ 45 mil."],
      ["Deduplicação", "Window por (edição, token) com row_number: remove 3 respostas duplicadas e cria id_respondente único entre edições."],
      ["Tipagem e nulos", "idade em inteiro, gestor e satisfeito em booleano; vazios viram NULL e flags respondeu_* são o denominador dos percentuais."],
      ["Múltipla escolha em formato longo", "Linguagens, bancos, clouds, BI e uso de IA viram 1 linha por item marcado (explode) em respondente_itens."],
      ["Gravação otimizada", "Parquet Snappy, partição ano_pesquisa=AAAA, 1 arquivo por partição e registro no Glue Data Catalog (saveAsTable)."],
    ];
    regras.forEach(([t, d], i) => {
      p2Coluna(s, `regra-${i + 1}`, gx((i % 4) * 3), 2.0 + Math.floor(i / 4) * 2.35, gw(3), String(i + 1), t, d, { hTitulo: 0.42, tamCorpo: 11.5, hCorpo: 1.6 });
    });
    s.addNotes(
      "Este é o trabalho de engenharia de dados do projeto, o que a aula chama de camada limpa (cleansed layer): corrigir erros, remover duplicatas e aplicar regras de qualidade. " +
      "As três edições têm cabeçalhos, códigos de pergunta e rótulos diferentes; sem essa harmonização não daria para comparar os anos. " +
      "Cada regra está documentada no notebook 02, e a checagem de qualidade no fim do notebook confere volumes, faixas não mapeadas e a distribuição de cargos por edição."
    );
  }

  // --- Gold: tabela de modelos + quatro fatos ------------------------------------------------
  {
    const s = slideConteudo("Modelo de dados", "Camada Gold: dez tabelas agregadas no Glue Data Catalog,\numa por pergunta de negócio", "Código: notebooks/03_gold_agregacoes.py (Spark SQL) · consultas: sql/02_consultas_analiticas.sql");
    const semBorda = { type: "none" };
    const linhaFina = { type: "solid", pt: 0.5, color: H.filete };
    const cab = { fontFace: FONTE_TITULO, fontSize: 10.5, color: H.tinta, border: [semBorda, semBorda, { type: "solid", pt: 1, color: H.tinta }, semBorda] };
    const linhas = [
      ["Visão geral", "kpis_ano", "edição", "Q0, Q1"],
      ["1 · Estrutura do mercado", "distribuicao_perfil", "edição × dimensão × categoria", "Q1b"],
      ["2 · Perfis mais valorizados", "salario_cargo_senioridade", "edição × cargo × senioridade", "Q2, Q2b"],
      ["3 · Diversidade de gênero", "diversidade_genero", "edição × recorte × gênero", "Q3, Q3b"],
      ["4 · Adoção de tecnologias", "adocao_tecnologias", "edição × categoria × item", "Q4, Q4b"],
      ["5 · Adoção de IA e impacto", "adocao_ia · ia_impacto", "edição × indicador × resposta", "Q5, Q5b, Q5c"],
      ["6 · Região e modelo de trabalho", "regiao_modelo_trabalho · modelo_trabalho", "edição × região / modelo", "Q6, Q6b"],
      ["7 · Oportunidades e desafios", "comparativo_financas", "edição × grupo (Finanças vs. demais)", "Q7, Q7b"],
    ];
    s.addTable([
      ["Pergunta de negócio", "Tabela sod_gold", "Grão (uma linha por)", "Athena"].map((t) => ({ text: t, options: cab })),
      ...linhas.map((l) => l.map((t, j) => ({
        text: t,
        options: {
          fontSize: j === 1 ? 9.5 : 10.5, color: j === 0 ? H.tinta : H.tinta2,
          fontFace: j === 1 ? MONO : (j === 0 ? FONTE_MEDIA : FONTE_TEXTO),
          border: [semBorda, semBorda, linhaFina, semBorda],
        },
      }))),
    ], {
      x: gx(0), y: 2.0, w: gw(8), colW: [2.25, 2.85, 1.95, 0.756], rowH: 0.47, valign: "middle", margin: [0.03, 0.08, 0.03, 0],
      objectName: "tabela-gold",
    });

    const fatos = [
      ["Camada curada", "Agregações OLAP prontas para consumo, sem joins pesados na hora da consulta."],
      ["Métricas padronizadas", "n, pct e salario_medio, com o denominador explícito de cada percentual."],
      ["Base salarial única", "Quem atua em dados e informou faixa: 12.841 profissionais."],
      ["Parquet colunar", "A Q7 lê 0,84 KB em 0,4 s no Athena; a Silver segue disponível para perguntas novas (Q2b e Q7b usam JOIN)."],
    ];
    fatos.forEach(([t, d], i) => {
      bloco(s, `gold-fato-${i + 1}`, gx(9), 2.0 + i * 1.18, gw(3), t, d, { h: 1.1, tamTitulo: 12.5, tamCorpo: 10.5 });
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
      ["Data lake em camadas no S3", "Raw → Bronze → Silver → Gold (camadas bruta, limpa e curada). Bucket + prefixos por camada; o catálogo evita o data swamp."],
      ["Parquet colunar com Snappy", "Formato colunar lê só as colunas pedidas e comprime por tipo: menos I/O e menor custo no Athena, que cobra por dado lido."],
      ["Particionamento Hive-style", "Silver particionada em ano_pesquisa=AAAA: filtros por edição leem só a partição necessária (partition pruning)."],
      ["Spark distribuído no Glue", "Glue Jobs PySpark (Spark 3.5): processamento em memória, driver + executors em 2 workers G.1X, escala horizontal sem servidor."],
      ["Serverless e pagamento por uso", "Sem cluster para manter: Glue cobra por DPU-hora (0,29 no pipeline todo) e o Athena por dado lido. Alta disponibilidade nativa."],
      ["Catálogo, ETL e segurança", "Glue Data Catalog como metastore (ETL: transforma no job e carrega na Gold); IAM LabRole, CloudWatch Logs e criptografia padrão do S3."],
    ];
    decisoes.forEach(([t, d], i) => {
      p2Coluna(s, `decisao-${i + 1}`, gx((i % 3) * 4), 2.0 + Math.floor(i / 3) * 1.95, gw(4), String(i + 1), t, d,
        { hTitulo: 0.32, tamTitulo: 13, tamCorpo: 11.5, hCorpo: 1.25 });
    });
    filete(s, "evolucao-filete", gx(0), 5.95, G.w, H.ultra, 1);
    texto(s, "evolucao-texto", [
      { text: "Evolução natural: ", options: { fontFace: FONTE_TITULO, color: H.ultra } },
      { text: "formato de tabela aberto (Apache Iceberg) para transações ACID e versionamento (lakehouse), Glue Workflows/Triggers para orquestração e QuickSight sobre o Athena para dashboards." },
    ], { x: gx(0), y: 6.07, w: G.w, h: 0.55, fontSize: 11.5, color: H.tinta2 });
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
    const s = slideConteudo("Código", "O mesmo PySpark roda no Glue e localmente;\no Athena responde em SQL sobre o catálogo", "Código completo: notebooks/*.py (fontes) e notebooks/ipynb/*.ipynb · sql/02_consultas_analiticas.sql");
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
    [["PySpark no AWS Glue (notebook 02)", pyspark, "codigo-pyspark"], ["SQL no Amazon Athena (Q7b)", sql, "codigo-sql"]].forEach(([t, cod, nome], i) => {
      const x = gx(i * 6), w = gw(6);
      s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w, h: 3.75, fill: { color: H.codigo }, line: { type: "none" }, objectName: `${nome}-fundo` });
      texto(s, `${nome}-rotulo`, t, { x: x + 0.25, y: 2.16, w: w - 0.5, h: 0.28, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.papel, valign: "middle" });
      texto(s, nome, p2Codigo(cod), { x: x + 0.25, y: 2.58, w: w - 0.5, h: 3.05, fontFace: MONO, fontSize: 9.5, lineSpacingMultiple: 1.0 });
    });
    [["select · filter · groupBy · agg · join", "Operações de DataFrame do curso, usadas nos 4 notebooks"],
     ["Window · explode · broadcast", "Funções Spark para deduplicação, formato longo e join pequeno"],
     ["JOIN · GROUP BY · HAVING · CASE", "Repertório SQL das 16 consultas do Athena (Q0 a Q7b)"]]
      .forEach(([v, l], i) => {
        const x = gx(i * 4), w = gw(4), id = `codigo-destaque-${i + 1}`;
        filete(s, `${id}-filete`, x, 5.98, w, H.tinta, 1);
        texto(s, `${id}-valor`, v, { x, y: 6.08, w, h: 0.28, fontFace: MONO, fontSize: 10.5, color: H.tinta, valign: "middle" });
        texto(s, `${id}-legenda`, l, { x, y: 6.4, w, h: 0.3, fontSize: 10.5, color: H.tinta2 });
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
    titulo: "Pipeline executado no AWS Academy: dados no S3\ne 4 Glue Jobs concluídos sem falhas",
    imagens: [
      ["01_s3_bucket_zonas.png", 1326 / 636, "S3 · zonas do data lake", "Console do S3 com o bucket tc-fase3-state-of-data-rm375453 e as pastas raw, bronze, silver, gold, output, scripts e athena-results"],
      ["02_glue_jobs_succeeded.png", 1328 / 486, "Glue · 4 jobs com status Succeeded", "Monitoramento do AWS Glue com os jobs sod-01 a sod-04 concluídos com status Succeeded, cerca de 2 minutos cada"],
    ],
    stats: [
      ["4 de 4", "Glue Jobs com status Succeeded"],
      ["~2 min", "por job, Glue 5.0 com 2 workers G.1X"],
      ["0,29", "DPU-hora no total dos 4 jobs (soma da coluna DPU hours; o resumo do console arredonda)"],
      ["15", "gráficos gravados em output/charts/"],
    ],
    notas:
      "Evidência de execução. Os CSVs das três edições foram enviados à zona raw do bucket e os quatro jobs do Glue rodaram em sequência: " +
      "Bronze, Silver, Gold e o job de análises, que grava os 15 gráficos no S3. Cada job levou cerca de dois minutos e o pipeline inteiro consumiu 0,29 DPU-hora, " +
      "um custo irrisório que mostra que a arquitetura serverless é adequada ao volume da pesquisa.",
  });

  p2SlideEvidencias({
    titulo: "Gold catalogada e consultada no Athena: 16 consultas sem falha,\ncom os mesmos números do deck",
    imagens: [
      ["03_glue_catalog_sod_gold.png", 1328 / 611, "Glue Data Catalog · database sod_gold", "Glue Data Catalog com as tabelas do database sod_gold"],
      ["04_athena_q7_financas.png", 1248 / 611, "Athena · Q7, Finanças vs. demais setores", "Editor do Athena com a consulta Q7 sobre a tabela comparativo_financas e o resultado por ano e setor"],
    ],
    stats: [
      ["10", "tabelas Gold registradas no Glue Data Catalog"],
      ["16 de 16", "consultas do Athena (Q0 a Q7b) com sucesso"],
      ["0,4 s", "e 0,84 KB lidos na Q7, graças ao Parquet"],
      [rs("14,6 mil"), "salário médio em Finanças 2025 na Q7, igual ao deck"],
    ],
    notas:
      "Os próprios jobs registram as tabelas no Glue Data Catalog, então o Athena enxerga sod_bronze, sod_silver e sod_gold sem crawler. " +
      "Rodamos as 16 consultas de sql/02_consultas_analiticas.sql: todas concluíram com sucesso. A Q7, que compara Finanças com os demais setores, " +
      "devolve em 2025 598 profissionais de Finanças com salário médio de R$ 14,6 mil contra R$ 12,9 mil nos demais, os mesmos valores citados no deck.",
  });
});
// =============================================================================================
// Parte 2 · O que os dados mostram: perguntas 1 a 4 (mercado, salários, gênero, tecnologias)
// =============================================================================================

// Ponta de uma barra horizontal de barrasH (catAxisOrientation maxMin), para ancorar a chamada.
// rotuloW: largura que o PowerPoint reserva aos rótulos de categoria à esquerda do gráfico.
function p3PontaBarraH(x, y, w, h, n, i, valor, max, rotuloW) {
  const x0 = x + rotuloW, escala = (w - rotuloW - 0.41) / max;
  const primeiro = y + 0.35, passo = (h - 0.7) / (n - 1);
  return [x0 + valor * escala, primeiro + i * passo];
}

// Texto de anotação em petróleo, ao lado da chamada
function p3Anotacao(s, nome, txt, x, y, w, h = 0.5) {
  texto(s, nome, txt, { x, y, w, h, fontSize: 10.5, color: H.ultra, fontFace: FONTE_MEDIA });
}

// Coluna direita padrão (4 colunas): número, evidências e "Para o banco"
function p3Coluna(s, c0, { valor, legenda, cor = H.ultra, tam = 54, dados, banco, yDados = 3.85 }) {
  const x = gx(c0), w = gw(4);
  numero(s, "destaque", x, 2.0, w, valor, legenda, { cor, tam });
  texto(s, "dados", marcadores(dados), { x, y: yDados, w, h: 5.2 - yDados });
  paraBanco(s, x, 5.35, w, banco);
}

// "R$ 14,5 mil" sem quebra de linha
const p3rs = (v) => rs(v).replace(" mil", " mil");

BLOCOS.push(function slidesMercado() {
  const SEN = D.senioridade_ano.categorias.map(curto);
  const br = (v) => v.toFixed(1).replace(".", ",");

  secao("1 · Estrutura do mercado");
  {
    const s = slideDivisor("Parte 2 de 3", "O que os dados mostram",
    "Mercado, salários, diversidade, tecnologia,\nIA, região e Finanças",
    "Segunda parte: o que os dados mostram, organizado nas sete perguntas de negócio do desafio.");
    // Número-afirmação da parte, no alto à direita
    texto(s, "divisor-numero", "7", { x: 8.6, y: 0.35, w: 3.983, h: 2.55, fontFace: FONTE_MEDIA, fontSize: 140, color: H.papel, align: "right", valign: "bottom", charSpacing: -2 });
    texto(s, "divisor-numero-legenda", "perguntas de negócio respondidas\ncom as tabelas Gold", { x: 8.6, y: 2.95, w: 3.983, h: 0.5, fontSize: 13, color: H.ultraClaro, align: "right" });
  }

  // 15 · Cargos: gráfico à esquerda, coluna à direita ------------------------------------------
  {
    const s = slideConteudo("Q1 · Estrutura do mercado", "Gestão e análise somam 41% do mercado;\nML/IA ainda é nicho, com 3%", fonteTabela("distribuicao_perfil"));
    const g = D.cargos_2025, X = gx(0), Y = 2.3, W = gw(7), Hh = 4.45, MAX = 26;
    rotuloGrafico(s, "grafico-rotulo", "% dos profissionais que atuam com dados, por cargo, 2025", X, 2.0, W);
    barrasH(s, "grafico-cargos", g.categorias, g.pct, coresPor(g.categorias, (c) => (c.includes("ML/IA") ? H.ultra : null)),
      X, Y, W, Hh, { valAxisMaxVal: MAX, altText: "Barras horizontais com a distribuição de cargos em 2025" });
    const i = g.categorias.findIndex((c) => c.includes("ML/IA"));
    const [px, py] = p3PontaBarraH(X, Y, W, Hh, g.categorias.length, i, g.pct[i], MAX, 1.7);
    chamada(s, "anotacao-ml", px + 0.5, py, px + 1.25, py - 0.5);
    p3Anotacao(s, "anotacao-ml-texto", "O perfil que a agenda de IA mais demanda é o mais raro do mercado", px + 1.32, py - 0.78, 2.6);
    p3Coluna(s, 8, {
      valor: "3,3%", legenda: "dos profissionais de dados atuam com ML/IA",
      dados: [
        "Gestores (23%) e Analistas de Dados (19%) lideram em 2025",
        "Engenharia e Ciência de Dados empatam, com 13% cada",
      ],
      banco: "Talento de ML/IA é escasso: formar internamente pesa tanto quanto contratar.",
    });
    s.addNotes(
      "Em 2025, quase um em cada quatro respondentes é gestor, e analistas de dados são o segundo grupo. " +
      "Engenharia e Ciência de Dados têm o mesmo peso. O dado que importa para o banco é o de ML/IA: apenas 3,3% do mercado, " +
      "exatamente o perfil que a agenda de IA mais demanda. Isso aponta para disputa acirrada e para a necessidade de formar talento dentro de casa."
    );
  }

  // 16 · Senioridade: gráfico de largura total, linha de números embaixo -----------------------
  {
    const s = slideConteudo("Q1 · Estrutura do mercado", "O mercado amadureceu: a fatia de júniores caiu\nde 22% para 16% em três anos", fonteTabela("distribuicao_perfil"));
    const g = D.senioridade_ano;
    rotuloGrafico(s, "grafico-rotulo", "% dos profissionais por senioridade, 2023 a 2025", gx(0), 2.0, gw(8));
    s.addChart(pres.charts.BAR, ["2023", "2024", "2025"].map((a) => ({ name: a, labels: SEN, values: g.series[a] })), grafico({
      x: gx(0), y: 2.3, w: gw(12), h: 2.65, barDir: "col", chartColors: [H.apagado, H.medio, H.ultra],
      dataLabelFormatCode: PCT0_SEM_ZERO, valAxisMaxVal: 38, barGapWidthPct: 80,
      showLegend: true, legendPos: "t", objectName: "grafico-senioridade",
      altText: "Barras agrupadas da distribuição de senioridade por ano, 2023 a 2025",
    }));
    chamada(s, "anotacao-especialista", 9.45, 4.08, 9.12, 3.45);
    p3Anotacao(s, "anotacao-especialista-texto", "Especialista (11%) só passou a ser medido em 2025", 7.85, 2.95, 1.65);
    const y = 5.2, w = gw(3);
    numero(s, "junior", gx(0), y, w, "22% → 16%", "de júniores entre 2023 e 2025 (18% em 2024)", { cor: H.ultra, tam: 30, hValor: 0.55, hLegenda: 0.75, tamLegenda: 11 });
    numero(s, "gestor", gx(3), y, w, "19% → 23%", "de gestores no mesmo período", { tam: 30, hValor: 0.55, hLegenda: 0.75, tamLegenda: 11 });
    numero(s, "senior", gx(6), y, w, "27%", "são Sênior, o maior grupo em 2025", { tam: 30, hValor: 0.55, hLegenda: 0.75, tamLegenda: 11 });
    paraBanco(s, gx(9), y, gw(3), "Com a porta de entrada mais estreita, programas de trainee em dados viram diferencial de atração.", { h: 1.5, tam: 12 });
    s.addNotes(
      "A pirâmide do mercado está mudando de forma: menos júniores e mais gestores a cada edição. " +
      "Isso indica um mercado mais maduro, mas também uma porta de entrada estreita. " +
      "Atenção: a categoria Especialista só existe em 2025, por isso parte do movimento entre Sênior e Especialista é efeito do questionário."
    );
  }

  // 17 · Setores: coluna à esquerda, gráfico à direita ----------------------------------------
  {
    const s = slideConteudo("Q1 · Estrutura do mercado", "Finanças é o setor com mais profissionais de dados nas três edições", fonteTabela("distribuicao_perfil"));
    const g = D.setores_2025, X = gx(5), Y = 2.3, W = gw(7), Hh = 4.45, MAX = 34;
    const x = gx(0), w = gw(4);
    numero(s, "destaque", x, 2.0, w, "18,5%", "dos profissionais de dados estão em Finanças ou Bancos, o maior setor em 2025", { cor: H.ultra });
    texto(s, "dados", marcadores([
      "Finanças reúne 19% dos respondentes em 2025, à frente de Tecnologia (17%)",
      "Consultoria aparece em terceiro, com 8,8%",
    ]), { x, y: 3.85, w, h: 1.35 });
    paraBanco(s, x, 5.35, w, "O banco disputa talento com outros bancos e com empresas de tecnologia ao mesmo tempo.");
    rotuloGrafico(s, "grafico-rotulo", "% dos profissionais por setor, 10 maiores, 2025", X, 2.0, W);
    barrasH(s, "grafico-setores", g.categorias, g.pct,
      coresPor(g.categorias, (c) => (c === "Finanças ou Bancos" ? H.ultra : c.startsWith("Tecnologia") ? H.medio : null)),
      X, Y, W, Hh, { valAxisMaxVal: MAX, altText: "Barras horizontais com a distribuição por setor em 2025" });
    const [px, py] = p3PontaBarraH(X, Y, W, Hh, g.categorias.length, 0, g.pct[0], MAX, 1.75);
    chamada(s, "anotacao-financas", px + 0.78, py, px + 0.98, py);
    p3Anotacao(s, "anotacao-financas-texto", "Liderança nas três edições: 19,5% → 21,3% → 18,5%", px + 1.05, py - 0.12, G.x0 + G.w - (px + 1.05), 0.75);
    s.addNotes(
      "Finanças é o setor que mais emprega profissionais de dados na pesquisa, em todas as edições. " +
      "Isso confirma que o setor é referência em dados, e também que a concorrência por talento é direta: " +
      "o profissional que o banco quer contratar está, muitas vezes, em outro banco ou em uma empresa de tecnologia."
    );
  }

  // 18 · Salário por cargo ------------------------------------------------------------------
  secao("2 · Perfis valorizados");
  {
    const s = slideConteudo("Q2 · Perfis mais valorizados", "Gestão e ML/IA pagam mais que o dobro de BI e Análise de Dados", fonteTabela("salario_cargo_senioridade"));
    const g = D.salario_cargo_2025, X = gx(0), Y = 2.3, W = gw(7), Hh = 4.45, MAX = 25;
    rotuloGrafico(s, "grafico-rotulo", "Salário médio mensal por cargo, 2025 (cargos com 30 ou mais respostas)", X, 2.0, W);
    barrasH(s, "grafico-salario-cargo", g.categorias, g.mil,
      coresPor(g.categorias, (c) => (c === "Gestor(a)" || c.includes("ML/IA") ? H.ultra : null)),
      X, Y, W, Hh, { dataLabelFormatCode: MIL, valAxisMaxVal: MAX, altText: "Barras horizontais com o salário médio por cargo em 2025" });
    const [px, py] = p3PontaBarraH(X, Y, W, Hh, g.categorias.length, 1, g.mil[1], MAX, 1.7);
    // Nota na própria linha, logo após o rótulo do valor: sem ponto solto
    p3Anotacao(s, "anotacao-ml-texto", `a ${p3rs("1,1 mil")} do Gestor`, px + 1.05, py - 0.15, gx(8) - 0.1 - (px + 1.05), 0.3);
    p3Coluna(s, 8, {
      valor: p3rs("28,8 mil"), tam: 44, legenda: "é o topo: Especialista em ML/IA, a maior média entre cargo e senioridade",
      dados: [
        `Engenharia de Dados (${p3rs("14,5 mil")}) paga acima de Ciência (${p3rs("12,9 mil")})`,
        `BI (${p3rs("7,6 mil")}) está na base do ranking`,
      ],
      banco: "Engenharia de dados e ML/IA são os perfis críticos a reter: caros, escassos e a base da IA.",
    });
    s.addNotes(
      "O ranking salarial mostra o que o mercado valoriza. Gestão e ML/IA estão no topo; Engenharia de Dados já paga mais que Ciência de Dados, " +
      "refletindo a demanda por quem constrói a plataforma. O maior salário médio entre combinações de cargo e senioridade é o de Especialista em ML/IA, R$ 28,8 mil. " +
      "Salários são pontos médios das faixas declaradas, então leia como ordem de grandeza."
    );
  }

  // 19 · Salário por senioridade: coluna à esquerda, colunas à direita -------------------------
  {
    const s = slideConteudo("Q2 · Perfis mais valorizados", "Senioridade multiplica o salário: um sênior ganha 3,5 vezes o júnior", fonteTabela("salario_cargo_senioridade"));
    const x = gx(0), w = gw(4);
    numero(s, "destaque", x, 2.0, w, "3,5x", `é quanto um sênior ganha frente a um júnior: ${p3rs("14,5 mil")} contra ${p3rs("4,2 mil")}`, { cor: H.ultra });
    texto(s, "dados", marcadores([
      `Pleno (${p3rs("8,3 mil")}) ganha o dobro do júnior`,
      `Média geral subiu 26% em dois anos: ${p3rs("10,5 mil")} → ${p3rs("13,2 mil")}`,
    ]), { x, y: 3.85, w, h: 1.35 });
    paraBanco(s, x, 5.35, w, "Carreira em Y: uma trilha de especialista retém bons técnicos sem forçá-los à gestão.");
    rotuloGrafico(s, "grafico-rotulo", "Salário médio mensal por senioridade, 2025", gx(5), 2.0, gw(7));
    s.addChart(pres.charts.BAR, [{ name: "2025", labels: SEN, values: D.salario_senioridade_ano.series["2025"] }], grafico({
      x: gx(5), y: 2.3, w: gw(7), h: 4.4, barDir: "col",
      chartColors: SEN.map((c) => (c === "Júnior" || c === "Sênior" ? H.ultra : H.apagado)),
      dataLabelFormatCode: MIL, dataLabelFontSize: 11, catAxisLabelFontSize: 11, valAxisMaxVal: 25, barGapWidthPct: 55,
      objectName: "grafico-salario-senioridade", altText: "Colunas com o salário médio por senioridade em 2025",
    }));
    chamada(s, "anotacao-especialista", 10.62, 2.95, 10.2, 2.45);
    p3Anotacao(s, "anotacao-especialista-texto", `Especialista (${p3rs("20,0 mil")}) já se iguala a Gestor (${p3rs("20,2 mil")})`, 7.4, 2.3, 2.75);
    s.addNotes(
      "Cada degrau de senioridade praticamente dobra o salário até o sênior. O dado novo de 2025 é o Especialista: " +
      "ele ganha o mesmo que um gestor, o que mostra que o mercado já remunera a carreira técnica no topo. " +
      "Para o banco, isso reforça uma carreira em Y. A média geral subiu 26% em dois anos, bem acima da inflação do período."
    );
  }

  // 20 · Gênero: números à esquerda, dois gráficos, linha de evidência embaixo -----------------
  secao("3 · Diversidade de gênero");
  {
    const s = slideConteudo("Q3 · Diversidade de gênero", "Mulheres são 22% e ganham 19% menos;\na presença cai a cada degrau da carreira", fonteTabela("diversidade_genero"));
    const g = D.genero, t = g.total, cats = ["Júnior", "Pleno", "Sênior", "Espec.", "Gestor"];
    const WG = (gw(9) - 0.3) / 2, XG1 = gx(3), XG2 = gx(3) + WG + 0.3;
    numero(s, "mulheres", gx(0), 2.0, gw(3), `${br(t["2025"].pct_mulheres)}%`,
      `são mulheres em 2025 (eram ${br(t["2023"].pct_mulheres)}% em 2023)`, { tam: 40, hValor: 0.65, hLegenda: 0.55, tamLegenda: 11 });
    numero(s, "gap", gx(0), 3.45, gw(3), `${br(t["2025"].gap)}%`,
      `é o gap salarial geral (${br(t["2023"].gap)}% em 2023)`, { cor: H.ultra, tam: 40, hValor: 0.65, hLegenda: 0.55, tamLegenda: 11 });
    rotuloGrafico(s, "grafico-mulheres-rotulo", "% de mulheres por senioridade, 2025", XG1, 2.0, WG);
    s.addChart(pres.charts.BAR, [{ name: "Mulheres", labels: cats, values: g.pct_mulheres }], grafico({
      x: XG1, y: 2.3, w: WG, h: 2.55, barDir: "col", chartColors: coresPor(g.categorias, (c) => (c === "Júnior" || c === "Gestor(a)" ? H.ultra : null)), dataLabelFormatCode: PCT1,
      catAxisLabelFontSize: 9.5, dataLabelFontSize: 9.5, valAxisMaxVal: 34, barGapWidthPct: 50,
      objectName: "grafico-mulheres", altText: "Participação de mulheres por senioridade em 2025",
    }));
    rotuloGrafico(s, "grafico-gap-rotulo", "Quanto as mulheres ganham a menos, 2025", XG2, 2.0, WG);
    s.addChart(pres.charts.BAR, [{ name: "Gap salarial", labels: cats, values: g.gap }], grafico({
      x: XG2, y: 2.3, w: WG, h: 2.55, barDir: "col",
      chartColors: coresPor(g.categorias, (c) => (c === "Sênior" ? H.ultra : null)),
      dataLabelFormatCode: '0.0"%";-0.0"%";"paridade"', catAxisLabelFontSize: 9.5, dataLabelFontSize: 9.5, valAxisMaxVal: 23, barGapWidthPct: 50,
      objectName: "grafico-gap", altText: "Diferença salarial entre homens e mulheres por senioridade em 2025",
    }));
    chamada(s, "anotacao-funil", 7.25, 3.9, 7.0, 2.87);
    p3Anotacao(s, "anotacao-funil-texto", "Queda de 9,8 p.p. do júnior ao gestor", 5.75, 2.35, 1.6, 0.5);
    chamada(s, "anotacao-senior", 10.2, 2.85, 9.35, 2.72);
    p3Anotacao(s, "anotacao-senior-texto", "No pleno há paridade; no sênior o gap chega a 19%", 7.85, 2.45, 1.45, 0.6);
    paraBanco(s, gx(0), 5.35, gw(12), "Metas de promoção e revisão salarial por gênero na passagem de pleno para sênior.", { h: 1.1 });
    s.addNotes(
      "Diversidade não avançou: a participação feminina caiu e o gap salarial cresceu levemente nas três edições. " +
      "O ponto crítico é a transição de pleno para sênior: no pleno os salários são equivalentes, no sênior a diferença chega a 19%. " +
      "Lembrando que o gap aqui compara médias por grupo e não controla todos os fatores, como cargo e setor."
    );
  }

  // 21 · Tecnologias: quatro pequenos múltiplos ----------------------------------------------
  secao("4 · Tecnologias");
  {
    const s = slideConteudo("Q4 · Adoção de tecnologias", "Python e SQL são universais; Power BI domina a visualização", fonteTabela("adocao_tecnologias"));
    rotuloGrafico(s, "grafico-rotulo", "% dos profissionais que usam cada tecnologia, 6 mais citadas por categoria, 2025", gx(0), 2.0, gw(12));
    Object.entries(D.tecnologias_2025).forEach(([cat, g], i) => {
      const x = gx(i * 3), w = gw(3), id = `tec-${i + 1}`;
      filete(s, `${id}-filete`, x, 2.38, w, H.tinta, 1);
      texto(s, `${id}-titulo`, cat, { x, y: 2.46, w, h: 0.28, fontFace: FONTE_TITULO, fontSize: 12, color: H.tinta });
      barrasH(s, `grafico-${id}`, g.categorias, g.pct, g.pct.map((_, j) => (j === 0 ? H.ultra : H.apagado)),
        x, 2.78, w, 2.15, {
          dataLabelFormatCode: PCT0, catAxisLabelFontSize: 9.5, dataLabelFontSize: 9.5, barGapWidthPct: 40,
          valAxisMaxVal: Math.max(...g.pct) * 1.35, altText: `Tecnologias mais usadas em 2025: ${cat}`,
        });
    });
    numero(s, "python", gx(0), 5.2, gw(3), "92%", "usam Python; SQL vem logo atrás, com 84%", { cor: H.ultra, tam: 40, hValor: 0.65, hLegenda: 0.6, tamLegenda: 11 });
    texto(s, "dados", marcadores([
      "Fora de Python e SQL, nenhuma linguagem passa de 16% (o R vem em 3º)",
      "Databricks (33%) já está a menos de 1 ponto do SQL Server (34%)",
      "Power BI (59%) tem mais que o dobro do Looker (23%)",
    ]), { x: gx(3), y: 5.25, w: gw(5), h: 1.62 });
    paraBanco(s, gx(8), 5.2, gw(4), "Padronizar a stack em Python, SQL e Power BI encurta a curva de aprendizado de quem chega.", { h: 1.5 });
    s.addNotes(
      "Python e SQL deixaram de ser diferencial: são pré-requisito. Em bancos de dados, PostgreSQL e SQL Server dividem espaço com o Databricks, " +
      "que já chega a um terço dos profissionais. Em visualização, o Power BI é dominante. " +
      "Para o banco, escolher tecnologias que o mercado já domina reduz custo de contratação e treinamento."
    );
  }

  // 22 · Cloud: colunas por ano à esquerda, recorte de Finanças à direita ----------------------
  {
    const s = slideConteudo("Q4 · Adoção de tecnologias", "A AWS virou a nuvem nº 1 do mercado, e em Finanças chega a 68%",
      `${fonteTabela("adocao_tecnologias")} · Finanças: consulta Q7b (sod_silver)`);
    const g = D.cloud_evolucao;
    rotuloGrafico(s, "grafico-rotulo", "% dos profissionais que usam cada nuvem, 2023 a 2025", gx(0), 2.0, gw(5));
    s.addChart(pres.charts.BAR, ["AWS", "Azure", "GCP"].map((n) => ({ name: n, labels: g.anos, values: g.series[n] })), grafico({
      x: gx(0), y: 2.3, w: gw(7), h: 4.4, barDir: "col", chartColors: [H.ultra, H.medio, H.apagado],
      dataLabelFormatCode: PCT1, catAxisLabelFontSize: 11, valAxisMaxVal: 58, barGapWidthPct: 70,
      showLegend: true, legendPos: "t", objectName: "grafico-cloud", altText: "Evolução do uso de AWS, Azure e GCP de 2023 a 2025",
    }));
    chamada(s, "anotacao-aws", 1.4, 4.2, 1.4, 3.3);
    p3Anotacao(s, "anotacao-aws-texto", "Em 2023 a AWS era a 3ª; em 2025, a 1ª", 1.2, 2.95, 3.4, 0.3);
    // Recorte de Finanças vem da consulta Q7b (Silver), não de uma tabela Gold exportada para o JSON
    p3Coluna(s, 8, {
      valor: "67,7%", legenda: "dos profissionais de Finanças usam AWS em 2025, contra Azure 28,1% e GCP 16,4%",
      dados: [
        "AWS no mercado: 30,6% → 44,1% → 48,3%",
        "Azure caiu de 42,3% para 34,8%; GCP estável, perto de 31%",
      ],
      banco: "Uma plataforma de dados em AWS (S3, Glue, Athena) alinha o banco ao talento disponível.",
    });
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
const p4Soma = (a, b) => a.map((v, i) => Math.round((v + b[i]) * 10) / 10);
const p4Num = (v) => String(v).replace(".", ",");

// Coluna lateral (colunas 8 a 11): número, evidências e "Para o banco"
function p4Lateral(s, { valor, legenda, dados, banco, cor = H.ultra, tamDados = 11.5, yDados = 3.75, hDados = 1.45 }) {
  const x = gx(8), w = gw(4);
  numero(s, "destaque", x, 2.0, w, valor, legenda, { cor, tam: 54, hValor: 0.85, hLegenda: 0.75 });
  texto(s, "dados", marcadores(dados, tamDados), { x, y: yDados, w, h: hDados });
  paraBanco(s, x, 5.35, w, banco);
}

BLOCOS.push(function slidesIaRegiao() {
  secao("5 · Inteligência artificial");
  const Q5 = "Q5 · Adoção de IA e impacto";

  // ---- IA generativa: uso x empresa paga -----------------------------------------------------
  {
    const s = slideConteudo(Q5, "IA generativa virou rotina: 98% usam,\nmas só 42% têm a ferramenta paga pela empresa", fonteTabela("adocao_ia"));
    const ia = D.ia_adocao;
    rotuloGrafico(s, "grafico-ia-adocao-rotulo", "% dos profissionais de dados, 2023 a 2025", gx(0), 2.0, gw(12));
    s.addChart(pres.charts.LINE, [
      { name: "Usam IA generativa no trabalho", labels: ia.anos, values: ia.usa },
      { name: "Empresa paga a ferramenta", labels: ia.anos, values: ia.empresa_paga },
    ], grafico({
      x: gx(0), y: 2.3, w: gw(12), h: 2.65, chartColors: [H.ultra, H.teal], lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 7,
      dataLabelPosition: "t", dataLabelFormatCode: PCT0, dataLabelFontSize: 11, valAxisMaxVal: 118, catAxisLabelFontSize: 11,
      showLegend: true, legendPos: "t", objectName: "grafico-ia-adocao",
      altText: "Linhas: uso de IA generativa de 80% a 98% e IA paga pela empresa de 6% a 42%, 2023 a 2025",
    }));
    chamada(s, "anotacao-ia-paralela", 10.5, 3.52, 9.78, 3.52);
    texto(s, "anotacao-ia-paralela-texto", "IA paralela: o vão entre as curvas é uso com contas pessoais",
      { x: 7.2, y: 3.3, w: 2.5, h: 0.45, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra, align: "right", valign: "middle" });

    const y = 5.25;
    filete(s, "rodape-filete-1", gx(0), y, gw(4), H.tinta, 1);
    numero(s, "destaque", gx(0), y + 0.1, gw(4), "56 p.p.", "de distância em 2025: muito uso por conta própria",
      { cor: H.ultra, tam: 40, hValor: 0.62, hLegenda: 0.6 });
    filete(s, "rodape-filete-2", gx(4), y, gw(4), H.tinta, 1);
    numero(s, "crescimento", gx(4), y + 0.1, gw(4), "6,6×", "o salto da IA paga pela empresa de 2023 a 2025; o uso em si cresceu 1,2×",
      { cor: H.tinta, tam: 40, hValor: 0.62, hLegenda: 0.6 });
    paraBanco(s, gx(8), y, gw(4), "Licenciar IA corporativa com governança reduz o risco de dados sensíveis em ferramentas pessoais.", { h: 1.45, tam: 12.5 });
    s.addNotes(
      "O uso de IA generativa é praticamente universal. A empresa pagar a ferramenta cresceu rápido, mas ainda é menos da metade. " +
      "Essa diferença é o que chamamos de IA paralela: profissionais usando contas pessoais no trabalho. " +
      "Em um banco, com dados de clientes e sigilo bancário, esse é um risco de governança e de LGPD."
    );
  }

  // ---- Prioridade da IA nas empresas ---------------------------------------------------------
  {
    const s = slideConteudo(Q5, "IA é prioridade para 61% das empresas; em 2023 eram 36%", fonteTabela("adocao_ia"));
    const p = D.ia_prioridade, se = p.series;
    const prioridade = p4Soma(se["Principal prioridade"], se["Entre as prioridades"]);
    rotuloGrafico(s, "grafico-prioridade-rotulo", "% das empresas, na visão dos gestores", gx(0), 2.0, gw(7));
    s.addChart(pres.charts.BAR, [
      { name: "Principal ou entre as prioridades", labels: p.anos, values: prioridade },
      { name: "Não é prioridade", labels: p.anos, values: se["Não é prioridade"] },
    ], grafico({
      x: gx(0), y: 2.3, w: gw(7), h: 3.95, barDir: "col", chartColors: [H.ultra, H.apagado], dataLabelFormatCode: PCT1,
      catAxisLabelFontSize: 11, dataLabelFontSize: 10.5, valAxisMaxVal: 72, barGapWidthPct: 80, showLegend: true, legendPos: "t",
      objectName: "grafico-prioridade",
      altText: "Colunas: IA como principal ou entre as prioridades sobe de 36,2% para 60,6%; não é prioridade cai de 28,8% para 11,3%",
    }));
    chamada(s, "anotacao-nao-prioridade", 7.0, 5.65, 7.2, 4.88);
    texto(s, "anotacao-nao-prioridade-texto", "“Não é prioridade” caiu de 29% para 11%",
      { x: 7.1, y: 4.35, w: 1.6, h: 0.5, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra });
    const ult = p.anos.length - 1;
    texto(s, "prioridade-nota",
      `Demais respostas em ${p.anos[ult]}: iniciativas isoladas ${p4Num(se["Iniciativas isoladas"][ult])}% e não sei opinar ${p4Num(se["Não sei opinar"][ult])}%.`,
      { x: gx(0), y: 6.38, w: gw(7), h: 0.3, fontSize: 10, color: H.meta, valign: "middle" });
    p4Lateral(s, {
      valor: "61%", legenda: "das empresas têm a IA como principal prioridade ou entre as prioridades (36% em 2023)",
      dados: [
        "IA como principal prioridade: 12% → 22% → 24%",
        "Principal ou entre as prioridades: 36% → 54% → 61%",
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
    const s = slideConteudo(Q5, "Mas só uma em cada quatro empresas tem IA em produção;\na maioria está em piloto", fonteTabela("adocao_ia"));
    const x0 = gx(0), w0 = gw(4);
    // Painel petróleo sangrando à esquerda, da área útil até o rodapé de conteúdo
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.0, w: gx(4) + 0.25, h: 4.7, fill: { color: H.ultra }, line: { type: "none" }, objectName: "painel-destaque" });
    texto(s, "destaque-valor", "1 em 4", { x: x0, y: 2.2, w: w0 + 0.4, h: 1.55, fontFace: FONTE_MEDIA, fontSize: 104, color: H.papel, valign: "bottom", charSpacing: -2 });
    // Quatro colunas: uma em produção (cheia), três ainda não (só contorno)
    const bw = 0.62, bg = (w0 - 4 * bw) / 3;
    [0, 1, 2, 3].forEach((i) =>
      s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * (bw + bg), y: 4.3, w: bw, h: 1.0,
        fill: i === 0 ? { color: H.papel } : { type: "none" }, line: i === 0 ? { type: "none" } : { color: H.ultraClaro, width: 1 }, objectName: `empresa-${i + 1}` }));
    texto(s, "destaque-legenda", "empresas têm IA em produção, gerando resultado (26,5% em 2025)", { x: x0, y: 5.5, w: w0, h: 0.65, fontSize: 13, color: H.ultraClaro });

    const r = D.ia_resultados_2025;
    const xg = gx(5), wg = gw(7);
    rotuloGrafico(s, "grafico-resultados-rotulo", "Estágio da IA nas empresas, 2025 (% das respostas de gestores)", xg, 2.0, wg);
    barrasH(s, "grafico-resultados", r.categorias, r.pct,
      coresPor(r.categorias, (c) => c.startsWith("Em produção") ? H.ultra : c.startsWith("Pilotos") ? H.medio : null),
      xg, 2.3, wg, 2.95, { catAxisLabelFontSize: 11, dataLabelFontSize: 10.5, valAxisMaxVal: 48,
        altText: "Barras: em produção 26,5%, pilotos 38,4%, investigação 15%, não começou 13,5%, não sei 6,7%" });
    chamada(s, "anotacao-pilotos", 11.15, 3.33, 11.35, 3.62);
    texto(s, "anotacao-pilotos-texto", "Quase 40% estão presos em pilotos", { x: 11.05, y: 3.66, w: 1.53, h: 0.45, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra });
    paraBanco(s, xg, 5.35, wg, "O diferencial está em sair do piloto para a produção: MLOps, governança e dados confiáveis.");
    s.addNotes(
      "Aqui está a tensão central do deck: a IA é prioridade, mas poucos chegaram à produção. " +
      "Quase 40% das empresas estão presas em pilotos. O gargalo costuma ser dado de qualidade, plataforma e governança, " +
      "e não o modelo em si. Quem resolver isso primeiro captura o valor."
    );
  }

  // ---- Impacto de receber IA da empresa ------------------------------------------------------
  {
    const s = slideConteudo(Q5, "Quem recebe IA da empresa ganha 33% mais\ne busca menos outro emprego", fonteTabela("ia_impacto"));
    const imp = D.ia_impacto_2025;
    const ie = imp.perfis.indexOf("Empresa fornece IA"), ip = imp.perfis.indexOf("Usa IA por conta própria");
    const metricas = [["Sênior, especialista ou gestor", "pct_senior_ou_gestor"], ["Satisfeitos", "pct_satisfeitos"], ["Buscando outro emprego", "pct_buscando_emprego"]];
    rotuloGrafico(s, "grafico-impacto-rotulo", "% dos profissionais em cada grupo, 2025", gx(0), 2.0, gw(7));
    s.addChart(pres.charts.BAR, [
      { name: `Empresa fornece IA (${imp.n[ie]})`, labels: metricas.map((m) => m[0]), values: metricas.map((m) => imp[m[1]][ie]) },
      { name: `Usa por conta própria (${imp.n[ip].toLocaleString("pt-BR")})`, labels: metricas.map((m) => m[0]), values: metricas.map((m) => imp[m[1]][ip]) },
    ], grafico({
      x: gx(0), y: 2.3, w: gw(7), h: 3.95, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.ultra, H.apagado],
      dataLabelFormatCode: PCT1, valAxisMaxVal: 100, barGapWidthPct: 55, showLegend: true, legendPos: "t", catAxisLabelFontSize: 11,
      objectName: "grafico-impacto",
      altText: "Barras agrupadas: quem tem IA da empresa é mais sênior (56% contra 45%), mais satisfeito (74% contra 67%) e busca menos emprego (29% contra 41%)",
    }));
    chamada(s, "anotacao-senior", 6.22, 3.12, 6.55, 3.12);
    texto(s, "anotacao-senior-texto", "Correlação, não causa: o grupo também é mais sênior (56% contra 45%)",
      { x: 6.62, y: 2.82, w: 1.95, h: 0.75, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra });
    texto(s, "impacto-nota", "Só 44 respondentes não usam IA: grupo pequeno demais para comparação.",
      { x: gx(0), y: 6.38, w: gw(7), h: 0.3, fontSize: 10, color: H.meta, valign: "middle" });

    const x = gx(8), w = gw(4);
    numero(s, "impacto-salario", x, 2.0, w, "+33%", `salário médio: ${rs("13,4 mil")} (IA da empresa) contra ${rs("10,1 mil")} (por conta própria)`,
      { cor: H.ultra, tam: 40, hValor: 0.62, hLegenda: 0.62, tamLegenda: 11.5 });
    numero(s, "impacto-saida", x, 3.4, gw(2), "−12 p.p.", "na intenção de trocar de emprego (29% contra 41%)",
      { tam: 26, hValor: 0.45, hLegenda: 0.85, tamLegenda: 11 });
    numero(s, "impacto-satisfeitos", gx(10), 3.4, gw(2), "+7 p.p.", "de profissionais satisfeitos (74% contra 67%)",
      { tam: 26, hValor: 0.45, hLegenda: 0.85, tamLegenda: 11 });
    paraBanco(s, x, 5.35, w, "Fornecer IA também é ferramenta de retenção: 12 pontos a menos de intenção de saída.");
    s.addNotes(
      "Comparamos 891 profissionais com IA fornecida pela empresa e 1.170 que usam por conta própria. " +
      "Os primeiros ganham mais, estão mais satisfeitos e buscam menos outro emprego. " +
      "Não dá para afirmar causa, porque o grupo também é mais sênior, mas a associação com retenção é forte e consistente. " +
      "Só 44 respondentes não usam IA, um grupo pequeno demais para comparação."
    );
  }

  secao("6 · Região e modelo de trabalho");
  const Q6 = "Q6 · Região, senioridade e modelo de trabalho";

  // ---- Região --------------------------------------------------------------------------------
  {
    const s = slideConteudo(Q6, "O Sudeste paga mais; o Nordeste ganha 24% menos na média,\nmas trabalha mais remoto", fonteTabela("regiao_modelo_trabalho"));
    const r = D.regiao_2025;
    const cores = coresPor(r.categorias, (c) => c === "Nordeste" ? H.ultra : c === "Sudeste" ? H.medio : null);
    [["salario", "Salário médio mensal, 2025 (R$ mil)", r.salario_mil, MIL, 16.5, "Colunas: salário médio por região, Sudeste R$ 13,5 mil e Nordeste R$ 10,3 mil"],
     ["remoto", "% em trabalho 100% remoto, 2025", r.pct_remoto, PCT1, 70, "Colunas: percentual em trabalho remoto por região, Nordeste 52,6% e Sudeste 36,7%"]]
      .forEach(([id, rot, valores, fmt, max, alt], i) => {
        const x = gx(i * 6), w = gw(6);
        rotuloGrafico(s, `grafico-${id}-rotulo`, rot, x, 2.0, w);
        s.addChart(pres.charts.BAR, [{ name: rot, labels: r.categorias.map(curto), values: valores }], grafico({
          x, y: 2.3, w, h: 2.3, barDir: "col", chartColors: cores, dataLabelFormatCode: fmt, valAxisMaxVal: max,
          catAxisLabelFontSize: 10.5, dataLabelFontSize: 10, barGapWidthPct: 70, objectName: `grafico-${id}`, altText: alt,
        }));
      });
    chamada(s, "anotacao-senior", 6.12, 3.7, 6.55, 4.6);
    texto(s, "anotacao-senior-texto", [
      { text: "No nível sênior a diferença some: ", options: {} },
      { text: `${rs("14,0 mil")} no Nordeste e ${rs("13,8 mil")} no Sudeste.`, options: {} },
    ], { x: 6.62, y: 4.5, w: 5.96, h: 0.3, fontFace: FONTE_MEDIA, fontSize: 10, color: H.ultra, valign: "middle" });
    texto(s, "regiao-nota", "*Norte: 36 respostas, apenas indicativo.", { x: gx(0), y: 4.5, w: gw(4), h: 0.3, fontSize: 10, color: H.meta, valign: "middle" });

    const y = 5.25;
    [["regiao-sudeste", rs("13,5 mil"), "salário médio no Sudeste", H.tinta],
     ["regiao-nordeste", rs("10,3 mil"), "salário médio no Nordeste", H.ultra],
     ["regiao-remoto", "73%", "dos seniores do Nordeste em remoto", H.tinta]].forEach(([nome, v, l, cor], i) => {
      filete(s, `${nome}-filete`, gx(i * 3), y, gw(3), H.tinta, 1);
      numero(s, nome, gx(i * 3), y + 0.1, gw(3), v, l, { cor, tam: 30, hValor: 0.55, hLegenda: 0.6, tamLegenda: 11.5 });
    });
    paraBanco(s, gx(9), y, gw(3), "Contratar remoto fora do Sudeste amplia o funil de talentos e a diversidade regional.", { h: 1.45, tam: 12 });
    s.addNotes(
      "A diferença média entre regiões é grande, mas boa parte é composição: o Nordeste tem proporcionalmente mais júniores e plenos. " +
      "Comparando só seniores, os salários se igualam, o que sugere que o profissional sênior do Nordeste já compete no mercado nacional via trabalho remoto. " +
      "O Norte tem apenas 36 respondentes, então seus números são indicativos."
    );
  }

  // ---- Modelo de trabalho: atual x ideal -----------------------------------------------------
  {
    const s = slideConteudo(Q6, "21% trabalham 100% presencial, mas só 2% querem esse modelo", fonteTabela("modelo_trabalho"));
    const m = D.modelo_trabalho_2025;
    rotuloGrafico(s, "grafico-modelo-rotulo", "% dos profissionais de dados, 2025", gx(0), 2.0, gw(7));
    s.addChart(pres.charts.BAR, [
      { name: "Modelo atual", labels: m.categorias, values: m.atual },
      { name: "Modelo ideal", labels: m.categorias, values: m.ideal },
    ], grafico({
      x: gx(0), y: 2.3, w: gw(7), h: 4.4, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.apagado, H.ultra],
      dataLabelFormatCode: PCT1, valAxisMaxVal: 56, barGapWidthPct: 55, showLegend: true, legendPos: "t", catAxisLabelFontSize: 11,
      objectName: "grafico-modelo",
      altText: "Barras agrupadas: modelo atual e ideal; 100% presencial é 20,8% hoje e 1,9% desejado; híbrido flexível 19,6% hoje e 43% desejado",
    }));
    chamada(s, "anotacao-hibrido", 6.27, 4.27, 6.85, 3.98);
    texto(s, "anotacao-hibrido-texto", "Maior desalinhamento: híbrido flexível, de 20% hoje para 43% desejado",
      { x: 6.92, y: 3.62, w: 1.62, h: 0.85, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra });
    p4Lateral(s, {
      valor: "85%", legenda: "querem remoto ou híbrido flexível (42% + 43%)",
      dados: [
        "Remoto cresce com a senioridade: 26% dos júniores, 50% dos seniores e 52% dos especialistas",
      ],
      banco: "Flexibilidade é uma alavanca de atração mais barata que salário, sobretudo para seniores.",
      yDados: 3.5,
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
    const s = slideConteudo("Q7 · Oportunidades e desafios · recorte Finanças", "Finanças paga 13% mais e tem profissionais mais satisfeitos,\nmas é menos remoto", fonteTabela("comparativo_financas"));
    const f = D.financas_2025;
    rotuloGrafico(s, "grafico-financas-rotulo", "Finanças vs. demais setores, 2025 (% dos profissionais)", gx(0), 2.0, gw(7));
    s.addChart(pres.charts.BAR, [
      { name: "Finanças ou Bancos", labels: f.categorias, values: f.financas },
      { name: "Demais setores", labels: f.categorias, values: f.demais },
    ], grafico({
      x: gx(0), y: 2.3, w: gw(7), h: 4.4, barDir: "bar", catAxisOrientation: "maxMin", chartColors: [H.ultra, H.apagado],
      dataLabelFormatCode: PCT1, dataLabelFontSize: 9.5, valAxisMaxVal: 118, barGapWidthPct: 45, showLegend: true, legendPos: "t",
      catAxisLabelFontSize: 10.5, objectName: "grafico-financas",
      altText: "Barras agrupadas comparando Finanças e demais setores em uso de IA, IA paga pela empresa, senioridade, remoto, presencial, mulheres e busca de emprego",
    }));
    chamada(s, "anotacao-remoto", 5.18, 4.67, 5.42, 4.67);
    texto(s, "anotacao-remoto-texto", "O ponto fraco: menos remoto (32% contra 41%)",
      { x: 5.49, y: 4.42, w: 2.3, h: 0.5, fontFace: FONTE_MEDIA, fontSize: 10.5, color: H.ultra, valign: "middle" });

    const fmt = (v) => (v / 1000).toFixed(1).replace(".", ",");
    const premio = Math.round((f.salario_financas / f.salario_demais - 1) * 100);
    const x = gx(8), w = gw(4);
    numero(s, "financas-salario", x, 2.0, w, `+${premio}%`,
      `salário médio: ${rs(fmt(f.salario_financas) + " mil")} em Finanças contra ${rs(fmt(f.salario_demais) + " mil")} nos demais setores`,
      { cor: H.ultra, tam: 54, hValor: 0.85, hLegenda: 0.62, tamLegenda: 11.5 });
    filete(s, "financas-filete", x, 3.75, w, H.tinta, 1);
    numero(s, "financas-satisfeitos", x, 3.85, w, `${Math.round(f.satisfeitos_financas)}% vs ${Math.round(f.satisfeitos_demais)}%`,
      "profissionais satisfeitos: Finanças contra demais setores", { tam: 30, hValor: 0.55, hLegenda: 0.5, tamLegenda: 11.5 });
    paraBanco(s, x, 5.35, w, "A flexibilidade é o ponto fraco do setor e a alavanca de atração mais acessível.");
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
BLOCOS.push(function slidesRecomendacoes() {
  secao("Recomendações");

  {
    const s = slideDivisor("Parte 3 de 3", "O que o banco deve fazer", "Oportunidades, desafios e um roadmap em três fases",
      "Terceira parte: o que o banco deve fazer, com oportunidades, desafios e um roadmap em três fases.");
    // Um número por parte: o horizonte do roadmap
    texto(s, "divisor-numero", "24", { x: gx(8), y: 0.8, w: gw(4), h: 1.75, fontFace: FONTE_MEDIA, fontSize: 132, color: H.papel, align: "right", valign: "bottom", charSpacing: -3 });
    texto(s, "divisor-numero-legenda", "meses para governar a IA, escalar os pilotos e reter talento", { x: gx(8), y: 2.62, w: gw(4), h: 0.55, fontSize: 13, color: H.ultraClaro, align: "right" });
  }

  {
    const s = slideConteudo("Q7 · Oportunidades e desafios", "Oportunidades e desafios para o banco");
    const colunas = [
      ["Oportunidades", H.ultra, [
        ["Liderar a IA em produção:", "74% das empresas ainda não chegaram lá."],
        ["Marca empregadora forte:", "Finanças já paga mais e satisfaz mais."],
        ["Talento fora do Sudeste:", "seniores remotos com salário equivalente."],
        ["Base de diversidade:", "mulheres são 28% dos júniores."],
      ]],
      ["Desafios", H.tinta, [
        ["Escassez de ML/IA:", `só 3% do mercado, com salários de até ${rs("28,8")} mil.`],
        ["IA paralela:", "uso pessoal de IA sem governança sobre dados sensíveis."],
        ["Funil feminino:", "a presença cai de 28% para 18% até a gestão."],
        ["Flexibilidade:", "o setor é menos remoto que o mercado."],
      ]],
    ];
    colunas.forEach(([titulo, cor, itens], c) => {
      const x = gx(c * 6), w = gw(6) - (c === 0 ? 0.25 : 0), id = `coluna-${c + 1}`;
      filete(s, `${id}-filete`, x, 2.0, w, cor, 2.25);
      texto(s, `${id}-titulo`, titulo, { x, y: 2.14, w, h: 0.45, fontFace: FONTE_TITULO, fontSize: 20, color: cor });
      itens.forEach(([lead, txt], i) => {
        const y = 2.85 + i * 0.95;
        filete(s, `${id}-item-${i + 1}-filete`, x, y, w, H.filete, 0.75);
        texto(s, `${id}-item-${i + 1}`, [
          { text: `${lead} `, options: { fontFace: FONTE_TITULO, color: H.tinta } },
          { text: txt, options: { color: H.tinta2 } },
        ], { x, y: y + 0.16, w, h: 0.7, fontSize: 14.5 });
      });
      filete(s, `${id}-fim`, x, 2.85 + 4 * 0.95, w, H.filete, 0.75);
    });
    s.addNotes(
      "Resumo das evidências em duas colunas. As oportunidades vêm da posição já favorável do setor: salário, satisfação e investimento em IA acima do mercado, " +
      "num mercado em que três de cada quatro empresas ainda não colocaram IA em produção. Os desafios são escassez de talento de ML/IA, " +
      "uso de IA sem governança, o funil feminino que se estreita e a menor flexibilidade de trabalho."
    );
  }

  {
    const s = slideConteudo("Q7 · Oportunidades e desafios", "Roadmap recomendado: governar a IA já, escalar em 12 a 24 meses");
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
    // Linha do tempo: base fina em tinta, um marco por fase
    filete(s, "linha-tempo", G.x0, 2.55, G.w, H.tinta, 0.75);
    fases.forEach(([prazo, nome, itens], i) => {
      const x = gx(i * 4), w = gw(4), id = `fase-${i + 1}`;
      texto(s, `${id}-prazo`, prazo, { x, y: 2.0, w, h: 0.35, fontFace: FONTE_MEDIA, fontSize: 13, color: H.ultra, valign: "bottom" });
      s.addShape(pres.shapes.OVAL, { x: x, y: 2.55 - 0.07 + 0.005, w: 0.14, h: 0.14, fill: { color: H.ultra }, line: { type: "none" }, objectName: `${id}-marco` });
      texto(s, `${id}-nome`, nome, { x, y: 2.85, w, h: 0.5, fontFace: FONTE_TITULO, fontSize: 24, color: H.tinta, charSpacing: -0.4 });
      texto(s, `${id}-acoes`, marcadores(itens, 15, H.tinta2, 18), { x, y: 3.7, w: w - 0.1, h: 2.9 });
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
      ["Salário estimado", "Usamos o ponto médio da faixa salarial declarada; a faixa mais alta é aberta."],
      ["Amostra voluntária", "Quem responde é a comunidade engajada da Data Hackers, não uma amostra aleatória do mercado."],
      ["Questionário muda", "Especialista só existe em 2025; perguntas sobre IA na empresa são respondidas apenas por gestores."],
      ["Grupos pequenos", "Norte (36 respostas) e quem não usa IA (44) são apenas indicativos."],
      ["Correlação", "Diferenças entre grupos não provam causa: senioridade e setor se misturam aos efeitos."],
    ];
    const passo = 0.92;
    itens.forEach(([t, d], i) => {
      const y = 2.05 + i * passo, id = `limite-${i + 1}`;
      filete(s, `${id}-filete`, G.x0, y, G.w, i === 0 ? H.tinta : H.filete, i === 0 ? 1 : 0.75);
      texto(s, `${id}-titulo`, t, { x: gx(0), y, w: gw(3), h: passo, fontFace: FONTE_TITULO, fontSize: 15.5, color: H.tinta, valign: "middle" });
      texto(s, `${id}-texto`, d, { x: gx(3), y, w: gw(9), h: passo, fontSize: 14.5, color: H.tinta2, valign: "middle" });
    });
    filete(s, "limite-fim", G.x0, 2.05 + itens.length * passo, G.w, H.filete, 0.75);
    s.addNotes(
      "Transparência sobre o que os dados permitem afirmar. As tendências entre edições e as diferenças grandes são robustas; " +
      "diferenças de poucos pontos percentuais e grupos pequenos devem ser lidos com cautela."
    );
  }

  {
    const s = slideConteudo("Reprodutibilidade", "Tudo reproduzível: código, notebooks e SQL entregues com o deck", "Execução passo a passo: docs/ROTEIRO_AWS_ACADEMY.md");
    const semBorda = { type: "none" };
    const cab = (t) => ({ text: t, options: { fontFace: FONTE_TITULO, fontSize: 12.5, color: H.tinta,
      border: [semBorda, semBorda, { type: "solid", pt: 1, color: H.tinta }, semBorda] } });
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
      [cab("Entregável"), cab("Arquivo"), cab("Onde roda")],
      ...linhas.map((l) => l.map((t, j) => ({
        text: t,
        options: {
          fontSize: j === 1 ? 12 : 13.5,
          color: j === 2 ? H.tinta2 : H.tinta,
          fontFace: j === 1 ? MONO : (j === 0 ? FONTE_MEDIA : FONTE_TEXTO),
          border: [semBorda, semBorda, { type: "solid", pt: 0.75, color: H.filete }, semBorda],
        },
      }))),
    ], { x: G.x0, y: 2.05, w: G.w, colW: [3.25, 4.9, 3.683], rowH: 0.55, valign: "middle", margin: [0, 0.1, 0, 0], objectName: "tabela-entregaveis" });
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
      ["Dados confiáveis", "Plataforma Medallion em AWS e governança"],
      ["IA em produção", "Do piloto à produção com MLOps"],
      ["Talento retido", "Carreira em Y, flexibilidade e equidade"],
    ];
    pilares.forEach(([t, d], i) => {
      const x = gx(i * 4), w = gw(4), id = `pilar-${i + 1}`;
      filete(s, `${id}-filete`, x, 4.85, w, H.papel, 1);
      texto(s, `${id}-titulo`, t, { x, y: 4.99, w, h: 0.42, fontFace: FONTE_TITULO, fontSize: 19, color: H.papel });
      texto(s, `${id}-texto`, d, { x, y: 5.45, w, h: 0.6, fontSize: 13.5, color: H.papel });
    });
    texto(s, "perguntas", "Obrigado · Perguntas e discussão", { x: G.x0, y: 6.55, w: 9.0, h: 0.4, fontFace: FONTE_MEDIA, fontSize: 16, color: H.papel, valign: "middle" });
    s.addNotes("Fechamento: retomar a mensagem principal e abrir para perguntas.");
  }
});

// ---------------------------------------------------------------------------------------------
// Montagem
// ---------------------------------------------------------------------------------------------
(async () => {
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
