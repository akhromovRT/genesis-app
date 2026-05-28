import type { Metadata } from "next";
import { EarlyAccessForm } from "./form";

export const metadata: Metadata = {
  title: "Early Access — Genesis · Красивое долголетие по вашей ДНК",
  description:
    "Genesis — расширенная панель 225 ген-точек и научная база 2025–2026 года. Wellness-трио за 27 900 ₽ или полный пакет с 2 ч консультации Галины Хусаиновой. Только для гостей круглого стола.",
};

const blocks = [
  {
    num: "01",
    title: "Стройность и питание без угадывания",
    desc: "Почему подруга худеет на одной диете, а у вас вес стоит. Почему кофе бодрит или ломает сон. Почему после сладкого тянет ещё. Почему лицо «заливает» от соли, а железо, витамин D и B-витамины нельзя покупать вслепую.",
    helps:
      "Блок помогает понять индивидуальные стратегии питания, чувствительность к нутриентам, реакцию на жиры, сахар, кофеин и алкоголь, особенности усвоения витаминов и минералов.",
    price: "15 900 ₽",
  },
  {
    num: "02",
    title: "Тело в форме",
    desc: "Силовые или кардио, восстановление после нагрузок, риск травм связок и суставов, плотность костей.",
    helps:
      "Блок помогает понять, какие нагрузки строят именно ваше тело, где нужна осторожность и сколько времени телу нужно на восстановление.",
    price: "15 900 ₽",
  },
  {
    num: "03",
    title: "Beauty Safety",
    desc: "Почему ваша кожа стареет именно так и какие косметологические процедуры будут работать, а какие — нет.",
    helps:
      "Блок помогает понять кожный барьер, особенности коллагена и эластина, склонность к обезвоживанию, воспалительную реактивность, антиоксидантную защиту, гликирование, плотность тканей, гормональную эстетику 40+ и восстановление после косметологии.",
    price: "15 900 ₽",
  },
  {
    num: "04",
    title: "Мозг, сон, стресс и мотивация",
    desc: "Хронотип, естественная реакция на стресс, склонность к тревожности, выгоранию, снижению мотивации. Насколько критично соблюдать режим сна именно вашему организму.",
    helps:
      "Блок помогает понять, какие контуры качества жизни требуют защиты: сон, стресс, мотивация, дофаминовое подкрепление, тревожный фон, фокус, память и восстановление после перегруза.",
    price: "14 900 ₽",
  },
  {
    num: "05",
    title: "Основные риски здоровья + безопасная аптечка",
    desc: "Сердце, сосуды, гемостаз, воспаление, гормональный профиль, онконастороженность и индивидуальная реакция на лекарства.",
    helps:
      "Блок помогает понять, какие зоны здоровья важно контролировать внимательнее и какие препараты могут работать иначе: слабее, сильнее или с более высоким риском побочных эффектов.",
    price: "27 300 ₽",
    em: true,
  },
];

export default function EarlyAccessPage() {
  return (
    <div
      className="min-h-screen text-stone-800"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 75% 8%, rgba(31,107,74,0.10), transparent 60%), radial-gradient(ellipse 50% 40% at 12% 92%, rgba(176,141,87,0.12), transparent 60%), linear-gradient(180deg, #FAF7F2 0%, #F5EFE6 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-16">
        <p
          className="mb-6 text-[0.7rem] font-medium tracking-[0.32em] uppercase"
          style={{ color: "#1F6B4A" }}
        >
          Genesis · ДНК-отчёт · Early Access
        </p>
        <h1
          className="font-light leading-[1.04] tracking-tight text-4xl md:text-6xl"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Красивое долголетие <br />
          <em
            className="not-italic md:italic"
            style={{ color: "#1F6B4A", fontStyle: "italic" }}
          >
            по вашей ДНК
          </em>
        </h1>
        <p
          className="mt-6 max-w-2xl text-lg md:text-xl italic text-stone-600 leading-relaxed"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Ваше тело — не лотерея. ДНК — инструкция, которую мы помогаем
          корректно прочесть.
        </p>
        <div className="mt-8">
          <a
            href="#early-access-form"
            className="inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium text-white shadow-sm transition hover:shadow-md"
            style={{ background: "#1F6B4A" }}
          >
            Зафиксировать лучшую цену 27 900 ₽
            <span aria-hidden="true">→</span>
          </a>
          <p className="mt-3 text-xs text-stone-500">
            Только для гостей круглого стола · Wellness-трио. Полный пакет с
            консультацией — на форме.
          </p>
        </div>
      </div>

      {/* ── INTRO ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-start">
          <div>
            <p
              className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase"
              style={{ color: "#B08D57" }}
            >
              В одном предложении
            </p>
            <h2
              className="text-2xl md:text-3xl font-light leading-snug"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Персональная{" "}
              <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
                генетическая карта
              </em>{" "}
              для женщины, которая хочет оставаться{" "}
              <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
                стройной, энергичной и ухоженной
              </em>{" "}
              в каждом возрасте.
            </h2>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-stone-600">
              <div>
                <span
                  className="text-2xl mr-1"
                  style={{
                    color: "#1F6B4A",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  225
                </span>
                ген-точек
              </div>
              <div>
                <span
                  className="text-2xl mr-1"
                  style={{
                    color: "#1F6B4A",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  5
                </span>
                модульных блоков
              </div>
              <div>
                <span
                  className="text-2xl mr-1"
                  style={{
                    color: "#1F6B4A",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  1
                </span>
                генетический анализ
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-white/60 backdrop-blur p-7">
            <p
              className="text-[0.7rem] mb-3 font-medium tracking-[0.32em] uppercase"
              style={{ color: "#B08D57" }}
            >
              Глубже и точнее
            </p>
            <div
              className="text-5xl md:text-6xl font-light leading-none"
              style={{
                color: "#1F6B4A",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              до +50<sup className="text-base text-stone-400">%</sup>
            </div>
            <p className="mt-4 text-sm text-stone-700 leading-relaxed">
              больше проверенных ген-точек по сравнению с типовыми ДНК-панелями
              на 140–150 маркеров. Genesis использует расширенную панель из{" "}
              <strong>225 ген-точек</strong> и обновлённую научную базу{" "}
              <strong>2025–2026 года</strong>.
            </p>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Мы смотрим не отдельные «гены интереса», а{" "}
              <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
                связи между питанием, весом, кожей, восстановлением, стрессом,
                основными рисками здоровья и реакцией на лекарства
              </em>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── 5 BLOCKS ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <p
          className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase"
          style={{ color: "#B08D57" }}
        >
          Один анализ — 5 модульных блоков
        </p>
        <h2
          className="text-3xl md:text-4xl font-light leading-tight mb-10"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          От{" "}
          <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
            «что со мной не так»
          </em>{" "}
          — к персональному протоколу
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b) => (
            <div
              key={b.num}
              className={`rounded-2xl p-7 border ${
                b.em
                  ? "border-emerald-700/30 bg-emerald-700/[0.04]"
                  : "border-stone-200/70 bg-white/60"
              }`}
            >
              <div className="flex items-baseline justify-between mb-4">
                <span
                  className="text-2xl italic font-light"
                  style={{
                    color: b.em ? "#1F6B4A" : "#B08D57",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {b.num}
                </span>
                <span
                  className="text-xl font-light"
                  style={{
                    color: "#1F6B4A",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {b.price}
                </span>
              </div>
              <h3
                className="text-xl font-light leading-snug mb-3"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {b.title}
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed mb-3">
                {b.desc}
              </p>
              <p className="text-sm text-stone-500 leading-relaxed italic">
                {b.helps}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EARLY ACCESS OFFER ─────────────────────────── */}
      <section
        className="text-stone-50 py-16 md:py-24"
        style={{
          background:
            "linear-gradient(135deg, #144B33 0%, #1F6B4A 60%, #2D9067 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase text-stone-100/80">
            Только для гостей круглого стола
          </p>
          <h2
            className="text-5xl md:text-6xl font-light leading-none mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Wellness-трио
          </h2>
          <p
            className="text-stone-100/85 italic text-lg mb-12 max-w-2xl"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            три ключевых блока — питание, тело, Beauty Safety
          </p>

          <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-start">
            <div>
              <div
                className="text-7xl md:text-8xl font-light leading-none mb-3"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  letterSpacing: "-0.04em",
                }}
              >
                27 900 <sup className="text-base text-amber-200">₽</sup>
              </div>
              <p
                className="text-stone-100/85 italic mb-8"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                для участников этого зала
              </p>
              <p
                className="text-[0.7rem] mb-3 font-medium tracking-[0.32em] uppercase text-amber-200"
              >
                Что входит
              </p>
              <ul className="space-y-3">
                {[
                  "01 · Стройность и питание",
                  "02 · Тело в форме",
                  "03 · Beauty Safety",
                  "Закрытый чат участников Early Access",
                  "Действует 7 дней после встречи",
                ].map((p) => (
                  <li
                    key={p}
                    className="relative pl-7 text-base leading-snug"
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}
                  >
                    <span className="absolute left-0 top-1 text-amber-300">
                      ✦
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-300/30 bg-white/[0.06] p-8 backdrop-blur">
              <p className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase text-amber-200">
                Полный пакет
              </p>
              <p
                className="text-xl md:text-2xl font-light leading-snug mb-5"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                Привычки и риски важно отслеживать{" "}
                <em
                  className="not-italic"
                  style={{ color: "#FCD34D", fontStyle: "italic" }}
                >
                  в динамике
                </em>
                .
              </p>
              <p
                className="text-xl md:text-2xl font-light leading-snug mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                Отдельно 2 часа консультации стоят{" "}
                <em
                  className="not-italic"
                  style={{ color: "#FCD34D", fontStyle: "italic" }}
                >
                  30 000 ₽
                </em>
                . В полном пакете они уже включены.
              </p>
              <div className="border-t border-amber-300/20 pt-6">
                <a
                  href="#early-access-form"
                  className="inline-flex items-center gap-3 rounded-full bg-amber-300 px-7 py-4 text-base font-medium text-emerald-950 transition hover:bg-amber-200"
                >
                  Хочу полный пакет
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ────────────────────────────────────────── */}
      <section
        id="early-access-form"
        className="mx-auto max-w-3xl px-6 py-16 md:py-24 scroll-mt-12"
      >
        <p
          className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase"
          style={{ color: "#1F6B4A" }}
        >
          30 секунд
        </p>
        <h2
          className="text-3xl md:text-4xl font-light leading-tight mb-3"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Оставьте контакт{" "}
          <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
            и зафиксируйте
          </em>{" "}
          Early Access
        </h2>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Мы свяжемся с вами в течение 24 часов, расскажем детали и поможем
          оформить заявку в ближайшей партнёрской лаборатории — в офисе или с
          выездом на дом.
        </p>
        <EarlyAccessForm />
      </section>

      <footer className="mx-auto max-w-4xl px-6 pb-16 pt-4 text-sm text-stone-600 leading-relaxed space-y-4">
        <p>
          <strong className="text-stone-700">Genesis</strong> — персональная
          система оздоровления и активного долголетия.
        </p>
        <p>
          Мы не ставим диагнозы, не назначаем лечение и не заменяем консультацию
          врача или узкого специалиста по отдельным патологиям.
        </p>
        <p>
          Генетический отчёт используется как инструмент профилактического
          мышления, персонализации образа жизни и более точной подготовки к
          обсуждению здоровья со специалистами.
        </p>
        <p>
          Genesis поддерживает современную повестку сохранения здоровья и
          активного долголетия. Мы помогаем выявлять индивидуальные уязвимости
          раньше и персонализировать решения, которые снижают управляемые риски
          преждевременной смертности и инвалидизации по естественным причинам.
        </p>
        <p className="text-xs text-stone-400 pt-4">
          © 2026 Genesis · genesisbio.ru/early-access
        </p>
      </footer>
    </div>
  );
}
