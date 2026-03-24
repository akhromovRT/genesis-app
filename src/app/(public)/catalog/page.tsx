import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  // Build tests query
  let testsQuery = supabase
    .from("tests")
    .select("*, categories(*)")
    .eq("is_active", true)
    .order("is_popular", { ascending: false })
    .order("price", { ascending: true });

  // Filter by category
  if (params.category) {
    const category = (categories as Category[] | null)?.find(
      (c) => c.slug === params.category
    );
    if (category) {
      testsQuery = testsQuery.eq("category_id", category.id);
    }
  }

  // Search by name
  if (params.q) {
    testsQuery = testsQuery.ilike("name", `%${params.q}%`);
  }

  const { data: tests } = await testsQuery;

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
          <CategoryFilter categories={(categories as Category[]) || []} />
        </Suspense>
      </div>

      {/* Results */}
      {tests && tests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(tests as TestWithCategory[]).map((test) => (
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
      {tests && tests.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Найдено тестов: {tests.length}
        </p>
      )}
    </div>
  );
}
