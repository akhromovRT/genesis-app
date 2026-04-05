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
      const digestive = (a.step4?.digestive ?? "").toLowerCase();
      if (digestive.includes("запор")) triggers.push("Упомянуты запоры");
      return { matched: triggers.length >= 2, triggers };
    },
  },
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
      const sleepTime = a.step2?.sleepTime;
      const lastMeal = a.step2?.lastMealTimeWeekday;
      const triggers: string[] = [];
      let lateMeal = false;
      if (sleepTime && lastMeal) {
        const [sh, sm] = sleepTime.split(":").map(Number);
        const [lh, lm] = lastMeal.split(":").map(Number);
        const sleepMin = sh * 60 + sm + (sh < 6 ? 24 * 60 : 0);
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
