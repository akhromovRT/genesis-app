# Genetic Blocks Packaging — план сведения каталога в 5 блоков и 4 пакета

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development или superpowers:executing-plans для пошагового выполнения. Шаги используют чекбоксы (`- [ ]`).

**Goal:** Перевести витрину genesisbio.ru со старого каталога (73 индивидуальных теста CERBALAB) на новую продуктовую модель ДНК-отчёта «Красивое долголетие» — **5 модульных блоков + 4 пакетных предложения**. На сайте пользователь видит **только пакеты и блоки**; состав ген-точек и подблоки по болям раскрываются внутри страницы блока.

**Strategy (что и почему):**

- Старый `/catalog` тянет 73 теста через `Drizzle.select().from(tests)` (`src/app/(public)/catalog/page.tsx`). Эта витрина выстрелила в апреле, когда ещё не было ADR-001/002, и сейчас расходится с `agent_docs/product-overview.md`.
- Новая модель из ADR-002 (`agent_docs/genetics-blocks/blocks-architecture-v1.md`): 5 блоков по 14 900–27 300 ₽ + 4 ценовых сценария (база / Wellness-трио 42 900 / полный пакет 65 000 / якорь 89 900).
- Юнит-экономика (`agent_docs/unit-economics.md`) рассчитана на распределение **40% база / 40% полный пакет / 20% пошагово** — это работает **только** если поштучный якорь 89 900 ₽ виден рядом с пакетом 65 000 ₽ (психология выгоды).

**Architecture decision:** расширяем существующую таблицу `tests` колонкой `productType` ('test' | 'block' | 'package') + несколькими nullable-полями специфики блока/пакета. Не создаём отдельную таблицу `genetic_blocks` — `order_items.testId`, `cart_items.testId`, `testResults.orderItemId` уже ссылаются на `tests.id`. Корзина и заказы работают без миграции. Витрина просто фильтрует `WHERE product_type IN ('block', 'package')`.

**Tech Stack:** TypeScript 5, Next.js 16 App Router, Drizzle ORM, PostgreSQL self-hosted, shadcn/ui, Tailwind 4, Vitest 4.

**Источники данных:**
- `agent_docs/genetics-blocks/blocks-architecture-v1.md` — 5 блоков, цены, подблоки.
- `agent_docs/genetics-blocks/sources/2026-05-22-krasivoe-dolgoletie-tariff.md` — авторский 8-страничный документ Галины (детали подблоков).
- `agent_docs/product-overview.md` — позиционирование, тексты болей, конкурентное сравнение.
- `agent_docs/unit-economics.md` — цены и сценарии воронки.

---

## File Structure

**Create:**
- `drizzle/0014_genetic_blocks_packaging.sql` — миграция (колонки `product_type`, `pain_headline`, `subblocks`, `included_block_slugs`, `gift_block_slug`, `consultation_hours`, `compare_at_price`).
- `scripts/seed-blocks.ts` — идемпотентный сид 5 блоков + 4 пакетов с upsert по `slug`.
- `src/lib/products/blocks.ts` — типы `BlockSubblock`, `PackagePayload`, query-функции `getActiveBlocks()`, `getActivePackages()`, `getBlockBySlug()`.
- `src/app/(public)/products/page.tsx` — витрина (заменяет роль `/catalog`).
- `src/app/(public)/products/[slug]/page.tsx` — страница блока (5 страниц через один dynamic route).
- `src/app/(public)/products/full/page.tsx` — выделенная страница полного пакета.
- `src/components/products/block-card.tsx`, `block-detail.tsx`, `package-card.tsx`, `subblock-accordion.tsx`, `markers-list.tsx`.

**Modify:**
- `src/db/schema.ts` — расширить `tests`.
- `src/app/(public)/catalog/page.tsx` — добавить фильтр `productType = 'test'`, переименовать в «архивный каталог», либо 301 → `/products` (см. Task 7).
- `src/components/catalog/test-card.tsx` — не трогать (используется в архиве).
- `src/config/site.ts` — навигация: «Каталог» → «Продукты».
- `src/app/(public)/genetic-quiz/page.tsx` — CTA с `/catalog` на `/products/nutrition` (закрывает follow-up из `roadmap.md:31`).
- `agent_docs/development-history.md` — запись об итерации (+ архив старейшей при >10).
- `agent_docs/roadmap.md` — отметить Приоритет 1 «Детальный план + разработка отчёта по блокам» как сделанное.

**Out of scope (явно):**
- Реальный приём оплаты (YooKassa) — отдельный Приоритет 2.
- Лид-кэптур email-гейт на квизе — отдельный follow-up.
- Booking-UI для 2-часовой консультации в Блоке 5 — на v1 «после оплаты с вами свяжется куратор», текстом.
- Перевод сторонних SEO-страниц 73 тестов на новые слаги.

---

## Task 1: Расширить схему `tests` и сделать миграцию

**Files:** `src/db/schema.ts`, `drizzle/0014_genetic_blocks_packaging.sql`.

- [ ] **Step 1: Добавить колонки в `tests`**

В `src/db/schema.ts` в определение `tests` добавить:

```typescript
  productType: text("product_type").notNull().default("test"),
  painHeadline: text("pain_headline").default(""),
  subblocks: jsonb("subblocks"),
  includedBlockSlugs: jsonb("included_block_slugs"),
  giftBlockSlug: text("gift_block_slug"),
  consultationHours: integer("consultation_hours").default(0),
  compareAtPrice: integer("compare_at_price"),
```

И в массив индексов:

```typescript
  index("idx_tests_product_type").on(table.productType),
```

- [ ] **Step 2: Сгенерировать миграцию**

Run: `npx drizzle-kit generate`
Expected: создан `drizzle/0014_*.sql` с ALTER TABLE для новых колонок и индексом.

Если drizzle-kit генерит имя файла иначе — оставить как есть, не переименовывать.

- [ ] **Step 3: Прокатить миграцию локально**

Run: `npx drizzle-kit migrate` (или `npm run db:migrate` если есть npm-скрипт).
Expected: миграция применилась.

- [ ] **Step 4: Коммит**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat(products): extend tests schema with productType/subblocks/package fields"
```

---

## Task 2: Сид 5 блоков + 4 пакетов

**Files:** `scripts/seed-blocks.ts`.

- [ ] **Step 1: Найти или создать categories-категорию для блоков**

Run: `grep -rn "categories" src/db/seed* 2>/dev/null || true` — посмотреть, есть ли seed скрипт.
Run: `ls scripts/ 2>/dev/null` — посмотреть существующие скрипты.

Если есть существующий seed-скрипт — следовать его стилю (как подключается db, какие dotenv-загрузки). Если нет — собрать с нуля.

В сиде создать (upsert по `slug`) категорию `genesis-blocks` (или взять id уже существующей если есть). Все блоки/пакеты пойдут в неё с `productType` ≠ 'test', поэтому категория для них — формальная.

- [ ] **Step 2: Написать seed-скрипт**

Создать `scripts/seed-blocks.ts` с массивом из 5 блоков и 4 пакетов. Данные — точно из `agent_docs/genetics-blocks/blocks-architecture-v1.md`:

```typescript
// Структура (псевдо-объявление; полный массив — в шаге):
const BLOCKS = [
  { slug: 'nutrition',     name: 'Стройность и питание без угадывания', price: 15900, markersCount: 55, /* + painHeadline, subblocks, fullDescription */ },
  { slug: 'body',          name: 'Тело в форме: спорт, мышцы, суставы', price: 15900, markersCount: 23, /* ... */ },
  { slug: 'beauty-safety', name: 'Beauty Safety: кожа, процедуры, восстановление', price: 15900, markersCount: 25, /* ... */ },
  { slug: 'mind',          name: 'Мозг, сон, стресс и мотивация', price: 14900, markersCount: 13, /* ... */ },
  { slug: 'risks',         name: 'Основные риски здоровья + Аптечка', price: 27300, markersCount: 109, consultationHours: 2, /* ... */ },
];

const PACKAGES = [
  { slug: 'wellness-trio', name: 'Wellness-трио: питание + тело + красота',  price: 42900, compareAtPrice: 47700, includedBlockSlugs: ['nutrition','body','beauty-safety'], giftBlockSlug: 'mind' },
  { slug: 'full-package',  name: 'Полный пакет «Красивое долголетие»',        price: 65000, compareAtPrice: 89900, includedBlockSlugs: ['nutrition','body','beauty-safety','mind','risks'], consultationHours: 2 },
  { slug: 'step-by-step',  name: 'Пошаговая полная сборка',                   price: 75000, compareAtPrice: 89900, includedBlockSlugs: ['nutrition','body','beauty-safety','mind','risks'], consultationHours: 2 },
  // 'Поштучно' (89 900) — не пакет, а виртуальный якорь. НЕ создаём как пакет, показываем как сумму блоков на витрине через подсчёт.
];
```

Подблоки (`subblocks`) — массив `{ title: string, pains: string[] }`. Для блока 1: «Жиры и омега», «Липиды», «Углеводы и инсулин», «Метаболизм/вес», «Кофеин», «Соль/отёки», «Алкоголь», «Лактоза», «Железо», «Витамин D и B», «БАД без хаоса», «Антиоксиданты» — берётся из `blocks-architecture-v1.md` §«Подблоки по болям». Аналогично для блоков 2–5.

Полные тексты `painHeadline` и `fullDescription` — копируем из `agent_docs/product-overview.md` §5 (колонка «Что отвечает клиенту»).

Скрипт обязательно идемпотентный — `ON CONFLICT (slug) DO UPDATE SET ...` либо ручной select-then-update/insert. После сидинга — `console.log` итогов: `blocks: 5, packages: 3`.

- [ ] **Step 3: Запустить seed**

Run: `npx tsx scripts/seed-blocks.ts`
Expected: вывод `Seeded 5 blocks, 3 packages`. Повторный запуск не должен ничего ломать (идемпотентность).

Проверить через psql или drizzle studio: `SELECT slug, product_type, price FROM tests WHERE product_type IN ('block','package') ORDER BY product_type, price`.

- [ ] **Step 4: Коммит**

```bash
git add scripts/seed-blocks.ts
git commit -m "feat(products): seed 5 genetic blocks + 3 packages (Красивое долголетие)"
```

---

## Task 3: Query-слой `src/lib/products/blocks.ts`

**Files:** `src/lib/products/blocks.ts`, `src/lib/products/blocks.test.ts`.

- [ ] **Step 1: Написать тесты для query-функций (TDD)**

Создать `src/lib/products/blocks.test.ts`. Тесты — на чистые форматтеры (savings %, price formatting); query-функции мокаются или интеграционно через тестовый seed.

```typescript
import { describe, it, expect } from "vitest";
import { calculateSavings, formatPrice } from "./blocks";

describe("calculateSavings", () => {
  it("returns 0 when no compareAtPrice", () => {
    expect(calculateSavings(65000, null)).toBe(0);
  });
  it("returns positive savings amount", () => {
    expect(calculateSavings(65000, 89900)).toBe(24900);
  });
  it("returns 0 when compareAtPrice is less than price", () => {
    expect(calculateSavings(89900, 65000)).toBe(0);
  });
});

describe("formatPrice", () => {
  it("formats with thousands separator and ₽", () => {
    expect(formatPrice(15900)).toBe("15 900 ₽");
    expect(formatPrice(65000)).toBe("65 000 ₽");
  });
});
```

- [ ] **Step 2: Реализовать модуль**

Создать `src/lib/products/blocks.ts`:

```typescript
import { db } from "@/db";
import { tests } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export interface BlockSubblock {
  title: string;
  pains: string[];
}

export interface ProductBlock {
  id: string;
  slug: string;
  name: string;
  painHeadline: string;
  description: string;
  fullDescription: string;
  price: number;
  markersCount: number | null;
  consultationHours: number;
  subblocks: BlockSubblock[];
  imageUrl: string | null;
}

export interface ProductPackage {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  compareAtPrice: number | null;
  includedBlockSlugs: string[];
  giftBlockSlug: string | null;
  consultationHours: number;
}

export function calculateSavings(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return compareAtPrice - price;
}

export function formatPrice(rub: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(rub)} ₽`;
}

export async function getActiveBlocks(): Promise<ProductBlock[]> {
  const rows = await db
    .select()
    .from(tests)
    .where(and(eq(tests.productType, "block"), eq(tests.isActive, true)))
    .orderBy(asc(tests.price));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    painHeadline: r.painHeadline ?? "",
    description: r.description ?? "",
    fullDescription: r.fullDescription ?? "",
    price: r.price,
    markersCount: r.markersCount ?? null,
    consultationHours: r.consultationHours ?? 0,
    subblocks: (r.subblocks as BlockSubblock[] | null) ?? [],
    imageUrl: r.imageUrl,
  }));
}

export async function getActivePackages(): Promise<ProductPackage[]> {
  const rows = await db
    .select()
    .from(tests)
    .where(and(eq(tests.productType, "package"), eq(tests.isActive, true)))
    .orderBy(asc(tests.price));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    fullDescription: r.fullDescription ?? "",
    price: r.price,
    compareAtPrice: r.compareAtPrice ?? null,
    includedBlockSlugs: (r.includedBlockSlugs as string[] | null) ?? [],
    giftBlockSlug: r.giftBlockSlug,
    consultationHours: r.consultationHours ?? 0,
  }));
}

export async function getBlockBySlug(slug: string): Promise<ProductBlock | null> {
  const blocks = await getActiveBlocks();
  return blocks.find((b) => b.slug === slug) ?? null;
}

export async function getPackageBySlug(slug: string): Promise<ProductPackage | null> {
  const pkgs = await getActivePackages();
  return pkgs.find((p) => p.slug === slug) ?? null;
}
```

- [ ] **Step 3: Тесты зелёные + TypeScript**

Run: `npx vitest run src/lib/products/blocks.test.ts && npx tsc --noEmit`
Expected: оба зелёные.

- [ ] **Step 4: Коммит**

```bash
git add src/lib/products/
git commit -m "feat(products): add block/package query layer with savings/price formatters"
```

---

## Task 4: Витрина `/products`

**Files:** `src/app/(public)/products/page.tsx`, `src/components/products/block-card.tsx`, `src/components/products/package-card.tsx`.

- [ ] **Step 1: Карточки блока и пакета**

Создать `src/components/products/block-card.tsx` — компактная карточка блока (заголовок боли, цена, кол-во ген-точек, CTA «Подробнее → /products/[slug]»).

Создать `src/components/products/package-card.tsx` — карточка пакета: цена + перечёркнутый `compareAtPrice` + «Экономия 24 900 ₽» + список входящих блоков + бонусы (подарок-блок, часы консультации) + CTA «Оформить».

Стиль — emerald wellness-тема, как остальной лендинг. shadcn `Card`, `Badge`, `Button`.

- [ ] **Step 2: Страница `/products`**

Создать `src/app/(public)/products/page.tsx`:

Структура страницы:
1. **Hero** — H1 «ДНК-отчёт "Красивое долголетие"» + подзаголовок-обещание (из `product-overview.md` §1).
2. **Hero-CTA пакет** — крупная карточка «Полный пакет — 65 000 ₽» с явной экономией «vs 89 900 ₽ поштучно».
3. **Блок-сетка** — 5 карточек блоков с ценами и числом точек. Подсвечен блок 1 как «база, точка входа».
4. **Пакетная сетка** — 3 пакета (Wellness-трио, Полный, Пошагово) + явный якорь «Поштучно 89 900 ₽» отдельной не-кликабельной карточкой со словом «без выгоды».
5. **Сравнение с конкурентом** — короткий блок «Блок 1 (~55 точек) vs MyGenetics Эксперт (55 генов, 27 900 ₽)» (из `product-overview.md` §7, тактика 38%).
6. **FAQ** — 5–7 пунктов: «Можно ли купить только один блок», «Что делать, если уже сдавал ДНК в другой лабе», «Является ли это диагностикой», «Сколько действует отчёт», «Как происходит забор биоматериала».
7. **Дисклеймер** — юридическая рамка (`product-overview.md` §13).

```typescript
export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { getActiveBlocks, getActivePackages } from "@/lib/products/blocks";
import { BlockCard } from "@/components/products/block-card";
import { PackageCard } from "@/components/products/package-card";

export const metadata: Metadata = {
  title: "ДНК-отчёт «Красивое долголетие» — 5 блоков и пакеты | Genesis",
  description: "Персональная ДНК-карта по 225 ген-точкам. От базового блока 15 900 ₽ до полного отчёта 65 000 ₽. Питание, тело, кожа, мозг, риски.",
};

export default async function ProductsPage() {
  const [blocks, packages] = await Promise.all([getActiveBlocks(), getActivePackages()]);
  // ... разметка по 7 разделам выше
}
```

- [ ] **Step 3: TypeScript + smoke**

Run: `npx tsc --noEmit`
Run: `npm run dev` (фоном), `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/products`
Expected: 200. В браузере: 5 блоков, 3 пакета + якорь, экономия подсвечена.

- [ ] **Step 4: Коммит**

```bash
git add src/app/\(public\)/products/page.tsx src/components/products/
git commit -m "feat(products): add /products showcase with 5 blocks and 3 packages + anchor"
```

---

## Task 5: Страница блока `/products/[slug]`

**Files:** `src/app/(public)/products/[slug]/page.tsx`, `src/components/products/block-detail.tsx`, `src/components/products/subblock-accordion.tsx`.

- [ ] **Step 1: Подблок-аккордеон**

Создать `src/components/products/subblock-accordion.tsx` — для блока разворачивает список подблоков по болям (shadcn Accordion). Каждый item: title + список pains.

- [ ] **Step 2: Детальная страница блока**

Создать `src/app/(public)/products/[slug]/page.tsx`:

1. **Hero** — название блока + pain headline + цена + кол-во ген-точек + 2 CTA («Купить блок 15 900 ₽» / «Лучше: полный пакет за 65 000»).
2. **«Что внутри: подблоки по болям»** — аккордеон.
3. **«Какие гены в этом блоке»** — для блока 1 показываем `getAllMarkers()` из `src/lib/genetic-quiz/quiz-logic` (уже есть). Для блоков 2–5 — заглушка «Полный список ген-точек блока будет опубликован после релиза». Не делаем фейковые данные.
4. **Апсейл** — карточка «Возьмите полный пакет и сэкономьте 24 900 ₽» с переходом на `/products/full`.
5. **FAQ** — короткий, контекстный к блоку.

Используем `generateStaticParams` со списком слагов `nutrition, body, beauty-safety, mind, risks` — Next пред-рендерит 5 страниц.

`generateMetadata` — берёт `metaTitle/metaDescription` из БД, fallback на стандартное.

404 если блок не найден.

- [ ] **Step 3: TypeScript + smoke 5 страниц**

Run: `npx tsc --noEmit`
Run: `npm run dev`, проверить `curl` каждого слага:

```bash
for s in nutrition body beauty-safety mind risks; do
  echo -n "$s: "; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/products/$s
done
```

Expected: все 200.

- [ ] **Step 4: Коммит**

```bash
git add src/app/\(public\)/products/\[slug\]/ src/components/products/
git commit -m "feat(products): add block detail page with subblocks accordion and upsell"
```

---

## Task 6: Страница полного пакета `/products/full`

**Files:** `src/app/(public)/products/full/page.tsx`.

- [ ] **Step 1: Создать страницу**

Отдельная страница для главного коммерческого SKU (полный пакет 65 000):
1. **Hero** — «Полный отчёт "Красивое долголетие" — 225 ген-точек за 65 000 ₽» + перечёркнутый 89 900 + «Экономия 24 900 ₽» + большой CTA.
2. **5 блоков внутри** — список включённого с кратким описанием каждого + ссылки на детальные страницы.
3. **Что ещё включено** — 2 часа консультации, обновления интерпретации, доступ к ЛК.
4. **Сравнение пакетов** — Wellness-трио 42 900 / Полный 65 000 / Пошагово 75 000 — таблица.
5. **FAQ.**

- [ ] **Step 2: Smoke + коммит**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/products/full`
Expected: 200.

```bash
git add src/app/\(public\)/products/full/
git commit -m "feat(products): add full package landing /products/full"
```

---

## Task 7: Депрекация `/catalog` и обновление навигации

**Files:** `src/config/site.ts`, `src/app/(public)/catalog/page.tsx`, `src/app/(public)/genetic-quiz/page.tsx`.

- [ ] **Step 1: Решение по `/catalog`**

V1 — мягкое: оставляем `/catalog`, но в `WHERE` добавляем `productType = 'test'`, чтобы он показывал только старые тесты (73 шт.) без блоков/пакетов. Добавляем в `/catalog` баннер «Это архивный каталог отдельных тестов. [Перейти к пакетам "Красивое долголетие"](/products)». Не ломаем существующие ссылки и SEO.

В `src/app/(public)/catalog/page.tsx`:

```typescript
const conditions = [eq(tests.isActive, true), eq(tests.productType, "test")];
```

И добавить компонент-баннер сверху страницы.

- [ ] **Step 2: Навигация**

В `src/config/site.ts` — добавить пункт «Продукты» (`/products`) первым, после «Главная». «Каталог» опустить ниже или переименовать в «Отдельные тесты». Footer аналогично.

- [ ] **Step 3: CTA квиза → `/products/nutrition`**

В `src/components/genetic-quiz/quiz-flow.tsx` (или там, где CTA) поменять `href="/catalog"` на `href="/products/nutrition"`.

Закрывает follow-up из `agent_docs/roadmap.md:31`.

- [ ] **Step 4: TypeScript + smoke**

```bash
npx tsc --noEmit
npm run dev
curl -s http://localhost:3000/ | grep -c "/products"      # ожидание: ≥1
curl -s http://localhost:3000/genetic-quiz | grep -c "/products/nutrition"  # ≥1
```

- [ ] **Step 5: Коммит**

```bash
git add src/config/site.ts src/app/\(public\)/catalog/page.tsx src/components/genetic-quiz/quiz-flow.tsx
git commit -m "refactor(catalog): scope to legacy individual tests, route nav and quiz CTA to /products"
```

---

## Task 8: Обновление документации и roadmap

**Files:** `agent_docs/development-history.md`, `agent_docs/roadmap.md`, `agent_docs/adr.md` (опционально).

- [ ] **Step 1: Запись в `development-history.md`**

Добавить новую запись сверху, перенести самую старую в `development-history-archive.md` если >10:

```markdown
### 2026-05-28 — Витрина 5 блоков и 4 пакетов «Красивое долголетие» (`/products`)

- **Что сделано:** Сайт перешёл со старого каталога 73 индивидуальных тестов на новую витрину `/products` — 5 модульных блоков ДНК-отчёта «Красивое долголетие» + 3 пакета и видимый якорь «поштучно 89 900 ₽». Каждый блок — отдельная страница с подблоками по болям, списком ген-точек (для Блока 1 — из `quiz-logic.ts`) и апсейлом на полный пакет.
- **Зачем:** Закрывает разрыв между стратегией ADR-002 и кодом. Юнит-экономика (`unit-economics.md`) считалась на распределение 40/40/20 — оно работает только при видимом якоре, который теперь есть на витрине.
- **Архитектурное решение:** расширили таблицу `tests` колонкой `productType` ('test'|'block'|'package') и nullable-полями специфики, вместо отдельной таблицы `genetic_blocks`. Корзина и заказы работают без миграции.
- **Реализация:** миграция `0014_genetic_blocks_packaging.sql`, сид `scripts/seed-blocks.ts`, query-слой `src/lib/products/blocks.ts`, страницы `/products`, `/products/[slug]` (×5), `/products/full`. Старый `/catalog` отскопирован на `productType = 'test'` + баннер-ссылка на новую витрину.
- **Не сделано (явно):** реальный платёжный шлюз (YooKassa) — следующий шаг; booking-UI консультации Блока 5 — пока текстом; точные rs-списки блоков 2–5 — ждём Галину.
- **План:** `docs/superpowers/plans/2026-05-28-genetic-blocks-packaging.md`.
```

- [ ] **Step 2: Обновить roadmap**

В `agent_docs/roadmap.md` — отметить «Детальный план + разработка отчёта по блокам» (Приоритет 1) как `[x]` со ссылкой на этот план. Если есть пункт про сведение каталога — также.

- [ ] **Step 3: Коммит**

```bash
git add agent_docs/development-history.md agent_docs/roadmap.md agent_docs/development-history-archive.md 2>/dev/null
git commit -m "docs: log genetic blocks packaging iteration and update roadmap"
```

---

## Self-review checklist

- [x] 8 задач с точными файлами, командами, коммитами.
- [x] Архитектурное решение объяснено и обосновано (расширение `tests` vs отдельная таблица).
- [x] План соответствует ADR-002 и `blocks-architecture-v1.md`.
- [x] Указан якорный механизм цены (89 900 ₽ виден на витрине рядом с пакетом).
- [x] Закрывает 2 follow-up из roadmap.md (CTA квиза + детальный план блоков).
- [x] Не ломает корзину/заказы — `tests.id` остаётся PK для `order_items.testId` и `cart_items.testId`.
- [x] Out of scope явно очерчен (YooKassa, booking-UI, лид-кэптур).
- [x] Не выдумываем фейковые ген-точки для блоков 2–5 — честный плейсхолдер до получения списков от Галины.
