// ── Types ─────────────────────────────────────────────────────

export interface BiomarkerInput {
  age: number;
  albumin: number;       // г/л
  creatinine: number;    // мкмоль/л
  glucose: number;       // ммоль/л
  crp: number;           // мг/л (hsCRP)
  lymphocyte: number;    // %
  mcv: number;           // фл
  rdw: number;           // %
  alp: number;           // Ед/л
  wbc: number;           // ×10⁹/л
}

export interface MarkerInfo {
  key: keyof Omit<BiomarkerInput, "age">;
  nameRu: string;
  nameEn: string;
  unit: string;
  optimalMin: number;
  optimalMax: number;
  placeholder: string;
  recommendation: string;
}

export type MarkerStatus = "good" | "borderline" | "bad";

export interface MarkerResult {
  info: MarkerInfo;
  value: number;
  status: MarkerStatus;
}

export interface PhenoAgeResult {
  phenoAge: number;
  chronologicalAge: number;
  difference: number;       // positive = older than chrono, negative = younger
  xb: number;               // intermediate value
  mortality: number;         // M value
  markers: MarkerResult[];
}

// ── Marker definitions ────────────────────────────────────────

export const MARKERS: MarkerInfo[] = [
  {
    key: "albumin",
    nameRu: "Альбумин",
    nameEn: "Albumin",
    unit: "г/л",
    optimalMin: 40,
    optimalMax: 50,
    placeholder: "45",
    recommendation: "Альбумин отражает функцию печени и нутритивный статус. Повысить можно через достаточное потребление белка (1.2–1.6 г/кг массы тела) и поддержку здоровья печени.",
  },
  {
    key: "creatinine",
    nameRu: "Креатинин",
    nameEn: "Creatinine",
    unit: "мкмоль/л",
    optimalMin: 60,
    optimalMax: 90,
    placeholder: "75",
    recommendation: "Креатинин отражает функцию почек и мышечную массу. Поддержание адекватной гидратации и регулярные силовые тренировки помогают держать уровень в оптимуме.",
  },
  {
    key: "glucose",
    nameRu: "Глюкоза",
    nameEn: "Glucose",
    unit: "ммоль/л",
    optimalMin: 4.0,
    optimalMax: 5.2,
    placeholder: "4.8",
    recommendation: "Повышенная глюкоза натощак — ранний маркер инсулинорезистентности. Снижайте потребление быстрых углеводов, добавьте физическую активность после еды, контролируйте вес.",
  },
  {
    key: "crp",
    nameRu: "С-реактивный белок (hsCRP)",
    nameEn: "hsCRP",
    unit: "мг/л",
    optimalMin: 0,
    optimalMax: 1.0,
    placeholder: "0.5",
    recommendation: "hsCRP — маркер системного воспаления, ключевой фактор старения. Снижается через противовоспалительную диету (омега-3, овощи, ягоды), управление стрессом, нормализацию сна и снижение висцерального жира.",
  },
  {
    key: "lymphocyte",
    nameRu: "Лимфоциты",
    nameEn: "Lymphocyte %",
    unit: "%",
    optimalMin: 25,
    optimalMax: 40,
    placeholder: "32",
    recommendation: "Лимфоциты отражают состояние иммунной системы. Поддержка: достаточный сон (7–9 ч), умеренные физические нагрузки, витамин D, цинк, снижение хронического стресса.",
  },
  {
    key: "mcv",
    nameRu: "Средний объём эритроцита (MCV)",
    nameEn: "MCV",
    unit: "фл",
    optimalMin: 82,
    optimalMax: 95,
    placeholder: "88",
    recommendation: "MCV вне нормы может указывать на дефицит B12/фолата (повышен) или железа (понижен). Проверьте уровни B12, фолиевой кислоты и ферритина.",
  },
  {
    key: "rdw",
    nameRu: "Ширина распределения эритроцитов (RDW)",
    nameEn: "RDW",
    unit: "%",
    optimalMin: 11.5,
    optimalMax: 14.0,
    placeholder: "12.8",
    recommendation: "Повышенный RDW связан с ускоренным старением и сердечно-сосудистыми рисками. Коррекция дефицитов железа, B12, фолата и снижение воспаления помогают нормализовать показатель.",
  },
  {
    key: "alp",
    nameRu: "Щелочная фосфатаза (ALP)",
    nameEn: "ALP",
    unit: "Ед/л",
    optimalMin: 40,
    optimalMax: 100,
    placeholder: "65",
    recommendation: "ALP связана со здоровьем печени и костей. Повышение может указывать на проблемы с желчевыводящими путями или костным метаболизмом. Проверьте витамин D и здоровье печени.",
  },
  {
    key: "wbc",
    nameRu: "Лейкоциты (WBC)",
    nameEn: "WBC",
    unit: "×10⁹/л",
    optimalMin: 4.0,
    optimalMax: 7.0,
    placeholder: "5.5",
    recommendation: "Повышенные лейкоциты в лонжевити-диапазоне ассоциированы с хроническим воспалением. Противовоспалительная диета, управление стрессом, отказ от курения помогают снизить уровень.",
  },
];

// ── PhenoAge Formula ──────────────────────────────────────────

const COEFFICIENTS = {
  intercept: -19.9067,
  albumin: -0.0336,
  creatinine: 0.0095,
  glucose: 0.1953,
  crp: 0.0954,        // coefficient for ln(CRP)
  lymphocyte: -0.0120,
  mcv: 0.0268,
  rdw: 0.3306,
  alp: 0.00188,
  wbc: 0.0554,
  age: 0.0804,
};

const GAMMA = 0.0076927;
const LAMBDA = 1.51714;
const PHENOAGE_INTERCEPT = 141.50225;
const PHENOAGE_SLOPE = 0.090165;
const PHENOAGE_BETA = -0.00553;

export function calculatePhenoAge(input: BiomarkerInput): PhenoAgeResult {
  // Step 1: linear combination
  const xb =
    COEFFICIENTS.intercept +
    COEFFICIENTS.albumin * input.albumin +
    COEFFICIENTS.creatinine * input.creatinine +
    COEFFICIENTS.glucose * input.glucose +
    COEFFICIENTS.crp * Math.log(Math.max(input.crp, 0.01)) +
    COEFFICIENTS.lymphocyte * input.lymphocyte +
    COEFFICIENTS.mcv * input.mcv +
    COEFFICIENTS.rdw * input.rdw +
    COEFFICIENTS.alp * input.alp +
    COEFFICIENTS.wbc * input.wbc +
    COEFFICIENTS.age * input.age;

  // Step 2: mortality probability
  const M = 1 - Math.exp((-LAMBDA * Math.exp(xb)) / GAMMA);

  // Step 3: PhenoAge
  const phenoAge =
    PHENOAGE_INTERCEPT + Math.log(PHENOAGE_BETA * Math.log(1 - M)) / PHENOAGE_SLOPE;

  // Evaluate markers
  const markers: MarkerResult[] = MARKERS.map((info) => {
    const value = input[info.key];
    let status: MarkerStatus = "good";

    if (info.key === "crp") {
      // CRP: only upper bound matters
      if (value > info.optimalMax * 1.5) status = "bad";
      else if (value > info.optimalMax) status = "borderline";
    } else {
      const range = info.optimalMax - info.optimalMin;
      const margin = range * 0.15; // 15% margin for borderline
      if (value < info.optimalMin - margin || value > info.optimalMax + margin) {
        status = "bad";
      } else if (value < info.optimalMin || value > info.optimalMax) {
        status = "borderline";
      }
    }

    return { info, value, status };
  });

  return {
    phenoAge: Math.round(phenoAge * 10) / 10,
    chronologicalAge: input.age,
    difference: Math.round((phenoAge - input.age) * 10) / 10,
    xb: Math.round(xb * 10000) / 10000,
    mortality: Math.round(M * 10000) / 10000,
    markers,
  };
}
