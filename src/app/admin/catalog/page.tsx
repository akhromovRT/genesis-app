import Link from "next/link";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, pluralize } from "@/lib/format";
import { Plus } from "lucide-react";
import type { TestWithCategory } from "@/types/database";

export default async function AdminCatalogPage() {
  const testsRaw = await db
    .select()
    .from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .orderBy(desc(tests.createdAt));

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
      : { id: "", name: "", slug: "", description: "", sort_order: 0, is_active: false, image_url: null, created_at: "", updated_at: "" },
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Каталог тестов</h1>
          <p className="mt-1 text-muted-foreground">
            {mappedTests.length} тестов в каталоге
          </p>
        </div>
        <Link href="/admin/catalog/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Добавить тест
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Код</TableHead>
              <TableHead>Маркеры</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappedTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>
                  <Link
                    href={`/admin/catalog/${test.id}/edit`}
                    className="font-medium text-primary hover:underline"
                  >
                    {test.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {test.categories?.name}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {test.code}
                </TableCell>
                <TableCell>
                  {test.markers_count
                    ? pluralize(test.markers_count, "маркер", "маркера", "маркеров")
                    : "—"}
                </TableCell>
                <TableCell className="font-medium">
                  {formatPrice(test.price)}
                </TableCell>
                <TableCell>
                  <Badge variant={test.is_active ? "default" : "outline"}>
                    {test.is_active ? "Активен" : "Скрыт"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
