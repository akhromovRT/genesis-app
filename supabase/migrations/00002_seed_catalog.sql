-- Genesis MVP v1: Seed catalog data from CERBALAB
-- Prices stored in kopecks (1 RUB = 100 kopecks)

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO public.categories (name, slug, description, sort_order) VALUES
('Генетические паспорта', 'geneticheskie-pasporta', 'Комплексные генетические исследования: моногенная патология, предрасположенность к заболеваниям, потенциал долголетия.', 1),
('Спортивная генетика', 'sportivnaya-genetika', 'Анализ аэробной и анаэробной выносливости, мышечных характеристик, спортивной мотивации.', 2),
('Нутригеномика и витамины', 'nutrigenomika-i-vitaminy', 'Генетическая диета, метаболизм витаминов и нутриентов, индивидуальные потребности организма.', 3),
('Эстетика и косметология', 'estetika-i-kosmetologiya', 'Генетические предрасположенности кожи: увлажнение, коллаген, биостарение, фотозащита.', 4),
('Сердечно-сосудистые заболевания', 'serdechno-sosudistye', 'Риски ССЗ, атеросклероз, гипертония, тромбофилия, липидный обмен.', 5),
('Онкология', 'onkologiya', 'Анализ генетических маркеров риска онкологических заболеваний.', 6),
('Эндокринные заболевания', 'endokrinnye', 'Сахарный диабет, метаболизм стероидных гормонов, гиперандрогения.', 7),
('Заболевания ЖКТ', 'zabolevaniya-zhkt', 'Болезни желудочно-кишечного тракта, целиакия, лактазная недостаточность.', 8),
('Фармакогенетика', 'farmakogenetika', 'Подбор лекарственных препаратов на основе индивидуального генетического профиля.', 9),
('Репродуктивное здоровье', 'reproduktivnoe-zdorove', 'Подготовка к беременности, ЭКО, невынашивание, мужское бесплодие.', 10),
('Иммунные заболевания', 'immunnye-zabolevaniya', 'Аутоиммунные заболевания, атопия, воспалительный ответ.', 11),
('Костная система', 'kostnaya-sistema', 'Метаболизм костной ткани, остеопороз, суставы.', 12),
('Психоневрологические', 'psikhonevrologicheskie', 'Медиаторные нарушения, болезнь Альцгеймера, когнитивное здоровье.', 13),
('Детоксикация и восстановление', 'detoksikatsiya', 'Детоксикация, метаболизм, восстановительный потенциал организма.', 14);

-- ============================================================
-- TESTS
-- ============================================================

-- Генетические паспорта
INSERT INTO public.tests (category_id, name, slug, code, price, description, markers_count, turnaround_days, biomaterial, is_popular) VALUES
((SELECT id FROM categories WHERE slug = 'geneticheskie-pasporta'), 'Клинический генетический паспорт (моногенная патология + предрасположенность)', 'klinicheskiy-pasport-polnyy', 'M-1320', 8580000, 'Самое полное генетическое исследование: моногенная патология и предрасположенность к 200+ заболеваниям. Включает все домены анализа.', 200, 30, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'geneticheskie-pasporta'), 'Клинический генетический паспорт (предрасположенность)', 'klinicheskiy-pasport-predraspolozhennost', 'M-1310', 6050000, 'Анализ предрасположенности к 200+ заболеваниям на основе генетических маркеров.', 200, 30, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'geneticheskie-pasporta'), 'Оптимальный генетический паспорт', 'optimalnyy-pasport', 'M-1311', 4180000, 'Сбалансированный набор из 49 ключевых генетических маркеров для оценки рисков и потенциала здоровья.', 49, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'geneticheskie-pasporta'), 'Генетический паспорт при сахарном диабете (д-р Лейбиман)', 'pasport-diabet-leybiman', 'M-1312', 3950000, 'Специализированный генетический паспорт для людей с сахарным диабетом. Разработан доктором натуропатии Лейбиманом.', NULL, 21, 'Буккальный эпителий / кровь', false),

-- Спортивная генетика
((SELECT id FROM categories WHERE slug = 'sportivnaya-genetika'), 'Полный спортивный паспорт', 'polnyy-sportivnyy-pasport', 'M-1307', 3190000, 'Полный анализ спортивных генов: выносливость, сила, скорость, восстановление, травматизм, мотивация.', 36, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'sportivnaya-genetika'), 'Оптимальный спортивный паспорт', 'optimalnyy-sportivnyy-pasport', 'M-1306', 2450000, 'Ключевые спортивные маркеры: тип мышечных волокон, аэробная/анаэробная выносливость, риск травм.', 21, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'sportivnaya-genetika'), 'Минимальный спортивный паспорт', 'minimalnyy-sportivnyy-pasport', 'M-1305', 750000, 'Базовый набор спортивных маркеров для подбора оптимальных тренировок.', 9, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'sportivnaya-genetika'), 'Общая выносливость и оптимальные нагрузки', 'obshchaya-vynoslivost', 'CG-1942', 1870000, 'Анализ генов, определяющих общую выносливость и оптимальные физические нагрузки.', 19, 14, 'Буккальный эпителий / кровь', false),

-- Нутригеномика и витамины
((SELECT id FROM categories WHERE slug = 'nutrigenomika-i-vitaminy'), 'Нутригеномика «Генетическая диета»', 'geneticheskaya-dieta', 'M-4', 2910000, 'Персонализированная генетическая диета на основе анализа 32 маркеров метаболизма нутриентов.', 32, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'nutrigenomika-i-vitaminy'), 'Гены витаминов', 'geny-vitaminov', 'M-1316', 1260000, 'Анализ генетических особенностей метаболизма витаминов: усвоение, потребность, дефициты.', 25, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'nutrigenomika-i-vitaminy'), 'Метаболизм кофеина', 'metabolizm-kofeina', 'GP-1907', 380000, 'Генетические особенности метаболизма кофеина: быстрый/медленный метаболизатор.', 4, 14, 'Буккальный эпителий / кровь', false),

-- Эстетика и косметология
((SELECT id FROM categories WHERE slug = 'estetika-i-kosmetologiya'), 'Генетическая панель «Косметология»', 'panel-kosmetologiya', 'M-1300', 1570000, 'Комплексный анализ генов, влияющих на состояние кожи: увлажнение, эластичность, коллаген, пигментация.', 17, 14, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'estetika-i-kosmetologiya'), 'Биостарение кожи и регенерация', 'biostarenie-kozhi', 'CG-1948', 680000, 'Предрасположенность к нарушению коллагенового каркаса кожи, скорость биостарения, регенерация и рубцевание.', 7, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'estetika-i-kosmetologiya'), 'Риск повышенной сухости кожи', 'risk-sukhosti-kozhi', 'CG-1935', 160000, 'Генетическая предрасположенность к повышенной сухости кожи.', 1, 14, 'Буккальный эпителий / кровь', false),

-- Сердечно-сосудистые заболевания
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Генетический риск ССЗ (полная панель)', 'risk-ssz-polnaya', 'GP-208', 3630000, 'Полный анализ генетических рисков сердечно-сосудистых заболеваний: 60 маркеров.', 60, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Атеросклероз аорты и коронарных сосудов', 'ateroskleroz', 'GP-202', 2970000, 'Генетическая предрасположенность к атеросклерозу аорты и коронарных сосудов.', 32, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Генетический риск артериальной гипертонии (расширенная)', 'risk-gipertonii-rasshirennaya', 'GP-201', 1320000, 'Расширенный анализ генетической предрасположенности к артериальной гипертонии.', 14, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Артериальная гипертония', 'arterialnaya-gipertoniya', 'GP-215', 600000, 'Базовый анализ генетической предрасположенности к артериальной гипертонии.', 11, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Липидный обмен', 'lipidnyy-obmen', 'GP-203', 630000, 'Генетические особенности липидного обмена и риски дислипидемии.', 11, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Гипергомоцистеинемия', 'gipergomotsisteinemiya', 'GP-204', 250000, 'Генетическая предрасположенность к повышенному уровню гомоцистеина.', 4, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Тромбофилия и подбор препаратов', 'trombofiliya-polnaya', 'GP-207', 3190000, 'Полный анализ тромбофилии с фармакогенетическим подбором препаратов.', 36, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Тромбофилия', 'trombofiliya', 'GP-206', 440000, 'Генетическая предрасположенность к тромбофилии — 12 маркеров.', 12, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'serdechno-sosudistye'), 'Тромбофилия (минимальная)', 'trombofiliya-minimalnaya', 'GP-205', 190000, 'Базовый скрининг на два основных маркера тромбофилии (фактор V Лейдена и протромбин).', 2, 14, 'Буккальный эпителий / кровь', false),

-- Онкология
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Риск онкозаболеваний (полная панель)', 'risk-onko-polnaya', 'GP-109', 3190000, 'Анализ 40 генетических маркеров риска онкологических заболеваний.', 40, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Риск онкозаболеваний (оптимальная)', 'risk-onko-optimalnaya', 'GP-108', 2090000, 'Анализ 21 ключевого маркера онкологических рисков.', 21, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак лёгких, желудка и толстого кишечника', 'rak-legkikh-zheludka-kishechnika', 'GP-111', 1370000, 'Генетическая предрасположенность к раку лёгких, желудка и толстого кишечника.', 10, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак молочной железы и яичников (расширенная)', 'rak-molochnoy-zhelezy-rasshirennaya', 'GP-105', 880000, 'Расширенный анализ рисков рака молочной железы и яичников — 16 маркеров, включая BRCA1/BRCA2.', 16, 14, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак молочной железы и яичников', 'rak-molochnoy-zhelezy', 'GP-104', 410000, 'Базовый анализ рисков рака молочной железы и яичников — 7 маркеров BRCA.', 7, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак предстательной железы', 'rak-prostaty', 'GP-110', 880000, 'Генетическая предрасположенность к раку предстательной железы.', 13, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак толстого кишечника, желудка и мочевого пузыря', 'rak-kishechnika-zheludka-puzyrya', 'GP-101', 570000, 'Генетические маркеры риска рака толстого кишечника, желудка и мочевого пузыря.', 6, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Рак щитовидной железы', 'rak-shchitovidnoy-zhelezy', 'GP-601', 600000, 'Генетическая предрасположенность к раку щитовидной железы.', 4, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'onkologiya'), 'Антиоксидантная защита', 'antioksidantnaya-zashchita', 'GP-107', 570000, 'Генетические особенности антиоксидантной защитной системы организма.', 8, 14, 'Буккальный эпителий / кровь', false),

-- Эндокринные заболевания
((SELECT id FROM categories WHERE slug = 'endokrinnye'), 'Метаболизм стероидных гормонов (расширенная)', 'metabolizm-gormonov-rasshirennaya', 'GP-404', 750000, 'Расширенный анализ метаболизма стероидных гормонов — 18 маркеров.', 18, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'endokrinnye'), 'Метаболизм стероидных гормонов', 'metabolizm-gormonov', 'GP-406', 460000, 'Базовый анализ метаболизма стероидных гормонов — 6 маркеров.', 6, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'endokrinnye'), 'Сахарный диабет II типа и осложнения', 'diabet-2-tipa', 'GP-402', 630000, 'Генетическая предрасположенность к сахарному диабету II типа и его осложнениям.', 12, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'endokrinnye'), 'Сахарный диабет I типа', 'diabet-1-tipa', 'GP-401', 350000, 'Генетическая предрасположенность к сахарному диабету I типа.', NULL, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'endokrinnye'), 'Гиперандрогения', 'giperandrogeniya', 'GP-407', 150000, 'Генетическая предрасположенность к гиперандрогении.', 1, 14, 'Буккальный эпителий / кровь', false),

-- Заболевания ЖКТ
((SELECT id FROM categories WHERE slug = 'zabolevaniya-zhkt'), 'Болезни ЖКТ (полная панель)', 'bolezni-zhkt-polnaya', 'GP-505', 3630000, 'Комплексный анализ генетической предрасположенности к заболеваниям ЖКТ — 40 маркеров.', 40, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'zabolevaniya-zhkt'), 'Болезнь Крона', 'bolezn-krona', 'GP-501', 440000, 'Генетическая предрасположенность к болезни Крона.', 4, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'zabolevaniya-zhkt'), 'Неспецифический язвенный колит', 'yazvennyy-kolit', 'GP-502', 310000, 'Генетическая предрасположенность к неспецифическому язвенному колиту.', 5, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'zabolevaniya-zhkt'), 'Целиакия (глютеновая болезнь)', 'tseliakiya', 'GP-503', 550000, 'Генетическая предрасположенность к целиакии.', NULL, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'zabolevaniya-zhkt'), 'Лактазная недостаточность', 'laktaznaya-nedostatochnost', 'GP-504', 160000, 'Генетическая предрасположенность к непереносимости лактозы.', NULL, 14, 'Буккальный эпителий / кровь', false),

-- Фармакогенетика
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Фармакогенетика (общая панель)', 'farmakogenetika-obshchaya', 'FG-1227', 1320000, 'Общий фармакогенетический анализ для подбора лекарственных препаратов.', 20, 14, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Антигипертензивные препараты', 'farma-antigipertenzivnye', 'FG-1210', 770000, 'Фармакогенетика антигипертензивных препаратов.', 8, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Антикоагулянты и антиагреганты', 'farma-antikoagulyasty', 'FG-1212', 930000, 'Фармакогенетика антикоагулянтов и антиагрегантов.', 10, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Статины', 'farma-statiny', 'FG-1215', 440000, 'Фармакогенетика статинов — подбор оптимального препарата и дозировки.', 5, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Сахароснижающие препараты', 'farma-sakharosnizhayushchie', 'FG-1230', 460000, 'Подбор дозы пероральных сахароснижающих препаратов.', 5, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Серотониновая система', 'farma-serotonin', 'FG-1231', 380000, 'Фармакогенетика серотониновой системы.', 2, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'НПВП (нестероидные противовоспалительные)', 'farma-npvp', 'FG-1225', 320000, 'Фармакогенетика нестероидных противовоспалительных препаратов.', 2, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Метотрексат', 'farma-metotreksat', 'FG-1241', 130000, 'Фармакогенетика метотрексата (SLC19A1).', 1, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Медиаторные нарушения + подбор антидепрессантов', 'farma-antidepressanty', 'FG-1208', 1070000, 'Медиаторные нарушения с фармакогенетическим подбором антидепрессантов.', 13, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'farmakogenetika'), 'Метаболизм алкоголя', 'metabolizm-alkogolya', 'FG-1222', 320000, 'Генетические особенности метаболизма алкоголя.', 3, 14, 'Буккальный эпителий / кровь', false),

-- Репродуктивное здоровье
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Счастливая беременность', 'schastlivaya-beremennost', 'GP-706', 3630000, 'Полный генетический анализ для планирования беременности — 59 маркеров.', 59, 21, 'Буккальный эпителий / кровь', true),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Подготовка к беременности (невынашивание)', 'podgotovka-nevynashivanie', 'GP-704', 1650000, 'Анализ рисков невынашивания и осложнений беременности.', 30, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Подготовка к беременности', 'podgotovka-beremennost', 'GP-789', 1320000, 'Базовый генетический анализ для подготовки к беременности.', 15, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Подготовка к ЭКО', 'podgotovka-eko', 'GP-705', 1130000, 'Генетический анализ для подготовки к процедуре ЭКО.', 19, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Риски осложнений беременности', 'riski-oslozhneniy-beremennosti', 'CG-1934', 580000, 'Скрининг генетических рисков осложнений беременности.', 5, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Риски гормональной контрацепции', 'riski-kontratseptsii', 'GP-701', 660000, 'Генетические риски при применении гормональной контрацепции.', 16, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Мужское бесплодие', 'muzhskoe-besplodie', 'GP-708', 880000, 'Генетические причины мужского бесплодия.', 12, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Мужское бесплодие (азооспермия)', 'muzhskoe-besplodie-azoospermiya', 'GP-707', 440000, 'Генетический анализ азооспермии.', NULL, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'reproduktivnoe-zdorove'), 'Предрасположенность к СПКЯ', 'spkya', 'GP-703', 770000, 'Генетическая предрасположенность к синдрому поликистозных яичников.', 7, 14, 'Буккальный эпителий / кровь', false),

-- Иммунные заболевания
((SELECT id FROM categories WHERE slug = 'immunnye-zabolevaniya'), 'Предрасположенность к атопии', 'predraspolozhennost-atopiya', 'CG-1947', 680000, 'Генетическая предрасположенность к атопии. Иммунобиологическая терапия.', 7, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'immunnye-zabolevaniya'), 'Воспалительный ответ', 'vospalitelnyy-otvet', 'GP-508', 1260000, 'Генетические особенности воспалительного ответа организма.', 10, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'immunnye-zabolevaniya'), 'Болезнь Грейвса (аутоиммунный тиреоидит)', 'bolezn-greyvsa', 'GP-602', 740000, 'Генетическая предрасположенность к болезни Грейвса.', 8, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'immunnye-zabolevaniya'), 'Болезнь Бехтерева', 'bolezn-bekhtereva', 'GP-603', 280000, 'Генетическая предрасположенность к болезни Бехтерева (анкилозирующий спондилит).', 1, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'immunnye-zabolevaniya'), 'Аутоиммунное поражение суставов', 'autoimmunnoe-porazhenie-sustavov', 'GP-1240', 350000, 'Генетическая предрасположенность к аутоиммунному поражению суставов.', 2, 14, 'Буккальный эпителий / кровь', false),

-- Костная система
((SELECT id FROM categories WHERE slug = 'kostnaya-sistema'), 'Метаболизм костной ткани (расширенная)', 'metabolizm-kostnoy-tkani-rasshirennaya', 'GP-506', 640000, 'Расширенный анализ метаболизма костной ткани — 11 маркеров.', 11, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'kostnaya-sistema'), 'Метаболизм костной ткани', 'metabolizm-kostnoy-tkani', 'GP-507', 440000, 'Базовый анализ метаболизма костной ткани — 3 маркера.', 3, 14, 'Буккальный эпителий / кровь', false),

-- Психоневрологические
((SELECT id FROM categories WHERE slug = 'psikhonevrologicheskie'), 'Медиаторные нарушения', 'mediatornye-narusheniya', 'GP-801', 480000, 'Генетический анализ медиаторных нарушений нервной системы.', 6, 14, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'psikhonevrologicheskie'), 'Болезнь Альцгеймера', 'bolezn-altsgeymera', 'GP-803', 280000, 'Генетическая предрасположенность к болезни Альцгеймера (APOE).', 2, 14, 'Буккальный эпителий / кровь', false),

-- Детоксикация и восстановление
((SELECT id FROM categories WHERE slug = 'detoksikatsiya'), 'Детоксикация и метаболизм', 'detoksikatsiya-i-metabolizm', 'D-1', 3410000, 'Комплексный анализ генов детоксикации и метаболизма — 55 маркеров.', 55, 21, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'detoksikatsiya'), 'Восстановительный потенциал', 'vosstanovitelnyy-potentsial', 'GP-1919', 5490000, 'Полный анализ восстановительного потенциала организма — 58 маркеров.', 58, 30, 'Буккальный эпителий / кровь', false),
((SELECT id FROM categories WHERE slug = 'detoksikatsiya'), 'Устойчивость к ВИЧ-инфекции', 'ustoychivost-vich', 'K-1', 130000, 'Анализ генов устойчивости к ВИЧ-инфекции.', 1, 14, 'Буккальный эпителий / кровь', false);
