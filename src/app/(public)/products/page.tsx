export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import {
  getActiveBlocks,
  getActivePackages,
  calculateAnchorPrice,
  formatPrice,
  type ProductBlock,
} from "@/lib/products/blocks";
import { BlockCard } from "@/components/products/block-card";
import { PackageCard } from "@/components/products/package-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, FlaskConical, Microscope } from "lucide-react";

export const metadata: Metadata = {
  title: "ДНК-отчёт «Красивое долголетие» — 5 блоков и пакеты | Genesis",
  description:
    "Персональная ДНК-карта по 184 ген-точкам: питание, тело, кожа, мозг, риски. От базового блока 15 900 ₽ до полного отчёта 65 000 ₽.",
};

const HIGHLIGHT_BY_SLUG: Record<string, "entry" | "bestseller" | null> = {
  nutrition: "entry",
  "beauty-safety": "bestseller",
};

export default async function ProductsPage() {
  const [blocks, packages] = await Promise.all([getActiveBlocks(), getActivePackages()]);
  const blocksBySlug = new Map<string, ProductBlock>(blocks.map((b) => [b.slug, b]));
  const anchorPrice = calculateAnchorPrice(blocks);
  const fullPackage = packages.find((p) => p.slug === "full-package");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="text-center">
        <Badge variant="outline" className="mb-4">
          ДНК-отчёт «Красивое долголетие»
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          Красивое долголетие по вашей ДНК
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Полный ДНК-отчёт «Красивое долголетие» — 184 ген-точки в 5 блоках. Можно взять
          целиком, со скидкой и 2 часами консультации, — или пройти путь пошагово, начиная
          с питания.
        </p>
      </section>

      {/* ── Главное предложение: полный пакет ────────────────── */}
      {fullPackage && (
        <section className="mt-12">
          <Card className="overflow-hidden border-primary shadow-lg ring-1 ring-primary/30">
            <CardContent className="grid gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="default" className="mb-3">Главное предложение</Badge>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {fullPackage.name}
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Все 5 блоков сразу: питание, тело, кожа, мозг, риски и аптечка.
                  184 ген-точки, 2 часа персональной консультации,
                  экономия {formatPrice(fullPackage.compareAtPrice! - fullPackage.price)} по
                  сравнению с пошаговой сборкой.
                </p>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-4xl font-bold">{formatPrice(fullPackage.price)}</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(fullPackage.compareAtPrice!)}
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/products/full">
                    <Button size="lg">
                      Узнать подробнее
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {blocks.map((b) => (
                  <div key={b.slug} className="rounded-lg border bg-background p-3">
                    <div className="font-medium">{b.name.split(":")[0]}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.markersCount} ген-точек
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── 5 блоков по отдельности ──────────────────────────── */}
      <section className="mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            5 блоков ДНК-отчёта
          </h2>
          <p className="mt-3 text-muted-foreground">
            Это шаги одного пути к полному отчёту. Первый шаг — питание; дальше блоки
            открываются по очереди. Полный отчёт выгоднее любой пошаговой сборки.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b) => (
            <BlockCard
              key={b.slug}
              block={b}
              highlight={HIGHLIGHT_BY_SLUG[b.slug] ?? null}
            />
          ))}
          {/* Якорь «поэтапно» — не SKU, не кликается, нужен для психологии цены */}
          <Card className="flex h-full flex-col border-dashed bg-muted/30">
            <CardContent className="flex flex-1 flex-col justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">Поэтапно, по шагам</p>
              <p className="mt-2 text-3xl font-bold text-muted-foreground line-through">
                {formatPrice(anchorPrice)}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Если собирать отчёт пошагово, блок за блоком. В пакетах — выгоднее на{" "}
                {fullPackage ? formatPrice(anchorPrice - fullPackage.price) : "—"}.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Пакеты ───────────────────────────────────────────── */}
      <section className="mt-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Пакетные предложения</h2>
          <p className="mt-3 text-muted-foreground">
            Чем раньше берёте полный объём — тем выгоднее цена и точнее стратегия.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <PackageCard
              key={p.slug}
              pkg={p}
              blocksBySlug={blocksBySlug}
              emphasis={p.slug === "full-package"}
              ctaHref={p.slug === "full-package" ? "/products/full" : undefined}
            />
          ))}
        </div>
      </section>

      {/* ── Чем отличается отчёт Genesis ─────────────────────── */}
      <section className="mt-20">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Чем отличается отчёт Genesis
            </h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex gap-3">
                <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  <strong>Свежая научная база.</strong> Обновлённые интерпретации 2025–2026,
                  а не данные 10–15-летней давности.
                </p>
              </div>
              <div className="flex gap-3">
                <Microscope className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  <strong>Уже сдавали ДНК?</strong> Загрузите отчёт MyGenetics, Atlas или
                  23andMe — наша панель пересекается с ними лишь частично, остальное мы
                  прочитаем точнее и новее.
                </p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>
                  <strong>Отдельный слой безопасности.</strong> Beauty Safety + Аптечка
                  (фармакогенетика) отвечают на «что мне точно нельзя» — формула «не
                  навреди» зашита в продукт.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Часто задаваемые вопросы
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Дисклеймер ───────────────────────────────────────── */}
      <p className="mx-auto mt-16 max-w-3xl text-center text-xs text-muted-foreground">
        Genesis не является медицинской услугой и не ставит диагнозов. Программа
        относится к сфере ЗОЖ / натуропрактики. Генетические интерпретации служат для
        повышения осведомлённости и помощи специалисту, не заменяют консультацию врача.
      </p>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "С чего начинается отчёт?",
    a: "Первый шаг — блок «Стройность и питание» (15 900 ₽). Это вход в отчёт: с него открываются остальные блоки. Биоматериал читается один раз — за следующие блоки доплачиваете только интерпретацию. Блок «Риски + Аптечка» можно взять и отдельно.",
  },
  {
    q: "Что, если я уже сдавал ДНК?",
    a: "Загрузите свой отчёт в личный кабинет. Наша панель пересекается с MyGenetics, Atlas или 23andMe лишь частично — остальное мы прочитаем точнее и по обновлённой научной базе 2025–2026.",
  },
  {
    q: "Является ли ДНК-отчёт медицинским диагнозом?",
    a: "Нет. ДНК показывает врождённые особенности и предрасположенности. На их основе вы понимаете, что проверять по анализам, чего избегать и где быть осторожнее. Лечение и диагнозы — только у врача.",
  },
  {
    q: "Как происходит забор биоматериала?",
    a: "Буккальный эпителий — мазок изнутри щеки. Курьер привозит набор, вы делаете мазок дома, курьер забирает обратно в лабораторию. Без иголок, без поездок в клинику.",
  },
  {
    q: "Сколько действует отчёт?",
    a: "Гены не меняются — отчёт действует пожизненно. Со временем мы будем расширять интерпретации по новым научным данным, и они появятся у вас в личном кабинете автоматически.",
  },
];
