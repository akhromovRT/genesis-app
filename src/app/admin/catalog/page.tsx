import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice, pluralize } from "@/lib/format";
import { Plus } from "lucide-react";
import type { TestWithCategory } from "@/types/database";

export default async function AdminCatalogPage() {
  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Каталог тестов</h1>
          <p className="mt-1 text-muted-foreground">
            {tests?.length || 0} тестов в каталоге
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
            {(tests as TestWithCategory[] | null)?.map((test) => (
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
