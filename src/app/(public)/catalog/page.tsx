import type { Metadata } from "next";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, and, ilike, asc, desc } from "drizzle-orm";
import { TestCard } from "@/components/catalog/test-card";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { SearchBar } from "@/components/catalog/search-bar";
import type { Category, TestWithCategory } from "@/types/database";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Каталог генетических тестов",
  description:
    "Более 80 генетических тестов: спортивная генетика, онкология, фармакогенетика, питание и красота. Цены от 1 300 ₽.",
};

interface CatalogPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Fetch categories
  const categoriesRaw = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));

  const mappedCategories: Category[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    sort_order: c.sortOrder ?? 0,
    is_active: c.isActive ?? true,
    image_url: c.imageUrl ?? null,
    created_at: c.createdAt?.toISOString() ?? "",
    updated_at: c.updatedAt?.toISOString() ?? "",
  }));

  // Build conditions for tests query
  const conditions = [eq(tests.isActive, true)];

  if (params.category) {
    const category = mappedCategories.find((c) => c.slug === params.category);
    if (category) {
      conditions.push(eq(tests.categoryId, category.id));
    }
  }

  if (params.q) {
    conditions.push(ilike(tests.name, `%${params.q}%`));
  }

  const testsRaw = await db
    .select()
    .from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(tests.isPopular), asc(tests.price));

  const mappedTests: TestWithCategory[] = testsRaw.map((row) => ({
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
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Каталог генетических тестов
        </h1>
        <p className="mt-2 text-muted-foreground">
          Более 80 исследований от лаборатории CERBALAB. Результат через 14–30
          рабочих дней.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={mappedCategories} />
        </Suspense>
      </div>

      {/* Results */}
      {mappedTests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mappedTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {params.q || params.category
              ? "Тестов по вашему запросу не найдено"
              : "Каталог тестов загружается..."}
          </p>
        </div>
      )}

      {/* Count */}
      {mappedTests.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Найдено тестов: {mappedTests.length}
        </p>
      )}
    </div>
  );
}
