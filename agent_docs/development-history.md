# История разработки

Правило: хранить только последние 10 записей. При добавлении новой переносить старые в
`agent_docs/development-history-archive.md`. Архив читать при необходимости.

---

Краткий журнал итераций проекта.

## Записи

### 2026-05-28 — Витрина 5 блоков и 3 пакетов «Красивое долголетие» (`/products`)

- **Что сделано:** Сайт перешёл со старого каталога 73 индивидуальных тестов CERBALAB на новую витрину `/products` — 5 модульных блоков ДНК-отчёта «Красивое долголетие» + 3 пакета и видимый якорь «поштучно 89 900 ₽». Каждый блок — отдельная страница с подблоками по болям, sticky pricing card и апсейлом на полный пакет. Полный пакет 65 000 ₽ получил выделенную страницу `/products/full` со сравнительной таблицей пакетов.
- **Зачем:** Закрывает разрыв между стратегией ADR-002 и кодом. Юнит-экономика (`unit-economics.md`) рассчитывалась на распределение 40 / 40 / 20 — оно работает только при видимом якоре, который теперь есть на витрине.
- **Архитектурное решение:** расширили таблицу `tests` колонкой `product_type` ('test' | 'block' | 'package') и nullable-полями специфики (pain_headline, subblocks, included_block_slugs, gift_block_slug, consultation_hours, compare_at_price), вместо отдельной таблицы `genetic_blocks`. Корзина и заказы работают без миграции — `order_items.testId` и `cart_items.testId` остаются ссылкой на `tests.id`.
- **Реализация:**
  - `drizzle/0005_genetic_blocks_packaging.sql` — ALTER + INSERT 5 блоков и 3 пакетов в копейках (×100), идемпотентно через ON CONFLICT.
  - `src/lib/products/blocks.ts` — query-слой (`getActiveBlocks`, `getActivePackages`, `getBlockBySlug`, `calculateSavings`, `calculateAnchorPrice`) + 7 unit-тестов.
  - `src/app/(public)/products/page.tsx` — витрина: hero + полный пакет + 5 блоков + якорь + 3 пакета + UTP-блок vs MyGenetics + FAQ + дисклеймер.
  - `src/app/(public)/products/[slug]/page.tsx` — 5 страниц блоков через `generateStaticParams`.
  - `src/app/(public)/products/full/page.tsx` — выделенная страница главного коммерческого SKU.
  - `src/components/products/{block-card,package-card,subblock-accordion}.tsx` — переиспользуемые компоненты.
  - `src/config/site.ts` — «Продукты» первым пунктом, «Каталог» → «Отдельные тесты».
  - `src/app/(public)/catalog/page.tsx` — скоупится на `product_type='test'` + баннер-переход на `/products`.
  - `src/components/genetic-quiz/quiz-flow.tsx` — CTA с `/catalog` на `/products/nutrition` (закрывает follow-up из roadmap).
- **Не сделано (явно):** реальный платёжный шлюз (YooKassa) — следующий шаг; booking-UI консультации Блока 5 — пока текстом; точные rs-списки блоков 2–5 — ждём авторский список Галины (для Блока 1 рендерим из `quiz-logic.ts`, для остальных — честный плейсхолдер).
- **Verification:** все 10 публичных маршрутов отвечают 200 (`/`, `/products`, `/products/{nutrition,body,beauty-safety,mind,risks,full}`, `/catalog`, `/genetic-quiz`); 69 unit-тестов зелёные; TS `tsc --noEmit` чистый.
- **План:** `docs/superpowers/plans/2026-05-28-genetic-blocks-packaging.md`.

### 2026-05-22 — Стратегический разворот: один женский аватар + модульные ген-блоки (ADR-001/002)

- **Что сделано:** По итогам разговоров с Галиной (21–22.05) зафиксирован разворот продуктовой стратегии и продуктовая архитектура.
- **ADR-001 (21.05):** MVP-аватар сжат до одной ЦА — женщина 35–60; продукт по болям, нейминг «база/стандарт/VIP» под запретом; двухконтурная монетизация (разовый ген-продукт + подписка). Семья/Профи/Клиника/мужская ЦА — Phase 2.
- **ADR-002 (22.05):** «3 накопительных тарифа» → **модульные блоки** по 15 900 ₽; полный пакет 65 000 ₽ единовременно / 75 000 пошагово (блок 4 бонусный) / прайс-якорь 89 900 ₽; 225 генов сейчас, 350 ген-точек в полной версии.
- **Документы:** `agent_docs/adr.md` (ADR-001, ADR-002); `agent_docs/genetics-blocks/nutrition-block-v1.md` (Блок 1: 50 точек + квиз + позиционирование против MyGenetics — 38% совпадение, якорь 27 900 ₽); `agent_docs/genetics-blocks/blocks-architecture-v1.md` (ценовая модель, блоки 1–2); `agent_docs/platform-functions-catalog.md` (~202 атомарных функции для разметки тарифов); переписаны `conept/genesis_concept.md`, `agent_docs/roadmap.md`, мастер-план.
- **Открыто (запрошено у Галины 22.05):** полный список блоков (3+, бонусный 4, бьюти), состав по генам, авторский список 50 rs (квиз мапит 46), математика пакета, подписочный контур.

### 2026-05-22 — Квиз «Генетический чекап питания» (лид-генератор Блока 1)

- **Что сделано:** Публичная воронка-квиз `/genetic-quiz`: пользователь выбирает ≥5 из 17 вопросов о теле/питании → видит, какие генетические точки панели на них отвечают (бейджи генов) → CTA на покупку Блока 1 (50 точек, 15 900 ₽). Авторская механика Галины, отдельная от биохакинг-анкеты.
- **Зачем:** Прямая воронка продажи базового ген-продукта (активация по ADR-002). Формирует потребность, не «продаёт в лоб».
- **Реализация:**
  - `src/lib/genetic-quiz/questions.ts` — 17 вопросов с маппингом на ген-маркеры + константы (MIN_SELECTION=5, TOTAL_GENE_POINTS=50, BLOCK_1_PRICE_RUB=15900).
  - `src/lib/genetic-quiz/quiz-logic.ts` — чистая логика (union/dedupe маркеров, coversAll для вопросов 16–17, группировка по генам) + 15 unit-тестов.
  - `src/components/genetic-quiz/quiz-flow.tsx` — интерактивный компонент (чекбоксы, счётчик, sticky-кнопка, панель результата с бейджами генов + CTA).
  - `src/app/(public)/genetic-quiz/page.tsx` — публичный лендинг.
  - `src/config/site.ts` — ссылка «Генетический чекап» в навигации (header + footer).
- **Не сделано (явно):** БД/серверный submit/лид-кэптур/аналитика — вне MVP. CTA ведёт на `/catalog` (страница продукта Блока 1 — следующий шаг).
- **Источник:** `agent_docs/genetics-blocks/nutrition-block-v1.md` (Галина 2026-05-21).
- **План:** `docs/superpowers/plans/2026-05-22-genetic-nutrition-quiz.md`

### 2026-05-21 — Прогрессивная анкета: квик-инсайты после шага 1

- **Что сделано:** Между шагом 1 (антропометрия) и шагом 2 (образ жизни) добавлен экран-интерстициал с мгновенно посчитанным ИМТ, WHR, оценкой риска по окружности талии и индексом грации.
- **Зачем:** Снимает критику Галины «холодная аудитория не пройдёт 10 страниц анкеты»; даёт пользователю быстрый micro-reward и снижает порог входа.
- **Реализация:**
  - `src/lib/questionnaire/quick-insights.ts` — чистые расчёты (age, BMI, WHR, waistRisk, indexOfGrace) + `computeQuickInsights` aggregator. 32 unit-теста в `quick-insights.test.ts`.
  - `src/components/questionnaire/steps/step-quick-insights.tsx` — UI на shadcn `Card`/`Badge`.
  - `src/components/questionnaire/wizard.tsx` — состояние `showingInsights`, перехват `goNext` после шага 1, скрытие прогресс-бара на интерстициале.
  - `src/lib/questionnaire/types.ts` — опциональное поле `calf` в Step1Schema.
  - `src/components/questionnaire/steps/step-1-personal.tsx` — input для голени + error-рендеринг для всех опциональных полей.
  - `src/app/(public)/questionnaire/page.tsx` — обновлён лендинг под новое обещание «мгновенный результат после 1 экрана».
- **Не сделано (явно):** серверный квик-submit не вводился — промежуточный результат живёт в LocalStorage; пользователь либо завершает анкету полностью, либо нет. Аналитики событий нет.
- **План:** `docs/superpowers/plans/2026-05-21-progressive-questionnaire.md`

### 2026-05-05 — Инвестиционная презентация (Slidev pitch deck)

- **Что сделано:** Разработан детальный инвест-мемо и Slidev pitch deck для pre-seed раунда 35M ₽ за 10% equity.
- **Документы:** `genesis-investor-pitch/` — полный Slidev-проект (slides.md, styles/index.css, components/Icon.vue). `outline-genesis-investor-pitch.md` — одобренный outline (14 слайдов).
- **Артефакты:** `genesis-investor-pitch/Genesis-Investor-Pitch-2026.pdf` (2.7 МБ, pixel-perfect PNG→PDF).
- **Структура:** Cover → Проблема → Рынок ($211B) → Платформа → Конкуренты → MVP → Монетизация → Окупаемость (M12 break-even) → Roadmap → Сделка → Exit сценарии (×3–14) → Команда → Почему сейчас → CTA.
- **Дизайн:** dark premium тема, emerald (#00C48C) акценты, Plus Jakarta Sans + DM Sans, metric-карточки, таблица конкурентов.
- **Финансовые параметры:** pre-money 315M ₽, post-money 350M ₽, runway 18+ мес, break-even M12 MRR 5.8M ₽, ARR run rate M18 180M ₽. Cap table: Алексей 35% · Галина 35% · Инвестор 10% · Пул 20%.

### 2026-04-05 — Добавлен модуль биохакинг-анкеты

- **Источник:** две анкеты в docx (часть 1 — образ жизни/лекарства, часть 2 — питание/нутриенты).
- **Реализация:** многошаговый визард 9 шагов (~25 мин), ~100 полей. Автосохранение в LocalStorage для анонимов + привязка к аккаунту при регистрации (soft-gate).
- **Модель данных:** таблица `questionnaire_sessions` (JSONB для answers/highlights).
- **Движок подсветок:** 15 детерминированных правил (дефициты нутриентов, фарм-нагрузка, образ жизни, стресс). Полное покрытие unit-тестами.
- **Новое:** добавлен Vitest как тестовый фреймворк (первые тесты в проекте).
- **Связь с архитектурой:** слой Onboarding & Questionnaire (архитектурный слой 0). Готовит контекст для будущего Genesis Coach.
- **Публичные точки:** `/questionnaire`, `/questionnaire/start`, `/questionnaire/result/[token]`. Авторизованная: `/dashboard/questionnaire`.

### 2026-04-05 — DNA Parser MVP (CERBALAB PDF)

- **Что сделано:** Парсер PDF-отчётов CERBALAB (NGS таргетное секвенирование), извлечение 223 маркеров + метаданных пациента.
- **Компоненты:**
  - `src/lib/dna/cerbalab-parser.ts` — pdf-parse-fork + sequential position matching (устойчив к шуму в тексте)
  - Таблицы `dna_reports`, `dna_markers` в Drizzle schema
  - 5 API routes: upload, list, detail, delete, file streaming
  - UI в дашборде: загрузка, карточки, поиск по маркерам, поиск по тексту, удаление
  - Админ-вид `/admin/dna` — все отчёты всех пользователей
- **Покрытие:** 223/223 маркера (100%) для CERBALAB формата. Edge cases: HLA без rs, del, wt/wt, 21/21, 6TA/7TA, NA.
- **Решение:** структурированно парсим только главную таблицу маркеров, полный текст интерпретаций сохраняем как есть + даём клиентский поиск. Парсинг nested-таблиц интерпретаций — в v2.

### 2026-04-03 — Лендинг, SEO, PhenoAge Calculator

- **Лендинг:** 8 секций (hero, stats, benefits, how-it-works, popular tests, personas, FAQ, CTA). Emerald wellness-тема. Страницы "О нас" и "Контакты".
- **SEO:** динамический sitemap.xml (73 теста + 14 категорий), robots.txt, Open Graph мета-теги.
- **PhenoAge Calculator:** публичный калькулятор биовозраста (Levine et al. 2018) по 9 биомаркерам крови. Визуальная шкала, оценка маркеров, рекомендации, Details for nerds. `/calculator`.

### 2026-04-03 — Миграция Supabase → Self-hosted PostgreSQL

- **Причина:** устранить зависимость от внешнего сервиса, использовать существующий PostgreSQL на VPS.
- **Что заменено:** Supabase Auth → custom JWT (jose + bcryptjs + HttpOnly cookies). Supabase DB → Drizzle ORM + postgres. Supabase Storage → локальный Docker volume.
- **Архитектура:** новая БД `genesis` в существующем `pass24-postgres` контейнере. Middleware проверяет JWT, передаёт user-info в headers для server components. RLS заменён app-level проверками в API и pages.
- **Деплой:** Docker → GitHub Actions → GHCR → VPS 5.42.101.27 → Nginx Proxy Manager → Let's Encrypt SSL. genesisbio.ru HTTP 200.
- **Scope:** 30+ файлов переписано (все API routes, pages, auth forms, middleware, header, user-nav).

### 2026-03-23 — Создана база знаний: книга «Биохакинг по-женски» (Хусаинова)

- **Источник:** Хусаинова Г. «Биохакинг по-женски. Как запустить программу снижения биологического возраста» (EPUB).
- Создана директория `knowledge_base/books/` для хранения контента, используемого Genesis Coach.
- Извлечены и структурированы 5 файлов:
  - `biohacking-po-zhenski-overview.md` — обзор, структура, формула молодости, ключевые тезисы.
  - `biohacking-po-zhenski-protocols.md` — **8 протоколов**: циркадные ритмы (расписание дня по органам, витамины по времени), сон (15 лайфхаков), питание (завтрак/обед/ужин + сезоны), стресс (4 гормона счастья vs 2 стресса), биомаркеры (чекапы, ферменты крови), нутрицевтики (антиоксиданты, энзимы, Q10, пробиотики, аминокислоты, полифенолы, фитоэстрогены, 6 микроэлементов с суперфудами), физическая активность, препараты регенерации.
  - `biohacking-po-zhenski-12-principles.md` — 12 принципов с привязкой к функциям Genesis Coach.
  - `biohacking-po-zhenski-bioage-tests.md` — 15 тестов биовозраста + формула КоэфСС (Горелкин-Пинхасов).
  - `biohacking-po-zhenski-longevity-pincode.md` — ПИН-код долголетия, 4 шага, системный подход.
- Обновлён `agent_docs/index.md` — добавлен раздел «База знаний для Genesis Coach».
- **Решение:** knowledge_base/ — отдельная директория для контента обучения бота, не смешивается с agent_docs/ (проектная документация). Книга структурирована как набор протоколов, а не пересказ — для прямого использования ботом.
- **Связь с проектом:** контент коррелирует с Longevity Pyramid (уровни 1–2: lifestyle + нутрицевтики), Protocol Engine и Genesis Coach. Особенно ценны: циркадный протокол, чекап биомаркеров, формулы биовозраста, 12 принципов.

