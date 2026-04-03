export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { formatPrice, pluralize } from "@/lib/format";
import { Clock, Dna, FlaskConical, ArrowLeft } from "lucide-react";
import type { Category, TestWithCategory } from "@/types/database";

interface TestPageProps {
  params: Promise<{ slug: string }>;
}

async function getTest(slug: string): Promise<TestWithCategory | null> {
  const [row] = await db
    .select()
    .from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .where(and(eq(tests.slug, slug), eq(tests.isActive, true)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.tests.id,
    category_id: row.tests.categoryId,
    name: row.tests.name,
    slug: row.tests.slug,
    code: row.tests.code ?? "",
    price: row.tests.price,
    description: row.tests.description ?? "",
    full_description: row.tests.fullDescription ?? "",
    markers_count: row.tests.markersCount ?? null,
    turnaround_days: row.tests.turnaroundDays ?? null,
    biomaterial: row.tests.biomaterial ?? "",
    is_active: row.tests.isActive ?? true,
    is_popular: row.tests.isPopular ?? false,
    image_url: row.tests.imageUrl ?? null,
    meta_title: row.tests.metaTitle ?? null,
    meta_description: row.tests.metaDescription ?? null,
    created_at: row.tests.createdAt?.toISOString() ?? "",
    updated_at: row.tests.updatedAt?.toISOString() ?? "",
    categories: row.categories
      ? {
          id: row.categories.id,
          name: row.categories.name,
          slug: row.categories.slug,
          description: row.categories.description ?? "",
          sort_order: row.categories.sortOrder ?? 0,
          is_active: row.categories.isActive ?? true,
          image_url: row.categories.imageUrl ?? null,
          created_at: row.categories.createdAt?.toISOString() ?? "",
          updated_at: row.categories.updatedAt?.toISOString() ?? "",
        }
      : ({} as Category),
  };
}

export async function generateMetadata({
  params,
}: TestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) return { title: "Тест не найден" };

  return {
    title: test.meta_title || test.name,
    description:
      test.meta_description ||
      test.description ||
      `Генетический тест «${test.name}» — ${formatPrice(test.price)}. ${test.markers_count ? pluralize(test.markers_count, "маркер", "маркера", "маркеров") + "." : ""} Результат через ${test.turnaround_days || 14} дней.`,
  };
}

export default async function TestPage({ params }: TestPageProps) {
  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/catalog"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Назад к каталогу
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Badge variant="outline" className="mb-3">
            {test.categories.name}
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {test.name}
          </h1>
          {test.code && (
            <p className="mt-1 text-sm text-muted-foreground">
              Код: {test.code}
            </p>
          )}

          <Separator className="my-6" />

          {/* Description */}
          <div className="space-y-4 text-muted-foreground">
            <p>{test.description}</p>
            {test.full_description && (
              <p className="whitespace-pre-line">{test.full_description}</p>
            )}
          </div>

          {/* Details */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {test.markers_count && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Dna className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{test.markers_count}</p>
                    <p className="text-xs text-muted-foreground">
                      {pluralize(
                        test.markers_count,
                        "генетический маркер",
                        "генетических маркера",
                        "генетических маркеров"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {test.turnaround_days && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{test.turnaround_days}</p>
                    <p className="text-xs text-muted-foreground">
                      {pluralize(
                        test.turnaround_days,
                        "рабочий день",
                        "рабочих дня",
                        "рабочих дней"
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {test.biomaterial && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <FlaskConical className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Биоматериал</p>
                    <p className="text-xs text-muted-foreground">
                      {test.biomaterial}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar — order card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="space-y-4 p-6">
              <div>
                <p className="text-3xl font-bold">{formatPrice(test.price)}</p>
                {test.is_popular && (
                  <Badge variant="secondary" className="mt-2">
                    Популярное
                  </Badge>
                )}
              </div>

              <Separator />

              <AddToCartButton
                className="w-full"
                size="lg"
                test={{
                  id: test.id,
                  name: test.name,
                  slug: test.slug,
                  price: test.price,
                  categoryName: test.categories.name,
                  markersCount: test.markers_count,
                }}
              />

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Оплата онлайн банковской картой</p>
                <p>Забор биоматериала в лаборатории или на дому</p>
                <p>Результат в личном кабинете</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
