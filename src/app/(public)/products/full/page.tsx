import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveBlocks,
  getActivePackages,
  getPackageBySlug,
  formatPrice,
  calculateSavings,
  type ProductBlock,
} from "@/lib/products/blocks";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Gift, MessageSquare, ArrowRight, Dna } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Полный пакет «Красивое долголетие» — 225 ген-точек, 65 000 ₽ | Genesis",
  description:
    "Все 5 блоков ДНК-отчёта одной покупкой. 225 ген-точек, 2 ч консультации, экономия 24 900 ₽ vs поштучная сборка.",
};

export default async function FullPackagePage() {
  const fullPackage = await getPackageBySlug("full-package");
  if (!fullPackage) notFound();
  const [blocks, packages] = await Promise.all([getActiveBlocks(), getActivePackages()]);
  const savings = calculateSavings(fullPackage.price, fullPackage.compareAtPrice);

  const blocksBySlug = new Map<string, ProductBlock>(blocks.map((b) => [b.slug, b]));
  const includedBlocks = fullPackage.includedBlockSlugs
    .map((s) => blocksBySlug.get(s))
    .filter((b): b is ProductBlock => Boolean(b));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-primary">
          Все продукты
        </Link>
        <span className="mx-2">/</span>
        <span>Полный пакет</span>
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <Badge variant="default" className="mb-3">Главный продукт</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Полный отчёт «Красивое долголетие»
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Все 5 блоков сразу: питание, тело, кожа, мозг, риски и аптечка. 225
            ген-точек одной картой + 2 часа персональной консультации с экспертом.
          </p>
          <p className="mt-4 text-sm leading-relaxed">{fullPackage.fullDescription}</p>
        </div>

        <Card className="border-primary shadow-lg ring-1 ring-primary/30 lg:sticky lg:top-20">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Цена полного пакета</p>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-4xl font-bold">{formatPrice(fullPackage.price)}</span>
                {fullPackage.compareAtPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(fullPackage.compareAtPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="mt-1 text-sm font-medium text-primary">
                  Экономия {formatPrice(savings)} vs поштучно
                </p>
              )}
            </div>
            <AddToCartButton
              size="lg"
              className="w-full"
              test={{
                id: fullPackage.id,
                name: fullPackage.name,
                slug: fullPackage.slug,
                price: fullPackage.price,
                categoryName: "Красивое долголетие",
                markersCount: null,
              }}
            />
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Dna className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>225 генетических точек</span>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>2 часа персональной консультации</span>
              </div>
              <div className="flex items-start gap-2">
                <Gift className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Бессрочный доступ к обновлениям интерпретаций</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Что внутри ────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight">5 блоков внутри</h2>
        <p className="mt-2 text-muted-foreground">
          Каждый блок отвечает на отдельную группу женских вопросов о теле.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {includedBlocks.map((b) => (
            <Link
              key={b.slug}
              href={`/products/${b.slug}`}
              className="group block"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{b.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {b.painHeadline}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {b.markersCount} ген-точек
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Сравнение пакетов ────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight">Какой пакет выбрать</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-3 text-left font-medium">Пакет</th>
                <th className="py-3 text-right font-medium">Цена</th>
                <th className="py-3 text-right font-medium">Экономия</th>
                <th className="py-3 text-right font-medium">Что внутри</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => {
                const s = calculateSavings(p.price, p.compareAtPrice);
                return (
                  <tr key={p.slug} className="border-b">
                    <td className="py-3">{p.name}</td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(p.price)}
                    </td>
                    <td className="py-3 text-right text-primary">
                      {s > 0 ? formatPrice(s) : "—"}
                    </td>
                    <td className="py-3 text-right text-muted-foreground">
                      {p.includedBlockSlugs.length} блоков
                      {p.consultationHours > 0 ? ` + ${p.consultationHours} ч` : ""}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="py-3 text-muted-foreground">Поштучно (якорь)</td>
                <td className="py-3 text-right text-muted-foreground line-through">
                  {formatPrice(fullPackage.compareAtPrice ?? 0)}
                </td>
                <td className="py-3 text-right text-muted-foreground">—</td>
                <td className="py-3 text-right text-muted-foreground">5 блоков</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight">
          Готовы взять полный отчёт?
        </h2>
        <p className="mt-3 text-muted-foreground">
          После оплаты курьер привезёт набор для буккального мазка. Через 14–21 день —
          готовый отчёт в личном кабинете.
        </p>
        <div className="mt-6">
          <AddToCartButton
            size="lg"
            test={{
              id: fullPackage.id,
              name: fullPackage.name,
              slug: fullPackage.slug,
              price: fullPackage.price,
              categoryName: "Красивое долголетие",
              markersCount: null,
            }}
          />
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-xs text-muted-foreground">
          Не является медицинской услугой. Программа относится к сфере ЗОЖ/натуропрактики.
        </p>
      </section>
    </div>
  );
}
