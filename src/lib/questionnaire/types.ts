import { z } from "zod";

// ── Shared enums ──────────────────────────────────────────────

export const FrequencyEnum = z.enum(["never", "rarely", "sometimes", "often"]);
export type Frequency = z.infer<typeof FrequencyEnum>;

export const IntensityEnum = z.enum(["none", "moderate", "severe"]);
export type Intensity = z.infer<typeof IntensityEnum>;

export const PhysicalActivityEnum = z.enum(["low", "medium", "high"]);
export const WaterIntakeEnum = z.enum(["<0.5", "0.5-1", "1-1.5", ">1.5", "2+"]);
export const ReadinessEnum = z.enum(["full", "partial", "unsure"]);

// ── Step 1: Personal ──────────────────────────────────────────

export const Step1Schema = z.object({
  gender: z.enum(["m", "f", "other"]),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат: ГГГГ-ММ-ДД"),
  city: z.string().min(1, "Укажите город"),
  timezone: z.string().min(1, "Укажите часовой пояс"),
  height: z.number().min(100, "Мин. 100").max(250, "Макс. 250"),
  weight: z.number().min(30, "Мин. 30").max(300, "Макс. 300"),
  waist: z.number().min(40).max(200).optional(),
  hips: z.number().min(40).max(200).optional(),
});
export type Step1Answers = z.infer<typeof Step1Schema>;

// ── Step 2: Lifestyle ─────────────────────────────────────────

export const Step2Schema = z.object({
  workDescription: z.string().max(500).optional(),
  physicalActivity: PhysicalActivityEnum,
  activityDescription: z.string().max(500).optional(),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  sleepTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  sleepQuality: z.number().min(0).max(5),
  mealsPerDayWeekday: z.number().min(1).max(10),
  mealsPerDayWeekend: z.number().min(1).max(10),
  breakfastTimeWeekday: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lastMealTimeWeekday: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  breakfastTimeWeekend: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lastMealTimeWeekend: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  waterIntake: WaterIntakeEnum,
});
export type Step2Answers = z.infer<typeof Step2Schema>;

// ── Step 3: Anamnesis ─────────────────────────────────────────

export const Step3Schema = z.object({
  parentsDiseases: z.string().max(2000).optional(),
  relativesDiseases: z.string().max(2000).optional(),
  chronicDiagnoses: z.string().max(2000).optional(),
  surgeries: z.string().max(2000).optional(),
});
export type Step3Answers = z.infer<typeof Step3Schema>;

// ── Step 4: Body Systems ──────────────────────────────────────

export const Step4Schema = z.object({
  brainNervous: z.string().max(1000).optional(),
  vision: z.string().max(1000).optional(),
  ent: z.string().max(1000).optional(),
  cardiovascular: z.string().max(1000).optional(),
  digestive: z.string().max(1000).optional(),
  urogenital: z.string().max(1000).optional(),
  urogenitalLastVisit: z.string().max(200).optional(),
  skinHairNails: z.string().max(1000).optional(),
  aestheticIssues: z.string().max(500).optional(),
  thyroid: z.string().max(1000).optional(),
  thyroidLastCheck: z.string().max(200).optional(),
  lungs: z.string().max(1000).optional(),
  coldFrequency: z.string().max(200).optional(),
  jointsMuscles: z.string().max(1000).optional(),
});
export type Step4Answers = z.infer<typeof Step4Schema>;

// ── Step 5: Stress & Allergies ────────────────────────────────

export const Step5Schema = z.object({
  emotionalState: z.string().max(1000).optional(),
  stressLevel: z.number().min(1).max(5),
  pollinosis: z.string().max(500).optional(),
  foodAllergies: z.string().max(500).optional(),
  drugAllergies: z.string().max(500).optional(),
});
export type Step5Answers = z.infer<typeof Step5Schema>;

// ── Step 6: Medications & Supplements ─────────────────────────

export const MEDICATION_GROUPS = [
  "antiplatelet", "bloodPressureHeart", "microcirculation", "venotonic",
  "antidepressants", "neuroleptics", "anxietySleep", "anticonvulsants",
  "stomach", "enzymesBile", "laxatives", "antidiarrheal",
  "thyroidHormones", "hormonal", "diabetes", "nsaids",
  "spasmolytics", "gout", "antibiotics", "antivirals",
  "antifungals", "detoxAcetylation", "hepatoprotectors",
] as const;

export const SUPPLEMENT_GROUPS = [
  "vitaminsMinerals", "omega3", "probioticsPrebiotics", "antioxidants",
  "adaptogens", "aminoAcidsSportsNut", "collagenJoints",
  "brainCognitive", "other",
] as const;

const MedicationEntrySchema = z.object({
  frequency: FrequencyEnum,
  nameAndDosage: z.string().max(500).optional(),
});

// Using z.record(z.string(), ...) for sparse records (not all keys need to be present).
export const Step6Schema = z.object({
  medications: z.record(z.string(), MedicationEntrySchema).default({}),
  additionalMedications: z.string().max(1000).optional(),
  supplements: z.record(z.string(), MedicationEntrySchema).default({}),
  trustedBrands: z.string().max(500).optional(),
  noBrandPreference: z.boolean().default(false),
});
export type Step6Answers = z.infer<typeof Step6Schema>;

// ── Step 7: Nutrition ─────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "sweets", "flour", "redMeatSausages", "whiteMeat", "organMeats",
  "fishAny", "fishFatty", "seafood", "dairy", "fermentedDairy",
  "nonStarchyVeg", "starchyVeg", "fruitsBerries", "wholeGrains",
  "legumes", "animalFats", "plantOilsNutsSeeds",
] as const;

export const Step7Schema = z.object({
  dietType: z.string().max(500).optional(),
  isVegetarian: z.boolean().default(false),
  monitorsNutrients: z.boolean().default(false),
  productFrequency: z.record(z.string(), FrequencyEnum).default({}),
  waterPerDay: z.string().max(100).optional(),
  coffeeCups: z.string().max(100).optional(),
  caffeineDrinks: z.string().max(200).optional(),
  cocoaHotChocolate: z.string().max(200).optional(),
  herbalTea: z.string().max(200).optional(),
  alcoholFrequency: z.string().max(200).optional(),
  sweetCravings: IntensityEnum,
  flourCravings: IntensityEnum,
  saltySpicyCravings: IntensityEnum,
  nightEating: z.enum(["no", "sometimes", "often"]),
  vegetablesPerDay: z.enum(["<250", "250-500", ">500"]),
  fruitsPerDay: z.enum(["<150", "150-350", ">350"]),
  greensFrequency: z.enum(["daily", "weekly", "rarely"]),
  cookingOils: z.string().max(500).optional(),
});
export type Step7Answers = z.infer<typeof Step7Schema>;

// ── Step 8: Symptoms & Goals ──────────────────────────────────

export const SYMPTOMS = [
  "muscleCramps", "muscleTwitches", "tinglingNumbness", "tongueChanges",
  "mouthCornerCracks", "easyBruising", "bleedingGums", "slowWoundHealing",
  "dryRoughSkin", "hairLossThinning", "brittleNails", "severeFatigue",
  "shortnessOfBreath", "palenessColdExtremities", "picaCravings", "frequentColds",
  "bonesMusclesPain", "poorNightVision", "dryEyes", "drySkinCracks",
  "irritabilityMoodSwings", "sleepDisturbances", "brainFog", "appetiteChanges",
  "muscleWeakness", "jointPain", "restlessLegs", "tasteSmellDecrease",
  "follicularRashes", "daytimeSleepiness",
] as const;

export const Step8Schema = z.object({
  symptoms: z.record(z.string(), FrequencyEnum).default({}),
  goals: z.string().max(2000).optional(),
  readinessToChange: ReadinessEnum,
  consentPersonalData: z.boolean().refine((v) => v === true, {
    message: "Требуется согласие",
  }),
  confirmAccuracy: z.boolean().refine((v) => v === true, {
    message: "Требуется подтверждение",
  }),
});
export type Step8Answers = z.infer<typeof Step8Schema>;

// ── Aggregate ─────────────────────────────────────────────────

export const FullAnswersSchema = z.object({
  step1: Step1Schema.optional(),
  step2: Step2Schema.optional(),
  step3: Step3Schema.optional(),
  step4: Step4Schema.optional(),
  step5: Step5Schema.optional(),
  step6: Step6Schema.optional(),
  step7: Step7Schema.optional(),
  step8: Step8Schema.optional(),
});
export type FullAnswers = z.infer<typeof FullAnswersSchema>;

// Strict version for completed submissions (all required)
export const CompletedAnswersSchema = z.object({
  step1: Step1Schema,
  step2: Step2Schema,
  step3: Step3Schema,
  step4: Step4Schema,
  step5: Step5Schema,
  step6: Step6Schema,
  step7: Step7Schema,
  step8: Step8Schema,
});
export type CompletedAnswers = z.infer<typeof CompletedAnswersSchema>;
