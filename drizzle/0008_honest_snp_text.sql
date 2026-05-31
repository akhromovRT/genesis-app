-- ─────────────────────────────────────────────────────────────────────────────
-- 0008_honest_snp_text
--
-- Честные уникальные числа SNP не только в markers_count (0006/0007), но и в
-- ТЕКСТОВЫХ полях продуктов (description / full_description / meta_*), которые
-- рендерятся на витрине и страницах блоков. В 0005 в прозу зашиты старые числа
-- (блок1 55, блок2 23, блок3 25, блок4 13, полный пакет 225). Приводим к честным
-- уникальным: 51 / 28 / 27 / 12 и 184. Блок 5 и Трио уже без чисел в прозе.
--
-- Грамматика русского счёта: 51 → «ген-точка» (1), 184 → «ген-точки» (…4),
-- 28/27/12 → «ген-точек».
--
-- Идемпотентно: REPLACE по точной подстроке; повторный запуск — no-op.
-- ─────────────────────────────────────────────────────────────────────────────

-- Блок 1 (nutrition): 55 → 51
UPDATE "tests" SET
  "full_description" = REPLACE("full_description", '55 ген-точек', '51 ген-точка'),
  "meta_description" = REPLACE("meta_description", '55 ген-точек', '51 ген-точка'),
  "updated_at" = now()
WHERE "slug" = 'nutrition';

-- Блок 2 (body): 23 → 28
UPDATE "tests" SET
  "full_description" = REPLACE("full_description", '23 ген-точки', '28 ген-точек'),
  "meta_description" = REPLACE("meta_description", '23 ген-точки', '28 ген-точек'),
  "updated_at" = now()
WHERE "slug" = 'body';

-- Блок 3 (beauty-safety): 25 → 27
UPDATE "tests" SET
  "full_description" = REPLACE("full_description", '25 ген-точек', '27 ген-точек'),
  "meta_description" = REPLACE("meta_description", '25 ген-точек', '27 ген-точек'),
  "updated_at" = now()
WHERE "slug" = 'beauty-safety';

-- Блок 4 (mind): 13 → 12
UPDATE "tests" SET
  "full_description" = REPLACE("full_description", '13 ген-точек', '12 ген-точек'),
  "meta_description" = REPLACE("meta_description", '13 ген-точек', '12 ген-точек'),
  "updated_at" = now()
WHERE "slug" = 'mind';

-- Полный пакет (full-package): 225 → 184
UPDATE "tests" SET
  "description"      = REPLACE("description",      '225 ген-точек', '184 ген-точки'),
  "full_description" = REPLACE("full_description", '225 ген-точек', '184 ген-точки'),
  "meta_title"       = REPLACE("meta_title",       '225 ген-точек', '184 ген-точки'),
  "meta_description" = REPLACE("meta_description", '225 ген-точек', '184 ген-точки'),
  "updated_at" = now()
WHERE "slug" = 'full-package';
