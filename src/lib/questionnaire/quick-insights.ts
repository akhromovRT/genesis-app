import type { Step1Answers } from "./types";

export type BMICategory =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese1"
  | "obese2"
  | "obese3";

export type RiskCategory = "low" | "moderate" | "high";
export type GraceCategory = "thin" | "harmonious" | "dense";

export interface BMIResult {
  value: number;
  category: BMICategory;
  label: string;
}

export interface RiskResult {
  value: number;
  category: RiskCategory;
  label: string;
}

export interface GraceResult {
  value: number;
  category: GraceCategory;
  label: string;
}

export interface QuickInsights {
  age: number;
  bmi: BMIResult | null;
  whr: RiskResult | null;
  waistRisk: RiskResult | null;
  indexOfGrace: GraceResult | null;
}

const BMI_LABELS: Record<BMICategory, string> = {
  underweight: "Недостаточная масса",
  normal: "Норма",
  overweight: "Избыточная масса",
  obese1: "Ожирение I степени",
  obese2: "Ожирение II степени",
  obese3: "Ожирение III степени",
};

const RISK_LABELS: Record<RiskCategory, string> = {
  low: "Низкий риск",
  moderate: "Умеренный риск",
  high: "Повышенный риск",
};

const GRACE_LABELS: Record<GraceCategory, string> = {
  thin: "Астенический тип",
  harmonious: "Гармоничный тип",
  dense: "Плотный тип",
};

export function calculateAge(birthDate: string, today: Date = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  let age = today.getFullYear() - y;
  const beforeBirthday =
    today.getMonth() + 1 < m ||
    (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const h = heightCm / 100;
  const value = Number((weightKg / (h * h)).toFixed(1));
  let category: BMICategory;
  // WHO BMI cutoffs: <18.5 underweight; 18.5–24.9 normal; 25–29.9 overweight; 30–34.9 obese I; 35–39.9 obese II; >=40 obese III
  if (value < 18.5) category = "underweight";
  else if (value < 25) category = "normal";
  else if (value < 30) category = "overweight";
  else if (value < 35) category = "obese1";
  else if (value < 40) category = "obese2";
  else category = "obese3";
  return { value, category, label: BMI_LABELS[category] };
}

export function calculateWHR(
  waist: number | undefined,
  hips: number | undefined,
  gender?: "m" | "f" | "other",
): RiskResult | null {
  if (waist == null || hips == null) return null;
  const value = Number((waist / hips).toFixed(2));
  let category: RiskCategory = "low";
  // WHO/IDF thresholds: men >=0.90 moderate, >=1.0 high; women >=0.80 moderate, >=0.85 high
  if (gender === "m") {
    if (value >= 1.0) category = "high";
    else if (value >= 0.9) category = "moderate";
  } else if (gender === "f") {
    if (value >= 0.85) category = "high";
    else if (value >= 0.8) category = "moderate";
  } else {
    if (value >= 0.85) category = "high";
    else if (value >= 0.8) category = "moderate";
  }
  return { value, category, label: RISK_LABELS[category] };
}

export function calculateWaistRisk(
  waist: number | undefined,
  gender?: "m" | "f" | "other",
): RiskResult | null {
  if (waist == null) return null;
  let category: RiskCategory = "low";
  // WHO/IDF thresholds: men >=94 cm moderate, >=102 cm high; women >=80 cm moderate, >=88 cm high
  if (gender === "m") {
    if (waist >= 102) category = "high";
    else if (waist >= 94) category = "moderate";
  } else {
    if (waist >= 88) category = "high";
    else if (waist >= 80) category = "moderate";
  }
  return { value: waist, category, label: RISK_LABELS[category] };
}

export function calculateIndexOfGrace(
  calf: number | undefined,
  hips: number | undefined,
): GraceResult | null {
  if (calf == null || hips == null) return null;
  const value = Number(((calf / hips) * 100).toFixed(1));
  let category: GraceCategory;
  if (value < 33) category = "thin";
  else if (value <= 38) category = "harmonious";
  else category = "dense";
  return { value, category, label: GRACE_LABELS[category] };
}

export function computeQuickInsights(
  step1: Step1Answers,
  today: Date = new Date(),
): QuickInsights {
  return {
    age: calculateAge(step1.birthDate, today),
    bmi: calculateBMI(step1.weight, step1.height),
    whr: calculateWHR(step1.waist, step1.hips, step1.gender),
    waistRisk: calculateWaistRisk(step1.waist, step1.gender),
    indexOfGrace: calculateIndexOfGrace(step1.calf, step1.hips),
  };
}
