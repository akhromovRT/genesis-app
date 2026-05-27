import type { Metadata } from "next";
import { EarlyAccessForm } from "./form";

export const metadata: Metadata = {
  title: "Early Access — Genesis · Красивое долголетие по вашей ДНК",
  description:
    "Genesis ДНК-отчёт. Wellness-трио (питание, тело, beauty) за 27 900 ₽ вместо 42 900 ₽ — только для гостей круглого стола. Экономия 15 000 ₽.",
};

const blocks = [
  {
    num: "01",
    title: "Стройность и питание",
    desc: "Жиры, сахар, кофе, лактоза. Почему вы поправляетесь от того, от чего подруга — нет.",
    price: "15 900 ₽",
  },
  {
    num: "02",
    title: "Тело в форме",
    desc: "Кардио или силовая, восстановление, ваши суставы, риск травм.",
    price: "15 900 ₽",
  },
  {
    num: "03",
    title: "Beauty Safety",
    desc: "Кожа, морщины, пигментация. Какие косметологические процедуры будут работать, а какие — нет.",
    price: "15 900 ₽",
  },
  {
    num: "04",
    title: "Мозг, сон, стресс и мотивация",
    desc: "Хронотип, регуляция стресса, мотивация и восстановление. На что критично соблюдать режим именно вашему организму.",
    price: "14 900 ₽",
  },
  {
    num: "05",
    title: "Риски и персональная аптечка",
    desc: "Сердце, сосуды, онконастороженность. Где выше риск побочных эффектов лекарств. Включает 2 ч консультации с Галиной Хусаиновой.",
    price: "27 300 ₽",
    em: true,
  },
];

const promises = [
  "Wellness-трио — три ключевых блока без консультации",
  "Закрытый чат участников Early Access",
  "Действует 7 дней после встречи",
  "Возможность апгрейда до полного пакета с консультацией",
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
          Ваше тело — не лотерея. Это инструкция, которую вы ещё не прочитали.
        </p>
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
              в любом возрасте.
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
              Почему мы точнее
            </p>
            <div
              className="text-5xl md:text-6xl font-light leading-none"
              style={{
                color: "#1F6B4A",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
            >
              +50<sup className="text-base text-stone-400">%</sup>
            </div>
            <p className="mt-4 text-sm text-stone-600 leading-relaxed">
              достоверность интерпретации vs распространённые ДНК-отчёты на рынке.{" "}
              Большинство — на научной базе 5–10 лет. Genesis опирается на
              исследования, актуальные на 2025–2026 год. База регулярно
              обновляется.
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
          5 модульных блоков
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
                className="text-xl font-light leading-snug mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {b.title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">{b.desc}</p>
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
            className="text-stone-100/85 italic text-lg mb-12"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            три ключевых блока — питание, тело, beauty
          </p>

          <div className="grid gap-10 md:grid-cols-2 md:gap-16 items-center">
            <div>
              <div
                className="text-stone-100/50 line-through text-xl mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                42 900 ₽
              </div>
              <div className="text-stone-100/50 text-xs mb-6">
                обычная цена wellness-трио
              </div>
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
                className="text-stone-100/90 italic mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                для участников этого зала
              </p>
              <div className="inline-block pt-3 border-t border-amber-300/40 text-xs tracking-[0.28em] uppercase text-amber-200">
                Экономия 15 000 ₽
              </div>
            </div>

            <ul className="space-y-4">
              {promises.map((p) => (
                <li
                  key={p}
                  className="relative pl-8 text-lg leading-snug border-b border-stone-100/12 pb-4 last:border-b-0"
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
        </div>
      </section>

      {/* ── FORM ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p
          className="text-[0.7rem] mb-4 font-medium tracking-[0.32em] uppercase"
          style={{ color: "#1F6B4A" }}
        >
          30 секунд
        </p>
        <h2
          className="text-3xl md:text-4xl font-light leading-tight mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Оставьте контакт{" "}
          <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
            и зафиксируйте
          </em>{" "}
          цену <span style={{ color: "#1F6B4A" }}>27 900 ₽</span>
        </h2>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Мы свяжемся в течение 24 часов, расскажем детали и поможем с заказом
          биоматериала.
        </p>
        <EarlyAccessForm />
      </section>

      <footer className="mx-auto max-w-6xl px-6 pb-12 pt-4 text-xs text-stone-500">
        <p>
          genesisbio.ru/early-access · Genesis — не медицинская услуга. Не
          ставим диагнозов, не назначаем лечение. Сфера ЗОЖ и натуропрактики.
        </p>
      </footer>
    </div>
  );
}
