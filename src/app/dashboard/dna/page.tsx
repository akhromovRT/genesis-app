import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { dnaReports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadForm } from "@/components/dna/upload-form";
import { DeleteButton } from "@/components/dna/delete-button";
import { formatDate } from "@/lib/format";
import { Dna, Download, ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = { title: "ДНК-отчёты" };
export const dynamic = "force-dynamic";

export default async function DnaPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/dashboard/dna");

  const reports = await db.select()
    .from(dnaReports)
    .where(eq(dnaReports.userId, user.id))
    .orderBy(desc(dnaReports.createdAt));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ДНК-отчёты</h1>
          <p className="mt-1 text-muted-foreground">
            Загрузите PDF-отчёт CERBALAB для просмотра и поиска по маркерам
          </p>
        </div>
        <UploadForm />
      </div>

      {reports.length === 0 ? (
        <div className="mt-12 text-center">
          <Dna className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">Отчётов пока нет</p>
          <p className="mt-1 text-muted-foreground">
            Загрузите PDF-отчёт от CERBALAB, чтобы увидеть свои генетические маркеры
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-semibold">{r.patientName}</p>
                    <Badge variant="outline">{r.markersCount} маркеров</Badge>
                    <Badge variant="secondary" className="uppercase text-xs">{r.lab}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {r.sampleNumber && `№ ${r.sampleNumber} • `}
                    {r.resultDate || formatDate(r.createdAt ?? new Date())}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/api/dna/reports/${r.id}/file`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteButton reportId={r.id} />
                  <Link href={`/dashboard/dna/${r.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
