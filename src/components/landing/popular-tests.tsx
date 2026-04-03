import Link from "next/link";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { TestCard } from "@/components/catalog/test-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { TestWithCategory } from "@/types/database";

export const dynamic = "force-dynamic";

export async function PopularTests() {
  const rows = await db.select().from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .where(and(eq(tests.isPopular, true), eq(tests.isActive, true)))
    .orderBy(asc(tests.price))
    .limit(4);

  const mapped: TestWithCategory[] = rows.map((r) => ({
    id: r.tests.id, category_id: r.tests.categoryId, name: r.tests.name,
    slug: r.tests.slug, code: r.tests.code ?? "", price: r.tests.price,
    description: r.tests.description ?? "", full_description: r.tests.fullDescription ?? "",
    markers_count: r.tests.markersCount, turnaround_days: r.tests.turnaroundDays,
    biomaterial: r.tests.biomaterial ?? "", is_active: r.tests.isActive ?? true,
    is_popular: r.tests.isPopular ?? false, image_url: r.tests.imageUrl,
    meta_title: r.tests.metaTitle, meta_description: r.tests.metaDescription,
    created_at: r.tests.createdAt?.toISOString() ?? "",
    updated_at: r.tests.updatedAt?.toISOString() ?? "",
    categories: {
      id: r.categories?.id ?? "", name: r.categories?.name ?? "",
      slug: r.categories?.slug ?? "", description: r.categories?.description ?? "",
      sort_order: r.categories?.sortOrder ?? 0, is_active: r.categories?.isActive ?? true,
      image_url: r.categories?.imageUrl ?? null,
      created_at: r.categories?.createdAt?.toISOString() ?? "",
      updated_at: r.categories?.updatedAt?.toISOString() ?? "",
    },
  }));

  if (mapped.length === 0) return null;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Популярные тесты
        </h2>
        <p className="mt-3 text-center text-muted-foreground">
          С них начинают чаще всего
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mapped.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/catalog">
            <Button variant="outline" size="lg">
              Смотреть все тесты
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
