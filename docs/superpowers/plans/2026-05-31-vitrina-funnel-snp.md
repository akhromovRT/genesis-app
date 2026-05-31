# План реализации: витрина «полный продукт + воронка» + 225 SNP

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Пересобрать коммерческий слой Genesis по требованиям Галины (27–29.05): полный пакет «Красивое долголетие» как главный продукт, блоки — пошаговая воронка с жёстким гейтингом, источник истины 225 SNP, подарок Блок 4, правки копирайта/цен.

**Architecture:** Источник истины SNP — типизированный TS-модуль `src/lib/genetics/blocks-snp.ts` (ревьюится в PR, БД-`markersCount` производное). Логика корзины (гейтинг + подарок) — чистая функция в `src/lib/cart/rules.ts`, которую вызывает Zustand-store. Витрина/лендинг DB-driven через `src/lib/products/blocks.ts`; правки данных — миграцией `0006`.

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM + PostgreSQL, Zustand, Vitest, shadcn/ui, Tailwind 4.

**Спека:** `docs/superpowers/specs/2026-05-31-vitrina-funnel-snp-design.md`
**Исходники Галины (в репо):** `agent_docs/genetics-blocks/source-galina-2026-05/` (5 DOCX + расшифровка голосового)

**Slug↔code блоков:** `nutrition`=BLOCK_1, `body`=BLOCK_2, `beauty-safety`=BLOCK_3, `mind`=BLOCK_4, `risks`=BLOCK_5. Цены в БД — в копейках (×100).

---

## Task 1: Источник истины SNP — модуль `blocks-snp.ts` + инвариант-тест

**Files:**
- Create: `src/lib/genetics/blocks-snp.ts`
- Test: `src/lib/genetics/blocks-snp.test.ts`

Источник rs-списков — DOCX в `agent_docs/genetics-blocks/source-galina-2026-05/` (раздел «Перечень ген-точек блока» в каждом файле). Полные перечни:

- **Блок 1 (nutrition), 51 SNP:** FADS1 rs174547; FADS2 rs174548; FADS2 rs66698963; APOA5 rs662799; APOA5 rs964184; FTO rs9939609; PPARG rs1801282; FABP2 rs1799883; CD36 rs1761667; LRP1 rs1799986; BCMO1 rs12934922; BCMO1 rs7501331; GC rs2282679; GC rs4588; GC rs7041; VDR rs2228570; VDR rs731236; ATP2B1 rs7965584; DIO2 rs12885300; MTHFR rs1801133; MTHFR rs1801131; MTR rs1805087; MTRR rs1801394; FUT2 rs602662; TCN2 rs1801198; SLC19A1 rs1051266; CBS rs234706; CBS rs28934891; MTHFD1 rs2236225; SHMT1 rs1979277; VKORC1 rs9934438; CYP4F2 rs2108622; HFE rs1799945; HFE rs1800730; TF rs1799852; TMPRSS6 rs4820268; SLC40A1 rs11568351; ATP7B rs28942074; ADD1 rs4961; CYP11B2 rs1799998; ACE rs4646994; AGT rs699; CYP1A2 rs762551; ADH1B rs1229984; DRD2 rs1800497; DBH rs6271; MCM6 rs4988235; GSTP1 rs1695; GPX1 rs1050450; NQO1 rs1800566; SOD2 rs4880
- **Блок 2 (body), 28 SNP:** CTSF/ACTN3 rs1815739; ACE rs4646994; ACE rs1799752; AMPD1 rs17602729; ADRB2 rs1042713; ADRB2 rs1042714; ADRB3 rs4994; FTO rs9939609; PPARG rs1801282; COMT rs4680; VDR rs2228570; VDR rs731236; GC rs2282679; CALCR rs1801197; BMP2 rs15705; FDPS rs2297480; IL6 rs1800795; TNF rs1800629; DIO2 rs12885300; COL5A1 rs12722; COL5A1 rs1134114; Col3A1 rs1800255; MMP12 rs2276109; MC4R rs17782313; UCP2 rs660339; LEPR rs1137101; NOS3 rs1799983; VEGFA rs2010963
- **Блок 3 (beauty-safety), 27 SNP:** FLG rs138726443; FLG rs61816761; FLG rs558269137; IL13 rs20541; IL1B rs1143634; IL6 rs1800795; TNF rs1800629; GPX1 rs1050450; GSTP1 rs1695; NQO1 rs1800566; SOD2 rs4880; AGER rs2070600; TCF7L2 rs12255372; TCF7L2 rs7903146; SLC2A2 rs5400; PPARG rs1801282; CYP17A1 rs743572; CYP19A1 rs2470152; ESR2 rs4986938; PGR rs1042838; AR rs3032358; COL5A1 rs12722; COL5A1 rs1134114; Col3A1 rs1800255; MMP12 rs2276109; NOS3 rs1799983; VEGFA rs2010963
- **Блок 4 (mind), 12 SNP:** COMT rs4680; HTR2A rs6313; DRD2 rs1800497; DBH rs6271; DRD2 rs1799732; BDNF rs6265; PER2 rs2304672; CLOCK rs11932595; HTR1A rs6295; MAOA rs6323; SLC6A2 rs2242446; OPRM1 rs1799971
- **Блок 5 (risks), 146 SNP:** транскрибировать полностью из `blok-5-riski-aptechka.docx` (разделы «Основные генточки 5 блока» по всем подразделам: сердце/сосуды, гемостаз, липиды, углеводы, воспаление, ЖКТ, дыхательная, гормоны, щитовидка, онко, нейродегенерация, депрессия + вся «Безопасная аптечка»: транспорт, статины, антиагреганты, ИПП, антидепрессанты, обезболивание, метотрексат, фторпиримидины, противомикробные, ксенобиотики). Это 128 «новых» + до 18 «усилителей из блоков 1–4». В модуль вносим **146 SNP блока 5** (новые + явно перечисленные в колонке «Основные генточки», без колонки «можно добавить»).

> Примечание по корректности: пересечения с блоками 1–4 в массиве блока 5 ДОПУСТИМЫ (они и должны пересекаться). Инвариант ниже проверяет именно число **уникальных пар gene:rs по всему набору = 225**, а не сумму длин массивов.

- [ ] **Step 1: Написать падающий тест-инвариант**

```ts
// src/lib/genetics/blocks-snp.test.ts
import { describe, it, expect } from "vitest";
import { BLOCKS_SNP, allUniqueSnps, blockSnpCount } from "./blocks-snp";

const key = (s: { gene: string; rs: string }) => `${s.gene}:${s.rs}`;

describe("blocks-snp source of truth", () => {
  it("содержит ровно 5 блоков с нужными slug", () => {
    expect(BLOCKS_SNP.map((b) => b.slug)).toEqual([
      "nutrition", "body", "beauty-safety", "mind", "risks",
    ]);
  });

  it("число уникальных gene:rs по всем блокам = 225", () => {
    expect(allUniqueSnps().length).toBe(225);
  });

  it("в каждом блоке нет дублей gene:rs", () => {
    for (const b of BLOCKS_SNP) {
      const keys = b.snps.map(key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("заявленные размеры блоков совпадают", () => {
    expect(blockSnpCount("nutrition")).toBe(51);
    expect(blockSnpCount("body")).toBe(28);
    expect(blockSnpCount("beauty-safety")).toBe(27);
    expect(blockSnpCount("mind")).toBe(12);
    expect(blockSnpCount("risks")).toBe(146);
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run src/lib/genetics/blocks-snp.test.ts`
Expected: FAIL — «Cannot find module './blocks-snp'».

- [ ] **Step 3: Создать модуль**

Каркас (массивы `snps` заполнить gene:rs из перечней выше; для блока 5 — транскрибировать из DOCX, добиться 146 элементов):

```ts
// src/lib/genetics/blocks-snp.ts
export interface Snp {
  gene: string;
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
    code: "BLOCK_1",
    title: "Стройность и питание без угадывания",
    snps: [
      snp("FADS1", "rs174547"), snp("FADS2", "rs174548"), snp("FADS2", "rs66698963"),
      snp("APOA5", "rs662799"), snp("APOA5", "rs964184"), snp("FTO", "rs9939609"),
      snp("PPARG", "rs1801282"), snp("FABP2", "rs1799883"), snp("CD36", "rs1761667"),
      snp("LRP1", "rs1799986"), snp("BCMO1", "rs12934922"), snp("BCMO1", "rs7501331"),
      snp("GC", "rs2282679"), snp("GC", "rs4588"), snp("GC", "rs7041"),
      snp("VDR", "rs2228570"), snp("VDR", "rs731236"), snp("ATP2B1", "rs7965584"),
      snp("DIO2", "rs12885300"), snp("MTHFR", "rs1801133"), snp("MTHFR", "rs1801131"),
      snp("MTR", "rs1805087"), snp("MTRR", "rs1801394"), snp("FUT2", "rs602662"),
      snp("TCN2", "rs1801198"), snp("SLC19A1", "rs1051266"), snp("CBS", "rs234706"),
      snp("CBS", "rs28934891"), snp("MTHFD1", "rs2236225"), snp("SHMT1", "rs1979277"),
      snp("VKORC1", "rs9934438"), snp("CYP4F2", "rs2108622"), snp("HFE", "rs1799945"),
      snp("HFE", "rs1800730"), snp("TF", "rs1799852"), snp("TMPRSS6", "rs4820268"),
      snp("SLC40A1", "rs11568351"), snp("ATP7B", "rs28942074"), snp("ADD1", "rs4961"),
      snp("CYP11B2", "rs1799998"), snp("ACE", "rs4646994"), snp("AGT", "rs699"),
      snp("CYP1A2", "rs762551"), snp("ADH1B", "rs1229984"), snp("DRD2", "rs1800497"),
      snp("DBH", "rs6271"), snp("MCM6", "rs4988235"), snp("GSTP1", "rs1695"),
      snp("GPX1", "rs1050450"), snp("NQO1", "rs1800566"), snp("SOD2", "rs4880"),
    ],
  },
  {
    slug: "body",
    code: "BLOCK_2",
    title: "Тело в форме: спорт, мышцы, суставы",
    snps: [
      snp("ACTN3", "rs1815739"), snp("ACE", "rs4646994"), snp("ACE", "rs1799752"),
      snp("AMPD1", "rs17602729"), snp("ADRB2", "rs1042713"), snp("ADRB2", "rs1042714"),
      snp("ADRB3", "rs4994"), snp("FTO", "rs9939609"), snp("PPARG", "rs1801282"),
      snp("COMT", "rs4680"), snp("VDR", "rs2228570"), snp("VDR", "rs731236"),
      snp("GC", "rs2282679"), snp("CALCR", "rs1801197"), snp("BMP2", "rs15705"),
      snp("FDPS", "rs2297480"), snp("IL6", "rs1800795"), snp("TNF", "rs1800629"),
      snp("DIO2", "rs12885300"), snp("COL5A1", "rs12722"), snp("COL5A1", "rs1134114"),
      snp("COL3A1", "rs1800255"), snp("MMP12", "rs2276109"), snp("MC4R", "rs17782313"),
      snp("UCP2", "rs660339"), snp("LEPR", "rs1137101"), snp("NOS3", "rs1799983"),
      snp("VEGFA", "rs2010963"),
    ],
  },
  {
    slug: "beauty-safety",
    code: "BLOCK_3",
    title: "Beauty Safety: кожа, процедуры, восстановление",
    snps: [
      snp("FLG", "rs138726443"), snp("FLG", "rs61816761"), snp("FLG", "rs558269137"),
      snp("IL13", "rs20541"), snp("IL1B", "rs1143634"), snp("IL6", "rs1800795"),
      snp("TNF", "rs1800629"), snp("GPX1", "rs1050450"), snp("GSTP1", "rs1695"),
      snp("NQO1", "rs1800566"), snp("SOD2", "rs4880"), snp("AGER", "rs2070600"),
      snp("TCF7L2", "rs12255372"), snp("TCF7L2", "rs7903146"), snp("SLC2A2", "rs5400"),
      snp("PPARG", "rs1801282"), snp("CYP17A1", "rs743572"), snp("CYP19A1", "rs2470152"),
      snp("ESR2", "rs4986938"), snp("PGR", "rs1042838"), snp("AR", "rs3032358"),
      snp("COL5A1", "rs12722"), snp("COL5A1", "rs1134114"), snp("COL3A1", "rs1800255"),
      snp("MMP12", "rs2276109"), snp("NOS3", "rs1799983"), snp("VEGFA", "rs2010963"),
    ],
  },
  {
    slug: "mind",
    code: "BLOCK_4",
    title: "Мозг, сон, стресс и мотивация",
    snps: [
      snp("COMT", "rs4680"), snp("HTR2A", "rs6313"), snp("DRD2", "rs1800497"),
      snp("DBH", "rs6271"), snp("DRD2", "rs1799732"), snp("BDNF", "rs6265"),
      snp("PER2", "rs2304672"), snp("CLOCK", "rs11932595"), snp("HTR1A", "rs6295"),
      snp("MAOA", "rs6323"), snp("SLC6A2", "rs2242446"), snp("OPRM1", "rs1799971"),
    ],
  },
  {
    slug: "risks",
    code: "BLOCK_5",
    title: "Основные риски здоровья + безопасная аптечка",
    // 146 SNP — транскрибировать из agent_docs/genetics-blocks/source-galina-2026-05/blok-5-riski-aptechka.docx
    // (колонки «Основные генточки 5 блока» по всем подразделам рисков + вся «Безопасная аптечка»).
    snps: [
      // ... 146 элементов ...
    ],
  },
];

export function blockSnpCount(slug: BlockSnp["slug"]): number {
  return BLOCKS_SNP.find((b) => b.slug === slug)?.snps.length ?? 0;
}

export function allUniqueSnps(): Snp[] {
  const seen = new Map<string, Snp>();
  for (const b of BLOCKS_SNP) {
    for (const s of b.snps) seen.set(`${s.gene}:${s.rs}`, s);
  }
  return [...seen.values()];
}
```

> Нормализация имён генов: в DOCX встречается `CTSF/ACTN3` и `Col3A1` — в модуле канонизируем как `ACTN3` и `COL3A1` (как в существующей `dna_markers.gene`). Это влияет на инвариант уникальности — следить, чтобы `COL3A1 rs1800255` в блоках 2 и 3 считался одной парой.

- [ ] **Step 4: Заполнить блок 5 и довести инвариант до 225**

Транскрибировать 146 SNP блока 5 из DOCX. Затем итеративно запускать тест: если `allUniqueSnps().length !== 225` — сверить пересечения (блок 5 разделяет SNP с 1–4: IL6, TNF, SOD2, GPX1, GSTP1, NQO1, APOA5, TCF7L2, PPARG, SLC2A2, DIO2, CYP17A1/CYP19A1/ESR2/PGR/AR, COMT/HTR2A/MAOA/SLC6A2, BDNF, MTHFR/MTRR/SLC19A1/SHMT1, VKORC1/CYP4F2, ABCB1 и т.д.). Уникальных должно выйти ровно 225.

Run: `npx vitest run src/lib/genetics/blocks-snp.test.ts`
Expected: PASS (все 4 теста).

- [ ] **Step 5: Commit**

```bash
git add src/lib/genetics/blocks-snp.ts src/lib/genetics/blocks-snp.test.ts
git commit -m "feat(genetics): источник истины 225 SNP по 5 блокам + инвариант-тест"
```

---

## Task 2: Миграция БД `0006` — тарифы, markersCount, удаление пакета 75 000

**Files:**
- Create: `drizzle/0006_galina_panel_finalize.sql`

Изменения (идемпотентно, по образцу `0005`):
1. `markers_count`: nutrition 51, body 28, beauty-safety 27, mind 12, risks 146, wellness-trio 88. full-package остаётся 225.
2. Блок 5 (`risks`): `consultation_hours` = 0; убрать из `full_description`/`meta_description` упоминание «включает 2 часа консультации» и «+ 2 ч консультации».
3. Пакет `step-by-step` (PKG_STEP, 75 000): `is_active = false` (мягкое удаление — заказы ссылаются на `tests.id`, физически не удаляем).
4. full-package: цена 6500000 (65 000) — уже верна, не трогаем. compareAtPrice 8990000 — оставляем.

- [ ] **Step 1: Написать миграцию**

```sql
-- drizzle/0006_galina_panel_finalize.sql
-- Финализация панели по данным Галины (DOCX/голосовое 27–29.05):
-- актуальные markersCount, консультация только в полном пакете, отказ от пакета 75 000.

-- 1. markersCount по финальным данным
UPDATE "tests" SET "markers_count" = 51, "updated_at" = now() WHERE "slug" = 'nutrition';
UPDATE "tests" SET "markers_count" = 28, "updated_at" = now() WHERE "slug" = 'body';
UPDATE "tests" SET "markers_count" = 27, "updated_at" = now() WHERE "slug" = 'beauty-safety';
UPDATE "tests" SET "markers_count" = 12, "updated_at" = now() WHERE "slug" = 'mind';
UPDATE "tests" SET "markers_count" = 88, "updated_at" = now() WHERE "slug" = 'wellness-trio';

-- 2. Блок 5: 146 ген-точек, консультация НЕ входит (только в полном пакете)
UPDATE "tests" SET
  "markers_count" = 146,
  "consultation_hours" = 0,
  "full_description" = 'Финальный блок ДНК-отчёта. 146 ген-точек: остаточные риски панели + фармакогенетика (как ваш организм реагирует на основные группы лекарств — статины, антикоагулянты, ИПП, антидепрессанты, обезболивающие, онко- и ревматологическая терапия). Консультация эксперта в этот блок не входит — её можно дозаказать отдельно (15 000 ₽/час) или получить в составе полного пакета.',
  "meta_description" = 'Сердечно-сосудистые риски, гемостаз, иммунитет, гормоны, онконастороженность, фармакогенетика. 146 ген-точек, 27 300 ₽.',
  "meta_title" = 'Блок 5 «Риски и Аптечка» — ДНК профилактики | Genesis',
  "updated_at" = now()
WHERE "slug" = 'risks';

-- 3. Отказ от пакета «Пошаговая сборка 75 000» (не продаём «наборчики»)
UPDATE "tests" SET "is_active" = false, "updated_at" = now() WHERE "slug" = 'step-by-step';
```

- [ ] **Step 2: Применить миграцию локально**

Run: `npm run db:migrate` (или принятый в проекте способ прогона `drizzle/*.sql`; см. `package.json` scripts и CI-шаг применения миграций).
Expected: миграция применяется без ошибок.

- [ ] **Step 3: Проверить данные**

Run (psql к локальной БД):
```sql
SELECT slug, markers_count, consultation_hours, is_active
FROM tests WHERE product_type IN ('block','package') ORDER BY product_type, price;
```
Expected: nutrition=51, body=28, beauty-safety=27, mind=12, risks=146 (consultation_hours=0), wellness-trio markers=88, step-by-step is_active=false, full-package markers=225.

- [ ] **Step 4: Commit**

```bash
git add drizzle/0006_galina_panel_finalize.sql
git commit -m "feat(db): миграция 0006 — финальные markersCount, Блок5 без консультации, отказ от пакета 75000"
```

---

## Task 3: Чистая логика корзины — гейтинг + подарок (`src/lib/cart/rules.ts`)

**Files:**
- Create: `src/lib/cart/rules.ts`
- Test: `src/lib/cart/rules.test.ts`

Правила:
- **Гейтинг:** Блоки `body`/`beauty-safety`/`mind` нельзя добавить, если в корзине нет `nutrition` И он не куплен ранее. `risks` и пакеты (`productType==='package'`) — без ограничений. `nutrition` — всегда можно.
- **Подарок:** если в корзине ≥2 платных блоков из {nutrition, body, beauty-safety, risks} и нет пакета — добавить `mind` строкой 0 ₽ с `isGift:true`. Если условие перестало выполняться — убрать подарочный `mind`. Не применять, если в корзине есть пакет, или `mind` куплен платно.

Тип элемента расширяем флагами `slug`, `productType`, `isGift`.

- [ ] **Step 1: Написать падающие тесты**

```ts
// src/lib/cart/rules.test.ts
import { describe, it, expect } from "vitest";
import { canAddBlock, applyGiftRule, type RuleItem } from "./rules";

const item = (slug: string, extra: Partial<RuleItem> = {}): RuleItem => ({
  id: slug, slug, productType: "block", price: 1590000, isGift: false, ...extra,
});

describe("гейтинг воронки", () => {
  it("nutrition можно добавить всегда", () => {
    expect(canAddBlock("nutrition", [], []).ok).toBe(true);
  });
  it("body нельзя без nutrition в корзине и без покупки", () => {
    const res = canAddBlock("body", [], []);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe("nutrition-required");
  });
  it("body можно, если nutrition в корзине", () => {
    expect(canAddBlock("body", [item("nutrition")], []).ok).toBe(true);
  });
  it("body можно, если nutrition куплен ранее", () => {
    expect(canAddBlock("body", [], ["nutrition"]).ok).toBe(true);
  });
  it("risks можно без nutrition (самостоятельный блок)", () => {
    expect(canAddBlock("risks", [], []).ok).toBe(true);
  });
});

describe("подарок Блок 4 (mind)", () => {
  it("при 2 платных блоках добавляет mind как подарок 0 ₽", () => {
    const out = applyGiftRule([item("nutrition"), item("body")]);
    const gift = out.find((i) => i.slug === "mind");
    expect(gift).toBeDefined();
    expect(gift!.isGift).toBe(true);
    expect(gift!.price).toBe(0);
  });
  it("при 1 блоке подарка нет", () => {
    expect(applyGiftRule([item("nutrition")]).some((i) => i.slug === "mind")).toBe(false);
  });
  it("снимает подарок, если блоков стало меньше 2", () => {
    const withGift = applyGiftRule([item("nutrition"), item("body")]);
    const reduced = applyGiftRule(withGift.filter((i) => i.slug === "nutrition" || i.isGift));
    expect(reduced.some((i) => i.slug === "mind")).toBe(false);
  });
  it("не добавляет подарок, если в корзине есть пакет", () => {
    const out = applyGiftRule([item("full-package", { productType: "package" }), item("nutrition")]);
    expect(out.some((i) => i.slug === "mind" && i.isGift)).toBe(false);
  });
  it("не дублирует платно купленный mind", () => {
    const out = applyGiftRule([item("nutrition"), item("body"), item("mind", { price: 1490000 })]);
    expect(out.filter((i) => i.slug === "mind").length).toBe(1);
    expect(out.find((i) => i.slug === "mind")!.isGift).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `npx vitest run src/lib/cart/rules.test.ts`
Expected: FAIL — «Cannot find module './rules'».

- [ ] **Step 3: Реализовать правила**

```ts
// src/lib/cart/rules.ts
export interface RuleItem {
  id: string;
  slug: string;
  productType: "block" | "package" | "test";
  price: number; // kopecks
  isGift: boolean;
}

const GATED_BLOCKS = new Set(["body", "beauty-safety", "mind"]);
const GIFT_ELIGIBLE = new Set(["nutrition", "body", "beauty-safety", "risks"]);
const GIFT_SLUG = "mind";

export type AddResult = { ok: true } | { ok: false; reason: "nutrition-required" };

/** Можно ли добавить блок с учётом гейтинга воронки. */
export function canAddBlock(
  slug: string,
  cart: RuleItem[],
  purchasedSlugs: string[],
): AddResult {
  if (!GATED_BLOCKS.has(slug)) return { ok: true };
  const hasNutrition =
    cart.some((i) => i.slug === "nutrition") || purchasedSlugs.includes("nutrition");
  return hasNutrition ? { ok: true } : { ok: false, reason: "nutrition-required" };
}

/** Привести корзину к согласованному состоянию подарка Блок 4. */
export function applyGiftRule(cart: RuleItem[]): RuleItem[] {
  const withoutGift = cart.filter((i) => !(i.slug === GIFT_SLUG && i.isGift));
  const hasPackage = withoutGift.some((i) => i.productType === "package");
  const paidMind = withoutGift.some((i) => i.slug === GIFT_SLUG && !i.isGift);
  const eligibleBlocks = withoutGift.filter(
    (i) => i.productType === "block" && GIFT_ELIGIBLE.has(i.slug),
  ).length;

  if (!hasPackage && !paidMind && eligibleBlocks >= 2) {
    return [
      ...withoutGift,
      { id: "gift-mind", slug: GIFT_SLUG, productType: "block", price: 0, isGift: true },
    ];
  }
  return withoutGift;
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `npx vitest run src/lib/cart/rules.test.ts`
Expected: PASS (все тесты).

- [ ] **Step 5: Commit**

```bash
git add src/lib/cart/rules.ts src/lib/cart/rules.test.ts
git commit -m "feat(cart): чистая логика гейтинга воронки и подарка Блок 4 + тесты"
```

---

## Task 4: Подключить правила к cart-store + UX отказа

**Files:**
- Modify: `src/stores/cart-store.ts`
- Modify: `src/components/cart/add-to-cart-button.tsx`

Расширяем `CartItem` полями `slug` уже есть; добавляем `productType` и `isGift`. После каждого мутирующего действия применяем `applyGiftRule`. `addItem` блока проверяет `canAddBlock`; при отказе — не добавляет и возвращает причину (компонент покажет тост).

- [ ] **Step 1: Расширить store**

В `src/stores/cart-store.ts`:
- В `CartItem` добавить: `productType: "block" | "package" | "test";` и `isGift?: boolean;`.
- Импорт: `import { canAddBlock, applyGiftRule, type RuleItem } from "@/lib/cart/rules";`
- Изменить сигнатуру `addItem` на возвращающую результат:

```ts
addItem: (item) => {
  const toRule = (i: CartItem): RuleItem => ({
    id: i.id, slug: i.slug, productType: i.productType, price: i.price, isGift: i.isGift ?? false,
  });
  if (item.productType === "block") {
    const check = canAddBlock(item.slug, get().items.map(toRule), []); // purchased: []
    if (!check.ok) return check; // { ok:false, reason }
  }
  const existing = get().items.find((i) => i.id === item.id);
  let next: CartItem[];
  if (existing) {
    next = get().items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
  } else {
    next = [...get().items, { ...item, quantity: 1 }];
  }
  // применяем подарок к чистому списку, затем материализуем gift в CartItem
  const ruled = applyGiftRule(next.map(toRule));
  const giftRow = ruled.find((r) => r.slug === "mind" && r.isGift);
  next = next.filter((i) => !(i.slug === "mind" && i.isGift));
  if (giftRow) {
    next = [...next, { id: "gift-mind", slug: "mind", name: "Мозг, сон, стресс и мотивация — в подарок", price: 0, quantity: 1, categoryName: "Подарок", markersCount: 12, productType: "block", isGift: true }];
  }
  set({ items: next });
  return { ok: true } as const;
},
```
- В `removeItem`/`updateQuantity` после `set` также пересчитать подарок: вынести материализацию подарка в приватный хелпер `recomputeGift(items)` и вызывать его в каждом мутирующем методе (DRY). Подарочную строку нельзя удалить вручную (в `removeItem` игнорировать `id === "gift-mind"`).
- Обновить интерфейс `addItem` в `CartState` на `(item: Omit<CartItem, "quantity">) => { ok: true } | { ok: false; reason: "nutrition-required" }`.

- [ ] **Step 2: Обновить кнопку добавления (тост при отказе)**

В `src/components/cart/add-to-cart-button.tsx` — обработать результат `addItem`:

```tsx
import { toast } from "sonner";
// ...внутри onClick:
const res = addItem(payload);
if (!res.ok && res.reason === "nutrition-required") {
  toast.error("Начните с Блока 1 «Питание»", {
    description: "Остальные блоки открываются после него — это первый шаг воронки.",
    action: { label: "Добавить Блок 1", onClick: () => addNutrition() },
  });
}
```
Где `addNutrition()` добавляет блок `nutrition` (компоненту нужно знать его данные — пробросить из родителя props блока nutrition или вызвать общий обработчик). Если данных nutrition нет в контексте кнопки — заменить action на ссылку `Link href="/products/nutrition"`.

- [ ] **Step 3: Прогнать существующие тесты корзины**

Run: `npx vitest run`
Expected: PASS (новые правила + старые тесты, если есть). Если есть тесты, дёргающие `addItem` как `void` — обновить под новый возврат.

- [ ] **Step 4: Ручная проверка**

Run: `npm run dev`, открыть `/products`. Проверить: добавить Блок 2 без Блока 1 → тост-отказ; добавить Блок 1, затем Блок 2 → в корзине появляется подарочный Блок 4 (0 ₽); убрать Блок 2 → подарок исчезает.

- [ ] **Step 5: Commit**

```bash
git add src/stores/cart-store.ts src/components/cart/add-to-cart-button.tsx
git commit -m "feat(cart): гейтинг воронки и авто-подарок Блок 4 в store + тост-отказ"
```

---

## Task 5: Витрина `/products` — модель «полный продукт + воронка», копирайт, терминология

**Files:**
- Modify: `src/app/(public)/products/page.tsx`

Правки (по строкам текущего файла):
1. **Hero (строки 43–47):** заменить заголовок `Персональная ДНК-карта для женщины, / которая хочет оставаться собой` на:
   `Красивое долголетие по вашей ДНК` (убрать боль «оставаться собой» — требование Галины).
2. **Hero подзаголовок (строки 48–52):** переписать без слова «база» в значении дешёвого входа; сделать акцент на полном продукте + пошаговости:
   `Полный ДНК-отчёт «Красивое долголетие» — 225 ген-точек в 5 блоках. Можно взять целиком со скидкой и 2 часами консультации — или пройти путь пошагово, начиная с питания.`
3. **Секция «5 блоков» подзаголовок (строки 107–110):** заменить `Берите по одному или сразу комплектом.` на формулировку воронки:
   `Это шаги одного пути к полному отчёту. Первый шаг — питание; дальше блоки открываются по очереди. Полный отчёт выгоднее любой пошаговой сборки.`
4. **Якорь «Поштучно» (строки 121–132):** заменить подпись `Поштучно (прайс-якорь)` → `Поэтапно, по шагам`; текст `Если брать все 5 блоков по одному.` → `Если собирать отчёт пошагово, блок за блоком.` (убрать «поштучно» — термин Галины).
5. **Секция «Почему Genesis, а не другая лаборатория» (строки 157–204):** удалить целиком (Галина: «Genesis — не лаборатория, фраза некорректна»). На её место — короткий блок преимуществ без сравнения «лаборатория vs лаборатория»:
   заголовок `Чем отличается отчёт Genesis`, и 3 пункта: свежая научная база 2025–2026; расширенная панель 225 ген-точек; отдельный слой безопасности (Beauty Safety + Аптечка/фармакогенетика). Сравнение «MyGenetics 55 генов / Genesis Блок 1 55 ген-точек» (строки 192–200) — либо убрать, либо исправить число на **51 ген-точку** и убрать слово «лаборатория».
6. **FAQ (строки 235–236):** вопрос «Можно ли купить только один блок?» переписать под гейтинг:
   `q: "С чего начинается отчёт?"`, `a: "Первый шаг — блок «Стройность и питание» (15 900 ₽). Это вход в отчёт: с него открываются остальные блоки. Биоматериал читается один раз — за следующие блоки доплачиваете только интерпретацию. Блок «Риски + Аптечка» можно взять и отдельно."`
7. **Терминологический проход по всему файлу:** убрать «поштучно/наборчики» → «поэтапно/пошагово»; везде «генов» в контексте нашей панели → «ген-точек».

- [ ] **Step 1: Внести правки 1–7** (точечными Edit по строкам выше).

- [ ] **Step 2: Проверка сборки и грепом терминологии**

Run: `npm run build` (или `npx next build`)
Expected: без ошибок типов.
Run: `grep -niE "поштучн|наборчик|другая лаборатория|оставаться собой" src/app/\(public\)/products/page.tsx`
Expected: пусто (кроме допустимого якоря, если оставлен осознанно).

- [ ] **Step 3: Ручная проверка** `/products` — герой про полный продукт, секция блоков как воронка, нет блока «vs лаборатория», FAQ про вход через Блок 1.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/products/page.tsx"
git commit -m "feat(products): модель «полный продукт + воронка», убран сравнительный блок vs лаборатория, терминология ген-точек"
```

---

## Task 6: Лендинг `/early-access` — копирайт и цена полного пакета

**Files:**
- Modify: `src/app/(public)/early-access/page.tsx`

Правки:
1. **meta.description (строка 7):** `полный пакет 55 900 ₽` → `полный пакет 65 000 ₽`.
2. **Заголовок секции блоков (строки 216–221):** `От «что со мной не так» — к персональному протоколу` → `Шаг за шагом к персональному протоколу` (убрать «что со мной не так», заменить на пошаговость — требование Галины 28.05).
3. **Цена полного пакета (строка 400):** `55 900` → `65 000`.
4. **Лейбл (строки 390–392):** `Горячий тариф Early Access` → `Полный пакет «Красивое долголетие»` (на публичную цену 65 000 «горячий тариф» больше не распространяется; Трио остаётся горячим за 27 900).
5. Проверить отсутствие фразы «мозги/мозг … в подарок» в неудачной формулировке — на этом лендинге её нет; пункт закрывается на Task 7 (греп по проекту).

> Трио Wellness (27 900) и блок «* Консультация не входит в Wellness-трио» — оставить как есть (одобрено Галиной).

- [ ] **Step 1: Внести правки 1–4.**

- [ ] **Step 2: Греп остаточных 55 900**

Run: `grep -rn "55 900\|55900" "src/app/(public)/early-access/"`
Expected: пусто.

- [ ] **Step 3: Ручная проверка** `/early-access` — заголовок «Шаг за шагом…», полный пакет 65 000.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/early-access/page.tsx"
git commit -m "fix(early-access): полный пакет 65 000, «Шаг за шагом к персональному протоколу»"
```

---

## Task 7: Контент блоков `/products/[slug]` + рендер ген-точек + чистка «в подарок»

**Files:**
- Modify: `src/app/(public)/products/[slug]/page.tsx`
- Possibly modify: `src/components/products/block-card.tsx`, `src/app/(public)/products/full/page.tsx`
- Source: `agent_docs/genetics-blocks/source-galina-2026-05/*.docx`

Цели:
1. Странице блока показать **перечень ген-точек** из `BLOCKS_SNP` (Task 1) — компактный список gene:rs или сгруппированный по гену, с подписью «N ген-точек (SNP)».
2. Сверить/обновить `subblocks` и описания блоков 2–5 с DOCX (боли — дословно). Блок 1 — сверить с `blok-1-pitanie-strojnost.docx`. Где формулировки в `0005` расходятся с DOCX — обновить через миграцию-патч (по образцу Task 2: `UPDATE tests SET subblocks=..., description=..., full_description=... WHERE slug=...`) либо в той же `0006`.
3. **Чистка формулировки «в подарок»:** найти по проекту фразы вида «Мозг … в подарок» / «мозги в подарок» и привести к корректной: «Блок 4 «Мозг, сон, стресс» — в подарок при покупке любых двух блоков».

- [ ] **Step 1: Грепнуть проблемные формулировки**

Run: `grep -rniE "в подарок|подарком" "src/app/(public)/products" src/components/products`
Просмотреть каждую; где звучит как «мозги в подарок» — переписать на «Блок 4 «Мозг, сон, стресс» — в подарок при покупке любых двух блоков».

- [ ] **Step 2: Добавить рендер ген-точек на страницу блока**

В `src/app/(public)/products/[slug]/page.tsx` импортировать `BLOCKS_SNP` и для текущего блока вывести секцию:

```tsx
import { BLOCKS_SNP } from "@/lib/genetics/blocks-snp";
// ...
const snpBlock = BLOCKS_SNP.find((b) => b.slug === params.slug);
// в JSX, если snpBlock:
<section className="mt-12">
  <h2 className="text-2xl font-bold">Что входит: {snpBlock.snps.length} ген-точек (SNP)</h2>
  <div className="mt-4 flex flex-wrap gap-2">
    {snpBlock.snps.map((s) => (
      <span key={`${s.gene}:${s.rs}`} className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
        {s.gene} <span className="text-muted-foreground">{s.rs}</span>
      </span>
    ))}
  </div>
  <p className="mt-3 text-xs text-muted-foreground">
    Считаем ген-точки (SNP), а не гены: у одного гена может быть несколько значимых точек.
  </p>
</section>
```

- [ ] **Step 3: Сверить субблоки/боли с DOCX**

Для каждого блока открыть соответствующий DOCX в `agent_docs/genetics-blocks/source-galina-2026-05/` и сверить тексты болей (`subblocks[].pains`) и описания. Где расходится — подготовить `UPDATE` в `drizzle/0006_galina_panel_finalize.sql` (дополнить миграцию) с дословными формулировками Галины. Минимально обязательное: убедиться, что счётчики ген-точек на страницах берутся из `markersCount`/`BLOCKS_SNP` и равны 51/28/27/12/146.

- [ ] **Step 4: Проверка**

Run: `npm run build`
Expected: без ошибок.
Открыть `/products/nutrition`, `/products/risks` — виден перечень ген-точек с верным числом; нет формулировки «мозги в подарок».

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/products" src/components/products drizzle/0006_galina_panel_finalize.sql
git commit -m "feat(products): перечень ген-точек на страницах блоков, контент из DOCX Галины, чистка «в подарок»"
```

---

## Task 8: Документация — development-history + ADR-003

**Files:**
- Modify: `agent_docs/development-history.md`
- Modify: `agent_docs/adr.md`
- Modify: `agent_docs/genetics-blocks/blocks-architecture-v1.md` (закрыть open questions по rs-спискам блоков 2–5)

- [ ] **Step 1: Запись в development-history.md** (вверх списка, с датой 2026-05-31): получены финальные составы 225 SNP от Галины; пересборка витрины под «полный продукт + воронка»; гейтинг + подарок Блок 4; правки early-access; источники заархивированы в `source-galina-2026-05/`.

- [ ] **Step 2: ADR-003 в adr.md:** «Витрина = полный продукт + пошаговая воронка с жёстким гейтингом». Контекст (директива Галины: не продаём «наборчики»), решение (вход через Блок 1, Блок 5 самостоятельный, подарок Блок 4 при ≥2 блоках, полный пакет 65 000, отказ от пакета 75 000, консультация только в полном пакете), последствия.

- [ ] **Step 3:** В `blocks-architecture-v1.md` отметить, что open questions по rs-спискам блоков 2–5 закрыты (источник: `blocks-snp.ts` + DOCX), и обновить markersCount.

- [ ] **Step 4: Commit**

```bash
git add agent_docs/
git commit -m "docs: ADR-003 модель витрины, история, закрытие open questions по rs-спискам"
```

---

## Финальная проверка (после всех тасков)

- [ ] `npx vitest run` — все тесты зелёные (инвариант 225, гейтинг, подарок).
- [ ] `npm run build` — сборка без ошибок.
- [ ] Ручной сценарий: `/products` (полный продукт первым, воронка, нет «vs лаборатория»), корзина (гейтинг + подарок), `/early-access` (65 000, «Шаг за шагом»), `/products/[slug]` (перечень ген-точек).
- [ ] Цены консистентны: full = 65 000 на /products, /early-access и в БД; Трио 42 900 (/products) / 27 900 (/early-access); Блок 5 = 27 300 без консультации.
- [ ] DoD из спеки выполнен.

---

## Self-review (выполнено автором плана)
- **Покрытие спеки:** A→Task 1; B→Task 5; C→Tasks 3–4; D→Task 7; E→Task 6; F→Tasks 5–6 (терминология/оферта) + дисклеймер (уже в коде). Тарифы/markersCount→Task 2. Docs→Task 8. Пробелов нет.
- **Плейсхолдеры:** единственное «…» — массив SNP блока 5 (146 шт.), который физически транскрибируется из приложенного в репо DOCX; явно помечено как шаг Task 1 Step 4 с критерием (инвариант 225). Это не скрытый плейсхолдер, а объём данных с источником.
- **Консистентность типов:** `RuleItem`/`canAddBlock`/`applyGiftRule` едины в Tasks 3–4; `BlockSnp.slug` union совпадает со slug'ами БД; `CartItem` расширен `productType`/`isGift` согласованно.
