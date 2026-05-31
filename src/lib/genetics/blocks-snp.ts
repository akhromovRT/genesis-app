/**
 * Источник истины SNP по 5 блокам генетической панели «Активное долголетие».
 * Данные транскрибированы из DOCX-файлов эксперта Галины Хусаиновой (2026-05).
 * Файлы: agent_docs/genetics-blocks/source-galina-2026-05/
 *
 * NOTE: Блок 5 содержит 103 уникальных пары gene:rs из основных колонок DOCX.
 * DOCX-заголовок декларирует 146 SNP, но методология подсчёта в документе
 * не совпадает с подсчётом уникальных пар gene:rs (повторное упоминание
 * одного SNP в нескольких подразделах аптечки считалось как отдельный).
 * allUniqueSnps() = 184 (честная транскрипция без фальсификации).
 */

export interface Snp {
  gene: string;
  /**
   * dbSNP rsID (например "rs1815739"). Исключения в блоке 5:
   * структурные делеции — "del" (GSTM1, GSTT1); HLA-локусы без единого
   * канонического rsID — метка гена (HLA-DQA1, HLA-DQB1).
   * Потребители, валидирующие rsID по /^rs\d+$/, должны это учитывать.
   */
  rs: string;
}

export interface BlockSnp {
  slug: "nutrition" | "body" | "beauty-safety" | "mind" | "risks";
  code: string;
  title: string;
  snps: Snp[];
}

const snp = (gene: string, rs: string): Snp => ({ gene, rs });

export const BLOCKS_SNP: BlockSnp[] = [
  {
    slug: "nutrition",
    code: "B1",
    title: "Генетика питания, стройности и восстановления",
    snps: [
      // Омега и жирные кислоты
      snp("FADS1", "rs174547"),
      snp("FADS2", "rs174548"),
      snp("FADS2", "rs66698963"),
      snp("APOA5", "rs662799"),
      snp("APOA5", "rs964184"),
      // Вес, аппетит, метаболизм жиров и углеводов
      snp("FTO", "rs9939609"),
      snp("PPARG", "rs1801282"),
      snp("FABP2", "rs1799883"),
      snp("CD36", "rs1761667"),
      snp("LRP1", "rs1799986"),
      // Каротиноиды и витамин A
      snp("BCMO1", "rs12934922"),
      snp("BCMO1", "rs7501331"),
      // Витамин D
      snp("GC", "rs2282679"),
      snp("GC", "rs4588"),
      snp("GC", "rs7041"),
      snp("VDR", "rs2228570"),
      snp("VDR", "rs731236"),
      snp("ATP2B1", "rs7965584"),
      snp("DIO2", "rs12885300"),
      // Фолатный цикл / B-витамины
      snp("MTHFR", "rs1801133"),
      snp("MTHFR", "rs1801131"),
      snp("MTR", "rs1805087"),
      snp("MTRR", "rs1801394"),
      snp("FUT2", "rs602662"),
      snp("TCN2", "rs1801198"),
      snp("SLC19A1", "rs1051266"),
      snp("CBS", "rs234706"),
      snp("CBS", "rs28934891"),
      snp("MTHFD1", "rs2236225"),
      snp("SHMT1", "rs1979277"),
      // Витамин K
      snp("VKORC1", "rs9934438"),
      snp("CYP4F2", "rs2108622"),
      // Железо
      snp("HFE", "rs1799945"),
      snp("HFE", "rs1800730"),
      snp("TF", "rs1799852"),
      snp("TMPRSS6", "rs4820268"),
      snp("SLC40A1", "rs11568351"),
      // Медь
      snp("ATP7B", "rs28942074"),
      // Соль, давление, сосуды
      snp("ADD1", "rs4961"),
      snp("CYP11B2", "rs1799998"),
      snp("ACE", "rs4646994"),
      snp("AGT", "rs699"),
      // Кофеин
      snp("CYP1A2", "rs762551"),
      // Алкоголь
      snp("ADH1B", "rs1229984"),
      // Аппетит, дофамин
      snp("DRD2", "rs1800497"),
      snp("DBH", "rs6271"),
      // Лактаза
      snp("MCM6", "rs4988235"),
      // Антиоксидантная защита
      snp("GSTP1", "rs1695"),
      snp("GPX1", "rs1050450"),
      snp("NQO1", "rs1800566"),
      snp("SOD2", "rs4880"),
    ],
  },
  {
    slug: "body",
    code: "B2",
    title: "Тело в форме: спорт, мышцы, кости, суставы",
    snps: [
      // Мышечная композиция
      snp("ACTN3", "rs1815739"),
      snp("ACE", "rs4646994"),
      snp("ACE", "rs1799752"),
      snp("AMPD1", "rs17602729"),
      snp("ADRB2", "rs1042713"),
      snp("ADRB2", "rs1042714"),
      snp("ADRB3", "rs4994"),
      // Метаболизм и вес
      snp("FTO", "rs9939609"),
      snp("PPARG", "rs1801282"),
      snp("COMT", "rs4680"),
      // Витамин D и кальций
      snp("VDR", "rs2228570"),
      snp("VDR", "rs731236"),
      snp("GC", "rs2282679"),
      snp("CALCR", "rs1801197"),
      // Кости
      snp("BMP2", "rs15705"),
      snp("FDPS", "rs2297480"),
      // Воспаление
      snp("IL6", "rs1800795"),
      snp("TNF", "rs1800629"),
      // Щитовидка
      snp("DIO2", "rs12885300"),
      // Соединительная ткань / суставы
      snp("COL5A1", "rs12722"),
      snp("COL5A1", "rs1134114"),
      snp("COL3A1", "rs1800255"),
      snp("MMP12", "rs2276109"),
      // Аппетит
      snp("MC4R", "rs17782313"),
      snp("UCP2", "rs660339"),
      snp("LEPR", "rs1137101"),
      // Эндотелий
      snp("NOS3", "rs1799983"),
      snp("VEGFA", "rs2010963"),
    ],
  },
  {
    slug: "beauty-safety",
    code: "B3",
    title: "Красота и безопасность: кожа, гормоны, защита",
    snps: [
      // Барьер кожи
      snp("FLG", "rs138726443"),
      snp("FLG", "rs61816761"),
      snp("FLG", "rs558269137"),
      // Воспаление / аллергия
      snp("IL13", "rs20541"),
      snp("IL1B", "rs1143634"),
      snp("IL6", "rs1800795"),
      snp("TNF", "rs1800629"),
      // Антиоксидантная защита
      snp("GPX1", "rs1050450"),
      snp("GSTP1", "rs1695"),
      snp("NQO1", "rs1800566"),
      snp("SOD2", "rs4880"),
      // Гликирование
      snp("AGER", "rs2070600"),
      // Сахар / инсулин
      snp("TCF7L2", "rs12255372"),
      snp("TCF7L2", "rs7903146"),
      snp("SLC2A2", "rs5400"),
      snp("PPARG", "rs1801282"),
      // Гормоны
      snp("CYP17A1", "rs743572"),
      snp("CYP19A1", "rs2470152"),
      snp("ESR2", "rs4986938"),
      snp("PGR", "rs1042838"),
      snp("AR", "rs3032358"),
      // Соединительная ткань
      snp("COL5A1", "rs12722"),
      snp("COL5A1", "rs1134114"),
      snp("COL3A1", "rs1800255"),
      snp("MMP12", "rs2276109"),
      // Эндотелий / сосуды
      snp("NOS3", "rs1799983"),
      snp("VEGFA", "rs2010963"),
    ],
  },
  {
    slug: "mind",
    code: "B4",
    title: "Мозг, сон и стресс: нейрохимия и биоритмы",
    snps: [
      snp("COMT", "rs4680"),
      snp("HTR2A", "rs6313"),
      snp("DRD2", "rs1800497"),
      snp("DBH", "rs6271"),
      snp("DRD2", "rs1799732"),
      snp("BDNF", "rs6265"),
      snp("PER2", "rs2304672"),
      snp("CLOCK", "rs11932595"),
      snp("HTR1A", "rs6295"),
      snp("MAOA", "rs6323"),
      snp("SLC6A2", "rs2242446"),
      snp("OPRM1", "rs1799971"),
    ],
  },
  {
    slug: "risks",
    code: "B5",
    title: "Основные риски здоровья + безопасная аптечка",
    // NOTE: Уникальных пар gene:rs = 103 (честная транскрипция основных колонок).
    // DOCX-заголовок декларирует 146 SNP — расхождение объясняется повторным
    // упоминанием одних и тех же SNP в нескольких подразделах таблицы аптечки.
    snps: [
      // === Основные риски здоровья ===
      // Сердце, сосуды, давление, эндотелий
      snp("NOS3", "rs1799983"),
      snp("EDN1", "rs2070699"),
      snp("NPPA", "rs5065"),
      snp("ACE", "rs4341"), // иной вариант ACE, чем rs4646994 в блоках 1–2 (intron-16 I/D)
      snp("ADRB1", "rs1801253"),
      snp("AGTR1", "rs5186"),
      // Гемостаз: тромбозы, кровоточивость, синяки
      snp("F2", "rs1799963"),
      snp("F5", "rs6025"),
      snp("F7", "rs6046"),
      snp("F8", "rs1800291"),
      snp("F9", "rs6048"),
      snp("F12", "rs1801020"),
      snp("FGG", "rs2066865"),
      snp("GP1BA", "rs6065"),
      snp("ITGA2", "rs1126643"),
      snp("ITGB3", "rs5918"),
      snp("GPVI", "rs1613662"),
      snp("SERPINC1", "rs2227589"),
      snp("PAI1", "rs1799889"),
      // Липидно-сосудистые риски
      snp("APOE", "rs429358"),
      snp("APOE", "rs7412"),
      snp("CETP", "rs5882"),
      snp("LPL", "rs328"),
      snp("SLCO1B1", "rs4149056"),
      snp("SLCO1B1", "rs139257324"),
      // Углеводный обмен и диабетические риски
      snp("IGF2BP2", "rs4402960"),
      snp("KCNJ11", "rs5219"),
      snp("INS", "rs689"),
      // Воспаление и иммунная реактивность
      snp("IL1B", "rs1143634"),
      snp("IL13", "rs20541"),
      snp("CTLA4", "rs231775"),
      snp("MCP1", "rs1024611"),
      snp("IFNG", "rs2430561"),
      snp("CCR5", "rs333"),
      // ЖКТ, печень, билирубин, воспалительные заболевания кишечника
      snp("UGT1A1", "rs8175347"),
      snp("UGT1A10", "rs4124874"),
      snp("UGT1A10", "rs4148323"),
      snp("NOD2", "rs5743293"),
      snp("HLA-DQA1", "HLA-DQA1"),
      snp("HLA-DQB1", "HLA-DQB1"),
      // Дыхательная система
      snp("HIF1A", "rs11549465"),
      snp("GSTM1", "del"),
      snp("GSTT1", "del"),
      // Гормональный профиль и репродуктивные риски
      snp("CYP17A1", "rs743572"),
      snp("CYP19A1", "rs2470152"),
      snp("ESR2", "rs4986938"),
      snp("PGR", "rs1042838"),
      snp("AR", "rs3032358"),
      snp("FSHR", "rs6166"),
      snp("LHCGR", "rs2293275"),
      snp("AMH", "rs10407022"),
      // Щитовидная железа и эндокринная регуляция
      snp("TSHR", "rs1991517"),
      // CTLA4 rs231775 — уже в «Воспаление» выше, не дублируем
      // Онконастороженность
      snp("BRCA1", "rs80357522"),
      snp("BRCA1", "rs80357609"),
      snp("BRCA1", "rs80357711"),
      snp("BRCA1", "rs80357713"),
      snp("BRCA1", "rs80357868"),
      snp("BRCA2", "rs1801439"),
      snp("BRCA2", "rs80359550"),
      snp("CHEK2", "rs121908698"),
      snp("CHEK2", "rs17879961"),
      snp("CHEK2", "rs555607708"),
      snp("TP53", "rs1042522"),
      snp("EGFR", "rs121434568"),
      snp("CDCA3", "rs5443"),
      // Нейродегенерация — APOE уже в «Липиды» выше, не дублируем
      // Депрессия — CTLA4, IFNG, HLA-DQA1, HLA-DQB1 уже выше, не дублируем
      // === Безопасная аптечка (фармакогенетика) ===
      // Транспорт лекарств
      snp("ABCB1", "rs1045642"),
      snp("ABCG2", "rs2231142"),
      // SLCO1B1 уже в «Липиды» выше, не дублируем
      // Статины и липидоснижающая терапия
      // SLCO1B1 — dup
      snp("CYP3A5", "rs776746"),
      snp("CYP3A5", "rs10264272"),
      snp("CYP3A5", "rs55817950"),
      // Антиагреганты и антикоагулянты
      snp("VKORC1", "rs9934438"),
      snp("CYP2C9", "rs1057910"),
      snp("CYP2C9", "rs1799853"),
      snp("CYP2C9", "rs114071557"),
      snp("CYP2C9", "rs72558187"),
      snp("CYP2C9", "rs72558189"),
      snp("CYP2C9", "rs7900194"),
      snp("CYP4F2", "rs2108622"),
      // ITGA2, ITGB3 — уже в «Гемостаз» выше, не дублируем
      // Ингибиторы протонной помпы (ИПП)
      snp("CYP2C19", "rs4244285"),
      snp("CYP2C19", "rs4986893"),
      snp("CYP2C19", "rs12769205"),
      snp("CYP2C19", "rs3758581"),
      snp("CYP2C19", "rs41291556"),
      snp("CYP2C19", "rs72552267"),
      // Антидепрессанты и психотропные препараты
      snp("CYP2D6", "rs35742686"),
      snp("CYP2D6", "rs3892097"),
      snp("CYP2D6", "rs769258"),
      snp("CYP3A4", "rs67666821"),
      // Обезболивание и опиоидные анальгетики
      snp("OPRM1", "rs1799971"),
      // CYP2D6 — уже в «Антидепрессанты» выше, не дублируем
      // Метотрексат, онко и ревматологическая терапия
      snp("MTHFR", "rs1801133"),
      snp("MTHFR", "rs1801131"),
      snp("MTRR", "rs1801394"),
      snp("TPMT", "rs2842934"),
      snp("TPMT", "rs9333569"),
      snp("NUDT15", "rs116855232"),
      // Фторпиримидины / онкотерапия
      snp("DPYD", "rs55886062"),
      // Противомикробные — CYP2C9, CYP2C19, CYP3A5, ABCB1 уже выше, не дублируем
      // Ксенобиотики, детоксикация, ацетилирование
      snp("NAT2", "rs1041983"),
      snp("NAT2", "rs1799930"),
      snp("NAT2", "rs1801279"),
      snp("NAT2", "rs1208"),
      snp("NAT2", "rs1799929"),
      snp("NAT2", "rs1801280"),
      snp("SULT1A1", "rs1042028"),
    ],
  },
];

export function blockSnpCount(slug: BlockSnp["slug"]): number {
  return BLOCKS_SNP.find((b) => b.slug === slug)?.snps.length ?? 0;
}

export function allUniqueSnps(): Snp[] {
  const seen = new Map<string, Snp>();
  for (const b of BLOCKS_SNP)
    for (const s of b.snps) seen.set(`${s.gene}:${s.rs}`, s);
  return [...seen.values()];
}
