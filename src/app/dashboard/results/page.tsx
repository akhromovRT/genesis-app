import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { FileText, Download, Inbox } from "lucide-react";
import type { TestResult } from "@/types/database";

export const metadata: Metadata = {
  title: "Мои результаты",
};

export default async function ResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard/results");

  const { data: results } = await supabase
    .from("test_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Мои результаты</h1>
      <p className="mt-1 text-muted-foreground">
        Результаты ваших генетических тестов
      </p>

      {results && results.length > 0 ? (
        <div className="mt-8 space-y-4">
          {(results as TestResult[]).map((result) => (
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
