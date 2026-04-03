export const dynamic = 'force-dynamic';

import { db } from "@/db";
import { testResults } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { FileText } from "lucide-react";
import type { TestResult } from "@/types/database";

export default async function AdminResultsPage() {
  const resultsRaw = await db
    .select()
    .from(testResults)
    .orderBy(desc(testResults.createdAt));

  const results: TestResult[] = resultsRaw.map((r) => ({
    id: r.id,
    order_id: r.orderId,
    order_item_id: r.orderItemId ?? null,
    user_id: r.userId,
    file_url: r.fileUrl,
    file_name: r.fileName,
    file_size: r.fileSize ?? null,
    description: r.description ?? "",
    uploaded_by: r.uploadedBy ?? null,
    created_at: r.createdAt?.toISOString() ?? "",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Результаты тестов</h1>
      <p className="mt-1 text-muted-foreground">
        Все загруженные результаты. Загрузка — на странице заказа.
      </p>

      <div className="mt-8">
        {results.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Файл</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Дата загрузки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
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
