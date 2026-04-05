import Link from "next/link";
import { db } from "@/db";
import { dnaReports, profiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDnaPage() {
  const reports = await db.select({
    id: dnaReports.id,
    patientName: dnaReports.patientName,
    markersCount: dnaReports.markersCount,
    sampleNumber: dnaReports.sampleNumber,
    resultDate: dnaReports.resultDate,
    createdAt: dnaReports.createdAt,
    userEmail: profiles.email,
  })
    .from(dnaReports)
    .leftJoin(profiles, eq(dnaReports.userId, profiles.id))
    .orderBy(desc(dnaReports.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">ДНК-отчёты</h1>
      <p className="mt-1 text-muted-foreground">
        Все загруженные ДНК-отчёты пользователей
      </p>

      <div className="mt-8">
        {reports.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Отчётов пока нет</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пациент</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Маркеры</TableHead>
                <TableHead>№ образца</TableHead>
                <TableHead>Дата загрузки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/dna/${r.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.patientName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.userEmail || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.markersCount}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.sampleNumber || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(r.createdAt ?? new Date())}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
