import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types/database";

export default async function AdminCategoriesPage() {
  const categoriesRaw = await db
    .select()
    .from(categories)
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
      <h1 className="text-2xl font-bold tracking-tight">Категории</h1>
      <p className="mt-1 text-muted-foreground">
        Управление категориями генетических тестов
      </p>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Порядок</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappedCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {cat.slug}
                </TableCell>
                <TableCell>{cat.sort_order}</TableCell>
                <TableCell>
                  <Badge variant={cat.is_active ? "default" : "outline"}>
                    {cat.is_active ? "Активна" : "Скрыта"}
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
