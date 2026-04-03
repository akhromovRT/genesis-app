# Design: Longevity Calculator — PhenoAge

**Date:** 2026-04-04
**Status:** Approved
**Scope:** Public PhenoAge biological age calculator at /calculator

---

## Context

Genesis needs a free public SEO entry point to drive traffic → conversion to paid genetic tests. PhenoAge (Levine et al., 2018) is the most recognized biological age calculator — strong wow factor ("your bio age is 43 at chronological 50").

## Formula

Source: Levine et al. "An epigenetic biomarker of aging for lifespan and healthspan" (Aging, 2018).

**Input:** 9 blood biomarkers + chronological age

| # | Marker | Russian | Unit | Optimal Range |
|---|--------|---------|------|---------------|
| 1 | Albumin | Альбумин | г/л | 40–50 |
| 2 | Creatinine | Креатинин | мкмоль/л | 60–90 |
| 3 | Glucose | Глюкоза | ммоль/л | 4.0–5.2 |
| 4 | hsCRP | С-реактивный белок | мг/л | < 1.0 |
| 5 | Lymphocyte % | Лимфоциты | % | 25–40 |
| 6 | MCV | Средний объём эритроцита | фл | 82–95 |
| 7 | RDW | Ширина распределения эритроцитов | % | 11.5–14.0 |
| 8 | ALP | Щелочная фосфатаза | Ед/л | 40–100 |
| 9 | WBC | Лейкоциты | ×10⁹/л | 4.0–7.0 |

**Algorithm:**

Step 1 — linear combination `xb`:
```
xb = -19.9067
  - 0.0336 × Albumin
  + 0.0095 × Creatinine
  + 0.1953 × Glucose
  + 0.0954 × ln(CRP)
  - 0.0120 × Lymphocyte%
  + 0.0268 × MCV
  + 0.3306 × RDW
  + 0.00188 × ALP
  + 0.0554 × WBC
  + 0.0804 × Age
```

Step 2 — PhenoAge:
```
M = 1 - exp(-1.51714 × exp(xb) / 0.0076927)
PhenoAge = 141.50225 + ln(-0.00553 × ln(1 - M)) / 0.090165
```

## Page Structure

### 1. Hero
- Title: "Калькулятор биологического возраста"
- Subtitle: "Узнайте свой PhenoAge по 9 маркерам крови. Бесплатно, без регистрации."
- Note: "На основе исследования Levine et al., 2018"

### 2. Input Form
- Age field (required, number)
- 9 biomarker fields, each with:
  - Russian name + English code
  - Fixed unit
  - Placeholder with example normal value
  - Hint with reference range
- "Рассчитать" button
- Validation: Zod, all fields required, numbers > 0

### 3. Result (appears after calculation, no page reload)

**3a. Main — biological age:**
- Large number: "Ваш биологический возраст: **47 лет**"
- Difference: "На **3 года меньше** паспортного" (green if younger, red if older)
- Visual scale: ruler 20–100, marks for chronological and biological age

**3b. Marker assessment table:**
| Marker | Value | Optimal Range | Status |
Green circle (in range), yellow (borderline), red (out of range)

**3c. Recommendations for out-of-range markers:**
1-2 sentences per problematic marker — static text, not AI-generated.

**3d. "Details for nerds" — collapsible:**
- Full formula with coefficients
- Intermediate values (xb, M)
- Link to original paper

**3e. CTA block:**
- "Хотите понять **почему** ваши маркеры такие?"
- "Генетический тест покажет предрасположенности"
- Button "Выбрать генетический тест" → /catalog

### 4. Disclaimer
"Калькулятор предназначен для информационных целей. Не является медицинским диагнозом. Проконсультируйтесь с врачом для интерпретации результатов."

## Technical Details

### Architecture
- **Client-side calculation** — formula is simple, no server needed
- `"use client"` component for form + result
- react-hook-form + Zod for validation
- useState for result, scroll to result after calculation

### Files
- `src/lib/phenoage.ts` — formula, types, optimal ranges, marker recommendations
- `src/components/calculator/calculator-form.tsx` — input form
- `src/components/calculator/calculator-result.tsx` — result display
- `src/app/(public)/calculator/page.tsx` — page with SEO metadata

### Config Changes
- Add "Калькулятор" to navigation in `src/config/site.ts`
- Add `/calculator` to sitemap in `src/app/sitemap.ts`

### SEO Metadata
```
title: "Калькулятор биологического возраста PhenoAge | Genesis"
description: "Бесплатный калькулятор биологического возраста по формуле PhenoAge (Levine, 2018). Введите 9 маркеров крови и узнайте свой биовозраст."
```

## Out of Scope
- Unit conversion (only one unit per marker for MVP)
- Saving results to DB / user account
- PDF export
- Other calculators (HOMA-IR, Bortz, etc.)
- AI-generated recommendations
