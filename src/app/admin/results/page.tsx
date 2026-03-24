import { createClient } from "@/lib/supabase/server";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { FileText } from "lucide-react";
import type { TestResult } from "@/types/database";

export default async function AdminResultsPage() {
  const supabase = await createClient();
  const { data: results } = await supabase
    .from("test_results")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Результаты тестов</h1>
      <p className="mt-1 text-muted-foreground">
        Все загруженные результаты. Загрузка — на странице заказа.
      </p>

      <div className="mt-8">
        {results && results.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Файл</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Дата загрузки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(results as TestResult[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {r.file_name}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.description || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            Результатов пока нет
          </p>
        )}
      </div>
    </div>
  );
}
