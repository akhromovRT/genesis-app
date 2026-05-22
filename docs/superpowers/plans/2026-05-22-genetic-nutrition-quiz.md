# Genetic Nutrition Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Публичная воронка-квиз «Генетический чекап питания» — лид-генератор Блока 1 (ген-продукт «Стройность и питание»). Пользователь выбирает ≥5 из 17 вопросов о своём теле/питании → система показывает, какие генетические точки панели отвечают на эти вопросы → CTA на покупку полного отчёта (50 точек, 15 900 ₽). Это авторская механика Галины («пройди опросник → получи генетический чекап»), отдельная от биохакинг-анкеты.

**Architecture:** Статические данные вопросов + чистая логика сопоставления (без БД, без сервера) + клиентский интерактивный компонент + один публичный роут. Результат считается на клиенте мгновенно. Лид-кэптур/аналитика — вне MVP (отдельный пункт роадмапа).

**Tech Stack:** TypeScript 5, React 19, Vitest 4, shadcn/ui (Card, Checkbox, Badge, Button, Accordion), Tailwind 4, Next.js 16 App Router.

**Спецификация-источник:** `agent_docs/genetics-blocks/nutrition-block-v1.md` (17 вопросов + маппинг на ген-точки), `agent_docs/genetics-blocks/blocks-architecture-v1.md` (цена 15 900 ₽, панель 50 точек).

---

## File Structure

**Create:**
- `src/lib/genetic-quiz/questions.ts` — 17 вопросов с маппингом на ген-маркеры + продуктовые константы (MIN_SELECTION, TOTAL_GENE_POINTS, BLOCK_1_PRICE_RUB).
- `src/lib/genetic-quiz/quiz-logic.ts` — чистые функции: union матченных маркеров, проверка валидности выбора, группировка по генам.
- `src/lib/genetic-quiz/quiz-logic.test.ts` — Vitest unit-тесты.
- `src/components/genetic-quiz/quiz-flow.tsx` — клиентский компонент: выбор вопросов (чекбоксы), счётчик, кнопка, панель результата + CTA.
- `src/app/(public)/genetic-quiz/page.tsx` — публичный лендинг с встроенным квизом.

**Modify:**
- `src/components/layout/` (header + footer — точные файлы найти на шаге) — добавить ссылку «Генетический чекап».
- `agent_docs/development-history.md` — запись об итерации.

**Out of scope:**
- БД, серверный submit, лид-кэптур, аналитика событий.
- Страница продукта Блока 1 (CTA пока ведёт на `/catalog`; финальный таргет — когда появится product page Блока 1).
- Реальная оплата.

---

## Task 1: Данные вопросов и константы

**Files:**
- Create: `src/lib/genetic-quiz/questions.ts`

- [ ] **Step 1: Создать файл данных**

Создать `src/lib/genetic-quiz/questions.ts` с точным содержимым (маппинг из `nutrition-block-v1.md`; ген `APOA5` нормализован в верхнем регистре для корректной дедупликации):

```typescript
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
```

- [ ] **Step 2: Проверить TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

- [ ] **Step 3: Коммит**

```bash
git add src/lib/genetic-quiz/questions.ts
git commit -m "feat(genetic-quiz): add 17 questions with gene-marker mapping"
```

---

## Task 2: Чистая логика квиза (TDD)

**Files:**
- Test: `src/lib/genetic-quiz/quiz-logic.test.ts`
- Create: `src/lib/genetic-quiz/quiz-logic.ts`

- [ ] **Step 1: Написать failing-тесты**

Создать `src/lib/genetic-quiz/quiz-logic.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  getAllMarkers,
  getMatchedMarkers,
  selectionCoversAll,
  isSelectionValid,
  groupMarkersByGene,
} from "./quiz-logic";
import { MIN_SELECTION } from "./questions";

describe("getAllMarkers", () => {
  it("returns a deduplicated union of all non-coversAll markers", () => {
    const all = getAllMarkers();
    // каждый маркер уникален по gene+rs
    const keys = all.map((mk) => `${mk.gene}:${mk.rs}`);
    expect(new Set(keys).size).toBe(all.length);
  });
  it("contains a known marker (FTO rs9939609)", () => {
    const all = getAllMarkers();
    expect(all.some((mk) => mk.gene === "FTO" && mk.rs === "rs9939609")).toBe(true);
  });
  it("does not exceed the panel size of 50", () => {
    expect(getAllMarkers().length).toBeLessThanOrEqual(50);
  });
});

describe("isSelectionValid", () => {
  it("is false below MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4])).toBe(false);
  });
  it("is true at exactly MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4, 5])).toBe(true);
    expect(MIN_SELECTION).toBe(5);
  });
  it("is true above MIN_SELECTION", () => {
    expect(isSelectionValid([1, 2, 3, 4, 5, 6])).toBe(true);
  });
});

describe("selectionCoversAll", () => {
  it("true if question 16 selected", () => {
    expect(selectionCoversAll([1, 2, 3, 4, 16])).toBe(true);
  });
  it("true if question 17 selected", () => {
    expect(selectionCoversAll([17, 1, 2, 3, 4])).toBe(true);
  });
  it("false for only specific questions", () => {
    expect(selectionCoversAll([1, 2, 3, 4, 5])).toBe(false);
  });
});

describe("getMatchedMarkers", () => {
  it("returns the union of markers from selected specific questions, deduplicated", () => {
    // Q1 и Q2 пересекаются по FTO/PPARG/FABP2/CD36; объединение должно быть дедуплицировано
    const matched = getMatchedMarkers([1, 2]);
    const keys = matched.map((mk) => `${mk.gene}:${mk.rs}`);
    expect(new Set(keys).size).toBe(matched.length);
    // Q1 даёт LRP1 rs1799986, которого нет в Q2 → должен присутствовать
    expect(matched.some((mk) => mk.gene === "LRP1" && mk.rs === "rs1799986")).toBe(true);
  });
  it("returns all markers when a coversAll question is selected", () => {
    const matched = getMatchedMarkers([1, 16]);
    expect(matched.length).toBe(getAllMarkers().length);
  });
  it("returns empty for empty selection", () => {
    expect(getMatchedMarkers([])).toEqual([]);
  });
  it("ignores unknown question ids", () => {
    expect(getMatchedMarkers([999])).toEqual([]);
  });
});

describe("groupMarkersByGene", () => {
  it("groups rs by gene and sorts genes alphabetically", () => {
    const grouped = groupMarkersByGene([
      { gene: "FTO", rs: "rs9939609" },
      { gene: "APOA5", rs: "rs662799" },
      { gene: "APOA5", rs: "rs964184" },
    ]);
    expect(grouped[0].gene).toBe("APOA5");
    expect(grouped[0].rsList).toEqual(["rs662799", "rs964184"]);
    expect(grouped[1].gene).toBe("FTO");
  });
  it("returns empty for empty input", () => {
    expect(groupMarkersByGene([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run src/lib/genetic-quiz/quiz-logic.test.ts`
Expected: FAIL — "Cannot find module './quiz-logic'".

- [ ] **Step 3: Реализовать**

Создать `src/lib/genetic-quiz/quiz-logic.ts`:

```typescript
import { QUIZ_QUESTIONS, MIN_SELECTION, type GeneMarker } from "./questions";

function markerKey(mk: GeneMarker): string {
  return `${mk.gene}:${mk.rs}`;
}

function dedupe(markers: GeneMarker[]): GeneMarker[] {
  const seen = new Set<string>();
  const out: GeneMarker[] = [];
  for (const mk of markers) {
    const key = markerKey(mk);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(mk);
    }
  }
  return out;
}

/** Дедуплицированный union всех маркеров из конкретных (не coversAll) вопросов. */
export function getAllMarkers(): GeneMarker[] {
  const all: GeneMarker[] = [];
  for (const q of QUIZ_QUESTIONS) {
    if (!q.coversAll) all.push(...q.markers);
  }
  return dedupe(all);
}

export function isSelectionValid(selectedIds: number[]): boolean {
  return selectedIds.length >= MIN_SELECTION;
}

export function selectionCoversAll(selectedIds: number[]): boolean {
  return QUIZ_QUESTIONS.some(
    (q) => q.coversAll && selectedIds.includes(q.id),
  );
}

export function getMatchedMarkers(selectedIds: number[]): GeneMarker[] {
  if (selectedIds.length === 0) return [];
  if (selectionCoversAll(selectedIds)) return getAllMarkers();
  const collected: GeneMarker[] = [];
  for (const q of QUIZ_QUESTIONS) {
    if (selectedIds.includes(q.id)) collected.push(...q.markers);
  }
  return dedupe(collected);
}

export interface GeneGroup {
  gene: string;
  rsList: string[];
}

export function groupMarkersByGene(markers: GeneMarker[]): GeneGroup[] {
  const map = new Map<string, string[]>();
  for (const mk of markers) {
    const list = map.get(mk.gene) ?? [];
    if (!list.includes(mk.rs)) list.push(mk.rs);
    map.set(mk.gene, list);
  }
  return Array.from(map.entries())
    .map(([gene, rsList]) => ({ gene, rsList }))
    .sort((a, b) => a.gene.localeCompare(b.gene));
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run src/lib/genetic-quiz/quiz-logic.test.ts`
Expected: PASS — все ассерты зелёные.

- [ ] **Step 5: Коммит**

```bash
git add src/lib/genetic-quiz/quiz-logic.ts src/lib/genetic-quiz/quiz-logic.test.ts
git commit -m "feat(genetic-quiz): add quiz matching logic (union, dedupe, grouping)"
```

---

## Task 3: Интерактивный компонент квиза

**Files:**
- Create: `src/components/genetic-quiz/quiz-flow.tsx`

- [ ] **Step 1: Создать компонент**

Создать `src/components/genetic-quiz/quiz-flow.tsx`:

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  QUIZ_QUESTIONS,
  MIN_SELECTION,
  TOTAL_GENE_POINTS,
  BLOCK_1_PRICE_RUB,
} from "@/lib/genetic-quiz/questions";
import {
  getMatchedMarkers,
  groupMarkersByGene,
  isSelectionValid,
  selectionCoversAll,
} from "@/lib/genetic-quiz/quiz-logic";

const priceLabel = new Intl.NumberFormat("ru-RU").format(BLOCK_1_PRICE_RUB);

export function GeneticQuizFlow() {
  const [selected, setSelected] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setShowResult(false);
  }

  const valid = isSelectionValid(selected);
  const matched = showResult ? getMatchedMarkers(selected) : [];
  const grouped = groupMarkersByGene(matched);
  const coversAll = selectionCoversAll(selected);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {QUIZ_QUESTIONS.map((q) => {
          const checked = selected.includes(q.id);
          return (
            <Card
              key={q.id}
              className={checked ? "border-primary" : undefined}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <Checkbox
                  id={`q-${q.id}`}
                  checked={checked}
                  onCheckedChange={() => toggle(q.id)}
                  className="mt-1"
                />
                <label htmlFor={`q-${q.id}`} className="cursor-pointer">
                  <span className="font-medium">{q.question}</span>
                  <span className="block text-sm text-muted-foreground">
                    {q.intent}
                  </span>
                </label>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur py-4 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Выбрано {selected.length}{" "}
            {valid ? "" : `(минимум ${MIN_SELECTION})`}
          </p>
          <Button
            type="button"
            disabled={!valid}
            onClick={() => setShowResult(true)}
          >
            Узнать, что покажет моя ДНК
          </Button>
        </div>
      </div>

      {showResult && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Что расскажет твоя ДНК-карта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              {coversAll ? (
                <>
                  Твой запрос покрывает <strong>всю панель</strong> —{" "}
                  {TOTAL_GENE_POINTS} генетических точек.
                </>
              ) : (
                <>
                  По выбранным вопросам твою ДНК-карту можно прочитать по{" "}
                  <strong>{matched.length}</strong> генетическим точкам из{" "}
                  {TOTAL_GENE_POINTS} в панели.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {grouped.map((g) => (
                <Badge key={g.gene} variant="secondary">
                  {g.gene} ({g.rsList.length})
                </Badge>
              ))}
            </div>

            <div className="rounded-md bg-muted/50 p-4 text-xs text-muted-foreground">
              Это предварительная карта соответствия твоих вопросов генетическим
              маркерам панели. Не является медицинским диагнозом. Полная
              интерпретация — в отчёте после генетического теста.
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div>
                <div className="text-sm text-muted-foreground">
                  Полный отчёт «Стройность и питание без угадывания»
                </div>
                <div className="text-2xl font-semibold">{priceLabel} ₽</div>
                <div className="text-xs text-muted-foreground">
                  {TOTAL_GENE_POINTS} генетических точек
                </div>
              </div>
              <Link href="/catalog">
                <Button size="lg">Получить полный отчёт</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Проверить TypeScript + наличие Checkbox**

Run: `ls src/components/ui/checkbox.tsx`
Expected: путь существует (подтверждено при планировании).

Run: `npx tsc --noEmit`
Expected: 0 ошибок. Если `Checkbox` имеет другой API (`onCheckedChange` vs `onChange`) — открыть `src/components/ui/checkbox.tsx`, посмотреть сигнатуру и адаптировать вызов (shadcn-стандарт — `onCheckedChange`). Если API отличается принципиально — НЕ выдумывать, сообщить.

- [ ] **Step 3: Коммит**

```bash
git add src/components/genetic-quiz/quiz-flow.tsx
git commit -m "feat(genetic-quiz): add interactive quiz flow component with result + CTA"
```

---

## Task 4: Публичный лендинг-роут

**Files:**
- Create: `src/app/(public)/genetic-quiz/page.tsx`

- [ ] **Step 1: Создать страницу**

Создать `src/app/(public)/genetic-quiz/page.tsx`:

```tsx
import type { Metadata } from "next";
import { GeneticQuizFlow } from "@/components/genetic-quiz/quiz-flow";
import { MIN_SELECTION } from "@/lib/genetic-quiz/questions";

export const metadata: Metadata = {
  title: "Генетический чекап питания — узнай свою ДНК-карту | Genesis",
  description:
    "Ответь на вопросы о своём теле и питании — узнай, какие генетические точки отвечают за стройность, энергию и кожу. Бесплатно, без регистрации.",
  openGraph: {
    title: "Генетический чекап питания | Genesis",
    description:
      "Пройди опросник — получи карту генетических маркеров твоего метаболизма.",
  },
};

export default function GeneticQuizPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Генетический чекап питания
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Отметь хотя бы {MIN_SELECTION} вопроса, которые тебе откликаются — и
          узнай, какие генетические точки твоей ДНК-карты отвечают за стройность,
          энергию, отёки и состояние кожи. Бесплатно, без регистрации.
        </p>
      </div>

      <div className="mt-10">
        <GeneticQuizFlow />
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Не является медицинской услугой. Программа оздоровления относится к сфере
        ЗОЖ/натуропрактики.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Проверить TypeScript + smoke**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

Run: `npm run dev` (фоном), затем `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/genetic-quiz`
Expected: 200. Остановить dev-сервер.

Если есть возможность смотреть в браузере — проверить: выбор <5 вопросов держит кнопку disabled; при ≥5 кнопка активна; клик показывает результат с бейджами генов и CTA; выбор вопроса 16/17 показывает «вся панель».

- [ ] **Step 3: Коммит**

```bash
git add "src/app/(public)/genetic-quiz/page.tsx"
git commit -m "feat(genetic-quiz): add public landing route /genetic-quiz"
```

---

## Task 5: Навигация (header + footer)

**Files:**
- Modify: файлы навигации (найти на шаге 1)

- [ ] **Step 1: Найти файлы навигации**

Run: `grep -rl "questionnaire" src/components --include=*.tsx | grep -iE "header|footer|nav"`
Прочитать найденные файлы. Найти, где добавлена ссылка «Анкета» (questionnaire) в header и footer.

- [ ] **Step 2: Добавить ссылку «Генетический чекап»**

Рядом с существующей ссылкой на `/questionnaire` (в header и footer) добавить пункт со ссылкой `/genetic-quiz` и текстом «Генетический чекап». Следовать тому же JSX-паттерну, что у соседней ссылки (тот же компонент Link, те же классы). Не менять структуру навигации — только добавить один пункт в каждом месте.

- [ ] **Step 3: Проверить TypeScript + smoke**

Run: `npx tsc --noEmit`
Expected: 0 ошибок.

Run: `npm run dev` (фоном), `curl -s http://localhost:3000/ | grep -c "genetic-quiz"`
Expected: ≥1 (ссылка отрендерилась). Остановить dev-сервер.

- [ ] **Step 4: Коммит**

```bash
git add src/components
git commit -m "feat(genetic-quiz): add nav links to genetic checkup in header and footer"
```

---

## Task 6: Запись в `agent_docs/development-history.md`

**Files:**
- Modify: `agent_docs/development-history.md` (+ archive при >10 записей)

- [ ] **Step 1: Добавить запись, перенести старейшую в архив при необходимости**

Вставить новую запись сразу после `## Записи`:

```markdown
### 2026-05-22 — Квиз «Генетический чекап питания» (лид-генератор Блока 1)

- **Что сделано:** Публичная воронка-квиз: пользователь выбирает ≥5 из 17 вопросов о теле/питании → видит, какие генетические точки панели на них отвечают → CTA на покупку Блока 1 (50 точек, 15 900 ₽). Авторская механика Галины, отдельная от биохакинг-анкеты.
- **Зачем:** Прямая воронка продажи базового ген-продукта (активация по ADR-002). Формирует потребность, не «продаёт в лоб».
- **Реализация:**
  - `src/lib/genetic-quiz/questions.ts` — 17 вопросов с маппингом на ген-маркеры + константы (MIN_SELECTION, TOTAL_GENE_POINTS=50, BLOCK_1_PRICE_RUB=15900).
  - `src/lib/genetic-quiz/quiz-logic.ts` — чистая логика (union/dedupe маркеров, coversAll для вопросов 16–17, группировка по генам) + unit-тесты.
  - `src/components/genetic-quiz/quiz-flow.tsx` — интерактивный компонент (чекбоксы, счётчик, sticky-кнопка, панель результата с бейджами генов + CTA).
  - `src/app/(public)/genetic-quiz/page.tsx` — публичный лендинг.
  - Навигация: ссылки «Генетический чекап» в header + footer.
- **Не сделано (явно):** БД/серверный submit/лид-кэптур/аналитика — вне MVP. CTA ведёт на `/catalog` (страница продукта Блока 1 — следующий шаг).
- **Источник:** `agent_docs/genetics-blocks/nutrition-block-v1.md` (Галина 2026-05-21).
- **План:** `docs/superpowers/plans/2026-05-22-genetic-nutrition-quiz.md`
```

Если записей станет >10 — перенести самую старую (нижнюю) в `agent_docs/development-history-archive.md`.

- [ ] **Step 2: Коммит**

```bash
git add agent_docs/development-history.md agent_docs/development-history-archive.md 2>/dev/null
git commit -m "docs: log genetic nutrition quiz iteration"
```

---

## Self-review checklist

- [x] 6 задач с точными файлами, кодом, командами, коммитами.
- [x] Нет «TODO»/«later» — весь код приведён.
- [x] Имена (`getMatchedMarkers`, `groupMarkersByGene`, `selectionCoversAll`, `isSelectionValid`, `getAllMarkers`) консистентны между тестами, логикой и компонентом.
- [x] Данные вопросов сверены с `nutrition-block-v1.md` (17 вопросов, маппинг, coversAll для 16–17).
- [x] Чистая логика отделена от UI → тестируема.
- [x] Без БД/сервера — план самодостаточен на фронте, шиппабелен.
- [x] CTA-таргет помечен как временный (`/catalog`) с пометкой про будущую product page Блока 1.
