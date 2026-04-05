import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnaReports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await db.select({
    id: dnaReports.id,
    patientName: dnaReports.patientName,
    sampleNumber: dnaReports.sampleNumber,
    resultDate: dnaReports.resultDate,
    markersCount: dnaReports.markersCount,
    fileName: dnaReports.fileName,
    fileSize: dnaReports.fileSize,
    createdAt: dnaReports.createdAt,
  })
    .from(dnaReports)
    .where(eq(dnaReports.userId, user.id))
    .orderBy(desc(dnaReports.createdAt));

  return NextResponse.json({ reports });
}
