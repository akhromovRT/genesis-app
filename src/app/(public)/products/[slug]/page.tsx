import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getActiveBlocks,
  getActivePackages,
  getBlockBySlug,
  formatPrice,
  calculateSavings,
} from "@/lib/products/blocks";
import { SubblockAccordion } from "@/components/products/subblock-accordion";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dna, MessageSquare, Sparkles } from "lucide-react";
import { pluralize } from "@/lib/format";
import { BLOCKS_SNP } from "@/lib/genetics/blocks-snp";

export const dynamic = "force-dynamic";

const BLOCK_SLUGS = ["nutrition", "body", "beauty-safety", "mind", "risks"] as const;

export function generateStaticParams() {
  return BLOCK_SLUGS.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const block = await getBlockBySlug(slug);
  if (!block) return { title: "Блок не найден | Genesis" };
  return {
    title: block.metaTitle ?? `${block.name} | Genesis`,
    description: block.metaDescription ?? block.description,
  };
}

export default async function BlockPage({ params }: PageProps) {
  const { slug } = await params;
  const block = await getBlockBySlug(slug);
  if (!block) notFound();

  const packages = await getActivePackages();
  const fullPackage = packages.find((p) => p.slug === "full-package");
  const savingsVsAnchor = fullPackage
    ? calculateSavings(fullPackage.price, fullPackage.compareAtPrice)
    : 0;

  // Список ген-точек из источника истины blocks-snp.ts (для всех 5 блоков).
  const snpBlock = BLOCKS_SNP.find((b) => b.slug === slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Crumbs */}
      <div className="mb-6 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-primary">
          Все продукты
        </Link>
        <span className="mx-2">/</span>
        <span>{block.name}</span>
      </div>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <Badge variant="outline" className="mb-3">
            Блок ДНК-отчёта «Красивое долголетие»
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {block.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{block.painHeadline}</p>
          <p className="mt-4 text-sm leading-relaxed">{block.fullDescription}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {block.markersCount && (
              <span className="flex items-center gap-1.5">
                <Dna className="h-4 w-4" />
                {pluralize(block.markersCount, "ген-точка", "ген-точки", "ген-точек")}
              </span>
            )}
            {block.consultationHours > 0 && (
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {block.consultationHours} ч консультации
              </span>
            )}
          </div>
        </div>

        <Card className="lg:sticky lg:top-20">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Цена блока</p>
              <p className="text-3xl font-bold">{formatPrice(block.price)}</p>
            </div>
            <AddToCartButton
              size="lg"
              className="w-full"
              test={{
                id: block.id,
                name: block.name,
                slug: block.slug,
                price: block.price,
                categoryName: "Красивое долголетие",
                markersCount: block.markersCount,
                productType: "block",
              }}
            />
            {fullPackage && savingsVsAnchor > 0 && (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium">Выгоднее — полный пакет</p>
                    <p className="mt-1 text-muted-foreground">
                      Все 5 блоков + 2 ч консультации за{" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(fullPackage.price)}
                      </span>
                      . Экономия {formatPrice(savingsVsAnchor)}.
                    </p>
                  </div>
                </div>
                <Link href="/products/full">
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Узнать про полный пакет
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Подблоки по болям ─────────────────────────────────── */}
      {block.subblocks.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">Что внутри</h2>
          <p className="mt-2 text-muted-foreground">
            Группы вопросов, на которые отвечает этот блок.
          </p>
          <Card className="mt-6">
            <CardContent className="p-6">
              <SubblockAccordion subblocks={block.subblocks} />
            </CardContent>
          </Card>
        </section>
      )}

      {/* ── Ген-точки (SNP) ───────────────────────────────────── */}
      {snpBlock && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight">
            Ген-точки, которые читает этот блок
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Считаем именно ген-точки (SNP), а не гены: у одного гена может быть несколько
            значимых точек.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {snpBlock.snps.map((s) => (
              <span
                key={`${s.gene}:${s.rs}`}
                className="rounded-md border bg-muted/40 px-2 py-1 text-xs"
              >
                {s.gene}{" "}
                <span className="text-muted-foreground">{s.rs}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Дисклеймер ───────────────────────────────────────── */}
      <p className="mt-16 text-center text-xs text-muted-foreground">
        Не является медицинской услугой. Программа относится к сфере ЗОЖ/натуропрактики.
      </p>
    </div>
  );
}
