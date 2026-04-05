import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { dnaReports, dnaMarkers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkersTable } from "@/components/dna/markers-table";
import { FullTextSearch } from "@/components/dna/full-text-search";
import { ArrowLeft, Download } from "lucide-react";

export const metadata: Metadata = { title: "Детали ДНК-отчёта" };
export const dynamic = "force-dynamic";

export default async function DnaReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const [report] = await db.select().from(dnaReports).where(eq(dnaReports.id, id)).limit(1);
  if (!report) notFound();
  if (report.userId !== user.id && user.role !== "admin") notFound();

  const markers = await db.select().from(dnaMarkers)
    .where(eq(dnaMarkers.reportId, id))
    .orderBy(asc(dnaMarkers.position));

  return (
    <div>
      <Link
        href="/dashboard/dna"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Все отчёты
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.patientName}</h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{report.markersCount} маркеров</Badge>
            <Badge variant="secondary" className="uppercase text-xs">{report.lab}</Badge>
          </div>
        </div>
        <Link href={`/api/dna/reports/${report.id}/file`} target="_blank">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Скачать PDF
          </Button>
        </Link>
      </div>

      {/* Patient info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Информация о пациенте и образце</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {report.birthDate && (
              <div>
                <dt className="text-muted-foreground">Дата рождения</dt>
                <dd className="font-medium">{report.birthDate}</dd>
              </div>
            )}
            {report.sex && (
              <div>
                <dt className="text-muted-foreground">Пол</dt>
                <dd className="font-medium">{report.sex}</dd>
              </div>
            )}
            {report.sampleType && (
              <div>
                <dt className="text-muted-foreground">Биоматериал</dt>
                <dd className="font-medium">{report.sampleType}</dd>
              </div>
            )}
            {report.sampleNumber && (
              <div>
                <dt className="text-muted-foreground">№ образца</dt>
                <dd className="font-medium font-mono">{report.sampleNumber}</dd>
              </div>
            )}
            {report.sampleDate && (
              <div>
                <dt className="text-muted-foreground">Дата поступления</dt>
                <dd className="font-medium">{report.sampleDate}</dd>
              </div>
            )}
            {report.resultDate && (
              <div>
                <dt className="text-muted-foreground">Дата результата</dt>
                <dd className="font-medium">{report.resultDate}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Markers table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Маркеры</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkersTable markers={markers} />
        </CardContent>
      </Card>

      {/* Full text search */}
      {report.fullText && (
        <Card>
          <CardHeader>
            <CardTitle>Полный текст отчёта</CardTitle>
          </CardHeader>
          <CardContent>
            <FullTextSearch text={report.fullText} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
