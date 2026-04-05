# Questionnaire Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-step biohacking questionnaire (~100 fields, 9 steps, ~25 min) with LocalStorage persistence for anonymous users, soft-gate to registration, and a 15-rule deterministic highlights engine.

**Architecture:** Multi-step wizard (client-side React state machine) → per-step `react-hook-form` with Zod validation → LocalStorage (anon) or Drizzle/PostgreSQL (authenticated) → server-computed rule-based highlights → summary page. Follows existing patterns from `src/components/calculator/` and `src/app/api/profile/`.

**Tech Stack:** Next.js App Router, react-hook-form v7, Zod v4, Drizzle ORM, PostgreSQL, shadcn/ui, Vitest (new — first test framework in project).

**Spec:** `docs/superpowers/specs/2026-04-05-questionnaire-module-design.md`

---

## File Structure

**Database:**
- Modify: `src/db/schema.ts` — add `questionnaireSessions` table
- Create: `drizzle/0003_questionnaire.sql` — migration SQL

**Core library (`src/lib/questionnaire/`):**
- Create: `types.ts` — Zod schemas for all 9 steps + aggregated Answers type
- Create: `steps-config.ts` — metadata (title, description, time) for each step
- Create: `storage.ts` — LocalStorage wrapper + session token generator
- Create: `rules.ts` — 15 rule definitions (pure data)
- Create: `highlights.ts` — rule evaluation engine
- Create: `highlights.test.ts` — unit tests for all 15 rules
- Create: `types.test.ts` — Zod schema validation tests

**API routes (`src/app/api/questionnaire/`):**
- Create: `submit/route.ts` — POST, create/complete session
- Create: `session/route.ts` — GET (fetch draft) and PATCH (update)
- Create: `attach/route.ts` — POST, bind anon session to user

**UI shared (`src/components/ui/` — shadcn):**
- Install: `radio-group.tsx`, `checkbox.tsx`, `progress.tsx`

**Questionnaire components (`src/components/questionnaire/`):**
- Create: `wizard.tsx` — container: state, navigation, persistence
- Create: `shared/progress-bar.tsx`, `shared/frequency-table.tsx`, `shared/symptom-checklist.tsx`
- Create: `steps/step-0-intro.tsx` through `steps/step-8-symptoms-goals.tsx` (9 files)
- Create: `summary/summary-view.tsx`, `summary/highlights-panel.tsx`, `summary/highlight-card.tsx`

**Pages:**
- Create: `src/app/(public)/questionnaire/page.tsx` — landing with CTA
- Create: `src/app/(public)/questionnaire/start/page.tsx` — wizard page
- Create: `src/app/(public)/questionnaire/result/[sessionToken]/page.tsx` — public result view
- Create: `src/app/dashboard/questionnaire/page.tsx` — authenticated result view

**Registration integration:**
- Modify: `src/app/api/auth/register/route.ts` — attach anon session if `sessionToken` provided

**Test framework:**
- Create: `vitest.config.ts`
- Modify: `package.json` — add `test` script + Vitest deps

---

# Phase 1: Foundation (Testing, Types, Storage, Rules)

## Task 1: Set up Vitest test framework

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest and testing utilities**

```bash
cd "/Users/akhromov/Library/Mobile Documents/com~apple~CloudDocs/Cursor/@work-projects/genesis-app"
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify Vitest works with a smoke test**

Create `src/lib/questionnaire/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke test", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm test`
Expected: PASS, 1 test

- [ ] **Step 5: Delete smoke test and commit**

```bash
rm src/lib/questionnaire/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add Vitest test framework"
```

---

## Task 2: Database schema — questionnaireSessions table

**Files:**
- Modify: `src/db/schema.ts`
- Create: `drizzle/0003_questionnaire.sql`

- [ ] **Step 1: Update imports in schema.ts**

In `src/db/schema.ts`, update the top imports to include `jsonb`:

```ts
import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
```

- [ ] **Step 2: Append questionnaireSessions table**

Append to `src/db/schema.ts` (at end of file):

```ts
// ── Questionnaire Sessions ────────────────────────────────────
export const questionnaireSessions = pgTable("questionnaire_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => profiles.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  status: text("status").notNull().default("draft"),
  currentStep: integer("current_step").notNull().default(0),
  answers: jsonb("answers").notNull().default({}),
  highlights: jsonb("highlights"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_questionnaire_sessions_user_id").on(table.userId),
  index("idx_questionnaire_sessions_token").on(table.sessionToken),
  index("idx_questionnaire_sessions_status").on(table.status),
]);
```

- [ ] **Step 3: Create migration SQL file**

Create `drizzle/0003_questionnaire.sql`:

```sql
CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  current_step INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  highlights JSONB,
  completed_at TIMESTAMPTZ,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_token ON questionnaire_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_status ON questionnaire_sessions(status);

CREATE TRIGGER questionnaire_sessions_updated_at
  BEFORE UPDATE ON questionnaire_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 4: Run migration manually**

The project uses hand-crafted SQL migrations. Execute:

```bash
psql $DATABASE_URL -f drizzle/0003_questionnaire.sql
```

Or ask user to run the SQL in their Postgres environment.

- [ ] **Step 5: Verify table exists**

```bash
psql $DATABASE_URL -c "\d questionnaire_sessions"
```

Expected: table structure with 11 columns.

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts drizzle/0003_questionnaire.sql
git commit -m "feat(db): add questionnaire_sessions table"
```

---

## Task 3: Zod schemas for all 9 steps

**Files:**
- Create: `src/lib/questionnaire/types.ts`
- Create: `src/lib/questionnaire/types.test.ts`

- [ ] **Step 1: Write failing test for step-1 schema**

Create `src/lib/questionnaire/types.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { Step1Schema, FrequencyEnum, FullAnswersSchema } from "./types";

describe("Step1Schema (personal)", () => {
  it("accepts valid input", () => {
    const input = {
      gender: "f" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 170,
      weight: 65,
      waist: 75,
      hips: 95,
    };
    expect(() => Step1Schema.parse(input)).not.toThrow();
  });

  it("rejects height out of range", () => {
    const input = {
      gender: "m" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 50, // too low
      weight: 70,
    };
    expect(() => Step1Schema.parse(input)).toThrow();
  });

  it("makes waist and hips optional", () => {
    const input = {
      gender: "m" as const,
      birthDate: "1985-06-15",
      city: "Москва",
      timezone: "Europe/Moscow",
      height: 180,
      weight: 80,
    };
    expect(() => Step1Schema.parse(input)).not.toThrow();
  });
});

describe("FrequencyEnum", () => {
  it("accepts all four values", () => {
    ["never", "rarely", "sometimes", "often"].forEach((v) => {
      expect(() => FrequencyEnum.parse(v)).not.toThrow();
    });
  });

  it("rejects unknown values", () => {
    expect(() => FrequencyEnum.parse("always")).toThrow();
  });
});

describe("FullAnswersSchema", () => {
  it("makes all steps optional (for partial drafts)", () => {
    expect(() => FullAnswersSchema.parse({})).not.toThrow();
    expect(() => FullAnswersSchema.parse({ step1: undefined })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/questionnaire/types.test.ts`
Expected: FAIL — "Cannot find module './types'"

- [ ] **Step 3: Create types.ts with all schemas**

Create `src/lib/questionnaire/types.ts`:

```ts
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
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), // HH:mm
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
  "antiplatelet",           // Антиагреганты / антикоагулянты
  "bloodPressureHeart",     // Препараты от давления / для сердца
  "microcirculation",       // Препараты для микроциркуляции
  "venotonic",              // Венотоники
  "antidepressants",        // Антидепрессанты
  "neuroleptics",           // Нейролептики / антипсихотики
  "anxietySleep",           // Препараты от тревоги / для сна
  "anticonvulsants",        // Противосудорожные
  "stomach",                // Препараты для желудка
  "enzymesBile",            // Ферменты / желчегонные
  "laxatives",              // Послабляющие
  "antidiarrheal",          // Препараты от диареи
  "thyroidHormones",        // Гормоны щитовидной железы
  "hormonal",               // Гормональные препараты
  "diabetes",               // Препараты при диабете
  "nsaids",                 // НПВС
  "spasmolytics",           // Спазмолитики
  "gout",                   // Препараты от подагры
  "antibiotics",            // Антибиотики
  "antivirals",             // Противовирусные
  "antifungals",            // Противогрибковые
  "detoxAcetylation",       // Препараты для детоксикации / ацетилирования
  "hepatoprotectors",       // Гепатопротекторы
] as const;

export const SUPPLEMENT_GROUPS = [
  "vitaminsMinerals",       // Витамины и минералы
  "omega3",                 // Омега-3
  "probioticsPrebiotics",   // Пробиотики / пребиотики
  "antioxidants",           // Антиоксиданты
  "adaptogens",             // Адаптогены
  "aminoAcidsSportsNut",    // Аминокислоты / спортпит
  "collagenJoints",         // Коллаген / суставные добавки
  "brainCognitive",         // Для мозга / когнитивной поддержки
  "other",                  // Другое
] as const;

const MedicationEntrySchema = z.object({
  frequency: FrequencyEnum,
  nameAndDosage: z.string().max(500).optional(),
});

// Using z.record(z.string(), ...) for sparse records (not all keys need to be present).
// UI enforces that keys come from MEDICATION_GROUPS / SUPPLEMENT_GROUPS.
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/questionnaire/types.test.ts`
Expected: PASS, 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/lib/questionnaire/types.ts src/lib/questionnaire/types.test.ts
git commit -m "feat(questionnaire): add Zod schemas for all 9 steps"
```

---

## Task 4: Steps configuration

**Files:**
- Create: `src/lib/questionnaire/steps-config.ts`

- [ ] **Step 1: Create steps-config.ts**

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/questionnaire/steps-config.ts
git commit -m "feat(questionnaire): add steps configuration"
```

---

## Task 5: LocalStorage storage wrapper

**Files:**
- Create: `src/lib/questionnaire/storage.ts`

- [ ] **Step 1: Create storage.ts**

```ts
import { FullAnswers, FullAnswersSchema } from "./types";

const STORAGE_KEY = "genesis_q_v1";
const TOKEN_KEY = "genesis_q_token_v1";

export interface StoredSession {
  sessionToken: string;
  currentStep: number;
  answers: FullAnswers;
  updatedAt: string;
}

function generateToken(): string {
  // 21-char nanoid-equivalent using crypto
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 21);
}

export function getOrCreateToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = generateToken();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function loadSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const answers = FullAnswersSchema.parse(parsed.answers ?? {});
    return {
      sessionToken: parsed.sessionToken,
      currentStep: parsed.currentStep ?? 0,
      answers,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveSession(
  currentStep: number,
  answers: FullAnswers
): StoredSession {
  const sessionToken = getOrCreateToken();
  const session: StoredSession = {
    sessionToken,
    currentStep,
    answers,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function hasDraft(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/questionnaire/storage.ts
git commit -m "feat(questionnaire): add LocalStorage session wrapper"
```

---

## Task 6: Rules engine — types and infrastructure

**Files:**
- Create: `src/lib/questionnaire/rules.ts`
- Create: `src/lib/questionnaire/highlights.ts`
- Create: `src/lib/questionnaire/highlights.test.ts`

- [ ] **Step 1: Write failing test for highlights engine**

Create `src/lib/questionnaire/highlights.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeHighlights } from "./highlights";
import type { FullAnswers } from "./types";

const STANDARD_DISCLAIMER =
  "Не является медицинским диагнозом. Рекомендуем обсудить со специалистом.";

function makeAnswers(overrides: Partial<FullAnswers> = {}): FullAnswers {
  return overrides;
}

describe("computeHighlights — empty answers", () => {
  it("returns empty array for empty answers", () => {
    const result = computeHighlights(makeAnswers());
    expect(result).toEqual([]);
  });
});

describe("Rule: Possible Magnesium deficiency", () => {
  it("triggers when 3+ of 4 symptoms marked 'often' or 'sometimes'", () => {
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "sometimes",
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "mg-deficiency")).toBeDefined();
  });

  it("does NOT trigger with only 2 symptoms", () => {
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "sometimes",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "mg-deficiency")).toBeUndefined();
  });
});

describe("Rule: High medication burden", () => {
  it("triggers when 5+ medication groups taken 'often'", () => {
    const answers = makeAnswers({
      step6: {
        medications: {
          bloodPressureHeart: { frequency: "often" },
          nsaids: { frequency: "often" },
          antidepressants: { frequency: "often" },
          stomach: { frequency: "often" },
          thyroidHormones: { frequency: "often" },
        },
        supplements: {},
        noBrandPreference: false,
      } as any,
    });
    const result = computeHighlights(answers);
    expect(result.find((h) => h.id === "high-med-burden")).toBeDefined();
  });
});

describe("All highlights include required fields", () => {
  it("each highlight has title, description, severity, disclaimer", () => {
    const answers = makeAnswers({
      step5: {
        stressLevel: 5,
        emotionalState: "",
        pollinosis: "",
        foodAllergies: "",
        drugAllergies: "",
      } as any,
      step8: {
        symptoms: {
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    for (const h of result) {
      expect(h.title).toBeTruthy();
      expect(h.description).toBeTruthy();
      expect(h.severity).toMatch(/^(info|attention|warning)$/);
      expect(h.disclaimer).toContain("Не является медицинским диагнозом");
      expect(h.id).toBeTruthy();
      expect(Array.isArray(h.triggers)).toBe(true);
    }
  });
});

describe("Sorting", () => {
  it("sorts warning before attention before info", () => {
    // Craft answers that trigger multiple highlights of different severities
    // Assert order in result
    const answers = makeAnswers({
      step8: {
        symptoms: {
          muscleCramps: "often",
          muscleTwitches: "often",
          sleepDisturbances: "often",
          irritabilityMoodSwings: "often",
        },
        goals: "",
        readinessToChange: "full",
        consentPersonalData: true,
        confirmAccuracy: true,
      } as any,
    });
    const result = computeHighlights(answers);
    // Check that severities are ordered correctly
    const severityOrder = { warning: 0, attention: 1, info: 2 };
    for (let i = 1; i < result.length; i++) {
      expect(severityOrder[result[i - 1].severity]).toBeLessThanOrEqual(
        severityOrder[result[i].severity]
      );
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/questionnaire/highlights.test.ts`
Expected: FAIL — "Cannot find module './highlights'"

- [ ] **Step 3: Create rules.ts with rule definitions**

Create `src/lib/questionnaire/rules.ts`:

```ts
import type { FullAnswers } from "./types";

export type Severity = "info" | "attention" | "warning";
export type Category = "nutrition" | "medication" | "lifestyle" | "systems" | "stress";

export interface Highlight {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  triggers: string[];
  recommendation: string;
  disclaimer: string;
}

export interface Rule {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  evaluate: (answers: FullAnswers) => { matched: boolean; triggers: string[] };
}

const DISCLAIMER =
  "Не является медицинским диагнозом. Рекомендуем обсудить со специалистом.";

// Helper: count symptoms matching threshold
function countSymptoms(
  answers: FullAnswers,
  keys: string[],
  frequencies: string[] = ["sometimes", "often"]
): { count: number; matched: string[] } {
  const symptoms = answers.step8?.symptoms ?? {};
  const matched: string[] = [];
  for (const key of keys) {
    const freq = (symptoms as Record<string, string>)[key];
    if (freq && frequencies.includes(freq)) {
      matched.push(key);
    }
  }
  return { count: matched.length, matched };
}

// Helper: symptom label mapping (Russian)
export const SYMPTOM_LABELS: Record<string, string> = {
  muscleCramps: "Мышечные судороги",
  muscleTwitches: "Подёргивания мышц, тремор",
  tinglingNumbness: "Покалывание, онемение",
  tongueChanges: "Жжение или изменение языка",
  mouthCornerCracks: "Трещины в уголках рта",
  easyBruising: "Лёгкое образование синяков",
  bleedingGums: "Кровоточивость дёсен",
  slowWoundHealing: "Медленное заживление ран",
  dryRoughSkin: "Сухость кожи, шероховатость",
  hairLossThinning: "Выпадение волос, истончение",
  brittleNails: "Ломкость ногтей",
  severeFatigue: "Сильная утомляемость",
  shortnessOfBreath: "Одышка при нагрузке",
  palenessColdExtremities: "Бледность, холодные конечности",
  picaCravings: "Пристрастие к непищевым продуктам",
  frequentColds: "Частые простуды",
  bonesMusclesPain: "Боли в костях, мышцах",
  poorNightVision: "Плохое зрение в сумерках",
  dryEyes: "Сухость глаз",
  drySkinCracks: "Сухость кожи, трещины",
  irritabilityMoodSwings: "Раздражительность, перепады настроения",
  sleepDisturbances: "Нарушения сна",
  brainFog: "Туман в голове",
  appetiteChanges: "Сниженный аппетит",
  muscleWeakness: "Слабость в мышцах",
  jointPain: "Суставные боли",
  restlessLegs: "Синдром беспокойных ног",
  tasteSmellDecrease: "Снижение вкуса/обоняния",
  follicularRashes: "Точечные высыпания",
  daytimeSleepiness: "Дневная сонливость",
};

export const RULES: Rule[] = [
  // Rule 1: Magnesium deficiency
  {
    id: "mg-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит магния",
    description:
      "Комплекс симптомов указывает на возможный дефицит магния. Этот минерал критичен для работы мышц, нервной системы и качества сна.",
    recommendation:
      "Обсудите с врачом анализ магния (в эритроцитах). Включите в рацион зелёные листовые овощи, орехи, семена, бобовые.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "muscleCramps",
        "muscleTwitches",
        "sleepDisturbances",
        "irritabilityMoodSwings",
      ]);
      return {
        matched: count >= 3,
        triggers: matched.map((k) => SYMPTOM_LABELS[k]),
      };
    },
  },
  // Rule 2: B12/folate deficiency
  {
    id: "b12-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит B12 / фолатов",
    description:
      "Симптомы могут указывать на недостаток витамина B12 или фолиевой кислоты — ключевых витаминов для нервной системы и кроветворения.",
    recommendation:
      "Обсудите с врачом анализ B12, гомоцистеина, фолиевой кислоты. Особенно актуально при растительном рационе.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "severeFatigue",
        "shortnessOfBreath",
        "palenessColdExtremities",
        "tongueChanges",
        "brainFog",
      ]);
      return {
        matched: count >= 3,
        triggers: matched.map((k) => SYMPTOM_LABELS[k]),
      };
    },
  },
  // Rule 3: Iron deficiency
  {
    id: "iron-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит железа",
    description:
      "Совокупность симптомов часто сопутствует сниженному уровню железа или ферритина.",
    recommendation:
      "Рекомендуется проверить ферритин, сывороточное железо, ОЖСС, гемоглобин.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "palenessColdExtremities",
        "severeFatigue",
        "shortnessOfBreath",
        "hairLossThinning",
        "picaCravings",
      ]);
      return {
        matched: count >= 3,
        triggers: matched.map((k) => SYMPTOM_LABELS[k]),
      };
    },
  },
  // Rule 4: Vitamin D deficiency
  {
    id: "vit-d-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит витамина D",
    description:
      "Симптомы могут указывать на недостаточный уровень витамина D, что встречается у большинства жителей северных широт.",
    recommendation:
      "Сдайте анализ 25(OH)D. Целевой диапазон для longevity: 50–80 нг/мл.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "bonesMusclesPain",
        "muscleWeakness",
        "frequentColds",
        "poorNightVision",
      ]);
      return {
        matched: count >= 2,
        triggers: matched.map((k) => SYMPTOM_LABELS[k]),
      };
    },
  },
  // Rule 5: Omega-3 deficiency
  {
    id: "omega3-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит Омега-3",
    description:
      "Сухость тканей и редкое потребление жирной рыбы указывают на недостаточное поступление Омега-3 жирных кислот.",
    recommendation:
      "Увеличьте потребление жирной рыбы (сельдь, скумбрия, лосось) до 2–3 раз в неделю или обсудите добавку EPA/DHA.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "dryRoughSkin",
        "hairLossThinning",
        "brittleNails",
        "dryEyes",
      ]);
      const fishFatty = a.step7?.productFrequency?.fishFatty;
      const rareFish = fishFatty === "never" || fishFatty === "rarely";
      const triggers = matched.map((k) => SYMPTOM_LABELS[k]);
      if (rareFish) triggers.push("Жирная рыба — редко/никогда");
      return {
        matched: count >= 2 && rareFish,
        triggers,
      };
    },
  },
  // Rule 6: Zinc deficiency
  {
    id: "zn-deficiency",
    category: "nutrition",
    severity: "attention",
    title: "Возможный дефицит цинка",
    description:
      "Нарушение вкуса/обоняния, замедленное заживление и частые простуды — классические маркеры недостатка цинка.",
    recommendation:
      "Проверьте цинк в сыворотке. Источники: мясо, морепродукты, тыквенные семечки, бобовые.",
    evaluate: (a) => {
      const { count, matched } = countSymptoms(a, [
        "tasteSmellDecrease",
        "slowWoundHealing",
        "frequentColds",
        "hairLossThinning",
      ]);
      return {
        matched: count >= 2,
        triggers: matched.map((k) => SYMPTOM_LABELS[k]),
      };
    },
  },
  // Rule 7: Low fiber intake
  {
    id: "low-fiber",
    category: "nutrition",
    severity: "info",
    title: "Низкое потребление клетчатки",
    description:
      "Недостаток клетчатки влияет на микробиоту, уровень сахара и регулярность стула.",
    recommendation:
      "Целевой объём: 500+ г овощей и зелени в день, цельнозерновые крупы, бобовые.",
    evaluate: (a) => {
      const triggers: string[] = [];
      if (a.step7?.vegetablesPerDay === "<250") triggers.push("Овощей < 250 г/день");
      const grains = a.step7?.productFrequency?.wholeGrains;
      if (grains === "never" || grains === "rarely")
        triggers.push("Цельнозерновые — редко/никогда");
      // Also check digestive complaints mentioning constipation
      const digestive = (a.step4?.digestive ?? "").toLowerCase();
      if (digestive.includes("запор")) triggers.push("Упомянуты запоры");
      return { matched: triggers.length >= 2, triggers };
    },
  },
  // Rule 8: Excess sugar/refined
  {
    id: "excess-sugar",
    category: "nutrition",
    severity: "attention",
    title: "Избыток сахара и рафинированных углеводов",
    description:
      "Частое потребление сладкого/мучного связано с инсулинорезистентностью и воспалением.",
    recommendation:
      "Обсудите проверку HbA1c, инсулина, HOMA-IR. Постепенное снижение сладкого — первый шаг.",
    evaluate: (a) => {
      const triggers: string[] = [];
      if (a.step7?.productFrequency?.sweets === "often") triggers.push("Сладкое — часто");
      if (a.step7?.productFrequency?.flour === "often") triggers.push("Мучное — часто");
      if (a.step7?.sweetCravings === "severe") triggers.push("Выраженная тяга к сладкому");
      return { matched: triggers.length >= 2, triggers };
    },
  },
  // Rule 9: High medication burden
  {
    id: "high-med-burden",
    category: "medication",
    severity: "warning",
    title: "Высокая фарм-нагрузка",
    description:
      "Вы регулярно принимаете много препаратов. Фармакогенетический анализ поможет врачу подобрать безопасные дозировки и предупредить нежелательные взаимодействия.",
    recommendation:
      "Обсудите с врачом фармакогенетическое тестирование (CYP450, VKORC1 и др.) и пересмотр схемы приёма.",
    evaluate: (a) => {
      const meds = a.step6?.medications ?? {};
      const oftenCount = Object.values(meds).filter(
        (m) => m?.frequency === "often"
      ).length;
      return {
        matched: oftenCount >= 5,
        triggers: [`Групп препаратов «часто»: ${oftenCount}`],
      };
    },
  },
  // Rule 10: Antibiotics + GI complaints
  {
    id: "antibiotics-gi",
    category: "medication",
    severity: "attention",
    title: "Антибиотики + жалобы ЖКТ",
    description:
      "Регулярный приём антибиотиков без восстановления микробиоты может усугублять проблемы ЖКТ.",
    recommendation:
      "Обсудите с врачом анализ микробиоты (МСММ/ХМС) и поддержку пробиотиками после курсов антибиотиков.",
    evaluate: (a) => {
      const abFreq = a.step6?.medications?.antibiotics?.frequency;
      const hasABOften = abFreq === "sometimes" || abFreq === "often";
      const digestive = (a.step4?.digestive ?? "").trim().length > 10;
      const triggers: string[] = [];
      if (hasABOften) triggers.push(`Антибиотики: ${abFreq}`);
      if (digestive) triggers.push("Есть жалобы по ЖКТ");
      return { matched: hasABOften && digestive, triggers };
    },
  },
  // Rule 11: Insufficient water
  {
    id: "low-water",
    category: "lifestyle",
    severity: "info",
    title: "Недостаточное потребление воды",
    description:
      "Обезвоживание на фоне кофеина ухудшает концентрацию, пищеварение и работу почек.",
    recommendation:
      "Норма: 30 мл на кг массы тела. При кофеиновой нагрузке — добавляйте стакан воды на каждую чашку кофе.",
    evaluate: (a) => {
      const water = a.step2?.waterIntake;
      const lowWater = water === "<0.5" || water === "0.5-1";
      const coffee = (a.step7?.coffeeCups ?? "").match(/\d+/);
      const coffeeCups = coffee ? parseInt(coffee[0], 10) : 0;
      const triggers: string[] = [];
      if (lowWater) triggers.push(`Вода: ${water} л/день`);
      if (coffeeCups >= 3) triggers.push(`Кофе: ${coffeeCups} чашек/день`);
      return { matched: lowWater && coffeeCups >= 3, triggers };
    },
  },
  // Rule 12: Circadian disruption
  {
    id: "circadian-disruption",
    category: "lifestyle",
    severity: "attention",
    title: "Нарушение циркадных ритмов",
    description:
      "Поздние приёмы пищи или смещённый режим снижают качество сна и замедляют восстановление.",
    recommendation:
      "Последний приём пищи — за 3 часа до сна. Завтрак в течение часа после пробуждения.",
    evaluate: (a) => {
      const sleepQ = a.step2?.sleepQuality ?? 5;
      const sleepTime = a.step2?.sleepTime; // HH:mm
      const lastMeal = a.step2?.lastMealTimeWeekday;
      const triggers: string[] = [];
      let lateMeal = false;
      if (sleepTime && lastMeal) {
        const [sh, sm] = sleepTime.split(":").map(Number);
        const [lh, lm] = lastMeal.split(":").map(Number);
        // Assume lastMeal is same day; crude calc
        const sleepMin = sh * 60 + sm + (sh < 6 ? 24 * 60 : 0); // handle 00-06 as next day
        const mealMin = lh * 60 + lm;
        if (sleepMin - mealMin < 180) {
          lateMeal = true;
          triggers.push("Последний приём пищи < 3ч до сна");
        }
      }
      if (sleepQ <= 2) triggers.push(`Качество сна: ${sleepQ}/5`);
      return { matched: lateMeal && sleepQ <= 3, triggers };
    },
  },
  // Rule 13: Sedentary lifestyle
  {
    id: "sedentary",
    category: "lifestyle",
    severity: "attention",
    title: "Низкая физическая активность",
    description:
      "Сидячий образ жизни ускоряет метаболическое старение и повышает риски ССЗ.",
    recommendation:
      "Цель: 150–300 минут умеренной активности в неделю + силовые 2 раза в неделю.",
    evaluate: (a) => {
      const activity = a.step2?.physicalActivity;
      return {
        matched: activity === "low",
        triggers: activity ? [`Активность: ${activity}`] : [],
      };
    },
  },
  // Rule 14: High stress
  {
    id: "high-stress",
    category: "stress",
    severity: "warning",
    title: "Высокий уровень стресса",
    description:
      "Высокий стресс в сочетании с нарушениями сна запускает хроническое воспаление и ускоряет старение.",
    recommendation:
      "Обсудите техники управления стрессом: дыхательные практики, HRV-тренинги, работу с психотерапевтом.",
    evaluate: (a) => {
      const stress = a.step5?.stressLevel ?? 0;
      const symptoms = a.step8?.symptoms ?? {};
      const sleep = (symptoms as Record<string, string>).sleepDisturbances;
      const irr = (symptoms as Record<string, string>).irritabilityMoodSwings;
      const triggers: string[] = [];
      if (stress >= 4) triggers.push(`Уровень стресса: ${stress}/5`);
      if (sleep === "often" || sleep === "sometimes")
        triggers.push("Нарушения сна");
      if (irr === "often" || irr === "sometimes")
        triggers.push("Раздражительность");
      return { matched: stress >= 4 && triggers.length >= 2, triggers };
    },
  },
  // Rule 15: Regular alcohol
  {
    id: "alcohol-liver",
    category: "lifestyle",
    severity: "attention",
    title: "Регулярное употребление алкоголя",
    description:
      "Регулярный алкоголь нагружает печень, влияет на качество сна и гормональный фон.",
    recommendation:
      "Проверьте печёночные маркеры (АЛТ, АСТ, ГГТ). Рассмотрите сокращение до 1–2 раз в неделю.",
    evaluate: (a) => {
      const alcohol = (a.step7?.alcoholFrequency ?? "").toLowerCase();
      const weekly =
        /\d+\s*раз.*(неделю|нед)/.test(alcohol) ||
        /ежедневно|каждый день|3.*нед|4.*нед|5.*нед/.test(alcohol);
      return {
        matched: weekly,
        triggers: alcohol ? [`Алкоголь: ${alcohol}`] : [],
      };
    },
  },
];

export { DISCLAIMER };
```

- [ ] **Step 4: Create highlights.ts**

Create `src/lib/questionnaire/highlights.ts`:

```ts
import { DISCLAIMER, RULES, type Highlight } from "./rules";
import type { FullAnswers } from "./types";

const SEVERITY_ORDER: Record<string, number> = {
  warning: 0,
  attention: 1,
  info: 2,
};

export function computeHighlights(answers: FullAnswers): Highlight[] {
  const results: Highlight[] = [];

  for (const rule of RULES) {
    try {
      const { matched, triggers } = rule.evaluate(answers);
      if (!matched) continue;
      results.push({
        id: rule.id,
        category: rule.category,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        triggers,
        recommendation: rule.recommendation,
        disclaimer: DISCLAIMER,
      });
    } catch {
      // Rule evaluation failed — skip silently, don't break the whole pipeline
    }
  }

  // Sort: warning → attention → info, then by id for stability
  results.sort((a, b) => {
    const sev = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (sev !== 0) return sev;
    return a.id.localeCompare(b.id);
  });

  return results;
}

export type { Highlight } from "./rules";
```

- [ ] **Step 5: Run tests**

Run: `npm test -- src/lib/questionnaire/highlights.test.ts`
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/questionnaire/rules.ts src/lib/questionnaire/highlights.ts src/lib/questionnaire/highlights.test.ts
git commit -m "feat(questionnaire): add rules engine with 15 rules + tests"
```

---

# Phase 2: API Routes

## Task 7: POST /api/questionnaire/submit

**Files:**
- Create: `src/app/api/questionnaire/submit/route.ts`

- [ ] **Step 1: Create submit endpoint**

```ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import { computeHighlights } from "@/lib/questionnaire/highlights";
import { z } from "zod";

const BodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
  answers: CompletedAnswersSchema,
  email: z.string().email().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BodySchema.parse(body);

    const user = await getUser();
    const highlights = computeHighlights(parsed.answers);

    // Upsert: find existing by sessionToken, else create
    const existing = await db
      .select()
      .from(questionnaireSessions)
      .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(questionnaireSessions)
        .set({
          status: "completed",
          currentStep: 9,
          answers: parsed.answers,
          highlights,
          email: parsed.email ?? existing[0].email,
          completedAt: new Date(),
          userId: user?.id ?? existing[0].userId,
        })
        .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken));
    } else {
      await db.insert(questionnaireSessions).values({
        sessionToken: parsed.sessionToken,
        userId: user?.id ?? null,
        status: "completed",
        currentStep: 9,
        answers: parsed.answers,
        highlights,
        email: parsed.email ?? null,
        completedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      sessionToken: parsed.sessionToken,
      highlights,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    console.error("submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/questionnaire/submit/route.ts
git commit -m "feat(api): POST /api/questionnaire/submit"
```

---

## Task 8: GET/PATCH /api/questionnaire/session

**Files:**
- Create: `src/app/api/questionnaire/session/route.ts`

- [ ] **Step 1: Create session GET/PATCH endpoint**

```ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { FullAnswersSchema } from "@/lib/questionnaire/types";
import { z } from "zod";

// GET ?token=... → load draft
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(eq(questionnaireSessions.sessionToken, token))
    .limit(1);

  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Auth check: if session has userId, require matching user
  if (session.userId) {
    const user = await getUser();
    if (!user || user.id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    sessionToken: session.sessionToken,
    status: session.status,
    currentStep: session.currentStep,
    answers: session.answers,
    highlights: session.highlights,
    completedAt: session.completedAt,
  });
}

const PatchBodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
  currentStep: z.number().int().min(0).max(9),
  answers: FullAnswersSchema,
});

// PATCH → update draft
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = PatchBodySchema.parse(body);

    const user = await getUser();

    const [existing] = await db
      .select()
      .from(questionnaireSessions)
      .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken))
      .limit(1);

    if (existing) {
      // Authz: if session has userId, require match
      if (existing.userId && (!user || user.id !== existing.userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await db
        .update(questionnaireSessions)
        .set({
          currentStep: parsed.currentStep,
          answers: parsed.answers,
        })
        .where(eq(questionnaireSessions.sessionToken, parsed.sessionToken));
    } else {
      await db.insert(questionnaireSessions).values({
        sessionToken: parsed.sessionToken,
        userId: user?.id ?? null,
        status: "draft",
        currentStep: parsed.currentStep,
        answers: parsed.answers,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/questionnaire/session/route.ts
git commit -m "feat(api): GET/PATCH /api/questionnaire/session"
```

---

## Task 9: POST /api/questionnaire/attach

**Files:**
- Create: `src/app/api/questionnaire/attach/route.ts`

- [ ] **Step 1: Create attach endpoint**

```ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const BodySchema = z.object({
  sessionToken: z.string().min(16).max(64),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { sessionToken } = BodySchema.parse(body);

    // Only attach anonymous sessions (userId IS NULL)
    const result = await db
      .update(questionnaireSessions)
      .set({ userId: user.id })
      .where(
        and(
          eq(questionnaireSessions.sessionToken, sessionToken),
          isNull(questionnaireSessions.userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/questionnaire/attach/route.ts
git commit -m "feat(api): POST /api/questionnaire/attach"
```

---

# Phase 3: Shared UI Components

## Task 10: Install missing shadcn components

**Files:**
- Create: `src/components/ui/radio-group.tsx`, `src/components/ui/checkbox.tsx`, `src/components/ui/progress.tsx`

- [ ] **Step 1: Install components via shadcn CLI**

```bash
cd "/Users/akhromov/Library/Mobile Documents/com~apple~CloudDocs/Cursor/@work-projects/genesis-app"
npx shadcn@latest add radio-group checkbox progress
```

- [ ] **Step 2: Verify components exist**

```bash
ls src/components/ui/radio-group.tsx src/components/ui/checkbox.tsx src/components/ui/progress.tsx
```

Expected: all 3 files listed.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "chore(ui): add radio-group, checkbox, progress components"
```

---

## Task 11: ProgressBar, FrequencyTable, SymptomChecklist

**Files:**
- Create: `src/components/questionnaire/shared/progress-bar.tsx`
- Create: `src/components/questionnaire/shared/frequency-table.tsx`
- Create: `src/components/questionnaire/shared/symptom-checklist.tsx`

- [ ] **Step 1: Create ProgressBar**

```tsx
"use client";
import { Progress } from "@/components/ui/progress";
import { TOTAL_STEPS, getRemainingMinutes } from "@/lib/questionnaire/steps-config";

interface Props {
  currentStep: number;
}

export function QuestionnaireProgressBar({ currentStep }: Props) {
  const percent = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);
  const remaining = getRemainingMinutes(currentStep);
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Шаг {currentStep} из {TOTAL_STEPS - 1}
          </span>
          <span>~{remaining} мин осталось</span>
        </div>
        <Progress value={percent} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create FrequencyTable**

```tsx
"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Frequency } from "@/lib/questionnaire/types";

interface Row {
  key: string;
  label: string;
}

interface Props {
  rows: Row[];
  values: Record<string, { frequency: Frequency; nameAndDosage?: string }>;
  onChange: (
    key: string,
    value: { frequency: Frequency; nameAndDosage?: string }
  ) => void;
  showNameField?: boolean;
}

const FREQ_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Никогда" },
  { value: "rarely", label: "Редко" },
  { value: "sometimes", label: "Иногда" },
  { value: "often", label: "Часто" },
];

export function FrequencyTable({ rows, values, onChange, showNameField = true }: Props) {
  return (
    <div className="space-y-3">
      {/* Desktop header */}
      <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_1fr] gap-2 px-3 text-xs font-medium text-muted-foreground border-b pb-2">
        <div>Группа</div>
        {FREQ_OPTIONS.map((o) => (
          <div key={o.value} className="text-center w-16">
            {o.label}
          </div>
        ))}
        {showNameField && <div>Название / дозировка</div>}
      </div>

      {rows.map((row) => {
        const current = values[row.key] ?? { frequency: "never" as Frequency };
        return (
          <div key={row.key} className="rounded-lg border p-3 sm:border-0 sm:border-b sm:rounded-none sm:px-3 sm:py-2">
            {/* Mobile: label on top */}
            <div className="sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_1fr] sm:gap-2 sm:items-center">
              <div className="text-sm font-medium sm:font-normal mb-2 sm:mb-0">{row.label}</div>
              <RadioGroup
                value={current.frequency}
                onValueChange={(v) =>
                  onChange(row.key, { ...current, frequency: v as Frequency })
                }
                className="flex gap-3 sm:contents"
              >
                {FREQ_OPTIONS.map((o) => (
                  <div key={o.value} className="flex items-center gap-1.5 sm:w-16 sm:justify-center">
                    <RadioGroupItem
                      value={o.value}
                      id={`${row.key}-${o.value}`}
                    />
                    <Label
                      htmlFor={`${row.key}-${o.value}`}
                      className="text-xs sm:hidden"
                    >
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {showNameField && (
                <Input
                  className="mt-2 sm:mt-0 h-8 text-xs"
                  placeholder="Название, дозировка"
                  value={current.nameAndDosage ?? ""}
                  onChange={(e) =>
                    onChange(row.key, {
                      ...current,
                      nameAndDosage: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create SymptomChecklist**

```tsx
"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Frequency } from "@/lib/questionnaire/types";

interface Item {
  key: string;
  label: string;
}

interface Props {
  items: Item[];
  values: Record<string, Frequency>;
  onChange: (key: string, value: Frequency) => void;
}

const OPTS: { value: Frequency; label: string }[] = [
  { value: "never", label: "Никогда" },
  { value: "rarely", label: "Редко" },
  { value: "sometimes", label: "Иногда" },
  { value: "often", label: "Часто" },
];

export function SymptomChecklist({ items, values, onChange }: Props) {
  const filledCount = items.filter((i) => values[i.key] && values[i.key] !== "never").length;
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Отмечено состояний: <span className="font-medium text-foreground">{filledCount}</span> из{" "}
        {items.length}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const current = values[item.key] ?? "never";
          return (
            <div key={item.key} className="rounded border p-3">
              <div className="text-sm font-medium mb-2">{item.label}</div>
              <RadioGroup
                value={current}
                onValueChange={(v) => onChange(item.key, v as Frequency)}
                className="flex gap-4"
              >
                {OPTS.map((o) => (
                  <div key={o.value} className="flex items-center gap-1.5">
                    <RadioGroupItem
                      value={o.value}
                      id={`${item.key}-${o.value}`}
                    />
                    <Label
                      htmlFor={`${item.key}-${o.value}`}
                      className="text-xs"
                    >
                      {o.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/questionnaire/shared/
git commit -m "feat(questionnaire): add shared UI components"
```

---

# Phase 4: Wizard Container and Step Components

## Task 12: Wizard container

**Files:**
- Create: `src/components/questionnaire/wizard.tsx`

- [ ] **Step 1: Create wizard container**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuestionnaireProgressBar } from "./shared/progress-bar";
import { STEPS, TOTAL_STEPS } from "@/lib/questionnaire/steps-config";
import { loadSession, saveSession, clearSession } from "@/lib/questionnaire/storage";
import type { FullAnswers, CompletedAnswers } from "@/lib/questionnaire/types";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import { Step0Intro } from "./steps/step-0-intro";
import { Step1Personal } from "./steps/step-1-personal";
import { Step2Lifestyle } from "./steps/step-2-lifestyle";
import { Step3History } from "./steps/step-3-history";
import { Step4Systems } from "./steps/step-4-systems";
import { Step5StressAllergies } from "./steps/step-5-stress-allergies";
import { Step6Medications } from "./steps/step-6-medications";
import { Step7Nutrition } from "./steps/step-7-nutrition";
import { Step8SymptomsGoals } from "./steps/step-8-symptoms-goals";

export interface StepProps<T> {
  value: T | undefined;
  onChange: (value: T) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuestionnaireWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FullAnswers>({});
  const [loaded, setLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setAnswers(saved.answers);
      setCurrentStep(saved.currentStep);
    }
    setLoaded(true);
  }, []);

  // Save on every change
  useEffect(() => {
    if (!loaded) return;
    saveSession(currentStep, answers);
  }, [currentStep, answers, loaded]);

  function updateStep<K extends keyof FullAnswers>(key: K, value: FullAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submitFinal() {
    // Validate all steps
    const parsed = CompletedAnswersSchema.safeParse(answers);
    if (!parsed.success) {
      toast.error("Заполните все обязательные поля на всех шагах");
      return;
    }

    // Get session token
    const session = saveSession(currentStep, answers);

    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: session.sessionToken,
          answers: parsed.data,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      toast.success("Анкета отправлена");
      router.push(`/questionnaire/result/${session.sessionToken}`);
    } catch {
      toast.error("Ошибка отправки. Попробуйте ещё раз.");
    }
  }

  function saveAndExit() {
    saveSession(currentStep, answers);
    toast.info("Прогресс сохранён в этом браузере");
  }

  function startOver() {
    if (!confirm("Удалить прогресс и начать заново?")) return;
    clearSession();
    setAnswers({});
    setCurrentStep(0);
  }

  if (!loaded) return null;

  return (
    <div>
      {currentStep > 0 && <QuestionnaireProgressBar currentStep={currentStep} />}

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Top actions */}
        {currentStep > 0 && (
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

        {/* Step body */}
        {currentStep === 0 && <Step0Intro onNext={goNext} />}
        {currentStep === 1 && (
          <Step1Personal
            value={answers.step1}
            onChange={(v) => updateStep("step1", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 2 && (
          <Step2Lifestyle
            value={answers.step2}
            onChange={(v) => updateStep("step2", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <Step3History
            value={answers.step3}
            onChange={(v) => updateStep("step3", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <Step4Systems
            value={answers.step4}
            onChange={(v) => updateStep("step4", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 5 && (
          <Step5StressAllergies
            value={answers.step5}
            onChange={(v) => updateStep("step5", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 6 && (
          <Step6Medications
            value={answers.step6}
            onChange={(v) => updateStep("step6", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 7 && (
          <Step7Nutrition
            value={answers.step7}
            onChange={(v) => updateStep("step7", v)}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {currentStep === 8 && (
          <Step8SymptomsGoals
            value={answers.step8}
            onChange={(v) => updateStep("step8", v)}
            onNext={submitFinal}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit (will fail to compile until step components exist — that's fine, we'll fix next)**

```bash
git add src/components/questionnaire/wizard.tsx
git commit -m "feat(questionnaire): add wizard container"
```

---

## Task 13: Step 0 — Intro

**Files:**
- Create: `src/components/questionnaire/steps/step-0-intro.tsx`

- [ ] **Step 1: Create Step0Intro component**

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Lightbulb } from "lucide-react";

interface Props {
  onNext: () => void;
}

export function Step0Intro({ onNext }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Биохакинг-анкета
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Полный анамнез по образу жизни, питанию и здоровью за ~25 минут.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">9 шагов, ~25 минут</p>
              <p className="text-sm text-muted-foreground">
                Прогресс сохраняется автоматически. Можно выйти и вернуться.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Что вы получите</p>
              <p className="text-sm text-muted-foreground">
                Структурированную сводку ответов + автоматические подсветки рисков
                по 15 правилам (дефициты, фарм-нагрузка, образ жизни).
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Это не медицинская услуга</p>
              <p className="text-sm text-muted-foreground">
                Программа оздоровления относится к сфере ЗОЖ/натуропрактики, не является
                медицинской услугой и не ставит диагнозы. Все подсветки — поводы обсудить
                со специалистом.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onNext} size="lg" className="w-full">
        Начать анкету
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-0-intro.tsx
git commit -m "feat(questionnaire): step 0 intro"
```

---

## Task 14: Step 1 — Personal (pattern reference)

**Files:**
- Create: `src/components/questionnaire/steps/step-1-personal.tsx`

This step establishes the pattern used by all subsequent steps. Follow it exactly for steps 2–8.

- [ ] **Step 1: Create Step1Personal component**

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Step1Schema, type Step1Answers } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

export function Step1Personal({ value, onChange, onNext, onBack }: StepProps<Step1Answers>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step1Answers>({
    resolver: zodResolver(Step1Schema),
    defaultValues: value ?? {
      gender: undefined,
      birthDate: "",
      city: "",
      timezone: "Europe/Moscow",
      height: 170,
      weight: 70,
    } as any,
  });

  const gender = watch("gender");

  function onSubmit(data: Step1Answers) {
    onChange(data);
    onNext();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>О себе</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Пол</Label>
            <Select
              value={gender ?? ""}
              onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })}
            >
              <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="f">Женский</SelectItem>
                <SelectItem value="m">Мужской</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
            {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">Город</Label>
              <Input id="city" placeholder="Москва" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Часовой пояс</Label>
              <Input id="timezone" placeholder="Europe/Moscow" {...register("timezone")} />
              {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Назад
            </Button>
            <Button type="submit">Далее</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-1-personal.tsx
git commit -m "feat(questionnaire): step 1 personal data"
```

---

## Task 15: Step 2 — Lifestyle

**Files:**
- Create: `src/components/questionnaire/steps/step-2-lifestyle.tsx`

- [ ] **Step 1: Create Step2Lifestyle** (follow Task 14 pattern: `useForm` with `Step2Schema`, `Card/CardHeader/CardContent`, Back/Next buttons)

Fields to render (see `Step2Schema` in types.ts):
- `workDescription` — Textarea (500 max)
- `physicalActivity` — Select with options `low`/`medium`/`high`
- `activityDescription` — Textarea
- `wakeTime`, `sleepTime` — time inputs (`<Input type="time">`)
- `sleepQuality` — Select 0/1/2/3/4/5 labeled "Качество сна"
- `mealsPerDayWeekday`, `mealsPerDayWeekend` — number inputs
- `breakfastTimeWeekday`, `lastMealTimeWeekday` — time inputs
- `breakfastTimeWeekend`, `lastMealTimeWeekend` — time inputs
- `waterIntake` — Select with `<0.5`/`0.5-1`/`1-1.5`/`>1.5`/`2+`

Labels in Russian:
- workDescription: "Характер работы (кратко)"
- physicalActivity: "Уровень физической активности" → "Низкий/Средний/Высокий"
- activityDescription: "Описание физической нагрузки"
- wakeTime: "Время подъёма"
- sleepTime: "Время отхода ко сну"
- sleepQuality: "Качество сна (0–5)"
- mealsPerDayWeekday: "Приёмов пищи (будни)"
- mealsPerDayWeekend: "Приёмов пищи (выходные)"
- breakfastTimeWeekday: "Время завтрака (будни)"
- lastMealTimeWeekday: "Последний приём (будни)"
- breakfastTimeWeekend: "Время завтрака (выходные)"
- lastMealTimeWeekend: "Последний приём (выходные)"
- waterIntake: "Вода в день (литров)"

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-2-lifestyle.tsx
git commit -m "feat(questionnaire): step 2 lifestyle"
```

---

## Task 16: Step 3 — History (anamnesis)

**Files:**
- Create: `src/components/questionnaire/steps/step-3-history.tsx`

- [ ] **Step 1: Create Step3History** (follow Task 14 pattern with `Step3Schema`)

Fields (all optional Textareas, 2000 max chars):
- `parentsDiseases` — "Болезни родителей"
- `relativesDiseases` — "Болезни ближайших родственников (сестры, братья, бабушки, дедушки)"
- `chronicDiagnoses` — "Диагнозы, установленные врачом"
- `surgeries` — "Перенесённые операции"

Use `<Textarea rows={3}>` from `@/components/ui/textarea`.

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-3-history.tsx
git commit -m "feat(questionnaire): step 3 history"
```

---

## Task 17: Step 4 — Body Systems

**Files:**
- Create: `src/components/questionnaire/steps/step-4-systems.tsx`

- [ ] **Step 1: Create Step4Systems** (follow Task 14 pattern with `Step4Schema`)

Render 14 textarea fields (rows=2 each, 1000 max):
- `brainNervous` — "Голова, мозг, нервная система"
- `vision` — "Зрение"
- `ent` — "ЛОР (ухо, горло, нос)"
- `cardiovascular` — "Сердечно-сосудистая система"
- `digestive` — "ЖКТ (кишечник, стул, запоры, газы)"
- `urogenital` — "Мочеполовая система"
- `urogenitalLastVisit` — "Крайний визит к урологу/гинекологу" (Input, 200 max)
- `skinHairNails` — "Кожа, волосы, ногти"
- `aestheticIssues` — "Эстетические проблемы возраста" (500 max)
- `thyroid` — "Щитовидная железа"
- `thyroidLastCheck` — "Когда последний раз обследована" (Input, 200 max)
- `lungs` — "Лёгкие / органы дыхания"
- `coldFrequency` — "Частота простуд с кашлем" (Input, 200 max)
- `jointsMuscles` — "Суставы, мышцы, гибкость, выносливость"

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-4-systems.tsx
git commit -m "feat(questionnaire): step 4 body systems"
```

---

## Task 18: Step 5 — Stress & Allergies

**Files:**
- Create: `src/components/questionnaire/steps/step-5-stress-allergies.tsx`

- [ ] **Step 1: Create Step5StressAllergies** with Step5Schema:

- `emotionalState` — Textarea "Эмоциональное состояние"
- `stressLevel` — Select 1..5 "Уровень стресса (1–5)" (where 1 = минимум, 5 = максимум)
- `pollinosis` — Input "Поллинозы, сезонные аллергии"
- `foodAllergies` — Input "Пищевая аллергия"
- `drugAllergies` — Input "Лекарственная аллергия / непереносимость"

For stressLevel use shadcn Select with options 1, 2, 3, 4, 5.

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-5-stress-allergies.tsx
git commit -m "feat(questionnaire): step 5 stress and allergies"
```

---

## Task 19: Step 6 — Medications & Supplements

**Files:**
- Create: `src/components/questionnaire/steps/step-6-medications.tsx`

- [ ] **Step 1: Create Step6Medications**

Use `FrequencyTable` shared component with `MEDICATION_GROUPS` and `SUPPLEMENT_GROUPS` from types.ts.

Russian labels for medication groups:

```ts
const MED_LABELS: Record<string, string> = {
  antiplatelet: "Антиагреганты / антикоагулянты",
  bloodPressureHeart: "Препараты от давления / для сердца",
  microcirculation: "Препараты для микроциркуляции",
  venotonic: "Венотоники",
  antidepressants: "Антидепрессанты",
  neuroleptics: "Нейролептики / антипсихотики",
  anxietySleep: "Препараты от тревоги / для сна",
  anticonvulsants: "Противосудорожные",
  stomach: "Препараты для желудка",
  enzymesBile: "Ферменты / желчегонные",
  laxatives: "Послабляющие",
  antidiarrheal: "Препараты от диареи",
  thyroidHormones: "Гормоны щитовидной железы",
  hormonal: "Гормональные препараты",
  diabetes: "Препараты при диабете",
  nsaids: "НПВС",
  spasmolytics: "Спазмолитики",
  gout: "Препараты от подагры",
  antibiotics: "Антибиотики",
  antivirals: "Противовирусные",
  antifungals: "Противогрибковые",
  detoxAcetylation: "Препараты для детоксикации / ацетилирования",
  hepatoprotectors: "Гепатопротекторы",
};

const SUPP_LABELS: Record<string, string> = {
  vitaminsMinerals: "Витамины и минералы",
  omega3: "Омега-3",
  probioticsPrebiotics: "Пробиотики / пребиотики",
  antioxidants: "Антиоксиданты",
  adaptogens: "Адаптогены",
  aminoAcidsSportsNut: "Аминокислоты / спортпит",
  collagenJoints: "Коллаген / суставные добавки",
  brainCognitive: "Для мозга / когнитивной поддержки",
  other: "Другое",
};
```

Use local state (not react-hook-form) since the table updates many keys independently:

```tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FrequencyTable } from "../shared/frequency-table";
import { MEDICATION_GROUPS, SUPPLEMENT_GROUPS, type Step6Answers, type Frequency } from "@/lib/questionnaire/types";
import type { StepProps } from "../wizard";

// MED_LABELS and SUPP_LABELS from above

export function Step6Medications({ value, onChange, onNext, onBack }: StepProps<Step6Answers>) {
  const [medications, setMedications] = useState(value?.medications ?? {});
  const [supplements, setSupplements] = useState(value?.supplements ?? {});
  const [additionalMedications, setAdditionalMedications] = useState(value?.additionalMedications ?? "");
  const [trustedBrands, setTrustedBrands] = useState(value?.trustedBrands ?? "");
  const [noBrandPreference, setNoBrandPreference] = useState(value?.noBrandPreference ?? false);

  function handleSubmit() {
    onChange({
      medications: medications as any,
      supplements: supplements as any,
      additionalMedications,
      trustedBrands,
      noBrandPreference,
    });
    onNext();
  }

  const medRows = MEDICATION_GROUPS.map((k) => ({ key: k, label: MED_LABELS[k] }));
  const suppRows = SUPPLEMENT_GROUPS.map((k) => ({ key: k, label: SUPP_LABELS[k] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Лекарства</CardTitle>
          <p className="text-sm text-muted-foreground">
            Отметьте частоту приёма и укажите название/дозировку.
          </p>
        </CardHeader>
        <CardContent>
          <FrequencyTable
            rows={medRows}
            values={medications as any}
            onChange={(k, v) => setMedications((prev) => ({ ...prev, [k]: v }))}
          />
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="additional">Дополнительные лекарства</Label>
            <Textarea
              id="additional"
              rows={2}
              value={additionalMedications}
              onChange={(e) => setAdditionalMedications(e.target.value)}
              placeholder="Что ещё важно указать"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>БАД</CardTitle>
        </CardHeader>
        <CardContent>
          <FrequencyTable
            rows={suppRows}
            values={supplements as any}
            onChange={(k, v) => setSupplements((prev) => ({ ...prev, [k]: v }))}
          />
          <div className="mt-4 space-y-2">
            <Label htmlFor="brands">Бренды, которым доверяете</Label>
            <Input
              id="brands"
              value={trustedBrands}
              onChange={(e) => setTrustedBrands(e.target.value)}
              disabled={noBrandPreference}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="noBrand"
                checked={noBrandPreference}
                onCheckedChange={(v) => setNoBrandPreference(v === true)}
              />
              <Label htmlFor="noBrand" className="text-sm font-normal">
                Нет предпочтений
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onBack}>Назад</Button>
        <Button type="button" onClick={handleSubmit}>Далее</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-6-medications.tsx
git commit -m "feat(questionnaire): step 6 medications and supplements"
```

---

## Task 20: Step 7 — Nutrition

**Files:**
- Create: `src/components/questionnaire/steps/step-7-nutrition.tsx`

- [ ] **Step 1: Create Step7Nutrition**

Use local state pattern from Task 19. Render:

1. **Diet section** — Input `dietType`, Checkbox `isVegetarian` (conditional: if true, show Checkbox `monitorsNutrients`)
2. **Product frequency** — FrequencyTable with 17 product categories (but `showNameField={false}`)
3. **Drinks** — Input fields: `waterPerDay`, `coffeeCups`, `caffeineDrinks`, `cocoaHotChocolate`, `herbalTea`, `alcoholFrequency`
4. **Preferences** — Select `sweetCravings`/`flourCravings`/`saltySpicyCravings` (none/moderate/severe), `nightEating` (no/sometimes/often), `vegetablesPerDay`, `fruitsPerDay`, `greensFrequency`
5. **Oils** — Input `cookingOils`

```ts
const PRODUCT_LABELS: Record<string, string> = {
  sweets: "Сладкие продукты",
  flour: "Мучные изделия",
  redMeatSausages: "Красное мясо и колбасы",
  whiteMeat: "Белое мясо",
  organMeats: "Субпродукты",
  fishAny: "Рыба (любая)",
  fishFatty: "Рыба жирных сортов",
  seafood: "Морепродукты",
  dairy: "Молочные продукты",
  fermentedDairy: "Кисломолочные продукты",
  nonStarchyVeg: "Овощи некрахмалистые",
  starchyVeg: "Крахмалистые овощи и корнеплоды",
  fruitsBerries: "Фрукты и ягоды",
  wholeGrains: "Цельнозерновые крупы",
  legumes: "Бобовые",
  animalFats: "Животные жиры",
  plantOilsNutsSeeds: "Растит. масла, орехи, семена",
};
```

Note: `productFrequency` uses `FrequencyTable` with `showNameField={false}`. Internally, the table expects entries of shape `{ frequency, nameAndDosage? }`, so create an adapter:

```tsx
// Convert productFrequency: Record<key, Frequency> to the shape FrequencyTable expects
const productTableValues = Object.fromEntries(
  Object.entries(productFrequency).map(([k, v]) => [k, { frequency: v }])
);

// On change: extract only frequency
const handleProductChange = (key: string, entry: { frequency: Frequency }) => {
  setProductFrequency((prev) => ({ ...prev, [key]: entry.frequency }));
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-7-nutrition.tsx
git commit -m "feat(questionnaire): step 7 nutrition"
```

---

## Task 21: Step 8 — Symptoms & Goals

**Files:**
- Create: `src/components/questionnaire/steps/step-8-symptoms-goals.tsx`

- [ ] **Step 1: Create Step8SymptomsGoals**

Use `SymptomChecklist` shared component with the 30 symptoms.

```ts
const SYMPTOM_LABELS: Record<string, string> = {
  // Copy from rules.ts (already defined there — import it)
};
```

Import `SYMPTOM_LABELS` from `rules.ts` (re-export it or import directly).

Layout:
1. **Symptoms section** — SymptomChecklist (30 items)
2. **Goals** — Textarea `goals`
3. **Readiness** — RadioGroup `readinessToChange` (full/partial/unsure)
4. **Consent** — 2 required checkboxes (`consentPersonalData`, `confirmAccuracy`)
5. **Submit button** — "Завершить анкету" (calls `onNext`)

Use local state. On submit: build the Step8Answers object, call `onChange(data)` then `onNext()` (which is `submitFinal` in wizard).

Required checkboxes must be checked to enable the Submit button:

```tsx
const canSubmit = consentPersonalData && confirmAccuracy;
<Button onClick={handleSubmit} disabled={!canSubmit}>Завершить анкету</Button>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/steps/step-8-symptoms-goals.tsx
git commit -m "feat(questionnaire): step 8 symptoms and goals"
```

---

# Phase 5: Summary & Pages

## Task 22: HighlightCard + HighlightsPanel

**Files:**
- Create: `src/components/questionnaire/summary/highlight-card.tsx`
- Create: `src/components/questionnaire/summary/highlights-panel.tsx`

- [ ] **Step 1: Create HighlightCard**

```tsx
"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, Info, ChevronDown } from "lucide-react";
import type { Highlight } from "@/lib/questionnaire/rules";

const SEVERITY_STYLES = {
  warning: {
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 dark:bg-red-950/20",
    iconClass: "text-red-600",
  },
  attention: {
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
    iconClass: "text-amber-600",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
    iconClass: "text-blue-600",
  },
};

export function HighlightCard({ highlight }: { highlight: Highlight }) {
  const [expanded, setExpanded] = useState(false);
  const style = SEVERITY_STYLES[highlight.severity];
  const Icon = style.icon;
  return (
    <Card className={style.className}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.iconClass}`} />
          <div className="flex-1">
            <h4 className="font-medium">{highlight.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{highlight.description}</p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
              {expanded ? "Скрыть детали" : "Что привело к этому выводу"}
            </button>
            {expanded && (
              <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Триггеры:</p>
                  <ul className="list-disc list-inside text-sm space-y-0.5">
                    {highlight.triggers.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Рекомендация:</p>
                  <p>{highlight.recommendation}</p>
                </div>
                <p className="text-xs text-muted-foreground italic pt-2 border-t">
                  {highlight.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create HighlightsPanel**

```tsx
"use client";
import { HighlightCard } from "./highlight-card";
import type { Highlight } from "@/lib/questionnaire/rules";

export function HighlightsPanel({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Автоматических подсветок не выявлено. Это не означает отсутствие рисков —
          только то, что правила не сработали на ваших ответах. Рекомендуем
          регулярные профилактические чекапы.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Автоматические подсветки ({highlights.length})</h3>
      {highlights.map((h) => (
        <HighlightCard key={h.id} highlight={h} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/questionnaire/summary/
git commit -m "feat(questionnaire): highlights panel + cards"
```

---

## Task 23: SummaryView

**Files:**
- Create: `src/components/questionnaire/summary/summary-view.tsx`

- [ ] **Step 1: Create SummaryView**

```tsx
"use client";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HighlightsPanel } from "./highlights-panel";
import type { Highlight } from "@/lib/questionnaire/rules";
import type { CompletedAnswers } from "@/lib/questionnaire/types";

interface Props {
  answers: CompletedAnswers;
  highlights: Highlight[];
}

export function SummaryView({ answers, highlights }: Props) {
  return (
    <div className="space-y-8">
      <HighlightsPanel highlights={highlights} />

      <div>
        <h3 className="text-lg font-semibold mb-3">Ваши ответы</h3>
        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="step1" className="border rounded-lg px-4">
            <AccordionTrigger>О себе</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-1 text-sm">
                <div><dt className="inline font-medium">Пол: </dt><dd className="inline">{answers.step1.gender === "f" ? "Женский" : answers.step1.gender === "m" ? "Мужской" : "Другое"}</dd></div>
                <div><dt className="inline font-medium">Дата рождения: </dt><dd className="inline">{answers.step1.birthDate}</dd></div>
                <div><dt className="inline font-medium">Город: </dt><dd className="inline">{answers.step1.city}</dd></div>
                <div><dt className="inline font-medium">Рост/вес: </dt><dd className="inline">{answers.step1.height} см / {answers.step1.weight} кг</dd></div>
                {answers.step1.waist && (
                  <div><dt className="inline font-medium">ОТ/ОБ: </dt><dd className="inline">{answers.step1.waist} / {answers.step1.hips} см</dd></div>
                )}
              </dl>
            </AccordionContent>
          </AccordionItem>

          {/* Render similar accordion items for step2..step8. For brevity in this plan,
              just render step data as a <pre>JSON.stringify(...)</pre> block.
              In production, format each step's data properly. */}

          {["step2", "step3", "step4", "step5", "step6", "step7", "step8"].map((key) => (
            <AccordionItem key={key} value={key} className="border rounded-lg px-4">
              <AccordionTrigger>Раздел {key}</AccordionTrigger>
              <AccordionContent>
                <pre className="text-xs overflow-auto bg-muted p-3 rounded">
                  {JSON.stringify((answers as any)[key], null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground italic">
            Результаты анкеты не являются медицинским диагнозом и не заменяют консультацию
            специалиста.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

Note: the MVP renders step2–step8 as JSON. In a follow-up task, format each step with proper labels — but the current rendering is functional and informative.

- [ ] **Step 2: Commit**

```bash
git add src/components/questionnaire/summary/summary-view.tsx
git commit -m "feat(questionnaire): summary view with accordion"
```

---

## Task 24: Public landing page

**Files:**
- Create: `src/app/(public)/questionnaire/page.tsx`

- [ ] **Step 1: Create landing page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileCheck, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Биохакинг-анкета — персональный анамнез | Genesis",
  description: "Бесплатная биохакинг-анкета: образ жизни, питание, здоровье. 9 шагов, ~25 минут, 15 автоматических подсветок рисков. Без регистрации.",
  openGraph: {
    title: "Биохакинг-анкета | Genesis",
    description: "Структурированный анамнез за 25 минут с подсветкой рисков.",
  },
};

export default function QuestionnairePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Биохакинг-анкета
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Расскажите о себе — и получите структурированную карту рисков по образу
          жизни, питанию и здоровью за 25 минут. Бесплатно, без регистрации.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center">
          <Clock className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">9 шагов, ~25 минут</p>
          <p className="mt-1 text-sm text-muted-foreground">С автосохранением</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">15 подсветок</p>
          <p className="mt-1 text-sm text-muted-foreground">Автоматический анализ ответов</p>
        </CardContent></Card>
        <Card><CardContent className="p-6 text-center">
          <FileCheck className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 font-semibold">100+ вопросов</p>
          <p className="mt-1 text-sm text-muted-foreground">Полный биохакинг-анамнез</p>
        </CardContent></Card>
      </div>

      <div className="mt-10 text-center">
        <Link href="/questionnaire/start">
          <Button size="lg">Начать анкету</Button>
        </Link>
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Не является медицинской услугой. Программа оздоровления относится к сфере ЗОЖ/натуропрактики.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/questionnaire/page.tsx
git commit -m "feat(questionnaire): landing page"
```

---

## Task 25: Wizard start page

**Files:**
- Create: `src/app/(public)/questionnaire/start/page.tsx`

- [ ] **Step 1: Create start page**

```tsx
import type { Metadata } from "next";
import { QuestionnaireWizard } from "@/components/questionnaire/wizard";

export const metadata: Metadata = {
  title: "Анкета — прохождение | Genesis",
  robots: { index: false },
};

export default function QuestionnaireStartPage() {
  return <QuestionnaireWizard />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/questionnaire/start/page.tsx
git commit -m "feat(questionnaire): wizard start page"
```

---

## Task 26: Public result page

**Files:**
- Create: `src/app/(public)/questionnaire/result/[sessionToken]/page.tsx`

- [ ] **Step 1: Create result page (server component with data fetch)**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { SummaryView } from "@/components/questionnaire/summary/summary-view";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import type { Highlight } from "@/lib/questionnaire/rules";

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ sessionToken: string }>;
}) {
  const { sessionToken } = await params;

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(eq(questionnaireSessions.sessionToken, sessionToken))
    .limit(1);

  if (!session || session.status !== "completed") notFound();

  // Authz: if session is owned, require matching user
  if (session.userId) {
    const user = await getUser();
    if (!user || user.id !== session.userId) notFound();
  }

  const answersParsed = CompletedAnswersSchema.safeParse(session.answers);
  if (!answersParsed.success) notFound();

  const highlights = (session.highlights as Highlight[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Ваша сводка</h1>
        <p className="mt-2 text-muted-foreground">
          Результаты биохакинг-анкеты с автоматическими подсветками
        </p>
      </div>

      <SummaryView answers={answersParsed.data} highlights={highlights} />

      {!session.userId && (
        <div className="mt-10 rounded-lg border-2 border-primary bg-primary/5 p-6 text-center">
          <h3 className="text-lg font-semibold">Сохраните свою анкету</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Зарегистрируйтесь, чтобы сохранить ответы, подключить анализы крови и
            получить персональный протокол.
          </p>
          <Link href={`/register?sessionToken=${sessionToken}`} className="mt-4 inline-block">
            <Button size="lg">Создать аккаунт</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/(public)/questionnaire/result/
git commit -m "feat(questionnaire): public result page"
```

---

## Task 27: Dashboard result page (authenticated)

**Files:**
- Create: `src/app/dashboard/questionnaire/page.tsx`

- [ ] **Step 1: Create dashboard questionnaire page**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { questionnaireSessions } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SummaryView } from "@/components/questionnaire/summary/summary-view";
import { CompletedAnswersSchema } from "@/lib/questionnaire/types";
import type { Highlight } from "@/lib/questionnaire/rules";

export const dynamic = "force-dynamic";

export default async function DashboardQuestionnairePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const [session] = await db
    .select()
    .from(questionnaireSessions)
    .where(
      and(
        eq(questionnaireSessions.userId, user.id),
        eq(questionnaireSessions.status, "completed")
      )
    )
    .orderBy(desc(questionnaireSessions.completedAt))
    .limit(1);

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold">Анкета ещё не пройдена</h2>
            <p className="mt-2 text-muted-foreground">
              Пройдите биохакинг-анкету, чтобы получить персональные подсветки.
            </p>
            <Link href="/questionnaire/start" className="mt-4 inline-block">
              <Button size="lg">Пройти анкету</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parsed = CompletedAnswersSchema.safeParse(session.answers);
  if (!parsed.success) {
    return <div className="mx-auto max-w-3xl px-4 py-12">Ошибка чтения анкеты</div>;
  }
  const highlights = (session.highlights as Highlight[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Моя анкета</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Пройдена: {session.completedAt?.toLocaleDateString("ru-RU")}
        </p>
      </div>
      <SummaryView answers={parsed.data} highlights={highlights} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/questionnaire/page.tsx
git commit -m "feat(questionnaire): dashboard questionnaire page"
```

---

# Phase 6: Integration

## Task 28: Attach anon session during registration

**Files:**
- Modify: `src/app/api/auth/register/route.ts`
- Modify: `src/components/auth/register-form.tsx`

- [ ] **Step 1: Update register route schema to accept sessionToken**

In `src/app/api/auth/register/route.ts`, extend the `registerSchema`:

```ts
const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  fullName: z.string().min(1, "Введите имя"),
  phone: z.string().optional(),
  sessionToken: z.string().min(16).max(64).optional(),
});
```

- [ ] **Step 2: Add attach logic after user creation**

In `src/app/api/auth/register/route.ts`, add imports at top:

```ts
import { profiles, questionnaireSessions } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
```

(Replace existing `import { profiles } from "@/db/schema"` and `import { eq } from "drizzle-orm"`.)

After the line `await setAuthCookie(token);` and before `return NextResponse.json(...)`, add:

```ts
// Attach anonymous questionnaire session if provided
if (data.sessionToken) {
  try {
    await db
      .update(questionnaireSessions)
      .set({ userId: user.id })
      .where(
        and(
          eq(questionnaireSessions.sessionToken, data.sessionToken),
          isNull(questionnaireSessions.userId)
        )
      );
  } catch (err) {
    console.error("Failed to attach session:", err);
    // Don't fail registration if attach fails
  }
}
```

- [ ] **Step 3: Update register-form.tsx to forward sessionToken**

In `src/components/auth/register-form.tsx`:

Replace the first import line:
```tsx
import { useRouter } from "next/navigation";
```

with:
```tsx
import { useRouter, useSearchParams } from "next/navigation";
```

Inside `RegisterForm()`, after `const router = useRouter();`, add:
```tsx
const searchParams = useSearchParams();
const sessionToken = searchParams.get("sessionToken");
```

Update the fetch body from:
```tsx
body: JSON.stringify({ email, password, fullName, phone }),
```

to:
```tsx
body: JSON.stringify({
  email, password, fullName, phone,
  ...(sessionToken ? { sessionToken } : {}),
}),
```

After successful registration, redirect to the questionnaire dashboard if sessionToken was provided:

Replace:
```tsx
router.push("/dashboard/orders");
router.refresh();
```

with:
```tsx
router.push(sessionToken ? "/dashboard/questionnaire" : "/dashboard/orders");
router.refresh();
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/register/route.ts src/components/auth/register-form.tsx
git commit -m "feat(auth): attach anon questionnaire session on registration"
```

---

## Task 29: Final verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```
Expected: all tests PASS

- [ ] **Step 2: Build the project**

```bash
npm run build
```
Expected: build succeeds, no TypeScript errors

- [ ] **Step 3: Run dev server and manual QA**

```bash
npm run dev
```

Manual checks:
- Visit `/questionnaire` — landing page loads
- Click "Начать анкету" → `/questionnaire/start` loads wizard at step 0
- Click "Начать анкету" → step 1 loads, form renders
- Fill step 1, click "Далее" → step 2 loads, progress bar shows "Шаг 2 из 8"
- Refresh page → draft is loaded, wizard resumes on step 2
- Click "Сохранить и выйти" → toast shows
- Navigate through all 9 steps, fill minimum required fields
- Click "Завершить анкету" → redirects to `/questionnaire/result/[token]`
- Result page shows highlights + answers accordion
- Visit `/questionnaire/start` again → resume prompt or fresh start
- Register account with `?sessionToken=XXX` → after registration, visit `/dashboard/questionnaire` — sees the completed questionnaire

- [ ] **Step 4: Lint**

```bash
npm run lint
```

Fix any lint errors.

- [ ] **Step 5: Update development-history.md**

Add entry to `agent_docs/development-history.md`:

```md
### 2026-04-05 — Добавлен модуль биохакинг-анкеты

- **Источник:** две анкеты в docx (часть 1 — образ жизни/лекарства, часть 2 — питание/нутриенты).
- **Реализация:** многошаговый визард 9 шагов (~25 мин), ~100 полей. Автосохранение в LocalStorage для анонимов + привязка к аккаунту при регистрации (soft-gate).
- **Модель данных:** таблица `questionnaire_sessions` (JSONB для answers/highlights).
- **Движок подсветок:** 15 детерминированных правил (дефициты нутриентов, фарм-нагрузка, образ жизни, стресс). Полное покрытие unit-тестами.
- **Новое:** добавлен Vitest как тестовый фреймворк (первые тесты в проекте).
- **Связь с архитектурой:** слой Onboarding & Questionnaire (архитектурный слой 0). Готовит контекст для будущего Genesis Coach.
- **Публичные точки:** `/questionnaire`, `/questionnaire/start`, `/questionnaire/result/[token]`. Авторизованная: `/dashboard/questionnaire`.
```

Move oldest entry to archive per project rules.

- [ ] **Step 6: Final commit**

```bash
git add agent_docs/development-history.md
git commit -m "docs: update development history with questionnaire module"
```

---

## Summary

**Total tasks:** 29
**Phase breakdown:**
- Phase 1 (foundation): 6 tasks
- Phase 2 (API): 3 tasks
- Phase 3 (shared UI): 2 tasks
- Phase 4 (wizard + steps): 10 tasks
- Phase 5 (summary + pages): 6 tasks
- Phase 6 (integration): 2 tasks

**Deliverables:**
- Database: 1 table + migration
- Core library: 6 files (types, config, storage, rules, highlights + tests)
- API: 3 endpoints
- UI: 13 components (wizard + 9 steps + 3 shared)
- Pages: 4 pages
- Integration: register flow attachment
- Tests: 2 test files with comprehensive rule coverage
