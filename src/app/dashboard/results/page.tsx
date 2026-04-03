import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { testResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { FileText, Download, Inbox } from "lucide-react";
import type { TestResult } from "@/types/database";

export const metadata: Metadata = {
  title: "Мои результаты",
};

export default async function ResultsPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/dashboard/results");

  const resultsRaw = await db
    .select()
    .from(testResults)
    .where(eq(testResults.userId, user.id))
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
      <h1 className="text-2xl font-bold tracking-tight">Мои результаты</h1>
      <p className="mt-1 text-muted-foreground">
        Результаты ваших генетических тестов
      </p>

      {results.length > 0 ? (
        <div className="mt-8 space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{result.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(result.created_at)}
                    {result.description && ` — ${result.description}`}
                  </p>
                </div>
                <a
                  href={result.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="mr-1.5 h-4 w-4" />
                    Скачать
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Результатов пока нет</p>
          <p className="mt-1 text-muted-foreground">
            Результаты появятся здесь после выполнения заказанных тестов
          </p>
        </div>
      )}
    </div>
  );
}
