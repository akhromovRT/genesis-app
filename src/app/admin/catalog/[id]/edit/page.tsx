import { notFound } from "next/navigation";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { TestForm } from "@/components/admin/test-form";
import type { Category, Test } from "@/types/database";

interface EditTestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestPage({ params }: EditTestPageProps) {
  const { id } = await params;

  const [testRaw] = await db
    .select()
    .from(tests)
    .where(eq(tests.id, id))
    .limit(1);

  if (!testRaw) notFound();

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

  const mappedTest: Test = {
    id: testRaw.id,
    category_id: testRaw.categoryId,
    name: testRaw.name,
    slug: testRaw.slug,
    code: testRaw.code ?? "",
    price: testRaw.price,
    description: testRaw.description ?? "",
    full_description: testRaw.fullDescription ?? "",
    markers_count: testRaw.markersCount ?? null,
    turnaround_days: testRaw.turnaroundDays ?? null,
    biomaterial: testRaw.biomaterial ?? "",
    is_active: testRaw.isActive ?? true,
    is_popular: testRaw.isPopular ?? false,
    image_url: testRaw.imageUrl ?? null,
    meta_title: testRaw.metaTitle ?? null,
    meta_description: testRaw.metaDescription ?? null,
    created_at: testRaw.createdAt?.toISOString() ?? "",
    updated_at: testRaw.updatedAt?.toISOString() ?? "",
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        Редактировать тест
      </h1>
      <TestForm
        categories={mappedCategories}
        initialData={mappedTest}
      />
    </div>
  );
}
