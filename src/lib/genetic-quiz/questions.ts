export interface GeneMarker {
  gene: string;
  rs: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  intent: string;
  /** true для вопросов 16–17 — покрывают всю панель */
  coversAll: boolean;
  markers: GeneMarker[];
}

/** Минимум вопросов для показа результата (механика Галины) */
export const MIN_SELECTION = 5;

/** Размер полной панели Блока 1 (продуктовый факт, не вычисляется) */
export const TOTAL_GENE_POINTS = 50;

/** Цена Блока 1 «Стройность и питание без угадывания», ₽ */
export const BLOCK_1_PRICE_RUB = 15900;

const m = (gene: string, rs: string): GeneMarker => ({ gene, rs });

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Почему вес уходит хуже, чем раньше?",
    intent: "Что мешает стройности",
    coversAll: false,
    markers: [m("FTO", "rs9939609"), m("PPARG", "rs1801282"), m("FABP2", "rs1799883"), m("CD36", "rs1761667"), m("LRP1", "rs1799986")],
  },
  {
    id: 2,
    question: "Ограничивать жиры или углеводы?",
    intent: "Почему чужая диета не работает",
    coversAll: false,
    markers: [m("PPARG", "rs1801282"), m("FABP2", "rs1799883"), m("CD36", "rs1761667"), m("FTO", "rs9939609")],
  },
  {
    id: 3,
    question: "Какие жиры реально полезны?",
    intent: "Переработка типов жиров",
    coversAll: false,
    markers: [m("FADS1", "rs174547"), m("FADS2", "rs174548"), m("FADS2", "rs66698963"), m("PPARG", "rs1801282"), m("CD36", "rs1761667")],
  },
  {
    id: 4,
    question: "Почему холестерин растёт при «нормальной» еде?",
    intent: "Слабое место: липидный обмен",
    coversAll: false,
    markers: [m("APOA5", "rs662799"), m("APOA5", "rs964184"), m("FADS1", "rs174547"), m("FADS2", "rs174548"), m("FADS2", "rs66698963"), m("FABP2", "rs1799883"), m("LRP1", "rs1799986")],
  },
  {
    id: 5,
    question: "Почему тянет на «вкусненькое» в стресс?",
    intent: "Аппетит и система вознаграждения",
    coversAll: false,
    markers: [m("DRD2", "rs1800497"), m("FTO", "rs9939609"), m("CD36", "rs1761667")],
  },
  {
    id: 6,
    question: "Почему кофе даёт тревожность / плохой сон?",
    intent: "Скорость переработки кофеина",
    coversAll: false,
    markers: [m("CYP1A2", "rs762551")],
  },
  {
    id: 7,
    question: "Правда ли мне надо ограничивать соль?",
    intent: "Реакция на соль/давление/отёки",
    coversAll: false,
    markers: [m("ADD1", "rs4961"), m("CYP11B2", "rs1799998"), m("AGT", "rs699"), m("ACE", "rs4646994")],
  },
  {
    id: 8,
    question: "Почему лицо «заливает», отёки?",
    intent: "Соль, сосуды, минеральная регуляция",
    coversAll: false,
    markers: [m("ADD1", "rs4961"), m("CYP11B2", "rs1799998"), m("AGT", "rs699"), m("ACE", "rs4646994"), m("ATP2B1", "rs7965584")],
  },
  {
    id: 9,
    question: "Почему алкоголь переносится хуже?",
    intent: "Переработка алкоголя",
    coversAll: false,
    markers: [m("ADH1B", "rs1229984"), m("DRD2", "rs1800497"), m("DBH", "rs6271")],
  },
  {
    id: 10,
    question: "Почему от молочки вздутие?",
    intent: "Переносимость лактозы",
    coversAll: false,
    markers: [m("MCM6", "rs4988235")],
  },
  {
    id: 11,
    question: "Почему энергии мало при нормальной еде?",
    intent: "B12, фолаты, гомоцистеин, усвоение",
    coversAll: false,
    markers: [m("MTHFR", "rs1801133"), m("MTHFR", "rs1801131"), m("MTR", "rs1805087"), m("MTRR", "rs1801394"), m("FUT2", "rs602662"), m("TCN2", "rs1801198"), m("SLC19A1", "rs1051266")],
  },
  {
    id: 12,
    question: "«Узкие места» по витаминам группы B?",
    intent: "Что проверить до B-комплекса",
    coversAll: false,
    markers: [m("CBS", "rs234706"), m("CBS", "rs28934891"), m("MTHFD1", "rs2236225"), m("SHMT1", "rs1979277"), m("MTHFR", "rs1801133"), m("MTHFR", "rs1801131"), m("MTR", "rs1805087"), m("MTRR", "rs1801394"), m("SLC19A1", "rs1051266"), m("FUT2", "rs602662"), m("TCN2", "rs1801198")],
  },
  {
    id: 13,
    question: "Сколько витамина D мне безопасно?",
    intent: "Транспорт, рецепторный ответ, минералы",
    coversAll: false,
    markers: [m("VDR", "rs2228570"), m("VDR", "rs731236"), m("GC", "rs2282679"), m("GC", "rs4588"), m("GC", "rs7041"), m("ATP2B1", "rs7965584"), m("DIO2", "rs12885300")],
  },
  {
    id: 14,
    question: "Подводные камни приёма железа?",
    intent: "Ферритин, перегрузка/дефицит",
    coversAll: false,
    markers: [m("HFE", "rs1799945"), m("HFE", "rs1800730"), m("TF", "rs1799852"), m("TMPRSS6", "rs4820268"), m("SLC40A1", "rs11568351")],
  },
  {
    id: 15,
    question: "Почему кожа тусклее, восстановление дольше?",
    intent: "Антиоксидантная защита",
    coversAll: false,
    markers: [m("GSTP1", "rs1695"), m("GPX1", "rs1050450"), m("NQO1", "rs1800566"), m("SOD2", "rs4880")],
  },
  {
    id: 16,
    question: "Какие анализы сдавать по моей ДНК-карте?",
    intent: "ДНК → чек-лист анализов",
    coversAll: true,
    markers: [],
  },
  {
    id: 17,
    question: "Что сильнее влияет на стройность/лицо/энергию после 35–50+?",
    intent: "Главный женский запрос",
    coversAll: true,
    markers: [],
  },
];
