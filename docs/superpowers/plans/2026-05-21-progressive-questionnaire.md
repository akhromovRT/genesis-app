# Progressive Questionnaire (Quick Insights Interstitial) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** После шага 1 анкеты (антропометрия) показать пользователю интерстициал с мгновенно посчитанным ИМТ, индексом грации и оценкой риска по окружности талии — до того, как он берёт на себя обязательство пройти оставшиеся 7 шагов. Снимает критику Галины «холодная аудитория не пройдёт 10 страниц» и поднимает конверсию холодного трафика на questionnaire-воронке.

**Architecture:** Чистые клиентские расчёты в новом модуле `quick-insights.ts` + новый компонент-интерстициал + дополнительное состояние во wizard. Никаких изменений БД, сервера или схемы LocalStorage (только опциональное поле `calf` в Step1). Интерстициал — это режим внутри wizard, не дополнительный шаг (не ломает `TOTAL_STEPS` и навигацию).

**Tech Stack:** TypeScript 5, React 19, Zod v4, react-hook-form 7, Vitest 4, shadcn/ui, Tailwind 4.

---

## File Structure

**Create:**
- `src/lib/questionnaire/quick-insights.ts` — чистые функции: возраст по дате рождения, ИМТ + категория, индекс грации (если есть calf+hips), WHR, оценка риска по окружности талии (gender-specific).
- `src/lib/questionnaire/quick-insights.test.ts` — Vitest unit-тесты на все расчёты, включая граничные случаи.
- `src/components/questionnaire/steps/step-quick-insights.tsx` — UI интерстициала: 3–4 карточки с метриками, объяснение каждой, две кнопки CTA («Продолжить — узнать о биовозрасте» и «Сохранить промежуточный результат и закрыть»).

**Modify:**
- `src/lib/questionnaire/types.ts` — добавить опциональное поле `calf` (окружность голени) в `Step1Schema`.
- `src/components/questionnaire/steps/step-1-personal.tsx` — добавить input для `calf` в существующий grid.
- `src/components/questionnaire/wizard.tsx` — добавить состояние `showingInsights`, отображать интерстициал между шагами 1 и 2.

**Out of scope (явно):**
- Серверный квик-submit (промежуточное состояние живёт в LocalStorage; пользователь либо доходит до конца, либо нет).
- Аналитика / events (в проекте пока нет analytics-слоя).
- Изменения в `/api/questionnaire/*` и БД.
- Изменения раскраски/иконографики поверх существующего shadcn (используем стандартные `Card`, `Badge`).

---

## Task 1: Расширить Step1-схему опциональным полем `calf`

**Files:**
- Modify: `src/lib/questionnaire/types.ts` (схема `Step1Schema`)

- [ ] **Step 1: Добавить поле в схему**

В `src/lib/questionnaire/types.ts` блок `Step1Schema` (строки 17–26) изменить так, чтобы появилось опциональное поле `calf` (окружность голени, см), валидируемое теми же границами, что и waist/hips:

```typescript
export const Step1Schema = z.object({
  gender: z.enum(["m", "f", "other"]),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Формат: ГГГГ-ММ-ДД"),
  city: z.string().min(1, "Укажите город"),
  timezone: z.string().min(1, "Укажите часовой пояс"),
  height: z.number().min(100, "Мин. 100").max(250, "Макс. 250"),
  weight: z.number().min(30, "Мин. 30").max(300, "Макс. 300"),
  waist: z.number().min(40).max(200).optional(),
  hips: z.number().min(40).max(200).optional(),
  calf: z.number().min(20).max(80).optional(),
});
```

- [ ] **Step 2: Проверить, что TypeScript-компиляция проходит**

Run: `npx tsc --noEmit`
Expected: 0 ошибок. Поле опциональное → старые сохранённые сессии в LocalStorage парсятся без миграции.

- [ ] **Step 3: Коммит**

```bash
git add src/lib/questionnaire/types.ts
git commit -m "feat(questionnaire): add optional calf circumference to step 1"
```

---

## Task 2: Добавить input для `calf` в Step 1 формы

**Files:**
- Modify: `src/components/questionnaire/steps/step-1-personal.tsx` (grid с waist/hips, строки 76–95)

- [ ] **Step 1: Добавить четвёртый input в antropometry grid**

Заменить грид `<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">` (строки 76–95) на версию с дополнительным полем `calf`. Класс остаётся `grid-cols-2 sm:grid-cols-4` — теперь будет 5 полей; меняем на `sm:grid-cols-5` для широкого экрана и `grid-cols-2` для мобильного:

```tsx
<div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
  <div className="space-y-1.5">
    <Label htmlFor="height">Рост (см)</Label>
    <Input id="height" type="number" {...register("height", { valueAsNumber: true })} />
    {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
  </div>
  <div className="space-y-1.5">
    <Label htmlFor="weight">Вес (кг)</Label>
    <Input id="weight" type="number" step="0.1" {...register("weight", { valueAsNumber: true })} />
    {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
  </div>
  <div className="space-y-1.5">
    <Label htmlFor="waist">Талия (см)</Label>
    <Input id="waist" type="number" {...register("waist", { valueAsNumber: true })} />
  </div>
  <div className="space-y-1.5">
    <Label htmlFor="hips">Бёдра (см)</Label>
    <Input id="hips" type="number" {...register("hips", { valueAsNumber: true })} />
  </div>
  <div className="space-y-1.5">
    <Label htmlFor="calf">Голень (см)</Label>
    <Input id="calf" type="number" {...register("calf", { valueAsNumber: true })} />
  </div>
</div>
```

- [ ] **Step 2: Добавить hint-параграф под gridом**

Сразу после закрытия grid вставить параграф-подсказку, объясняющий, почему просим эти замеры — это часть «мгновенного результата» по обещанию Галины:

```tsx
<p className="text-xs text-muted-foreground">
  Талия, бёдра и голень нужны для мгновенного предварительного результата
  на следующем экране. Можно оставить пустыми — тогда покажем только ИМТ.
</p>
```

- [ ] **Step 3: Smoke-проверка через dev-сервер**

Run: `npm run dev`
Open: `http://localhost:3000/questionnaire/start`
Action: на шаге 1 заполнить все поля включая `calf`, нажать «Далее», вернуться через «Назад» — значение должно сохраниться (react-hook-form + LocalStorage).
Expected: пять полей видны в строку на десктопе, в 2 колонки на мобиле; значения сохраняются между переходами.

- [ ] **Step 4: Коммит**

```bash
git add src/components/questionnaire/steps/step-1-personal.tsx
git commit -m "feat(questionnaire): add calf input to step 1 personal"
```

---

## Task 3: Чистые функции расчётов (TDD)

**Files:**
- Test: `src/lib/questionnaire/quick-insights.test.ts`
- Create: `src/lib/questionnaire/quick-insights.ts`

- [ ] **Step 1: Написать failing-тесты для всех расчётов**

Создать `src/lib/questionnaire/quick-insights.test.ts` со следующим содержанием:

```typescript
import { describe, it, expect } from "vitest";
import {
  calculateAge,
  calculateBMI,
  calculateWHR,
  calculateWaistRisk,
  calculateIndexOfGrace,
  computeQuickInsights,
} from "./quick-insights";

describe("calculateAge", () => {
  it("returns whole years for a known birthdate before today's month/day", () => {
    expect(calculateAge("1990-01-01", new Date("2026-05-21"))).toBe(36);
  });
  it("subtracts one year when birthday hasn't happened this year", () => {
    expect(calculateAge("1990-12-31", new Date("2026-05-21"))).toBe(35);
  });
  it("handles birthday today as full year", () => {
    expect(calculateAge("1990-05-21", new Date("2026-05-21"))).toBe(36);
  });
});

describe("calculateBMI", () => {
  it("returns 'normal' for BMI 22", () => {
    const result = calculateBMI(70, 178);
    expect(result.value).toBeCloseTo(22.1, 1);
    expect(result.category).toBe("normal");
  });
  it("returns 'underweight' for BMI 17", () => {
    expect(calculateBMI(45, 162).category).toBe("underweight");
  });
  it("returns 'overweight' for BMI 27", () => {
    expect(calculateBMI(85, 178).category).toBe("overweight");
  });
  it("returns 'obese1' for BMI 32", () => {
    expect(calculateBMI(100, 178).category).toBe("obese1");
  });
  it("returns 'obese2' for BMI 37", () => {
    expect(calculateBMI(117, 178).category).toBe("obese2");
  });
  it("returns 'obese3' for BMI 41", () => {
    expect(calculateBMI(130, 178).category).toBe("obese3");
  });
});

describe("calculateWHR", () => {
  it("returns ratio with 2 decimals", () => {
    const r = calculateWHR(80, 100);
    expect(r?.value).toBeCloseTo(0.8, 2);
  });
  it("returns null if waist or hips missing", () => {
    expect(calculateWHR(undefined, 100)).toBeNull();
    expect(calculateWHR(80, undefined)).toBeNull();
  });
  it("flags 'low' risk for male WHR 0.85", () => {
    expect(calculateWHR(85, 100, "m")?.category).toBe("low");
  });
  it("flags 'moderate' risk for male WHR 0.95", () => {
    expect(calculateWHR(95, 100, "m")?.category).toBe("moderate");
  });
  it("flags 'high' risk for male WHR 1.05", () => {
    expect(calculateWHR(105, 100, "m")?.category).toBe("high");
  });
  it("flags 'low' risk for female WHR 0.75", () => {
    expect(calculateWHR(75, 100, "f")?.category).toBe("low");
  });
  it("flags 'high' risk for female WHR 0.90", () => {
    expect(calculateWHR(90, 100, "f")?.category).toBe("high");
  });
});

describe("calculateWaistRisk", () => {
  it("returns 'low' for male waist 90 cm", () => {
    expect(calculateWaistRisk(90, "m")?.category).toBe("low");
  });
  it("returns 'moderate' for male waist 96 cm", () => {
    expect(calculateWaistRisk(96, "m")?.category).toBe("moderate");
  });
  it("returns 'high' for male waist 105 cm", () => {
    expect(calculateWaistRisk(105, "m")?.category).toBe("high");
  });
  it("returns 'low' for female waist 75 cm", () => {
    expect(calculateWaistRisk(75, "f")?.category).toBe("low");
  });
  it("returns 'moderate' for female waist 82 cm", () => {
    expect(calculateWaistRisk(82, "f")?.category).toBe("moderate");
  });
  it("returns 'high' for female waist 90 cm", () => {
    expect(calculateWaistRisk(90, "f")?.category).toBe("high");
  });
  it("returns null when waist missing", () => {
    expect(calculateWaistRisk(undefined, "f")).toBeNull();
  });
});

describe("calculateIndexOfGrace", () => {
  it("returns calf/hips * 100", () => {
    const r = calculateIndexOfGrace(36, 95);
    expect(r?.value).toBeCloseTo(37.9, 1);
  });
  it("returns null if calf or hips missing", () => {
    expect(calculateIndexOfGrace(undefined, 95)).toBeNull();
    expect(calculateIndexOfGrace(36, undefined)).toBeNull();
  });
  it("flags 'harmonious' when 33-38", () => {
    expect(calculateIndexOfGrace(35, 95)?.category).toBe("harmonious");
  });
  it("flags 'thin' when <33", () => {
    expect(calculateIndexOfGrace(28, 95)?.category).toBe("thin");
  });
  it("flags 'dense' when >38", () => {
    expect(calculateIndexOfGrace(42, 95)?.category).toBe("dense");
  });
});

describe("computeQuickInsights", () => {
  it("aggregates all metrics from a complete Step1Answers", () => {
    const insights = computeQuickInsights(
      {
        gender: "m",
        birthDate: "1990-01-01",
        city: "Moscow",
        timezone: "Europe/Moscow",
        height: 178,
        weight: 75,
        waist: 88,
        hips: 100,
        calf: 38,
      },
      new Date("2026-05-21"),
    );
    expect(insights.age).toBe(36);
    expect(insights.bmi?.category).toBe("normal");
    expect(insights.whr?.category).toBe("low");
    expect(insights.waistRisk?.category).toBe("low");
    expect(insights.indexOfGrace?.category).toBe("harmonious");
  });
  it("returns null fields when optional measurements are missing", () => {
    const insights = computeQuickInsights(
      {
        gender: "f",
        birthDate: "1990-01-01",
        city: "Moscow",
        timezone: "Europe/Moscow",
        height: 165,
        weight: 60,
      },
      new Date("2026-05-21"),
    );
    expect(insights.bmi).not.toBeNull();
    expect(insights.whr).toBeNull();
    expect(insights.waistRisk).toBeNull();
    expect(insights.indexOfGrace).toBeNull();
  });
});
```

- [ ] **Step 2: Запустить тесты и убедиться, что они падают**

Run: `npx vitest run src/lib/questionnaire/quick-insights.test.ts`
Expected: FAIL — "Cannot find module './quick-insights'" или похожее.

- [ ] **Step 3: Реализовать минимальный код**

Создать `src/lib/questionnaire/quick-insights.ts`:

```typescript
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
  // WHO thresholds: men >=0.90 моderate, >=1.0 high; women >=0.80 moderate, >=0.85 high
  if (gender === "m") {
    if (value >= 1.0) category = "high";
    else if (value >= 0.9) category = "moderate";
  } else if (gender === "f") {
    if (value >= 0.85) category = "high";
    else if (value >= 0.8) category = "moderate";
  } else {
    // unspecified — use stricter (female) thresholds
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
  // WHO/IDF: men >=94 moderate, >=102 high; women >=80 moderate, >=88 high
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
```

- [ ] **Step 4: Запустить тесты и убедиться, что все проходят**

Run: `npx vitest run src/lib/questionnaire/quick-insights.test.ts`
Expected: PASS — все ~25 ассертов зелёные.

- [ ] **Step 5: Коммит**

```bash
git add src/lib/questionnaire/quick-insights.ts src/lib/questionnaire/quick-insights.test.ts
git commit -m "feat(questionnaire): add quick-insights compute module (BMI, WHR, waist risk, index of grace)"
```

---

## Task 4: UI-компонент интерстициала

**Files:**
- Create: `src/components/questionnaire/steps/step-quick-insights.tsx`

- [ ] **Step 1: Написать компонент**

Создать `src/components/questionnaire/steps/step-quick-insights.tsx`:

```tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Step1Answers } from "@/lib/questionnaire/types";
import {
  computeQuickInsights,
  type RiskCategory,
  type GraceCategory,
  type BMICategory,
} from "@/lib/questionnaire/quick-insights";

interface Props {
  step1: Step1Answers;
  onContinue: () => void;
  onBack: () => void;
}

const RISK_VARIANT: Record<RiskCategory, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  moderate: "default",
  high: "destructive",
};

const BMI_VARIANT: Record<BMICategory, "default" | "secondary" | "destructive"> = {
  underweight: "default",
  normal: "secondary",
  overweight: "default",
  obese1: "destructive",
  obese2: "destructive",
  obese3: "destructive",
};

const GRACE_VARIANT: Record<GraceCategory, "secondary" | "default"> = {
  thin: "default",
  harmonious: "secondary",
  dense: "default",
};

export function StepQuickInsights({ step1, onContinue, onBack }: Props) {
  const insights = computeQuickInsights(step1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш мгновенный результат</CardTitle>
        <p className="text-sm text-muted-foreground">
          Это предварительный срез по антропометрии. Чтобы узнать биологический
          возраст и получить персональные подсветки — продолжите анкету.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Возраст</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{insights.age} лет</div>
            </CardContent>
          </Card>

          {insights.bmi && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Индекс массы тела
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{insights.bmi.value}</div>
                <Badge variant={BMI_VARIANT[insights.bmi.category]} className="mt-1">
                  {insights.bmi.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.waistRisk && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Окружность талии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {insights.waistRisk.value} см
                </div>
                <Badge
                  variant={RISK_VARIANT[insights.waistRisk.category]}
                  className="mt-1"
                >
                  {insights.waistRisk.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.whr && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Соотношение талия/бёдра (WHR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{insights.whr.value}</div>
                <Badge variant={RISK_VARIANT[insights.whr.category]} className="mt-1">
                  {insights.whr.label}
                </Badge>
              </CardContent>
            </Card>
          )}

          {insights.indexOfGrace && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Индекс грации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {insights.indexOfGrace.value}
                </div>
                <Badge
                  variant={GRACE_VARIANT[insights.indexOfGrace.category]}
                  className="mt-1"
                >
                  {insights.indexOfGrace.label}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
          Эти показатели — субъективные ориентиры. Они не являются медицинским
          диагнозом. Полный персональный отчёт с дефицитами нутриентов, фарм-нагрузкой
          и образом жизни доступен после прохождения всей анкеты (~20 минут).
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Назад
          </Button>
          <Button type="button" onClick={onContinue}>
            Продолжить — узнать о биовозрасте
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Проверить TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Коммит**

```bash
git add src/components/questionnaire/steps/step-quick-insights.tsx
git commit -m "feat(questionnaire): add quick-insights interstitial component"
```

---

## Task 5: Подключить интерстициал в wizard

**Files:**
- Modify: `src/components/questionnaire/wizard.tsx`

- [ ] **Step 1: Добавить состояние и логику отображения**

Открыть `src/components/questionnaire/wizard.tsx`. Внести три изменения:

**(а) Импорт нового компонента** — добавить в шапку рядом с прочими импортами шагов:

```typescript
import { StepQuickInsights } from "./steps/step-quick-insights";
```

**(б) Состояние `showingInsights`** — после `const [loaded, setLoaded] = useState(false);` (строка 32) добавить:

```typescript
const [showingInsights, setShowingInsights] = useState(false);
```

**(в) Перехват перехода со шага 1 → 2** — изменить функцию `goNext` (строки 52–57). После шага 1 при наличии валидного `answers.step1` показываем интерстициал вместо инкремента. Заменить на:

```typescript
function goNext() {
  if (currentStep === 1 && answers.step1 && !showingInsights) {
    setShowingInsights(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (currentStep < TOTAL_STEPS - 1) {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
```

**(г) Возврат с интерстициала** — изменить `goBack`:

```typescript
function goBack() {
  if (showingInsights) {
    setShowingInsights(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
```

**(д) Функция «продолжить с интерстициала на шаг 2»** — добавить рядом с `goNext`:

```typescript
function continueFromInsights() {
  setShowingInsights(false);
  setCurrentStep(2);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
```

**(е) Рендер интерстициала** — в JSX (строки 104–129) заменить блок-разводку шагов так, чтобы при `showingInsights` рисовался интерстициал вместо обычного шага. Полная замена внутреннего `<div className="mx-auto max-w-3xl px-4 py-8">`:

```tsx
<div className="mx-auto max-w-3xl px-4 py-8">
  {currentStep > 0 && !showingInsights && (
    <div className="mb-4 flex justify-between text-sm">
      <button
        type="button"
        onClick={startOver}
        className="text-muted-foreground hover:text-foreground underline"
      >
        Начать заново
      </button>
      <button
        type="button"
        onClick={saveAndExit}
        className="text-muted-foreground hover:text-foreground underline"
      >
        Сохранить и выйти
      </button>
    </div>
  )}

  {showingInsights && answers.step1 ? (
    <StepQuickInsights
      step1={answers.step1}
      onContinue={continueFromInsights}
      onBack={goBack}
    />
  ) : (
    <>
      {currentStep === 0 && <Step0Intro onNext={goNext} />}
      {currentStep === 1 && <Step1Personal value={answers.step1} onChange={(v) => updateStep("step1", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 2 && <Step2Lifestyle value={answers.step2} onChange={(v) => updateStep("step2", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 3 && <Step3History value={answers.step3} onChange={(v) => updateStep("step3", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 4 && <Step4Systems value={answers.step4} onChange={(v) => updateStep("step4", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 5 && <Step5StressAllergies value={answers.step5} onChange={(v) => updateStep("step5", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 6 && <Step6Medications value={answers.step6} onChange={(v) => updateStep("step6", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 7 && <Step7Nutrition value={answers.step7} onChange={(v) => updateStep("step7", v)} onNext={goNext} onBack={goBack} />}
      {currentStep === 8 && <Step8SymptomsGoals value={answers.step8} onChange={(v) => updateStep("step8", v)} onNext={submitFinal} onBack={goBack} />}
    </>
  )}
</div>
```

- [ ] **Step 2: Проверить TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Прогнать существующие тесты на регрессии**

Run: `npx vitest run`
Expected: PASS — старые тесты `highlights.test.ts`, `types.test.ts` остаются зелёными; новые `quick-insights.test.ts` тоже зелёные.

- [ ] **Step 4: Smoke-тест через dev-сервер**

Run: `npm run dev`
Open: `http://localhost:3000/questionnaire/start`

Сценарий 1 (полные данные):
1. Шаг 0 (Введение) → «Далее».
2. Шаг 1 (О себе) — заполнить gender, birthDate, city, timezone, height, weight, waist, hips, calf → «Далее».
3. Ожидать интерстициал с 5 карточками: Возраст / ИМТ / Окружность талии / WHR / Индекс грации.
4. Кнопка «Назад» возвращает на форму шага 1 с сохранёнными значениями.
5. Кнопка «Продолжить — узнать о биовозрасте» переводит на шаг 2 (Образ жизни).
6. Завершить всю анкету до конца, отправить, убедиться, что result-страница работает как раньше.

Сценарий 2 (минимум):
1. Шаг 1: только gender, birthDate, city, timezone, height, weight (waist/hips/calf пустые) → «Далее».
2. Ожидать интерстициал с только 2 карточками: Возраст и ИМТ. WHR / Waist / Индекс грации не рендерятся.

Сценарий 3 (LocalStorage-восстановление):
1. На интерстициале закрыть вкладку.
2. Открыть снова `/questionnaire/start` — пользователь должен оказаться на шаге 1 (поскольку `showingInsights` не персистится — это OK, шаг 1 заполнен, можно сразу нажать «Далее»).

Expected: все сценарии работают; на интерстициале без waist/hips/calf не падает; навигация туда-обратно сохраняет введённые значения.

- [ ] **Step 5: Коммит**

```bash
git add src/components/questionnaire/wizard.tsx
git commit -m "feat(questionnaire): wire quick-insights interstitial into wizard between steps 1 and 2"
```

---

## Task 6: Обновить лендинг анкеты под новое обещание

**Files:**
- Modify: `src/app/(public)/questionnaire/page.tsx` (если существует — нужно проверить)

- [ ] **Step 1: Найти и обновить hero/CTA на лендинге**

Run: `find "src/app/(public)/questionnaire" -name "page.tsx" -not -path "*/start/*" -not -path "*/result/*"`
Expected: один файл, путь будет получен из вывода. Прочитать этот файл.

В нём найти hero-блок или подзаголовок типа «9 шагов, ~25 минут». Заменить формулировку так, чтобы первое предложение обещало мгновенный результат:

```tsx
<p className="text-lg text-muted-foreground">
  Заполните 1 экран и получите мгновенный антропометрический срез — ИМТ,
  окружность талии, индекс грации. По желанию — продолжите анкету и
  узнайте биологический возраст, дефициты нутриентов и подсветки по
  фарм-нагрузке (~20 минут).
</p>
```

Точный JSX зависит от текущего файла — менять надо консервативно (только текст и subtitle, не структуру).

- [ ] **Step 2: Smoke-тест**

Open: `http://localhost:3000/questionnaire`
Expected: новый текст виден на лендинге; кнопка «Начать анкету» по-прежнему ведёт на `/questionnaire/start`.

- [ ] **Step 3: Коммит**

```bash
git add "src/app/(public)/questionnaire/page.tsx"
git commit -m "feat(questionnaire): update landing copy to promise instant first-screen result"
```

---

## Task 7: Запись в `agent_docs/development-history.md`

**Files:**
- Modify: `agent_docs/development-history.md`

- [ ] **Step 1: Добавить запись и перенести старейшую в архив**

Открыть `agent_docs/development-history.md`. Сверху раздела «## Записи» (после строки `## Записи`) вставить новую запись:

```markdown
### 2026-05-21 — Прогрессивная анкета: квик-инсайты после шага 1

- **Что сделано:** Между шагом 1 (антропометрия) и шагом 2 (образ жизни) добавлен экран-интерстициал с мгновенно посчитанным ИМТ, WHR, оценкой риска по окружности талии и индексом грации.
- **Зачем:** Снимает критику Галины «холодная аудитория не пройдёт 10 страниц анкеты»; даёт пользователю быстрый micro-reward и снижает порог входа.
- **Реализация:**
  - `src/lib/questionnaire/quick-insights.ts` — чистые расчёты (age, BMI, WHR, waistRisk, indexOfGrace) + `computeQuickInsights` aggregator. Unit-тесты в `quick-insights.test.ts`.
  - `src/components/questionnaire/steps/step-quick-insights.tsx` — UI на shadcn `Card`/`Badge`.
  - `src/components/questionnaire/wizard.tsx` — состояние `showingInsights`, перехват `goNext` после шага 1, возврат через `goBack`.
  - `src/lib/questionnaire/types.ts` — опциональное поле `calf` в Step1Schema.
  - `src/components/questionnaire/steps/step-1-personal.tsx` — input для голени + хинт под grid.
- **Не сделано (явно):** серверный квик-submit не вводился — промежуточный результат живёт в LocalStorage; пользователь либо завершает анкету полностью, либо нет. Аналитики событий нет.
- **План:** `docs/superpowers/plans/2026-05-21-progressive-questionnaire.md`
```

Если в файле уже 10 записей — перенести самую старую (нижнюю) в `agent_docs/development-history-archive.md` согласно правилу из шапки.

- [ ] **Step 2: Проверить, что markdown валиден (открыть в редакторе) и коммит**

```bash
git add agent_docs/development-history.md agent_docs/development-history-archive.md 2>/dev/null
git commit -m "docs: log progressive questionnaire iteration"
```

---

## Self-review checklist (выполняется тем, кто пишет план, перед сдачей)

- [x] Все 7 задач имеют конкретные файлы, точные коммиты и проверяемые expected-результаты.
- [x] Нет «TODO», «later», «similar to» — весь код приведён полностью.
- [x] Имена функций (`computeQuickInsights`, `calculateBMI` и т.д.) консистентны между tests, реализацией и компонентом.
- [x] LocalStorage-совместимость сохранена: новое поле `calf` опциональное, старые сессии парсятся.
- [x] Серверные/БД-изменения не требуются — план самодостаточен на фронте.
- [x] Покрытие критики из хроники (B1 из мастер-роадмапа): «прогрессивная анкета» → реализована именно так, как описано в брифе.
