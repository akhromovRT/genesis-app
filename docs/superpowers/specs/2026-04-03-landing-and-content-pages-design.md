# Design: Landing Page + Content Pages (About, Contacts)

**Date:** 2026-04-03
**Status:** Approved
**Scope:** Redesign landing page (8 sections), create About page, update Contacts page, update site config

---

## Context

Genesis app (genesisbio.ru) has a minimal landing page (hero + 3-step "how it works"), skeleton About and Contacts pages. Need compelling content to convert visitors into test purchasers.

**Tone:** Friendly, accessible, wellness — simple language, bright accents, "health for everyone"
**Target audience:** 30-55, biohackers, athletes, parents planning pregnancy, health-conscious professionals

## Landing Page — 8 Sections

### 1. Hero
- Headline: "Узнай свою генетику. Управляй здоровьем."
- Subtitle: "Genesis — генетические тесты с понятной расшифровкой и персональными рекомендациями. Более 80 исследований от 1 300 ₽."
- CTA primary: "Выбрать тест" → /catalog
- CTA secondary: "Как это работает" → scroll to section 4
- Large padding, centered text, clean background

### 2. Stats Bar
Horizontal strip with 4 numbers on muted background:
- "80+" / генетических тестов
- "14" / категорий исследований
- "от 1 300 ₽" / стоимость теста
- "14–30" / рабочих дней результат

### 3. Benefits (Why Genesis)
4 cards in a grid with Lucide icons:
1. **Понятный отчёт** (FileText icon) — "Не просто PDF с цифрами. Расшифровка на человеческом языке: что означают ваши гены и на что обратить внимание."
2. **Персональные рекомендации** (Target icon) — "Каждая рекомендация учитывает именно ваш генотип. Не общие советы из интернета, а конкретный план для вас."
3. **Всё в одном месте** (LayoutDashboard icon) — "Личный кабинет с историей всех тестов и результатов. Отслеживайте своё здоровье в динамике."
4. **Доказательная база** (BookOpen icon) — "Все интерпретации основаны на научных исследованиях. Мы указываем источники и уровень доказательности."

### 4. How It Works
3 steps with icons and friendly descriptions:
1. **Выберите тест** (Dna icon) — "Посмотрите каталог — от спортивной генетики до фармакогенетики. Не знаете, с чего начать? Начните с генетического паспорта."
2. **Сдайте биоматериал** (FlaskConical icon) — "Буккальный эпителий (мазок с внутренней стороны щеки) — это не больно и занимает 30 секунд. В лаборатории или с выездом на дом."
3. **Получите результат** (Sparkles icon) — "Через 14–30 рабочих дней в личном кабинете появится детальный отчёт с расшифровкой и рекомендациями."

### 5. Popular Tests
Dynamic section — query from DB (`tests.isPopular = true`, limit 4, with category join).
- Reuse existing `TestCard` component
- Section title: "Популярные тесты"
- Link at bottom: "Смотреть все тесты →" → /catalog

### 6. Who Is It For
4 persona cards in a grid:
1. **"Хочу понять свои риски"** — "Вам 40+ и вы хотите знать, на что обратить внимание. Генетический паспорт покажет предрасположенности и поможет выбрать правильные чекапы." → /catalog?category=geneticheskie-pasporta
2. **"Оптимизирую тренировки"** — "Узнайте свой тип мышечных волокон, выносливость и риск травм. Подберите тренировки под свою генетику." → /catalog?category=sportivnaya-genetika
3. **"Планирую беременность"** — "Генетическое обследование до зачатия поможет выявить риски и подготовиться к здоровой беременности." → /catalog?category=reproduktivnoe-zdorove
4. **"Интересуюсь биохакингом"** — "Нутригеномика, метаболизм витаминов, детоксикация — оптимизируйте здоровье на основе данных, а не догадок." → /catalog?category=nutrigenomika-i-vitaminy

Each card: emoji or icon, title (quote), 2-sentence description, "Подробнее →" link.

### 7. FAQ
Accordion (shadcn Accordion component), 7 questions:
1. "Что такое генетический тест?" — Анализ ДНК, который показывает ваши генетические особенности: предрасположенности к заболеваниям, реакцию на питание и лекарства, спортивный потенциал. Гены не меняются — тест сдаётся один раз.
2. "Как сдать биоматериал?" — Буккальный эпителий — мазок с внутренней стороны щеки ватной палочкой. Это безболезненно и занимает 30 секунд. Можно сдать в лаборатории или заказать выезд на дом.
3. "Сколько ждать результат?" — От 14 до 30 рабочих дней в зависимости от сложности теста. Результат появится в вашем личном кабинете.
4. "Что будет в отчёте?" — Расшифровка ваших генетических маркеров на понятном языке: какие риски выявлены, что это значит для вашего здоровья, и конкретные рекомендации по питанию, активности и образу жизни.
5. "Нужно ли повторять тест?" — Нет. Гены не меняются, поэтому генетический тест сдаётся один раз в жизни. Но вы можете заказать дополнительные панели для исследования других аспектов.
6. "Чем Genesis отличается от 23andMe?" — 23andMe даёт общий отчёт без персональных рекомендаций. Genesis фокусируется на клинически значимых маркерах и даёт конкретный план действий на основе доказательной медицины.
7. "Нужно ли направление врача?" — Нет. Генетический тест можно заказать самостоятельно. Но мы рекомендуем обсудить результаты с врачом для принятия медицинских решений.

### 8. Final CTA
- Title: "Готовы узнать свою генетику?"
- Subtitle: "Выберите тест и сделайте первый шаг к осознанному управлению здоровьем."
- CTA: "Перейти в каталог" → /catalog
- Muted note: "Результат через 14–30 рабочих дней. Тест сдаётся один раз."

---

## About Page

4 sections:

### Mission
"Genesis делает генетику доступной и полезной. Мы верим, что каждый человек имеет право понимать свой организм — не через сложные таблицы и непонятные аббревиатуры, а через ясные объяснения и конкретные рекомендации. Наша цель — превратить генетические данные в инструмент ежедневных решений о здоровье."

### Scientific Approach
"Наш подход основан на фреймворке Longevity Pyramid (Martinović et al., 2024, Frontiers in Aging) — пятиуровневой модели доказательных стратегий долголетия."
- 5 levels listed briefly (diagnostics → lifestyle → supplements → pharma → experimental)
- "Мы используем лонжевити-оптимальные диапазоны биомаркеров вместо стандартных лабораторных референсов. Каждая интерпретация подкреплена ссылками на научные исследования."

### How We're Different
Comparison table (from README):
| | InsideTracker | 23andMe | Viome | WHOOP/Oura | **Genesis** |
Rows: Генетика, Кровь/биомаркеры, Микробиом, Wearables, Единый AI-протокол, Нарратив «почему именно тебе»

### Vision
"Сегодня Genesis — это генетические тесты с понятной расшифровкой. Завтра — полная экосистема здоровья: импорт анализов крови, трекинг биомаркеров, расчёт биологического возраста, персональный AI-протокол и Genesis Coach — ваш личный ассистент здоровья."

---

## Contacts Page

- Title: "Свяжитесь с нами"
- Email card: hello@genesisbio.ru (with mailto link)
- Contact form: name, email, message — submits via `mailto:hello@genesisbio.ru` (no backend, using mailto URL encoding). Friendly note: "Обычно отвечаем в течение 24 часов."

---

## Technical Details

### Site Config Update
In `src/config/site.ts`:
- Remove `phone` and `telegram` from `links`
- Change `email` to `hello@genesisbio.ru`

### New Components
Create `src/components/landing/` directory with:
- `stats-bar.tsx` — section 2
- `benefits.tsx` — section 3
- `how-it-works.tsx` — section 4
- `popular-tests.tsx` — section 5 (async server component, Drizzle query)
- `personas.tsx` — section 6
- `faq.tsx` — section 7
- `final-cta.tsx` — section 8

### Modified Files
- `src/app/page.tsx` — complete rewrite, compose from landing components
- `src/app/(public)/about/page.tsx` — complete rewrite
- `src/app/(public)/contacts/page.tsx` — complete rewrite
- `src/config/site.ts` — update contact links
- `src/components/layout/footer.tsx` — update to remove phone/telegram references

### New shadcn Component Needed
- `Accordion` — for FAQ section. Install via: `npx shadcn@latest add accordion`

### Dynamic Data
- Popular tests section: `db.select().from(tests).leftJoin(categories, ...).where(eq(tests.isPopular, true)).limit(4)`
- Everything else is static content in components

## Out of Scope
- Blog/content marketing
- Animated illustrations or Lottie
- A/B testing
- Analytics integration
- Chat widget
- SEO meta tags optimization (separate task)
