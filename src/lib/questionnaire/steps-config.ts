export interface StepConfig {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
}

export const TOTAL_STEPS = 9;

export const STEPS: StepConfig[] = [
  {
    id: 0,
    slug: "intro",
    title: "Введение",
    subtitle: "Зачем эта анкета и сколько займёт времени",
    estimatedMinutes: 0,
  },
  {
    id: 1,
    slug: "personal",
    title: "О себе",
    subtitle: "Базовые данные: возраст, пол, антропометрия",
    estimatedMinutes: 2,
  },
  {
    id: 2,
    slug: "lifestyle",
    title: "Образ жизни",
    subtitle: "Работа, активность, режим дня, сон, вода",
    estimatedMinutes: 3,
  },
  {
    id: 3,
    slug: "history",
    title: "Анамнез",
    subtitle: "Семейная история, хронические состояния",
    estimatedMinutes: 2,
  },
  {
    id: 4,
    slug: "systems",
    title: "Системы организма",
    subtitle: "Состояние по 10 системам",
    estimatedMinutes: 4,
  },
  {
    id: 5,
    slug: "stress-allergies",
    title: "Стресс и аллергии",
    subtitle: "Эмоции, стресс, аллергии",
    estimatedMinutes: 2,
  },
  {
    id: 6,
    slug: "medications",
    title: "Лекарства и БАД",
    subtitle: "Что принимаете и как часто",
    estimatedMinutes: 4,
  },
  {
    id: 7,
    slug: "nutrition",
    title: "Питание",
    subtitle: "Рацион, напитки, предпочтения",
    estimatedMinutes: 5,
  },
  {
    id: 8,
    slug: "symptoms-goals",
    title: "Симптомы и цели",
    subtitle: "30 состояний + ваши цели",
    estimatedMinutes: 3,
  },
];

export function getStepByIndex(index: number): StepConfig | undefined {
  return STEPS.find((s) => s.id === index);
}

export function getRemainingMinutes(currentStep: number): number {
  return STEPS.filter((s) => s.id > currentStep).reduce(
    (sum, s) => sum + s.estimatedMinutes,
    0
  );
}
