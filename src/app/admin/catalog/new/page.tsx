export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { TestForm } from "@/components/admin/test-form";
import type { Category } from "@/types/database";

export default async function NewTestPage() {
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

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        Добавить тест
      </h1>
      <TestForm categories={mappedCategories} />
    </div>
  );
}
